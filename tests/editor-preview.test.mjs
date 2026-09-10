import test from 'node:test';
import assert from 'node:assert/strict';
import {composeEditorPreview,catalogOptions} from '../src/editor-preview.js';

const catalog={etto:{name:'Etto',image:'assets/etto.png'},macchia:{name:'Macchia',image:'assets/macchia.png'}};
const bundle={source_story:{slug:'test',title:'Prova',start:'a',cast_slots:[
  {key:'protagonist',label:'Protagonista',allowed_sources:['character_asset']},
  {key:'helper',label:'Compagno',allowed_sources:['catalog_character'],allowed_catalog_ids:['macchia']}
],steps:[{key:'a',title:'Cosa decide [Nome]?',content_ref:'a',decision:{key:'scelta',type:'branch',options:[{key:'uno',label:'Segui le impronte',next:'b'},{key:'due',label:'Resta vicino al sentiero',next:'c'}]}},{key:'b',content_ref:'b'},{key:'c',content_ref:'c'}]},
source_scenes:{scenes:Object.fromEntries(['a','b','c'].map(key=>[key,{background_ref:'scene.png',slots:[{role:'protagonist',pose:'in_piedi',x:.3,y:.9,scale:.4,z:1},{role:'helper',pose:'in_piedi',x:.7,y:.9,scale:.3,z:2}]}]))},
content_by_ref:{a:'[Nome] segue [Aiutante].',b:'Impronte',c:'Sentiero'}};
const cast={protagonist:{source:'user_character',name:'Luca',asset_ref:'blob:local'},helper:{source:'catalog_character',character_id:'macchia',name:'Macchia'}};
test('preview respects allowed catalog and requires explicit choices',()=>{
 assert.deepEqual(catalogOptions(bundle.source_story.cast_slots[1],catalog).map(([id])=>id),['macchia']);
 assert.throws(()=>composeEditorPreview(bundle,catalog,{}),/Scegli/);
 assert.throws(()=>composeEditorPreview(bundle,catalog,{...cast,helper:{source:'catalog_character',character_id:'etto'}}),/non ammesso/);
});
test('real composer preserves selected cast, markers, path and image layers without mutating draft',()=>{
 const before=JSON.stringify(bundle);
 const first=composeEditorPreview(bundle,catalog,cast,0),second=composeEditorPreview(bundle,catalog,cast,1);
 assert.equal(first.pages[0].title,'Cosa decide Luca?');
 assert.equal(first.pages[0].text,'Luca segue Macchia.');
 assert.equal(first.pages[1].text,'Impronte');assert.equal(second.pages[1].text,'Sentiero');
 assert.equal(first.pages[0].scene.layers[1].src,'assets/macchia.png');
 assert.equal(first.pages[0].scene.bg,'stories/test/scene.png');
 assert.equal(JSON.stringify(bundle),before);
});
test('preview requires local image for a visible user character',()=>{
 assert.throws(()=>composeEditorPreview(bundle,catalog,{...cast,protagonist:{source:'user_character',name:'Luca'}}),/immagine locale/);
});
