import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { caricaGabbie, gabbiaPerNome } from "../src/book/gabbie.js";
import { gabbieDisponibili, lunghezzaEditoriale, orientamentiDisponibili } from "../src/book/selettore.js";
import { renderDoppia } from "../src/book/doppia.js";
import { costruisciLibro } from "../src/book/foliazione.js";

const raw = await readFile(new URL("../src/book/gabbie.json", import.meta.url), "utf8");
const catalogo = caricaGabbie(raw);

test("gabbie.json is the valid source of truth for all fifteen layouts", () => {
  assert.equal(catalogo.gabbie.length, 15);
  assert.deepEqual(new Set(catalogo.gabbie.map((item) => item.famiglia)), new Set(["scena", "figura", "dissolvenza"]));
});

test("every text rectangle fits the 1240 by 465 spread", () => {
  for (const gabbia of catalogo.gabbie) {
    for (const box of [...gabbia.testo, ...(gabbia.specchiata?.testo || [])]) {
      assert.ok(box.x >= 0 && box.y >= 0);
      assert.ok(box.x + box.w <= 1240);
      assert.ok(box.y + box.h <= 465);
    }
  }
});

test("capacity uses the longest grammatical variant", () => {
  const variants = { default: "breve", male: "x".repeat(120), female: "x".repeat(141) };
  assert.equal(lunghezzaEditoriale(variants), 141);
  assert.ok(!gabbieDisponibili(variants).includes("Dettaglio"));
});

test("520 characters only return layouts that can contain them", () => {
  const names = gabbieDisponibili("x".repeat(520));
  assert.ok(names.length > 0);
  assert.ok(names.every((name) => gabbiaPerNome(name).max >= 520));
});

test("the same crop is never proposed twice in succession", () => {
  const names = gabbieDisponibili("testo", { gabbiaPrecedente: "Vignetta" });
  assert.ok(!names.includes("Vignetta"));
  assert.ok(!names.includes("Coro"));
  assert.ok(!names.includes("Colonna"));
});

test("a mirrored layout remains available only on the side allowed by the sequence", () => {
  const dettaglio = gabbiaPerNome("Dettaglio");
  assert.deepEqual(orientamentiDisponibili(dettaglio, { latoPrecedente: "sinistra" }), [
    { specchiata: true, lato: "destra" },
  ]);
});

test("Panoramica is excluded when a face falls in the fold", () => {
  assert.ok(!gabbieDisponibili("testo", { voltoInPiega: true }).includes("Panoramica"));
});

test("figure layouts remain selectable and can be filtered by capability", () => {
  assert.ok(gabbieDisponibili("testo").includes("Figura"));
  assert.ok(!gabbieDisponibili("testo", { famiglieAttive: { figura: false } }).includes("Figura"));
});

test("Velo is available once per book", () => {
  assert.ok(gabbieDisponibili("testo").includes("Velo"));
  assert.ok(!gabbieDisponibili("testo", { gabbieUsate: ["Velo"] }).includes("Velo"));
});

test("renderDoppia emits scalable percentages and no positional pixels", () => {
  const html = renderDoppia({
    gabbia: gabbiaPerNome("Campo"),
    immagine: "scena.png",
    testo: "Una storia breve.",
    specchiata: true,
  });
  assert.match(html, /left:\d+(?:\.\d+)?%/);
  assert.doesNotMatch(html, /\dpx/);
  assert.match(html, /data-gabbia="Campo"/);
});

test("figure layouts require and render the selected cutout", () => {
  assert.throws(() => renderDoppia({ gabbia: gabbiaPerNome("Figura"), testo: "Lui è Luca." }), /ASSET_MANCANTE/);
  const html = renderDoppia({ gabbia: gabbiaPerNome("Figura"), figura: "luca.png", testo: "Lui è Luca." });
  assert.match(html, /src="luca\.png"/);
});

test("Coro reuses one scene through both crops", () => {
  const html = renderDoppia({ gabbia: gabbiaPerNome("Coro"), immagine: "scena.png", testo: "Prima frase. Seconda frase." });
  assert.equal((html.match(/src="scena\.png"/g) || []).length, 2);
});

test("foliation opens with cover, blank and the first story title", () => {
  const pages = costruisciLibro({
    storie: [{ slug: "prima", title: "Prima storia", pages: [{ key: "p1", text: "Testo" }] }],
    gabbieScelte: { p1: { gabbia: "Campo" } },
  });
  assert.deepEqual(pages.slice(0, 3).map((page) => page.tipo), ["copertina", "bianca", "frontespizio"]);
  assert.equal(pages[3].gabbia, "Campo");
  assert.equal(pages.totaleFacciate, 8);
});

test("each story in a multi-story book receives its own title page", () => {
  const pages = costruisciLibro({ storie: [{ title: "Uno" }, { title: "Due" }] });
  assert.equal(pages.filter((page) => page.tipo === "frontespizio").length, 2);
});
