# DreamTaily Beta-30 — attivazione pagamento PDF

Il pacchetto contiene solo i file nuovi o modificati rispetto alla branch `Beta-30`.

## 1. Caricamento codice

Caricare i file mantenendo esattamente le cartelle indicate. Non inserire chiavi Stripe nei file o su GitHub.

## 2. Database Supabase

Eseguire la migrazione:

`supabase/migrations/20260929103000_add_stripe_pdf_checkout.sql`

La migrazione crea il registro dei checkout, abilita RLS e aggiunge la funzione atomica che accredita un solo diritto PDF per ogni pagamento.

## 3. Secrets delle Edge Functions

In Supabase, aprire **Project Settings → Edge Functions → Secrets** e aggiungere:

- `STRIPE_SECRET_KEY`: chiave segreta Stripe della modalità test;
- `STRIPE_PDF_PRICE_ID`: `price_1UKx4YB6QPQhNIvb5sgdN3lZ`;
- `PUBLIC_SITE_URL`: `https://beta.dreamtaily.com`.

Non condividere né salvare su GitHub valori che iniziano con `sk_` o `whsec_`.

## 4. Deploy delle funzioni

Distribuire:

- `create-stripe-checkout` con verifica JWT attiva;
- `stripe-webhook` con verifica JWT disattivata, come dichiarato in `supabase/config.toml`.

## 5. Webhook Stripe

In Stripe, modalità test, creare un endpoint webhook:

`https://hirzbtruxvjzmcnncvmv.supabase.co/functions/v1/stripe-webhook`

Selezionare soltanto l'evento `checkout.session.completed`. Copiare il relativo signing secret in Supabase con nome:

- `STRIPE_WEBHOOK_SIGNING_SECRET`

## 6. Collaudo

1. Entrare su `https://beta.dreamtaily.com` con un account permanente.
2. Completare un libro e premere **Acquista il PDF · €9,90**.
3. Pagare in modalità test dalla pagina Stripe.
4. Verificare il ritorno automatico a DreamTaily e la comparsa della schermata di generazione.
5. In Stripe controllare che il webhook `checkout.session.completed` risulti consegnato con risposta HTTP 200.

Facebook resta intenzionalmente nascosto; Google ed email/password rimangono disponibili.
