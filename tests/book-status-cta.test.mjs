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

test("dopo il pagamento la generazione parte da sola con avanzamento reale",()=>{
  assert.match(html,/role="progressbar"/);
  assert.match(html,/Math\.round\(\(readyPages\/pages\.length\)\*100\)/);
  assert.match(html,/currentJob\.status==='queued'[\s\S]*queueMicrotask\(\(\)=>startDtFullRender\(\)\)/);
  assert.doesNotMatch(html,/>Genera il libro<\/button>/);
});

test("la schermata di attesa usa i personaggi del libro e messaggi narrativi",()=>{
  assert.match(html,/function dtGenerationCast\(\)/);
  assert.match(html,/Stiamo dando vita al tuo libro/);
  assert.match(html,/Prepariamo gli scenari e facciamo entrare i personaggi/);
  assert.match(html,/Riprendi la creazione/);
});
