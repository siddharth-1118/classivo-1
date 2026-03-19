create extension if not exists pgcrypto;

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  user_email text,
  visitor_id text,
  path text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_analytics_events_type on public.analytics_events (event_type);
create index if not exists idx_analytics_events_created_at on public.analytics_events (created_at desc);
create index if not exists idx_analytics_events_path on public.analytics_events (path);
create index if not exists idx_analytics_events_visitor_id on public.analytics_events (visitor_id);

alter table public.analytics_events enable row level security;

grant usage on schema public to anon, authenticated, service_role;
grant select, insert on public.analytics_events to anon, authenticated, service_role;

drop policy if exists "Enable insert for analytics" on public.analytics_events;
create policy "Enable insert for analytics" on public.analytics_events
  for insert with check (true);

drop policy if exists "Enable read access for analytics" on public.analytics_events;
create policy "Enable read access for analytics" on public.analytics_events
  for select using (true);
