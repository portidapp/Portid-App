-- Migration to add custom link columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS custom_link_label TEXT,
ADD COLUMN IF NOT EXISTS custom_link_url TEXT;
