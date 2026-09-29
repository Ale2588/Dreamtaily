import Stripe from "npm:stripe@22.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_PDF_PRICE_ID = Deno.env.get("STRIPE_PDF_PRICE_ID")!;
const PUBLIC_SITE_URL = (Deno.env.get("PUBLIC_SITE_URL") || "").replace(/\/$/, "");

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const stripe = new Stripe(STRIPE_SECRET_KEY);

function reply(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

async function authenticate(req: Request) {
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "").trim();
  if (!token) throw new Error("AUTH_REQUIRED");
  const client = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw new Error("AUTH_INVALID");
  return data.user;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply(405, { error: "METHOD_NOT_ALLOWED" });
  try {
    if (!STRIPE_SECRET_KEY || !STRIPE_PDF_PRICE_ID || !PUBLIC_SITE_URL) throw new Error("STRIPE_CONFIG_MISSING");
    const user = await authenticate(req);
    if (user.is_anonymous || !user.email) return reply(403, { error: "PERMANENT_ACCOUNT_REQUIRED" });
    const { book_id: bookId } = await req.json().catch(() => ({}));
    if (!bookId) return reply(400, { error: "BOOK_ID_REQUIRED" });

    const { data: book, error: bookError } = await service.from("books")
      .select("id,status").eq("id", bookId).eq("profile_id", user.id).maybeSingle();
    if (bookError) throw bookError;
    if (!book) return reply(404, { error: "BOOK_NOT_FOUND" });
    if (book.status !== "draft") return reply(409, { error: "BOOK_NOT_EDITABLE" });

    const { data: stories, error: storiesError } = await service.from("book_stories")
      .select("id,status,content_snapshot").eq("book_id", bookId);
    if (storiesError) throw storiesError;
    if (!stories?.length || stories.some((story) => story.status !== "ready" || !story.content_snapshot)) {
      return reply(409, { error: "BOOK_STORIES_INCOMPLETE" });
    }

    const { data: existing } = await service.from("stripe_pdf_checkouts")
      .select("stripe_session_id,checkout_url,expires_at").eq("book_id", bookId).eq("user_id", user.id)
      .eq("status", "open").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (existing?.checkout_url && (!existing.expires_at || new Date(existing.expires_at) > new Date())) {
      return reply(200, { checkout_url: existing.checkout_url, session_id: existing.stripe_session_id, reused: true });
    }
    if (existing?.stripe_session_id) {
      await service.from("stripe_pdf_checkouts").update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("stripe_session_id", existing.stripe_session_id);
    }

    const successUrl = `${PUBLIC_SITE_URL}/?stripe=success&book_id=${encodeURIComponent(String(bookId))}&session_id={CHECKOUT_SESSION_ID}`;
    const cancel = new URL(PUBLIC_SITE_URL);
    cancel.searchParams.set("stripe", "cancelled");
    cancel.searchParams.set("book_id", String(bookId));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: STRIPE_PDF_PRICE_ID, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: String(bookId),
      metadata: { kind: "dreamtaily_pdf", user_id: user.id, book_id: String(bookId), price_id: STRIPE_PDF_PRICE_ID },
      success_url: successUrl,
      cancel_url: cancel.toString(),
    });
    if (!session.url) throw new Error("STRIPE_CHECKOUT_URL_MISSING");

    const { error: insertError } = await service.from("stripe_pdf_checkouts").insert({
      stripe_session_id: session.id, user_id: user.id, book_id: bookId,
      price_id: STRIPE_PDF_PRICE_ID, checkout_url: session.url,
      expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    });
    if (insertError) throw insertError;
    return reply(201, { checkout_url: session.url, session_id: session.id });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.error("create-stripe-checkout", detail);
    return reply(detail.startsWith("AUTH_") ? 401 : 500, { error: detail });
  }
});
