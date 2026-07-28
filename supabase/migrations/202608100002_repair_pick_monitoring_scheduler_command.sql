-- Repair the one canonical Picks monitoring cron row after the initial scheduler
-- and claim-hardening migrations. Remove every stale row with the canonical name,
-- then recreate exactly one command with the required 60-second Edge Function timeout.
-- Keep it inactive; the trusted main deployment remains the only activation owner.

do $$
declare
  v_job_id bigint;
begin
  for v_job_id in
    select jobid
    from cron.job
    where jobname = 'octagon-hq-pick-monitoring'
  loop
    perform cron.unschedule(v_job_id);
  end loop;
end;
$$;

select cron.schedule(
  'octagon-hq-pick-monitoring',
  '7 * * * *',
  $job$
    select net.http_post(
      url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/run-pick-monitoring',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-octagon-scheduler-token', (
          select decrypted_secret
          from vault.decrypted_secrets
          where name = 'octagon_pick_monitoring_scheduler_token'
        )
      ),
      body := '{"mode":"scheduled"}'::jsonb,
      timeout_milliseconds := 60000
    ) as request_id;
  $job$
);

select cron.alter_job(
  (select jobid from cron.job where jobname = 'octagon-hq-pick-monitoring'),
  active := false
);
