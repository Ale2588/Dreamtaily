# DreamTaily — Fix salvataggio aiutante e uscita dal funnel

## Sovrascrivere

```text
index.html
```

Base verificata:

```text
14a272579c819838a66fbccb6d5ef20a4539a435
```

## Correzione 1 — errore “Non sono riuscito a salvare la scelta”

La scelta dell’aiutante viene ora salvata prima dentro:

```text
book_stories.path_choices.helper
```

La scrittura in `story_cast_assignments` resta tentata, ma un eventuale problema
di foreign key/catalogo non blocca più il funnel.

Il libro e la riapertura leggono l’aiutante sia dall’assegnazione cast sia,
come fallback canonico MVP, da `path_choices.helper`.

## Correzione 2 — uscita dal funnel

Nella pagina di consegna è stato aggiunto:

```text
Elimina il libro e ricomincia
```

Il comando:

- chiede conferma;
- elimina assegnazioni cast, storie e libro;
- conserva i personaggi della libreria;
- pulisce tutto lo stato del funnel;
- torna al catalogo delle storie senza pulsante “Riprendi” fantasma.

## Test

1. Seleziona Fiamma e premi Continua.
2. Verifica che il flusso proceda anche se il catalogo Supabase non è allineato.
3. Completa checkout e consegna.
4. Premi “Elimina il libro e ricomincia”.
5. Verifica che il vecchio libro non ricompaia dalla landing.
