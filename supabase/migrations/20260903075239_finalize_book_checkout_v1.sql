alter table public.book_renders
  add column if not exists checkout_email text,
  add column if not exists confirmed_at timestamptz;

alter table public.book_renders
  drop constraint if exists book_renders_checkout_email_check;

alter table public.book_renders
  add constraint book_renders_checkout_email_check
  check (
    checkout_email is null or (
      char_length(checkout_email) between 3 and 254
      and checkout_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    )
  );

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

  insert into public.book_renders (
    book_id, status, idempotency_key, book_snapshot, pages,
    checkout_email, confirmed_at, updated_at
  ) values (
    p_book_id, 'queued', p_idempotency_key, p_book_snapshot, '[]'::jsonb,
    lower(btrim(p_checkout_email)), now(), now()
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

revoke all on function public.finalize_book_checkout_v1(uuid,uuid,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.finalize_book_checkout_v1(uuid,uuid,text,text,jsonb) to service_role;

drop policy if exists books_update_own on public.books;
create policy books_update_own
on public.books for update
to authenticated
using (profile_id = (select auth.uid()) and status = 'draft')
with check (profile_id = (select auth.uid()) and status = 'draft');

drop policy if exists books_delete_own on public.books;
create policy books_delete_own
on public.books for delete
to authenticated
using (profile_id = (select auth.uid()) and status = 'draft');
