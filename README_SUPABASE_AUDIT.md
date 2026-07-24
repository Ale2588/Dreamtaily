# DreamTaily — Audit schema Supabase

Questo pacchetto non crea né modifica lo schema remoto.

Serve a:

1. collegare il repository al progetto Supabase;
2. estrarre lo schema reale con `supabase db pull`;
3. verificare tabelle, colonne, vincoli, indici e RLS;
4. raccogliere un report leggibile prima del merge.

## Requisiti

- Supabase CLI installata;
- Docker avviato, se richiesto dalla CLI;
- accesso al progetto Supabase;
- `PROJECT_REF` del progetto.

## Procedura semplice

Dalla root del repository, copia dentro il progetto i file di questo pacchetto e avvia:

### macOS, Linux o Git Bash

```bash
bash tools/audit_supabase_schema.sh
```

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File tools/audit_supabase_schema.ps1
```

Lo script chiede il `PROJECT_REF`, esegue il collegamento e tenta il `db pull`.

Poi apri Supabase Dashboard → SQL Editor, incolla:

```text
supabase/audit/verify_schema.sql
```

Salva il risultato come:

```text
supabase/audit/verification_result.csv
```

## Cosa deve risultare

### Tabelle

- profiles
- character_assets
- character_references
- books
- book_stories
- story_cast_assignments

### Colonne essenziali

- `book_stories.path_choices`
- `story_cast_assignments.character_asset_id`
- `story_cast_assignments.catalog_character_id`

`path_choices` è una colonna `jsonb`, non una tabella.

### Vincoli

- una sola sorgente cast valorizzata;
- unique su `(book_story_id, slot_key)`;
- una sola bozza per profilo, tramite indice parziale o vincolo equivalente.

### RLS

RLS deve essere attiva almeno sulle tabelle private dell’utente.

## Gate

Non fare merge finché:

- il `db pull` non produce una migration versionabile;
- tutte le verifiche obbligatorie sono PASS;
- il test multiutente RLS è confermato;
- lo schema può essere ricostruito in un ambiente vuoto.
