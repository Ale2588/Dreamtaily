# Revisione della migration prodotta da `supabase db pull`

Non approvare automaticamente il file generato.

## Verificare che contenga

```text
profiles
character_assets
character_references
books
book_stories
story_cast_assignments
book_stories.path_choices jsonb
RLS ENABLE
policy per proprietario
indice draft unico per profile_id
unique (book_story_id, slot_key)
XOR character_asset_id / catalog_character_id
```

## Vincolo XOR atteso

Una forma equivalente a:

```sql
check (
  num_nonnulls(character_asset_id, catalog_character_id) = 1
)
```

## Draft unico

Deve esserci un indice o vincolo equivalente a:

```sql
create unique index ...
on public.books(profile_id)
where status = 'draft';
```

## Non fare

- non cancellare migration vecchie alla cieca;
- non riscrivere la cronologia remota;
- non inventare una baseline diversa dal database;
- non fare merge prima del test di ricostruzione.

## Test di ricostruzione successivo

Quando lo schema è consolidato:

```bash
supabase start
supabase db reset
```

Il reset locale deve terminare senza errori applicando tutte le migration versionate.
