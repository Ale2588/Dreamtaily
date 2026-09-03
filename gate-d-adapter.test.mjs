
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";

const source=fs.readFileSync("./story-validator.js","utf8");
const contract={
  story:{slug:"il-bosco-dei-sussurri",start:"s1",steps:[{key:"s1",content_ref:"chapters/s1.md",next:null}]},
  scenes:{scenes:{s1:{background_ref:"scenes/s1.png",slots:[]}}},
  contentByRef:{"chapters/s1.md":"# Test\\n\\n[Nome]"},
  catalog:{}
};
const calls=[];
const nativeFetch=async(url)=>{
  calls.push(String(url));
  if(String(url).includes("?slug=")){
    return new Response(JSON.stringify({slug:"il-bosco-dei-sussurri",version_number:3,contract}),{status:200});
  }
  return new Response(JSON.stringify({stories:[{
    slug:"il-bosco-dei-sussurri",title:"Il bosco",age:"4–8",tone:"x",
    description:"y",image:"z",length:"7",version:3
  }]}),{status:200});
};
const window={fetch:nativeFetch,location:{href:"https://example.test/Dreamtaily/index.html"}};
const context={window,globalThis:window,Response,URL,encodeURIComponent,decodeURIComponent,console,Set,Map,Object,Array,String,Boolean};
vm.createContext(context);
vm.runInContext(source,context);

let r=await window.fetch("stories/catalog.json"); assert.equal((await r.json())[0].slug,"il-bosco-dei-sussurri");
r=await window.fetch("stories/il-bosco-dei-sussurri/story.json"); assert.equal((await r.json()).start,"s1");
r=await window.fetch("stories/il-bosco-dei-sussurri/scene-pilot.json"); assert.ok((await r.json()).scenes.s1);
r=await window.fetch("stories/il-bosco-dei-sussurri/chapters/s1.md"); assert.equal(await r.text(),"# Test\\n\\n[Nome]");
assert.equal(calls.length,2); // catalog once + contract cached once
console.log("Gate D adapter tests: 4/4 PASS");
