-- Keep the production monitoring health probe cheap as pg_cron history grows.
-- cron.job_run_details only has a runid primary key in hosted Supabase; ordering
-- the filtered history by start_time forces an avoidable sort/scan and was
-- timing out PostgREST. pg_cron runid is monotonic, so the newest run for the
-- canonical job is the highest matching runid.

create or replace function public.get_pick_monitoring_scheduler_health()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_job cron.job;
  v_last_run cron.job_run_details;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to inspect pick monitoring scheduler';
  end if;

  select job.* into v_job
  from cron.job job
  where job.jobname = 'octagon-hq-pick-monitoring';

  if v_job.jobid is not null then
    select run.* into v_last_run
    from cron.job_run_details run
    where run.jobid = v_job.jobid
    order by run.runid desc
    limit 1;
  end if;

  return jsonb_build_object(
    'job_id', v_job.jobid,
    'job_name', v_job.jobname,
    'schedule', v_job.schedule,
    'active', coalesce(v_job.active, false),
    'token_configured', exists (
      select 1 from vault.secrets where name = 'octagon_pick_monitoring_scheduler_token'
    ),
    'function_name', 'run-pick-monitoring',
    'daily_function_name', 'daily-challenge-runtime',
    'command_configured', coalesce(
      v_job.command like '%/functions/v1/daily-challenge-runtime%'
      and v_job.command like '%/functions/v1/run-pick-monitoring%'
      and v_job.command like '%octagon_pick_monitoring_scheduler_token%'
      and v_job.command like '%"mode":"scheduled"%'
      and v_job.command like '%timeout_milliseconds := 60000%',
      false
    ),
    'last_run_status', v_last_run.status,
    'last_run_started_at', v_last_run.start_time,
    'last_run_finished_at', v_last_run.end_time
  );
end;
$$;

revoke all on function public.get_pick_monitoring_scheduler_health()
  from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_scheduler_health()
  to service_role;
