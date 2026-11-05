-- The one canonical five-minute scheduler now prepares all three Daily
-- sports while preserving the existing UFC, Football and Picks invocations.
do $check$
declare
  v_job record;
  v_nba_count integer;
begin
  select * into strict v_job
  from cron.job where jobname='octagon-hq-pick-monitoring';
  if v_job.schedule <> '*/5 * * * *' or v_job.active is distinct from true then
    raise exception 'Canonical five-minute Daily scheduler is not active';
  end if;
  if v_job.command not like '%ufc_daily_challenge_request_id%'
    or v_job.command not like '%football_daily_challenge_request_id%'
    or v_job.command not like '%nba_daily_challenge_request_id%'
    or v_job.command not like '%pick_monitoring_request_id%' then
    raise exception 'Daily scheduler lost an existing sport or Picks monitoring call';
  end if;

  v_nba_count := (
    length(v_job.command)-length(replace(v_job.command, '"sport":"nba"', ''))
  ) / length('"sport":"nba"');
  if v_nba_count<>1 then
    raise exception 'Exactly one NBA Daily scheduled invocation required; found %',v_nba_count;
  end if;
  if position('2026-10-28' in v_job.command)=0
    or position('2027-04-11' in v_job.command)=0
    or position('now() at time zone' in v_job.command)=0 then
    raise exception 'NBA Daily offseason guard or prelaunch threshold missing';
  end if;
end
$check$;
