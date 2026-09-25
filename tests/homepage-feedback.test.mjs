import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");

test("homepage removes the annotated draft notes and resume CTA", () => {
  assert.doesNotMatch(homepage, /tav\. i — stile carta ritagliata/i);
  assert.doesNotMatch(homepage, /tutti i personaggi stanno sulla stessa linea/i);
  assert.doesNotMatch(homepage, /tre passi, tre stili/i);
  assert.doesNotMatch(homepage, /id="resume-book-btn"/);
});

test("reveal links to characters only when at least one saved character exists", () => {
  assert.match(homepage, /id="dth-characters-link"[^>]+onclick="openCharacterLibrary\(\)" disabled>Vai ai tuoi personaggi/);
  assert.match(homepage, /function updateRevealCharactersCta\(enabled\)/);
  assert.match(homepage, /\.from\('character_assets'\)\.select\('id'\)\.eq\('status','ready'\)\.limit\(1\)/);
  assert.match(homepage, /updateRevealCharactersCta\(Boolean\(data\?\.length\)\)/);
  assert.doesNotMatch(homepage, /rivedi il momento/i);
});

test("closing assurance explains that multiple characters are supported", () => {
  assert.match(homepage, /<span>Puoi creare più personaggi per le tue storie\.<\/span>/);
  assert.doesNotMatch(homepage, /La foto serve solo a creare il personaggio/);
});
