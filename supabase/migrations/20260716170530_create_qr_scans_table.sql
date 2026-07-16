-- Create qr_scans table for dynamic QR code analytics
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for faster analytics querying
CREATE INDEX IF NOT EXISTS idx_qr_scans_qr_code_id ON public.qr_scans(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_created_at ON public.qr_scans(created_at);

-- Enable RLS
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- Allow public to insert scans (since unauthenticated users scan the codes)
CREATE POLICY "Public can insert qr_scans"
ON public.qr_scans FOR INSERT
WITH CHECK (true);

-- Allow QR code owners to select their own scans
CREATE POLICY "Users can view their own qr_scans"
ON public.qr_scans FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.qr_codes
    WHERE qr_codes.id = qr_scans.qr_code_id
    AND qr_codes.user_id = auth.uid()
  )
);

-- Update the track_qr_scan function to optionally log detailed analytics
CREATE OR REPLACE FUNCTION public.track_qr_scan(
  qr_id UUID,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT NULL,
  p_os TEXT DEFAULT NULL,
  p_browser TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- 1. Increment total scan count on qr_codes
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1,
      last_scanned_at = now()
  WHERE id = qr_id;
  
  -- 2. Insert detailed log into qr_scans
  INSERT INTO public.qr_scans (
    qr_code_id,
    ip_address,
    user_agent,
    country,
    city,
    device_type,
    os,
    browser
  ) VALUES (
    qr_id,
    p_ip_address,
    p_user_agent,
    p_country,
    p_city,
    p_device_type,
    p_os,
    p_browser
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
