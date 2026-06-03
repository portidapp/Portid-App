
-- Create support_enquiries table
CREATE TABLE IF NOT EXISTS public.support_enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, seen, resolved
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_enquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit support enquiries
CREATE POLICY "Anyone can insert support enquiries" 
ON public.support_enquiries FOR INSERT 
WITH CHECK (true);

-- Users can see their own enquiries
CREATE POLICY "Users can view their own support enquiries" 
ON public.support_enquiries FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Admins can view and update all enquiries
-- We use handle 'admin' role from our app_role enum
CREATE POLICY "Admins can view all support enquiries"
ON public.support_enquiries FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update all support enquiries"
ON public.support_enquiries FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));
