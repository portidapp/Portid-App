-- Create qr_codes table
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned')),
  assigned_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_qr_codes_code ON public.qr_codes(code);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Select policy: Anyone (public) can read QR code assignments (necessary for scans/redirects)
CREATE POLICY "Public can select qr_codes" 
ON public.qr_codes FOR SELECT 
USING (true);

-- Admin policies: Fully manage QR codes
CREATE POLICY "Admins can insert qr_codes" 
ON public.qr_codes FOR INSERT 
TO authenticated 
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update qr_codes" 
ON public.qr_codes FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete qr_codes" 
ON public.qr_codes FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Sync status column automatically based on assigned_profile_id
CREATE OR REPLACE FUNCTION public.handle_qr_code_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_profile_id IS NULL THEN
    NEW.status := 'available';
  ELSE
    NEW.status := 'assigned';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE TRIGGER update_qr_code_status
  BEFORE INSERT OR UPDATE ON public.qr_codes
  FOR EACH ROW EXECUTE FUNCTION public.handle_qr_code_status_change();
