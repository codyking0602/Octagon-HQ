-- Calibrate Average Fan to the approved four-grade / eight-question game.
-- This is a forward-only contract change before the first official Average Fan Daily
-- materializes. Owner preview progress is isolated and can be safely reset.

create or replace function private.grade_average_fan_daily(
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
  v_board integer;
  v_score integer;
  v_expected integer;
  v_outcome text;
  v_fan text;
  v_sport text;
  v_saves integer;
  v_miss_count integer;
  v_first_miss integer;
begin
  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'Average Fan submission and grading evidence must be objects';
  end if;

  v_proof := nullif(p_grading_evidence->>'proof', '');
  if v_proof is null or p_submission->>'proof' is distinct from v_proof then
    raise exception 'Average Fan server proof is invalid';
  end if;
  if p_grading_evidence->>'max_score' is distinct from '100' then
    raise exception 'Average Fan max score contract is invalid';
  end if;
  if coalesce(p_submission->>'board_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'native_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'normalized_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'saves', '') !~ '^[0-9]+$' then
    raise exception 'Average Fan scoring fields are invalid';
  end if;
  if jsonb_typeof(p_submission->'unsaved_miss_question_numbers') <> 'array'
    or jsonb_typeof(p_submission->'board_question_ids') <> 'array'
    or jsonb_array_length(p_submission->'board_question_ids') <> 8 then
    raise exception 'Average Fan board evidence is invalid';
  end if;
  if exists (
    select 1
    from jsonb_array_elements_text(p_submission->'unsaved_miss_question_numbers') miss(value)
    where miss.value !~ '^[0-9]+$'
      or miss.value::integer < 1
      or miss.value::integer > 8
  ) then
    raise exception 'Average Fan miss positions are invalid';
  end if;

  select count(*), min(value::integer)
  into v_miss_count, v_first_miss
  from (
    select distinct value
    from jsonb_array_elements_text(p_submission->'unsaved_miss_question_numbers') miss(value)
  ) unique_misses;

  v_board := (p_submission->>'board_score')::integer;
  v_score := (p_submission->>'normalized_score')::integer;
  v_saves := (p_submission->>'saves')::integer;
  v_outcome := p_submission->>'final_outcome';
  v_fan := p_submission->>'fan';
  v_sport := p_submission->>'sport';

  v_expected := case
    when coalesce(v_miss_count, 0) = 0 then 90
    else greatest(0, least(90, 68 + (2 * v_first_miss) - (5 * (v_miss_count - 1))))
  end;

  if v_board <> v_expected
    or v_board < 0 or v_board > 90
    or v_score < 0 or v_score > 100
    or (p_submission->>'native_score')::integer <> v_score
    or v_saves < 0 or v_saves > 1
    or v_fan not in ('cody', 'shane', 'troy', 'tyler', 'lib')
    or v_sport not in ('ufc', 'nfl', 'cfb')
    or nullif(p_submission->>'final_question_id', '') is null
    or v_outcome not in ('walk-away', 'correct', 'wrong') then
    raise exception 'Average Fan terminal state is invalid';
  end if;

  if v_outcome = 'walk-away' then
    v_expected := v_board;
  elsif v_outcome = 'correct' then
    v_expected := least(100, v_board + 10);
  else
    v_expected := greatest(0, v_board - 10);
  end if;

  if v_score <> v_expected then
    raise exception 'Average Fan Final score is invalid';
  end if;

  native_score := v_score;
  normalized_score := v_score;
  public_result := jsonb_build_object(
    'score', v_score,
    'board_score', v_board,
    'final_outcome', v_outcome,
    'fan', v_fan,
    'sport', v_sport,
    'saves', v_saves
  );
  return next;
end;
$$;

revoke all on function private.grade_average_fan_daily(jsonb, jsonb)
  from public, anon, authenticated;

do $publication$
declare
  v_signature constant regprocedure :=
    'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)'::regprocedure;
  v_definition text;
  v_old constant text :=
    '(p_game_type = ''average_fan'' and p_scoring_version = ''average-fan-score-v1'')';
  v_new constant text :=
    '(p_game_type = ''average_fan'' and p_scoring_version = ''average-fan-score-v2'')';
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Average Fan publication scoring gate changed before four-grade calibration';
    end if;
    execute replace(v_definition, v_old, v_new);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    raise exception 'Average Fan v2 publication scoring gate did not apply';
  end if;
end
$publication$;

do $grading$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_old constant text := 'p_scoring_version <> ''average-fan-score-v1''';
  v_new constant text := 'p_scoring_version <> ''average-fan-score-v2''';
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Average Fan completion scoring gate changed before four-grade calibration';
    end if;
    execute replace(v_definition, v_old, v_new);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    raise exception 'Average Fan v2 completion scoring gate did not apply';
  end if;
end
$grading$;

-- Owner previews are explicitly non-competitive. Remove old v1 10-question state so
-- the owner preview rebuilds from the new v2 canonical setup on the next load.
delete from private.owner_average_fan_daily_preview_progress;

notify pgrst, 'reload schema';
