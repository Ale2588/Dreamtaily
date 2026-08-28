-- DreamTaily render engine schema foundation.
-- Gate 1 creates the immutable render storage contract but does not wire payment yet.

alter table character_assets
  add column if not exists identity_prompt text;

create table if not exists book_renders (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  status text not null
    check (status in ('queued','running','ready','failed','review')),
  idempotency_key text unique not null,
  permalink_slug text unique,
  book_snapshot jsonb not null,
  pages jsonb not null default '[]'::jsonb,
  error text,
  started_at timestamptz default now(),
  finished_at timestamptz
);

create index if not exists book_renders_book_id_idx
  on book_renders(book_id);

alter table book_renders enable row level security;

-- Assumption grounded in current client code: books has profile_id.
-- Verify against the production schema before applying.
create policy "users can read own book renders"
  on book_renders
  for select
  using (
    exists (
      select 1
      from books
      where books.id = book_renders.book_id
        and books.profile_id = auth.uid()
    )
  );
