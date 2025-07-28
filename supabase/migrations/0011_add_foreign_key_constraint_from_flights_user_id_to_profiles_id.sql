ALTER TABLE public.flights
ADD CONSTRAINT fk_flights_user_id
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;