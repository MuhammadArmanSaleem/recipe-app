-- Update the extraction_jobs migration with hardened RLS and updated_at trigger

-- 1. Create or replace the set_updated_at trigger function
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 2. Update the extraction_jobs table (if it exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'extraction_jobs' and table_schema = 'public') then
    -- Attach trigger
    drop trigger if exists extraction_jobs_set_updated_at on public.extraction_jobs;
    create trigger extraction_jobs_set_updated_at
      before update on public.extraction_jobs
      for each row execute function public.set_updated_at();

    -- Hardened RLS policies
    drop policy if exists "Users can insert their own jobs" on public.extraction_jobs;
    create policy "Users can insert their own jobs" 
      on public.extraction_jobs for insert 
      with check (auth.uid() = user_id);

    drop policy if exists "Users can select their own jobs" on public.extraction_jobs;
    create policy "Users can select their own jobs" 
      on public.extraction_jobs for select 
      using (auth.uid() = user_id);

    -- Tightened update policy: Users can update their own jobs.
    -- Note: RLS WITH CHECK cannot reference 'old' row values.
    -- If preventing status changes is critical, this must be handled by a trigger, not RLS.
    drop policy if exists "Users can update their own jobs" on public.extraction_jobs;
    create policy "Users can update their own jobs"
      on public.extraction_jobs for update
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    -- New DELETE policy
    drop policy if exists "Users can delete their own jobs" on public.extraction_jobs;
    create policy "Users can delete their own jobs"
      on public.extraction_jobs for delete
      using (auth.uid() = user_id);
  end if;
end $$;
