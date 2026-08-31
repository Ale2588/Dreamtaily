# Gate D — runtime da PublishedStoryVersion

## Stato DB

Gate D dati: PASSATO.

- StoryProject `il-bosco-dei-sussurri`
- StoryVersion v3 pubblicata e corrente
- 27/27 sorgenti testuali byte-identici ai file Git
- 10/10 scene presenti
- 4 helper catalogo presenti
- 2/2 golden Markdown identici byte-per-byte:
  - `948fc1ea05f5773392069783c318e78047292f3f`
  - `7d20e33552eb0440ba738597bab1d65b08ede71c`
- `book_stories.story_version_id` backfilled per le storie Bosco esistenti
- StoryVersion pubblicata protetta da trigger di immutabilità

## Runtime adapter

`story-validator.js` conserva il validator esistente e aggiunge un adapter temporaneo
per il Gate D.

Intercetta esclusivamente:

- `stories/catalog.json`
- `stories/<slug>/story.json`
- `stories/<slug>/scene-pilot.json`
- `stories/<slug>/chapters/*`
- `stories/<slug>/entrances/*`

e li serve dalla Edge Function `published-story`.

Non esiste fallback ai file repository: se il DB/API non funziona, il funnel deve fallire.
Questo rende il collaudo significativo.

Gli asset immagine non vengono intercettati.

## Debito ancora intenzionale

I due cataloghi helper presenti in `index.html` (`CATALOG_CHARACTERS` / `DT_HELPERS`)
sono ancora runtime-local. Il `published_contract.catalog` è già nel DB, ma il funnel
non lo consuma ancora. Va eliminato nella fase successiva, insieme alla generalizzazione
del visual prompt.

Questo adapter è un ponte di test, non l'architettura finale del backoffice.

## Collaudo runtime conclusivo — 31 agosto 2026

Gate D runtime: **PASSATO** sulla branch `backoffice`.

- catalogo e contratto caricati dalla Edge Function live `published-story`;
- header sintetico `X-DreamTaily-Story-Source: published-story-db` verificato;
- StoryVersion `43068bf8-ab56-4027-915d-3aa088718659`, v3, usata dal test;
- definition, 10/10 scene e 27/27 riferimenti testuali caricati tramite l'adapter;
- percorso completo `notte -> felci -> Etto -> promessa` composto in 7 pagine;
- nessun marker irrisolto e background presente in tutte le pagine;
- una sola chiamata live al catalogo e una sola al contratto versionato (cache adapter verificata).

Test ripetibile:

```bash
npm run test:gate-d-live
```
