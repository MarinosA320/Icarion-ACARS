CREATE TABLE public.training_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  desired_rank TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  preferred_date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  prior_experience TEXT,
  optional_message TEXT,
  status TEXT DEFAULT 'Pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.training_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own training requests." ON public.training_requests
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own training requests." ON public.training_requests
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all training requests." ON public.training_requests
FOR SELECT USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Staff can update training requests." ON public.training_requests
FOR UPDATE USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);