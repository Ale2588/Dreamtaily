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
  assert.match(source, /versionMatch\[2\] === "assets"/);
});

test("new projects copy controlled metadata into the initial draft", () => {
  assert.match(source, /const AGE_RANGES = new Set/);
  assert.match(source, /const TONES = new Set/);
  assert.match(source, /editorial: \{/);
  assert.match(source, /cover_ref: null/);
  assert.match(source, /AGE_RANGE_INVALID/);
  assert.match(source, /TONE_INVALID/);
});

test("image uploads are owner checked and constrained", () => {
  const upload = source.match(/async function uploadAsset[\s\S]*?async function createVersion/)?.[0] || "";
  assert.match(upload, /ownedVersion\(versionId, uid, admin\)/);
  assert.match(upload, /VERSION_IMMUTABLE/);
  assert.match(upload, /bytes\.byteLength > 8_000_000/);
  assert.match(upload, /validImageBytes\(bytes, contentType\)/);
  assert.match(upload, /storage\.from\("story-images"\)\.upload/);
  assert.match(source, /"image\/png": "png"/);
});

test("draft saves use optimistic concurrency and cannot mutate published versions", () => {
  const saveSource = source.match(/async function saveVersion[\s\S]*?async function validateVersion/)?.[0] || "";
  assert.match(source, /VERSION_IMMUTABLE/);
  assert.match(source, /expected_updated_at/);
  assert.match(source, /\.eq\("updated_at", expected\)/);
  assert.match(source, /REVISION_CONFLICT/);
  assert.match(source, /validation_report: \{ status: "not_validated" \}/);
  assert.doesNotMatch(saveSource, /published_contract:/);
});

test("server validation uses the shared canonical validator", () => {
  assert.match(source, /import \{ validateAuthoringContract \} from "\.\.\/_shared\/story-authoring-validator\.js"/);
  assert.match(source, /revision: access\.version\.updated_at/);
});

test("validation and publishing reject production assets that are not reachable", () => {
  assert.match(source, /async function validateProductionAssets/);
  assert.match(source, /COVER_UNREACHABLE/);
  assert.match(source, /SCENE_BACKGROUND_UNREACHABLE/);
  assert.match(source, /ASSET_HOSTS\.has\(url\.host\)/);
  assert.equal((source.match(/await validateProductionAssets\(/g) || []).length, 2);
});

test("request routing does not shadow the native URL constructor", () => {
  assert.match(source, /const SUPABASE_URL = Deno\.env\.get\("SUPABASE_URL"\)/);
  assert.match(source, /new URL\(req\.url\)/);
  assert.doesNotMatch(source, /const URL =/);
});

test("publishing revalidates and delegates the atomic transition to Postgres", () => {
  assert.match(source, /validateAuthoringContract\(\{/);
  assert.match(source, /validation\.revision !== access\.version\.updated_at/);
  assert.match(source, /publish_story_version_atomic/);
  assert.match(source, /contract_version: 1/);
  assert.match(source, /contentByRef: access\.version\.content_by_ref/);
  assert.match(source, /versionMatch\[2\] === "publish"/);
});
