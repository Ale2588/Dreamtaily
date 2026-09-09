import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";

const delivery=await readFile(new URL("../supabase/functions/deliver-book/index.ts",import.meta.url),"utf8");
const reader=await readFile(new URL("../libro.html",import.meta.url),"utf8");

test("delivery exposes frozen layout and story boundaries",()=>{
  assert.match(delivery,/book_story_id:p\.book_story_id/);
  assert.match(delivery,/story_slug:p\.story_slug/);
  assert.match(delivery,/layout:p\.layout/);
  assert.match(delivery,/createSignedUrls\(paths,SIGNED_SECONDS\)/);
});

test("final reader renders every story cover in sequence",()=>{
  assert.match(reader,/pages\.forEach\(page=>/);
  assert.match(reader,/const isCover=page\.kind==="cover"/);
  assert.doesNotMatch(reader,/pages\.find\(p=>p\.kind==="cover"\)/);
});

test("final reader applies the authored gabbia to narrative spreads",()=>{
  assert.match(reader,/renderDoppia/);
  assert.match(reader,/gabbiaPerNome\(page\.layout\.gabbia\)/);
  assert.match(reader,/specchiata:page\.layout\.specchiata===true/);
});
