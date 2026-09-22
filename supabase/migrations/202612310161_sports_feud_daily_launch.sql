-- Launch Sports Feud as an official UFC + Football Daily on September 22, 2026.
-- Historical schedules/results remain immutable.
--
-- New mixes:
--   Football: Find 5 / Wavelength 5 / Hit 4 / Who Am I 4 / Millionaire 4 / Sports Feud 4 = 26
--   UFC: Find 5 / Wavelength 5 / Blind Resume 4 / Hit 4 / Who Am I 4 / Millionaire 4 / Sports Feud 4 = 30

alter table private.daily_challenge_setups
  drop constraint if exists daily_challenge_setups_supported_games_check;
alter table private.daily_challenge_setups
  add constraint daily_challenge_setups_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire', 'sports_feud'
  ));

alter table private.daily_challenges
  drop constraint if exists daily_challenges_supported_games_check;
alter table private.daily_challenges
  add constraint daily_challenges_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire', 'sports_feud'
  ));

alter table private.daily_challenge_schedule_versions
  drop constraint if exists daily_challenge_schedule_versions_supported_games_check;
alter table private.daily_challenge_schedule_versions
  add constraint daily_challenge_schedule_versions_supported_games_check
  check (game_cycle <@ array[
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire', 'sports_feud'
  ]::text[]);

create or replace function private.grade_sports_feud_daily(
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
  v_native integer;
  v_normalized integer;
  v_main integer;
  v_fast integer;
  v_time integer;
  v_raw_max integer;
begin
  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'Sports Feud submission and grading evidence must be objects';
  end if;

  v_proof := nullif(p_grading_evidence->>'proof', '');
  if v_proof is null or p_submission->>'proof' is distinct from v_proof then
    raise exception 'Sports Feud server proof is invalid';
  end if;

  if coalesce(p_submission->>'native_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'normalized_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'main_points', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'fast_money_points', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'fast_money_time_remaining_ms', '') !~ '^[0-9]+$'
    or coalesce(p_grading_evidence->>'raw_max', '') !~ '^[0-9]+$' then
    raise exception 'Sports Feud scoring fields are invalid';
  end if;

  v_native := (p_submission->>'native_score')::integer;
  v_normalized := (p_submission->>'normalized_score')::integer;
  v_main := (p_submission->>'main_points')::integer;
  v_fast := (p_submission->>'fast_money_points')::integer;
  v_time := (p_submission->>'fast_money_time_remaining_ms')::integer;
  v_raw_max := (p_grading_evidence->>'raw_max')::integer;

  if v_raw_max <> 100
    or v_main < 0 or v_main > 60
    or v_fast < 0 or v_fast > 40
    or v_time < 0 or v_time > 45000
    or v_native < 0 or v_native > 100
    or v_normalized < 0 or v_normalized > 100
    or v_native <> v_main + v_fast
    or v_normalized <> v_native then
    raise exception 'Sports Feud terminal score does not match the locked 60 plus 40 contract';
  end if;

  native_score := v_native;
  normalized_score := v_normalized;
  public_result := jsonb_build_object(
    'main_points', v_main,
    'fast_money_points', v_fast,
    'fast_money_time_remaining_ms', v_time,
    'score', v_normalized
  );
  return next;
end;
$$;

revoke all on function private.grade_sports_feud_daily(jsonb, jsonb)
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
  elsif p_game_type = 'sports_feud' then
    select grade.native_score, grade.normalized_score, grade.public_result
    into native_score, normalized_score, public_result
    from private.grade_sports_feud_daily(p_submission, p_grading_evidence) grade;
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('p_game_type = ''sports_feud''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily grader terminal branch changed before Sports Feud integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''sports_feud''' in v_definition) = 0
    or position('grade_sports_feud_daily' in v_definition) = 0 then
    raise exception 'Sports Feud Daily grader patch did not apply exactly';
  end if;
end
$grader$;

do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1)
      ) as game_averages,
$old$;
  v_replacement constant text := $new$
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1),
        'sports_feud', round((avg(history.normalized_score) filter (where history.game_type = 'sports_feud'))::numeric, 1)
      ) as game_averages,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''sports_feud''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily standings game-average projection changed before Sports Feud integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;
end
$standings$;

do $schedule$
declare
  v_cutover constant date := date '2026-09-22';
  v_ufc_version constant text := 'play-rotation-v10-sports-feud';
  v_football_version constant text := 'football-daily-v12-sports-feud';
  v_ufc_cycle constant text[] := array[
    'sports_feud',
    'find_leader','wavelength','blind_resume','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength','sports_feud','blind_resume','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','blind_resume','sports_feud','hit_the_number','who_am_i',
    'find_leader','wavelength','blind_resume','millionaire','hit_the_number','sports_feud','who_am_i',
    'find_leader','wavelength','millionaire'
  ]::text[];
  v_football_cycle constant text[] := array[
    'sports_feud',
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire',
    'find_leader','wavelength','sports_feud','hit_the_number','who_am_i',
    'find_leader','wavelength','millionaire','hit_the_number','sports_feud','who_am_i',
    'find_leader','wavelength','hit_the_number','who_am_i','millionaire','sports_feud',
    'find_leader','wavelength','millionaire'
  ]::text[];
begin
  if private.daily_challenge_schedule_for_day(v_cutover - 1, 'ufc')
      is distinct from 'play-rotation-v9-millionaire-no-double'
    or private.daily_challenge_schedule_for_day(v_cutover - 1, 'football')
      is distinct from 'football-daily-v11-millionaire-no-double' then
    raise exception 'September 21 Daily schedule identity changed before Sports Feud launch';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing Sports Feud Daily cutover because future Daily content is already materialized';
  end if;

  if exists (
    select 1 from private.daily_challenge_schedule_versions
    where version in (v_ufc_version, v_football_version)
  ) then
    raise exception 'Sports Feud Daily schedule identity already exists';
  end if;

  if coalesce(array_length(v_ufc_cycle, 1), 0) <> 30
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'sports_feud') <> 4
    or 'keep_4_cut_4' = any(v_ufc_cycle) then
    raise exception 'UFC Sports Feud Daily cycle mix is invalid';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 26
    or (select count(*) from unnest(v_football_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'sports_feud') <> 4
    or 'keep_4_cut_4' = any(v_football_cycle)
    or 'blind_resume' = any(v_football_cycle) then
    raise exception 'Football Sports Feud Daily cycle mix is invalid';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
    (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'sports_feud'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'sports_feud' then
    raise exception 'September 22 Sports Feud schedules did not become canonical';
  end if;
end
$schedule$;

notify pgrst, 'reload schema';
