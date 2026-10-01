-- Calibrate Millionaire's final-question risk and backfill any already-settled
-- results that were scored under the short-lived no-penalty Q8 miss rule.
--
-- Clean through Q7:
--   walk away = 90 base
--   miss Q8   = 85 base
--   clear Q8  = 100 base
-- Lifelines continue to cost 2 points each. Earlier recovery scoring is unchanged.

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

    -- A clean Q8 gamble is intentionally asymmetric: bank 90, risk 5, gain 10.
    -- This also ties a clean Q8 miss to the best Q7-bust/Q8-recovery path at 85.
    if v_first_miss = 8 and v_completed = 7 then
      v_expected_base := 85;
    else
      -- 20 participation floor after the first answered question, +5 for every
      -- correct answer anywhere, +5 for each consecutive correct answer before
      -- the first miss. Lifeline deductions are applied after this base.
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

-- Canonical Daily backfill: only underlying official attempt rows explicitly
-- marked as a Q8 first miss under the temporary 90-base rule are changed.
-- private.daily_challenge_history is a UNION view over these rows, so it follows
-- the corrected attempt automatically.
update private.daily_challenge_attempts
set
  native_score = greatest(0, 85 - (2 * coalesce((public_result->>'lifelines_used')::integer, 0))),
  normalized_score = greatest(0, 85 - (2 * coalesce((public_result->>'lifelines_used')::integer, 0))),
  public_result = public_result || jsonb_build_object(
    'base_score', 85,
    'score', greatest(0, 85 - (2 * coalesce((public_result->>'lifelines_used')::integer, 0)))
  )
where public_result->>'outcome' = 'lost'
  and coalesce((public_result->>'completed_questions')::integer, -1) = 7
  and coalesce((public_result->>'first_miss_question')::integer, 0) = 8
  and coalesce((public_result->>'base_score')::integer, -1) = 90;

-- MLB Play originally persisted only Millionaire summary fields. Add the
-- reconstructable base/first-miss fields to completed rows so today's
-- leaderboard can explain historical runs without inventing later picks.
with enriched as (
  select
    season,
    challenge_key,
    profile_id,
    raw_score,
    coalesce((public_result->>'lifelines_used')::integer, 0) as lifelines,
    coalesce((public_result->>'completed_questions')::integer, 0) as completed,
    public_result->>'outcome' as outcome,
    raw_score::integer + (2 * coalesce((public_result->>'lifelines_used')::integer, 0)) as base_score
  from public.mlb_postseason_challenge_results
  where game_type = 'millionaire'
),
inferred as (
  select
    *,
    case
      when outcome in ('won', 'walked-away') then null
      when base_score between 20 and 100
        and (base_score - 20 - (completed * 5)) % 5 = 0
      then greatest(1, least(8, ((base_score - 20 - (completed * 5)) / 5) + 1))
      else null
    end as first_miss_question
  from enriched
)
update public.mlb_postseason_challenge_results result
set
  public_result = result.public_result || jsonb_build_object(
    'base_score', inferred.base_score,
    'first_miss_question', inferred.first_miss_question
  ),
  result_detail = result.result_detail || jsonb_build_object(
    'base_score', inferred.base_score,
    'first_miss_question', inferred.first_miss_question
  ),
  updated_at = now()
from inferred
where result.season = inferred.season
  and result.challenge_key = inferred.challenge_key
  and result.profile_id = inferred.profile_id;

-- If an MLB player hits the broken Q8 path before this migration lands, correct
-- that locked result to the new 85-base rule as part of deployment.
update public.mlb_postseason_challenge_results
set
  raw_score = greatest(0, 85 - (2 * coalesce((public_result->>'lifelines_used')::integer, 0))),
  public_result = public_result || jsonb_build_object(
    'base_score', 85,
    'first_miss_question', 8,
    'score', greatest(0, 85 - (2 * coalesce((public_result->>'lifelines_used')::integer, 0)))
  ),
  result_detail = result_detail || jsonb_build_object(
    'base_score', 85,
    'first_miss_question', 8
  ),
  updated_at = now()
where game_type = 'millionaire'
  and public_result->>'outcome' = 'lost'
  and coalesce((public_result->>'completed_questions')::integer, -1) = 7
  and coalesce((public_result->>'base_score')::integer, -1) = 90;

notify pgrst, 'reload schema';
