import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');

function bodyOf(signature, nextSignature) {
  const start = html.indexOf(signature);
  const end = html.indexOf(nextSignature, start + signature.length);
  assert.notEqual(start, -1, `${signature} must exist`);
  assert.notEqual(end, -1, `${nextSignature} must follow ${signature}`);
  return html.slice(start, end);
}

test('new character waits for catalog preparation before opening stories', () => {
  const body = bodyOf('async function saveAndContinue(){', 'async function getSignedReferenceUrl');
  assert.match(body, /await saveCharacter\(\)/);
  assert.match(body, /window\.dtClearOnlyActiveBook\?\.\(\)/);
  assert.match(body, /await prepareStories\(\)/);
  assert.match(body, /showScreen\('stories'\)/);
  assert.doesNotMatch(body, /resetActiveBookState\(\)/);
  assert.doesNotMatch(body, /setTimeout/);
});

test('saved character follows the same safe transition', () => {
  const body = bodyOf('async function useSavedCharacter(characterId){', 'let STORY_TEMPLATES = []');
  assert.match(body, /window\.dtClearOnlyActiveBook\?\.\(\)/);
  assert.match(body, /await prepareStories\(\)/);
  assert.match(body, /showScreen\('stories'\)/);
  assert.doesNotMatch(body, /resetActiveBookState\(\)/);
});

test('the private complete reset is exposed to the outer funnel', () => {
  assert.match(html, /window\.dtClearOnlyActiveBook=dtClearOnlyActiveBook;/);
});
