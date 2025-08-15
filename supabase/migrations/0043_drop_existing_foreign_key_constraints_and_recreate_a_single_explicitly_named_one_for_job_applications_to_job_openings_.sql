-- Drop any existing foreign key constraints from job_applications to job_openings
-- This handles cases where there might be implicitly named or duplicate constraints
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.job_applications'::regclass AND confrelid = 'public.job_openings'::regclass AND contype = 'f') THEN
        ALTER TABLE public.job_applications
        DROP CONSTRAINT IF EXISTS job_applications_job_opening_id_fkey; -- Common default name
        
        ALTER TABLE public.job_applications
        DROP CONSTRAINT IF EXISTS fk_job_opening; -- If it was previously named this
    END IF;
END
$$;

-- Add a single, explicitly named foreign key constraint
ALTER TABLE public.job_applications
ADD CONSTRAINT fk_job_opening
FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;