-- Make the Millionaire Q8 decision a real, calibrated risk:
-- clean through Q7 = 90 base, walk = 90, Q8 miss = 85, Q8 hit = 100.
-- Earlier finish-the-board recovery scoring remains unchanged.

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

    v_expected_base := case
      when v_first_miss = 8 and v_completed = 7 then 85
      else least(100, 20 + (v_completed * 5) + ((v_first_miss - 1) * 5))
    end;
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

-- Repair any finish-the-board Daily result that happened to miss Q8 under the
-- previous 90-base rule before this migration deployed. Older pre-recovery
-- results do not carry first_miss_question and are intentionally untouched.
update private.daily_challenge_attempts
set
  native_score = greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2)),
  normalized_score = greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2)),
  public_result = jsonb_set(
    jsonb_set(public_result, '{base_score}', '85'::jsonb, true),
    '{score}',
    to_jsonb(greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2))),
    true
  ),
  submission_evidence = case
    when jsonb_typeof(submission_evidence) = 'object'
      and jsonb_typeof(submission_evidence->'final_submission') = 'object'
    then jsonb_set(
      jsonb_set(submission_evidence, '{final_submission,base_score}', '85'::jsonb, true),
      '{final_submission,score}',
      to_jsonb(greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2))),
      true
    )
    else submission_evidence
  end
where public_result->>'first_miss_question' = '8'
  and public_result->>'outcome' = 'lost'
  and coalesce((public_result->>'completed_questions')::integer, -1) = 7;

update private.daily_challenge_history
set
  native_score = greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2)),
  normalized_score = greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2)),
  public_result = jsonb_set(
    jsonb_set(public_result, '{base_score}', '85'::jsonb, true),
    '{score}',
    to_jsonb(greatest(0, 85 - (coalesce((public_result->>'lifelines_used')::integer, 0) * 2))),
    true
  )
where game_type = 'millionaire'
  and public_result->>'first_miss_question' = '8'
  and public_result->>'outcome' = 'lost'
  and coalesce((public_result->>'completed_questions')::integer, -1) = 7;

-- Today's MLB Millionaire originally stored only a terminal summary. Add the
-- deterministically recoverable first-miss/base fields for those completed
-- rows so the leaderboard can show the truthful run shape. Exact picks and
-- lifeline timing remain explicitly unavailable.
with legacy as (
  select
    season,
    challenge_key,
    profile_id,
    coalesce((public_result->>'lifelines_used')::integer, 0) as lifelines,
    coalesce((public_result->>'completed_questions')::integer, 0) as completed,
    raw_score::integer + (2 * coalesce((public_result->>'lifelines_used')::integer, 0)) as base_score,
    case
      when public_result->>'outcome' = 'lost' then
        (
          (
            raw_score::integer
            + (2 * coalesce((public_result->>'lifelines_used')::integer, 0))
            - 20
            - (5 * coalesce((public_result->>'completed_questions')::integer, 0))
          ) / 5
        ) + 1
      else null
    end as first_miss
  from public.mlb_postseason_challenge_results
  where game_type = 'millionaire'
    and challenge_key = 'mlb-2026-play-03'
    and not (coalesce(result_detail, '{}'::jsonb) ? 'action_history')
),
valid as (
  select *
  from legacy
  where first_miss is null or first_miss between 1 and 8
)
update public.mlb_postseason_challenge_results result
set
  raw_score = case
    when valid.first_miss = 8 and valid.completed = 7
      then greatest(0, 85 - (valid.lifelines * 2))
    else result.raw_score
  end,
  public_result = jsonb_set(
    jsonb_set(
      jsonb_set(
        coalesce(result.public_result, '{}'::jsonb),
        '{base_score}',
        to_jsonb(case when valid.first_miss = 8 and valid.completed = 7 then 85 else valid.base_score end),
        true
      ),
      '{first_miss_question}',
      coalesce(to_jsonb(valid.first_miss), 'null'::jsonb),
      true
    ),
    '{score}',
    to_jsonb(case
      when valid.first_miss = 8 and valid.completed = 7
        then greatest(0, 85 - (valid.lifelines * 2))
      else result.raw_score::integer
    end),
    true
  ),
  result_detail = jsonb_set(
    jsonb_set(
      jsonb_set(
        coalesce(result.result_detail, '{}'::jsonb),
        '{base_score}',
        to_jsonb(case when valid.first_miss = 8 and valid.completed = 7 then 85 else valid.base_score end),
        true
      ),
      '{first_miss_question}',
      coalesce(to_jsonb(valid.first_miss), 'null'::jsonb),
      true
    ),
    '{legacy_detail_limited}',
    'true'::jsonb,
    true
  )
from valid
where result.season = valid.season
  and result.challenge_key = valid.challenge_key
  and result.profile_id = valid.profile_id;

notify pgrst, 'reload schema';
