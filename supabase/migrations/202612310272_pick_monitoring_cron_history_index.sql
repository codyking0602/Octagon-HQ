-- Keep production monitoring health/inbox reads fast as pg_cron history grows.
-- Both canonical readers fetch the newest row for one job via
-- (jobid, start_time desc); pg_cron only supplies a runid PK by default.
create index if not exists job_run_details_jobid_start_time_idx
  on cron.job_run_details (jobid, start_time desc);
