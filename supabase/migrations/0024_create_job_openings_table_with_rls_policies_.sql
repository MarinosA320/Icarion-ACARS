-- Create job_openings table
CREATE TABLE public.job_openings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  application_link TEXT,
  status TEXT DEFAULT 'open' NOT NULL, -- e.g., 'open', 'closed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED)
ALTER TABLE public.job_openings ENABLE ROW LEVEL SECURITY;

-- Policies for job_openings table
-- Public read access for all job openings
CREATE POLICY "Public read access for job_openings" ON public.job_openings
FOR SELECT USING (true);

-- Staff can insert new job openings
CREATE POLICY "Staff can insert job_openings" ON public.job_openings
FOR INSERT TO authenticated WITH CHECK ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Staff can update any job opening
CREATE POLICY "Staff can update job_openings" ON public.job_openings
FOR UPDATE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Staff can delete any job opening
CREATE POLICY "Staff can delete job_openings" ON public.job_openings
FOR DELETE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);