-- Close a fresh-replay/live schedule selection gap without changing any
-- stored Daily challenge, score, attempt, or existing schedule identity.
-- The pre-v22 selector used deployment-relative historical starts_on rows;
-- on a fresh install those can shadow the locked future version. Production
-- currently resolves correctly, so this is an idempotent hardening migration.
create or replace function private.daily_challenge_schedule_for_day(p_day date,p_sport text)
returns text language plpgsql stable set search_path = '' as $fn$
begin
  if p_sport is null or p_sport not in ('ufc','football','nba','nba_preview') then
    raise exception 'unsupported Daily Challenge sport %',coalesce(p_sport,'<null>');
  end if;
  if p_sport='football' and p_day >= date '2026-10-27' then
    return 'football-daily-v22-higher-lower-oct27';
  end if;
  if p_sport='ufc' and p_day >= date '2026-10-29' then
    return 'ufc-daily-v22-higher-lower-oct29';
  end if;
  if p_sport='nba' and p_day >= date '2026-11-01' then
    return 'nba-daily-regular-v2-locked';
  end if;
  return (
    select schedule.version from private.daily_challenge_schedule_versions schedule
    where schedule.starts_on <= p_day and schedule.sport = p_sport
    order by schedule.starts_on desc,schedule.created_at desc,schedule.version desc
    limit 1
  );
end
$fn$;

do $proof$
begin
  if private.daily_challenge_schedule_for_day(date '2026-10-26','football') <> 'football-daily-v21-locked-oct25'
     or private.daily_challenge_schedule_for_day(date '2026-10-27','ufc') <> 'ufc-daily-v21-48h-oct25'
     or private.daily_challenge_schedule_for_day(date '2026-10-29','football') <> 'football-daily-v22-higher-lower-oct27'
     or private.daily_challenge_schedule_for_day(date '2026-10-29','ufc') <> 'ufc-daily-v22-higher-lower-oct29'
     or private.daily_challenge_schedule_for_day(date '2027-01-03','ufc') <> 'ufc-daily-v22-higher-lower-oct29'
     or private.daily_challenge_schedule_for_day(date '2026-11-01','nba') <> 'nba-daily-regular-v2-locked'
  then
    raise exception 'Locked three-sport Daily schedule selection failed its historical/future proof';
  end if;
end
$proof$;
