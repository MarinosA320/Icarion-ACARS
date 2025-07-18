CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users ON DELETE SET NULL, -- Link to user who posted it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Announcements are viewable by everyone." ON public.announcements
FOR SELECT USING (true);

CREATE POLICY "Staff can insert announcements." ON public.announcements
FOR INSERT WITH CHECK ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Staff can update announcements." ON public.announcements
FOR UPDATE USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Staff can delete announcements." ON public.announcements
FOR DELETE USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);