# DreamTaily — DT-RE-030 → DT-RE-033

Pacchetto schema costruito sull'audit Supabase reale del 26/08/2026.

## File
- `db/migrations/20260826_render_engine_v1.sql`
- `db/verify_render_engine_v1.sql`
- `docs/render-schema-v1.md`

## Atteso dopo la migration
- `identity_prompt_exists = true`
- `book_renders_exists = true`
- `book_renders_rls_enabled = true`
- `anonymous_policies_count = 0`

Non modifica `books`, `book_stories`, `story-composer.js` o la preview.
