import test from "node:test";
import assert from "node:assert/strict";
import {
  MVP_VISUAL_STYLE_ID,
  VISUAL_STYLE_CATALOG,
  normalizeVisualStyleId,
  requireActiveVisualStyle
} from "../src/visual-styles.js";

test("visual style catalog is extensible but MVP activates only Paper Cut", () => {
  assert.equal(MVP_VISUAL_STYLE_ID, "paper");
  assert.deepEqual(Object.keys(VISUAL_STYLE_CATALOG), ["paper", "water", "crayon"]);
  assert.deepEqual(
    Object.values(VISUAL_STYLE_CATALOG).filter(style => style.status === "active").map(style => style.id),
    ["paper"]
  );
});

test("legacy paper-cut aliases normalize to the canonical book style", () => {
  assert.equal(normalizeVisualStyleId("papercut"), "paper");
  assert.equal(normalizeVisualStyleId("paper-cut"), "paper");
  assert.equal(requireActiveVisualStyle("paper").label, "Paper Cut");
  assert.throws(() => requireActiveVisualStyle("water"), /VISUAL_STYLE_NOT_ACTIVE:water/);
});
