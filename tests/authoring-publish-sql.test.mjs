import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const sql = fs.readFileSync("supabase/migrations/20260901130258_authoring_publish_story_version.sql", "utf8");

test("publication is one locked database transaction", () => {
  assert.match(sql, /for update/i);
  assert.match(sql, /target\.status <> 'draft'/);
  assert.match(sql, /target\.updated_at is distinct from p_expected_updated_at/);
  assert.match(sql, /validation_report->>'status' <> 'valid'/);
  assert.match(sql, /validation_report->>'revision'/);
  assert.match(sql, /set status = 'published'/);
  assert.match(sql, /current_published_version_id = target\.id/);
});

test("the atomic publisher is callable only by service_role", () => {
  assert.match(sql, /security invoker/i);
  assert.match(sql, /revoke execute .* from public, anon, authenticated/i);
  assert.match(sql, /grant execute .* to service_role/i);
  assert.match(sql, /set search_path = public, pg_temp/i);
});
