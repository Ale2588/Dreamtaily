-- DreamTaily — Verify Render Engine v1
select
  exists (
    select 1 from information_schema.columns
    where table_schema='public'
      and table_name='character_assets'
      and column_name='identity_prompt'
  ) as identity_prompt_exists,
  to_regclass('public.book_renders') is not null as book_renders_exists,
  (
    select relrowsecurity
    from pg_class
    where oid = to_regclass('public.book_renders')
  ) as book_renders_rls_enabled,
  (
    select count(*)
    from pg_policies
    where schemaname='public'
      and tablename='book_renders'
      and 'anon' = any(roles)
  ) as anonymous_policies_count;
