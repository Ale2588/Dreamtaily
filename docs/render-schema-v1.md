# DreamTaily — Schema Render Engine v1

## Verificato sul DB reale

L'audit Supabase del 26/08/2026 conferma:

- `books.profile_id uuid not null`
- FK `books.profile_id -> profiles.id`
- `books` RLS attiva
- `book_stories.path_choices jsonb not null`
- `book_stories.content_snapshot jsonb` già esistente
- `character_assets` RLS attiva
- `character_references.storage_path`
- `story_cast_assignments.character_asset_id`
- `story_cast_assignments.catalog_character_id`
- RLS attiva su tutte le tabelle coinvolte

## Decisione su `content_snapshot`

`book_stories.content_snapshot` è utile per congelare una singola storia, ma il render finale
ha bisogno di un artefatto autosufficiente a livello di libro:

- meta/cover;
- ordine pagine;
- testo già risolto;
- scene già risolte;
- cast già risolto;
- reference/prompts congelati.

Per questo `book_renders.book_snapshot` resta necessario.

## Sicurezza permalink

Il DB attuale possiede una policy anonima su `books` per i record `ready`.

Non viene replicata su `book_renders`.

Per il libro pubblico useremo una Edge Function di delivery che:
1. riceve `permalink_slug`;
2. esegue lookup esatto con service role;
3. restituisce solo il singolo render richiesto.

Quindi nessun anon SELECT diretto su `book_renders`.

## Policy `book_renders`

Browser autenticato:
- SELECT own
- INSERT own

Browser autenticato:
- NO UPDATE
- NO DELETE

Worker service role:
- aggiorna stato;
- salva pagine;
- imposta permalink;
- chiude job.

## Prossimo step

1. Applicare questa migration in Supabase.
2. Eseguire `db/verify_render_engine_v1.sql`.
3. Persistenza `identity_prompt` nel salvataggio character asset.
4. QA tre scene col Prompt Engine.
5. Costruire `render-book`.
