alter table public.orders
  add column if not exists protagonist jsonb;

alter table public.story_packages
  add column if not exists character_bible jsonb;

comment on column public.orders.protagonist is
  'Structured protagonist input. Supports real_person, original_character and creature. Image upload intentionally excluded from v1.';

comment on column public.story_packages.character_bible is
  'Canonical identity, narrative profile and visual profile used by the story and illustration pipeline.';

create index if not exists orders_protagonist_type_idx
  on public.orders ((protagonist->>'type'));

alter table public.orders
  add constraint orders_protagonist_is_object
  check (protagonist is null or jsonb_typeof(protagonist) = 'object') not valid;

alter table public.story_packages
  add constraint story_packages_character_bible_is_object
  check (character_bible is null or jsonb_typeof(character_bible) = 'object') not valid;
