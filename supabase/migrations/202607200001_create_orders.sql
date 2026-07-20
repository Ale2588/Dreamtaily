-- DreamTaily orders table
-- Safe baseline for a public frontend using the Supabase anon key.
-- Anonymous clients may create orders, but cannot read, update, or delete them.

create extension if not exists pgcrypto;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),

  name text not null
    check (char_length(btrim(name)) between 1 and 80),

  description text not null default ''
    check (char_length(description) <= 1000),

  style text not null
    check (style in ('paper', 'water', 'crayon')),

  companion text not null
    check (companion in (
      'rabbit',
      'bear',
      'fox',
      'owl',
      'frog',
      'eagle',
      'hedgehog',
      'mouse'
    )),

  choices jsonb not null
    check (jsonb_typeof(choices) = 'object'),

  plan text not null
    check (plan in ('digital', 'print')),

  email text not null
    check (
      char_length(email) between 3 and 254
      and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),

  status text not null default 'new'
    check (status in (
      'new',
      'payment_pending',
      'paid',
      'generating',
      'ready',
      'fulfilled',
      'cancelled',
      'failed'
    )),

  preview_id uuid,
  preview_url text
    check (preview_url is null or char_length(preview_url) <= 2048),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);

create index if not exists orders_status_idx
  on public.orders (status);

create index if not exists orders_email_idx
  on public.orders (lower(email));

create unique index if not exists orders_preview_id_unique_idx
  on public.orders (preview_id)
  where preview_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_orders_updated_at on public.orders;

create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

alter table public.orders enable row level security;

-- Remove older policies with the same intended names, so the migration is repeatable.
drop policy if exists "anon_can_create_orders" on public.orders;
drop policy if exists "authenticated_can_create_orders" on public.orders;

-- Public visitors may submit an order.
-- They cannot choose an internal processing status other than "new".
create policy "anon_can_create_orders"
on public.orders
for insert
to anon
with check (
  status = 'new'
  and created_at <= now()
  and updated_at <= now()
);

-- Keeps the same flow working if authentication is added later.
create policy "authenticated_can_create_orders"
on public.orders
for insert
to authenticated
with check (
  status = 'new'
  and created_at <= now()
  and updated_at <= now()
);

grant usage on schema public to anon, authenticated;
grant insert on table public.orders to anon, authenticated;

-- Explicitly prevent direct browser access to stored orders.
revoke select, update, delete, truncate, references, trigger
  on table public.orders
  from anon, authenticated;

comment on table public.orders is
  'Customer orders submitted by the DreamTaily frontend. Public clients may insert only; all operational access must happen server-side.';
