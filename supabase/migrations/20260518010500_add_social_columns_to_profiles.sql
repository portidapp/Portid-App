-- Add missing social media columns to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS linkedin TEXT,
  ADD COLUMN IF NOT EXISTS twitter TEXT,
  ADD COLUMN IF NOT EXISTS youtube TEXT,
  ADD COLUMN IF NOT EXISTS tiktok TEXT;
