do $test$
declare
  v_ufc private.daily_challenge_schedule_versions%rowtype;
  v_football private.daily_challenge_schedule_versions%rowtype;
  v_grade record;
  v_grader_definition text;
  v_standings_definition text;
begin
  select * into strict v_ufc
  from private.daily_challenge_schedule_versions
  where version = 'play-rotation-v10-sports-feud';

  select * into strict v_football
  from private.daily_challenge_schedule_versions
  where version = 'football-daily-v12-sports-feud';

  if v_ufc.sport <> 'ufc'
    or v_ufc.starts_on <> date '2026-09-23'
    or v_ufc.anchor_day <> date '2026-09-23'
    or array_length(v_ufc.game_cycle, 1) <> 30
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'sports_feud') <> 4 then
    raise exception 'UFC Sports Feud launch schedule is invalid: %', row_to_json(v_ufc);
  end if;

  if v_football.sport <> 'football'
    or v_football.starts_on <> date '2026-09-23'
    or v_football.anchor_day <> date '2026-09-23'
    or array_length(v_football.game_cycle, 1) <> 26
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'sports_feud') <> 4
    or 'blind_resume' = any(v_football.game_cycle)
    or 'keep_4_cut_4' = any(v_football.game_cycle) then
    raise exception 'Football Sports Feud launch schedule is invalid: %', row_to_json(v_football);
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-22', 'ufc')
      <> 'play-rotation-v9-millionaire-no-double'
    or private.daily_challenge_schedule_for_day(date '2026-09-22', 'football')
      <> 'football-daily-v11-millionaire-no-double'
    or private.daily_challenge_schedule_for_day(date '2026-09-23', 'ufc')
      <> v_ufc.version
    or private.daily_challenge_schedule_for_day(date '2026-09-23', 'football')
      <> v_football.version
    or private.daily_challenge_expected_game(v_ufc.version, date '2026-09-23')
      <> 'sports_feud'
    or private.daily_challenge_expected_game(v_football.version, date '2026-09-23')
      <> 'sports_feud' then
    raise exception 'Sports Feud cutover mapping is invalid';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_setups_supported_games_check'
      and pg_get_constraintdef(oid) like '%sports_feud%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenges_supported_games_check'
      and pg_get_constraintdef(oid) like '%sports_feud%'
  ) or not exists (
    select 1
    from pg_constraint
    where conname = 'daily_challenge_schedule_versions_supported_games_check'
      and pg_get_constraintdef(oid) like '%sports_feud%'
  ) then
    raise exception 'Sports Feud is missing from canonical Daily supported-game constraints';
  end if;

  select * into strict v_grade
  from private.grade_sports_feud_daily(
    jsonb_build_object(
      'proof', 'sports-feud-proof',
      'native_score', 73,
      'normalized_score', 73,
      'main_points', 45,
      'fast_money_points', 28,
      'fast_money_time_remaining_ms', 12345
    ),
    jsonb_build_object(
      'proof', 'sports-feud-proof',
      'raw_max', 100
    )
  );

  if v_grade.native_score <> 73
    or v_grade.normalized_score <> 73
    or v_grade.public_result->>'score' <> '73'
    or v_grade.public_result->>'main_points' <> '45'
    or v_grade.public_result->>'fast_money_points' <> '28' then
    raise exception 'Sports Feud grader returned the wrong score: %', row_to_json(v_grade);
  end if;

  begin
    perform *
    from private.grade_sports_feud_daily(
      jsonb_build_object(
        'proof', 'wrong-proof',
        'native_score', 73,
        'normalized_score', 73,
        'main_points', 45,
        'fast_money_points', 28,
        'fast_money_time_remaining_ms', 12345
      ),
      jsonb_build_object('proof', 'sports-feud-proof', 'raw_max', 100)
    );
    raise exception 'Sports Feud grader accepted the wrong server proof';
  exception
    when others then
      if sqlerrm = 'Sports Feud grader accepted the wrong server proof' then
        raise;
      end if;
  end;

  begin
    perform *
    from private.grade_sports_feud_daily(
      jsonb_build_object(
        'proof', 'sports-feud-proof',
        'native_score', 74,
        'normalized_score', 74,
        'main_points', 45,
        'fast_money_points', 28,
        'fast_money_time_remaining_ms', 12345
      ),
      jsonb_build_object('proof', 'sports-feud-proof', 'raw_max', 100)
    );
    raise exception 'Sports Feud grader accepted an inconsistent total';
  exception
    when others then
      if sqlerrm = 'Sports Feud grader accepted an inconsistent total' then
        raise;
      end if;
  end;

  select pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure::oid
  ) into v_grader_definition;
  if position('p_game_type = ''sports_feud''' in v_grader_definition) = 0
    or position('grade_sports_feud_daily' in v_grader_definition) = 0 then
    raise exception 'Sports Feud is missing from the canonical Daily grader';
  end if;

  select pg_get_functiondef(
    'public.get_daily_challenge_standings(text)'::regprocedure::oid
  ) into v_standings_definition;
  if position('''sports_feud''' in v_standings_definition) = 0 then
    raise exception 'Sports Feud is missing from Daily standings game averages';
  end if;
end
$test$;
