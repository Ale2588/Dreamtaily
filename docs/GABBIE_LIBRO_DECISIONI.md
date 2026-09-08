# DreamTaily — decisioni gabbie del libro

Stato: approvato per implementazione, 2026-09-08.

## Decisioni editoriali

- Uno step narrativo produce una doppia pagina.
- Nella doppia appare soltanto il testo narrativo, non il titolo tecnico dello step.
- Tutte le quindici gabbie restano disponibili nel sistema.
- Per `Figura`, `Ritratto` e `Cammino` l'autore sceglie il personaggio da evidenziare fra quelli presenti nella scena.
- `Coro` riutilizza una scena attraverso due crop; non richiede una seconda generazione.
- `Velo` può essere utilizzata una sola volta per libro.
- Ogni storia contenuta nel libro riceve il proprio frontespizio.
- Le pagine bianche sono foliazione, non gabbie.
- Il pareggio a multiplo di quattro è rinviato alla fase di stampa.

## Genere grammaticale

- La creazione del personaggio richiederà il genere grammaticale `maschile` o `femminile` per l'MVP.
- Un contenuto può essere comune oppure avere varianti maschile e femminile.
- Il filtro di capienza usa sempre la variante più lunga.
- Il composer sceglierà la variante tramite il protagonista e congelerà nello snapshot il genere e il testo risolto.
- Gabbia, geometria e immagine non vengono duplicate per genere.

## Confini della prima slice

Questa slice introduce il catalogo delle gabbie, le validazioni, il selettore, il renderer HTML deterministico e la foliazione. Non modifica ancora backoffice, schema pubblicato, composer, Supabase o generazione AI.
