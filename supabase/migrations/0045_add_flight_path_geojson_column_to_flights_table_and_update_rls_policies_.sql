ALTER TABLE public.flights
ADD COLUMN flight_path_geojson JSONB;

-- Update RLS policies to allow users to insert/update their own flight_path_geojson
CREATE POLICY "Users can insert their own flights with path" ON public.flights
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flights with path" ON public.flights
FOR UPDATE TO authenticated USING (auth.uid() = user_id);