# DreamTaily — Gate 1 motore generativo

Pacchetto preparato sulla base della branch `Book-Creation` e dei documenti:
- `DreamTaily_progetto_motore_generativo`
- `DreamTaily_brief_motore_generativo_GPT`

Questa consegna si ferma volutamente al gate tecnico richiesto dal brief:
funzioni pure + test + prova di una singola pagina.

## File
- `src/identity-prompt.js`
- `src/scene-mask.js`
- `tests/identity-prompt.test.mjs`
- `tests/scene-mask.test.mjs`
- `tools/test_render_one_page.mjs`
- `db/migrations/20260825_book_renders.sql`
- `docs/render-engine-gate.md`
- `package.json`

Non include ancora `supabase/functions/render-book/index.ts` né la riscrittura di
`libro.html`: il brief stesso dice di costruirli solo dopo l'approvazione visiva
della prova su una pagina.
