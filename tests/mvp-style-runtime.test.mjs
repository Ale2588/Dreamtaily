import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");
const checkout=fs.readFileSync(new URL("../supabase/functions/checkout-book/index.ts",import.meta.url),"utf8");

test("runtime skips the legacy initial atmosphere screen", () => {
  assert.match(html,/function dtOpenStoryEntry\(\)\{\s*app\.currentStepKey=/);
  assert.match(html,/\.filter\(item=>item\.key!==\"atmosfera\"\)/);
  assert.match(html,/const resolved=dtPrefixStoryRef\(definition\.background_ref\)/);
});

test("MVP exposes Paper Cut as the only selectable visual style", () => {
  const creator=html.slice(html.indexOf("<label>Stile visivo del libro</label>"),html.indexOf("<label>Chi stiamo creando?</label>"));
  assert.match(creator,/data-style="paper"/);
  assert.doesNotMatch(creator,/data-style="water"/);
  assert.doesNotMatch(creator,/data-style="crayon"/);
});

test("checkout pins a matching book-style character reference", () => {
  assert.match(checkout,/normalizeVisualStyleId\(ref\.style\)===bookStyle\.id/);
  assert.match(checkout,/style:bookStyle\.id/);
});
