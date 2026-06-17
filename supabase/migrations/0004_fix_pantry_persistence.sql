-- Make original_url nullable for pantry recipes
alter table public.recipes 
alter column original_url drop not null;

-- Add check constraint to ensure we have either a URL or pantry input
alter table public.recipes
add constraint recipe_source_check 
check (
  (source = 'youtube' and original_url is not null) or 
  (source = 'pantry' and original_pantry_input is not null)
);

-- Add missing index for performance
create index if not exists idx_recipes_user_id_created_at on public.recipes(user_id, created_at desc);
create index if not exists idx_recipe_versions_recipe_id on public.recipe_versions(recipe_id, version_number desc);
