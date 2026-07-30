#!/usr/bin/env python3
import argparse, json, re
from pathlib import Path

NAMES={"etto":"Etto","briciola":"Briciola","fiamma":"Fiamma","ulivo":"Ulivo","rubens":"Rubens"}

def text(root,ref):
    return (root/ref).read_text(encoding="utf-8").strip()

def path_for(story,choices):
    by={s["key"]:s for s in story["steps"]}
    key=story["start"]
    result=[]
    seen=set()
    while key:
        if key in seen: raise ValueError(f"Ciclo: {key}")
        seen.add(key)
        step=by[key]
        result.append(step)
        d=step.get("decision")
        if d and d.get("type")=="branch":
            selected=choices.get(d["key"])
            option=next((o for o in d["options"] if o["key"]==selected),None)
            if not option: raise ValueError(f"Scelta mancante: {d['key']}")
            key=option["next"]
        else:
            key=step.get("next")
    return result

def resolve(root,step,choices,name,helper):
    value=text(root,step["content_ref"])
    for setup_key,refs in (step.get("variant_refs") or {}).items():
        selected=choices.get(setup_key)
        replacement=text(root,refs[selected]) if selected in refs else ""
        value=value.replace(f"[VARIANTE:{setup_key}]",replacement)

    d=step.get("decision")
    if d and d.get("type")=="cast":
        entry=next((e for e in d.get("catalog_roster",[]) if e["key"]==helper),None)
        value=value.replace("[ENTRATA_AIUTANTE]",text(root,entry["entrance_ref"]) if entry else "")
    else:
        value=value.replace("[ENTRATA_AIUTANTE]","")

    value=value.replace("[Nome]",name).replace("[Aiutante]",NAMES.get(helper,helper))
    return value.strip()

def main():
    p=argparse.ArgumentParser()
    p.add_argument("story_json",type=Path)
    p.add_argument("--name",default="Lia")
    p.add_argument("--helper",required=True)
    p.add_argument("--choice",action="append",default=[])
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    story=json.loads(a.story_json.read_text(encoding="utf-8"))
    choices=dict(item.split("=",1) for item in a.choice)
    root=a.story_json.parent
    rendered="\n\n---\n\n".join(resolve(root,s,choices,a.name,a.helper) for s in path_for(story,choices))
    markers=sorted(set(re.findall(r"\[[A-Za-zÀ-ÿ_:]+\]",rendered)))
    if markers: raise SystemExit("Marker irrisolti: "+", ".join(markers))
    a.output.write_text(rendered+"\n",encoding="utf-8")

if __name__=="__main__":
    main()
