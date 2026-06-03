-- Drop the old private select policy
DROP POLICY IF EXISTS "Users can view their own plan" ON public.user_plans;

-- Create a new public select policy so visitors can verify if a profile is premium
CREATE POLICY "Anyone can view user plan tiers" 
  ON public.user_plans 
  FOR SELECT 
  USING (true);
