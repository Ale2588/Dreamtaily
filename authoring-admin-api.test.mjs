import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("supabase/functions/authoring-admin/index.ts", "utf8");

test("authoring API authenticates and checks project ownership", () => {
  assert.match(source, /auth\.getUser\(token\)/);
  assert.match(source, /data\.owner_id !== uid && !admin/);
  assert.doesNotMatch(source, /user_metadata/);
});

test("authoring API exposes the draft bundle lifecycle", () => {
  assert.match(source, /authoring-admin\/projects/);
  assert.match(source, /authoring-admin\/versions/);
  assert.match(source, /req\.method === "GET"/);
  assert.match(source, /req\.method === "PUT"/);
  assert.match(source, /versionMatch\[2\] === "validate"/);
});

test("draft saves use optimistic concurrency and cannot mutate published versions", () => {
  assert.match(source, /VERSION_IMMUTABLE/);
  assert.match(source, /expected_updated_at/);
  assert.match(source, /\.eq\("updated_at", expected\)/);
  assert.match(source, /REVISION_CONFLICT/);
  assert.match(source, /validation_report: \{ status: "not_validated" \}/);
  assert.doesNotMatch(source, /published_contract:/);
});

test("server validation uses the shared canonical validator", () => {
  assert.match(source, /import \{ validateAuthoringContract \} from "\.\.\/_shared\/story-authoring-validator\.js"/);
  assert.match(source, /revision: access\.version\.updated_at/);
});

test("request routing does not shadow the native URL constructor", () => {
  assert.match(source, /const SUPABASE_URL = Deno\.env\.get\("SUPABASE_URL"\)/);
  assert.match(source, /new URL\(req\.url\)/);
  assert.doesNotMatch(source, /const URL =/);
});
