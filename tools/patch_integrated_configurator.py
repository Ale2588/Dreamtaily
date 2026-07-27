#!/usr/bin/env python3
from pathlib import Path
import re
import shutil
import sys

INDEX = Path(sys.argv[1] if len(sys.argv) > 1 else "index.html")
BACKUP = INDEX.with_suffix(".before-configurator.html")

text = INDEX.read_text(encoding="utf-8")

required = [
    "async function startStoryComposer(story,bookStoryId)",
    "async function persistPathChoices()",
    "function getStoryProtagonistAssignment(bookStory)",
    "document.addEventListener('DOMContentLoaded'",
]
missing = [marker for marker in required if marker not in text]
if missing:
    raise SystemExit("PATCH BLOCCATA: punti attesi mancanti: " + ", ".join(missing))

if "dreamtaily-configurator-overlay" in text:
    print("PATCH GIÀ APPLICATA: nessuna modifica.")
    raise SystemExit(0)

css = '\n/* DreamTaily integrated story configurator */\n.dreamtaily-configurator-overlay{\n  position:fixed;inset:0;z-index:10000;background:#f3ead9;\n  display:grid;grid-template-rows:1fr\n}\n.dreamtaily-configurator-frame{\n  width:100%;height:100%;border:0;background:#f3ead9\n}\nbody.dreamtaily-configurator-open{overflow:hidden}\n@media (prefers-reduced-motion:reduce){\n  .dreamtaily-configurator-overlay{scroll-behavior:auto}\n}\n'
bridge = "\nfunction closeIntegratedStoryConfigurator(){\n  document.getElementById('dreamtaily-configurator-overlay')?.remove();\n  document.body.classList.remove('dreamtaily-configurator-open');\n}\n\nfunction openIntegratedStoryConfigurator({\n  story,\n  bookStoryId,\n  protagonistName,\n  protagonistImage\n}){\n  closeIntegratedStoryConfigurator();\n\n  const overlay=document.createElement('div');\n  overlay.id='dreamtaily-configurator-overlay';\n  overlay.className='dreamtaily-configurator-overlay';\n\n  const params=new URLSearchParams({\n    embedded:'1',\n    story:story?.id||story?.slug||'',\n    bookStoryId:bookStoryId||'',\n    protagonistName:protagonistName||'Il tuo personaggio',\n    protagonistImage:protagonistImage||''\n  });\n\n  const frame=document.createElement('iframe');\n  frame.className='dreamtaily-configurator-frame';\n  frame.title='Configura la storia';\n  frame.src=`configuratore.html?${params.toString()}`;\n  frame.setAttribute('allow','clipboard-write');\n\n  overlay.appendChild(frame);\n  document.body.appendChild(overlay);\n  document.body.classList.add('dreamtaily-configurator-open');\n}\n\nasync function persistIntegratedConfiguratorState(payload){\n  if(!payload?.bookStoryId||payload.bookStoryId!==app.activeBookStoryId) return;\n\n  const pathChoices={\n    ...(payload.setup||{}),\n    ...(payload.branch||{})\n  };\n\n  app.setupChoices={...(payload.setup||{})};\n  app.compositionChoices={...pathChoices};\n\n  const client=getSupabase();\n  const {error:pathError}=await client\n    .from('book_stories')\n    .update({\n      path_choices:pathChoices,\n      updated_at:new Date().toISOString()\n    })\n    .eq('id',payload.bookStoryId);\n\n  if(pathError) throw pathError;\n\n  if(payload.helperId){\n    const {error:helperError}=await client\n      .from('story_cast_assignments')\n      .upsert({\n        book_story_id:payload.bookStoryId,\n        slot_key:'helper',\n        character_asset_id:null,\n        catalog_character_id:payload.helperId\n      },{onConflict:'book_story_id,slot_key'});\n\n    if(helperError) throw helperError;\n  }else{\n    const {error:deleteError}=await client\n      .from('story_cast_assignments')\n      .delete()\n      .eq('book_story_id',payload.bookStoryId)\n      .eq('slot_key','helper');\n\n    if(deleteError) throw deleteError;\n  }\n}\n\nlet integratedConfiguratorSaveTimer=null;\nwindow.addEventListener('message',event=>{\n  if(event.origin!==location.origin) return;\n  const message=event.data||{};\n\n  if(message.type==='dreamtaily:configurator-state'){\n    clearTimeout(integratedConfiguratorSaveTimer);\n    integratedConfiguratorSaveTimer=setTimeout(async()=>{\n      try{\n        await persistIntegratedConfiguratorState(message);\n      }catch(error){\n        console.error('[DreamTaily] Configurator persistence error:',error);\n        alert('Non sono riuscito a salvare le scelte della storia.');\n      }\n    },180);\n    return;\n  }\n\n  if(message.type==='dreamtaily:configurator-close'){\n    closeIntegratedStoryConfigurator();\n    loadBookStories()\n      .then(()=>renderBookSummary())\n      .then(()=>showScreen('book'))\n      .catch(error=>{\n        console.error('[DreamTaily] Configurator close error:',error);\n        showScreen('stories');\n      });\n  }\n});\n\n"
new_start = "async function startStoryComposer(story,bookStoryId){\n  try{\n    const definition=await loadStoryDefinition(story);\n    app.activeStoryDefinition=definition;\n    app.activeBookStoryId=bookStoryId;\n\n    const current=app.bookStories.find(item=>item.id===bookStoryId);\n    app.compositionChoices={...(current?.path_choices||{})};\n    app.setupChoices={};\n\n    for(const item of definition.setup||[]){\n      if(app.compositionChoices[item.key]){\n        app.setupChoices[item.key]=app.compositionChoices[item.key];\n      }\n    }\n\n    await ensureBookCharactersHydrated();\n\n    const protagonist=getStoryProtagonistAssignment(current);\n    const savedCharacter=getSavedCharacterById(protagonist?.character_asset_id);\n    const protagonistName=savedCharacter?.name||value('name')||'Il tuo personaggio';\n    const protagonistImage=savedCharacter?.image_url||app.previewUrl||story.image||'';\n\n    openIntegratedStoryConfigurator({\n      story,\n      bookStoryId,\n      protagonistName,\n      protagonistImage\n    });\n  }catch(error){\n    console.error('[DreamTaily] Configurator start error:',error);\n    const detail=error?.message||'Errore sconosciuto';\n    showError(\n      'story-error',\n      `Non sono riuscito ad aprire il configuratore della storia: ${detail}`\n    );\n  }\n}"

