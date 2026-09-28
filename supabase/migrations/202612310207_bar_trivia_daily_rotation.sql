-- Launch Bar Trivia as an official UFC + Football Daily on September 29, 2026.
-- Preserve all historical Daily identities/results and keep the post-9/27 two-game
-- standard intact for Find the Leader, Wavelength, and Hit the Number.
--
-- Locked weights:
--   Football (22): Feud 4 / Millionaire 4 / Bar Trivia 3 /
--                  Wavelength 3 / Who Am I 3 / Find the Leader 3 / Hit the Number 2
--   UFC (24):      Football mix + Blind Resume 2
--
-- Both sports intentionally debut Bar Trivia on 9/29. The stagger below has no other
-- collision in the first 60 days and only two additional Bar Trivia collisions across
-- the full 264-day least-common-multiple window; no other game type collides.

alter table private.daily_challenge_setups
  drop constraint if exists daily_challenge_setups_supported_games_check;
alter table private.daily_challenge_setups
  add constraint daily_challenge_setups_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia'
  ));

alter table private.daily_challenges
  drop constraint if exists daily_challenges_supported_games_check;
alter table private.daily_challenges
  add constraint daily_challenges_supported_games_check
  check (game_type in (
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia'
  ));

alter table private.daily_challenge_schedule_versions
  drop constraint if exists daily_challenge_schedule_versions_supported_games_check;
alter table private.daily_challenge_schedule_versions
  add constraint daily_challenge_schedule_versions_supported_games_check
  check (game_cycle <@ array[
    'find_leader', 'blind_resume', 'wavelength', 'blind_rank_5',
    'keep_4_cut_4', 'hit_the_number', 'who_am_i', 'millionaire',
    'sports_feud', 'bar_trivia'
  ]::text[]);

