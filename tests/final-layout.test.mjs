import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { applicaLayoutAlLibro, inizializzaRendererGabbie, renderPaginaImpaginata } from "../src/book/final-layout.js";

const raw = await readFile(new URL("../src/book/gabbie.json", import.meta.url), "utf8");
const frontend = await readFile(new URL("../index.html", import.meta.url), "utf8");
inizializzaRendererGabbie(raw);

test("the normal frontend funnel applies the layout after composeStory", () => {
  assert.match(frontend, /import\("\.\/src\/book\/final-layout\.js"\)/);
  assert.equal((frontend.match(/applicaLayoutAlLibro\(composeStory\(/g) || []).length, 2);
  assert.match(frontend, /renderPaginaImpaginata\(page\)/);
  assert.match(frontend, /dtb-layout-styles/);
});

test("the final book keeps the exact layout selected by the author", () => {
  const book = { pages: [{ step_key: "p1", text: "Nel bosco.", scene: { bg: "bosco.png", layers: [] } }] };
  const story = { steps: [{ key: "p1", layout: { gabbia: "Dettaglio", specchiata: true } }] };
  const result = applicaLayoutAlLibro(book, story);
  assert.deepEqual(result.pages[0].layout, { gabbia: "Dettaglio", specchiata: true });
  assert.match(renderPaginaImpaginata(result.pages[0]), /data-gabbia="Dettaglio"/);
});

test("a figure layout renders the character selected in figura_slot", () => {
  const page = {
    text: "Lui è Etto.",
    layout: { gabbia: "Figura", figura_slot: "personaggio_2" },
    scene: { bg: "bosco.png", layers: [
      { role: "protagonist", src: "luca.png" },
      { role: "personaggio_2", src: "etto.png" },
    ] },
  };
  const html = renderPaginaImpaginata(page);
  assert.match(html, /src="etto\.png"/);
  assert.doesNotMatch(html, /src="luca\.png"/);
});

test("scene layouts preserve composed character layers", () => {
  const page = {
    text: "Nel bosco.",
    layout: { gabbia: "Campo" },
    scene: { bg: "bosco.png", layers: [{ role: "protagonist", src: "luca.png", x: .4, y: .9, scale: .5, z: 2 }] },
  };
  const html = renderPaginaImpaginata(page);
  assert.match(html, /src="bosco\.png"/);
  assert.match(html, /class="dtb-livello/);
  assert.match(html, /src="luca\.png"/);
});
