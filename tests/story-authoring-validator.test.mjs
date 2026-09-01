import test from "node:test";
import assert from "node:assert/strict";
import { validateAuthoringContract } from "../src/story-authoring-validator.js";

function contract(afterLeftText = "Il viaggio continua.") {
  const story = {
    start: "start",
    cast_slots: [{ key: "protagonist", introduced_at: "start" }, { key: "friend" }],
    steps: [
      {
        key: "start",
        content_ref: "start.md",
        decision: {
          type: "branch",
          key: "path",
          options: [{ key: "left", next: "left" }, { key: "right", next: "right" }],
        },
      },
      {
        key: "left",
        content_ref: "left.md",
        decision: { type: "cast", key: "choose_friend", slot: "friend" },
        next: "end",
      },
      { key: "right", content_ref: "right.md", next: "end" },
      { key: "end", content_ref: "end.md", next: null },
    ],
  };
  const scenes = {
    scenes: Object.fromEntries(story.steps.map((step) => [step.key, {
      background_ref: `${step.key}.png`,
      environment_prompt: `Ambiente ${step.key}`,
      moment_prompt: `Momento ${step.key}`,
      slots: [{ role: "protagonist" }],
    }])),
  };
  return {
    story,
    scenes,
    contentByRef: {
      "start.md": "[PERSONAGGIO:protagonist] sceglie.",
      "left.md": "[PERSONAGGIO:friend] arriva.",
      "right.md": "Il sentiero è tranquillo.",
      "end.md": afterLeftText,
    },
  };
}

test("accepts a slot used only after assignment on its branch", () => {
  const result = validateAuthoringContract(contract());
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rejects a branch-only slot after convergence", () => {
  const result = validateAuthoringContract(contract("[PERSONAGGIO:friend] saluta tutti."));
  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.filter((error) => error.code === "CAST_SLOT_USED_BEFORE_ASSIGNMENT"),
    [{ code: "CAST_SLOT_USED_BEFORE_ASSIGNMENT", step: "end", slot: "friend" }]
  );
});

test("rejects missing cast entrance content", () => {
  const input = contract();
  input.story.steps[1].decision.catalog_roster = [
    { key: "etto", entrance_ref: "missing-etto-entry.md" },
  ];
  const result = validateAuthoringContract(input);
  assert.equal(result.valid, false);
  assert.deepEqual(
    result.errors.filter((error) => error.code === "CONTENT_MISSING"),
    [{ code: "CONTENT_MISSING", step: "left", ref: "missing-etto-entry.md" }]
  );
});

test("rejects a branch option without a destination", () => {
  const input = contract();
  input.story.steps[0].decision.options[1].next = null;
  const result = validateAuthoringContract(input);
  assert.deepEqual(result.errors.filter((error) => error.code === "BRANCH_DESTINATION_REQUIRED"), [{ code: "BRANCH_DESTINATION_REQUIRED", step: "start", option: "right" }]);
});

test("rejects incomplete scene authoring fields", () => {
  const input = contract();
  input.scenes.scenes.left.background_ref = "";
  input.scenes.scenes.left.environment_prompt = "";
  input.scenes.scenes.left.moment_prompt = "";
  const result = validateAuthoringContract(input);
  assert.deepEqual(result.errors.filter((error) => error.step === "left").map((error) => error.code), ["SCENE_BACKGROUND_REQUIRED", "SCENE_ENVIRONMENT_PROMPT_REQUIRED", "SCENE_MOMENT_PROMPT_REQUIRED"]);
});

test("rejects scene slots that are not declared by the story", () => {
  const input = contract();
  input.scenes.scenes.right.slots.push({ role: "ghost" });
  const result = validateAuthoringContract(input);
  assert.deepEqual(result.errors.filter((error) => error.code === "SCENE_SLOT_UNKNOWN"), [{ code: "SCENE_SLOT_UNKNOWN", step: "right", slot: "ghost" }]);
});

test("rejects duplicate or empty cast slot keys", () => {
  const input = contract();
  input.story.cast_slots.push({ key: "friend" }, { label: "Senza chiave" });
  const result = validateAuthoringContract(input);
  assert.deepEqual(result.errors.filter((error) => error.code === "CAST_SLOT_KEYS_INVALID"), [{ code: "CAST_SLOT_KEYS_INVALID" }]);
});
