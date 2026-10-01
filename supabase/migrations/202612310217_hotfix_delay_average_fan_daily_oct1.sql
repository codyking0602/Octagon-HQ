-- Emergency Oct. 1 Daily swap.
-- Pull the Oct. 2 games forward for today and delay Average Fan to Oct. 2
-- in both Football and UFC. Resume the already-approved v18 cadence on Oct. 3.
--
-- Oct. 1:
--   Football -> Bar Trivia
--   UFC      -> Who Am I
-- Oct. 2:
--   Football -> Average Fan
--   UFC      -> Average Fan

do $swap$
declare
  v_today constant date := date '2026-10-01';
  v_retry_day constant date := date '2026-10-02';
  v_resume_day constant date := date '2026-10-03';

  v_football_source constant text := 'football-daily-v18-average-fan-oct1';
  v_ufc_source constant text := 'play-rotation-v18-average-fan-oct1';
  v_football_swap constant text := 'football-daily-v19-average-fan-delay-oct1';
  v_ufc_swap constant text := 'play-rotation-v19-average-fan-delay-oct1';
  v_football_resume constant text := 'football-daily-v20-resume-v18-oct3';
  v_ufc_resume constant text := 'play-rotation-v20-resume-v18-oct3';

  v_central_today date := private.daily_challenge_central_day(now());
  v_football_cycle text[];
  v_ufc_cycle text[];
  v_attempt_count integer;
begin
  if v_central_today <> v_today then
    raise exception 'Oct. 1 Daily swap is only safe on %, current Central day is %',
      v_today,
      v_central_today;
  end if;

  if private.daily_challenge_schedule_for_day(v_today, 'football') is distinct from v_football_source
    or private.daily_challenge_schedule_for_day(v_today, 'ufc') is distinct from v_ufc_source
    or private.daily_challenge_expected_game(v_football_source, v_today) is distinct from 'average_fan'
    or private.daily_challenge_expected_game(v_ufc_source, v_today) is distinct from 'average_fan'
    or private.daily_challenge_expected_game(v_football_source, v_retry_day) is distinct from 'bar_trivia'
    or private.daily_challenge_expected_game(v_ufc_source, v_retry_day) is distinct from 'who_am_i'
    or private.daily_challenge_expected_game(v_football_source, v_resume_day) is distinct from 'millionaire'
    or private.daily_challenge_expected_game(v_ufc_source, v_resume_day) is distinct from 'blind_resume' then
    raise exception 'Oct. 1/2 source Daily schedule changed before emergency swap';
  end if;

  select game_cycle into strict v_football_cycle
  from private.daily_challenge_schedule_versions
  where version = v_football_source
    and sport = 'football';

  select game_cycle into strict v_ufc_cycle
  from private.daily_challenge_schedule_versions
  where version = v_ufc_source
    and sport = 'ufc';

  if exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version in (
      v_football_swap,
      v_ufc_swap,
      v_football_resume,
      v_ufc_resume
    )
  ) then
    raise exception 'Oct. 1 Daily swap schedule identity already exists';
  end if;

  select count(*)::integer
  into v_attempt_count
  from private.daily_challenge_attempts attempt
  join private.daily_challenges daily
    on daily.id = attempt.daily_challenge_id
  where daily.central_day = v_today
    and daily.game_type = 'average_fan'
    and daily.schedule_version in (v_football_source, v_ufc_source);

  if v_attempt_count <> 0 then
    raise exception 'refusing Oct. 1 Average Fan swap because % completed attempts now exist', v_attempt_count;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  values
    (
      v_football_swap,
      'America/Chicago',
      v_today,
      v_today,
      array['bar_trivia', 'average_fan']::text[],
      'football'
    ),
    (
      v_ufc_swap,
      'America/Chicago',
      v_today,
      v_today,
      array['who_am_i', 'average_fan']::text[],
      'ufc'
    ),
    (
      v_football_resume,
      'America/Chicago',
      v_today,
      v_resume_day,
      v_football_cycle,
      'football'
    ),
    (
      v_ufc_resume,
      'America/Chicago',
      v_today,
      v_resume_day,
      v_ufc_cycle,
      'ufc'
    );

  if private.daily_challenge_schedule_for_day(v_today, 'football') is distinct from v_football_swap
    or private.daily_challenge_expected_game(v_football_swap, v_today) is distinct from 'bar_trivia'
    or private.daily_challenge_schedule_for_day(v_today, 'ufc') is distinct from v_ufc_swap
    or private.daily_challenge_expected_game(v_ufc_swap, v_today) is distinct from 'who_am_i'
    or private.daily_challenge_schedule_for_day(v_retry_day, 'football') is distinct from v_football_swap
    or private.daily_challenge_expected_game(v_football_swap, v_retry_day) is distinct from 'average_fan'
    or private.daily_challenge_schedule_for_day(v_retry_day, 'ufc') is distinct from v_ufc_swap
    or private.daily_challenge_expected_game(v_ufc_swap, v_retry_day) is distinct from 'average_fan'
    or private.daily_challenge_schedule_for_day(v_resume_day, 'football') is distinct from v_football_resume
    or private.daily_challenge_expected_game(v_football_resume, v_resume_day) is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(v_resume_day, 'ufc') is distinct from v_ufc_resume
    or private.daily_challenge_expected_game(v_ufc_resume, v_resume_day) is distinct from 'blind_resume'
    or private.daily_challenge_expected_game(v_football_resume, date '2026-10-04')
      is distinct from private.daily_challenge_expected_game(v_football_source, date '2026-10-04')
    or private.daily_challenge_expected_game(v_ufc_resume, date '2026-10-04')
      is distinct from private.daily_challenge_expected_game(v_ufc_source, date '2026-10-04') then
    raise exception 'Oct. 1/2 Daily swap did not preserve the intended cadence';
  end if;

  -- Remove the already-materialized Oct. 1 Average Fan rows so the next Daily
  -- runtime load materializes today's replacement games under the new schedule.
  alter table private.daily_challenge_attempts
    disable trigger daily_challenge_attempts_immutable;
  alter table private.daily_challenges
    disable trigger daily_challenges_immutable;

  delete from private.daily_challenge_progress progress
  using private.daily_challenges daily
  where progress.daily_challenge_id = daily.id
    and daily.central_day = v_today
    and daily.game_type = 'average_fan'
    and daily.schedule_version in (v_football_source, v_ufc_source);

  delete from private.daily_challenge_attempts attempt
  using private.daily_challenges daily
  where attempt.daily_challenge_id = daily.id
    and daily.central_day = v_today
    and daily.game_type = 'average_fan'
    and daily.schedule_version in (v_football_source, v_ufc_source);

  delete from private.daily_challenges daily
  where daily.central_day = v_today
    and daily.game_type = 'average_fan'
    and daily.schedule_version in (v_football_source, v_ufc_source);

  alter table private.daily_challenge_attempts
    enable trigger daily_challenge_attempts_immutable;
  alter table private.daily_challenges
    enable trigger daily_challenges_immutable;

  if exists (
    select 1
    from private.daily_challenges daily
    where daily.central_day = v_today
      and daily.game_type = 'average_fan'
      and daily.schedule_version in (v_football_source, v_ufc_source)
  ) then
    raise exception 'stale Oct. 1 Average Fan Daily rows were not removed';
  end if;
end
$swap$;

notify pgrst, 'reload schema';
