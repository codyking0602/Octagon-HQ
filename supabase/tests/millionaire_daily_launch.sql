\set ON_ERROR_STOP on
begin;

do $$
declare
  v_ufc private.daily_challenge_schedule_versions;
  v_football private.daily_challenge_schedule_versions;
  v_grade record;
begin
  select * into v_ufc
  from private.daily_challenge_schedule_versions
  where version = 'play-rotation-v9-millionaire-no-double';

  select * into v_football
  from private.daily_challenge_schedule_versions
  where version = 'football-daily-v11-millionaire-no-double';

  if v_ufc.version is null
    or v_ufc.sport <> 'ufc'
    or v_ufc.starts_on <> date '2026-09-19'
    or v_ufc.anchor_day <> date '2026-09-19'
    or coalesce(array_length(v_ufc.game_cycle, 1), 0) <> 26 then
    raise exception 'UFC Millionaire Daily schedule identity is invalid: %', row_to_json(v_ufc);
  end if;

  if (select count(*) from unnest(v_ufc.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'keep_4_cut_4') <> 0 then
    raise exception 'UFC Millionaire Daily mix is invalid: %', v_ufc.game_cycle;
  end if;

  if v_football.version is null
    or v_football.sport <> 'football'
    or v_football.starts_on <> date '2026-09-19'
    or v_football.anchor_day <> date '2026-09-19'
    or coalesce(array_length(v_football.game_cycle, 1), 0) <> 22 then
    raise exception 'Football Millionaire Daily schedule identity is invalid: %', row_to_json(v_football);
  end if;

  if (select count(*) from unnest(v_football.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'keep_4_cut_4') <> 0
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'blind_resume') <> 0 then
    raise exception 'Football Millionaire Daily mix is invalid: %', v_football.game_cycle;
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-18', 'ufc') <> 'play-rotation-v7'
    or private.daily_challenge_schedule_for_day(date '2026-09-18', 'football') <> 'football-daily-v9-sep18-advance'
    or private.daily_challenge_schedule_for_day(date '2026-09-19', 'ufc') <> 'play-rotation-v9-millionaire-no-double'
    or private.daily_challenge_schedule_for_day(date '2026-09-19', 'football') <> 'football-daily-v11-millionaire-no-double'
    or private.daily_challenge_expected_game('play-rotation-v9-millionaire-no-double', date '2026-09-19') <> 'millionaire'
    or private.daily_challenge_expected_game('football-daily-v11-millionaire-no-double', date '2026-09-19') <> 'millionaire' then
    raise exception 'September 19 Millionaire debut mapping is invalid';
  end if;

  select * into v_grade
  from private.grade_millionaire_daily(
    '{"proof":"proof","outcome":"won","completed_questions":8,"final_money":1000000,"base_score":100,"lifelines_used":2,"time_remaining_ms":42000}'::jsonb,
    '{"proof":"proof"}'::jsonb
  );
  if v_grade.normalized_score <> 96
    or v_grade.public_result->>'final_money' <> '1000000' then
    raise exception 'Millionaire win grading is invalid: %', row_to_json(v_grade);
  end if;

  select * into v_grade
  from private.grade_millionaire_daily(
    '{"proof":"proof","outcome":"lost","completed_questions":7,"final_money":100000,"base_score":80,"lifelines_used":0,"time_remaining_ms":31000}'::jsonb,
    '{"proof":"proof"}'::jsonb
  );
  if v_grade.normalized_score <> 80
    or v_grade.public_result->>'final_money' <> '100000' then
    raise exception 'Millionaire Q8-risk grading is invalid: %', row_to_json(v_grade);
  end if;

  select * into v_grade
  from private.grade_millionaire_daily(
    '{"proof":"proof","outcome":"walked-away","completed_questions":7,"final_money":500000,"base_score":90,"lifelines_used":1,"time_remaining_ms":51000}'::jsonb,
    '{"proof":"proof"}'::jsonb
  );
  if v_grade.normalized_score <> 88
    or v_grade.public_result->>'final_money' <> '500000' then
    raise exception 'Millionaire walk-away grading is invalid: %', row_to_json(v_grade);
  end if;
end
$$;

rollback;
\echo 'Millionaire Daily launch schedule + grader proof passed.'
