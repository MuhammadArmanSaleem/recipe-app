-- 1. Create the extraction_jobs table
create table public.extraction_jobs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  url text not null,
  status text check (status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  result jsonb,
  error text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security
alter table public.extraction_jobs enable row level security;

-- 3. Create RLS Policies
-- Allow users to insert their own jobs
create policy "Users can insert their own jobs" 
  on public.extraction_jobs for insert 
  with check (auth.uid() = user_id);

-- Allow users to select their own jobs
create policy "Users can select their own jobs" 
  on public.extraction_jobs for select 
  using (auth.uid() = user_id);

-- Allow users to update their own jobs
create policy "Users can update their own jobs"
  on public.extraction_jobs for update
  using (auth.uid() = user_id);

-- 4. Create an index for performance
create index extraction_jobs_user_id_idx on public.extraction_jobs(user_id);
create index extraction_jobs_status_idx on public.extraction_jobs(status);
