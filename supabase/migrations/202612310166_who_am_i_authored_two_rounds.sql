-- Who Am I authored Daily v1.
-- Adds server-owned publication history plus a two-round aggregate grader while
-- preserving every historical single-round Who Am I result and score contract.

create or replace function public.get_who_am_i_publication_history(
  p_sport text,
  p_before_day date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read Who Am I publication history';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') or p_before_day is null then
    raise exception 'valid Who Am I publication-history scope is required';
  end if;

  return coalesce((
    with source as (
      select
        daily.central_day,
        setup.private_setup_evidence
      from private.daily_challenges daily
      join private.daily_challenge_setups setup
        on setup.id = daily.setup_id
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = daily.schedule_version
      where daily.game_type = 'who_am_i'
        and daily.central_day < p_before_day
        and schedule.sport = p_sport
    ),
    flattened as (
      select
        source.central_day,
        (round_row.ordinality - 1)::integer as round_index,
        coalesce(
          nullif(round_row.value->'private_setup_evidence'->>'hidden_subject_id', ''),
          nullif(round_row.value->>'hidden_subject_id', '')
        ) as subject_id,
        coalesce(
          nullif(round_row.value->'private_setup_evidence'->>'league', ''),
          nullif(round_row.value->>'league', '')
        ) as league,
        coalesce(
          nullif(round_row.value->'private_setup_evidence'->>'script_id', ''),
          nullif(round_row.value->>'script_id', '')
        ) as script_id
      from source
      cross join lateral jsonb_array_elements(
        case
          when jsonb_typeof(source.private_setup_evidence->'rounds') = 'array'
            then source.private_setup_evidence->'rounds'
          else jsonb_build_array(source.private_setup_evidence)
        end
      ) with ordinality as round_row(value, ordinality)
    )
    select jsonb_agg(
      jsonb_build_object(
        'day', flattened.central_day,
        'round_index', flattened.round_index,
        'subject_id', flattened.subject_id,
        'league', flattened.league,
        'script_id', flattened.script_id
      )
      order by flattened.central_day, flattened.round_index
    )
    from flattened
    where flattened.subject_id is not null
      and flattened.league in ('UFC', 'NFL', 'CFB')
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_who_am_i_publication_history(text, date)
  from public, anon, authenticated;
grant execute on function public.get_who_am_i_publication_history(text, date)
  to service_role;

create or replace function private.grade_who_am_i_two_round(
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
  v_index integer;
  v_grade record;
  v_scores integer[] := array[]::integer[];
  v_results jsonb := '[]'::jsonb;
  v_evidence jsonb;
begin
  if jsonb_typeof(p_submission) <> 'object'
    or p_submission->>'format_version' is distinct from 'who-am-i-two-round-v1'
    or jsonb_typeof(p_submission->'rounds') <> 'array'
    or jsonb_array_length(p_submission->'rounds') <> 2 then
    raise exception 'Who Am I authored Daily submission must contain exactly two rounds';
  end if;
  if jsonb_typeof(p_grading_evidence) <> 'object'
    or p_grading_evidence->>'format_version' is distinct from 'who-am-i-two-round-v1'
    or jsonb_typeof(p_grading_evidence->'rounds') <> 'array'
    or jsonb_array_length(p_grading_evidence->'rounds') <> 2 then
    raise exception 'Who Am I authored Daily grading evidence must contain exactly two rounds';
  end if;

  for v_index in 0..1 loop
    v_evidence := p_grading_evidence->'rounds'->v_index;
    select grade.native_score, grade.normalized_score, grade.public_result
    into v_grade
    from private.grade_daily_challenge_pre_combo(
      'who_am_i',
      'play-official-score-v1',
      p_submission->'rounds'->v_index,
      v_evidence
    ) grade;

    if v_grade.normalized_score is null
      or v_grade.normalized_score < 0
      or v_grade.normalized_score > 100 then
      raise exception 'Who Am I authored Daily round score is invalid';
    end if;

    v_scores := array_append(v_scores, v_grade.normalized_score);
    v_results := v_results || jsonb_build_array(
      v_grade.public_result || jsonb_build_object(
        'round_index', v_index,
        'league', v_evidence->>'league',
        'score', v_grade.normalized_score
      )
    );
  end loop;

  normalized_score := round((v_scores[1] + v_scores[2])::numeric / 2)::integer;
  native_score := normalized_score;
  public_result := jsonb_build_object(
    'score', normalized_score,
    'rounds', v_results
  );
  return next;
end;
$$;

revoke all on function private.grade_who_am_i_two_round(jsonb, jsonb)
  from public, anon, authenticated;

do $patch$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  elsif p_game_type = 'who_am_i' then
    v_board := private.daily_challenge_text_array(
$old$;
  v_replacement constant text := $new$
  elsif p_game_type = 'who_am_i' then
    if p_grading_evidence->>'format_version' = 'who-am-i-two-round-v1' then
      select grade.native_score, grade.normalized_score, grade.public_result
      into native_score, normalized_score, public_result
      from private.grade_who_am_i_two_round(p_submission, p_grading_evidence) grade;
      return next;
      return;
    end if;

    v_board := private.daily_challenge_text_array(
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('grade_who_am_i_two_round' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Who Am I grader branch changed before authored two-round integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('grade_who_am_i_two_round' in v_definition) = 0
    or position('who-am-i-two-round-v1' in v_definition) = 0 then
    raise exception 'Who Am I authored two-round grader patch did not apply exactly';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