if "</style>" not in text:
    raise SystemExit("PATCH BLOCCATA: </style> non trovato.")
text = text.replace("</style>", css + "\n</style>", 1)

marker = "async function startStoryComposer(story,bookStoryId)"
text = text.replace(marker, bridge + marker, 1)

pattern = re.compile(
    r"async function startStoryComposer\(story,bookStoryId\)\{.*?\}\n"
    r"function resolveEffectiveStart",
    re.S,
)
match = pattern.search(text)
if not match:
    raise SystemExit("PATCH BLOCCATA: funzione startStoryComposer non riconosciuta.")

text = text[:match.start()] + new_start + "\nfunction resolveEffectiveStart" + text[match.end():]

checks = [
    "openIntegratedStoryConfigurator({",
    "dreamtaily:configurator-state",
    "persistIntegratedConfiguratorState",
    "configuratore.html?",
    "async function continueWithStory()",
    "async function persistSelectedStory()",
]
failed = [item for item in checks if item not in text]
if failed:
    raise SystemExit("PATCH BLOCCATA: verifica finale fallita: " + ", ".join(failed))

shutil.copy2(INDEX, BACKUP)
INDEX.write_text(text, encoding="utf-8")
print(f"PATCH OK: {INDEX}")
print(f"BACKUP: {BACKUP}")
