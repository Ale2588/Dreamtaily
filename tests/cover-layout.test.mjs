import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {gabbieCopertina, gabbiaCopertinaPerNome, inizializzaGabbieCopertina, renderCopertina, stiliCopertina, validaSceltaCopertina} from "../src/book/cover-layout.js";

const raw=await readFile(new URL("../src/book/gabbie-copertina.json",import.meta.url),"utf8");
const catalog=inizializzaGabbieCopertina(raw);

test("canonical cover catalog is version two with three front and two back layouts",()=>{
  assert.equal(catalog.versione,2);
  assert.equal(gabbieCopertina("front").length,3);
  assert.equal(gabbieCopertina("back").length,2);
});

test("front cover requires layout, texts and authored scene prompts",()=>{
  const story={title:"Bosco",editorial:{book_cover:{front:{title:"Bosco",subtitle:"Per Lia",layout:null}}}};
  const codes=validaSceltaCopertina({story,scenes:{cover:{environment_prompt:"",moment_prompt:""}}}).map(item=>item.code);
  assert.deepEqual(codes,["COVER_LAYOUT_REQUIRED","COVER_ENVIRONMENT_REQUIRED","COVER_MOMENT_REQUIRED"]);
});

test("renderer overlays title and deterministic DreamTaily brand",()=>{
  const html=renderCopertina({gabbia:gabbiaCopertinaPerNome("Ritratto","front"),image:"cover.png",title:"Il bosco",subtitle:"Un’avventura di Lia",portrait:true});
  assert.match(html,/data-cover-layout="Ritratto"/);
  assert.match(html,/src="cover\.png"/);
  assert.match(html,/Il bosco/);
  assert.match(html,/DreamTaily/);
  assert.match(html,/assets\/brand\/dreamtaily-icon\.png/);
  assert.match(html,/data-cover-format="portrait"/);
  assert.match(stiliCopertina,/aspect-ratio:2\/3/);
  assert.match(stiliCopertina,/font-size:clamp\(34px,10cqw,72px\)/);
  assert.match(stiliCopertina,/border-radius:50%/);
});

test("every required typographic area remains in the canonical safe box",()=>{
  const safe=catalog.sistema_di_misura.safe_box;
  for(const layout of catalog.gabbie){
    for(const key of ["title_area","subtitle_area","description_area","brand_area","technical_area","panel_area"]){
      const area=layout[key]; if(!area)continue;
      assert.ok(area.x>=safe.x&&area.y>=safe.y&&area.x+area.w<=safe.x+safe.w&&area.y+area.h<=safe.y+safe.h,`${layout.nome}.${key}`);
    }
  }
});
