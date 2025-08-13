-- Drop existing INSERT policy if it has the same name to avoid conflicts
-- DROP POLICY IF EXISTS "Allow authenticated users to upload their own flight image" ON storage.objects;

-- Allow authenticated users to upload their own flight image (corrected INSERT policy)
CREATE POLICY "Allow authenticated users to upload their own flight image"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'flight-images' AND auth.uid() is not null
);

-- Existing SELECT policy (no change needed unless you want to restrict viewing)
CREATE POLICY "Allow authenticated users to view all flight images"
ON storage.objects FOR SELECT USING (
  bucket_id = 'flight-images' AND auth.uid() is not null
);

-- Existing UPDATE policy (no change needed)
CREATE POLICY "Allow authenticated users to update their own flight image"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'flight-images' AND auth.uid() = owner
);

-- Existing DELETE policy (no change needed)
CREATE POLICY "Allow authenticated users to delete their own flight image"
ON storage.objects FOR DELETE USING (
  bucket_id = 'flight-images' AND auth.uid() = owner
);