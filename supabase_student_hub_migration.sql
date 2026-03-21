create extension if not exists pgcrypto;

create table if not exists public.notes_uploads (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  student_name text not null,
  reg_number text not null,
  semester integer not null,
  subject text not null,
  unit text not null,
  title text not null,
  file_url text not null,
  file_name text not null,
  file_type text,
  approval_status text not null default 'pending',
  approved_by text,
  rejection_reason text,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  student_name text not null,
  reg_number text not null,
  title text not null,
  description text not null,
  image_url text,
  category text not null default 'general',
  is_anonymous boolean not null default true,
  status text not null default 'active',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.community_replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts(id) on delete cascade,
  user_email text not null,
  student_name text not null,
  reg_number text not null,
  body text not null,
  is_anonymous boolean not null default true,
  status text not null default 'active',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  content_type text not null,
  content_id uuid not null,
  reason text not null,
  reporter_email text not null,
  reporter_reg_number text not null,
  status text not null default 'open',
  resolved_by text,
  resolved_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.faculty_reviews (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  student_name text not null,
  reg_number text not null,
  subject text not null,
  faculty_name text,
  review_text text not null,
  is_anonymous boolean not null default true,
  status text not null default 'active',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create table if not exists public.campus_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_url text,
  event_date text not null,
  event_time text not null,
  venue text not null,
  registration_link text,
  created_by text not null,
  status text not null default 'active',
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

create index if not exists idx_notes_uploads_status on public.notes_uploads(approval_status, created_at desc);
create index if not exists idx_community_posts_status on public.community_posts(status, created_at desc);
create index if not exists idx_community_replies_post on public.community_replies(post_id, created_at asc);
create index if not exists idx_content_reports_status on public.content_reports(status, created_at desc);
create index if not exists idx_faculty_reviews_subject on public.faculty_reviews(subject, created_at desc);
create index if not exists idx_campus_events_status on public.campus_events(status, event_date asc);

grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on public.notes_uploads to anon, authenticated, service_role;
grant select, insert, update, delete on public.community_posts to anon, authenticated, service_role;
grant select, insert, update, delete on public.community_replies to anon, authenticated, service_role;
grant select, insert, update, delete on public.content_reports to anon, authenticated, service_role;
grant select, insert, update, delete on public.faculty_reviews to anon, authenticated, service_role;
grant select, insert, update, delete on public.campus_events to anon, authenticated, service_role;
