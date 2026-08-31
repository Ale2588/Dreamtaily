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
