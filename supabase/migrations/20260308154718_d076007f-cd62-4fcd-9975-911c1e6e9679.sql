
-- Fix overly permissive analytics insert policy
DROP POLICY "Anyone can insert analytics" ON public.analytics;

-- Allow anonymous and authenticated users to insert analytics (tracking is public)
-- But restrict to only INSERT with specific event types
CREATE POLICY "Track analytics events" ON public.analytics 
  FOR INSERT 
  WITH CHECK (
    event_type IN ('view', 'button_click')
  );
