-- Pre-materialize Football Daily before the first player opens the app.
-- Keep the existing five-minute scheduler as the single wake-up owner, but enqueue
-- UFC Daily and Football Daily as separate Edge Function invocations so each sport
-- receives its own compute budget.

do $migration$
declare
  v_jobid bigint;
begin
  select job.jobid
  into v_jobid
  from cron.job job
  where job.jobname = 'octagon-hq-pick-monitoring';

  if v_jobid is null then
    raise exception 'canonical Octagon HQ scheduler is missing';
  end if;

  perform cron.alter_job(
    v_jobid,
    schedule := '*/5 * * * *',
    command := $job$
      select
        net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled","sport":"ufc"}'::jsonb,
          timeout_milliseconds := 60000
        ) as ufc_daily_challenge_request_id,
        net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled","sport":"football"}'::jsonb,
          timeout_milliseconds := 60000
        ) as football_daily_challenge_request_id,
        net.http_post(
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
        ) as pick_monitoring_request_id;
    $job$,
    active := true
  );
end
$migration$;
