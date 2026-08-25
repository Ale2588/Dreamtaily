# DreamTaily render engine — Gate 1

## Scope

This package intentionally stops before the full `render-book` worker.

The implementation brief explicitly makes the one-page inpainting test the technical gate.
Until the visual result is approved, building retries, concurrency, storage delivery and
permalinks would be premature.

## Included

- `src/identity-prompt.js`
- `src/scene-mask.js`
- tests for both pure modules
- `tools/test_render_one_page.mjs`
- schema foundation for `identity_prompt` and `book_renders`
- package.json test scripts

No change to `src/story-composer.js`.
No change to the deterministic preview.

## Important OpenAI API correction (verified 25 Aug 2026)

Current official GPT Image 2 documentation says:

1. mask editing is prompt-guided and may not follow the exact mask shape;
2. with multiple input images, the mask applies to the first image;
3. mask and image must match format and dimensions;
4. the mask must have an alpha channel;
5. GPT Image 2 processes image inputs at high fidelity.

Therefore the original architecture's statement
"outside mask identical = guaranteed by mask" is too strong.

For DreamTaily, "outside mask identical" should remain a validation criterion.
If live tests show leakage outside the mask, the production worker should hard-composite
the generated pixels back onto the original background inside the accepted mask, rather
than relying only on retries.

## Identity prompt limitation

`buildCharacter()` currently accepts free-form user values (often Italian). A pure,
deterministic function cannot reliably translate arbitrary free text into English.

`buildIdentityPrompt()` therefore:
- produces deterministic ordering and visual phrasing;
- never includes the proper name;
- preserves free-form values verbatim.

If strict English is mandatory, the input form must first move to a controlled vocabulary
(or store normalized English values alongside display labels).

## Run tests

```bash
npm test
```

## Dry-run the one-page gate

From repository root:

```bash
node tools/test_render_one_page.mjs \
  --protagonist /path/to/protagonist-reference.png \
  --identity "a young child, warm brown skin, dark brown eyes, curly black hair, mustard-yellow raincoat, teal boots" \
  --scene s3_felci \
  --atmosphere giorno \
  --dry-run
```

This writes:

```text
tmp/render-gate/background.png
tmp/render-gate/mask.png
tmp/render-gate/request.json
```

No API request is made.

## Live one-page gate

```bash
OPENAI_API_KEY=... node tools/test_render_one_page.mjs \
  --protagonist /path/to/protagonist-reference.png \
  --identity "a young child, warm brown skin, dark brown eyes, curly black hair, mustard-yellow raincoat, teal boots" \
  --scene s3_felci \
  --atmosphere giorno \
  --quality low
```

The output adds:

```text
tmp/render-gate/result.png
```

Approve or reject the visual result before implementing the full pipeline.

## Before applying SQL

The migration's RLS policy assumes `books.profile_id`, matching the current client code.
Verify this against the live Supabase schema before applying the migration.
