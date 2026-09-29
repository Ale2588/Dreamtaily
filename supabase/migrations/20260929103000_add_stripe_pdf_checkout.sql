create table if not exists public.stripe_pdf_checkouts (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text not null unique,
  stripe_event_id text unique,
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete restrict,
  price_id text not null,
  status text not null default 'open' check (status in ('open','complete','expired')),
  checkout_url text,
  expires_at timestamptz,
  amount_total bigint,
  currency text,
  entitlement_id uuid unique references public.book_entitlements(id) on delete restrict,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create unique index if not exists stripe_pdf_checkouts_one_open_per_book
  on public.stripe_pdf_checkouts(book_id) where status = 'open';
create index if not exists stripe_pdf_checkouts_user_created_idx
  on public.stripe_pdf_checkouts(user_id, created_at desc);

alter table public.stripe_pdf_checkouts enable row level security;
drop policy if exists stripe_pdf_checkouts_select_own on public.stripe_pdf_checkouts;
create policy stripe_pdf_checkouts_select_own
on public.stripe_pdf_checkouts for select to authenticated
using (user_id = (select auth.uid()));
revoke all on table public.stripe_pdf_checkouts from anon, authenticated;
grant select on table public.stripe_pdf_checkouts to authenticated;

create or replace function public.complete_stripe_pdf_checkout(
  p_stripe_session_id text,
  p_stripe_event_id text,
  p_user_id uuid,
  p_book_id uuid,
  p_price_id text,
  p_amount_total bigint,
  p_currency text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_checkout public.stripe_pdf_checkouts%rowtype;
  v_entitlement_id uuid;
begin
  select * into v_checkout
  from public.stripe_pdf_checkouts
  where stripe_session_id = p_stripe_session_id
  for update;

  if not found then raise exception 'STRIPE_CHECKOUT_NOT_FOUND'; end if;
  if v_checkout.user_id <> p_user_id or v_checkout.book_id <> p_book_id or v_checkout.price_id <> p_price_id then
    raise exception 'STRIPE_CHECKOUT_MISMATCH';
  end if;
  if v_checkout.status = 'complete' then
    return jsonb_build_object('entitlement_id', v_checkout.entitlement_id, 'idempotent', true);
  end if;

  insert into public.book_entitlements(user_id, source, metadata)
  values (
    p_user_id,
    'stripe',
    jsonb_build_object('stripe_session_id', p_stripe_session_id, 'price_id', p_price_id, 'purchased_for_book_id', p_book_id)
  )
  returning id into v_entitlement_id;

  update public.stripe_pdf_checkouts
  set status = 'complete', stripe_event_id = p_stripe_event_id,
      entitlement_id = v_entitlement_id, amount_total = p_amount_total,
      currency = lower(p_currency), completed_at = now(), updated_at = now()
  where id = v_checkout.id;

  return jsonb_build_object('entitlement_id', v_entitlement_id, 'idempotent', false);
end;
$$;

revoke all on function public.complete_stripe_pdf_checkout(text,text,uuid,uuid,text,bigint,text)
  from public, anon, authenticated;
grant execute on function public.complete_stripe_pdf_checkout(text,text,uuid,uuid,text,bigint,text)
  to service_role;
