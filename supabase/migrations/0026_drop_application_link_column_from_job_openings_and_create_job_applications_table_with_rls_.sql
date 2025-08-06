-- Drop the application_link column from job_openings
ALTER TABLE public.job_openings
DROP COLUMN application_link;

-- Create the job_applications table
CREATE TABLE public.job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_opening_id UUID NOT NULL REFERENCES public.job_openings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB, -- Stores answers to multiple-choice questions (e.g., [{questionId: 'abc', selectedOptionIndex: 0}, {questionId: 'def', textAnswer: '...'}] )
  status TEXT DEFAULT 'submitted' NOT NULL, -- e.g., 'submitted', 'reviewed', 'accepted', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on job_applications (REQUIRED)
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_applications:
-- Users can only see their own applications
CREATE POLICY "Users can view their own job applications" ON public.job_applications
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own job applications
CREATE POLICY "Users can insert their own job applications" ON public.job_applications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Staff can view all job applications
CREATE POLICY "Staff can view all job applications" ON public.job_applications
FOR SELECT TO authenticated USING ((SELECT profiles.is_staff FROM profiles WHERE profiles.id = auth.uid()) = true);

-- Staff can update job application status (e.g., 'reviewed', 'accepted', 'rejected')
CREATE POLICY "Staff can update job application status" ON public.job_applications
FOR UPDATE TO authenticated USING ((SELECT profiles.is_staff FROM profiles WHERE profiles.id = auth.uid()) = true);

-- Staff can delete any job application
CREATE POLICY "Staff can delete any job application" ON public.job_applications
FOR DELETE TO authenticated USING ((SELECT profiles.is_staff FROM profiles WHERE profiles.id = auth.uid()) = true);