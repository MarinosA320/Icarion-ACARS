CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name, discord_username, vatsim_ivao_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''), -- Default to empty string
    COALESCE(new.raw_user_meta_data ->> 'last_name', ''),  -- Default to empty string
    COALESCE(new.raw_user_meta_data ->> 'display_name', ''), -- Default to empty string
    COALESCE(new.raw_user_meta_data ->> 'discord_username', ''),
    new.raw_user_meta_data ->> 'vatsim_ivao_id'
  );
  RETURN new;
END;
$$;