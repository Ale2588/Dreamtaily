import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const source=await readFile(new URL("../supabase/functions/render-book/index.ts",import.meta.url),"utf8");
const html=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("renderer accepts every composed story in book order",()=>{
  assert.doesNotMatch(source,/MVP_ONE_STORY_ONLY|MVP_STORY_NOT_SUPPORTED/);
  assert.match(source,/for\(const story of stories\)/);
  assert.match(source,/planMultiStoryRender/);
  assert.match(source,/position:story\.position/);
});

test("render pages are namespaced and retain their story context",()=>{
  assert.match(source,/page_id:`\$\{context\.book_story_id\}__\$\{page\.page_id\}`/);
  assert.match(source,/book_story_id:context\.book_story_id/);
  assert.match(source,/storyById\.get\(page\.book_story_id\)/);
});

test("each story uses its own protagonist reference",()=>{
  assert.match(source,/protagonistByStory\.set\(story\.book_story_id/);
  assert.match(source,/protagonistByStory\.get\(page\.book_story_id\)/);
});

test("completed stories persist their snapshots before checkout",()=>{
  const finish=html.match(/window\.finishStoryComposer=async function\(\)[\s\S]*?function dtBookSequence/)?.[0]||"";
  assert.match(finish,/await dtPersistContentSnapshot\(dtComposedBook\)/);
});
