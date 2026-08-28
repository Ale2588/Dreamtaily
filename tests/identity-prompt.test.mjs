import test from "node:test";
import assert from "node:assert/strict";
import { buildIdentityPrompt } from "../src/identity-prompt.js";

test("buildIdentityPrompt skips null fields without empty commas", () => {
  const value = buildIdentityPrompt({
    skin_tone: "warm brown",
    eye_color: "dark brown",
    hair_color: "black",
    hair_style: "curly",
    default_outfit: { top: "mustard-yellow raincoat", shoes: "teal boots" },
    distinctive_features: [],
  }, "Sofia");

  assert.equal(
    value,
    "a young child, warm brown skin, dark brown eyes, curly black hair, mustard-yellow raincoat, teal boots"
  );
  assert.equal(value.includes("Sofia"), false);
  assert.equal(value.includes(", ,"), false);
});

test("buildIdentityPrompt is deterministic", () => {
  const appearance = {
    species: "a small dragon",
    body_color: "moss green scales",
    eye_color: "amber",
    default_outfit: {},
    distinctive_features: ["one golden horn"],
  };
  assert.equal(
    buildIdentityPrompt(appearance, "A"),
    buildIdentityPrompt(structuredClone(appearance), "B")
  );
});

test("buildIdentityPrompt preserves free-form values verbatim", () => {
  const value = buildIdentityPrompt({
    hair_color: "castani e mossi",
    distinctive_features: ["sciarpa gialla"],
  });
  assert.equal(value, "a young child, castani e mossi hair, sciarpa gialla");
});
