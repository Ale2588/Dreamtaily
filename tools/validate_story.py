#!/usr/bin/env python3
import json, sys
from pathlib import Path

def validate(story_path: Path):
    story=json.loads(story_path.read_text(encoding="utf-8"))
    root=story_path.parent
    errors=[]
    warnings=[]
    steps=story.get("steps",[])
    by_key={}
    decision_keys=set()

    for i,step in enumerate(steps):
        key=step.get("key")
        if not key:
            errors.append(f"steps[{i}]: key mancante")
            continue
        if key in by_key:
            errors.append(f"step key duplicata: {key}")
        by_key[key]=step

        ref=step.get("content_ref")
        if not ref:
            errors.append(f"{key}: content_ref mancante")
        elif not (root/ref).is_file():
            errors.append(f"{key}: file mancante {ref}")

        if not step.get("composer_summary"):
            warnings.append(f"{key}: composer_summary mancante")

        d=step.get("decision")
        if not d:
            continue
        dk=d.get("key")
        if not dk:
            errors.append(f"{key}: decision key mancante")
        elif d.get("type")=="branch" and dk in decision_keys:
            errors.append(f"decision key duplicata: {dk}")
        elif d.get("type")=="branch":
            decision_keys.add(dk)

        if d.get("type")=="branch":
            for option in d.get("options",[]):
                if not option.get("next"):
                    errors.append(f"{dk}/{option.get('key')}: un finale deve puntare a un passo reale")
        elif d.get("type")=="cast":
            if d.get("catalog_roster") and "catalog_character" not in d.get("allowed_sources",[]):
                warnings.append(f"{dk}: roster presente ma catalog_character non ammesso")
            for entry in d.get("catalog_roster",[]):
                if not isinstance(entry,dict) or not entry.get("key") or not entry.get("entrance_ref"):
                    errors.append(f"{dk}: voce roster incompleta")
                elif not (root/entry["entrance_ref"]).is_file():
                    errors.append(f"{dk}/{entry.get('key')}: entrance_ref mancante {entry['entrance_ref']}")
        else:
            errors.append(f"{key}: tipo decisione non valido")

    start=story.get("start")
    if start not in by_key:
        errors.append(f"start inesistente: {start}")

    for step in steps:
        if step.get("next") and step["next"] not in by_key:
            errors.append(f"{step.get('key')}: next inesistente {step['next']}")
        d=step.get("decision")
        if d and d.get("type")=="branch":
            for option in d.get("options",[]):
                if option.get("next") and option["next"] not in by_key:
                    errors.append(f"{d.get('key')}/{option.get('key')}: next inesistente {option['next']}")

    reachable=set()
    stack=[start] if start in by_key else []
    terminal=False
    while stack:
        key=stack.pop()
        if key in reachable: continue
        reachable.add(key)
        step=by_key[key]
        d=step.get("decision")
        if d and d.get("type")=="branch":
            targets=[o.get("next") for o in d.get("options",[]) if o.get("next")]
        else:
            targets=[step.get("next")] if step.get("next") else []
        if not targets: terminal=True
        stack.extend(t for t in targets if t in by_key)
    if not terminal:
        errors.append("nessun finale raggiungibile")
    for key in by_key:
        if key not in reachable:
            warnings.append(f"step irraggiungibile: {key}")

    return errors,warnings

if __name__=="__main__":
    if len(sys.argv)<2:
        print("Uso: python validate_story.py stories/<slug>/story.json")
        raise SystemExit(2)
    errors,warnings=validate(Path(sys.argv[1]))
    for w in warnings: print("WARNING:",w)
    for e in errors: print("ERROR:",e)
    print(f"Esito: {len(errors)} errori, {len(warnings)} warning")
    raise SystemExit(1 if errors else 0)
