-- Create live_flights table
CREATE TABLE public.live_flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  flight_id UUID REFERENCES public.flights(id) ON DELETE SET NULL, -- Optional: link to a logged flight
  callsign TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  departure_airport TEXT,
  arrival_airport TEXT,
  current_latitude NUMERIC NOT NULL,
  current_longitude NUMERIC NOT NULL,
  current_altitude_ft INTEGER,
  current_speed_kts INTEGER,
  heading_deg INTEGER,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.live_flights ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can view all live flights
CREATE POLICY "Authenticated users can view all live flights" ON public.live_flights
FOR SELECT TO authenticated USING (true);

-- Policy: Users can insert their own live flight data
CREATE POLICY "Users can insert their own live flight data" ON public.live_flights
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own live flight data
CREATE POLICY "Users can update their own live flight data" ON public.live_flights
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policy: Users can delete their own live flight data (e.g., when flight ends)
CREATE POLICY "Users can delete their own live flight data" ON public.live_flights
FOR DELETE TO authenticated USING (auth.uid() = user_id);