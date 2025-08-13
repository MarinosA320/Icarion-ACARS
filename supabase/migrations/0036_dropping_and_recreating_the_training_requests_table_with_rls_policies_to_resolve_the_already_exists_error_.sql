-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own training requests." ON public.training_requests;
DROP POLICY IF EXISTS "Users can insert their own training requests." ON public.training_requests;
DROP POLICY IF EXISTS "Staff can view all training requests." ON public.training_requests;
DROP POLICY IF EXISTS "Staff can update training requests." ON public.training_requests;
DROP POLICY IF EXISTS "Staff can assign instructors to training requests." ON public.training_requests;

-- Drop the table if it exists
DROP TABLE IF EXISTS public.training_requests CASCADE;

-- Create training_requests table
CREATE TABLE public.training_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  desired_rank TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  preferred_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  prior_experience TEXT,
  optional_message TEXT,
  status TEXT DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  instructor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL -- New column for instructor assignment
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;

-- Policies for training_requests
-- Users can view their own training requests
CREATE POLICY "Users can view their own training requests." ON public.training_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Users can insert their own training requests
CREATE POLICY "Users can insert their own training requests." ON public.training_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Staff can view all training requests
CREATE POLICY "Staff can view all training requests." ON public.training_requests
FOR SELECT TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Staff can update training requests (e.g., status, assign instructor)
CREATE POLICY "Staff can update training requests." ON public.training_requests
FOR UPDATE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Staff can assign instructors to training requests
CREATE POLICY "Staff can assign instructors to training requests." ON public.training_requests
FOR UPDATE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);