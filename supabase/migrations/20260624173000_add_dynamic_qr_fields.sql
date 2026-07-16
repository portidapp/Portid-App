-- Add dynamic QR code columns
ALTER TABLE public.qr_codes 
ADD COLUMN IF NOT EXISTS is_paused BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS destination_type TEXT NOT NULL DEFAULT 'custom' CHECK (destination_type IN ('profile', 'website', 'whatsapp', 'social', 'custom')),
ADD COLUMN IF NOT EXISTS scan_count INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_scanned_at TIMESTAMP WITH TIME ZONE;

-- Create secure RPC to increment scan counts bypassing RLS policies
CREATE OR REPLACE FUNCTION public.track_qr_scan(qr_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.qr_codes
  SET scan_count = scan_count + 1,
      last_scanned_at = now()
  WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
