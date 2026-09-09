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

test("each page resolves every planned character from its frozen story cast",()=>{
  assert.match(source,/async function characterInputs\(page:any,story:any\)/);
  assert.match(source,/story\.cast\|\|\[\]/);
  assert.match(source,/entry\.slot_key===item\.slot_key/);
  assert.match(source,/characters:cast\.map/);
  assert.doesNotMatch(source,/protagonistByStory/);
});

test("the image API receives one background followed by all character references",()=>{
  assert.match(source,/\.\.\.cast\.map\(\(item:any\)=>item\.blob\)/);
  assert.match(source,/`character-\$\{i\}\.png`/);
  assert.match(source,/compiled_prompt:prompt/);
});

test("pilot mode generates at most one illustration per invocation",()=>{
  assert.match(source,/const MAX_CONCURRENCY = 1/);
  assert.match(source,/\.slice\(0,MAX_CONCURRENCY\)/);
});

test("pilot mode validates a narrative spread before the cover",()=>{
  assert.match(source,/firstNarrative=candidates\.find/);
  assert.match(source,/page\.kind==="page"/);
  assert.match(source,/firstNarrative\?\[firstNarrative\]:candidates/);
});

test("completed stories persist their snapshots before checkout",()=>{
  const finish=html.match(/window\.finishStoryComposer=async function\(\)[\s\S]*?function dtBookSequence/)?.[0]||"";
  assert.match(finish,/await dtPersistContentSnapshot\(dtComposedBook\)/);
});
