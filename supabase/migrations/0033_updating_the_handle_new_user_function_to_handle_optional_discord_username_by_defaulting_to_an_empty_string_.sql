CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name, discord_username, vatsim_ivao_id)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'display_name',
    COALESCE(new.raw_user_meta_data ->> 'discord_username', ''), -- Use COALESCE to default to empty string if NULL
    new.raw_user_meta_data ->> 'vatsim_ivao_id'
  );
  RETURN new;
END;
$$;