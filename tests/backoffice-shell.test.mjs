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

test('gli slot dichiarano una sorgente senza introdurre un secondo modello',()=>{
  assert.match(editor,/Personaggi della storia/);
  assert.match(editor,/allowed_sources/);
  assert.match(editor,/character_asset/);
  assert.match(editor,/catalog_character/);
  assert.match(editor,/allowed_catalog_ids/);
  assert.doesNotMatch(editor,/story_cast_slots|StoryCastSlot/);
});

test('le pagine modificano direttamente gli step del contratto runtime',()=>{
  assert.match(editor,/story\(\)\.steps/);
  assert.match(editor,/content_ref:contentRef/);
  assert.match(editor,/source_scenes\.scenes\[key\]/);
  assert.match(editor,/Pagine e scelte/);
});

test('destinazioni e bivi si costruiscono solo da menu',()=>{
  assert.match(editor,/Cosa succede dopo\?/);
  assert.match(editor,/Chi legge compie una scelta/);
  assert.match(editor,/function destinations/);
  assert.match(editor,/data-option-next/);
  assert.match(editor,/uniqueOptionKey/);
  assert.doesNotMatch(editor,/data-option-key/);
  assert.doesNotMatch(editor,/next_page_key/);
});

test('la provenienza di una pagina è calcolata in sola lettura',()=>{
  assert.match(editor,/function predecessors/);
  assert.match(editor,/Da dove si arriva/);
  assert.match(editor,/class="readonly"/);
});

test('i testi sono salvati in content_by_ref e i marcatori arrivano da menu',()=>{
  assert.match(editor,/Testi della storia/);
  assert.match(editor,/state\.version\.content_by_ref\[ref\]/);
  assert.match(editor,/data-marker/);
  assert.match(editor,/\[PERSONAGGIO:\$\{slot\.key\}\]/);
  assert.match(editor,/insertAtCursor/);
});

test('ogni scena espone sfondo e prompt d’autore',()=>{
  assert.match(editor,/Scene illustrate/);
  assert.match(editor,/background_ref/);
  assert.match(editor,/environment_prompt/);
  assert.match(editor,/moment_prompt/);
  assert.match(editor,/Nota per l’illustratore/);
});

test('l’autore seleziona gli slot visibili senza coordinate grezze',()=>{
  assert.match(editor,/Chi compare nell’immagine/);
  assert.match(editor,/data-scene-slot/);
  assert.match(editor,/function automaticSlots/);
  assert.doesNotMatch(editor,/<label[^>]*>\s*(?:x|y|scale|z-index)\s*</i);
});

test('l’editor usa le strutture già consumate dal composer',()=>{
  assert.match(editor,/source_scenes\.scenes/);
  assert.match(editor,/content_by_ref/);
  assert.match(editor,/\[Nome\]/);
  assert.match(editor,/\[Aiutante\]/);
  assert.doesNotMatch(editor,/StoryPage|StoryAsset|StoryChoice/);
});
