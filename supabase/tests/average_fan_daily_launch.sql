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
  v_leaderboard_definition text;
begin
  select * into strict v_ufc
  from private.daily_challenge_schedule_versions
  where version = 'play-rotation-v18-average-fan-oct1';

  select * into strict v_football
  from private.daily_challenge_schedule_versions
  where version = 'football-daily-v18-average-fan-oct1';

  if v_ufc.sport <> 'ufc'
    or v_ufc.starts_on <> date '2026-10-01'
    or v_ufc.anchor_day <> date '2026-10-01'
    or array_length(v_ufc.game_cycle, 1) <> 29
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'average_fan') <> 5
    or v_ufc.game_cycle[1] <> 'average_fan' then
    raise exception 'UFC Average Fan rotation is invalid: %', row_to_json(v_ufc);
  end if;

  if v_football.sport <> 'football'
    or v_football.starts_on <> date '2026-10-01'
    or v_football.anchor_day <> date '2026-10-01'
    or array_length(v_football.game_cycle, 1) <> 27
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'average_fan') <> 5
    or v_football.game_cycle[1] <> 'average_fan' then
    raise exception 'Football Average Fan rotation is invalid: %', row_to_json(v_football);
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-30', 'ufc')
      <> 'play-rotation-v17-bar-trivia-sep29'
    or private.daily_challenge_schedule_for_day(date '2026-09-30', 'football')
      <> 'football-daily-v17-bar-trivia-sep29'
    or private.daily_challenge_expected_game(v_football.version, date '2026-10-01')
      <> 'average_fan'
    or private.daily_challenge_expected_game(v_ufc.version, date '2026-10-01')
      <> 'average_fan' then
    raise exception 'Average Fan future-only cutover mapping is invalid';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_setups_supported_games_check'
      and pg_get_constraintdef(oid) like '%average_fan%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenges_supported_games_check'
      and pg_get_constraintdef(oid) like '%average_fan%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_schedule_versions_supported_games_check'
      and pg_get_constraintdef(oid) like '%average_fan%'
  ) then
    raise exception 'Average Fan is missing from canonical Daily supported-game constraints';
  end if;

  select * into strict v_grade
  from private.grade_average_fan_daily(
    jsonb_build_object(
      'proof', 'average-fan-proof',
      'fan', 'shane',
      'sport', 'nfl',
      'board_score', 63,
      'final_outcome', 'correct',
      'normalized_score', 73,
      'native_score', 73,
      'unsaved_miss_question_numbers', jsonb_build_array(2, 7),
      'board_question_ids', jsonb_build_array('q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'),
      'final_question_id', 'final-1',
      'saves', 0
    ),
    jsonb_build_object(
      'proof', 'average-fan-proof',
      'max_score', 100
    )
  );

  if v_grade.native_score <> 73
    or v_grade.normalized_score <> 73
    or v_grade.public_result->>'score' <> '73'
    or v_grade.public_result->>'board_score' <> '63'
    or v_grade.public_result->>'final_outcome' <> 'correct'
    or v_grade.public_result->>'fan' <> 'shane'
    or v_grade.public_result->>'sport' <> 'nfl' then
    raise exception 'Average Fan grader returned the wrong result: %', row_to_json(v_grade);
  end if;

  select * into strict v_canonical_grade
  from private.grade_daily_challenge(
    'average_fan',
    'average-fan-score-v1',
    jsonb_build_object(
      'proof', 'average-fan-proof',
      'fan', 'shane',
      'sport', 'nfl',
      'board_score', 63,
      'final_outcome', 'correct',
      'normalized_score', 73,
      'native_score', 73,
      'unsaved_miss_question_numbers', jsonb_build_array(2, 7),
      'board_question_ids', jsonb_build_array('q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'),
      'final_question_id', 'final-1',
      'saves', 0
    ),
    jsonb_build_object(
      'proof', 'average-fan-proof',
      'max_score', 100
    )
  );

  if v_canonical_grade.normalized_score <> 73 then
    raise exception 'canonical Daily grader did not route Average Fan correctly: %',
      row_to_json(v_canonical_grade);
  end if;

  begin
    perform *
    from private.grade_average_fan_daily(
      jsonb_build_object(
        'proof', 'wrong-proof',
        'fan', 'shane',
        'sport', 'nfl',
        'board_score', 90,
        'final_outcome', 'walk-away',
        'normalized_score', 90,
        'native_score', 90,
        'unsaved_miss_question_numbers', '[]'::jsonb,
        'board_question_ids', jsonb_build_array('q1','q2','q3','q4','q5','q6','q7','q8','q9','q10'),
        'final_question_id', 'final-1',
        'saves', 0
      ),
      jsonb_build_object('proof', 'average-fan-proof', 'max_score', 100)
    );
    raise exception 'Average Fan grader accepted the wrong server proof';
  exception
    when others then
      if sqlerrm = 'Average Fan grader accepted the wrong server proof' then
        raise;
      end if;
  end;

  select pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure::oid
  ) into v_grader_definition;
  if position('p_game_type = ''average_fan''' in v_grader_definition) = 0
    or position('grade_average_fan_daily' in v_grader_definition) = 0 then
    raise exception 'Average Fan is missing from the canonical Daily grader';
  end if;

  select pg_get_functiondef(
    'public.get_daily_challenge_standings(text)'::regprocedure::oid
  ) into v_standings_definition;
  if position('''average_fan''' in v_standings_definition) = 0 then
    raise exception 'Average Fan is missing from Daily standings game averages';
  end if;

  select pg_get_functiondef(
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure::oid
  ) into v_leaderboard_definition;
  if position('when history.game_type = ''average_fan'' then' in v_leaderboard_definition) = 0
    or position('''final_player_answer''' in v_leaderboard_definition) = 0 then
    raise exception 'Average Fan is missing from Daily leaderboard result details';
  end if;

  if to_regprocedure('public.get_average_fan_publication_history(text,date)') is null then
    raise exception 'Average Fan publication-history RPC is missing';
  end if;
end
$test$;

rollback;

\echo 'Average Fan Daily launch proof passed.'
