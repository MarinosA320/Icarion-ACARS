CREATE TABLE public.flights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  flight_time TEXT NOT NULL,
  landing_rate INTEGER,
  flight_image_url TEXT,
  flight_number TEXT,
  pilot_role TEXT NOT NULL,
  etd TIMESTAMP WITH TIME ZONE,
  atd TIMESTAMP WITH TIME ZONE,
  eta TIMESTAMP WITH TIME ZONE,
  ata TIMESTAMP WITH TIME ZONE,
  flight_rules TEXT,
  flight_plan TEXT,
  departure_runway TEXT,
  arrival_runway TEXT,
  taxiways_used TEXT,
  gates_used_dep TEXT,
  gates_used_arr TEXT,
  departure_type TEXT,
  arrival_type TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flights." ON public.flights
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flights." ON public.flights
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view all flights." ON public.flights
FOR SELECT USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);