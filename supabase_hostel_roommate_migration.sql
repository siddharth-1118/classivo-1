create table if not exists public.hostel_room_entries (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  student_name text not null,
  reg_number text not null unique,
  department text,
  hostel_name text not null,
  normalized_hostel_name text not null,
  room_number text not null,
  normalized_room_number text not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_hostel_room_lookup
  on public.hostel_room_entries(normalized_hostel_name, normalized_room_number);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.hostel_room_entries to anon, authenticated, service_role;
