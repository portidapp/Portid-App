-- Migration to add expires_at column to user_plans table
ALTER TABLE public.user_plans ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Add a comment for context
COMMENT ON COLUMN public.user_plans.expires_at IS 'The expiration date and time of the user subscription plan.';
