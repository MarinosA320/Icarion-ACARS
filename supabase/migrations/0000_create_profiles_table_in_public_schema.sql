CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  discord_username TEXT,
  vatsim_ivao_id TEXT,
  avatar_url TEXT,
  is_staff BOOLEAN DEFAULT FALSE,
  rank TEXT DEFAULT 'Trainee',
  PRIMARY KEY (id)
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

create policy "Staff can view all profiles." on profiles for select using ( is_staff = true );