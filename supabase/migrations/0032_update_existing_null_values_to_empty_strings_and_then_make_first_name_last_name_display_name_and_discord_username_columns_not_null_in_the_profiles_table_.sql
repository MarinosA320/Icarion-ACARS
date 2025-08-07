UPDATE public.profiles
SET
  first_name = COALESCE(first_name, ''),
  last_name = COALESCE(last_name, ''),
  display_name = COALESCE(display_name, ''),
  discord_username = COALESCE(discord_username, '');

ALTER TABLE public.profiles
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN display_name SET NOT NULL,
ALTER COLUMN discord_username SET NOT NULL;