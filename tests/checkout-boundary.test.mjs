import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const checkout=await readFile(new URL('../supabase/functions/checkout-book/index.ts',import.meta.url),'utf8');
const renderer=await readFile(new URL('../supabase/functions/render-book/index.ts',import.meta.url),'utf8');
const migration=await readFile(new URL('../supabase/migrations/20260903075239_finalize_book_checkout_v1.sql',import.meta.url),'utf8');

test('browser confirms checkout without invoking AI rendering',()=>{
  const completion=html.match(/window\.completeDtCheckout=async function\(\)[\s\S]*?window\.startNewBook/)?.[0]||'';
  assert.match(completion,/functions\.invoke\("checkout-book"/);
  assert.doesNotMatch(completion,/render-book|dtGenerateFinalRender|dtMarkReady/);
  assert.match(completion,/renderDtBookStatus/);
});

test('checkout freezes story versions, content, cast and private reference paths',()=>{
  assert.match(checkout,/schema_version:"checkout-book-v1"/);
  assert.match(checkout,/story_version_id:story\.story_version_id/);
  assert.match(checkout,/content:story\.content_snapshot/);
  assert.match(checkout,/path_choices:story\.path_choices/);
  assert.match(checkout,/identity_prompt:character\.identity_prompt/);
  assert.match(checkout,/storage_path:reference\.storage_path/);
});

test('checkout transition is atomic and service-role only',()=>{
  assert.match(migration,/for update/);
  assert.match(migration,/insert into public\.book_renders/);
  assert.match(migration,/status = 'snapshotted'/);
  assert.match(migration,/set status = 'paid'/);
  assert.match(migration,/revoke all on function[\s\S]*from public, anon, authenticated/);
  assert.match(migration,/grant execute on function[\s\S]*to service_role/);
});

test('confirmed books are immutable to browser clients',()=>{
  assert.match(migration,/using \(profile_id = \(select auth\.uid\(\)\) and status = 'draft'\)/);
  assert.match(migration,/books_delete_own[\s\S]*status = 'draft'/);
});

test('renderer requires checkout and stays idle while queued',()=>{
  assert.match(renderer,/if\(!job\) throw new Error\("CHECKOUT_REQUIRED"\)/);
  assert.match(renderer,/job\.status==="queued"&&!start/);
  assert.match(renderer,/contextsFromCheckoutSnapshot\(job\.book_snapshot\)/);
  assert.doesNotMatch(renderer,/book_snapshot:ctx\.snapshot/);
});

test('status page supports refresh and starting another book',()=>{
  assert.match(html,/window\.renderDtBookStatus=async function/);
  assert.match(html,/dtLoadRenderStatus/);
  assert.match(html,/Crea un altro libro/);
  assert.match(html,/La generazione IA è volutamente sospesa/);
  assert.match(html,/\["draft","ready_for_checkout","paid","generating","ready","failed"\]/);
});
