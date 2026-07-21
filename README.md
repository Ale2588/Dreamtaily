# DreamTaily Story Engine v2 — Character Bible

Questa versione:

- legge `orders.protagonist`;
- mantiene un fallback per gli ordini legacy basati su `name` e `description`;
- genera `character_bible` insieme a Story Bible, Story Outline e Visual Bible;
- salva `character_bible` in `story_packages.character_bible`;
- usa soltanto `real_person` e `fictional_character`;
- preserva i tratti fisici forniti e non inventa quelli mancanti.

## Uso dal Dashboard Supabase

Apri la Edge Function `generate-story-bible` e sostituisci il contenuto con:

`supabase/functions/generate-story-bible/index.dashboard-single-file.ts`

È la versione consigliata per il Dashboard perché contiene lo schema JSON inline e non richiede import locali.

## Uso dal repository / CLI

Usa insieme:

- `supabase/functions/generate-story-bible/index.ts`
- `supabase/functions/generate-story-bible/story-package.schema.json`

## Test

Invoca la funzione con:

```json
{"order_id":"c8b86a91-6e46-4c58-af1e-a60dec670b63"}
```

Prima del test elimina un eventuale `story_packages` già pronto per lo stesso ordine, altrimenti la cache restituirà il pacchetto precedente.
