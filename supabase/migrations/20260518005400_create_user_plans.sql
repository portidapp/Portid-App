-- Create user_plans table
CREATE TABLE IF NOT EXISTS public.user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'standard', 'premium')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Configure RLS Policies
CREATE POLICY "Users can view their own plan" 
  ON public.user_plans 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all plans" 
  ON public.user_plans 
  FOR ALL 
  TO authenticated 
  USING (public.has_role(auth.uid(), 'admin'));

-- Modify trigger function to automatically provision 'free' plan for new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.user_plans (user_id, plan_tier) VALUES (NEW.id, 'free') ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Populate existing users with a default 'free' plan
INSERT INTO public.user_plans (user_id, plan_tier)
SELECT id, 'free' FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Trigger to automatically update updated_at column
CREATE TRIGGER update_user_plans_updated_at
  BEFORE UPDATE ON public.user_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
