# Fix definitivo validatore e formato

Correzioni incluse:

1. `branch.key` globalmente unica;
2. `cast.key` unica per percorso, ammessa su rami mutuamente esclusivi;
3. `max_decisions` include setup + massimo delle decisioni attraversate;
4. Bosco aggiornato a `max_decisions: 4`;
5. `image_ref` relativo alla cartella della storia;
6. patch sicura di `index.html` tramite `tools/patch_index_story_assets.py`;
7. migration `path_choices` collocata in `supabase/migrations/`.

## Applicazione

Dopo avere copiato i file:

```bash
python tools/patch_index_story_assets.py index.html
```

Il comando modifica soltanto:

- aggiunta di `resolveStoryAssetRef`;
- risoluzione delle due immagini nella plancia.

## File da eliminare dalla root

Dopo aver verificato che esista la migration in `supabase/migrations/`, eliminare:

```text
20260723_005_book_story_path_choices.sql
```

## Test atteso

```bash
python tools/validate_story.py stories/il-bosco-dei-sussurri/story.json
python tools/validate_story.py stories/la-lanterna-sul-molo/story.json
python tools/validate_story.py stories/_fixtures/setup-branch-demo/story.json
node --check story-validator.js
```

Atteso: `0 errori`. Il warning semantico su `scuro` può restare come falso positivo noto.
