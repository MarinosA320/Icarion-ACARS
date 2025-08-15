-- Attempt to drop any existing foreign key constraints from job_applications to job_openings
-- This covers common default names and previously attempted custom names.
DO $$
BEGIN
    -- Drop the default auto-generated foreign key constraint
    ALTER TABLE public.job_applications
    DROP CONSTRAINT IF EXISTS job_applications_job_opening_id_fkey;

    -- Drop the custom named foreign key constraint if it exists
    ALTER TABLE public.job_applications
    DROP CONSTRAINT IF EXISTS fk_job_opening;

    -- Add the single, explicitly named foreign key constraint
    ALTER TABLE public.job_applications
    ADD CONSTRAINT fk_job_opening
    FOREIGN KEY (job_opening_id) REFERENCES public.job_openings(id) ON DELETE CASCADE;
END
$$;