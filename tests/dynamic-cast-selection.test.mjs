import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const source=fs.readFileSync("index.html","utf8");

test("declared cast slots are selected explicitly from their allowed sources",()=>{
  assert.match(source,/function dtMissingDeclaredCastSlot/);
  assert.match(source,/slot\.allowed_sources\|\|\[\]/);
  assert.match(source,/slot\.allowed_catalog_ids\|\|\[\]/);
  assert.match(source,/app\.activeStoryContract\?\.catalog\|\|DT_HELPERS/);
  assert.match(source,/window\.selectDtDeclaredCast=async function/);
  assert.match(source,/from\("story_cast_assignments"\)\.upsert/);
});

test("composition receives every persisted cast slot instead of an implicit helper",()=>{
  assert.match(source,/function dtCastChoicesForComposer/);
  assert.match(source,/cast:\{\.\.\.dtCastChoicesForComposer\(\)/);
  assert.match(source,/declaredCastComplete/);
  assert.doesNotMatch(source,/const helper=DT_HELPERS\[entry\.key\]/);
});
