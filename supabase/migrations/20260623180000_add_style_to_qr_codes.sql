-- Add style JSONB column to public.qr_codes
ALTER TABLE public.qr_codes ADD COLUMN IF NOT EXISTS style JSONB DEFAULT '{"color": "#f97316", "dotsType": "rounded", "cornersSquareType": "extra-rounded", "cornersDotType": "dot", "fileFormat": "png"}'::jsonb;
