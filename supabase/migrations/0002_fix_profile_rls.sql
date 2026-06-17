-- Allow users to insert their own profile record
create policy "Users can insert own profile" 
on public.profiles for insert 
with check (auth.uid() = id);

-- Ensure the 'all' policy for recipes actually covers everything
-- (The existing one is already 'for all', but this confirms intent)
