-- Add source column and pantry input to recipes
alter table public.recipes 
add column if not exists source text default 'youtube',
add column if not exists original_pantry_input text;

-- Add missing_ingredients to recipe_versions (optional, but good for persistence)
-- We store it in recipe_data JSONB usually, so no schema change needed for recipe_versions.
