-- Add name column to public.qr_codes for recognition/labeling purposes
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS name TEXT;
