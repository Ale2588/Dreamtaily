create table if not exists public.book_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  book_id uuid references public.books(id) on delete restrict,
  source text not null check (source in ('beta_grant', 'stripe')),
  state text not null default 'available' check (state in ('available', 'consumed', 'revoked')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  revoked_at timestamptz,
  constraint book_entitlements_state_shape_check check (
    (state = 'available' and book_id is null and consumed_at is null and revoked_at is null)
    or (state = 'consumed' and book_id is not null and consumed_at is not null and revoked_at is null)
    or (state = 'revoked' and revoked_at is not null)
  )
);

create unique index if not exists book_entitlements_book_id_unique
  on public.book_entitlements(book_id)
  where book_id is not null;

create index if not exists book_entitlements_available_user_idx
  on public.book_entitlements(user_id, created_at, id)
  where state = 'available';

comment on table public.book_entitlements is
  'Server-issued permission to freeze and render one book. Clients can read their own rows but never write them.';

alter table public.book_entitlements enable row level security;

drop policy if exists book_entitlements_select_own_permanent on public.book_entitlements;
create policy book_entitlements_select_own_permanent
on public.book_entitlements for select
to authenticated
using (
  user_id = (select auth.uid())
  and coalesce((select (auth.jwt()->>'is_anonymous')::boolean), false) is false
);

revoke all on table public.book_entitlements from anon, authenticated;
grant select on table public.book_entitlements to authenticated;

alter table public.book_renders
  add column if not exists entitlement_id uuid;

insert into public.book_entitlements (
  user_id, book_id, source, state, metadata, created_at, consumed_at
)
select
  b.profile_id,
  br.book_id,
  'beta_grant',
  'consumed',
  jsonb_build_object('reason', 'pre_entitlement_render_backfill'),
  coalesce(br.confirmed_at, br.created_at, now()),
  coalesce(br.confirmed_at, br.created_at, now())
from public.book_renders br
join public.books b on b.id = br.book_id
where not exists (
  select 1 from public.book_entitlements entitlement
  where entitlement.book_id = br.book_id
)
on conflict do nothing;

update public.book_renders br
set entitlement_id = entitlement.id
from public.book_entitlements entitlement
where entitlement.book_id = br.book_id
  and br.entitlement_id is null;

alter table public.book_renders
  drop constraint if exists book_renders_entitlement_id_fkey;
alter table public.book_renders
  add constraint book_renders_entitlement_id_fkey
  foreign key (entitlement_id) references public.book_entitlements(id) on delete restrict;

create unique index if not exists book_renders_entitlement_id_unique
  on public.book_renders(entitlement_id);

alter table public.book_renders
  alter column entitlement_id set not null;

