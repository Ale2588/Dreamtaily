const FRONT_LAYOUTS=Object.freeze({
  Ritratto:{max_title:44,prompt_layout_instruction:"Single coherent full-bleed 4:3 scene. Place the unique protagonists centred in the middle band, facing the viewer, with heads below the upper third. Keep the top third and bottom strip calm, uncluttered and free of faces or key details."},
  Margine:{max_title:38,prompt_layout_instruction:"Single coherent full-bleed 4:3 scene. Place every unique protagonist in the right half, safely inside the frame, leaving the left half as quiet negative space with no faces or readable detail."},
  Pannello:{max_title:42,prompt_layout_instruction:"Single coherent full-bleed 4:3 scene. Place every unique protagonist in the upper half at medium distance. Keep the lower half simple and even in tone, with no faces or essential details."}
});
const PALETTE=Object.freeze({
  cream:{label:"Crema",hex:"#FDF8F0",asset_ref:"https://raw.githubusercontent.com/Ale2588/Dreamtaily/scaffolding/assets/book-cover/cream.png",brand_variant:"dark"},
  coral:{label:"Corallo",hex:"#E8735A",asset_ref:"https://raw.githubusercontent.com/Ale2588/Dreamtaily/scaffolding/assets/book-cover/coral.png",brand_variant:"light"},
  teal:{label:"Teal",hex:"#5B9EA0",asset_ref:"https://raw.githubusercontent.com/Ale2588/Dreamtaily/scaffolding/assets/book-cover/teal.png",brand_variant:"light"},
  gold:{label:"Oro",hex:"#F2C14E",asset_ref:"https://raw.githubusercontent.com/Ale2588/Dreamtaily/scaffolding/assets/book-cover/gold.png",brand_variant:"dark"}
});
const clone=value=>value==null?value:JSON.parse(JSON.stringify(value));
export const bookCoverLayouts=Object.freeze(Object.keys(FRONT_LAYOUTS));
export const bookCoverPalette=Object.freeze(Object.entries(PALETTE).map(([id,value])=>({id,...value})));
export function bookCoverLayout(name){const value=FRONT_LAYOUTS[String(name||"")];return value?{name:String(name),...value}:null}
export function bookCoverColor(id){const value=PALETTE[String(id||"")];return value?{id:String(id),...value}:null}
export function uniqueBookProtagonists(stories=[]){
  const unique=new Map();
  for(const story of stories){const item=(story.cast||[]).find(entry=>entry.slot_key==="protagonist");if(item?.character_asset_id&&item.character&&!unique.has(item.character_asset_id))unique.set(item.character_asset_id,clone(item))}
  return [...unique.values()];
}
export function validateBookCoverSelection(selection,stories=[]){
  const errors=[],layout=bookCoverLayout(selection?.gabbia),color=bookCoverColor(selection?.color_id),characters=uniqueBookProtagonists(stories),title=String(selection?.title||"").trim();
  if(!layout)errors.push({code:"BOOK_COVER_LAYOUT_REQUIRED"});if(!color)errors.push({code:"BOOK_COVER_COLOR_REQUIRED"});if(!characters.length)errors.push({code:"BOOK_COVER_PROTAGONIST_REQUIRED"});if(!title)errors.push({code:"BOOK_COVER_TITLE_REQUIRED"});if(layout&&title.length>layout.max_title)errors.push({code:"BOOK_COVER_TITLE_OVERFLOW",max:layout.max_title});return errors;
}
export function buildBookCover({selection,book,stories}){
  const errors=validateBookCoverSelection(selection,stories);if(errors.length)throw new Error(errors[0].code);
  const layout=bookCoverLayout(selection.gabbia),color=bookCoverColor(selection.color_id),characters=uniqueBookProtagonists(stories);
  return {title:String(selection.title||book?.title||"").trim(),subtitle:"",layout:{gabbia:layout.name,catalog_version:2,prompt_layout_instruction:layout.prompt_layout_instruction},brand_variant:color.brand_variant,color:{id:color.id,label:color.label,hex:color.hex},characters:characters.map((item,index)=>({slot_key:`cover_protagonist_${index+1}`,character_asset_id:item.character_asset_id,character:clone(item.character)})),scene:{bg:color.asset_ref,wash:null,prompt_environment:`A neutral timeless DreamTaily paper-cut setting based on ${color.label.toLowerCase()} ${color.hex}; soft layered paper shapes, gentle depth, no location or object from any individual story.`,prompt_moment:`Show exactly ${characters.length} unique protagonist${characters.length===1?"":"s"} together in a warm balanced group portrait. Never duplicate a character.`,authoring_note:"Only the supplied unique protagonists may appear. No secondary characters, story-specific scenery, letters, words, logos or typography.",layers:[]}};
}
