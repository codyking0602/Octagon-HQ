-- Keep Monitoring Inbox scheduler status lookups bounded as pg_cron history grows.
--
-- The inbox reads the newest run for the canonical scheduler with:
--   where jobid = ? order by start_time desc limit 1
-- Hosted Supabase only indexes runid by default, so this lookup had begun timing
-- out through PostgREST as cron.job_run_details accumulated history.

create index if not exists pick_monitoring_job_run_details_job_start_idx
  on cron.job_run_details (jobid, start_time desc);
