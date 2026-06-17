-- Consolidated pantry persistence fixes
-- Redundant constraints and duplicate indexes from 0001 have been removed.

-- Make original_url nullable for pantry recipes
-- (Removing redundant alter table from 0004 as it's already in 0001)

-- Use improved indexes with DESC ordering for query performance
-- These replace the simpler indexes from 0001 if they exist.
drop index if exists idx_recipes_user_id;
create index if not exists idx_recipes_user_id_created_at on public.recipes(user_id, created_at desc);

drop index if exists idx_recipe_versions_unique;
create unique index if not exists idx_recipe_versions_composite_unique on public.recipe_versions(recipe_id, version_number desc);
