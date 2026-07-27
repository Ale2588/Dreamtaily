#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCENES = ROOT / "stories" / "il-bosco-dei-sussurri" / "scene-pilot.json"

POSES = {"in_piedi", "cammina", "seduto", "si_china", "di_spalle"}
ROLES = {"protagonist", "helper"}
EXPECTED = {
    "s1", "s2", "s3_felci", "s3_ruscello", "s4_felci",
    "s4_ruscello", "s4", "s5", "s6_promessa", "s6_festa"
}

data = json.loads(SCENES.read_text(encoding="utf-8"))
scenes = data.get("scenes", {})
errors = []

if set(scenes) != EXPECTED:
    errors.append(f"scene ids: expected {sorted(EXPECTED)}, found {sorted(scenes)}")

for scene_id, scene in scenes.items():
    if scene.get("scene_id") != scene_id:
        errors.append(f"{scene_id}: scene_id mismatch")
    if not scene.get("background_ref"):
        errors.append(f"{scene_id}: background_ref missing")

    protagonist_count = 0
    for index, slot in enumerate(scene.get("slots", [])):
        role = slot.get("role")
        pose = slot.get("pose")
        if role not in ROLES:
            errors.append(f"{scene_id}.slots[{index}]: invalid role {role!r}")
        if pose not in POSES:
            errors.append(f"{scene_id}.slots[{index}]: invalid pose {pose!r}")
        if role == "protagonist":
            protagonist_count += 1
            if pose != "in_piedi":
                errors.append(f"{scene_id}: MVP protagonist pose must be in_piedi")

        for field in ("x", "y", "scale"):
            value = slot.get(field)
            if not isinstance(value, (int, float)) or not 0 <= value <= 1:
                errors.append(f"{scene_id}.slots[{index}].{field}: must be 0..1")

        z = slot.get("z")
        if not isinstance(z, int):
            errors.append(f"{scene_id}.slots[{index}].z: must be integer")

    if protagonist_count != 1:
        errors.append(f"{scene_id}: expected exactly one protagonist slot")

if errors:
    print("SCENE VALIDATION FAILED")
    for error in errors:
        print("-", error)
    raise SystemExit(1)

print(f"SCENE VALIDATION OK: {len(scenes)} narrative scenes + cover")
