import test from "node:test";
import assert from "node:assert/strict";
import { composeStory } from "../src/story-composer.js";

const endpoint = "https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/published-story";
const headers = { apikey: "sb_publishable_baZvlGyMLBkkiOwHina6CA_HB59Lclw" };

test("the live catalog exposes at least one active versioned story", async () => {
  const response = await fetch(endpoint, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.ok(payload.stories.length > 0);
  assert.equal(payload.stories.every((story) => story.slug && story.version > 0), true);
});

test("the published branching contract follows the choice without emitting its question page", async () => {
  const response = await fetch(`${endpoint}?slug=test-con-bivio`, { headers });
  assert.equal(response.status, 200);
  const payload = await response.json();

  assert.ok(payload.version_id);
  assert.ok(payload.version_number > 0);
  assert.equal(payload.contract.story.slug, "test-con-bivio");

  const book = composeStory({
    story: payload.contract.story,
    scenes: payload.contract.scenes,
    contentByRef: payload.contract.contentByRef,
    catalog: payload.contract.catalog,
    choices: {
      story: payload.contract.story.slug,
      style: "paper",
      protagonist: { name: "Etto", asset_ref: "assets/test/etto.png" },
      setup: {},
      cast: { personaggio_2: { source: "catalog_character", character_id: "etto" } },
      branches: { scelta_p1: "opzione_1" },
    },
  });

  assert.deepEqual(book.pages.map((page) => page.step_key), ["p2", "p4"]);
  assert.equal(book.pages.some((page) => /\[[^\]]+\]/.test(page.text)), false);
});
