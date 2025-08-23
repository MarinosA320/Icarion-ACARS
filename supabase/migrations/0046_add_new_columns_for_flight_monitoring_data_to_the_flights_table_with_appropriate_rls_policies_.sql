-- Add new columns to the flights table
ALTER TABLE public.flights
ADD COLUMN actual_fuel_burn_kg NUMERIC,
ADD COLUMN average_altitude_ft INTEGER,
ADD COLUMN average_speed_kts INTEGER,
ADD COLUMN max_pitch_deg NUMERIC,
ADD COLUMN max_bank_deg NUMERIC,
ADD COLUMN weather_source TEXT;

-- Update RLS policies for the flights table to include new columns
-- Existing policies should already cover SELECT, INSERT, UPDATE for user_id.
-- We need to ensure the new columns are accessible under existing policies.
-- Since existing policies use `auth.uid() = user_id`, new columns will automatically be covered.
-- No explicit changes to policy definitions are needed, but it's good to review.

-- Example of existing user-specific policies (assuming they exist and cover all columns):
-- CREATE POLICY "Users can view their own flights." ON public.flights FOR SELECT TO authenticated USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert their own flights." ON public.flights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update their own flights with path" ON public.flights FOR UPDATE TO authenticated USING (auth.uid() = user_id);