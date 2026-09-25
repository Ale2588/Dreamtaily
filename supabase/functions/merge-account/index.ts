import { createClient, type User } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const svc = createClient(SUPABASE_URL, SERVICE, { auth: { persistSession: false, autoRefreshToken: false } });
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization,apikey,content-type,x-client-info",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
};

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

async function authenticate(req: Request): Promise<User | null> {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const client = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  return error ? null : data.user;
}

function randomClaimToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function errorCode(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.match(/MERGE_[A-Z_]+/)?.[0] || "ACCOUNT_MERGE_FAILED";
}

Deno.serve(async req => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "METHOD_NOT_ALLOWED" });
  try {
    const user = await authenticate(req);
    if (!user) return reply(401, { error: "AUTH_REQUIRED" });
    const body = await req.json().catch(() => ({}));

    if (body.action === "prepare") {
      if (!user.is_anonymous) return reply(409, { error: "MERGE_SOURCE_NOT_ANONYMOUS" });
      const claimToken = randomClaimToken();
      const tokenHash = await sha256(claimToken);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      const { error } = await svc.rpc("prepare_account_merge_v1", {
        p_source_user_id: user.id,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      });
      if (error) throw error;
      return reply(201, { claim_token: claimToken, expires_at: expiresAt });
    }

    if (body.action === "finalize") {
      if (user.is_anonymous || !user.email) return reply(409, { error: "MERGE_TARGET_NOT_PERMANENT" });
      const claimToken = String(body.claim_token || "");
      if (!/^[A-Za-z0-9_-]{40,64}$/.test(claimToken)) return reply(400, { error: "MERGE_CLAIM_INVALID" });
      const { data, error } = await svc.rpc("finalize_account_merge_v1", {
        p_token_hash: await sha256(claimToken),
        p_target_user_id: user.id,
      });
      if (error) throw error;

      const sourceUserId = String(data?.source_user_id || "");
      if (sourceUserId) {
        const { error: deleteError } = await svc.auth.admin.deleteUser(sourceUserId);
        if (deleteError) {
          console.error("merge-account cleanup", deleteError);
          return reply(202, { status: "merged", cleanup_pending: true, result: {
            characters_moved: data.characters_moved,
            books_moved: data.books_moved,
            story_projects_moved: data.story_projects_moved,
            source_draft_archived: data.source_draft_archived,
          }});
        }
      }
      return reply(200, { status: "merged", cleanup_pending: false, result: {
        characters_moved: data.characters_moved,
        books_moved: data.books_moved,
        story_projects_moved: data.story_projects_moved,
        source_draft_archived: data.source_draft_archived,
      }});
    }

    return reply(400, { error: "MERGE_ACTION_INVALID" });
  } catch (error) {
    const code = errorCode(error);
    const status = /EXPIRED|INACTIVE|CONFLICT|MISMATCH/.test(code) ? 409 :
      code === "MERGE_CLAIM_NOT_FOUND" ? 404 : 500;
    console.error("merge-account", code, error);
    return reply(status, { error: code });
  }
});

