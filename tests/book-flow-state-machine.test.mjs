import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const checkoutMigration = await readFile(new URL('../supabase/migrations/20260903070036_finalize_book_checkout_v1.sql', import.meta.url), 'utf8');

function between(start, end) {
  const from = html.indexOf(start);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  const to = html.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return html.slice(from, to);
}

test('the flow explicitly distinguishes a new book from adding a story', () => {
  assert.match(html, /bookFlowMode:'new_book'/);
  const addStory = between('window.beginAddStory=async function(){', 'window.renderBookWorkspace=async function(){');
  assert.match(addStory, /app\.bookFlowMode='add_story'/);
  assert.doesNotMatch(addStory, /resetActiveBookState|dtClearOnlyActiveBook/);
  assert.match(addStory, /openCharacterLibrary\(\)/);
});

test('choosing a character preserves the active draft while adding a story', () => {
  const savedCharacter = between('async function useSavedCharacter(characterId){', 'function selectStory(');
  assert.match(savedCharacter, /if\(app\.bookFlowMode!=='add_story'\) window\.dtClearOnlyActiveBook\?\.\(\)/);
});

test('draft creation first recovers the existing draft for the profile', () => {
  const getDraft = between('async function getOrCreateDraftBook(){', 'async function loadBookStories(){');
  const lookup = getDraft.indexOf(".eq('status','draft')");
  const insert = getDraft.indexOf(".from('books')\n    .insert(");
  assert.ok(lookup >= 0, 'existing draft lookup is missing');
  assert.ok(insert > lookup, 'book insert must happen only after draft recovery');
  assert.match(getDraft, /app\.bookId=draft\.id/);
});

test('path persistence does not call a helper hidden in another script scope', () => {
  const choices = between('function dtCurrentPathChoices(){', 'function dtOpenStoryEntry(){');
  assert.doesNotMatch(choices, /dtHelperChoice/);
});

test('finishing one story returns to the book instead of opening checkout', () => {
  const reader = between('window.renderBookSummary=function(){', 'window.modifyDtBook=function(){');
  assert.match(reader, /Storia completata · Vai al libro/);
  assert.match(reader, /onclick="renderBookWorkspace\(\)"/);
  assert.doesNotMatch(reader, /onclick="openDtCheckout\(\)"/);
});

test('the book workspace owns add-story and checkout actions', () => {
  const workspace = between('window.renderBookWorkspace=async function(){', 'window.renderBookSummary=function(){');
  assert.match(workspace, /Aggiungi un’altra storia/);
  assert.match(workspace, /Concludi il libro e vai al checkout/);
  assert.match(workspace, /item\.status==='ready'/);
  assert.match(workspace, /item\.content_snapshot\?\.meta/);
});

test('checkout requires every story to be composed and complete', () => {
  const checkout = between('window.openDtCheckout=async function(){', 'window.updateDtPayButton=function(){');
  assert.match(checkout, /app\.bookStories\.every/);
  assert.match(checkout, /item\.status==='ready'/);
  assert.match(checkout, /Array\.isArray\(item\.content_snapshot\?\.pages\)/);
});

test('a completed book can be followed by a fresh draft', () => {
  assert.match(checkoutMigration, /set status = 'paid'/);
  const restart = between('window.startNewBook=async function(){', 'window.renderDtDelivered=function(){');
  assert.match(restart, /resetActiveBookState\(\)/);
  assert.match(restart, /app\.bookFlowMode='new_book'/);
});
