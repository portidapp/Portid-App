-- Create extension pg_cron if it doesn't exist
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Schedule daily cron job at 9:00 AM UTC to trigger the expiry checker
SELECT cron.schedule(
  'check-expirations-daily',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://cyxbesetczruyfsuccwp.supabase.co/functions/v1/expiry-checker?secret=cron_trigger_secret_8e27e15c',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
