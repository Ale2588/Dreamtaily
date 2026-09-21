import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const checkoutMigration = await readFile(new URL('../supabase/migrations/20260903075239_finalize_book_checkout_v1.sql', import.meta.url), 'utf8');

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

test('editing the current story reopens the first narrative moment', () => {
  const edit = between('window.modifyDtBook=function(){', 'function dtChoiceLabel(');
  assert.match(edit, /dtTrailIndex=0/);
  assert.match(edit, /app\.currentStepKey=dtTrail\[0\]\|\|app\.activeStoryDefinition\?\.start\|\|null/);
  assert.doesNotMatch(edit, /dtTrail\.length-1/);
  assert.match(edit, /showScreen\("composer"\)/);
});

test('the book workspace owns add-story and checkout actions', () => {
  const workspace = between('window.renderBookWorkspace=async function(){', 'window.renderBookSummary=function(){');
  assert.match(workspace, /Come vuoi continuare il tuo libro/);
  assert.match(workspace, /Stesso protagonista/);
  assert.match(workspace, /Un altro personaggio/);
  assert.match(workspace, /Continua e genera il libro finale/);
  assert.match(workspace, /item\.status==='ready'/);
  assert.match(workspace, /item\.content_snapshot\?\.meta/);
});

test('the same-protagonist path keeps the active draft and skips character selection', () => {
  const flow = between('window.beginAddStoryWithSameProtagonist=async function(){', 'window.renderBookWorkspace=async function(){');
  assert.match(flow, /app\.bookFlowMode='add_story'/);
  assert.match(flow, /app\.characterAssetId=character\.id/);
  assert.match(flow, /app\.candidateCharacterAssetId=character\.id/);
  assert.match(flow, /await prepareStories\(\)/);
  assert.doesNotMatch(flow, /dtClearOnlyActiveBook|resetActiveBookState/);
});

test('the different-character path opens the dedicated character library', () => {
  const flow = between('window.beginAddStory=async function(){', 'function dtBookStoryCastNames(');
  assert.match(flow, /await openCharacterLibrary\(\)/);
  assert.doesNotMatch(flow, /scrollIntoView|character-library-heading/);
});

test('books and characters have separate library screens', () => {
  const books = between('<section class="screen books-screen" id="screen-books">', '<section class="screen library-screen" id="screen-library">');
  const characters = between('<section class="screen library-screen" id="screen-library">', '<section class="screen stories-screen" id="screen-stories">');
  assert.match(books, /id="saved-books-grid"/);
  assert.doesNotMatch(books, /id="character-library-grid"/);
  assert.match(characters, /id="character-library-grid"/);
  assert.doesNotMatch(characters, /id="saved-books-grid"/);
  const openBooks = between('async function openBookLibrary(){', 'function applyCharacterToForm');
  assert.match(openBooks, /showScreen\('books'\)/);
  assert.match(openBooks, /window\.dtLoadSavedBooks\(\)/);
  assert.doesNotMatch(openBooks, /loadSavedCharacters\(\)/);
  const openCharacters = between('async function openCharacterLibrary(){', 'async function openBookLibrary(){');
  assert.match(openCharacters, /showScreen\('library'\)/);
  assert.match(openCharacters, /loadSavedCharacters\(\)/);
  assert.doesNotMatch(openCharacters, /dtLoadSavedBooks\(\)/);
  assert.match(html, /window\.dtLoadSavedBooks=dtLoadSavedBooks/);
});

test('an in-progress multi-story book stays visible throughout composition', () => {
  assert.match(html, /id="dt-book-context"/);
  assert.match(html, /Il tuo libro in corso/);
  assert.match(html, /Vedi riepilogo/);
  const context = between('function renderDtBookContext(screenName=null){', 'window.beginAddStoryWithSameProtagonist=async function(){');
  assert.match(context, /\['library','stories','setup','composer','wow','creator'\]/);
  assert.match(context, /app\.bookId&&app\.bookStories\.length/);
  assert.match(context, /flatMap\(dtBookStoryCastNames\)/);
  assert.match(context, /storia già inserita/);
  assert.match(context, /Cast:/);
  assert.match(html, /window\.renderDtBookContext\?\.\(name\)/);
  assert.match(context, /window\.renderDtBookContext=renderDtBookContext/);
  assert.match(html, /onclick="renderBookWorkspace\(\)"/);
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
