import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../backoffice.html',import.meta.url),'utf8');
const editor=await readFile(new URL('../backoffice-editor.html',import.meta.url),'utf8');

test('la shell usa la sessione Supabase e authoring-admin',()=>{
  assert.match(html,/client\.auth\.getSession\(\)/);
  assert.match(html,/client\.auth\.signInWithOtp/);
  assert.match(html,/functions\/v1\/authoring-admin/);
  assert.match(html,/Authorization:`Bearer \$\{state\.session\.access_token\}`/);
});

test('tutte le scritture editoriali passano dalla Edge Function',()=>{
  assert.match(html,/api\('\/projects',\{method:'POST'/);
  assert.match(html,/api\('\/versions',\{method:'POST'/);
  assert.doesNotMatch(html,/\.from\(['"]story_(?:projects|versions)['"]\)/);
  assert.doesNotMatch(html,/SERVICE_ROLE/);
});

test('la shell espone il primo workflow editoriale senza JSON',()=>{
  assert.match(html,/Progetti editoriali/);
  assert.match(html,/Nuova storia/);
  assert.match(html,/Crea nuova bozza/);
  assert.match(html,/Crea progetto e bozza v1/);
  assert.doesNotMatch(html,/<textarea[^>]+(?:json|source_story)/i);
});

test('la bozza apre l’editor tramite version id',()=>{
  assert.match(html,/backoffice-editor\.html\?version=/);
  assert.match(html,/encodeURIComponent\(versionId\)/);
});

test('l’editor carica e salva il bundle con controllo di revisione',()=>{
  assert.match(editor,/api\(`\/versions\/\$\{encodeURIComponent\(versionId\)\}`\)/);
  assert.match(editor,/expected_updated_at:state\.version\.updated_at/);
  assert.match(editor,/method:'PUT'/);
  assert.match(editor,/REVISION_CONFLICT/);
});

test('l’editor presenta metadati editoriali e mai JSON',()=>{
  for(const label of ['Titolo pubblico','Fascia d’età','Tono','Promessa narrativa','Sinossi editoriale']) assert.match(editor,new RegExp(label));
  assert.doesNotMatch(editor,/type=["']application\/json["']/);
  assert.doesNotMatch(editor,/SERVICE_ROLE/);
});

test('la validazione passa dalla funzione server-side',()=>{
  assert.match(editor,/`\/versions\/\$\{versionId\}\/validate`/);
  assert.match(editor,/method:'POST'/);
  assert.doesNotMatch(editor,/\.from\(['"]story_versions['"]\)/);
});