create or replace function private.grade_bar_trivia_daily(
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
  v_correct integer;
  v_best_streak integer;
  v_wager integer;
  v_double_round text;
  v_max_score integer;
begin
  if jsonb_typeof(p_submission) <> 'object'
    or jsonb_typeof(p_grading_evidence) <> 'object' then
    raise exception 'Bar Trivia submission and grading evidence must be objects';
  end if;

  v_proof := nullif(p_grading_evidence->>'proof', '');
  if v_proof is null or p_submission->>'proof' is distinct from v_proof then
    raise exception 'Bar Trivia server proof is invalid';
  end if;

  if coalesce(p_submission->>'native_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'normalized_score', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'correct_count', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'best_streak', '') !~ '^[0-9]+$'
    or coalesce(p_submission->>'wager', '') !~ '^[0-9]+$'
    or coalesce(p_grading_evidence->>'max_score', '') !~ '^[0-9]+$' then
    raise exception 'Bar Trivia scoring fields are invalid';
  end if;

  v_native := (p_submission->>'native_score')::integer;
  v_normalized := (p_submission->>'normalized_score')::integer;
  v_correct := (p_submission->>'correct_count')::integer;
  v_best_streak := (p_submission->>'best_streak')::integer;
  v_wager := (p_submission->>'wager')::integer;
  v_double_round := p_submission->>'double_round';
  v_max_score := (p_grading_evidence->>'max_score')::integer;

  if v_max_score <> 100
    or v_native < 0 or v_native > 100
    or v_normalized < 0 or v_normalized > 100
    or v_normalized <> v_native
    or v_correct < 0 or v_correct > 10
    or v_best_streak < 0 or v_best_streak > 10
    or v_wager < 0 or v_wager > 10
    or v_double_round not in ('round1', 'round2', 'round3') then
    raise exception 'Bar Trivia terminal score is invalid';
  end if;

  native_score := v_native;
  normalized_score := v_normalized;
  public_result := jsonb_build_object(
    'score', v_normalized,
    'correct_count', v_correct,
    'best_streak', v_best_streak,
    'double_round', v_double_round,
    'wager', v_wager
  );
  return next;
end;
$$;

revoke all on function private.grade_bar_trivia_daily(jsonb, jsonb)
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
  elsif p_game_type = 'bar_trivia' then
    select grade.native_score, grade.normalized_score, grade.public_result
    into native_score, normalized_score, public_result
    from private.grade_bar_trivia_daily(p_submission, p_grading_evidence) grade;
  else
    raise exception 'unsupported daily game type %', p_game_type;
  end if;
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;

  if position('p_game_type = ''bar_trivia''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily grader terminal branch changed before Bar Trivia integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('p_game_type = ''bar_trivia''' in v_definition) = 0
    or position('grade_bar_trivia_daily' in v_definition) = 0 then
    raise exception 'Bar Trivia Daily grader patch did not apply exactly';
  end if;
end
$grader$;

do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_marker constant text := $old$
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1),
        'sports_feud', round((avg(history.normalized_score) filter (where history.game_type = 'sports_feud'))::numeric, 1)
      ) as game_averages,
$old$;
  v_replacement constant text := $new$
        'millionaire', round((avg(history.normalized_score) filter (where history.game_type = 'millionaire'))::numeric, 1),
        'sports_feud', round((avg(history.normalized_score) filter (where history.game_type = 'sports_feud'))::numeric, 1),
        'bar_trivia', round((avg(history.normalized_score) filter (where history.game_type = 'bar_trivia'))::numeric, 1)
      ) as game_averages,
$new$;
begin
  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''bar_trivia''' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'canonical Daily standings game-average projection changed before Bar Trivia integration';
    end if;
    execute replace(v_definition, v_marker, v_replacement);
  end if;

  select pg_get_functiondef(v_signature::oid) into v_definition;
  if position('''bar_trivia''' in v_definition) = 0 then
    raise exception 'Bar Trivia Daily standings patch did not apply exactly';
  end if;
end
$standings$;

do $schedule$
declare
  v_cutover constant date := date '2026-09-29';
  v_ufc_version constant text := 'play-rotation-v17-bar-trivia-sep29';
  v_football_version constant text := 'football-daily-v17-bar-trivia-sep29';

  v_football_cycle constant text[] := array[
    'bar_trivia',
    'wavelength',
    'sports_feud',
    'who_am_i',
    'millionaire',
    'find_leader',
    'bar_trivia',
    'hit_the_number',
    'sports_feud',
    'wavelength',
    'millionaire',
    'who_am_i',
    'sports_feud',
    'find_leader',
    'bar_trivia',
    'hit_the_number',
    'millionaire',
    'wavelength',
    'sports_feud',
    'who_am_i',
    'millionaire',
    'find_leader'
  ]::text[];

  v_ufc_cycle constant text[] := array[
    'bar_trivia',
    'sports_feud',
    'wavelength',
    'millionaire',
    'who_am_i',
    'blind_resume',
    'find_leader',
    'sports_feud',
    'hit_the_number',
    'bar_trivia',
    'wavelength',
    'millionaire',
    'who_am_i',
    'sports_feud',
    'find_leader',
    'blind_resume',
    'hit_the_number',
    'millionaire',
    'wavelength',
    'sports_feud',
    'who_am_i',
    'bar_trivia',
    'find_leader',
    'millionaire'
  ]::text[];

  v_collisions integer;
  v_first_60_collisions integer;
begin
  if private.daily_challenge_schedule_for_day(v_cutover - 1, 'ufc')
      is distinct from 'play-rotation-v16-weighted-sep27'
    or private.daily_challenge_schedule_for_day(v_cutover - 1, 'football')
      is distinct from 'football-daily-v16-weighted-sep25' then
    raise exception 'September 28 Daily schedule identity changed before Bar Trivia cutover';
  end if;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = daily.schedule_version
    where daily.central_day >= v_cutover
      and schedule.sport in ('ufc', 'football')
  ) then
    raise exception 'refusing Bar Trivia Daily cutover because future Daily content is already materialized';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version in (v_ufc_version, v_football_version)
  ) then
    raise exception 'Bar Trivia Daily schedule identity already exists';
  end if;

  if coalesce(array_length(v_football_cycle, 1), 0) <> 22
    or (select count(*) from unnest(v_football_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_football_cycle) game where game = 'bar_trivia') <> 3
    or (select count(*) from unnest(v_football_cycle) game where game = 'wavelength') <> 3
    or (select count(*) from unnest(v_football_cycle) game where game = 'who_am_i') <> 3
    or (select count(*) from unnest(v_football_cycle) game where game = 'find_leader') <> 3
    or (select count(*) from unnest(v_football_cycle) game where game = 'hit_the_number') <> 2
    or 'blind_resume' = any(v_football_cycle)
    or 'keep_4_cut_4' = any(v_football_cycle)
    or 'blind_rank_5' = any(v_football_cycle) then
    raise exception 'locked Football Daily weighted cycle is invalid';
  end if;

  if coalesce(array_length(v_ufc_cycle, 1), 0) <> 24
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'sports_feud') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'millionaire') <> 4
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'bar_trivia') <> 3
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'wavelength') <> 3
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'who_am_i') <> 3
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'find_leader') <> 3
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'hit_the_number') <> 2
    or (select count(*) from unnest(v_ufc_cycle) game where game = 'blind_resume') <> 2
    or 'keep_4_cut_4' = any(v_ufc_cycle)
    or 'blind_rank_5' = any(v_ufc_cycle) then
    raise exception 'locked UFC Daily weighted cycle is invalid';
  end if;

  select count(*)
  into v_collisions
  from generate_series(0, 263) as series(offset_days)
  where v_football_cycle[(offset_days % 22) + 1]
    = v_ufc_cycle[(offset_days % 24) + 1];

  if v_collisions <> 3
    or exists (
      select 1
      from generate_series(0, 263) as series(offset_days)
      where v_football_cycle[(offset_days % 22) + 1]
        = v_ufc_cycle[(offset_days % 24) + 1]
        and v_football_cycle[(offset_days % 22) + 1] <> 'bar_trivia'
    ) then
    raise exception 'cross-sport Daily stagger is not the locked minimum-collision plan';
  end if;

  select count(*)
  into v_first_60_collisions
  from generate_series(0, 59) as series(offset_days)
  where v_football_cycle[(offset_days % 22) + 1]
    = v_ufc_cycle[(offset_days % 24) + 1];

  if v_first_60_collisions <> 1
    or v_football_cycle[1] <> 'bar_trivia'
    or v_ufc_cycle[1] <> 'bar_trivia' then
    raise exception 'September 29 must be the only cross-sport collision in the first 60 days';
  end if;

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values
    (v_ufc_version, 'America/Chicago', v_cutover, v_cutover, v_ufc_cycle, 'ufc'),
    (v_football_version, 'America/Chicago', v_cutover, v_cutover, v_football_cycle, 'football');

  if private.daily_challenge_schedule_for_day(v_cutover, 'ufc') is distinct from v_ufc_version
    or private.daily_challenge_expected_game(v_ufc_version, v_cutover) is distinct from 'bar_trivia'
    or private.daily_challenge_schedule_for_day(v_cutover, 'football') is distinct from v_football_version
    or private.daily_challenge_expected_game(v_football_version, v_cutover) is distinct from 'bar_trivia' then
    raise exception 'September 29 Bar Trivia schedules did not become canonical';
  end if;
end
$schedule$;

notify pgrst, 'reload schema';
