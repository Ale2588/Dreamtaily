import test from "node:test";
import assert from "node:assert/strict";
import { buildReaderSequence, createReaderState, readerViewModel } from "../src/book-reader.js";

const book = {
  meta: { title: "Il bosco dei sussurri", protagonist: "Lia" },
  cover: { title: "Il bosco dei sussurri", subtitle: "Un’avventura di Lia", scene: { layers: [] } },
  pages: [
    { id: "p1", chapter: 1, title: "La campanella", text: "Prima pagina.", scene: { layers: [] } },
    { id: "p2", chapter: 2, title: "Il primo sentiero", text: "Seconda pagina.", scene: { layers: [] } }
  ]
};

test("builds cover plus pages", () => {
  const sequence = buildReaderSequence(book);
  assert.equal(sequence.length, 3);
  assert.equal(sequence[0].kind, "cover");
  assert.equal(sequence[1].kind, "page");
});

test("navigates within bounds", () => {
  const state = createReaderState(book);
  state.previous();
  assert.equal(state.index, 0);
  state.next(); state.next(); state.next();
  assert.equal(state.index, 2);
  assert.equal(state.canNext, false);
});

test("clamps direct navigation", () => {
  const state = createReaderState(book);
  state.goTo(99);
  assert.equal(state.index, 2);
  state.goTo(-20);
  assert.equal(state.index, 0);
});

test("creates the view model", () => {
  const state = createReaderState(book, 1);
  const view = readerViewModel(book, state, {
    cover: "Copertina", chapter: "Capitolo", page: "Pagina", of: "di"
  });
  assert.equal(view.title, "La campanella");
  assert.equal(view.eyebrow, "Capitolo 1");
  assert.equal(view.progress, "Pagina 2 di 3");
});
