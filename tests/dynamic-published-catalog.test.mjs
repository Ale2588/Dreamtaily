import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { composeStory } from "../src/story-composer.js";

const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const publishedStorySource = await readFile(new URL("../supabase/functions/published-story/index.ts", import.meta.url), "utf8");
const endpoint = "https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/published-story";
const headers = { apikey: "sb_publishable_baZvlGyMLBkkiOwHina6CA_HB59Lclw" };

test("Book Creator loads every published story and pins its immutable version", () => {
  assert.match(html, /fetch\(`\$\{SUPABASE_URL\}\/functions\/v1\/published-story`/);
  assert.doesNotMatch(html, /filter\(item=>item\.slug==="il-bosco-dei-sussurri"\)/);
  assert.doesNotMatch(html, /Per questo MVP è disponibile solo Il bosco dei sussurri/);
  assert.match(html, /story_version_id:story\._versionId/);
  assert.match(html, /content_snapshot:story\._contract/);
  assert.match(html, /const contract=bookStory\.content_snapshot\|\|null/);
});

test("dynamic stories prefix only relative assets with their own slug", () => {
  assert.match(html, /const slug=app\.activeStoryDefinition\?\.slug\|\|"il-bosco-dei-sussurri"/);
  assert.match(html, /return `stories\/\$\{slug\}\/\$\{ref\}`/);
  const prefixer = html.match(/function dtPrefixedSceneContract\(\)[\s\S]*?window\.finishStoryComposer/)?.[0] || "";
  assert.doesNotMatch(prefixer, /if\(app\.activeStoryContract\?\.scenes\) return scenes/);
});

test("stories without setup skip the obsolete preparation screen", () => {
  assert.match(html, /function dtOpenStoryEntry\(\)/);
  assert.match(html, /if\(\(app\.activeStoryDefinition\?\.setup\|\|\[\]\)\.length\)/);
  const start = html.match(/window\.startStoryComposer=async[\s\S]*?async function dtComposeFromCurrentState/)?.[0] || "";
  assert.match(start, /dtOpenStoryEntry\(\)/);
});

test("checkout details come from the active story instead of Bosco keys", () => {
  assert.match(html, /function dtBookDetailRows\(\)/);
  assert.match(html, /setup:dtSetupChoiceMap\(\)/);
  assert.match(html, /branches:dtBranchChoiceMap\(\)/);
  const checkout = html.match(/window\.openDtCheckout=function\(\)[\s\S]*?window\.updateDtPayButton/)?.[0] || "";
  assert.doesNotMatch(checkout, /Sentiero|d_sentiero|d_finale/);
});

test("the public catalog uses the authoring cover before the fallback", () => {
  assert.match(publishedStorySource, /story\.editorial\?\.cover_ref\|\|story\.cover_image/);
  assert.match(publishedStorySource, /story\.editorial\?\.age_range\|\|story\.age_range\|\|p\.age_range/);
  assert.match(publishedStorySource, /story\.title\|\|p\.public_title/);
});

test("the live catalog exposes Bosco and Lucciola", async () => {
  const response = await fetch(endpoint, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();
  const slugs = payload.stories.map((story) => story.slug);
  assert.ok(slugs.includes("il-bosco-dei-sussurri"));
  assert.ok(slugs.includes("collaudo-pubblicazione-bo-08"));
});

test("the published Lucciola contract composes without setup or branch choices", async () => {
  const response = await fetch(`${endpoint}?slug=collaudo-pubblicazione-bo-08`, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.equal(payload.version_id, "e299026c-c8c1-45a0-9bc4-fd1d26b91ad8");
  assert.equal(payload.version_number, 1);
  assert.equal(payload.contract.story.title, "La Lucciola di Prova");

  const book = composeStory({
    story: payload.contract.story,
    scenes: payload.contract.scenes,
    contentByRef: payload.contract.contentByRef,
    catalog: payload.contract.catalog,
    choices: {
      story: payload.contract.story.slug,
      style: "papercut",
      protagonist: { name: "Etto", asset_ref: "assets/test/etto.png" },
      setup: {},
      cast: {},
      branches: {},
    },
  });

  assert.equal(book.pages.length, 1);
  assert.equal(book.pages.some((page) => /\[[^\]]+\]/.test(page.text)), false);
});
