import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html=fs.readFileSync(new URL("../index.html",import.meta.url),"utf8");

test("normalizza render_id del checkout prima di mostrare la CTA di generazione",()=>{
  assert.match(html,/dtPendingRender=\{\.\.\.job,id:job\.id\|\|job\.render_id\}/);
});

test("la schermata di stato non richiede un aggiornamento manuale",()=>{
  assert.doesNotMatch(html,/>Aggiorna stato<\/button>/);
});
