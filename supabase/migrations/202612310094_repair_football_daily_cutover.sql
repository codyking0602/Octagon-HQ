-- Same-day Football Daily repair for the September 12 Stage 11 cutover.
-- Preserve v4 as immutable history, replace the already-published duplicate Find the Leader
-- with the existing Wavelength game, and rotate the approved 20-slot mix forward one slot
-- so the cutover and future cycle seams never repeat the same game on consecutive days.

do $$
declare
  v_target_day constant date := date '2026-09-12';
  v_source_version constant text := 'football-daily-v4';
  v_replacement_version constant text := 'football-daily-v5';
  v_replacement_cycle constant text[] := array[
    'wavelength',
    'hit_the_number',
    'who_am_i',
    'find_leader',
    'wavelength',
    'keep_4_cut_4',
    'hit_the_number',
    'who_am_i',
    'find_leader',
    'wavelength',
    'hit_the_number',
    'who_am_i',
    'find_leader',
    'wavelength',
    'keep_4_cut_4',
    'hit_the_number',
    'who_am_i',
    'find_leader',
    'wavelength',
    'find_leader'
  ]::text[];
  v_central_today date := private.daily_challenge_central_day(now());
  v_existing_daily_id uuid;
  v_existing_game text;
  v_previous_game text;
  v_i integer;
begin
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_source_version
      and schedule.sport = 'football'
      and schedule.starts_on = v_target_day
  ) then
    raise exception 'source Football Daily schedule % is missing or invalid', v_source_version;
  end if;

  if private.daily_challenge_expected_game(v_source_version, v_target_day) is distinct from 'find_leader' then
    raise exception 'expected source Football Daily to be Find the Leader on %', v_target_day;
  end if;

  v_previous_game := private.daily_challenge_expected_game('football-daily-v3', v_target_day - 1);
  if v_previous_game is distinct from 'find_leader' then
    raise exception 'expected September 11 Football Daily to remain Find the Leader, found %',
      coalesce(v_previous_game, '<none>');
  end if;

  for v_i in 1..array_length(v_replacement_cycle, 1) loop
    if v_replacement_cycle[v_i] = v_replacement_cycle[
      case when v_i = array_length(v_replacement_cycle, 1) then 1 else v_i + 1 end
    ] then
      raise exception 'replacement Football Daily cycle repeats % across adjacent slots', v_replacement_cycle[v_i];
    end if;
  end loop;

  select daily.id, daily.game_type
  into v_existing_daily_id, v_existing_game
  from private.daily_challenges daily
  where daily.schedule_version = v_source_version
    and daily.central_day = v_target_day;

  if v_existing_daily_id is not null then
    if v_central_today <> v_target_day then
      raise exception 'September 12 Football Daily replacement is only safe on %, current Central day is %',
        v_target_day,
        v_central_today;
    end if;

    if v_existing_game is distinct from 'find_leader' then
      raise exception 'refusing to replace unexpected published Football Daily game % on %',
        v_existing_game,
        v_target_day;
    end if;
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = v_replacement_version
  ) then
    raise exception 'replacement Football Daily schedule % already exists', v_replacement_version;
  end if;

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  values (
    v_replacement_version,
    'America/Chicago',
    v_target_day,
    v_target_day,
    v_replacement_cycle,
    'football'
  );

  if private.daily_challenge_schedule_for_day(v_target_day, 'football') is distinct from v_replacement_version
    or private.daily_challenge_expected_game(v_replacement_version, v_target_day) is distinct from 'wavelength'
    or private.daily_challenge_expected_game(v_replacement_version, v_target_day + 1) is distinct from 'hit_the_number' then
    raise exception 'replacement Football Daily schedule did not activate Wavelength cleanly on the cutover';
  end if;

  if v_existing_daily_id is not null then
    alter table private.daily_challenge_attempts
      disable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      disable trigger daily_challenges_immutable;

    delete from private.daily_challenge_progress progress
    where progress.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_existing_daily_id;

    delete from private.daily_challenges daily
    where daily.id = v_existing_daily_id
      and daily.schedule_version = v_source_version
      and daily.central_day = v_target_day;

    alter table private.daily_challenge_attempts
      enable trigger daily_challenge_attempts_immutable;
    alter table private.daily_challenges
      enable trigger daily_challenges_immutable;
  end if;
end
$$;
