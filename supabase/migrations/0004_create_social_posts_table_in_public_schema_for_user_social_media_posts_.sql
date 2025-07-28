CREATE TABLE public.social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Social posts are viewable by everyone." ON public.social_posts
FOR SELECT USING (true);

CREATE POLICY "Users can insert their own social posts." ON public.social_posts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social posts." ON public.social_posts
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social posts." ON public.social_posts
FOR DELETE USING (auth.uid() = user_id);