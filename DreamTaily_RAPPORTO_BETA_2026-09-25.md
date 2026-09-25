# DreamTaily — Rapporto attività beta chiusa

Data: 25 settembre 2026  
Direttiva: `DreamTaily_istruzioni_Codex_beta_chiusa.md`

## Sintesi

Le attività A, B, C e la preparazione tecnica D sono state implementate nell'ordine richiesto. Il backend di A è già attivo su Supabase. Le modifiche frontend e composer devono ancora essere pubblicate sull'hosting.

## A. Entitlement server-side

### Cosa è cambiato

- Nuova tabella `book_entitlements` con stati `available`, `consumed`, `revoked` e sorgenti `beta_grant`, `stripe`.
- RLS di sola lettura per il proprietario permanente; nessuna scrittura client.
- Funzione service-role `grant_book_entitlements_by_email`.
- Consumo atomico dell'entitlement dentro `finalize_book_checkout_v1`.
- Collegamento obbligatorio e univoco `book_renders.entitlement_id`.
- Backfill dei 14 render preesistenti, senza cancellare o invalidare dati.
- Rifiuto esplicito degli utenti anonimi in `checkout-book` e `render-book`.
- Verifica dell'entitlement consumato prima di avviare il rendering.
- Messaggio frontend comprensibile per `AUTH_ANONYMOUS` e `ENTITLEMENT_REQUIRED`.
- 10 entitlement beta concessi all'account Product Owner confermato.

### Stato produzione

- Migrazione `add_book_entitlements`: applicata.
- `checkout-book`: attiva, versione 6, JWT verificato.
- `render-book`: attiva, versione 16, JWT verificato.

### Evidenze

- Entitlement beta disponibili: 10.
- Entitlement retroattivi consumati: 14.
- Render privi di entitlement: 0.
- Collegamenti incoerenti: 0.
- Ruolo `authenticated`: SELECT sì, INSERT no, concessione no.
- Test dedicati: 7 verdi.

### Criteri

| Criterio | Stato |
|---|---|
| Anonimo rifiutato | Soddisfatto |
| Permanente senza entitlement rifiutato | Soddisfatto |
| Permanente con entitlement accettabile e consumo atomico | Soddisfatto |
| Retry sullo stesso libro non consuma un secondo entitlement | Soddisfatto |
| Render diretto senza entitlement rifiutato | Soddisfatto |
| Migrazione applicata e SQL consegnato | Soddisfatto |
| Product Owner provvisto di permessi | Soddisfatto, 10 permessi |
| Prova manuale completa del Product Owner | Da eseguire dopo pubblicazione frontend |

## B. Bivio escluso dal libro finale

### Cosa è cambiato

`composeStory` risolve ancora l'intero percorso e richiede tutte le scelte, ma filtra gli step con `decision.type === "branch"` prima di creare le pagine narrative. La numerazione finale viene ricostruita senza buchi.

Questa è la sorgente canonica usata da anteprima, snapshot, renderer, lettore e PDF: non sono stati introdotti filtri duplicati e le gabbie non sono state toccate.

### Evidenze

- Test automatico con tre bivi: zero pagine domanda.
- Il percorso contiene soltanto le tre conseguenze selezionate.
- Test live sul contratto pubblicato `test-con-bivio`: domanda esclusa e ramo scelto conservato.
- Il renderer pianifica soltanto `content_snapshot.pages`, quindi il conteggio non include i bivi.

### Criteri

| Criterio | Stato |
|---|---|
| La scelta determina le pagine successive | Soddisfatto |
| Domande/opzioni assenti da sequenza finale | Soddisfatto |
| Bivi esclusi dal rendering IA | Soddisfatto alla fonte |
| Composizione interattiva invariata | Soddisfatto |
| Test con tre bivi | Soddisfatto |
| PDF di Draghetto rigenerato e allegato | Aperto: richiede pubblicazione frontend e una rigenerazione reale |

## C. Suite completa

### Cosa è cambiato

- Nuovo runner che scopre automaticamente tutti i file `.test.mjs`.
- `npm test` esclude esclusivamente i file con suffisso `-live.test.mjs`.
- `npm run test:live` esegue esclusivamente i test live.
- I test live del catalogo sono stati separati dal file non-live.
- Fixture live obsoleti sostituiti con controlli sul catalogo attualmente pubblicato.
- Test di merge, gate registrazione, path, cast dinamico e PDF ora partecipano alla suite standard.

### Evidenze finali

- `npm test`: 40 file, 245 test, 245 superati, 0 falliti.
- `npm run test:live`: 2 file, 3 test, 3 superati, 0 falliti.
- `git diff --check`: nessun errore.

## D. Dominio reale

### Cosa è cambiato

- Aggiunti test automatici per redirect Auth e link al libro basati sull'origine corrente.
- Verificato che il frontend di produzione non contenga host di preview codificati.
- Preparata la checklist `DreamTaily_CHECKLIST_DOMINIO_BETA.md`.

### Criteri

| Criterio | Stato |
|---|---|
| Nessun URL del sito codificato nel frontend | Soddisfatto |
| Redirect costruiti dall'origine corrente | Soddisfatto |
| Elenco configurazioni Supabase | Soddisfatto |
| Site URL e redirect del dominio reale | Bloccato da configurazione Product Owner |
| Verifica Custom SMTP | Bloccante esterno: da controllare nel Dashboard |
| Test magic link sul dominio reale | Da eseguire dopo DNS/hosting/Auth |

## File di prodotto modificati

- `index.html`
- `src/story-composer.js`
- `supabase/functions/checkout-book/index.ts`
- `supabase/functions/render-book/index.ts`
- `supabase/migrations/20260925080000_add_book_entitlements.sql`
- `package.json`

## File di test e documentazione aggiunti/modificati

- `tools/run-tests.mjs`
- `tests/book-entitlements.test.mjs`
- `tests/domain-readiness.test.mjs`
- `tests/story-composer.test.mjs`
- `tests/editor-preview.test.mjs`
- `tests/dynamic-published-catalog.test.mjs`
- `tests/dynamic-published-catalog-live.test.mjs`
- `tests/gate-d-runtime-live.test.mjs`
- `DreamTaily_CHECKLIST_DOMINIO_BETA.md`
- `DreamTaily_RAPPORTO_BETA_2026-09-25.md`

## Prossimi passi obbligati

1. Pubblicare i file frontend del pacchetto differenziale.
2. Configurare dominio, HTTPS, Site URL e Redirect URLs.
3. Confermare e provare Custom SMTP.
4. Accedere con l'account Product Owner e completare un nuovo libro.
5. Rigenerare il libro di Draghetto e verificare il PDF senza pagine di bivio.
