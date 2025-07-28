ALTER TABLE public.training_requests
ADD CONSTRAINT fk_training_requests_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;