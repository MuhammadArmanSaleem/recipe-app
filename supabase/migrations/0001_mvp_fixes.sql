-- Priority 1: Fix Profile Schema Mismatch
alter table public.profiles 
  add column if not exists dietary_goals text[] default '{}',
  add column if not exists serving_default integer default 2,
  add column if not exists daily_calorie_target integer,
  add column if not exists protein_target integer;

-- Priority 4: Pantry DB Migration (Constraints & Status)
alter table public.recipes 
  add column if not exists source text not null default 'youtube',
  add column if not exists original_pantry_input text;

alter table public.recipes alter column original_url drop not null;

-- Add strict constraint for sources
alter table public.recipes
  add constraint recipes_source_check check (
    (source = 'youtube' and original_url is not null) or
    (source = 'pantry' and original_pantry_input is not null)
  );

-- Add status enum check constraint
alter table public.recipes
  add constraint recipes_status_check check (
    status in ('processing', 'completed', 'failed')
  );

-- Priority 6: Indexes
create index if not exists idx_recipes_current_version on public.recipes(current_version_id);
create index if not exists idx_recipes_user_id on public.recipes(user_id, created_at);
create unique index if not exists idx_recipe_versions_unique on public.recipe_versions(recipe_id, version_number);
