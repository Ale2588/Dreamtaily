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

test("printer export splits canonical spreads without changing their ratio",()=>{
  assert.match(reader,/function spreadLeaf\(page,side\)/);
  assert.match(reader,/print-spread-art print-\$\{side\}/);
  assert.match(reader,/\.print-spread-art\{[^}]*width:480mm;height:180mm/);
  assert.match(reader,/\.print-spread-art\.print-right\{left:-240mm\}/);
  assert.match(reader,/\.print-spread-art \.layout-card,.print-spread-art \.dtb-doppia\{width:480mm!important;height:180mm!important/);
  assert.match(reader,/while\(leaves\.length%4!==0\) leaves\.push\(blankLeaf\(\)\)/);
  assert.match(reader,/if\(leaves\.length%2===1\) leaves\.push\(blankLeaf\(\)\)/);
  assert.doesNotMatch(reader,/class="print-visual"/);
  assert.doesNotMatch(reader,/class="print-copy"/);
});

test("printer receives separate interior and wrap-cover PDFs",()=>{
  assert.match(reader,/PDF interni/);
  assert.match(reader,/PDF copertina/);
  assert.match(reader,/printDocument\(window\.dtPrintInterior\|\|"","240mm 180mm"\)/);
  assert.match(reader,/printDocument\(window\.dtPrintCover\|\|"","480mm 180mm"\)/);
  assert.match(reader,/print-cover-back/);
  assert.match(reader,/print-cover-front/);
});
