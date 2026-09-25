-- P1-18B: safe hand-off from an anonymous DreamTaily profile to an existing account.
-- The frontend is intentionally not wired to this backend in this release.

create extension if not exists pgcrypto;

-- Preserve both drafts during a merge: the source draft is archived when the
-- destination already owns an active draft.
drop index if exists public.books_one_draft_per_profile_idx;
create unique index books_one_active_draft_per_profile_idx
  on public.books (profile_id)
  where status = 'draft' and archived_at is null and profile_id is not null;

create table if not exists public.account_merge_claims (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  source_user_id uuid not null,
  target_user_id uuid,
  status text not null default 'prepared'
    check (status in ('prepared', 'completed', 'cancelled')),
  result jsonb not null default '{}'::jsonb
    check (jsonb_typeof(result) = 'object'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check (char_length(token_hash) = 64),
  check (expires_at > created_at),
  check ((status = 'completed') = (completed_at is not null))
);

alter table public.account_merge_claims enable row level security;
revoke all on table public.account_merge_claims from public, anon, authenticated;
grant select, insert, update, delete on table public.account_merge_claims to service_role;

create unique index if not exists account_merge_one_prepared_per_source_idx
  on public.account_merge_claims (source_user_id)
  where status = 'prepared';
create index if not exists account_merge_claims_expiry_idx
  on public.account_merge_claims (expires_at)
  where status = 'prepared';

comment on table public.account_merge_claims is
  'Short-lived, server-only proof that an anonymous user initiated an account merge.';

create or replace function public.prepare_account_merge_v1(
  p_source_user_id uuid,
  p_token_hash text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claim_id uuid;
  v_is_anonymous boolean;
begin
  if p_source_user_id is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'MERGE_PREPARE_INVALID';
  end if;
  if p_expires_at <= now() or p_expires_at > now() + interval '20 minutes' then
    raise exception 'MERGE_EXPIRY_INVALID';
  end if;

  select u.is_anonymous into v_is_anonymous
  from auth.users u
  where u.id = p_source_user_id and u.deleted_at is null;
  if coalesce(v_is_anonymous, false) is not true then
    raise exception 'MERGE_SOURCE_NOT_ANONYMOUS';
  end if;

  update public.account_merge_claims
  set status = 'cancelled'
  where source_user_id = p_source_user_id and status = 'prepared';

  insert into public.account_merge_claims(token_hash, source_user_id, expires_at)
  values (p_token_hash, p_source_user_id, p_expires_at)
  returning id into v_claim_id;
  return v_claim_id;
end;
$$;

create or replace function public.finalize_account_merge_v1(
  p_token_hash text,
  p_target_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_claim public.account_merge_claims%rowtype;
  v_source_anonymous boolean;
  v_target_anonymous boolean;
  v_target_email text;
  v_character_count integer;
  v_book_count integer;
  v_project_count integer;
  v_archived_source_draft boolean := false;
  v_result jsonb;
begin
  if p_target_user_id is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'MERGE_FINALIZE_INVALID';
  end if;

  select * into v_claim
  from public.account_merge_claims
  where token_hash = p_token_hash
  for update;
  if not found then raise exception 'MERGE_CLAIM_NOT_FOUND'; end if;

  if v_claim.status = 'completed' then
    if v_claim.target_user_id <> p_target_user_id then
      raise exception 'MERGE_TARGET_MISMATCH';
    end if;
    return v_claim.result || jsonb_build_object('source_user_id', v_claim.source_user_id);
  end if;
  if v_claim.status <> 'prepared' then raise exception 'MERGE_CLAIM_INACTIVE'; end if;
  if v_claim.expires_at <= now() then raise exception 'MERGE_CLAIM_EXPIRED'; end if;
  if v_claim.source_user_id = p_target_user_id then raise exception 'MERGE_USERS_MUST_DIFFER'; end if;

  select u.is_anonymous into v_source_anonymous
  from auth.users u
  where u.id = v_claim.source_user_id and u.deleted_at is null;
  select u.is_anonymous, u.email into v_target_anonymous, v_target_email
  from auth.users u
  where u.id = p_target_user_id and u.deleted_at is null;
  if coalesce(v_source_anonymous, false) is not true then
    raise exception 'MERGE_SOURCE_NOT_ANONYMOUS';
  end if;
  if coalesce(v_target_anonymous, true) is true or v_target_email is null then
    raise exception 'MERGE_TARGET_NOT_PERMANENT';
  end if;

  -- Lock both ownership roots before checking conflicts and moving rows.
  perform 1 from public.profiles
  where id in (v_claim.source_user_id, p_target_user_id)
  order by id for update;
  perform 1 from public.books
  where profile_id in (v_claim.source_user_id, p_target_user_id)
  order by id for update;
  perform 1 from public.character_assets
  where profile_id in (v_claim.source_user_id, p_target_user_id)
  order by id for update;

  insert into public.profiles(id, email)
  values (p_target_user_id, lower(v_target_email))
  on conflict (id) do update
    set email = coalesce(public.profiles.email, excluded.email), updated_at = now();

  if exists (
    select 1
    from public.character_assets source_asset
    join public.character_assets target_asset
      on target_asset.profile_id = p_target_user_id
     and target_asset.client_request_id = source_asset.client_request_id
    where source_asset.profile_id = v_claim.source_user_id
      and source_asset.client_request_id is not null
  ) then
    raise exception 'MERGE_CHARACTER_CONFLICT';
  end if;

  select count(*) into v_character_count
  from public.character_assets where profile_id = v_claim.source_user_id;
  select count(*) into v_book_count
  from public.books where profile_id = v_claim.source_user_id;
  select count(*) into v_project_count
  from public.story_projects where owner_id = v_claim.source_user_id;

  if exists (
    select 1 from public.books
    where profile_id = p_target_user_id and status = 'draft' and archived_at is null
  ) and exists (
    select 1 from public.books
    where profile_id = v_claim.source_user_id and status = 'draft' and archived_at is null
  ) then
    update public.books set archived_at = now(), updated_at = now()
    where profile_id = v_claim.source_user_id and status = 'draft' and archived_at is null;
    v_archived_source_draft := true;
  end if;

  update public.character_assets
  set profile_id = p_target_user_id, updated_at = now()
  where profile_id = v_claim.source_user_id;

  update public.books
  set profile_id = p_target_user_id, updated_at = now()
  where profile_id = v_claim.source_user_id;

  update public.story_projects
  set owner_id = p_target_user_id, updated_at = now()
  where owner_id = v_claim.source_user_id;

  v_result := jsonb_build_object(
    'characters_moved', v_character_count,
    'books_moved', v_book_count,
    'story_projects_moved', v_project_count,
    'source_draft_archived', v_archived_source_draft
  );
  update public.account_merge_claims
  set status = 'completed', target_user_id = p_target_user_id,
      result = v_result, completed_at = now()
  where id = v_claim.id;

  -- source_user_id is returned only to the server so it can remove the obsolete
  -- anonymous Auth user after the database transaction commits.
  return v_result || jsonb_build_object('source_user_id', v_claim.source_user_id);
end;
$$;

revoke all on function public.prepare_account_merge_v1(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.finalize_account_merge_v1(text, uuid) from public, anon, authenticated;
grant execute on function public.prepare_account_merge_v1(uuid, text, timestamptz) to service_role;
grant execute on function public.finalize_account_merge_v1(text, uuid) to service_role;

-- Migrated private references keep their original immutable storage path. The
-- new owner may read a file only when the relational asset now belongs to them.
drop policy if exists character_reference_files_select_migrated on storage.objects;
create policy character_reference_files_select_migrated
on storage.objects for select
to authenticated
using (
  bucket_id = 'character-references'
  and exists (
    select 1
    from public.character_references cr
    join public.character_assets ca on ca.id = cr.character_asset_id
    where cr.storage_path = storage.objects.name
      and ca.profile_id = (select auth.uid())
  )
);

