CREATE TABLE public.flight_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  aircraft_registration TEXT NOT NULL,
  flight_number TEXT,
  airline_name TEXT NOT NULL,
  etd TIMESTAMP WITH TIME ZONE, -- Estimated Time of Departure for the booking
  eta TIMESTAMP WITH TIME ZONE, -- Estimated Time of Arrival for the booking
  status TEXT NOT NULL DEFAULT 'booked', -- 'booked', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.flight_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flight bookings." ON public.flight_bookings
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flight bookings." ON public.flight_bookings
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flight bookings." ON public.flight_bookings
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all flight bookings." ON public.flight_bookings
FOR SELECT USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);

CREATE POLICY "Staff can update any flight booking." ON public.flight_bookings
FOR UPDATE USING ((SELECT is_staff FROM public.profiles WHERE id = auth.uid()) = TRUE);