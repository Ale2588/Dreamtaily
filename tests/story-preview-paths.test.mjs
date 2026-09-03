import test from "node:test";
import assert from "node:assert/strict";
import { enumerateStoryPreviewPaths } from "../src/story-preview-paths.js";

test("enumerates every reachable branch path with readable labels", () => {
  const story={start:"s1",steps:[
    {key:"s1",decision:{type:"branch",key:"sentiero",options:[
      {key:"felci",label:"Tra le felci",next:"s2"},
      {key:"ruscello",label:"Lungo il ruscello",next:"s3"}
    ]}},
    {key:"s2",next:null},
    {key:"s3",decision:{type:"branch",key:"finale",options:[
      {key:"casa",label:"Torna a casa",next:null},
      {key:"festa",label:"Fa festa",next:null}
    ]}}
  ]};
  assert.deepEqual(enumerateStoryPreviewPaths(story),[
    {branches:{sentiero:"felci"},label:"Tra le felci"},
    {branches:{sentiero:"ruscello",finale:"casa"},label:"Lungo il ruscello · Torna a casa"},
    {branches:{sentiero:"ruscello",finale:"festa"},label:"Lungo il ruscello · Fa festa"}
  ]);
});

test("caps preview expansion",()=>{
  const story={start:"s1",steps:[{key:"s1",decision:{type:"branch",key:"x",options:[
    {key:"a",next:null},{key:"b",next:null},{key:"c",next:null}
  ]}}]};
  assert.equal(enumerateStoryPreviewPaths(story,2).length,2);
});
