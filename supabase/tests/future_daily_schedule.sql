\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_ufc private.daily_challenge_schedule_versions;
  v_football private.daily_challenge_schedule_versions;
  v_publication jsonb;
  v_player uuid := '7a000000-0000-4000-8000-000000000093';
  v_setup uuid;
  v_daily uuid;
  v_standings jsonb;
  v_entry jsonb;
begin
  select * into v_ufc from private.daily_challenge_schedule_versions where version = 'play-rotation-v7';
  select * into v_football from private.daily_challenge_schedule_versions where version = 'football-daily-v5';

  if v_ufc.version is null or v_ufc.sport <> 'ufc'
    or v_ufc.anchor_day <> date '2026-09-12' or v_ufc.starts_on <> date '2026-09-12'
    or coalesce(array_length(v_ufc.game_cycle, 1), 0) <> 24 then
    raise exception 'UFC future Daily schedule identity is invalid: %', row_to_json(v_ufc);
  end if;
  if (select count(*) from unnest(v_ufc.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'blind_resume') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'keep_4_cut_4') <> 2
    or (select count(*) from unnest(v_ufc.game_cycle) game where game = 'blind_rank_5') <> 0 then
    raise exception 'UFC future Daily mix is not Find 5 / Wavelength 5 / Blind Resume 4 / Hit 4 / Who Am I 4 / Daily Double 2: %', v_ufc.game_cycle;
  end if;

  if v_football.version is null or v_football.sport <> 'football'
    or v_football.anchor_day <> date '2026-09-12' or v_football.starts_on <> date '2026-09-12'
    or coalesce(array_length(v_football.game_cycle, 1), 0) <> 20 then
    raise exception 'Football future Daily schedule identity is invalid: %', row_to_json(v_football);
  end if;
  if (select count(*) from unnest(v_football.game_cycle) game where game = 'find_leader') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'hit_the_number') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'who_am_i') <> 4
    or (select count(*) from unnest(v_football.game_cycle) game where game = 'keep_4_cut_4') <> 2
    or (select count(*) from unnest(v_football.game_cycle) game where game in ('blind_resume', 'blind_rank_5')) <> 0 then
    raise exception 'Football future Daily mix is not Find 5 / Wavelength 5 / Hit 4 / Who Am I 4 / Daily Double 2 with no Blind Resume: %', v_football.game_cycle;
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-09-11', 'ufc') <> 'play-rotation-v6'
    or private.daily_challenge_schedule_for_day(date '2026-09-12', 'ufc') <> 'play-rotation-v7'
    or private.daily_challenge_schedule_for_day(date '2026-09-11', 'football') <> 'football-daily-v3'
    or private.daily_challenge_schedule_for_day(date '2026-09-12', 'football') <> 'football-daily-v5' then
    raise exception 'future Daily schedule starts outside the approved September 12 Central cutover';
  end if;

  if private.daily_challenge_expected_game('play-rotation-v6', date '2026-09-11') <> 'blind_resume'
    or private.daily_challenge_expected_game('football-daily-v3', date '2026-09-07') <> 'blind_resume' then
    raise exception 'historical UFC or Football schedule mapping changed';
  end if;

  if exists (
    select 1 from private.daily_challenges
    where central_day < date '2026-09-12'
      and schedule_version in ('play-rotation-v7', 'football-daily-v4', 'football-daily-v5')
  ) then
    raise exception 'future schedule identity leaked into historical Daily rows';
  end if;

  if private.daily_challenge_expected_game('football-daily-v5', date '2026-09-12') <> 'wavelength'
    or private.daily_challenge_expected_game('football-daily-v5', date '2026-09-13') <> 'hit_the_number'
    or private.daily_challenge_expected_game('football-daily-v3', date '2026-09-11') <> 'find_leader' then
    raise exception 'Football Daily cutover still repeats a game or shifted incorrectly';
  end if;

  v_publication := public.publish_daily_challenge_setup(
    date '2026-09-12', 'football-daily-v1', 'wavelength',
    'slice5-football-cutover', 'slice5-schedule-proof-v1', 'play-official-score-v1',
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, null
  );
  if v_publication->>'schedule_version' <> 'football-daily-v5' then
    raise exception 'canonical Football publisher did not resolve the new active schedule: %', v_publication;
  end if;

  if (
    select count(*) from pg_proc function_row
    join pg_namespace namespace on namespace.oid = function_row.pronamespace
    where namespace.nspname = 'private'
      and function_row.proname = 'daily_challenge_schedule_for_day'
  ) <> 2 then
    raise exception 'a competing Daily schedule resolver was introduced';
  end if;
  if (
    select count(*) from pg_proc function_row
    join pg_namespace namespace on namespace.oid = function_row.pronamespace
    where namespace.nspname = 'private'
      and function_row.proname = 'grade_daily_challenge'
  ) <> 1 then
    raise exception 'a competing Daily grading owner was introduced';
  end if;

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values (
    v_player, '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'stage11-slice5@login.octagon-hq.app', '',
    now(), now(), now(), jsonb_build_object('display_name', 'Stage 11 Slice 5', 'historical_unclaimed', true)
  )
  on conflict (id) do nothing;
  perform public.register_unclaimed_pin_profile(v_player, 'Stage 11 Slice 5', 'S5');

  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values (
    'stage11-slice5-standings-v1', 'America/Chicago',
    date '2035-01-01', date '2035-01-01', array['who_am_i']::text[], 'ufc'
  );

  insert into private.daily_challenge_setups (
    game_type, setup_key, content_version, scoring_version,
    public_setup, reveal_setup, private_setup_evidence, private_grading_evidence
  )
  values (
    'who_am_i', 'stage11-slice5-who-am-i', 'who-am-i-daily-v1', 'play-official-score-v1',
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  )
  returning id into v_setup;

  insert into private.daily_challenges (
    central_day, schedule_version, game_type, setup_id, content_version, scoring_version
  )
  values (
    date '2035-01-01', 'stage11-slice5-standings-v1', 'who_am_i',
    v_setup, 'who-am-i-daily-v1', 'play-official-score-v1'
  )
  returning id into v_daily;

  insert into private.daily_challenge_attempts (
    daily_challenge_id, profile_id, attempt_kind, native_score, normalized_score,
    completed_at, content_version, scoring_version
  )
  values (
    v_daily, v_player, 'official_first', 86, 86, now(),
    'who-am-i-daily-v1', 'play-official-score-v1'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_player::text, true);
  v_standings := public.get_daily_challenge_standings('ufc');
  select entry into v_entry
  from jsonb_array_elements(v_standings->'entries') entry
  where entry->>'profile_id' = v_player::text;

  if v_entry is null or (v_entry->'game_averages'->>'who_am_i')::numeric <> 86.0 then
    raise exception 'Who Am I is missing from the canonical per-game standings projection: %', v_entry;
  end if;
end
$$;

rollback;
\echo 'Stage 11 future Daily schedule + standings proof passed.'
