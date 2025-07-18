ALTER TABLE public.announcements
ADD CONSTRAINT fk_announcements_author_id
FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE SET NULL;