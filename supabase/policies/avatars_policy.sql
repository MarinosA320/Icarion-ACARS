-- Policy for 'avatars' bucket
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Allow authenticated users to upload their own avatar"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- Allow authenticated users to view all avatars
CREATE POLICY "Allow authenticated users to view all avatars"
ON storage.objects FOR SELECT USING (
  bucket_id = 'avatars' AND auth.uid() is not null
);

-- Allow authenticated users to update their own avatar
CREATE POLICY "Allow authenticated users to update their own avatar"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);

-- Allow authenticated users to delete their own avatar
CREATE POLICY "Allow authenticated users to delete their own avatar"
ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND auth.uid() = owner
);