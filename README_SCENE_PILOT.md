# DreamTaily — Pilota scena deterministica

Questo pacchetto è aggiuntivo: non sovrascrive `index.html`, `story.json` o i validatori attuali.

## File

```text
stories/il-bosco-dei-sussurri/scene-pilot/scene-pilot.json
tools/scene-composer.js
tools/scene-demo.html
tools/validate_scene_pilot.py
SCENE_FORMAT_PILOT.md
```

## Test visivo

Dopo il deploy aprire:

```text
/tools/scene-demo.html
```

Premere:

```text
Notte
Tramonto
```

Entrambi gli sfondi devono caricarsi.

## Test strutturale

```bash
python tools/validate_scene_pilot.py   stories/il-bosco-dei-sussurri/scene-pilot/scene-pilot.json
```

Il test deve restituire:

```text
Esito: 0 errori
```

## Limite deliberato

Il personaggio demo usa un asset già presente. Le pose persistenti dei personaggi utente non sono ancora implementate.
