# Installazione — motore storie ramificate MVP

## File

Copia nel repository:

- `index.html`
- cartella `stories/`
- `20260723_005_book_story_path_choices.sql`

Mantieni la struttura delle cartelle invariata.

## Database

Esegui la migrazione SQL prima di usare il nuovo frontend.

## Avvio locale

Il catalogo usa `fetch()`, quindi non aprire `index.html` con `file://`.

Dalla root del repository:

```bash
python -m http.server 8000
```

Poi apri `http://localhost:8000`.

## Test

1. Crea o scegli un personaggio.
2. Seleziona una delle due storie.
3. Percorri i passi.
4. Effettua una scelta di ramo.
5. Scegli o salta l’aiutante secondo la storia.
6. Completa la storia.
7. Verifica il riepilogo del libro.
8. Ricarica e riprendi il libro.
9. Controlla in Supabase:
   - `book_stories.path_choices`
   - `story_cast_assignments.slot_key = helper`

## Limiti intenzionali

- il testo completo dei capitoli non è ancora mostrato nel funnel;
- non ci sono immagini dedicate ai bivi;
- il percorso non viene ancora ripreso esattamente dal passo interrotto;
- i personaggi editoriali sono placeholder locali;
- non c’è backoffice;
- non viene effettuata alcuna generazione durante la composizione.
