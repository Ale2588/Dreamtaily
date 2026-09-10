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

test("final reader overlays the authored front cover and DreamTaily brand",()=>{
  assert.match(delivery,/brand_variant:p\.brand_variant/);
  assert.match(reader,/gabbiaCopertinaPerNome\(page\.layout\.gabbia,"front"\)/);
  assert.match(reader,/renderCopertina/);
  assert.match(reader,/gabbie-copertina\.json/);
  assert.match(delivery,/format:p\.format/);
  assert.match(reader,/page\.page_id==="book__cover"\|\|page\.format==="portrait"/);
  assert.match(reader,/portrait:globalCover/);
});

test("reader logo links home and every DreamTaily logo is circular",()=>{
  assert.match(reader,/<a class="brand" href="index\.html">/);
  assert.match(reader,/\.brand img\{[^}]*border-radius:50%/);
});

test("PDF reuses the exact digital cover and spread renderers",()=>{
  assert.match(reader,/function printPage\(page,isCover=false\)/);
  assert.match(reader,/\$\{spread\(page,isCover\)\}/);
  assert.doesNotMatch(reader,/class="print-visual"/);
  assert.doesNotMatch(reader,/class="print-copy"/);
  assert.match(reader,/@page dt-cover\{size:A4 portrait/);
  assert.match(reader,/@page dt-spread\{size:A4 landscape/);
  assert.match(reader,/\.print-sheet\.dt-print-cover \.dtc-cover/);
  assert.match(reader,/\.print-sheet\.dt-print-spread \.dtb-doppia/);
});
