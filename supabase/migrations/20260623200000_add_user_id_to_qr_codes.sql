-- Add user_id column to public.qr_codes
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can select qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can insert qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can update qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Admins can delete qr_codes" ON public.qr_codes;
DROP POLICY IF EXISTS "Users can claim available qr_codes" ON public.qr_codes;

-- 1. Anyone (public) can read QR code assignments (necessary for scans/redirects)
CREATE POLICY "Public can select qr_codes" 
ON public.qr_codes FOR SELECT 
USING (true);

-- 2. Authenticated users can insert their own qr_codes, or admins can insert any
CREATE POLICY "Users can insert qr_codes" 
ON public.qr_codes FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 3. Users can update their own qr_codes or available ones linked to their profile, or admins can update any
CREATE POLICY "Users can update qr_codes" 
ON public.qr_codes FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  status = 'available' OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  auth.uid() = user_id OR 
  assigned_profile_id IS NULL OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = assigned_profile_id AND profiles.user_id = auth.uid()
  ) OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- 4. Users can delete their own qr_codes, or admins can delete any
CREATE POLICY "Users can delete qr_codes" 
ON public.qr_codes FOR DELETE 
TO authenticated 
USING (
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
