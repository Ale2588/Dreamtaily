import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');

function functionBody(name,nextName){
  const start=html.indexOf(name);
  const end=html.indexOf(nextName,start);
  assert.notEqual(start,-1,`${name} deve esistere`);
  assert.notEqual(end,-1,`${nextName} deve seguire ${name}`);
  return html.slice(start,end);
}

test('un nuovo libro non recupera implicitamente una bozza precedente',()=>{
  const body=functionBody('async function getOrCreateDraftBook()','async function loadBookStories()');
  assert.match(body,/if\(app\.bookId\)/);
  assert.match(body,/\.from\('books'\)[\s\S]*?\.insert\(/);
  assert.doesNotMatch(body,/\.eq\('status','draft'\)/);
  assert.doesNotMatch(body,/\.order\('updated_at'/);
});

test('scegliere o creare un personaggio azzera soltanto il contesto attivo',()=>{
  const savedCharacter=functionBody('function useSavedCharacter','function selectStory');
  const newlyCreated=functionBody('async function saveAndContinue','async function getSignedReferenceUrl');
  const reset=functionBody('function resetActiveBookState','window.dtOpenSavedBook');

  assert.match(savedCharacter,/window\.dtClearOnlyActiveBook\?\.\(\)/);
  assert.match(newlyCreated,/window\.dtClearOnlyActiveBook\?\.\(\)/);
  assert.match(reset,/app\.bookId=null/);
  assert.match(html,/window\.dtClearOnlyActiveBook=dtClearOnlyActiveBook/);
  assert.doesNotMatch(reset,/\.from\(["']books["']\)[\s\S]*?\.delete\(/);
});

test('iniziare un altro libro conserva i libri precedenti',()=>{
  const body=functionBody('window.startNewBook=async function','window.renderDtDelivered');
  assert.match(body,/resetActiveBookState\(\)/);
  assert.match(body,/openCharacterLibrary\(\)/);
  assert.doesNotMatch(body,/\.delete\(/);
  assert.doesNotMatch(html,/window\.deleteCurrentBookAndRestart/);
});

test('il duplicato resta vietato soltanto nel libro attivo',()=>{
  const body=functionBody('async function persistSelectedStory','async function continueWithStory');
  assert.match(body,/loadBookStories\(\)/);
  assert.match(body,/app\.bookStories\.find\(item=>item\.story_slug===story\.id\)/);
  assert.match(body,/STORY_ALREADY_IN_BOOK/);
});
