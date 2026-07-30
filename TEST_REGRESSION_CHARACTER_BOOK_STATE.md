# Regression test — stato personaggio e libro

## Caso principale

1. Crea il personaggio A.
2. Aggiungi una storia al libro con A.
3. Torna alla libreria e crea o scegli il personaggio B.
4. Entra nel catalogo.
5. Premi **Vai al mio libro** senza aggiungere una nuova storia.

Esito atteso:

- la storia già salvata mostra ancora A;
- la copertina mostra A;
- B non compare nel libro;
- nessun record `story_cast_assignments` esistente viene modificato.

## Nuova storia

1. Con B attivo, scegli una storia non ancora presente.
2. Aggiungila al libro.

Esito atteso:

- la prima storia mantiene A;
- la nuova storia usa B;
- ogni riga del riepilogo mostra il proprio protagonista persistito.

## Protezione duplicati

Prova ad aggiungere nuovamente una storia già presente.

Esito atteso:

- compare “Questa storia è già presente nel libro”;
- il protagonista della storia esistente non viene sovrascritto.

## Doppio browser

Ripeti il caso principale in due browser collegati allo stesso Supabase.

Esito atteso:

- ogni sessione vede solo i propri dati;
- il cambio di personaggio in una sessione non altera il libro dell’altra.
