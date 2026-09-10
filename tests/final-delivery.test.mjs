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

test("printer export keeps every sheet horizontal and preserves canonical spreads",()=>{
  assert.match(reader,/\.print-book-spread\{[^}]*width:480mm;height:180mm/);
  assert.match(reader,/\.print-full-spread \.layout-card,.print-full-spread \.dtb-doppia\{width:480mm!important;height:180mm!important/);
  assert.match(reader,/function buildUnifiedPrint\(pages\)/);
  assert.match(reader,/print-story-title/);
  assert.doesNotMatch(reader,/class="print-visual"/);
  assert.doesNotMatch(reader,/class="print-copy"/);
});

test("printer receives one unified horizontal PDF",()=>{
  assert.match(reader,/Scarica PDF del libro/);
  assert.doesNotMatch(reader,/PDF interni/);
  assert.doesNotMatch(reader,/PDF copertina/);
  assert.match(reader,/printDocument\(window\.dtPrintBook\|\|"","480mm 180mm"\)/);
  assert.match(reader,/print-cover-back/);
  assert.match(reader,/print-cover-front/);
});

test("printing waits for fonts and fully decoded images",()=>{
  assert.match(reader,/await document\.fonts\.ready/);
  assert.match(reader,/if\(img\.decode\) await img\.decode\(\)/);
  assert.match(reader,/if\(!img\.naturalWidth\) throw new Error\("PRINT_IMAGE_MISSING"\)/);
  assert.match(reader,/requestAnimationFrame\(\(\)=>requestAnimationFrame\(resolve\)\)/);
});
