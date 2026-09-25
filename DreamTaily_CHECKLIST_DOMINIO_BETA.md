# DreamTaily — Checklist dominio reale e autenticazione beta

Data: 25 settembre 2026  
Progetto Supabase: `hirzbtruxvjzmcnncvmv`

## Esito della verifica sul codice

- I redirect di registrazione e accesso sono costruiti da `location.href`.
- I link al libro finale sono costruiti da `location.origin` e dal percorso corrente.
- Nel frontend di produzione non risultano URL codificati verso GitHub Pages, localhost, Vercel, Netlify o Cloudflare Pages.
- Gli URL Supabase, OpenAI, Google Fonts e degli asset non sono URL del sito e restano intenzionalmente configurati separatamente.
- Il fallback GitHub Pages della Edge Function `authoring-admin` riguarda gli asset editoriali, non redirect o link del sito pubblico. Non viene modificato in questo giro.

## 1. Hosting e DNS

Da completare sul provider del dominio/hosting:

1. Pubblicare i file della beta sul dominio scelto.
2. Configurare i record DNS richiesti dall'hosting.
3. Attivare HTTPS con certificato valido.
4. Decidere un solo indirizzo canonico, per esempio `https://www.example.com/` oppure `https://example.com/`.
5. Reindirizzare permanentemente la variante non canonica verso quella canonica.
6. Verificare che `index.html`, `libro.html` e gli asset siano raggiungibili dal medesimo percorso base.

## 2. Supabase Auth — URL Configuration

Aprire:

`Supabase Dashboard → Authentication → URL Configuration`

Impostare:

- **Site URL:** l'origine canonica completa della beta, con `https://`.
- **Redirect URLs:** aggiungere l'URL esatto della pagina su cui vive `index.html`.
- Se il sito è pubblicato nella root: aggiungere `https://DOMINIO/`.
- Se il sito è pubblicato in una sottocartella: aggiungere esattamente `https://DOMINIO/PERCORSO/`.
- Aggiungere l'URL esatto del backoffice solo se il magic link del backoffice deve funzionare sul dominio reale.
- Conservare temporaneamente l'URL GitHub Pages solo finché serve ancora per collaudi paralleli; rimuoverlo quando non è più necessario.

Per la produzione sono preferibili URL esatti. Non usare `https://DOMINIO/**` se non è realmente necessario.

## 3. Template email

Aprire:

`Supabase Dashboard → Authentication → Email Templates`

Controllare il template del magic link e quello di conferma email:

- il link deve rispettare `emailRedirectTo`/`RedirectTo`;
- non deve puntare a localhost o a un vecchio dominio;
- mittente, oggetto e testo devono identificare DreamTaily;
- il link deve essere provato in una finestra anonima del browser;
- fare un secondo test con un account già esistente, verificando il merge del lavoro anonimo.

## 4. SMTP — blocco da risolvere prima di invitare tester

La configurazione SMTP non è leggibile dagli strumenti database disponibili. Dai log Auth risulta che i magic link sono stati effettivamente usati su GitHub Pages, ma questo non dimostra che sia configurato un provider SMTP personalizzato.

Aprire:

`Supabase Dashboard → Project Settings → Authentication → SMTP Settings`

Verificare che **Custom SMTP** sia attivo e che siano configurati:

- host SMTP;
- porta e modalità TLS;
- username e password;
- email mittente su dominio verificato;
- nome mittente DreamTaily.

Se Custom SMTP non è attivo, lo stato della beta è **bloccato**: il servizio email predefinito Supabase non è una base affidabile per invitare tester esterni.

Test minimo dopo la configurazione:

1. invio a Gmail;
2. invio a Outlook/Hotmail;
3. invio a un terzo provider;
4. controllo cartella spam;
5. apertura del link su dispositivo diverso;
6. verifica del ritorno esatto al dominio reale;
7. verifica che un link già usato o scaduto mostri un errore comprensibile.

## 5. Verifica finale sul dominio

- Un visitatore anonimo crea personaggio e storia.
- Al checkout viene richiesto l'accesso.
- Il magic link torna sullo stesso dominio e riprende l'azione.
- Un account non invitato riceve il messaggio beta e non genera immagini.
- Un tester invitato consuma un solo entitlement e crea un solo render.
- Un refresh o un doppio clic non consuma un secondo entitlement.
- Il lettore finale e il PDF non contengono pagine di bivio.
- Il link al libro usa il dominio reale, non GitHub Pages.

## Stato

| Voce | Stato |
|---|---|
| Redirect frontend dinamici | Soddisfatto |
| Link libro finale dinamici | Soddisfatto |
| Ricerca URL hosting codificati nel frontend | Soddisfatto |
| Site URL Supabase sul dominio reale | Da configurare dal Product Owner |
| Redirect URL Supabase esatto | Da configurare dal Product Owner |
| HTTPS e DNS | Da configurare dal Product Owner |
| Custom SMTP | Da verificare; bloccante se assente |
| Test magic link sul dominio reale | Da eseguire dopo la pubblicazione |
