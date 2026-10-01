-- Calibrate the live Millionaire Q8 risk/reward decision.
-- A clean run reaching Q8 may bank 90, risk down to 85 on a miss, or finish at 100.
-- Lifeline deductions remain 2 points each. Earlier-miss recovery scoring is unchanged.

create or replace function private.grade_millionaire_daily(
  p_submission jsonb,
  p_grading_evidence jsonb
)
returns table (
  native_score integer,
  normalized_score integer,
  public_result jsonb
)
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_proof text;
  v_outcome text;
  v_completed integer;
  v_first_miss integer;
  v_final_money integer;
  v_base_score integer;
  v_lifelines integer;
  v_time integer;
  v_expected_base integer;
  v_expected_money integer;
begin
  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'Millionaire submission and grading evidence must be objects';
  end if;

  v_proof := nullif(p_grading_evidence->>'proof', '');
  if v_proof is null or p_submission->>'proof' is distinct from v_proof then
    raise exception 'Millionaire server proof is invalid';
  end if;

  v_outcome := nullif(p_submission->>'outcome', '');
  if v_outcome not in ('won', 'lost', 'walked-away') then
    raise exception 'Millionaire terminal outcome is invalid';
  end if;

  if coalesce(p_submission->>'completed_questions', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'final_money', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'base_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'lifelines_used', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'time_remaining_ms', '') !~ '^[0-9]+$' then
    raise exception 'Millionaire terminal scoring fields are invalid';
  end if;

  if p_submission->>'first_miss_question' is not null
    and coalesce(p_submission->>'first_miss_question', '') !~ '^[1-8]$' then
    raise exception 'Millionaire first miss question is invalid';
  end if;

  v_completed := (p_submission->>'completed_questions')::integer;
  v_first_miss := nullif(p_submission->>'first_miss_question', '')::integer;
  v_final_money := (p_submission->>'final_money')::integer;
  v_base_score := (p_submission->>'base_score')::integer;
  v_lifelines := (p_submission->>'lifelines_used')::integer;
  v_time := (p_submission->>'time_remaining_ms')::integer;

  if v_completed < 0 or v_completed > 8
    or v_lifelines < 0 or v_lifelines > 3
    or v_time < 0 or v_time > 150000 then
    raise exception 'Millionaire terminal scoring fields are out of range';
  end if;

  if v_outcome = 'won' then
    if v_completed <> 8 or v_first_miss is not null then
      raise exception 'Millionaire win must clear all eight questions without a miss';
    end if;
    v_expected_base := 100;
    v_expected_money := 1000000;
  elsif v_outcome = 'walked-away' then
    if v_completed <> 7 or v_first_miss is not null then
      raise exception 'Millionaire walk-away is only valid before Q8 while still alive';
    end if;
    v_expected_base := 90;
    v_expected_money := 500000;
  else
    if v_first_miss is null then
      raise exception 'Millionaire loss requires a first miss question';
    end if;
    if v_completed > 7 or v_completed < v_first_miss - 1 then
      raise exception 'Millionaire loss answer count is inconsistent with the first miss';
    end if;

    if v_first_miss = 8 and v_completed = 7 then
      v_expected_base := 85;
    else
      -- Finish-the-board recovery remains: 20-point floor, +5 per correct
      -- answer anywhere, +5 per consecutive correct answer before first miss.
      v_expected_base := least(100, 20 + (v_completed * 5) + ((v_first_miss - 1) * 5));
    end if;

    v_expected_money := case
      when v_first_miss <= 3 then 0
      when v_first_miss <= 6 then 5000
      else 100000
    end;
  end if;

  if v_base_score <> v_expected_base or v_final_money <> v_expected_money then
    raise exception 'Millionaire terminal state does not match the recovery scoring contract';
  end if;

  native_score := greatest(0, v_expected_base - (v_lifelines * 2));
  normalized_score := native_score;
  public_result := jsonb_build_object(
    'outcome', v_outcome,
    'completed_questions', v_completed,
    'first_miss_question', v_first_miss,
    'final_money', v_final_money,
    'base_score', v_expected_base,
    'lifelines_used', v_lifelines,
    'time_remaining_ms', v_time,
    'score', normalized_score
  );
  return next;
end;
$$;

revoke all on function private.grade_millionaire_daily(jsonb, jsonb)
  from public, anon, authenticated;

-- Re-score any already-completed legacy clean-Q8 misses from the old 80-point
-- risk rule to the new 85-point risk rule. Keep every related canonical store
-- aligned so history, leaderboard detail, and saved result agree.
update private.daily_challenge_attempts
set
  native_score = least(100, native_score + 5),
  normalized_score = least(100, normalized_score + 5),
  public_result = jsonb_set(
    jsonb_set(public_result, '{base_score}', '85'::jsonb, true),
    '{score}',
    to_jsonb(least(100, normalized_score + 5)),
    true
  ),
  submission_evidence = case
    when jsonb_typeof(submission_evidence) = 'object'
      then jsonb_set(submission_evidence, '{base_score}', '85'::jsonb, true)
    else submission_evidence
  end
where public_result->>'outcome' = 'lost'
  and public_result->>'completed_questions' = '7'
  and public_result->>'base_score' = '80'
  and public_result->>'final_money' = '100000';

update private.daily_challenge_history
set
  native_score = least(100, native_score + 5),
  normalized_score = least(100, normalized_score + 5),
  public_result = jsonb_set(
    jsonb_set(public_result, '{base_score}', '85'::jsonb, true),
    '{score}',
    to_jsonb(least(100, normalized_score + 5)),
    true
  )
where game_type = 'millionaire'
  and public_result->>'outcome' = 'lost'
  and public_result->>'completed_questions' = '7'
  and public_result->>'base_score' = '80'
  and public_result->>'final_money' = '100000';

update private.daily_challenge_progress
set
  public_state = jsonb_set(
    jsonb_set(public_state, '{base_score}', '85'::jsonb, true),
    '{score}',
    to_jsonb(least(100, coalesce((public_state->>'score')::integer, 0) + 5)),
    true
  ),
  submission_state = case
    when jsonb_typeof(submission_state->'final_submission') = 'object' then
      jsonb_set(submission_state, '{final_submission,base_score}', '85'::jsonb, true)
    else submission_state
  end
where public_state->>'status' = 'lost'
  and public_state->>'completed_questions' = '7'
  and public_state->>'base_score' = '80'
  and public_state->>'final_money' = '100000';

notify pgrst, 'reload schema';
