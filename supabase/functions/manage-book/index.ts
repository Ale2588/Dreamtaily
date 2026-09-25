import { createClient } from "npm:@supabase/supabase-js@2";

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
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

async function currentUser(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const auth = createClient(SUPABASE_URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  return error ? null : data.user;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "METHOD_NOT_ALLOWED" });
  try {
    const user = await currentUser(req);
    if (!user) return reply(401, { error: "AUTH_REQUIRED" });
    const body = await req.json().catch(() => ({}));
    const bookId = String(body.book_id || "");
    const action = body.action === "archive" ? "archive" : body.action === "restore" ? "restore" : null;
    if (!/^[0-9a-f-]{36}$/i.test(bookId) || !action) return reply(400, { error: "REQUEST_INVALID" });

    const { data: book, error: readError } = await svc.from("books")
      .select("id,profile_id,status,archived_at")
      .eq("id", bookId).eq("profile_id", user.id).maybeSingle();
    if (readError) throw readError;
    if (!book) return reply(404, { error: "BOOK_NOT_FOUND" });
    if (action === "archive" && book.status === "draft") return reply(409, { error: "DRAFT_DELETE_REQUIRED" });

    const archivedAt = action === "archive" ? new Date().toISOString() : null;
    const { data, error } = await svc.from("books")
      .update({ archived_at: archivedAt })
      .eq("id", book.id).eq("profile_id", user.id)
      .select("id,status,archived_at,updated_at").single();
    if (error) throw error;
    return reply(200, { book: data });
  } catch (error) {
    console.error("manage-book", error);
    return reply(500, { error: "BOOK_MANAGEMENT_FAILED" });
  }
});
