CREATE POLICY "Staff can update all profiles" ON public.profiles
FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_staff = true));