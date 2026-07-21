# Supabase setup

This directory contains the versioned database setup for DreamTaily.

## Files

- `migrations/202607200001_create_orders.sql` creates the `orders` table, validation constraints, indexes and Row Level Security policies.

## Apply the migration

### Option A: Supabase SQL Editor

1. Open the DreamTaily project in Supabase.
2. Go to **SQL Editor**.
3. Create a new query.
4. Paste the full contents of the migration file.
5. Run it once.
6. Confirm that `public.orders` appears in **Table Editor**.

### Option B: Supabase CLI

After linking the local repository to the correct Supabase project:

```bash
supabase db push
```

Do not run a production migration against the wrong project. Check the linked project reference first.

## Frontend configuration

The browser needs only these public values:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

The anon key is designed to be exposed in a browser application, provided Row Level Security is enabled and the policies are restrictive.

Never place any of these in `index.html`, GitHub, client-side JavaScript or screenshots:

- `service_role` key
- database password
- OpenAI API key
- Stripe secret key
- webhook signing secrets

Secrets used by an Edge Function must be stored with Supabase secrets, for example:

```bash
supabase secrets set OPENAI_API_KEY=...
```

## Security model

The migration intentionally allows public clients to:

- insert a new order with status `new`.

It intentionally prevents public clients from:

- reading orders;
- updating order status;
- changing existing orders;
- deleting orders.

Administrative processing must happen through a trusted backend or Supabase Edge Function using server-side credentials.

## Important limitation

Database policies do not provide effective rate limiting. Before enabling paid image generation publicly, protect `generate-preview` with:

- strict input validation;
- duplicate-request protection;
- per-IP or per-session quotas;
- server-side cost limits;
- logging and monitoring.

Do not rely on a UUID generated in the browser as the only abuse protection.

## Verification query

Run this in the SQL Editor after applying the migration:

```sql
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd
from pg_policies
where schemaname = 'public'
  and tablename = 'orders'
order by policyname;
```

You should see insert policies only. There should be no public select, update or delete policy.
