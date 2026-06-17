-- Add kitchen preferences to profiles
alter table public.profiles 
add column if not exists dietary_goals text[] default '{}',
add column if not exists serving_default integer default 2;
