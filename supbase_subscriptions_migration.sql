-- Run this in the Supabase SQL Editor to support Mess Menu Push Notifications

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: We default 'created_at' to UTC timezone now(), which is the standard for PostgreSQL.
-- Ensure the RLS is disabled or properly configured for your backend to insert. 
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (since our Go backend uses anon key for postgrest, though ideally it should use service_role)
CREATE POLICY "Enable insert for anonymous users" ON public.subscriptions
    FOR INSERT WITH CHECK (true);

-- Allow anonymous selects (so the cron job can read them)
CREATE POLICY "Enable read access for all users" ON public.subscriptions
    FOR SELECT USING (true);
