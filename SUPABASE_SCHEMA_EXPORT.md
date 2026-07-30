# Supabase — estrazione dello schema reale

Non è stato creato un baseline SQL inventato: per consolidare le migration serve lo schema effettivo del progetto Supabase.

## Procedura consigliata con Supabase CLI

Dalla root del repository:

```bash
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db pull
```

`supabase db pull` genera una migration che rappresenta le differenze dello schema remoto.

Prima del commit, verificare che includa almeno:

- `profiles`
- `character_assets`
- `character_references`
- `books`
- `book_stories`
- `story_cast_assignments`
- policy RLS
- indici, incluso l'unico draft per profilo
- `book_stories.path_choices`
- CHECK XOR con `num_nonnulls(character_asset_id, catalog_character_id) = 1`

## Pulizia

Le migration del vecchio modello generativo non vanno cancellate alla cieca. Prima:

1. confrontarle con lo schema remoto;
2. verificare se sono già registrate nella tabella delle migration;
3. archiviarle o sostituirle solo tramite una strategia di baseline concordata.

## Gate

Il branch non va fuso finché:

- il test RLS multiutente non è completato;
- un ambiente vuoto non riesce a ricostruire lo schema dalle migration versionate.
