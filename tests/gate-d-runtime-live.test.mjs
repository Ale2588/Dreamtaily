import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

import { composeStory } from "../src/story-composer.js";

const source = fs.readFileSync(new URL("../story-validator.js", import.meta.url), "utf8");
const endpoint = "https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/published-story";

test("Gate D live runtime composes a complete Bosco path from the published DB contract", async () => {
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
  const bosco = catalog.find((story) => story.slug === "il-bosco-dei-sussurri");
  assert.ok(bosco, "The published catalog must expose the Bosco");

  const definitionResponse = await window.fetch(bosco.definition, { cache: "no-store" });
  assert.equal(definitionResponse.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
  const story = await definitionResponse.json();
  assert.equal(story.version, 3);

  const scenesResponse = await window.fetch(
    "stories/il-bosco-dei-sussurri/scene-pilot.json?v=gate-d-live",
    { cache: "no-store" }
  );
  assert.equal(scenesResponse.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
  const scenes = await scenesResponse.json();
  assert.equal(Object.keys(scenes.scenes).length, 10);

  const payload = await window.DreamTailyPublishedStorySource.loadContract(
    "il-bosco-dei-sussurri"
  );
  assert.equal(payload.version_number, 3);
  assert.equal(payload.version_id, "43068bf8-ab56-4027-915d-3aa088718659");

  const contentByRef = {};
  for (const ref of Object.keys(payload.contract.contentByRef)) {
    const response = await window.fetch(`stories/il-bosco-dei-sussurri/${ref}`, {
      cache: "no-store",
    });
    assert.equal(response.status, 200, ref);
    assert.equal(response.headers.get("X-DreamTaily-Story-Source"), "published-story-db");
    contentByRef[ref] = await response.text();
  }
  assert.equal(Object.keys(contentByRef).length, 27);

  // Gate D intentionally still uses the helper catalog embedded in index.html.
  // Keep this fixture aligned with that temporary runtime adapter boundary.
  const runtimeCatalog = {
    etto: {
      name: "Etto",
      image: "assets/char/paper/etto_in_piedi.png",
      art: {
        papercut: {
          in_piedi: "assets/char/paper/etto_in_piedi.png",
          seduto: "assets/char/paper/etto_seduto.png",
          cammina: "assets/char/paper/etto_cammina.png",
          si_china: "assets/char/paper/etto_si_china.png",
        },
      },
    },
  };
  assert.equal(Object.keys(payload.contract.catalog).length, 4);

  const book = composeStory({
    story,
    scenes,
    catalog: runtimeCatalog,
    contentByRef,
    choices: {
      story: story.slug,
      style: "papercut",
      protagonist: { name: "Lia", asset_ref: "assets/test/lia.png" },
      setup: { atmosfera: "notte" },
      cast: { helper: "etto" },
      branches: { d_sentiero: "felci", d_finale: "promessa" },
    },
  });

  assert.equal(book.pages.length, 7);
  assert.deepEqual(
    book.pages.map((page) => page.step_key),
    ["s1", "s2", "s3_felci", "s4_felci", "s4", "s5", "s6_promessa"]
  );
  assert.equal(book.pages.some((page) => /\[[^\]]+\]/.test(page.text)), false);
  assert.equal(book.pages.every((page) => page.scene?.bg), true);
  assert.equal(networkCalls.filter((url) => url === endpoint).length, 1);
  assert.equal(networkCalls.filter((url) => url.startsWith(`${endpoint}?slug=`)).length, 1);
});
