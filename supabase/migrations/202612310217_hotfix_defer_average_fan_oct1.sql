-- Emergency Oct. 1 Daily hotfix: move the unfinished Average Fan launch back one day
-- in both UFC and Football, and pull each sport's Oct. 2 game forward to Oct. 1.
-- Preserve every Oct. 3+ game on its already-approved calendar date.

do $swap$
declare
  v_today constant date := date '2026-10-01';
  v_tomorrow constant date := date '2026-10-02';
  v_restore_day constant date := date '2026-10-03';

  v_ufc_source constant text := 'play-rotation-v18-average-fan-oct1';
  v_football_source constant text := 'football-daily-v18-average-fan-oct1';

  v_ufc_swap constant text := 'play-rotation-v19-average-fan-deferred-oct1';
  v_football_swap constant text := 'football-daily-v19-average-fan-deferred-oct1';
  v_ufc_restore constant text := 'play-rotation-v20-average-fan-restore-oct3';
  v_football_restore constant text := 'football-daily-v20-average-fan-restore-oct3';

  v_ufc_cycle text[];
  v_football_cycle text[];
  v_ufc_daily_id uuid;
  v_football_daily_id uuid;
  v_attempt_count integer;
  v_central_today date := private.daily_challenge_central_day(now());
begin
  select game_cycle into v_ufc_cycle
  from private.daily_challenge_schedule_versions
  where version = v_ufc_source and sport = 'ufc';

  select game_cycle into v_football_cycle
  from private.daily_challenge_schedule_versions
  where version = v_football_source and sport = 'football';

  if v_ufc_cycle is null or v_football_cycle is null then
    raise exception 'Average Fan launch schedules are missing';
  end if;

  if private.daily_challenge_schedule_for_day(v_today, 'ufc') is distinct from v_ufc_source
    or private.daily_challenge_expected_game(v_ufc_source, v_today) is distinct from 'average_fan'
    or private.daily_challenge_expected_game(v_ufc_source, v_tomorrow) is distinct from 'who_am_i'
    or private.daily_challenge_expected_game(v_ufc_source, v_restore_day) is distinct from 'blind_resume'
    or private.daily_challenge_schedule_for_day(v_today, 'football') is distinct from v_football_source
    or private.daily_challenge_expected_game(v_football_source, v_today) is distinct from 'average_fan'
    or private.daily_challenge_expected_game(v_football_source, v_tomorrow) is distinct from 'bar_trivia'
    or private.daily_challenge_expected_game(v_football_source, v_restore_day) is distinct from 'millionaire' then
    raise exception 'Oct. 1/2 Average Fan source mapping changed before hotfix';
  end if;

  if exists (
    select 1 from private.daily_challenge_schedule_versions
    where version in (v_ufc_swap, v_football_swap, v_ufc_restore, v_football_restore)
  ) then
    raise exception 'Average Fan deferral schedule version already exists';
  end if;

  select id into v_ufc_daily_id
  from private.daily_challenges
  where central_day = v_today
    and schedule_version = v_ufc_source
    and game_type = 'average_fan';

  select id into v_football_daily_id
  from private.daily_challenges
  where central_day = v_today
    and schedule_version = v_football_source
    and game_type = 'average_fan';

  if (v_ufc_daily_id is not null or v_football_daily_id is not null)
    and v_central_today <> v_today then
    raise exception 'Oct. 1 Daily replacement is only safe on %, current Central day is %',
      v_today, v_central_today;
  end if;

  select count(*)::integer into v_attempt_count
  from private.daily_challenge_attempts
  where daily_challenge_id in (v_ufc_daily_id, v_football_daily_id);

  if v_attempt_count > 0 then
    raise exception 'refusing Average Fan deferral because % completed Oct. 1 attempts now exist', v_attempt_count;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_swap, 'America/Chicago', v_today, v_today, array['who_am_i', 'average_fan']::text[], 'ufc'),
    (v_football_swap, 'America/Chicago', v_today, v_today, array['bar_trivia', 'average_fan']::text[], 'football'),
    (v_ufc_restore, 'America/Chicago', v_today, v_restore_day, v_ufc_cycle, 'ufc'),
    (v_football_restore, 'America/Chicago', v_today, v_restore_day, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_today, 'ufc') is distinct from v_ufc_swap
    or private.daily_challenge_expected_game(v_ufc_swap, v_today) is distinct from 'who_am_i'
    or private.daily_challenge_expected_game(v_ufc_swap, v_tomorrow) is distinct from 'average_fan'
    or private.daily_challenge_schedule_for_day(v_today, 'football') is distinct from v_football_swap
    or private.daily_challenge_expected_game(v_football_swap, v_today) is distinct from 'bar_trivia'
    or private.daily_challenge_expected_game(v_football_swap, v_tomorrow) is distinct from 'average_fan'
    or private.daily_challenge_schedule_for_day(v_restore_day, 'ufc') is distinct from v_ufc_restore
    or private.daily_challenge_expected_game(v_ufc_restore, v_restore_day)
      is distinct from private.daily_challenge_expected_game(v_ufc_source, v_restore_day)
    or private.daily_challenge_schedule_for_day(v_restore_day, 'football') is distinct from v_football_restore
    or private.daily_challenge_expected_game(v_football_restore, v_restore_day)
      is distinct from private.daily_challenge_expected_game(v_football_source, v_restore_day) then
    raise exception 'Average Fan deferral schedule did not install exactly';
  end if;

  delete from private.daily_challenge_progress
  where daily_challenge_id in (v_ufc_daily_id, v_football_daily_id);

  if v_ufc_daily_id is not null or v_football_daily_id is not null then
    alter table private.daily_challenges disable trigger daily_challenges_immutable;

    delete from private.daily_challenges
    where id in (v_ufc_daily_id, v_football_daily_id);

    alter table private.daily_challenges enable trigger daily_challenges_immutable;
  end if;
end
$swap$;

notify pgrst, 'reload schema';
