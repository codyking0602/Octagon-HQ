-- Reset only the held September 24 UFC Sports Feud so it rematerializes
-- from the audited prototype pack when the release hold is removed.
-- September 23 history and all Football Daily data remain untouched.

do $reset$
declare
  v_daily_id uuid;
  v_setup_id uuid;
  v_setup_key text;
  v_attempt_count integer;
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
    and daily.game_type = 'sports_feud';

  if (v_daily_id is null) <> (v_setup_id is null) then
    raise exception 'September 24 UFC Sports Feud materialization is partially missing';
  end if;

  if v_daily_id is not null then
    if v_setup_key is distinct from
        'family-feud-daily-v2:play-rotation-v14-weighted-sep24:2026-09-24:ufc:sports-feud-bank-v1-ufc-2026-09-24-ufc-main-04-3-ufc-main-11-5' then
      raise exception 'September 24 UFC Sports Feud setup changed before audited reset: %', v_setup_key;
    end if;

  select count(*)
    into v_attempt_count
  from private.daily_challenge_attempts
  where daily_challenge_id = v_daily_id;

  if v_attempt_count > 1 then
    raise exception 'refusing September 24 UFC Sports Feud reset because more than the known test attempt exists';
  end if;

  if v_attempt_count = 1 and not exists (
    select 1
    from private.daily_challenge_attempts
    where daily_challenge_id = v_daily_id
      and normalized_score = 71
      and attempt_kind = 'official_first'
  ) then
    raise exception 'September 24 UFC Sports Feud attempt changed before audited reset';
  end if;

  delete from private.daily_challenge_history
  where daily_challenge_id = v_daily_id;

  delete from private.daily_challenge_attempts
  where daily_challenge_id = v_daily_id;

  delete from private.daily_challenge_progress
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
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-24', 'ufc')
      is distinct from 'play-rotation-v14-weighted-sep24'
    or private.daily_challenge_expected_game(
      'play-rotation-v14-weighted-sep24',
      date '2026-09-24'
    ) is distinct from 'sports_feud' then
    raise exception 'September 24 UFC Sports Feud schedule changed during audited reset';
  end if;
end
$reset$;
