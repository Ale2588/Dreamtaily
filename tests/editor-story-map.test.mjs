import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const editor=await readFile(new URL('../backoffice-editor.html',import.meta.url),'utf8');

test('le pagine possono essere riordinate con drag and drop senza riscrivere i collegamenti',()=>{
  assert.match(editor,/data-page="\$\{esc\(step\.key\)\}" draggable="true"/);
  assert.match(editor,/function bindPageDragAndDrop\(\)/);
  assert.match(editor,/function reorderPage\(draggedKey,targetKey,after=false\)/);
  assert.match(editor,/steps\.forEach\(\(step,index\)=>step\.chapter=index\+1\)/);
  assert.doesNotMatch(editor,/reorderPage[\s\S]{0,500}(?:\.next\s*=|\.decision\s*=)/);
});

test('la mappa fissa deriva nodi e archi dal contratto narrativo',()=>{
  assert.match(editor,/id="story-map"/);
  assert.match(editor,/function storyEdges\(\)/);
  assert.match(editor,/step\.decision\?\.type==='branch'/);
  assert.match(editor,/function storyMapModel\(\)/);
  assert.match(editor,/function renderStoryMapInto\(container\)/);
});

test('la mappa si espande e permette di aprire una pagina',()=>{
  assert.match(editor,/id="story-map-dialog"/);
  assert.match(editor,/id="expand-story-map"/);
  assert.match(editor,/data-map-page=/);
  assert.match(editor,/state\.selectedPage=node\.dataset\.mapPage/);
  assert.match(editor,/data-section="pages"/);
});

test('l’editor inline conserva una sintassi JavaScript valida',()=>{
  const scripts=[...editor.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map(match=>match[1]).filter(Boolean);
  assert.ok(scripts.length);
  for(const source of scripts) assert.doesNotThrow(()=>new Function(source));
});
