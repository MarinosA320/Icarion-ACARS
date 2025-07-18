ALTER TABLE public.social_posts
ADD CONSTRAINT fk_social_posts_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;