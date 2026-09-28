\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $test$
declare
  v_ufc private.daily_challenge_schedule_versions%rowtype;
  v_football private.daily_challenge_schedule_versions%rowtype;
  v_grade record;
  v_canonical_grade record;
  v_grader_definition text;
  v_standings_definition text;
  v_collision_count integer;
  v_first_60_collision_count integer;
begin
  select * into strict v_ufc
  from private.daily_challenge_schedule_versions
  where version = 'play-rotation-v17-bar-trivia-sep29';

  select * into strict v_football
  from private.daily_challenge_schedule_versions
  where version = 'football-daily-v17-bar-trivia-sep29';

  if v_ufc.sport <> 'ufc'
    or v_ufc.starts_on <> date '2026-09-29'
    or v_ufc.anchor_day <> date '2026-09-29'
    or array_length(v_ufc.game_cycle, 1) <> 24
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'bar_trivia') <> 3
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'wavelength') <> 3
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'who_am_i') <> 3
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'find_leader') <> 3
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'hit_the_number') <> 2
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'blind_resume') <> 2 then
    raise exception 'UFC Bar Trivia rotation is invalid: %', row_to_json(v_ufc);
  end if;

  if v_football.sport <> 'football'
    or v_football.starts_on <> date '2026-09-29'
    or v_football.anchor_day <> date '2026-09-29'
    or array_length(v_football.game_cycle, 1) <> 22
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'bar_trivia') <> 3
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'wavelength') <> 3
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'who_am_i') <> 3
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'find_leader') <> 3
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'hit_the_number') <> 2
    or 'blind_resume' = any(v_football.game_cycle) then
    raise exception 'Football Bar Trivia rotation is invalid: %', row_to_json(v_football);
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-28', 'ufc')
      <> 'play-rotation-v16-weighted-sep27'
    or private.daily_challenge_schedule_for_day(date '2026-09-28', 'football')
      <> 'football-daily-v16-weighted-sep25'
    or private.daily_challenge_schedule_for_day(date '2026-09-29', 'ufc')
      <> v_ufc.version
    or private.daily_challenge_schedule_for_day(date '2026-09-29', 'football')
      <> v_football.version
    or private.daily_challenge_expected_game(v_ufc.version, date '2026-09-29')
      <> 'bar_trivia'
    or private.daily_challenge_expected_game(v_football.version, date '2026-09-29')
      <> 'bar_trivia' then
    raise exception 'September 29 Bar Trivia cutover mapping is invalid';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_setups_supported_games_check'
      and pg_get_constraintdef(oid) like '%bar_trivia%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenges_supported_games_check'
      and pg_get_constraintdef(oid) like '%bar_trivia%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_schedule_versions_supported_games_check'
      and pg_get_constraintdef(oid) like '%bar_trivia%'
  ) then
    raise exception 'Bar Trivia is missing from canonical Daily supported-game constraints';
  end if;

  select * into strict v_grade
  from private.grade_bar_trivia_daily(
    jsonb_build_object(
      'proof', 'bar-trivia-proof',
      'native_score', 87,
      'normalized_score', 87,
      'correct_count', 8,
      'best_streak', 5,
      'double_round', 'round2',
      'wager', 7
    ),
    jsonb_build_object(
      'proof', 'bar-trivia-proof',
      'max_score', 100
    )
  );

  if v_grade.native_score <> 87
    or v_grade.normalized_score <> 87
    or v_grade.public_result->>'score' <> '87'
    or v_grade.public_result->>'correct_count' <> '8'
    or v_grade.public_result->>'best_streak' <> '5'
    or v_grade.public_result->>'double_round' <> 'round2'
    or v_grade.public_result->>'wager' <> '7' then
    raise exception 'Bar Trivia grader returned the wrong result: %', row_to_json(v_grade);
  end if;

  select * into strict v_canonical_grade
  from private.grade_daily_challenge(
    'bar_trivia',
    'bar-trivia-daily-score-v1',
    jsonb_build_object(
      'proof', 'bar-trivia-proof',
      'native_score', 87,
      'normalized_score', 87,
      'correct_count', 8,
      'best_streak', 5,
      'double_round', 'round2',
      'wager', 7
    ),
    jsonb_build_object(
      'proof', 'bar-trivia-proof',
      'max_score', 100
    )
  );

  if v_canonical_grade.normalized_score <> 87
    or v_canonical_grade.public_result->>'score' <> '87' then
    raise exception 'canonical Daily grader did not route Bar Trivia correctly: %',
      row_to_json(v_canonical_grade);
  end if;

  begin
    perform *
    from private.grade_bar_trivia_daily(
      jsonb_build_object(
        'proof', 'wrong-proof',
        'native_score', 87,
        'normalized_score', 87,
        'correct_count', 8,
        'best_streak', 5,
        'double_round', 'round2',
        'wager', 7
      ),
      jsonb_build_object('proof', 'bar-trivia-proof', 'max_score', 100)
    );
    raise exception 'Bar Trivia grader accepted the wrong server proof';
  exception
    when others then
      if sqlerrm = 'Bar Trivia grader accepted the wrong server proof' then
        raise;
      end if;
  end;

  select pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure::oid
  ) into v_grader_definition;
  if position('p_game_type = ''bar_trivia''' in v_grader_definition) = 0
    or position('grade_bar_trivia_daily' in v_grader_definition) = 0 then
    raise exception 'Bar Trivia is missing from the canonical Daily grader';
  end if;

  select pg_get_functiondef(
    'public.get_daily_challenge_standings(text)'::regprocedure::oid
  ) into v_standings_definition;
  if position('''bar_trivia''' in v_standings_definition) = 0 then
    raise exception 'Bar Trivia is missing from Daily standings game averages';
  end if;

  select count(*)
  into v_collision_count
  from generate_series(0, 263) as series(offset_days)
  where v_football.game_cycle[(offset_days % 22) + 1]
    = v_ufc.game_cycle[(offset_days % 24) + 1];

  if v_collision_count <> 3 then
    raise exception 'full cross-sport cycle has % collisions instead of 3', v_collision_count;
  end if;

  if exists (
    select 1
    from generate_series(0, 263) as series(offset_days)
    where v_football.game_cycle[(offset_days % 22) + 1]
      = v_ufc.game_cycle[(offset_days % 24) + 1]
      and v_football.game_cycle[(offset_days % 22) + 1] <> 'bar_trivia'
  ) then
    raise exception 'a non-Bar-Trivia cross-sport collision exists';
  end if;

  select count(*)
  into v_first_60_collision_count
  from generate_series(0, 59) as series(offset_days)
  where v_football.game_cycle[(offset_days % 22) + 1]
    = v_ufc.game_cycle[(offset_days % 24) + 1];

  if v_first_60_collision_count <> 1 then
    raise exception 'the first 60 days contain % collisions instead of the forced debut only',
      v_first_60_collision_count;
  end if;
end
$test$;

rollback;

\echo 'Bar Trivia Daily rotation proof passed.'
