ALTER TABLE public.profiles
ADD COLUMN authorized_airlines TEXT[];

-- Policy to allow staff to update authorized_airlines for any profile
CREATE POLICY "Staff can update authorized airlines" ON public.profiles
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true));

-- Policy to allow users to view their own authorized_airlines (already covered by existing profiles_select_policy, but good to be explicit)
-- CREATE POLICY "Users can view their own authorized airlines" ON public.profiles
-- FOR SELECT TO authenticated
-- USING (auth.uid() = id);