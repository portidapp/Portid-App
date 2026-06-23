-- Add custom_url column to public.qr_codes
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS custom_url TEXT;

-- Update trigger function to check both assigned_profile_id and custom_url
CREATE OR REPLACE FUNCTION public.handle_qr_code_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assigned_profile_id IS NULL AND NEW.custom_url IS NULL THEN
    NEW.status := 'available';
  ELSE
    NEW.status := 'assigned';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
