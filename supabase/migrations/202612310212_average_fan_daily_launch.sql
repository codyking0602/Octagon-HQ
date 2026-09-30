-- Productionize Are You Smarter Than an Average Fan? as a canonical Daily.
-- Future-only cutover: September 29/30 schedules remain immutable; Oct 1 starts
-- new schedule versions with roughly five Average Fan appearances per month.

alter table private.daily_challenge_setups
  drop constraint if exists daily_challenge_setups_supported_games_check;
alter table private.daily_challenge_setups
  add constraint daily_challenge_setups_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia', 'average_fan'
  ));

alter table private.daily_challenges
  drop constraint if exists daily_challenges_supported_games_check;
alter table private.daily_challenges
  add constraint daily_challenges_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia', 'average_fan'
  ));

alter table private.daily_challenge_schedule_versions
  drop constraint if exists daily_challenge_schedule_versions_supported_games_check;
alter table private.daily_challenge_schedule_versions
  add constraint daily_challenge_schedule_versions_supported_games_check
  check (game_cycle <@ array[
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia', 'average_fan'
  ]::text[]);

create or replace function public.get_average_fan_publication_history(
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
  -- EXECUTE is revoked from PUBLIC/anon/authenticated below and granted only
  -- to service_role; avoid deprecated JWT-role checks inside SECURITY DEFINER.
  if p_sport is null or p_sport not in ('ufc', 'football') or p_before_day is null then
    raise exception 'valid Average Fan publication-history scope is required';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'day', daily.central_day,
        'sport', setup.private_setup_evidence->>'sport',
        'question_ids', coalesce(setup.private_setup_evidence->'question_ids', '[]'::jsonb),
        'final_question_id', setup.private_setup_evidence->>'final_question_id'
      )
      order by daily.central_day
    )
    from private.daily_challenges daily
    join private.daily_challenge_setups setup
      on setup.id = daily.setup_id
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.game_type = 'average_fan'
      and daily.central_day < p_before_day
      and schedule.sport = p_sport
      and setup.private_setup_evidence->>'sport' in ('ufc', 'nfl', 'cfb')
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.get_average_fan_publication_history(text, date)
  from public, anon, authenticated;
