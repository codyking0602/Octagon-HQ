-- Publish NBA Daily through the one existing five-minute Octagon scheduler.
-- Football, UFC, and Picks requests remain unchanged. A separate NBA Edge
-- invocation keeps NBA question-bank CPU separate from Football/UFC.
-- Inactive outside the October 28 (first prepublication) to April 11 window.
-- Idempotent for repeated release rehearsals, with no player/result writes.
do $migration$
declare
  v_jobid bigint;
  v_command text;
  v_marker constant text := 'as pick_monitoring_request_id;';
  v_nba_sql constant text := $nba$
as pick_monitoring_request_id,
        case when (now() at time zone 'America/Chicago')::date
          between date '2026-10-28' and date '2027-04-11'
        then net.http_post(
          url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/daily-challenge-runtime',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'x-octagon-scheduler-token', (
              select decrypted_secret
              from vault.decrypted_secrets
              where name = 'octagon_pick_monitoring_scheduler_token'
            )
          ),
          body := '{"mode":"scheduled","sport":"nba"}'::jsonb,
          timeout_milliseconds := 60000
        ) else null::bigint end as nba_daily_challenge_request_id;
$nba$;
begin
  select j.jobid, j.command into strict v_jobid, v_command
  from cron.job j where j.jobname='octagon-hq-pick-monitoring';

  if position('nba_daily_challenge_request_id' in v_command)>0 then
    -- Existing deployments must not silently accumulate duplicate requests.
    if length(v_command)-length(replace(v_command, '"sport":"nba"', '')) <> length('"sport":"nba"') then
      raise exception 'NBA Daily scheduler has duplicate scheduled invocations';
    end if;
  else
    if position(v_marker in v_command)=0
      or position('as ufc_daily_challenge_request_id' in v_command)=0
      or position('as football_daily_challenge_request_id' in v_command)=0 then
      raise exception 'Canonical scheduler changed; cannot safely append NBA Daily';
    end if;
    v_command := replace(v_command,v_marker,v_nba_sql);
    perform cron.alter_job(v_jobid,command := v_command);
  end if;

  if not exists (
    select 1 from cron.job j
    where j.jobid=v_jobid and j.schedule='*/5 * * * *'
      and j.command like '%nba_daily_challenge_request_id%'
      and j.command like '%football_daily_challenge_request_id%'
      and j.command like '%ufc_daily_challenge_request_id%'
      and j.command like '%pick_monitoring_request_id%'
  ) then
    raise exception 'Canonical NBA Daily prepublication scheduler proof failed';
  end if;
end
$migration$;
