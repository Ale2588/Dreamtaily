# DreamTaily — story schema v1 package

Questo pacchetto chiude le tre lacune emerse dalla prima storia completa:

1. i finali sono passi reali con `content_ref`;
2. ogni voce di `catalog_roster` include `entrance_ref`;
3. la storia dichiara i placeholder e i testi possono usare `[Nome]`, `[Aiutante]`, `[ENTRATA_AIUTANTE]`.

## Contenuto

- `index.html` — motore aggiornato;
- `story-validator.js` — validatore puro condivisibile con il backoffice;
- `schemas/story.schema.v1.json` — contratto formale;
- `tools/validate_story.py` — validatore CLI con controllo dei file;
- `stories/il-bosco-dei-sussurri/` — storia completa fornita nel check;
- `stories/la-lanterna-sul-molo/` — secondo caso aggiornato al formato;
- `20260723_005_book_story_path_choices.sql`;
- `SUPABASE_SCHEMA_EXPORT.md`.

## Test locale

```bash
python -m http.server 8000
```

Aprire `http://localhost:8000`.

## Validazione CLI

```bash
python tools/validate_story.py stories/il-bosco-dei-sussurri/story.json
python tools/validate_story.py stories/la-lanterna-sul-molo/story.json
```

## Limite ancora aperto

Il motore registra `entrance_ref` nella scelta in memoria, ma il rendering completo del libro e il `content_snapshot` di checkout non sono ancora implementati. Le funzioni `resolveStoryText()` e `resolveStoryPath()` preparano quel passaggio.

## Gate prima del merge

- test RLS multiutente;
- estrazione e consolidamento dello schema Supabase reale;
- test di ricostruzione database da zero.

Nota: la stessa `decision.key` di tipo `cast` può comparire su rami mutuamente esclusivi, come `helper`; il vincolo resta unico sul percorso effettivo.
