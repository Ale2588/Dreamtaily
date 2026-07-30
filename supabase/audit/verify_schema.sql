-- DreamTaily — verifica schema Supabase
-- Query sola lettura. Non modifica il database.

with required_tables(table_name) as (
  values
    ('profiles'),
    ('character_assets'),
    ('character_references'),
    ('books'),
    ('book_stories'),
    ('story_cast_assignments')
),
table_checks as (
  select
    'TABLE'::text as check_type,
    r.table_name as object_name,
    case when t.table_name is not null then 'PASS' else 'FAIL' end as result,
    coalesce(t.table_schema, 'public') as detail
  from required_tables r
  left join information_schema.tables t
    on t.table_schema = 'public'
   and t.table_name = r.table_name
),
required_columns(table_name, column_name, expected_type) as (
  values
    ('book_stories', 'path_choices', 'jsonb'),
    ('story_cast_assignments', 'character_asset_id', null),
    ('story_cast_assignments', 'catalog_character_id', null),
    ('story_cast_assignments', 'book_story_id', null),
    ('story_cast_assignments', 'slot_key', null),
    ('books', 'profile_id', null),
    ('books', 'status', null)
),
column_checks as (
  select
    'COLUMN'::text as check_type,
    r.table_name || '.' || r.column_name as object_name,
    case
      when c.column_name is null then 'FAIL'
      when r.expected_type is not null and c.udt_name <> r.expected_type then 'FAIL'
      else 'PASS'
    end as result,
    coalesce(c.udt_name, 'missing') as detail
  from required_columns r
  left join information_schema.columns c
    on c.table_schema = 'public'
   and c.table_name = r.table_name
   and c.column_name = r.column_name
),
rls_checks as (
  select
    'RLS'::text as check_type,
    c.relname as object_name,
    case when c.relrowsecurity then 'PASS' else 'FAIL' end as result,
    case when c.relforcerowsecurity then 'enabled + forced'
         when c.relrowsecurity then 'enabled'
         else 'disabled'
    end as detail
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and c.relname in (
      'profiles',
      'character_assets',
      'character_references',
      'books',
      'book_stories',
      'story_cast_assignments'
    )
),
policy_checks as (
  select
    'POLICY'::text as check_type,
    schemaname || '.' || tablename || '.' || policyname as object_name,
    'PASS'::text as result,
    cmd || ' / roles=' || array_to_string(roles, ',') as detail
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'profiles',
      'character_assets',
      'character_references',
      'books',
      'book_stories',
      'story_cast_assignments'
    )
),
constraint_checks as (
  select
    'CONSTRAINT'::text as check_type,
    conrelid::regclass::text || '.' || conname as object_name,
    case
      when pg_get_constraintdef(oid) ilike '%num_nonnulls(character_asset_id, catalog_character_id) = 1%'
        then 'PASS'
      when contype in ('u', 'p', 'f', 'c') then 'INFO'
      else 'INFO'
    end as result,
    pg_get_constraintdef(oid) as detail
  from pg_constraint
  where connamespace = 'public'::regnamespace
    and conrelid in (
      'public.books'::regclass,
      'public.book_stories'::regclass,
      'public.story_cast_assignments'::regclass
    )
),
index_checks as (
  select
    'INDEX'::text as check_type,
    schemaname || '.' || indexname as object_name,
    case
      when indexdef ilike '%unique%'
       and indexdef ilike '%profile_id%'
       and indexdef ilike '%where%'
       and indexdef ilike '%draft%'
        then 'PASS'
      when indexdef ilike '%unique%'
       and indexdef ilike '%book_story_id%'
       and indexdef ilike '%slot_key%'
        then 'PASS'
      else 'INFO'
    end as result,
    indexdef as detail
  from pg_indexes
  where schemaname = 'public'
    and tablename in ('books', 'book_stories', 'story_cast_assignments')
)
select * from table_checks
union all
select * from column_checks
union all
select * from rls_checks
union all
select * from policy_checks
union all
select * from constraint_checks
union all
select * from index_checks
order by check_type, object_name;
