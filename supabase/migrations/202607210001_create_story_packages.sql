-- DreamTaily story engine persistence
create extension if not exists pgcrypto;

create table if not exists public.story_packages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  schema_version text not null default '1.0' check (schema_version = '1.0'),
  status text not null default 'ready'
    check (status in ('generating','ready','failed','superseded')),
  input_snapshot jsonb not null check (jsonb_typeof(input_snapshot) = 'object'),
  story_bible jsonb not null check (jsonb_typeof(story_bible) = 'object'),
  story_outline jsonb not null check (jsonb_typeof(story_outline) = 'object'),
  visual_bible jsonb not null check (jsonb_typeof(visual_bible) = 'object'),
  model text not null,
  prompt_version text not null,
  generation_metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(generation_metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists story_packages_one_active_per_order_idx
  on public.story_packages(order_id)
  where status in ('generating','ready');

create index if not exists story_packages_created_at_idx
  on public.story_packages(created_at desc);

drop trigger if exists set_story_packages_updated_at on public.story_packages;
create trigger set_story_packages_updated_at
before update on public.story_packages
for each row execute function public.set_updated_at();

alter table public.story_packages enable row level security;
revoke all on table public.story_packages from anon, authenticated;

comment on table public.story_packages is
  'Server-side narrative and visual source of truth generated from an order.';
