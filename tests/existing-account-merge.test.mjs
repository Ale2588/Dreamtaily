import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/20260921143000_prepare_existing_account_merge.sql", import.meta.url), "utf8");
const edge = await readFile(new URL("../supabase/functions/merge-account/index.ts", import.meta.url), "utf8");
const frontend = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("merge claims are short-lived, server-only and never expose raw secrets", () => {
  assert.match(migration, /alter table public\.account_merge_claims enable row level security/i);
  assert.match(migration, /revoke all on table public\.account_merge_claims from public, anon, authenticated/i);
  assert.match(migration, /char_length\(token_hash\) = 64/i);
  assert.match(migration, /p_expires_at > now\(\) \+ interval '20 minutes'/i);
  assert.doesNotMatch(migration, /claim_token\s+text/i);
});

test("only a verified anonymous source can prepare and a permanent target can finalize", () => {
  assert.match(edge, /auth\.getUser\(token\)/);
  assert.match(edge, /if \(!user\.is_anonymous\).*MERGE_SOURCE_NOT_ANONYMOUS/);
  assert.match(edge, /if \(user\.is_anonymous \|\| !user\.email\).*MERGE_TARGET_NOT_PERMANENT/);
  assert.match(migration, /MERGE_SOURCE_NOT_ANONYMOUS/);
  assert.match(migration, /MERGE_TARGET_NOT_PERMANENT/);
});

test("database finalization is one locked transaction and remains idempotent", () => {
  assert.match(migration, /where token_hash = p_token_hash\s+for update/i);
  assert.match(migration, /if v_claim\.status = 'completed'/i);
  assert.match(migration, /MERGE_TARGET_MISMATCH/);
  assert.match(migration, /MERGE_CHARACTER_CONFLICT/);
  assert.match(migration, /update public\.character_assets\s+set profile_id = p_target_user_id/i);
  assert.match(migration, /update public\.books\s+set profile_id = p_target_user_id/i);
});

test("two active drafts are preserved without violating the one-draft rule", () => {
  assert.match(migration, /books_one_active_draft_per_profile_idx/i);
  assert.match(migration, /status = 'draft' and archived_at is null/i);
  assert.match(migration, /update public\.books set archived_at = now\(\)/i);
});

test("migrated private character files remain readable only by the new relational owner", () => {
  assert.match(migration, /character_reference_files_select_migrated/);
  assert.match(migration, /cr\.storage_path = storage\.objects\.name/i);
  assert.match(migration, /ca\.profile_id = \(select auth\.uid\(\)\)/i);
});

test("P1-18B is wired only through the explicit existing-account path", () => {
  assert.match(frontend, /functions\.invoke\('merge-account'/);
  assert.match(frontend, /dtAuthMode==='login'/);
  assert.match(frontend, /shouldCreateUser:false/);
  assert.doesNotMatch(frontend, /prepare_account_merge_v1/);
});
