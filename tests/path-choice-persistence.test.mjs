import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const html=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("path persistence recovers the active story from the current book",()=>{
  const block=html.match(/async function persistPathChoices\(\)[\s\S]*?function getCurrentComposerStep/)?.[0]||"";
  assert.match(block,/await loadBookStories\(\)/);
  assert.match(block,/item\.story_slug===app\.activeStoryDefinition\?\.slug/);
  assert.match(block,/app\.activeBookStoryId=bookStoryId/);
});

test("path persistence verifies that exactly one owned story was writable",()=>{
  const block=html.match(/async function persistPathChoices\(\)[\s\S]*?function getCurrentComposerStep/)?.[0]||"";
  assert.match(block,/method:"PATCH"/);
  assert.match(block,/Authorization:`Bearer \$\{accessToken\}`/);
  assert.match(block,/Prefer:"return=representation"/);
  assert.match(block,/ACTIVE_BOOK_STORY_NOT_WRITABLE/);
});

test("legacy atmosphere is excluded from persisted path choices",()=>{
  assert.match(html,/PATH_CHOICES_SAVE_FAILED/);
  assert.match(html,/\.filter\(item=>item\.key!==\"atmosfera\"\)/);
});
