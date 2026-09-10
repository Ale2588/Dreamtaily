import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { inizializzaEditorGabbie, modelloImpaginazione, validaImpaginazione } from "../src/book/editor-layout.js";

const json = await readFile(new URL("../src/book/gabbie.json", import.meta.url), "utf8");
inizializzaEditorGabbie(json);

const scenes = { scenes: {
  a: { slots: [{ role: "protagonist" }] },
  b: { slots: [{ role: "protagonist" }, { role: "helper" }] },
} };
const contentByRef = { "chapters/a.md": "Testo breve", "chapters/b.md": "Altro testo" };

test("the editor offers all families when the page has a visible character", () => {
  const story = { steps: [{ key: "a", content_ref: "chapters/a.md" }] };
  const model = modelloImpaginazione({ story, scenes, contentByRef, stepKey: "a" });
  assert.deepEqual(new Set(model.gabbie.map((item) => item.famiglia)), new Set(["scena", "figura", "dissolvenza"]));
});

test("figure layouts are hidden when no character appears in the scene", () => {
  const story = { steps: [{ key: "x", content_ref: "chapters/a.md" }] };
  const model = modelloImpaginazione({ story, scenes, contentByRef, stepKey: "x" });
  assert.ok(model.gabbie.every((item) => item.famiglia !== "figura"));
});

test("a layout must work after every branch predecessor", () => {
  const story = { steps: [
    { key: "a", content_ref: "chapters/a.md", next: "b", layout: { gabbia: "Campo" } },
    { key: "x", content_ref: "chapters/a.md", next: "b", layout: { gabbia: "Mezzo" } },
    { key: "b", content_ref: "chapters/b.md" },
  ] };
  const model = modelloImpaginazione({ story, scenes, contentByRef, stepKey: "b" });
  assert.ok(!model.gabbie.some((item) => item.taglio === "facciata"));
});

test("the editor rejects missing, overflowing and incomplete figure choices", () => {
  const story = { steps: [
    { key: "a", content_ref: "chapters/a.md" },
    { key: "b", content_ref: "chapters/b.md", layout: { gabbia: "Ritratto" } },
  ] };
  const longContent = { ...contentByRef, "chapters/b.md": "x".repeat(71) };
  const codes = validaImpaginazione({ story, scenes, contentByRef: longContent }).map((issue) => issue.code);
  assert.ok(codes.includes("LAYOUT_REQUIRED"));
  assert.ok(codes.includes("LAYOUT_TEXT_OVERFLOW"));
  assert.ok(codes.includes("LAYOUT_FIGURE_REQUIRED"));
});

test("an invalid saved choice remains in the model so the UI can explain it", () => {
  const story = { steps: [{ key: "a", content_ref: "chapters/a.md", layout: { gabbia: "Ritratto", figura_slot: "protagonist" } }] };
  const longContent = { "chapters/a.md": "x".repeat(71) };
  const model = modelloImpaginazione({ story, scenes, contentByRef: longContent, stepKey: "a" });
  assert.equal(model.scelta.gabbia, "Ritratto");
  assert.ok(!model.gabbie.some((item) => item.nome === "Ritratto"));
  assert.ok(validaImpaginazione({ story, scenes, contentByRef: longContent }).some((issue) => issue.code === "LAYOUT_TEXT_OVERFLOW"));
});

test("Velo can be selected only once per book", () => {
  const story = { steps: [
    { key: "a", content_ref: "chapters/a.md", layout: { gabbia: "Velo" } },
    { key: "b", content_ref: "chapters/b.md" },
  ] };
  const model = modelloImpaginazione({ story, scenes, contentByRef, stepKey: "b" });
  assert.ok(!model.gabbie.some((item) => item.nome === "Velo"));
});

test("the editor catches repeated crop and repeated image side across an edge", () => {
  const story = { steps: [
    { key: "a", content_ref: "chapters/a.md", next: "b", layout: { gabbia: "Campo" } },
    { key: "b", content_ref: "chapters/b.md", layout: { gabbia: "Apertura" } },
  ] };
  const codes = validaImpaginazione({ story, scenes, contentByRef }).map((issue) => issue.code);
  assert.ok(codes.includes("LAYOUT_CROP_REPEATED"));
  assert.ok(codes.includes("LAYOUT_SIDE_REPEATED"));
});
