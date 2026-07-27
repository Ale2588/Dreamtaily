# DreamTaily — Integrazione del configuratore nel flusso principale

## Cosa cambia

Il flusso esistente resta:

```text
creazione personaggio
→ salvataggio Supabase
→ scelta storia
→ creazione book_stories
→ assegnazione protagonista
```

Dopo `Aggiungi questa storia al libro`, `index.html` apre il nuovo
`configuratore.html` a schermo intero.

Le scelte vengono salvate nello stesso database:

```text
setup + bivi → book_stories.path_choices
compagno     → story_cast_assignments, slot_key helper
```

## Applicazione

Dalla root del repository:

```bash
python tools/patch_integrated_configurator.py index.html
```

Il patcher crea automaticamente `index.before-configurator.html` e si blocca
senza modificare nulla se non riconosce il file atteso.

## Test

```text
[ ] Creo o scelgo un personaggio
[ ] Scelgo Il bosco dei sussurri
[ ] Premo Aggiungi questa storia al libro
[ ] Si apre il nuovo configuratore
[ ] Il protagonista creato è già assegnato
[ ] Scelgo compagno, atmosfera e due bivi
[ ] Chiudo il configuratore
[ ] Il riepilogo del libro mostra la storia
[ ] Riaprendo il draft, path_choices e helper risultano salvati
```

Il vecchio wizard resta nel file ma non viene più chiamato. Sarà eliminato dopo
la verifica completa, così il rollback resta semplice.
