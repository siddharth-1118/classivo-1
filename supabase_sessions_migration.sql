create extension if not exists pgcrypto;

create table if not exists public.sessions (
  hash_key text primary key,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_sessions_created_at on public.sessions (created_at desc);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update on public.sessions to anon, authenticated, service_role;

alter table public.sessions enable row level security;

drop policy if exists "Enable session writes" on public.sessions;
create policy "Enable session writes" on public.sessions
  for insert with check (true);

drop policy if exists "Enable session updates" on public.sessions;
create policy "Enable session updates" on public.sessions
  for update using (true) with check (true);

drop policy if exists "Enable session reads" on public.sessions;
create policy "Enable session reads" on public.sessions
  for select using (true);
