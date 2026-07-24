#!/usr/bin/env python3
"""Validatore editoriale e strutturale DreamTaily Story Schema v2."""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any

SEMANTIC_LEXICONS = {
    "atmosfera": {
        "notte", "nottata", "luna", "lunare", "stelle", "stellato",
        "alba", "tramonto", "sera", "serale", "buio", "scuro",
        "schiariva", "schiarirsi", "sole", "dorata", "crepuscolo"
    }
}

MARKER_RE = re.compile(r"\[[A-Za-zÀ-ÿ0-9_:.-]+\]")
WORD_RE = re.compile(r"[A-Za-zÀ-ÿ']+")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def read_if_file(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.is_file() else ""


def validate(story_path: Path) -> tuple[list[str], list[str]]:
    story_path = Path(story_path)
    story = load_json(story_path)
    root = story_path.parent

    errors: list[str] = []
    warnings: list[str] = []

    steps = story.get("steps", [])
    setup = story.get("setup", [])

    if not isinstance(steps, list) or not steps:
        errors.append("steps deve contenere almeno un passo")
        steps = []

    if not isinstance(setup, list):
        errors.append("setup deve essere un array")
        setup = []

    if len(setup) > 2:
        errors.append("massimo 2 setup")

    if sum(item.get("type") == "branch" for item in setup if isinstance(item, dict)) > 1:
        errors.append("massimo 1 setup branch")

    setup_keys: set[str] = set()
    setup_by_key: dict[str, dict[str, Any]] = {}
    decision_keys: set[str] = set()
    steps_by_key: dict[str, dict[str, Any]] = {}

    # Setup.
    for item in setup:
        if not isinstance(item, dict):
            errors.append("setup non valido")
            continue

        key = item.get("key")
        if not key:
            errors.append("setup key mancante")
            continue
        if key in setup_keys:
            errors.append(f"setup key duplicata: {key}")
        setup_keys.add(key)
        setup_by_key[key] = item

        option_keys = [option.get("key") for option in item.get("options", []) if isinstance(option, dict)]
        duplicates = [value for value, count in Counter(option_keys).items() if value and count > 1]
        for value in duplicates:
            errors.append(f"setup option key duplicata: {key}/{value}")

        for option in item.get("options", []):
            if not isinstance(option, dict):
                errors.append(f"setup option non valida: {key}")
                continue

            image_ref = option.get("image_ref")
            if not image_ref or not (root / image_ref).is_file():
                errors.append(f"asset setup mancante: {key}/{image_ref}")

            if item.get("type") == "branch":
                start = option.get("start")
                if not start:
                    errors.append(f"setup branch start mancante: {key}/{option.get('key')}")

    # Steps and decisions.
    actual_decision_count = 0
    for step in steps:
        if not isinstance(step, dict):
            errors.append("step non valido")
            continue

        key = step.get("key")
        if not key:
            errors.append("step key mancante")
            continue
        if key in steps_by_key:
            errors.append(f"step key duplicata: {key}")
        steps_by_key[key] = step

        content_ref = step.get("content_ref")
        content_path = root / str(content_ref or "")
        if not content_ref or not content_path.is_file():
            errors.append(f"content_ref mancante: {key}/{content_ref}")

        if not step.get("composer_summary"):
            warnings.append(f"composer_summary mancante: {key}")

        decision = step.get("decision")
        if decision:
            actual_decision_count += 1
            decision_key = decision.get("key")
            if not decision_key:
                errors.append(f"decision key mancante: {key}")
            elif decision_key in setup_keys:
                errors.append(f"collisione setup/decision: {decision_key}")
            elif decision_key in decision_keys:
                errors.append(f"decision key duplicata: {decision_key}")
            else:
                decision_keys.add(decision_key)

            decision_type = decision.get("type")
            options = decision.get("options", []) if decision_type == "branch" else []
            if decision_type == "branch":
                option_keys = [option.get("key") for option in options if isinstance(option, dict)]
                duplicates = [value for value, count in Counter(option_keys).items() if value and count > 1]
                for value in duplicates:
                    errors.append(f"branch option key duplicata: {decision_key}/{value}")
                if any(not option.get("next") for option in options if isinstance(option, dict)):
                    errors.append(f"branch decorativo: {decision_key}")
            elif decision_type == "cast":
                for entry in decision.get("catalog_roster", []):
                    if not isinstance(entry, dict) or not entry.get("key") or not entry.get("entrance_ref"):
                        errors.append(f"roster entry non valida: {decision_key}")
                        continue
                    entrance_path = root / entry["entrance_ref"]
                    if not entrance_path.is_file():
                        errors.append(f"entrance_ref mancante: {decision_key}/{entry.get('key')}")
            else:
                errors.append(f"decision type non valido: {key}/{decision_type}")

        # Variant references.
        for setup_key, values in (step.get("variant_refs") or {}).items():
            setup_item = setup_by_key.get(setup_key)
            if not setup_item:
                errors.append(f"setup variante inesistente: {setup_key}")
                continue
            if setup_item.get("type") != "variant":
                errors.append(f"{setup_key} non è variant")

            expected = {
                option.get("key")
                for option in setup_item.get("options", [])
                if isinstance(option, dict)
            }
            actual = set(values or {})

            for missing in sorted(expected - actual):
                warnings.append(f"variante mancante: {key}/{setup_key}/{missing}")
            for unknown in sorted(actual - expected):
                errors.append(f"variante sconosciuta: {key}/{setup_key}/{unknown}")

            for value, ref in (values or {}).items():
                if not (root / ref).is_file():
                    errors.append(f"file variante mancante: {key}/{setup_key}/{value}/{ref}")

            base_text = read_if_file(content_path)
            marker = f"[VARIANTE:{setup_key}]"
            if marker not in base_text:
                warnings.append(f"marker variante mancante: {key}/{setup_key}")

    declared_max = story.get("max_decisions")
    if isinstance(declared_max, int) and actual_decision_count > declared_max:
        errors.append(
            f"max_decisions superato: dichiarato {declared_max}, presenti {actual_decision_count}"
        )

    # References.
    start = story.get("start")
    if start not in steps_by_key:
        errors.append(f"start inesistente: {start}")

    for item in setup:
        if isinstance(item, dict) and item.get("type") == "branch":
            for option in item.get("options", []):
                if isinstance(option, dict) and option.get("start") not in steps_by_key:
                    errors.append(
                        f"setup start inesistente: {item.get('key')}/{option.get('start')}"
                    )

    for step in steps:
        if not isinstance(step, dict):
            continue
        key = step.get("key")
        next_key = step.get("next")
        if next_key and next_key not in steps_by_key:
            errors.append(f"next inesistente: {key}/{next_key}")

        decision = step.get("decision")
        if decision and decision.get("type") == "branch":
            for option in decision.get("options", []):
                if isinstance(option, dict):
                    target = option.get("next")
                    if target and target not in steps_by_key:
                        errors.append(
                            f"option next inesistente: {decision.get('key')}/{target}"
                        )

        content_ref = step.get("content_ref")
        content_path = root / str(content_ref or "")
        base_text = read_if_file(content_path)

        if decision and decision.get("type") == "cast":
            if "[ENTRATA_AIUTANTE]" not in base_text:
                warnings.append(f"marker entrata mancante: {key}")

        # Strong semantic warning: base text must be neutral for declared variants.
        lower_words = {word.lower().strip("'") for word in WORD_RE.findall(base_text)}
        for setup_key in (step.get("variant_refs") or {}):
            lexicon = SEMANTIC_LEXICONS.get(setup_key)
            if not lexicon:
                continue
            hits = sorted(lower_words & lexicon)
            if hits:
                warnings.append(
                    f"testo base non neutro: {key}/{setup_key} → {', '.join(hits)}"
                )

    # Reachability and terminal path.
    starts = {start}
    starts.update(
        option.get("start")
        for item in setup
        if isinstance(item, dict) and item.get("type") == "branch"
        for option in item.get("options", [])
        if isinstance(option, dict)
    )
    reachable: set[str] = set()
    stack = [value for value in starts if value in steps_by_key]
    terminal_found = False

    while stack:
        key = stack.pop()
        if key in reachable:
            continue
        reachable.add(key)

        step = steps_by_key[key]
        decision = step.get("decision")
        if decision and decision.get("type") == "branch":
            targets = [
                option.get("next")
                for option in decision.get("options", [])
                if isinstance(option, dict) and option.get("next")
            ]
        else:
            targets = [step.get("next")] if step.get("next") else []

        if not targets:
            terminal_found = True
        stack.extend(target for target in targets if target in steps_by_key)

    if not terminal_found:
        errors.append("nessun finale raggiungibile")

    for key in sorted(set(steps_by_key) - reachable):
        warnings.append(f"step irraggiungibile: {key}")

    # Variant usage and unresolved markers in source files.
    for item in setup:
        if not isinstance(item, dict) or item.get("type") != "variant":
            continue
        key = item.get("key")
        if not any((step.get("variant_refs") or {}).get(key) for step in steps if isinstance(step, dict)):
            warnings.append(f"setup variant non usato: {key}")

    known_markers = set(story.get("placeholders", []))
    known_markers.update(f"[VARIANTE:{key}]" for key in setup_keys)
    known_markers.add("[ENTRATA_AIUTANTE]")

    for step in steps:
        if not isinstance(step, dict):
            continue
        refs = [step.get("content_ref")]
        refs.extend(
            ref
            for values in (step.get("variant_refs") or {}).values()
            for ref in (values or {}).values()
        )
        decision = step.get("decision")
        if decision and decision.get("type") == "cast":
            refs.extend(
                entry.get("entrance_ref")
                for entry in decision.get("catalog_roster", [])
                if isinstance(entry, dict)
            )

        for ref in filter(None, refs):
            text = read_if_file(root / ref)
            for marker in MARKER_RE.findall(text):
                if marker not in known_markers:
                    warnings.append(f"marker non dichiarato: {ref}/{marker}")

    return errors, warnings


def main() -> int:
    if len(sys.argv) != 2:
        print("Uso: python tools/validate_story.py path/to/story.json")
        return 2

    errors, warnings = validate(Path(sys.argv[1]))
    for warning in warnings:
        print("WARNING:", warning)
    for error in errors:
        print("ERROR:", error)
    print(f"Esito: {len(errors)} errori, {len(warnings)} warning")
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
