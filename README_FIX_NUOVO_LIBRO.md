# DreamTaily — Fix nuovo libro da personaggio salvato

Il click su un personaggio salvato imposta `app.forceNewBook = true`.

Alla successiva scelta della storia, `getOrCreateDraftBook()`:
- non riusa il libro attivo;
- non recupera l'ultima bozza;
- crea un nuovo record `books`;
- azzera il flag dopo la creazione riuscita.

I libri esistenti restano intatti.
