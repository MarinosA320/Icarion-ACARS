-- Drop the existing foreign key constraint on user_id in job_applications
ALTER TABLE public.job_applications
DROP CONSTRAINT job_applications_user_id_fkey;

-- Add a new foreign key constraint on user_id in job_applications to public.profiles(id)
ALTER TABLE public.job_applications
ADD CONSTRAINT job_applications_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;