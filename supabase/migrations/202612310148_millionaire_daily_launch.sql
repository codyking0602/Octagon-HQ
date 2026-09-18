-- Launch Millionaire as a canonical Daily Challenge on September 19, 2026.
-- Daily Double leaves the future rotation entirely. Historical schedules/results remain immutable.
-- New mixes:
--   Football: Find 5 / Wavelength 5 / Hit 4 / Who Am I 4 / Millionaire 4 = 22
--   UFC: Find 5 / Wavelength 5 / Blind Resume 4 / Hit 4 / Who Am I 4 / Millionaire 4 = 26

-- Extend all canonical Daily game-type constraints without disturbing historical rows.
alter table private.daily_challenge_setups
  drop constraint if exists daily_challenge_setups_supported_games_check;
alter table private.daily_challenge_setups
  add constraint daily_challenge_setups_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire'
  ));

alter table private.daily_challenges
  drop constraint if exists daily_challenges_supported_games_check;
alter table private.daily_challenges
  add constraint daily_challenges_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire'
  ));

alter table private.daily_challenge_schedule_versions
  drop constraint if exists daily_challenge_schedule_versions_supported_games_check;
alter table private.daily_challenge_schedule_versions
  add constraint daily_challenge_schedule_versions_supported_games_check
  check (game_cycle <@ array[
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire'
  ]::text[]);

-- Millionaire's server-owned terminal snapshot is graded here. The proof is created from
-- the private canonical question run and is never exposed through the public Daily payload.
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

  v_completed := (p_submission->>'completed_questions')::integer;
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
    if v_completed <> 8 then raise exception 'Millionaire win must clear all eight questions'; end if;
    v_expected_base := 100;
    v_expected_money := 1000000;
  elsif v_outcome = 'walked-away' then
    if v_completed <> 7 then raise exception 'Millionaire walk-away is only valid before Q8'; end if;
    v_expected_base := 90;
    v_expected_money := 500000;
  else
    if v_completed > 7 then raise exception 'Millionaire loss cannot contain eight completed questions'; end if;
    v_expected_base := case v_completed
      when 0 then 0
      when 1 then 25
      when 2 then 35
      when 3 then 45
      when 4 then 55
      when 5 then 68
      when 6 then 80
      when 7 then 80
    end;
    v_expected_money := case
      when v_completed < 3 then 0
      when v_completed < 6 then 5000
      else 100000
    end;
  end if;

  if v_base_score <> v_expected_base or v_final_money <> v_expected_money then
    raise exception 'Millionaire terminal state does not match the locked ladder';
  end if;

  native_score := greatest(0, v_expected_base - (v_lifelines * 2));
  normalized_score := native_score;
  public_result := jsonb_build_object(
    'outcome', v_outcome,
    'completed_questions', v_completed,
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

-- Keep one canonical Daily grader. Add Millionaire to the ordinary-game delegate in place.
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
  elsif p_game_type = 'millionaire' then
    select grade.native_score, grade.normalized_score, grade.public_result
    into native_score, normalized_score, public_result
    from private.grade_millionaire_daily(p_submission, p_grading_evidence) grade;
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('p_game_type = ''millionaire''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily grader terminal branch changed before Millionaire integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''millionaire''' in v_definition) = 0
    or position('grade_millionaire_daily' in v_definition) = 0 then
    raise exception 'Millionaire Daily grader patch did not apply exactly';
  end if;
end
$grader$;

-- Add Millionaire to the existing per-game Championship average projection.
do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        'who_am_i', round((avg(history.normalized_score) filter (where history.game_type = 'who_am_i'))::numeric, 1)
      ) as game_averages,
$old$;
  v_replacement constant text := $new$
        'who_am_i', round((avg(history.normalized_score) filter (where history.game_type = 'who_am_i'))::numeric, 1),
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1)
      ) as game_averages,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''millionaire''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily standings game-average projection changed before Millionaire integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$standings$;

-- Start both new cycles with Millionaire tomorrow. No Daily Double slot remains.
do $schedule$
declare
  v_cutover constant date := date '2026-09-19';
  v_ufc_version constant text := 'play-rotation-v8-millionaire';
  v_football_version constant text := 'football-daily-v10-millionaire';
  v_ufc_cycle constant text[] := array[
    'millionaire',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','millionaire','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','hit_the_number','millionaire','who_am_i',
    'find_leader','wavelength'
  ]::text[];
  v_football_cycle constant text[] := array[
    'millionaire',
    'find_leader','wavelength','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','hit_the_number','who_am_i',
    'find_leader','wavelength','hit_the_number','millionaire','who_am_i',
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength'
  ]::text[];
begin
  if private.daily_challenge_schedule_for_day(v_cutover - 1, 'ufc') is distinct from 'play-rotation-v7'
    or private.daily_challenge_schedule_for_day(v_cutover - 1, 'football') is distinct from 'football-daily-v9-sep18-advance' then
    raise exception 'September 18 Daily schedule identity changed before Millionaire launch';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing Millionaire Daily cutover because future Daily content is already materialized';
  end if;

  if exists (
    select 1 from private.daily_challenge_schedule_versions
    where version in (v_ufc_version, v_football_version)
  ) then
    raise exception 'Millionaire Daily schedule identity already exists';
  end if;

  if coalesce(array_length(v_ufc_cycle, 1), 0) <> 26
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'keep_4_cut_4') <> 0 then
    raise exception 'UFC Millionaire Daily cycle mix is invalid';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 22
    or (select count(*) from unnest(v_football_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game in ('blind_resume','keep_4_cut_4')) <> 0 then
    raise exception 'Football Millionaire Daily cycle mix is invalid';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
    (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'millionaire'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'millionaire' then
    raise exception 'September 19 Millionaire debut did not activate for both sports';
  end if;
end
$schedule$;
