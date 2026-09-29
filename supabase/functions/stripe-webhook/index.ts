import Stripe from "npm:stripe@22.0.0";
import { createClient } from "npm:@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const service = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  try {
    const signature = req.headers.get("Stripe-Signature");
    if (!signature) return new Response("Missing signature", { status: 400 });
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body, signature, Deno.env.get("STRIPE_WEBHOOK_SIGNING_SECRET")!, undefined, cryptoProvider,
    );
    if (event.type !== "checkout.session.completed") return new Response("ok", { status: 200 });

    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};
    if (session.mode !== "payment" || session.payment_status !== "paid" || metadata.kind !== "dreamtaily_pdf") {
      throw new Error("STRIPE_SESSION_NOT_PAID_PDF");
    }
    if (!metadata.user_id || !metadata.book_id || !metadata.price_id) throw new Error("STRIPE_METADATA_MISSING");

    const { error } = await service.rpc("complete_stripe_pdf_checkout", {
      p_stripe_session_id: session.id,
      p_stripe_event_id: event.id,
      p_user_id: metadata.user_id,
      p_book_id: metadata.book_id,
      p_price_id: metadata.price_id,
      p_amount_total: session.amount_total || 0,
      p_currency: session.currency || "eur",
    });
    if (error) throw error;
    return new Response("ok", { status: 200 });
  } catch (error) {
    console.error("stripe-webhook", error instanceof Error ? error.message : String(error));
    return new Response("Webhook error", { status: 400 });
  }
});

