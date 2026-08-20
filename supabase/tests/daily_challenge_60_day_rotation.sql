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
  v_combo record;
begin
  select schedule.*
  into v_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v4';

  if v_schedule.version is null then
    raise exception 'tiered Daily rotation schedule is missing';
  end if;

  if v_schedule.time_zone <> 'America/Chicago'
    or v_schedule.anchor_day <> date '2026-08-06' then
    raise exception 'tiered Daily rotation changed the canonical time-zone/anchor contract: %',
      row_to_json(v_schedule);
  end if;

  if coalesce(array_length(v_schedule.game_cycle, 1), 0) <> 60 then
    raise exception 'tiered Daily rotation must contain exactly 60 days: %',
      v_schedule.game_cycle;
  end if;

  if (select count(*) from unnest(v_schedule.game_cycle) game where game = 'find_leader') <> 15
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_resume') <> 15
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'hit_the_number') <> 12
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'wavelength') <> 12
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'keep_4_cut_4') <> 6
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_rank_5') <> 0 then
    raise exception '60-day rotation weights do not match Find 15 / Blind Resume 15 / Hit 12 / Wavelength 12 / Combo 6: %',
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
      'keep_4_cut_4'
    )
  ) then
    raise exception 'an unapproved game entered the tiered rotation: %', v_schedule.game_cycle;
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

  if private.daily_challenge_expected_game(v_schedule.version, date '2026-08-20') <> 'keep_4_cut_4' then
    raise exception 'August 20 must resolve to the bundled Rank/Keep Daily slot';
  end if;

  select *
  into v_combo
  from private.grade_daily_challenge(
    'keep_4_cut_4',
    'play-official-score-v4',
    jsonb_build_object(
      'blind_rank', jsonb_build_object('ordered_ids', jsonb_build_array('a', 'b', 'c', 'd', 'e')),
      'keep_cut', jsonb_build_object('kept_ids', jsonb_build_array('k1', 'k2', 'k3', 'k4'))
    ),
    jsonb_build_object(
      'combo_version', 'daily-rank-keep-combo-v1',
      'blind_rank', jsonb_build_object(
        'fighter_ids', jsonb_build_array('a', 'b', 'c', 'd', 'e'),
        'ratings', jsonb_build_object('a', 100, 'b', 90, 'c', 80, 'd', 70, 'e', 60),
        'tolerance', 1
      ),
      'keep_cut', jsonb_build_object(
        'fighter_ids', jsonb_build_array('k1', 'k2', 'k3', 'k4', 'x1', 'x2', 'x3', 'x4'),
        'ratings', jsonb_build_object(
          'k1', 100, 'k2', 90, 'k3', 80, 'k4', 70,
          'x1', 60, 'x2', 50, 'x3', 40, 'x4', 30
        ),
        'tolerance', 1
      )
    )
  );

  if v_combo.normalized_score <> 100
    or v_combo.native_score <> 100
    or v_combo.public_result->>'combo_version' <> 'daily-rank-keep-combo-v1'
    or (v_combo.public_result->'blind_rank'->>'normalized_score')::integer <> 100
    or (v_combo.public_result->'keep_cut'->>'normalized_score')::integer <> 100 then
    raise exception 'bundled Daily grader did not preserve both component scores: %', row_to_json(v_combo);
  end if;
end
$$;

rollback;

\echo 'Tiered 60-day Today’s Challenge + Rank/Keep combo proof passed.'