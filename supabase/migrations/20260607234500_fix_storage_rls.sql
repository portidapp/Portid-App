-- Drop old storage policies
DROP POLICY IF EXISTS "Anyone can view profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile assets" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own uploads" ON storage.objects;

-- Create aligned and corrected storage policies
CREATE POLICY "Anyone can view profile assets" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-assets');

CREATE POLICY "Authenticated users can upload profile assets" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'profile-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own uploads" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'profile-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
) 
WITH CHECK (
  bucket_id = 'profile-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own uploads" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'profile-assets' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);
