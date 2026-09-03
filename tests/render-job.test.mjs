import test from "node:test";
import assert from "node:assert/strict";
import {allPagesReady, assertResolvedBook, planBookRender} from "../src/render-job.js";

const book={
  meta:{title:"Bosco",helper:"ulivo",style:"paper",choices:{setup:{}}},
  cover:{title:"Bosco",subtitle:"Un'avventura",scene:{bg:"cover.png",layers:[{role:"protagonist",pose:"in_piedi"}]}},
  pages:[
    {id:"p1",step_key:"s1",chapter:1,title:"La campanella",text:"Testo risolto.",scene:{bg:"s1.png",layers:[{role:"protagonist",pose:"in_piedi"}]}},
    {id:"p3",step_key:"s3_ruscello",chapter:3,title:"Impronte",text:"Incontra Ulivo.",scene:{bg:"s3.png",layers:[{role:"protagonist",pose:"in_piedi"},{role:"helper",character_id:"ulivo",pose:"cammina"}]}}
  ]
};

test("valid book",()=>assert.equal(assertResolvedBook(book),true));
test("markers rejected",()=>{
  const b=structuredClone(book); b.pages[0].text="[Nome] ascolta";
  assert.throws(()=>assertResolvedBook(b),/BOOK_HAS_UNRESOLVED_MARKERS/);
});
test("planner derives helper only from actual scene layer",()=>{
  const p=planBookRender(book);
  assert.equal(p.length,3);
  assert.equal(p[1].helper_id,null);
  assert.equal(p[2].helper_id,"ulivo");
  assert.equal(p[2].helper_pose,"cammina");
  assert.equal(p[2].style_id,"paper");
  assert.equal(Object.hasOwn(p[2],"atmosphere"),false);
});
test("legacy snapshot styles are safely pinned to the MVP style",()=>{
  const legacy=structuredClone(book);
  legacy.meta.style="water";
  assert.ok(planBookRender(legacy).every(page=>page.style_id==="paper"));
});
test("ready requires storage path",()=>{
  const p=planBookRender(book);
  assert.equal(allPagesReady(p),false);
  p.forEach(x=>{x.render.status="ready";x.render.generated_image_path=`r/${x.page_id}.png`;});
  assert.equal(allPagesReady(p),true);
});
