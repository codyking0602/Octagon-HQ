\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_schedule private.daily_challenge_schedule_versions;
  v_index integer;
  v_day date;
  v_expected text;
  v_repeated text;
begin
  select schedule.*
  into v_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v3';

  if v_schedule.version is null then
    raise exception 'six-game Daily rotation schedule is missing';
  end if;

  if v_schedule.time_zone <> 'America/Chicago'
    or v_schedule.anchor_day <> date '2026-08-06' then
    raise exception 'six-game Daily rotation changed the canonical time-zone/anchor contract: %',
      row_to_json(v_schedule);
  end if;

  if coalesce(array_length(v_schedule.game_cycle, 1), 0) <> 60 then
    raise exception 'six-game Daily rotation must contain exactly 60 days: %',
      v_schedule.game_cycle;
  end if;

  if (select count(*) from unnest(v_schedule.game_cycle) game where game = 'hit_the_number') <> 12
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_resume') <> 12
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'find_leader') <> 12
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'wavelength') <> 10
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_rank_5') <> 7
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'keep_4_cut_4') <> 7 then
    raise exception '60-day rotation weights do not match the approved 12/12/12/10/7/7 contract: %',
      v_schedule.game_cycle;
  end if;

  if exists (
    select 1
    from unnest(v_schedule.game_cycle) game
    where game not in (
      'hit_the_number',
      'blind_resume',
      'find_leader',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  ) then
    raise exception 'an unapproved game entered the six-game rotation: %', v_schedule.game_cycle;
  end if;

  for v_index in 1..59 loop
    if v_schedule.game_cycle[v_index] = v_schedule.game_cycle[v_index + 1] then
      raise exception 'consecutive Daily game at cycle positions % and %: %',
        v_index,
        v_index + 1,
        v_schedule.game_cycle;
    end if;
  end loop;

  if v_schedule.game_cycle[60] = v_schedule.game_cycle[1] then
    raise exception 'Day 60 and Day 1 must not use the same game: %', v_schedule.game_cycle;
  end if;

  for v_index in -120..120 loop
    v_day := v_schedule.anchor_day + v_index;
    v_expected := private.daily_challenge_expected_game(v_schedule.version, v_day);
    v_repeated := private.daily_challenge_expected_game(v_schedule.version, v_day);

    if v_expected is distinct from v_repeated
      or v_expected is distinct from v_schedule.game_cycle[(((v_index % 60) + 60) % 60) + 1] then
      raise exception 'schedule-version/date resolution was not deterministic for %: %, %',
        v_day,
        v_expected,
        v_repeated;
    end if;
  end loop;

  if exists (
    select 1
    from private.daily_challenges daily
    where daily.central_day >= v_schedule.starts_on
  ) then
    raise exception 'six-game rotation activation crossed an already-materialized Daily Challenge day';
  end if;
end
$$;

rollback;

\echo 'Six-game 60-day Today’s Challenge rotation proof passed.'
