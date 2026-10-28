-- Regression proof: the canonical attempt grader must accept the exact Sports
-- Feud scoring identity and reach grade_sports_feud_daily instead of dying in
-- the legacy play-official-score-v1 gate.
do $sports_feud_grader_hotfix_test$
declare
  v_definition text;
  v_grade record;
begin
  select pg_get_functiondef(
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure::oid
  ) into v_definition;

  if position('p_game_type = ''sports_feud'' then' in v_definition) = 0
    or position('p_scoring_version <> ''family-feud-score-v2''' in v_definition) = 0 then
    raise exception 'Sports Feud scoring-version gate is not explicit in the canonical delegate';
  end if;

  select *
  into v_grade
  from private.grade_daily_challenge(
    'sports_feud',
    'family-feud-score-v2',
    jsonb_build_object(
      'proof', 'sports-feud-grader-hotfix-test',
      'native_score', 67,
      'normalized_score', 67,
      'main_points', 40,
      'fast_money_points', 27,
      'fast_money_time_remaining_ms', 12345
    ),
    jsonb_build_object(
      'proof', 'sports-feud-grader-hotfix-test',
      'raw_max', 100
    )
  );

  if v_grade.native_score is distinct from 67
    or v_grade.normalized_score is distinct from 67
    or v_grade.public_result->>'main_points' is distinct from '40'
    or v_grade.public_result->>'fast_money_points' is distinct from '27' then
    raise exception 'Sports Feud canonical Daily grading result is incorrect';
  end if;
end
$sports_feud_grader_hotfix_test$;
