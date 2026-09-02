revoke select on table public.story_versions from authenticated;
grant select (id, story_project_id, status)
  on table public.story_versions
  to authenticated;

grant select (id, slug)
  on table public.story_projects
  to authenticated;

drop policy if exists story_projects_select_active_runtime
  on public.story_projects;

create policy story_projects_select_active_runtime
  on public.story_projects
  for select
  to authenticated
  using (
    status = 'active'
    and current_published_version_id is not null
  );
