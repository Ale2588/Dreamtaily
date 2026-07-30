# DreamTaily — Compositore JS puro

## Contratto

```text
composeStory({ story, choices, catalog, scenes, contentByRef }) → book
```

Il modulo non usa:

- DOM;
- `fetch`;
- Supabase;
- filesystem;
- AI.

L'I/O è confinato negli script sotto `tools/`.

## File

```text
src/story-composer.js
tools/render_story_js.mjs
tools/test_story_composer_golden.mjs
tests/story-composer.test.mjs
package.json
```

## Test unitari

```bash
npm run test:composer
```

## Regressione golden

Dalla root del repository, dopo aver copiato i file:

```bash
npm run test:golden
```

Il test non dipende dai nomi dei file dentro `renders/`.

Genera tutte le combinazioni valide del Bosco:

```text
2 atmosfere
× 2 sentieri
× roster compatibile col sentiero
× 2 finali
```

e verifica che ogni `.md` già presente in `renders/` coincida esattamente con
una composizione JS.

## Rendering manuale

```bash
node tools/render_story_js.mjs   stories/il-bosco-dei-sussurri/story.json   --name Lia   --helper etto   --choice atmosfera=notte   --choice d_sentiero=felci   --choice d_finale=promessa   --protagonist-asset assets/char/water/bear.png   --output /tmp/bosco.md   --json /tmp/bosco.json
```

## Nota sul catalogo

Per ora il CLI usa gli asset singoli già esistenti. Il compositore supporta già
un catalogo futuro con:

```json
{
  "etto": {
    "name": "Etto",
    "art": {
      "papercut": {
        "in_piedi": "...",
        "cammina": "..."
      }
    }
  }
}
```
