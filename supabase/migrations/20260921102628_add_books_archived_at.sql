alter table public.books
  add column if not exists archived_at timestamptz null;

create index if not exists books_profile_archived_updated_idx
  on public.books (profile_id, archived_at, updated_at desc);
