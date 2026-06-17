-- Allow users to insert their own profile record
create policy "Users can insert own profile" 
on public.profiles for insert 
with check (auth.uid() = id);

-- Allow users to select their own profile record
create policy "Users can select own profile"
on public.profiles for select
using (auth.uid() = id);
