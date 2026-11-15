\set ON_ERROR_STOP on
begin;

-- NBA must settle through the canonical server grader with the same
-- proof and scoring rules as UFC/Football. Regression for 2026-11-15:
-- previously all NBA final submissions failed "terminal state is invalid".
do $test$
declare
  v_grade record;
  v_submission jsonb := jsonb_build_object(
    'proof', 'nba-average-fan-grader-regression',
    'fan', 'shane',
    'sport', 'nba',
    'board_score', 90,
    'final_outcome', 'correct',
    'normalized_score', 100,
    'native_score', 100,
    'unsaved_miss_question_numbers', '[]'::jsonb,
    'board_question_ids', jsonb_build_array('q1','q2','q3','q4','q5','q6','q7','q8'),
    'final_question_id', 'final-1',
    'saves', 1
  );
  v_evidence jsonb := jsonb_build_object(
    'proof', 'nba-average-fan-grader-regression',
    'max_score', 100
  );
begin
  select * into strict v_grade from private.grade_daily_challenge(
    'average_fan', 'average-fan-score-v2', v_submission, v_evidence
  );
  if v_grade.native_score <> 100 or v_grade.normalized_score <> 100
    or v_grade.public_result->>'sport' <> 'nba'
    or v_grade.public_result->>'final_outcome' <> 'correct'
    or v_grade.public_result->>'saves' <> '1' then
    raise exception 'NBA Average Fan correct final did not receive 100 points';
  end if;

  select * into strict v_grade from private.grade_daily_challenge(
    'average_fan', 'average-fan-score-v2',
    v_submission || '{"final_outcome":"walk-away","native_score":90,"normalized_score":90}'::jsonb,
    v_evidence
  );
  if v_grade.normalized_score <> 90 then
    raise exception 'NBA Average Fan walk-away score was altered';
  end if;

  select * into strict v_grade from private.grade_daily_challenge(
    'average_fan', 'average-fan-score-v2',
    v_submission || '{"final_outcome":"wrong","native_score":80,"normalized_score":80}'::jsonb,
    v_evidence
  );
  if v_grade.normalized_score <> 80 then
    raise exception 'NBA Average Fan wrong final score was altered';
  end if;

  begin
    perform * from private.grade_daily_challenge(
      'average_fan', 'average-fan-score-v2',
      v_submission || '{"sport":"mlb"}'::jsonb, v_evidence
    );
    raise exception 'Unexpectedly accepted an unsupported Average Fan sport';
  exception
    when others then
      if sqlerrm <> 'Average Fan terminal state is invalid' then
        raise;
      end if;
  end;
end
$test$;

rollback;
