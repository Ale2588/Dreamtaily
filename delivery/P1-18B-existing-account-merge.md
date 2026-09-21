# P1-18B — Fusione con account esistente

## Stato

Preparato e testato localmente, ma **non distribuito** e **non collegato al frontend**.
L’attivazione resta bloccata fino alla validazione manuale di P1-18A.1.

## Flusso previsto

1. L’utente anonimo sceglie di accedere a un account esistente.
2. `merge-account` crea un ticket casuale, monouso e valido per 15 minuti. Nel database viene conservato solo il relativo hash SHA-256.
3. L’utente completa l’accesso all’account permanente.
4. `merge-account` finalizza il ticket verificando la nuova sessione.
5. Una sola transazione sposta personaggi, libri e gli eventuali progetti narrativi dal profilo anonimo al profilo permanente.
6. L’utente Auth anonimo ormai vuoto viene eliminato dal server.

## Regole di conflitto

- Se entrambi gli account hanno una bozza attiva, la bozza anonima viene conservata ma archiviata. Non viene cancellato alcun libro.
- Un’improbabile collisione tra `client_request_id` dei personaggi blocca l’intera transazione senza trasferimenti parziali.
- Le reference private mantengono il percorso Storage originario; una policy aggiuntiva ne consente la lettura soltanto al nuovo proprietario relazionale.
- Una seconda finalizzazione dello stesso ticket è idempotente soltanto per lo stesso account di destinazione.

## Sicurezza

- Le due sessioni non vengono considerate equivalenti: il ticket viene preparato esclusivamente da un utente anonimo e finalizzato esclusivamente da un utente permanente.
- Tabella e funzioni di merge non sono accessibili ai ruoli browser `anon` e `authenticated`.
- Il token originale non viene scritto nel database.
- L’endpoint non restituisce mai l’ID dell’utente anonimo al browser.
- Il frontend corrente non contiene riferimenti all’endpoint, quindi il percorso rimane dormiente.

## Ordine di attivazione futuro

1. Validare P1-18A.1 su nuova registrazione.
2. Applicare la migrazione `20260921143000_prepare_existing_account_merge.sql`.
3. Eseguire Security e Performance Advisors.
4. Distribuire `merge-account` con verifica JWT attiva.
5. Collaudare prepare/finalize con due utenti di test e doppia bozza.
6. Solo dopo aggiungere la UI “Hai già uno spazio DreamTaily? Accedi”.

## Verifiche eseguite

- 24/24 test mirati superati.
- 227 test della suite generale superati.
- Tre test live del catalogo esistente risultano non verdi perché le storie di collaudo attese non sono attualmente pubblicate; non coinvolgono P1-18B.
- `git diff --check` superato.

