-- Migration to add billing_cycle to user_plans table
ALTER TABLE public.user_plans ADD COLUMN IF NOT EXISTS billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly', 'manual'));

-- Comment for context
COMMENT ON COLUMN public.user_plans.billing_cycle IS 'The billing cycle of the subscription plan (monthly, yearly, or manual).';
