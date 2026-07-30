alter table public.book_stories
  add column if not exists path_choices jsonb not null default '{}'::jsonb;