create or replace function public.grant_book_entitlements_by_email(
  p_email text,
  p_quantity integer default 1,
  p_source text default 'beta_grant'
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, auth
as $$
declare
  v_user_id uuid;
  v_inserted integer;
begin
  if p_email is null or p_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'GRANT_EMAIL_INVALID';
  end if;
  if p_quantity < 1 or p_quantity > 100 then raise exception 'GRANT_QUANTITY_INVALID'; end if;
  if p_source not in ('beta_grant', 'stripe') then raise exception 'GRANT_SOURCE_INVALID'; end if;

  select id into v_user_id
  from auth.users
  where lower(email) = lower(btrim(p_email))
    and coalesce(is_anonymous, false) is false;
  if not found then raise exception 'PERMANENT_USER_NOT_FOUND'; end if;

  insert into public.book_entitlements(user_id, source, metadata)
  select v_user_id, p_source, jsonb_build_object('granted_for', lower(btrim(p_email)))
  from generate_series(1, p_quantity);
  get diagnostics v_inserted = row_count;

  return jsonb_build_object('user_id', v_user_id, 'granted', v_inserted, 'source', p_source);
end;
$$;

revoke all on function public.grant_book_entitlements_by_email(text,integer,text)
  from public, anon, authenticated;
grant execute on function public.grant_book_entitlements_by_email(text,integer,text)
  to service_role;

create or replace function public.finalize_book_checkout_v1(
  p_book_id uuid,
  p_profile_id uuid,
  p_idempotency_key text,
  p_checkout_email text,
  p_book_snapshot jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_book public.books%rowtype;
  v_render public.book_renders%rowtype;
  v_entitlement public.book_entitlements%rowtype;
  v_story_count integer;
begin
  if p_profile_id is null then raise exception 'PROFILE_REQUIRED'; end if;
  if nullif(btrim(p_idempotency_key), '') is null then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
  if p_checkout_email is null or p_checkout_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'CHECKOUT_EMAIL_INVALID';
  end if;
  if jsonb_typeof(p_book_snapshot) <> 'object' or coalesce(p_book_snapshot->>'schema_version','') <> 'checkout-book-v1' then
    raise exception 'BOOK_SNAPSHOT_INVALID';
  end if;

  select * into v_render
  from public.book_renders
  where idempotency_key = p_idempotency_key;

  if found then
    if v_render.book_id <> p_book_id then raise exception 'IDEMPOTENCY_KEY_CONFLICT'; end if;
    select * into v_book from public.books where id = p_book_id and profile_id = p_profile_id;
    if not found then raise exception 'BOOK_NOT_FOUND'; end if;
    if not exists (
      select 1 from public.book_entitlements entitlement
      where entitlement.id = v_render.entitlement_id
        and entitlement.user_id = p_profile_id
        and entitlement.book_id = p_book_id
        and entitlement.state = 'consumed'
    ) then raise exception 'ENTITLEMENT_REQUIRED'; end if;
    return jsonb_build_object(
      'render_id', v_render.id,
      'book_id', v_render.book_id,
      'status', v_render.status,
      'permalink_slug', v_render.permalink_slug,
      'idempotent', true
    );
  end if;

  select * into v_book
  from public.books
  where id = p_book_id and profile_id = p_profile_id
  for update;
  if not found then raise exception 'BOOK_NOT_FOUND'; end if;
  if v_book.status <> 'draft' then raise exception 'BOOK_NOT_EDITABLE'; end if;

  select count(*) into v_story_count
  from public.book_stories
  where book_id = p_book_id;
  if v_story_count = 0 then raise exception 'BOOK_HAS_NO_STORIES'; end if;
  if exists (
    select 1 from public.book_stories
    where book_id = p_book_id
      and (status <> 'ready' or content_snapshot is null)
  ) then raise exception 'BOOK_STORIES_INCOMPLETE'; end if;

  select * into v_entitlement
  from public.book_entitlements
  where user_id = p_profile_id and state = 'available'
  order by created_at, id
  for update skip locked
  limit 1;
  if not found then raise exception 'ENTITLEMENT_REQUIRED'; end if;

  update public.book_entitlements
  set state = 'consumed', book_id = p_book_id, consumed_at = now()
  where id = v_entitlement.id and state = 'available'
  returning * into v_entitlement;
  if not found then raise exception 'ENTITLEMENT_REQUIRED'; end if;

  insert into public.book_renders (
    book_id, status, idempotency_key, book_snapshot, pages,
    checkout_email, confirmed_at, entitlement_id, updated_at
  ) values (
    p_book_id, 'queued', p_idempotency_key, p_book_snapshot, '[]'::jsonb,
    lower(btrim(p_checkout_email)), now(), v_entitlement.id, now()
  ) returning * into v_render;

  update public.book_stories
  set status = 'snapshotted', updated_at = now()
  where book_id = p_book_id;

  update public.books
  set status = 'paid', updated_at = now()
  where id = p_book_id;

  return jsonb_build_object(
    'render_id', v_render.id,
    'book_id', v_render.book_id,
    'status', v_render.status,
    'permalink_slug', v_render.permalink_slug,
    'idempotent', false
  );
end;
$$;

revoke all on function public.finalize_book_checkout_v1(uuid,uuid,text,text,jsonb)
  from public, anon, authenticated;
grant execute on function public.finalize_book_checkout_v1(uuid,uuid,text,text,jsonb)
  to service_role;
