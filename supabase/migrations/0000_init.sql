-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  email text unique not null,
  full_name text,
  avatar_url text
);

-- Recipes table
create table public.recipes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  original_url text not null,
  thumbnail_url text,
  status text not null default 'processing', -- 'processing' | 'completed' | 'failed'
  current_version_id uuid -- references recipe_versions(id) initialized as null
);

-- Recipe Versions table (Single source of truth JSON container)
create table public.recipe_versions (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references public.recipes(id) on delete cascade not null,
  version_number integer not null,
  prompt_used text, -- prompt used for transformation (null for original)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  recipe_data jsonb not null -- contains { title, prepTime, nutrition, ingredients, instructions }
);

-- Add foreign key constraint back to recipes for current_version_id
alter table public.recipes 
  add constraint fk_current_version 
  foreign key (current_version_id) 
  references public.recipe_versions(id) 
  on delete set null;

-- Row Level Security (RLS) Setup
alter table public.profiles enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_versions enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Policies for Recipes
create policy "Users can CRUD own recipes" on public.recipes for all using (auth.uid() = user_id);

-- Policies for Recipe Versions
-- A user can CRUD recipe_versions if they own the parent recipe
create policy "Users can CRUD own recipe versions" on public.recipe_versions for all using (
  exists (
    select 1 from public.recipes
    where public.recipes.id = public.recipe_versions.recipe_id
    and public.recipes.user_id = auth.uid()
  )
);
