import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');

test('PDF checkout is hosted by Stripe and the Facebook beta entry point is hidden', async () => {
  const html = await read('index.html');
  assert.match(html, /create-stripe-checkout/);
  assert.match(html, /Acquista il PDF · €9,90/);
  assert.doesNotMatch(html, /startDtOAuth\('facebook'\)/);
  assert.doesNotMatch(html, /Checkout dimostrativo/);
});

test('the webhook verifies Stripe signature and grants through a service-only RPC', async () => {
  const webhook = await read('supabase/functions/stripe-webhook/index.ts');
  const config = await read('supabase/config.toml');
  const migration = await read('supabase/migrations/20260929103000_add_stripe_pdf_checkout.sql');
  assert.match(webhook, /constructEventAsync/);
  assert.match(webhook, /payment_status !== "paid"/);
  assert.match(webhook, /complete_stripe_pdf_checkout/);
  assert.match(config, /\[functions\.stripe-webhook\][\s\S]*verify_jwt = false/);
  assert.match(migration, /grant execute on function public\.complete_stripe_pdf_checkout[\s\S]*to service_role/);
  assert.match(migration, /stripe_session_id text not null unique/);
});

test('the Stripe price is server configuration and secrets are not committed', async () => {
  const checkout = await read('supabase/functions/create-stripe-checkout/index.ts');
  const all = [checkout, await read('supabase/functions/stripe-webhook/index.ts')].join('\n');
  assert.match(checkout, /Deno\.env\.get\("STRIPE_PDF_PRICE_ID"\)/);
  assert.match(checkout, /Deno\.env\.get\("STRIPE_SECRET_KEY"\)/);
  assert.doesNotMatch(all, /sk_(test|live)_/);
  assert.doesNotMatch(all, /whsec_[A-Za-z0-9]/);
});
