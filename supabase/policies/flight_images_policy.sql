-- Policy for 'flight-images' bucket
-- Allow authenticated users to upload their own flight image
CREATE POLICY "Allow authenticated users to upload their own flight image"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'flight-images' AND auth.uid() = owner
);

-- Allow authenticated users to view all flight images
CREATE POLICY "Allow authenticated users to view all flight images"
ON storage.objects FOR SELECT USING (
  bucket_id = 'flight-images' AND auth.uid() is not null
);

-- Allow authenticated users to update their own flight image
CREATE POLICY "Allow authenticated users to update their own flight image"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'flight-images' AND auth.uid() = owner
);

-- Allow authenticated users to delete their own flight image
CREATE POLICY "Allow authenticated users to delete their own flight image"
ON storage.objects FOR DELETE USING (
  bucket_id = 'flight-images' AND auth.uid() = owner
);