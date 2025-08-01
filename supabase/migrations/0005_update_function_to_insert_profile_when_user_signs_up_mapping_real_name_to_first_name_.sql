CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, display_name, discord_username, vatsim_ivao_id)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'real_name', -- Map 'real_name' to 'first_name'
    new.raw_user_meta_data ->> 'display_name',
    new.raw_user_meta_data ->> 'discord_username',
    new.raw_user_meta_data ->> 'vatsim_ivao_id'
  );
  RETURN new;
END;
$$;