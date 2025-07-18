ALTER TABLE public.flight_bookings
ADD CONSTRAINT fk_flight_bookings_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;