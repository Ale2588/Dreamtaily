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
  assert.doesNotMatch(html, /DT_STORY_ROOT|activeStoryDefinition\?\.slug\|\|"il-bosco-dei-sussurri"/);
  assert.match(html, /throw new Error\("STORY_SCENES_MISSING"\)/);
  assert.match(html, /throw new Error\("STORY_CONTENT_MISSING"\)/);
  assert.match(html, /return `stories\/\$\{slug\}\/\$\{ref\}`/);
  const prefixer = html.match(/function dtPrefixedSceneContract\(\)[\s\S]*?window\.finishStoryComposer/)?.[0] || "";
  assert.doesNotMatch(prefixer, /if\(app\.activeStoryContract\?\.scenes\) return scenes/);
});

test("all stories skip the obsolete preparation screen", () => {
  assert.match(html, /function dtOpenStoryEntry\(\)/);
  const entry = html.match(/function dtOpenStoryEntry\(\)\{[\s\S]*?\n\}/)?.[0] || "";
  assert.match(entry, /showScreen\("composer"\)/);
  assert.doesNotMatch(entry, /showScreen\("setup"\)/);
  const start = html.match(/window\.startStoryComposer=async[\s\S]*?async function dtComposeFromCurrentState/)?.[0] || "";
  assert.match(start, /dtOpenStoryEntry\(\)/);
});

test("checkout summarizes the whole book instead of story-specific path details", () => {
  assert.doesNotMatch(html, /function dtBookDetailRows\(\)/);
  assert.match(html, /setup:dtSetupChoiceMap\(\)/);
  assert.match(html, /branches:dtBranchChoiceMap\(\)/);
  const checkout = html.match(/window\.openDtCheckout=async function\(\)[\s\S]*?window\.updateDtPayButton/)?.[0] || "";
  assert.match(checkout, /app\.bookStories\.map/);
  assert.doesNotMatch(checkout, /Sentiero|d_sentiero|d_finale/);
});

test("the public catalog uses the authoring cover before the fallback", () => {
  assert.match(publishedStorySource, /editorial\.cover_ref\|\|story\.cover_image/);
  assert.match(publishedStorySource, /editorial\.age_range\|\|story\.age_range\|\|p\.age_range/);
  assert.match(publishedStorySource, /story\.title\|\|p\.public_title/);
});

test("catalog normalizes legacy ages and exposes multiple story types", () => {
  assert.match(publishedStorySource, /function legacyAges/);
  assert.match(publishedStorySource, /min_age:Number\.isInteger\(editorial\.min_age\)/);
  assert.match(publishedStorySource, /story_types:Array\.isArray\(editorial\.story_types\)/);
});

test("catalog filters use OR within groups and AND between groups", () => {
  assert.match(html, /const ageMatch=!storyCatalogFilters\.ages\.size\|\|STORY_AGE_FILTERS\.some/);
  assert.match(html, /const typeMatch=!storyCatalogFilters\.types\.size\|\|types\.some/);
  assert.match(html, /return ageMatch&&typeMatch/);
  assert.match(html, /Azzera filtri/);
  assert.match(html, /story-result-count/);
});

test("the live catalog hides archived Bosco and exposes Lucciola", async () => {
  const response = await fetch(endpoint, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();
  const slugs = payload.stories.map((story) => story.slug);
  assert.ok(!slugs.includes("il-bosco-dei-sussurri"));
  assert.ok(slugs.includes("collaudo-pubblicazione-bo-08"));
});

test("the published Lucciola contract composes without setup or branch choices", async () => {
  const response = await fetch(`${endpoint}?slug=collaudo-pubblicazione-bo-08`, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.ok(payload.version_id);
  assert.ok(payload.version_number >= 2);
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
