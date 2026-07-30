# Test validatore v2

Eseguire:

```bash
node --check story-validator.js
python tools/validate_story.py stories/il-bosco-dei-sussurri/story.json
python tools/validate_story.py stories/la-lanterna-sul-molo/story.json
python tools/validate_story.py stories/_fixtures/setup-branch-demo/story.json
```

Risultato richiesto:

```text
0 errori
```

I warning `testo base non neutro` devono essere esaminati manualmente.

## Casi che devono fallire

- setup oltre il massimo;
- più di un setup branch;
- chiave setup duplicata;
- chiave opzione duplicata;
- collisione setup/decision;
- decision key duplicata;
- branch con `next` mancante;
- riferimento a passo inesistente;
- `entrance_ref` inesistente;
- `content_ref` inesistente;
- numero di decisioni superiore a `max_decisions`;
- nessun finale raggiungibile.

## Casi che devono produrre warning

- `composer_summary` mancante;
- variante non usata;
- opzione variante non coperta;
- marker variante mancante;
- marker entrata mancante;
- passo irraggiungibile;
- testo base non neutro rispetto a una variante;
- marker non dichiarato.
