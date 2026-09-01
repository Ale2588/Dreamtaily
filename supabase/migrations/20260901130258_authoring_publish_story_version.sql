create or replace function public.publish_story_version_atomic(
  p_version_id uuid,
  p_expected_updated_at timestamptz,
  p_published_contract jsonb
)
returns table (
  version_id uuid,
  project_id uuid,
  version_number integer,
  published_at timestamptz
)
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  target public.story_versions%rowtype;
  publication_time timestamptz := clock_timestamp();
begin
  if p_published_contract is null
     or jsonb_typeof(p_published_contract) <> 'object'
     or not (p_published_contract ?& array['contract_version','story','scenes','contentByRef','catalog']) then
    raise exception 'PUBLISHED_CONTRACT_INVALID';
  end if;

  select * into target
  from public.story_versions
  where id = p_version_id
  for update;

  if not found then raise exception 'VERSION_NOT_FOUND'; end if;
  if target.status <> 'draft' then raise exception 'VERSION_IMMUTABLE'; end if;
  if target.updated_at is distinct from p_expected_updated_at then raise exception 'REVISION_CONFLICT'; end if;
  if target.validation_report->>'status' <> 'valid'
     or (target.validation_report->>'revision')::timestamptz is distinct from target.updated_at then
    raise exception 'VALIDATION_REQUIRED';
  end if;

  update public.story_versions
  set status = 'published',
      published_contract = p_published_contract,
      published_at = publication_time,
      updated_at = publication_time
  where id = target.id;

  update public.story_projects
  set current_published_version_id = target.id,
      updated_at = publication_time
  where id = target.story_project_id;

  return query select target.id, target.story_project_id, target.version_number, publication_time;
end;
$$;

revoke execute on function public.publish_story_version_atomic(uuid, timestamptz, jsonb) from public, anon, authenticated;
grant execute on function public.publish_story_version_atomic(uuid, timestamptz, jsonb) to service_role;