grant execute on function public.get_average_fan_publication_history(text, date)
  to service_role;

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
    or jsonb_array_length(p_submission->'board_question_ids') <> 10 then
    raise exception 'Average Fan board evidence is invalid';
  end if;
  if exists (
    select 1
    from jsonb_array_elements_text(p_submission->'unsaved_miss_question_numbers') miss(value)
    where miss.value !~ '^[0-9]+$'
      or miss.value::integer < 1
      or miss.value::integer > 10
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
    else greatest(0, least(90, 64 + (2 * v_first_miss) - (5 * (v_miss_count - 1))))
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

do $grader$
declare
  v_signature constant regprocedure :=
    'private.grade_daily_challenge_pre_combo(text,text,jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$old$;
  v_replacement constant text := $new$
  elsif p_game_type = 'average_fan' then
    select grade.native_score, grade.normalized_score, grade.public_result
    into native_score, normalized_score, public_result
    from private.grade_average_fan_daily(p_submission, p_grading_evidence) grade;
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''average_fan''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily grader terminal branch changed before Average Fan integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''average_fan''' in v_definition) = 0
    or position('grade_average_fan_daily' in v_definition) = 0 then
    raise exception 'Average Fan Daily grader patch did not apply exactly';
  end if;
end
$grader$;

do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        'bar_trivia', round((avg(history.normalized_score) filter (where history.game_type = 'bar_trivia'))::numeric, 1)
      ) as game_averages,
$old$;
  v_replacement constant text := $new$
        'bar_trivia', round((avg(history.normalized_score) filter (where history.game_type = 'bar_trivia'))::numeric, 1),
        'average_fan', round((avg(history.normalized_score) filter (where history.game_type = 'average_fan'))::numeric, 1)
      ) as game_averages,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''average_fan''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily standings projection changed before Average Fan integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$standings$;

do $leaderboard$
declare
  v_signature constant regprocedure :=
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        else '{}'::jsonb
      end as result_detail,
$old$;
  v_replacement constant text := $new$
        when history.game_type = 'average_fan' then
          jsonb_build_object(
            'fan', progress.public_state ->> 'fan',
            'resolved', coalesce(progress.public_state -> 'resolved', '[]'::jsonb),
            'board_score', progress.public_state -> 'board_score',
            'final_subject', progress.public_state ->> 'final_subject',
            'final_outcome', progress.public_state ->> 'final_outcome',
            'final_score', progress.public_state -> 'final_score',
            'final_question', progress.public_state -> 'final_question',
            'final_player_answer', progress.public_state ->> 'final_player_answer',
            'final_correct_answer', progress.public_state ->> 'final_correct_answer',
            'final_explanation', progress.public_state ->> 'final_explanation'
          )
        else '{}'::jsonb
      end as result_detail,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('when history.game_type = ''average_fan'' then' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily leaderboard detail branch changed before Average Fan integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$leaderboard$;

do $schedule$
declare
  v_cutover constant date := date '2026-10-01';
  v_ufc_version constant text := 'play-rotation-v18-average-fan-oct1';
  v_football_version constant text := 'football-daily-v18-average-fan-oct1';
  v_football_cycle constant text[] := array[
    'average_fan',
    'bar_trivia',
    'millionaire',
    'sports_feud',
    'who_am_i',
    'average_fan',
    'millionaire',
    'average_fan',
    'sports_feud',
    'millionaire',
    'find_leader',
    'hit_the_number',
    'find_leader',
    'bar_trivia',
    'sports_feud',
    'average_fan',
    'wavelength',
    'average_fan',
    'sports_feud',
    'find_leader',
    'wavelength',
    'bar_trivia',
    'who_am_i',
    'wavelength',
    'hit_the_number',
    'millionaire',
    'who_am_i'
  ]::text[];
  v_ufc_cycle constant text[] := array[
    'average_fan',
    'who_am_i',
    'blind_resume',
    'find_leader',
    'bar_trivia',
    'sports_feud',
    'bar_trivia',
    'sports_feud',
    'average_fan',
    'sports_feud',
    'millionaire',
    'sports_feud',
    'average_fan',
    'hit_the_number',
    'millionaire',
    'blind_resume',
    'average_fan',
    'who_am_i',
    'average_fan',
    'who_am_i',
    'millionaire',
    'find_leader',
    'wavelength',
    'bar_trivia',
    'millionaire',
    'find_leader',
    'hit_the_number',
    'wavelength',
    'wavelength'
  ]::text[];
begin
  if private.daily_challenge_schedule_for_day(v_cutover - 1, 'ufc')
      is distinct from 'play-rotation-v17-bar-trivia-sep29'
    or private.daily_challenge_schedule_for_day(v_cutover - 1, 'football')
      is distinct from 'football-daily-v17-bar-trivia-sep29' then
    raise exception 'September 30 canonical Daily schedule changed before Average Fan cutover';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing Average Fan cutover because Oct 1+ Daily content is already materialized';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 27
    or (select count(*) from unnest(v_football_cycle) game where game = 'average_fan') <> 5
    or coalesce(array_length(v_ufc_cycle, 1), 0) <> 29
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'average_fan') <> 5 then
    raise exception 'Average Fan Daily appearance cadence is invalid';
  end if;

  if v_football_cycle[1] is distinct from 'average_fan'
    or v_ufc_cycle[1] is distinct from 'average_fan'
    or v_football_cycle[27] = 'average_fan'
    or v_ufc_cycle[29] = 'average_fan' then
    raise exception 'Average Fan Daily launch or cycle boundary is invalid';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
    (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'average_fan'
    or private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'average_fan' then
    raise exception 'Average Fan launch schedules did not become canonical';
  end if;
end
$schedule$;

notify pgrst, 'reload schema';
