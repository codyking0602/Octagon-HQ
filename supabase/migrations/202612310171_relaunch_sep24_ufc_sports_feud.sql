-- Relaunch the held September 24 UFC Sports Feud on the audited prototype pack.
-- Production has exactly one stale owner test run on the held setup.
-- Fresh validation databases never materialized that Daily, so this is a no-op there.

do $relaunch$
declare
  v_daily_id uuid;
  v_setup_id uuid;
  v_setup_key text;
  v_attempt_profile uuid;
  v_progress_profile uuid;
  v_history_profile uuid;
  v_attempt_count integer;
  v_progress_count integer;
  v_history_count integer;
begin
  select daily.id, daily.setup_id, setup.setup_key
    into v_daily_id, v_setup_id, v_setup_key
  from private.daily_challenges daily
  join private.daily_challenge_schedule_versions schedule
    on schedule.version = daily.schedule_version
  join private.daily_challenge_setups setup
    on setup.id = daily.setup_id
  where daily.central_day = date '2026-09-24'
    and schedule.sport = 'ufc'
    and daily.schedule_version = 'play-rotation-v14-weighted-sep24'
    and daily.game_type = 'sports_feud';

  if v_daily_id is null then
    -- Expected on fresh-database verification where Sept. 24 was never materialized.
    return;
  end if;

  if v_setup_key is distinct from
      'family-feud-daily-v2:play-rotation-v14-weighted-sep24:2026-09-24:ufc:sports-feud-bank-v1-ufc-2026-09-24-ufc-main-04-3-ufc-main-11-5' then
    raise exception 'September 24 UFC Sports Feud setup changed before audited relaunch: %', v_setup_key;
  end if;

  select count(*), min(profile_id)
    into v_attempt_count, v_attempt_profile
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily_id;

  select count(*), min(profile_id)
    into v_progress_count, v_progress_profile
  from private.daily_challenge_progress
  where daily_challenge_id = v_daily_id;

  select count(*), min(profile_id)
    into v_history_count, v_history_profile
  from private.daily_challenge_history
  where daily_challenge_id = v_daily_id;

  if v_attempt_count <> 1
    or v_progress_count <> 1
    or v_history_count <> 1
    or v_attempt_profile is distinct from v_progress_profile
    or v_attempt_profile is distinct from v_history_profile then
    raise exception
      'refusing September 24 UFC Sports Feud relaunch: expected exactly one matching stale owner run; attempts %, progress %, history %',
      v_attempt_count, v_progress_count, v_history_count;
  end if;

  if not exists (
    select 1
    from private.daily_challenge_attempts
    where daily_challenge_id = v_daily_id
      and normalized_score = 71
      and attempt_kind = 'official_first'
  ) then
    raise exception 'September 24 UFC Sports Feud stale attempt changed before audited relaunch';
  end if;

  delete from private.daily_challenge_history
  where daily_challenge_id = v_daily_id;

  delete from private.daily_challenge_progress
  where daily_challenge_id = v_daily_id;

  delete from private.daily_challenge_attempts
  where daily_challenge_id = v_daily_id;

  delete from private.daily_challenges
  where id = v_daily_id;

  if exists (
    select 1
    from private.daily_challenges
    where setup_id = v_setup_id
  ) then
    raise exception 'refusing to delete September 24 UFC Sports Feud setup because it is still referenced';
  end if;

  delete from private.daily_challenge_setups
  where id = v_setup_id;

  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'ufc')
      is distinct from 'play-rotation-v14-weighted-sep24'
    or private.daily_challenge_expected_game(
      'play-rotation-v14-weighted-sep24',
      date '2026-09-24'
    ) is distinct from 'sports_feud' then
    raise exception 'September 24 UFC Sports Feud schedule changed during audited relaunch';
  end if;
end
$relaunch$;
