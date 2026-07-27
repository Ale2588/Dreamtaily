#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

CANONICAL_POSES={"in_piedi","cammina","seduto","si_china","di_spalle"}
ALLOWED_ROLES={"protagonist","helper"}

def validate(path: Path):
    data=json.loads(path.read_text(encoding="utf-8"))
    story_root=path.parents[1]
    errors=[]
    warnings=[]

    setup_values={}
    # Pilot declares verified variants directly.
    for key,value in data.get("verified_repository_assets",{}).items():
        setup_values.setdefault("atmosfera",set()).add(key)
        asset=story_root/value
        if not asset.is_file():
            errors.append(f"asset verificato mancante: {value}")

    for step in data.get("steps",[]):
        scene=step.get("scene")
        if not scene:
            warnings.append(f"scene mancante: {step.get('key')}")
            continue

        background=scene.get("background_ref")
        if not background or not (story_root/background).is_file():
            errors.append(f"background mancante: {step.get('key')}/{background}")

        for variable,values in (scene.get("variant_backgrounds") or {}).items():
            expected=setup_values.get(variable,set())
            actual=set(values)
            for unknown in sorted(actual-expected):
                errors.append(f"variante sfondo sconosciuta: {step.get('key')}/{variable}/{unknown}")
            for value,ref in values.items():
                if not (story_root/ref).is_file():
                    errors.append(f"variant background mancante: {step.get('key')}/{ref}")

        for slot in scene.get("slots",[]):
            role=slot.get("role")
            pose=slot.get("pose")
            if role not in ALLOWED_ROLES:
                errors.append(f"role non valido: {step.get('key')}/{role}")
            if pose not in CANONICAL_POSES:
                errors.append(f"pose non valida: {step.get('key')}/{pose}")
            for field in ("x","y","scale"):
                value=slot.get(field)
                if not isinstance(value,(int,float)) or not 0<=value<=1:
                    errors.append(f"{field} fuori intervallo: {step.get('key')}/{role}/{value}")
            if not isinstance(slot.get("z"),(int,float)):
                errors.append(f"z non valido: {step.get('key')}/{role}")

    return errors,warnings

if __name__=="__main__":
    if len(sys.argv)!=2:
        print("Uso: python tools/validate_scene_pilot.py stories/.../scene-pilot.json")
        raise SystemExit(2)
    errors,warnings=validate(Path(sys.argv[1]))
    for item in warnings: print("WARNING:",item)
    for item in errors: print("ERROR:",item)
    print(f"Esito: {len(errors)} errori, {len(warnings)} warning")
    raise SystemExit(1 if errors else 0)
