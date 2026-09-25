import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { composeStory } from "../src/story-composer.js";

const source = fs.readFileSync(new URL("../story-validator.js", import.meta.url), "utf8");
const endpoint = "https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/published-story";

test("Gate D live runtime composes a published branching path without its choice page", async () => {
  const networkCalls = [];
  const nativeFetch = async (input, init) => {
    const url = String(typeof input === "string" ? input : input.url);
    networkCalls.push(url);
    return fetch(input, init);
  };
  const window = {
    fetch: nativeFetch,
    location: { href: "https://runtime.test/Dreamtaily/index.html" },
  };
  vm.runInNewContext(source, {
    window,
    globalThis: window,
    Response,
    URL,
    Map,
    Set,
    console,
    encodeURIComponent,
    decodeURIComponent,
  });

  assert.equal(window.DreamTailyPublishedStorySource.mode, "published-story-db");

  const catalogResponse = await window.fetch("stories/catalog.json", { cache: "no-store" });
  assert.equal(catalogResponse.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
  const catalog = await catalogResponse.json();
  const published = catalog.find((story) => story.slug === "test-con-bivio");
  assert.ok(published, "The published catalog must expose the branching test story");

  const definitionResponse = await window.fetch(published.definition, { cache: "no-store" });
  assert.equal(definitionResponse.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
  const story = await definitionResponse.json();
  assert.equal(story.slug, "test-con-bivio");

  const scenesResponse = await window.fetch(
    "stories/test-con-bivio/scene-pilot.json?v=gate-d-live",
    { cache: "no-store" }
  );
  assert.equal(scenesResponse.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
  const scenes = await scenesResponse.json();
  assert.equal(Object.keys(scenes.scenes).length, 4);

  const payload = await window.DreamTailyPublishedStorySource.loadContract(
    "test-con-bivio"
  );
  assert.ok(payload.version_number > 0);
  assert.ok(payload.version_id);

  const contentByRef = {};
  for (const ref of Object.keys(payload.contract.contentByRef)) {
    const response = await window.fetch(`stories/test-con-bivio/${ref}`, {
      cache: "no-store",
    });
    assert.equal(response.status, 200, ref);
    assert.equal(response.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
    contentByRef[ref] = await response.text();
  }
  assert.equal(Object.keys(contentByRef).length, 4);

  assert.equal(Object.keys(payload.contract.catalog).length, 4);

  const book = composeStory({
    story,
    scenes,
    catalog: payload.contract.catalog,
    contentByRef,
    choices: {
      story: story.slug,
      style: "paper",
      protagonist: { name: "Lia", asset_ref: "assets/test/lia.png" },
      setup: {},
      cast: { personaggio_2: { source: "catalog_character", character_id: "etto" } },
      branches: { scelta_p1: "opzione_2" },
    },
  });

  assert.equal(book.pages.length, 2);
  assert.deepEqual(
    book.pages.map((page) => page.step_key),
    ["p3", "p4"]
  );
  assert.equal(book.pages.some((page) => /\[[^\]]+\]/.test(page.text)), false);
  assert.equal(book.pages.every((page) => page.scene?.bg), true);
  assert.ok(networkCalls.filter((url) => url === endpoint).length >= 1);
  assert.equal(networkCalls.filter((url) => url.startsWith(`${endpoint}?slug=`)).length, 1);
});
