#!/usr/bin/env python3
"""Patches the current DreamTaily index.html without replacing the whole file."""

from pathlib import Path
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else "index.html")
text = path.read_text(encoding="utf-8")

helper = """function resolveStoryAssetRef(definition,ref){
  if(!ref) return '';
  if(/^(?:https?:|data:|blob:|\\/)/.test(ref)) return ref;
  return `stories/${definition.slug}/${ref}`;
}
"""

insert_before = "async function loadStoryDefinition(story){"
if "function resolveStoryAssetRef(" not in text:
    if insert_before not in text:
        raise SystemExit("Punto di inserimento helper non trovato.")
    text = text.replace(insert_before, helper + "\n" + insert_before, 1)

old_selected = "${escapeHtml(selectedOption.image_ref||'')}"
new_selected = "${escapeHtml(resolveStoryAssetRef(app.activeStoryDefinition,selectedOption.image_ref))}"
old_pool = "${escapeHtml(option.image_ref||'')}"
new_pool = "${escapeHtml(resolveStoryAssetRef(app.activeStoryDefinition,option.image_ref))}"

if old_selected in text:
    text = text.replace(old_selected, new_selected)
elif new_selected not in text:
    raise SystemExit("Riferimento immagine assegnata non trovato.")

if old_pool in text:
    text = text.replace(old_pool, new_pool)
elif new_pool not in text:
    raise SystemExit("Riferimento immagini opzioni non trovato.")

path.write_text(text, encoding="utf-8")
print(f"PATCH OK: {path}")
