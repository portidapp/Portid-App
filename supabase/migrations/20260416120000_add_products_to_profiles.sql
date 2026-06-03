-- Add products column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]'::jsonb;
