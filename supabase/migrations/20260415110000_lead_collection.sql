
-- Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lead_form_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lead_form_title TEXT DEFAULT 'Enquiry';

-- Create leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  requirement TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Leads policies
-- Anyone can submit a lead
CREATE POLICY "Anyone can insert leads" 
ON public.leads FOR INSERT 
WITH CHECK (true);

-- Only profile owners can view their leads
CREATE POLICY "Profile owners can view their leads" 
ON public.leads FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = leads.profile_id 
    AND profiles.user_id = auth.uid()
  )
);

-- Allow admins to view all leads
CREATE POLICY "Admins can view all leads"
ON public.leads FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster lead lookups
CREATE INDEX IF NOT EXISTS idx_leads_profile_id ON public.leads(profile_id);
