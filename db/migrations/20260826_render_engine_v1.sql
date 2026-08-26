-- DreamTaily — Render Engine schema v1
-- Built from the verified Supabase schema audit, 2026-08-26.

begin;

alter table public.character_assets
  add column if not exists identity_prompt text;

comment on column public.character_assets.identity_prompt is
  'Immutable visual identity reinforcement used by final-book image rendering. No proper name.';

create table if not exists public.book_renders (
  id uuid primary key default gen_random_uuid(),

  book_id uuid not null
    references public.books(id)
    on delete cascade,

  status text not null default 'queued'
    check (status in ('queued','running','ready','failed','review')),

  idempotency_key text not null unique,
  permalink_slug text unique,

  book_snapshot jsonb not null,
  pages jsonb not null default '[]'::jsonb,

  error text,

  started_at timestamptz,
  finished_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint book_renders_book_snapshot_object_check
    check (jsonb_typeof(book_snapshot) = 'object'),

  constraint book_renders_pages_array_check
    check (jsonb_typeof(pages) = 'array')
);

create index if not exists book_renders_book_idx
  on public.book_renders (book_id, created_at desc);

create index if not exists book_renders_status_idx
  on public.book_renders (status, created_at);

create index if not exists book_renders_permalink_idx
  on public.book_renders (permalink_slug)
  where permalink_slug is not null;

alter table public.book_renders enable row level security;

drop policy if exists book_renders_select_own on public.book_renders;
create policy book_renders_select_own
on public.book_renders
for select
to authenticated
using (
  exists (
    select 1
    from public.books b
    where b.id = book_renders.book_id
      and b.profile_id = auth.uid()
  )
);

drop policy if exists book_renders_insert_own on public.book_renders;
create policy book_renders_insert_own
on public.book_renders
for insert
to authenticated
with check (
  exists (
    select 1
    from public.books b
    where b.id = book_renders.book_id
      and b.profile_id = auth.uid()
  )
);

comment on table public.book_renders is
  'Immutable-book render jobs. Server-side worker owns render state transitions.';

commit;
