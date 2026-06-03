-- 1. Deduplicate profiles: keep the oldest one for each user_id, delete the rest.
DELETE FROM public.profiles p1
USING public.profiles p2
WHERE p1.user_id = p2.user_id AND p1.created_at > p2.created_at;

-- 2. Add UNIQUE constraint to profiles(user_id)
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- 3. Drop the old CHECK constraint for plan_tier first
ALTER TABLE public.user_plans DROP CONSTRAINT IF EXISTS user_plans_plan_tier_check;

-- 4. Update existing plan tiers
UPDATE public.user_plans SET plan_tier = 'basic' WHERE plan_tier = 'free';
UPDATE public.user_plans SET plan_tier = 'premium' WHERE plan_tier = 'standard';

-- 5. Add the new CHECK constraint
ALTER TABLE public.user_plans ADD CONSTRAINT user_plans_plan_tier_check CHECK (plan_tier IN ('basic', 'premium'));

-- 5. Alter column default
ALTER TABLE public.user_plans ALTER COLUMN plan_tier SET DEFAULT 'basic';

-- 6. Recreate the trigger function to insert 'basic'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  INSERT INTO public.user_plans (user_id, plan_tier) VALUES (NEW.id, 'basic') ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;
