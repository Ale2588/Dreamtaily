#!/usr/bin/env python3
import json,sys
from pathlib import Path

def validate(story_path):
 s=json.loads(Path(story_path).read_text(encoding="utf-8")); root=Path(story_path).parent; e=[]; w=[]; steps=s.get("steps",[]); setup=s.get("setup",[]); by={}; sk=set(); dk=set()
 if len(setup)>2:e.append("massimo 2 setup")
 if sum(x.get("type")=="branch" for x in setup)>1:e.append("massimo 1 setup branch")
 for x in setup:
  k=x.get("key")
  if not k:e.append("setup key mancante");continue
  if k in sk:e.append(f"setup key duplicata: {k}")
  sk.add(k)
  for o in x.get("options",[]):
   r=o.get("image_ref")
   if not r or not (root/r).is_file():e.append(f"asset setup mancante: {r}")
 for st in steps:
  k=st.get("key")
  if not k:e.append("step key mancante");continue
  if k in by:e.append(f"step key duplicata: {k}")
  by[k]=st
  content_ref=st.get("content_ref")
  if not content_ref or not (root/content_ref).is_file():e.append(f"content_ref mancante: {k}/{content_ref}")
  if not st.get("composer_summary"):w.append(f"composer_summary mancante: {k}")
  for vk,vals in (st.get("variant_refs") or {}).items():
   sd=next((x for x in setup if x.get("key")==vk),None)
   if not sd:e.append(f"setup variante inesistente: {vk}");continue
   if sd.get("type")!="variant":e.append(f"{vk} non è variant")
   expected={o.get("key") for o in sd.get("options",[])}
   for val in expected:
    if val not in vals:w.append(f"variante mancante: {k}/{vk}/{val}")
   for val,ref in vals.items():
    if val not in expected:e.append(f"variante sconosciuta: {k}/{vk}/{val}")
    if not (root/ref).is_file():e.append(f"file variante mancante: {ref}")
  d=st.get("decision")
  if not d:continue
  key=d.get("key")
  if key in sk:e.append(f"collisione setup/decision: {key}")
  if d.get("type")=="branch":
   if key in dk:e.append(f"decision key duplicata: {key}")
   dk.add(key)
   if any(o.get("next") is None for o in d.get("options",[])):e.append(f"branch decorativo: {key}")
  elif d.get("type")=="cast":
   for r in d.get("catalog_roster",[]):
    if not isinstance(r,dict) or not r.get("entrance_ref") or not (root/r.get("entrance_ref","")).is_file():e.append(f"entrance_ref mancante: {key}")
 if s.get("start") not in by:e.append(f"start inesistente: {s.get('start')}")
 for x in setup:
  if x.get("type")=="branch":
   for o in x.get("options",[]):
    if o.get("start") not in by:e.append(f"setup start inesistente: {x.get('key')}/{o.get('start')}")
 for st in steps:
  content_ref=st.get("content_ref")
  if st.get("next") and st["next"] not in by:e.append(f"next inesistente: {st.get('key')}/{st['next']}")
  d=st.get("decision")
  if d and d.get("type")=="branch":
   for o in d.get("options",[]):
    if o.get("next") and o["next"] not in by:e.append(f"option next inesistente: {d.get('key')}/{o.get('next')}")
  if d and d.get("type")=="cast" and content_ref and (root/content_ref).is_file() and "[ENTRATA_AIUTANTE]" not in (root/content_ref).read_text(encoding="utf-8"):w.append(f"marker entrata mancante: {st.get('key')}")
  for vk in (st.get("variant_refs") or {}):
   if content_ref and (root/content_ref).is_file() and f"[VARIANTE:{vk}]" not in (root/content_ref).read_text(encoding="utf-8"):w.append(f"marker variante mancante: {st.get('key')}/{vk}")
 starts={s.get("start")}|{o.get("start") for x in setup if x.get("type")=="branch" for o in x.get("options",[])}; reach=set(); stack=[x for x in starts if x in by]; terminal=False
 while stack:
  k=stack.pop()
  if k in reach:continue
  reach.add(k); st=by[k]; d=st.get("decision")
  targets=[o.get("next") for o in d.get("options",[]) if o.get("next")] if d and d.get("type")=="branch" else ([st.get("next")] if st.get("next") else [])
  if not targets:terminal=True
  stack += [x for x in targets if x in by]
 if not terminal:e.append("nessun finale raggiungibile")
 for k in by:
  if k not in reach:w.append(f"step irraggiungibile: {k}")
 for x in setup:
  if x.get("type")=="variant" and not any((st.get("variant_refs") or {}).get(x.get("key")) for st in steps):w.append(f"setup variant non usato: {x.get('key')}")
 return e,w

if __name__=="__main__":
 e,w=validate(Path(sys.argv[1])); [print("WARNING:",x) for x in w]; [print("ERROR:",x) for x in e]; print(f"Esito: {len(e)} errori, {len(w)} warning"); raise SystemExit(1 if e else 0)
