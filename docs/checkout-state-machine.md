# DreamTaily — Confine checkout e generazione

## Obiettivo

Il browser non avvia più direttamente la generazione delle immagini. La conferma del libro è un passaggio autonomo che:

1. verifica che tutte le storie siano complete;
2. congela versioni, testi, scelte, cast, identity prompt e reference;
3. crea un solo job idempotente in stato `queued`;
4. rende immutabile il libro confermato;
5. porta l’utente a una pagina di stato recuperabile dopo refresh.

Durante il collaudo strutturale nessuna chiamata IA viene eseguita.

## Stati canonici

| Oggetto | Stati |
| --- | --- |
| `books` | `draft` → `paid` → `generating` → `ready` oppure `failed` |
| `book_stories` | `draft` → `ready` → `snapshotted` |
| `book_renders` | `queued` → `running` → `ready`, `review` oppure `failed` |

`ready_for_checkout` resta compatibile con lo schema, ma la conferma dimostrativa passa atomicamente da `draft` a `paid` perché non esiste ancora un provider di pagamento reale.

## Responsabilità

### Browser

- raccoglie l’email;
- invoca `checkout-book` con `book_id` e chiave idempotente;
- mostra lo stato leggendo `book_renders` tramite RLS;
- non può cambiare lo stato del libro né modificare un libro confermato.

### `checkout-book`

- autentica il proprietario;
- valida il libro e tutte le storie;
- crea `checkout-book-v1`, lo snapshot immutabile del libro;
- chiama la transazione `finalize_book_checkout_v1`;
- restituisce il job `queued` senza invocare OpenAI.

### Transazione Postgres

- blocca la riga `books`;
- applica idempotenza;
- crea `book_renders`;
- marca le storie `snapshotted`;
- porta il libro a `paid`;
- limita update e delete dal browser ai soli libri `draft`.

### `render-book`

- richiede un job creato dal checkout;
- se il job è `queued` e manca `start: true`, restituisce soltanto lo stato;
- quando sarà collegato a un worker, usa esclusivamente `book_snapshot`;
- non rilegge personaggi o storie modificabili per costruire il render.

## Idempotenza

La chiave canonica del frontend è `checkout-<book_id>`. Ripetere la conferma restituisce lo stesso job e non crea snapshot o libri duplicati.

## Passo successivo

Collegare un worker affidabile alla transizione `queued → running`, quindi eseguire un solo collaudo completo con IA. Successivamente: email di presa in carico, email di consegna e provider di pagamento reale.

