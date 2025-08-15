ALTER TABLE public.job_applications
ADD CONSTRAINT fk_job_opening
FOREIGN KEY (job_opening_id)
REFERENCES public.job_openings(id)
ON DELETE CASCADE;