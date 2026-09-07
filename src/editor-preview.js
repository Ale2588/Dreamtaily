import {composeStory} from './story-composer.js';
import {enumerateStoryPreviewPaths} from './story-preview-paths.js';
import {renderBook} from './book-reader.js';

export function catalogOptions(slot, catalog) {
  if (!(slot.allowed_sources || []).includes('catalog_character')) return [];
  return Object.entries(catalog).filter(([id]) => !slot.allowed_catalog_ids?.length || slot.allowed_catalog_ids.includes(id));
}

export function composeEditorPreview(bundle, catalog, cast, pathIndex = 0) {
  const story = bundle.source_story;
  for (const slot of story.cast_slots || []) {
    const selected = cast[slot.key];
    if (!selected) throw new Error(`Scegli ${slot.label || slot.key}.`);
    if (selected.source === 'catalog_character') {
      if (!catalogOptions(slot, catalog).some(([id]) => id === selected.character_id)) throw new Error(`Personaggio non ammesso: ${slot.label || slot.key}.`);
    } else if (!(slot.allowed_sources || []).some(source => ['character_asset','user_character'].includes(source)) || !selected.name?.trim()) {
      throw new Error(`Inserisci un nome di prova ammesso per ${slot.label || slot.key}.`);
    }
  }
  const path = enumerateStoryPreviewPaths(story, 32)[pathIndex];
  if (!path) throw new Error('Nessun percorso completo disponibile. Controlla le destinazioni delle pagine.');
  for (const [key, selected] of Object.entries(cast)) {
    if (selected.source === 'user_character' && !selected.asset_ref && Object.values(bundle.source_scenes?.scenes || {}).some(scene => scene.slots?.some(slot => slot.role === key))) {
      throw new Error(`Carica un’immagine locale di prova per ${key}.`);
    }
  }
  const book = composeStory({story, scenes:bundle.source_scenes, contentByRef:bundle.content_by_ref, catalog,
    choices:{style:'papercut', protagonist:cast.protagonist, cast, branches:path.branches}});
  const resolve = ref => !ref || /^(https?:|blob:|data:|\/|assets\/)/.test(ref) ? ref : `stories/${story.slug}/${ref}`;
  for (const page of [...book.pages, ...(book.cover ? [book.cover] : [])]) {
    if (!page.scene) continue;
    page.scene.bg = resolve(page.scene.bg);
    for (const layer of page.scene.layers || []) layer.src = resolve(layer.src);
  }
  return book;
}

export function mountEditorPreview(controls, results, bundle, catalog) {
  controls.replaceChildren(); results.replaceChildren();
  let reader = null;
  const cast = {}, urls = [];
  const note = document.createElement('p');
  note.textContent = 'Anteprima senza IA. Il cast è solo di prova e non viene salvato: usa il catalogo oppure un nome e un’immagine locali. Per i personaggi presenti nelle scene è richiesta un’immagine. Massimo 32 percorsi.';
  controls.append(note);
  for (const slot of bundle.source_story.cast_slots || []) {
    const group = document.createElement('fieldset');
    const legend = document.createElement('legend'); legend.textContent = slot.label || slot.key; group.append(legend);
    const select = document.createElement('select'); select.append(new Option('Scegli un personaggio…',''));
    const allowsUser = (slot.allowed_sources || []).some(s=>['character_asset','user_character'].includes(s));
    if (allowsUser) select.append(new Option('Personaggio locale di prova','user'));
    for (const [id, character] of catalogOptions(slot,catalog)) select.append(new Option(character.name || id, `catalog:${id}`));
    const name = document.createElement('input'); name.placeholder = 'Nome del personaggio di prova'; name.setAttribute('aria-label','Nome di prova');
    const file = document.createElement('input'); file.type='file'; file.accept='image/png,image/jpeg,image/webp'; file.setAttribute('aria-label','Immagine locale di prova');
    name.hidden=file.hidden=true;
    select.setAttribute('aria-label',legend.textContent);
    select.onchange=()=>{
      name.hidden=file.hidden=select.value!=='user';
      delete cast[slot.key];
      if(select.value==='user') cast[slot.key]={source:'user_character',name:name.value,asset_ref:file.dataset.ref||null};
      else if(select.value.startsWith('catalog:')) {const id=select.value.slice(8);cast[slot.key]={source:'catalog_character',character_id:id,name:catalog[id].name};}
      results.textContent='Scelta cambiata: premi Mostra anteprima.';
    };
    name.oninput=()=>{if(cast[slot.key])cast[slot.key].name=name.value;};
    file.onchange=()=>{const f=file.files[0];if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>8000000){results.textContent='Usa PNG, JPG o WebP entro 8 MB.';return;}const ref=URL.createObjectURL(f);urls.push(ref);file.dataset.ref=ref;if(cast[slot.key])cast[slot.key].asset_ref=ref;};
    group.append(select,name,file);controls.append(group);
  }
  const paths=enumerateStoryPreviewPaths(bundle.source_story,32);
  const pathSelect=document.createElement('select'); pathSelect.setAttribute('aria-label','Percorso narrativo');
  paths.forEach((path,index)=>pathSelect.append(new Option(path.label,String(index)))); controls.append(pathSelect);
  const button=document.createElement('button');button.type='button';button.className='btn primary';button.textContent='Mostra anteprima';controls.append(button);
  button.onclick=()=>{try{const book=composeEditorPreview(bundle,catalog,cast,Number(pathSelect.value));reader?.destroy();reader=renderBook(results,book);}catch(error){reader?.destroy();reader=null;results.textContent=error.message;}};
  return ()=>{reader?.destroy();urls.forEach(url=>URL.revokeObjectURL(url));};
}
