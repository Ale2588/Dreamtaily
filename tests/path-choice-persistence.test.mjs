import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("path persistence recovers the active story from the current book",()=>{
  const block=html.match(/async function persistPathChoices\(\)[\s\S]*?async function advanceSetup/)?.[0]||"";
  assert.match(block,/await loadBookStories\(\)/);
  assert.match(block,/item\.story_slug===app\.activeStoryDefinition\?\.slug/);
  assert.match(block,/app\.activeBookStoryId=bookStoryId/);
});

test("path persistence verifies that exactly one owned story was writable",()=>{
  const block=html.match(/async function persistPathChoices\(\)[\s\S]*?async function advanceSetup/)?.[0]||"";
  assert.match(block,/\.select\("id"\)/);
  assert.match(block,/ACTIVE_BOOK_STORY_NOT_WRITABLE/);
});
