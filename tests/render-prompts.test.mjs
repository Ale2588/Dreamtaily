import test from "node:test";
import assert from "node:assert/strict";
import {
  HELPER_IDENTITIES,
  SCENE_PROMPTS,
  buildPageRenderPrompt,
  getHelperIdentity
} from "../src/render-prompts.js";

test("all four canonical helpers exist", () => {
  assert.deepEqual(
    Object.keys(HELPER_IDENTITIES).sort(),
    ["briciola", "etto", "fiamma", "ulivo"]
  );
});

test("canonical identity markers are preserved", () => {
  assert.match(getHelperIdentity("etto").identity_prompt, /LEFT knee/);
  assert.match(getHelperIdentity("fiamma").identity_prompt, /one ear upright/);
  assert.match(getHelperIdentity("ulivo").identity_prompt, /opposite direction/);
  assert.match(getHelperIdentity("briciola").identity_prompt, /spot beside a whisker/);
});

test("prompt pack covers cover plus all 10 scene ids", () => {
  assert.deepEqual(
    Object.keys(SCENE_PROMPTS).sort(),
    [
      "cover","s1","s2","s3_felci","s3_ruscello","s4",
      "s4_felci","s4_ruscello","s5","s6_festa","s6_promessa"
    ].sort()
  );
});

test("page prompt has deterministic reference order and no helper when absent", () => {
  const prompt = buildPageRenderPrompt({
    sceneId: "s1",
    atmosphere: "notte",
    protagonistIdentity: "a small rabbit with a blue patch"
  });
  assert.match(prompt, /Image 1 is the APPROVED BACKGROUND/);
  assert.match(prompt, /Image 2 is the PROTAGONIST/);
  assert.doesNotMatch(prompt, /Image 3 is the HELPER/);
  assert.match(prompt, /deep indigo night/);
  assert.match(prompt, /Do NOT render text/);
});

test("page prompt resolves helper identity from catalog id", () => {
  const prompt = buildPageRenderPrompt({
    sceneId: "s3_ruscello",
    atmosphere: "notte",
    protagonistIdentity: "a small rabbit with a blue patch",
    helperId: "ulivo",
    helperPose: "cammina"
  });
  assert.match(prompt, /Image 3 is the HELPER/);
  assert.match(prompt, /button-like eyes/);
  assert.match(prompt, /small grounded walking step/);
});

test("unknown scene fails explicitly", () => {
  assert.throws(
    () => buildPageRenderPrompt({
      sceneId: "missing",
      protagonistIdentity: "a child"
    }),
    /UNKNOWN_SCENE_PROMPT/
  );
});
