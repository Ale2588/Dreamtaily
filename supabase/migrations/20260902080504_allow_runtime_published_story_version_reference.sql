grant select on table public.story_versions to authenticated;

drop policy if exists story_versions_select_published_runtime
  on public.story_versions;

create policy story_versions_select_published_runtime
  on public.story_versions
  for select
  to authenticated
  using (status = 'published');
