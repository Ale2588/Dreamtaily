# DreamTaily — DT-RE-040 → DT-RE-047

## Pipeline implementata

`render-book`:

1. autentica l'utente;
2. verifica ownership di `book_id`;
3. legge il `content_snapshot` già risolto;
4. crea/recupera `book_renders` tramite `idempotency_key`;
5. recupera lo stesso reference privato del protagonista;
6. ricostruisce e persiste `identity_prompt` se manca su un vecchio personaggio;
7. pianifica cover + pagine;
8. per ogni pagina usa:
   - Image 1 = background;
   - Image 2 = protagonista;
   - Image 3 = helper solo se la scena lo contiene;
9. costruisce il prompt con `src/render-prompts.js`;
10. chiama OpenAI Image API `/v1/images/edits`;
11. usa `gpt-image-2` di default;
12. retry max 3;
13. batch paralleli max 3;
14. persiste i risultati dopo ogni batch;
15. salva PNG in Storage privato `book-renders`;
16. salva `generated_image_path` e `generated_image_url`;
17. `ready` solo se tutte le pagine sono pronte, altrimenti `review`.

## Scelta importante: snapshot

La Edge Function NON ricompone la storia.

`finishStoryComposer()` deve prima salvare `dtComposedBook` in
`book_stories.content_snapshot`.

La funzione copia quel valore in `book_renders.book_snapshot`.

Quindi:

`composer deterministico -> content_snapshot -> book_snapshot -> render AI`

## Idempotenza

- stessa chiave su job completato: restituisce stato, non rigenera;
- job `running` recente: restituisce `202`;
- job `running` bloccato oltre 15 minuti: resume;
- i batch già salvati non vengono rigenerati.

## Env richieste

- `OPENAI_API_KEY`
- `DREAMTAILY_ASSET_BASE_URL`

Normalmente già presenti in Supabase Edge:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Opzionali:
- `OPENAI_IMAGE_MODEL=gpt-image-2`
- `OPENAI_IMAGE_SIZE=1536x1024`
- `OPENAI_IMAGE_QUALITY=medium`
- `DREAMTAILY_RENDER_BUCKET=book-renders`
- `RENDER_MAX_CONCURRENCY=3`
- `RENDER_MAX_ATTEMPTS=3`
- `RENDER_STALE_MINUTES=15`
- `RENDER_SIGNED_URL_SECONDS=604800`

Per il progetto corrente:

`DREAMTAILY_ASSET_BASE_URL=https://ale2588.github.io/Dreamtaily`

## Chiamata

```json
{
  "book_id": "<uuid>",
  "idempotency_key": "manual-test-<uuid>"
}
```

## Limitazioni v1

- solo una storia per libro;
- solo `Il bosco dei sussurri`;
- niente OCR automatico;
- niente mask nel flusso primario;
- `generated_image_url` è firmato e scade; la futura delivery function
  rigenererà URL dai `generated_image_path`.

## Prossimo step

1. integrare `content_snapshot`;
2. deploy `render-book`;
3. configurare due secret;
4. invocare un libro reale;
5. poi costruire delivery + `libro.html`.
