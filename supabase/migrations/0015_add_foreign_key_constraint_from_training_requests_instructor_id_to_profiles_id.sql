ALTER TABLE public.training_requests
ADD CONSTRAINT fk_training_requests_instructor_id
FOREIGN KEY (instructor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;