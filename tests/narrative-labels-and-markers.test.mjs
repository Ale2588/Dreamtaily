import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const frontend=fs.readFileSync("index.html","utf8");
const editor=fs.readFileSync("backoffice-editor.html","utf8");

test("frontend renders the author label directly and never invents numbered options",()=>{
  assert.match(frontend,/dtReplaceName\(option\.label\)/);
  assert.doesNotMatch(frontend,/option\.label\s*\|\|\s*[`'\"]Opzione/);
});

test("page titles, decision prompts and option labels resolve story markers",()=>{
  assert.match(frontend,/dtReplaceName\(step\.title/);
  assert.match(frontend,/dtReplaceName\(decision\.prompt/);
  assert.match(frontend,/dtReplaceName\(option\.label\)/);
});

test("backoffice offers marker buttons for page titles and decision prompts",()=>{
  assert.match(editor,/inlineMarkerButtons\('page-title'\)/);
  assert.match(editor,/inlineMarkerButtons\('choice-prompt'\)/);
  assert.match(editor,/data-inline-marker/);
});

test("branch cards use authored labels and descriptions without legacy hardcodes",()=>{
  assert.match(editor,/data-option-description/);
  assert.match(editor,/\.description=input\.value/);
  assert.match(frontend,/function dtOptionDescription\(option\)/);
  assert.match(frontend,/option\?\.description/);
  assert.match(frontend,/destination\?\.composer_summary/);
  assert.doesNotMatch(frontend,/Questa scelta modifica il percorso del libro/);
});
