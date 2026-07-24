# DreamTaily Story Schema v2 — freeze candidate

**Stato:** congelabile dopo il passaggio del validatore e dei rendering integrali.

## Contratto congelato

Il formato v2 supporta:

- massimo 2 elementi di setup;
- massimo 1 setup di tipo `branch`;
- setup `variant` con opzioni visuali;
- setup `branch` con `start` specifico per opzione;
- passi con `content_ref`;
- decisioni `branch`;
- decisioni `cast`;
- `catalog_roster` con `entrance_ref`;
- `variant_refs`;
- finali come passi reali con `next: null`;
- placeholder dichiarati;
- `composer_summary` per l’anteprima del funnel.

## Regola editoriale aggiunta

Per ogni setup `variant`, il testo base dei passi che dichiarano quella variante deve essere semanticamente neutro rispetto alla dimensione variata.

Esempio:

```text
atmosfera = notte | tramonto
```

Il testo base non deve contenere riferimenti come:

```text
luna, notte, alba, tramonto, sera, sole
```

Questi riferimenti devono vivere nei file indicati da `variant_refs`.

Il controllo è un **warning forte**, non un errore bloccante, perché usa un lessico euristico e può produrre falsi positivi.

## Autorità dei validatori

- `story-validator.js`: controllo strutturale immediato nel browser;
- `tools/validate_story.py`: controllo editoriale completo, inclusi file, marker e neutralità semantica.

Il validatore Python è il gate obbligatorio prima di accettare una storia nel repository.

## Gate di freeze

Lo schema v2 è considerato congelato quando:

1. tutte le storie v2 restituiscono `0 errori`;
2. i warning forti sono letti e accettati o corretti;
3. almeno due percorsi integrali del Bosco vengono renderizzati senza marker;
4. notte e tramonto non presentano contraddizioni;
5. la divergenza estesa riconverge correttamente.

Dopo il freeze, modifiche incompatibili richiedono una nuova versione dello schema.
