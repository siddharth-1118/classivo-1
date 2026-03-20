-- Run this in the Supabase SQL Editor to support Student Queries

CREATE TABLE IF NOT EXISTS public.queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_queries_created_at ON public.queries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_queries_status ON public.queries (status);

ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT ON public.queries TO anon, authenticated, service_role;

-- Allow the backend to insert and the admin dashboard to read.
-- If you later switch the backend to use the service_role key, these can be tightened.
DROP POLICY IF EXISTS "Enable insert for queries" ON public.queries;
CREATE POLICY "Enable insert for queries" ON public.queries
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for queries" ON public.queries;
CREATE POLICY "Enable read access for queries" ON public.queries
    FOR SELECT USING (true);
