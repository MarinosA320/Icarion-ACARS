-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('job-opening-images', 'job-opening-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access to job opening images
CREATE POLICY "Allow public read access to job opening images"
ON storage.objects FOR SELECT
USING (bucket_id = 'job-opening-images');

-- Policy for staff to upload job opening images
CREATE POLICY "Allow staff to upload job opening images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'job-opening-images' AND auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));

-- Policy for staff to update job opening images
CREATE POLICY "Allow staff to update job opening images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'job-opening-images' AND auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));

-- Policy for staff to delete job opening images
CREATE POLICY "Allow staff to delete job opening images"
ON storage.objects FOR DELETE
USING (bucket_id = 'job-opening-images' AND auth.uid() IN (SELECT id FROM public.profiles WHERE is_staff = true));