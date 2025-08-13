-- supabase/migrations/0031_update_user_requests_user_id_to_profiles_id.sql
-- Drop existing user_requests table if it exists
DROP TABLE IF EXISTS public.user_requests CASCADE;

-- Create user_requests table with user_id referencing public.profiles(id)
CREATE TABLE public.user_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, -- Changed to reference public.profiles
  request_type TEXT NOT NULL, -- e.g., 'training', 'exam', 'contact', 'report_member', 'tech_support'
  status TEXT DEFAULT 'Pending' NOT NULL, -- e.g., 'Pending', 'Approved', 'Rejected', 'Completed', 'Resolved'
  details JSONB, -- Stores specific form data for the request type (e.g., desired_rank, aircraft_type, message)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- For staff to assign requests
  resolution_notes TEXT -- For staff to add notes on resolution
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.user_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own requests
CREATE POLICY "Users can insert their own requests" ON public.user_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own requests
CREATE POLICY "Users can view their own requests" ON public.user_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy: Staff can view all requests
CREATE POLICY "Staff can view all requests" ON public.user_requests
FOR SELECT TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Policy: Staff can update all requests
CREATE POLICY "Staff can update all requests" ON public.user_requests
FOR UPDATE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);

-- Policy: Staff can delete any request (optional, but good for management)
CREATE POLICY "Staff can delete any request" ON public.user_requests
FOR DELETE TO authenticated USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = true);