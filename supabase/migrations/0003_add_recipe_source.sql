-- Add source column and pantry input to recipes
alter table public.recipes 
add column if not exists source text default 'youtube',
add column if not exists original_pantry_input text;

-- Note: missing_ingredients is stored within the recipe_data JSONB column. 
-- No separate schema column is needed for it.
