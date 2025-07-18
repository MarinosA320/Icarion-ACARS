ALTER TABLE public.training_requests
ADD COLUMN instructor_id UUID REFERENCES public.profiles(id);

CREATE POLICY "Staff can assign instructors to training requests."
ON public.training_requests
FOR UPDATE USING (
  (SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE
) WITH CHECK (
  (SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE
);