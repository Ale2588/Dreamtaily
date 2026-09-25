import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const checkout=await readFile(new URL('../supabase/functions/checkout-book/index.ts',import.meta.url),'utf8');
const renderer=await readFile(new URL('../supabase/functions/render-book/index.ts',import.meta.url),'utf8');
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const migration=await readFile(new URL('../supabase/migrations/20260925080000_add_book_entitlements.sql',import.meta.url),'utf8');

test('anonymous users are rejected by checkout and rendering with an explicit code',()=>{
  assert.match(checkout,/user\.is_anonymous===true[\s\S]*AUTH_ANONYMOUS/);
  assert.match(renderer,/user\.is_anonymous===true[\s\S]*AUTH_ANONYMOUS/);
  assert.match(html,/ENTITLEMENT_REQUIRED[\s\S]*AUTH_ANONYMOUS/);
});

test('a permanent user without an available entitlement is rejected',()=>{
  assert.match(migration,/where user_id = p_profile_id and state = 'available'/);
  assert.match(migration,/if not found then raise exception 'ENTITLEMENT_REQUIRED'/);
});

test('one available entitlement is atomically consumed for one accepted book',()=>{
  assert.match(migration,/for update skip locked[\s\S]*limit 1/);
  assert.match(migration,/set state = 'consumed', book_id = p_book_id, consumed_at = now\(\)/);
  assert.match(migration,/entitlement_id, updated_at[\s\S]*v_entitlement\.id/);
  assert.match(migration,/book_entitlements_book_id_unique/);
  assert.match(migration,/book_renders_entitlement_id_unique/);
});

test('retrying checkout for the same book does not consume a second entitlement',()=>{
  const idempotent=migration.match(/if found then[\s\S]*?end if;\n\n  select \* into v_book/)?.[0]||'';
  assert.match(idempotent,/v_render\.entitlement_id/);
  assert.match(idempotent,/'idempotent', true/);
  assert.doesNotMatch(idempotent,/state = 'available'/);
});

test('rendering requires the consumed entitlement linked to the frozen render',()=>{
  assert.match(renderer,/\.eq\("id",job\.entitlement_id\)/);
  assert.match(renderer,/\.eq\("book_id",bookId\)/);
  assert.match(renderer,/\.eq\("user_id",user\.id\)\.eq\("state","consumed"\)/);
  assert.match(renderer,/if\(!entitlement\) throw new Error\("ENTITLEMENT_REQUIRED"\)/);
});

test('clients can only read their own entitlements and cannot write them',()=>{
  assert.match(migration,/alter table public\.book_entitlements enable row level security/);
  assert.match(migration,/user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration,/auth\.jwt\(\)->>'is_anonymous'/);
  assert.match(migration,/revoke all on table public\.book_entitlements from anon, authenticated/);
  assert.match(migration,/grant select on table public\.book_entitlements to authenticated/);
});

test('beta grants are server-only and target permanent users by email',()=>{
  assert.match(migration,/grant_book_entitlements_by_email/);
  assert.match(migration,/coalesce\(is_anonymous, false\) is false/);
  assert.match(migration,/grant execute on function public\.grant_book_entitlements_by_email[\s\S]*to service_role/);
});
