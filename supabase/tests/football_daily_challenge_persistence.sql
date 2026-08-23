begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_player uuid := '72000000-0000-4000-8000-000000000001';
  v_day date := date '2026-08-22';
  v_ufc_daily uuid;
  v_football_daily uuid;
  v_history jsonb;
  v_streak jsonb;
  v_standings jsonb;
  v_leaderboard jsonb;
  v_entry jsonb;
begin
  if not exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version = 'football-daily-v1'
      and sport = 'football'
      and anchor_day = date '2026-08-22'
      and game_cycle = array[
        'find_leader',
        'blind_resume',
        'wavelength',
        'keep_4_cut_4',
        'hit_the_number'
      ]::text[]
  ) then
    raise exception 'Football canonical schedule identity is missing';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions
    where version <> 'football-daily-v1'
      and sport <> 'ufc'
  ) then
    raise exception 'pre-Football schedules were reclassified away from UFC';
  end if;

  if private.daily_challenge_schedule_for_day(date '2026-08-23', 'football') <> 'football-daily-v1' then
    raise exception 'sport-aware schedule resolver did not return Football';
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version = private.daily_challenge_schedule_for_day(date '2026-08-23')
      and schedule.sport <> 'ufc'
  ) then
    raise exception 'historical one-argument schedule resolver no longer remains UFC-only';
  end if;

  if private.daily_challenge_expected_game('football-daily-v1', date '2026-08-22') <> 'find_leader'
    or private.daily_challenge_expected_game('football-daily-v1', date '2026-08-23') <> 'blind_resume'
    or private.daily_challenge_expected_game('football-daily-v1', date '2026-08-24') <> 'wavelength'
    or private.daily_challenge_expected_game('football-daily-v1', date '2026-08-25') <> 'keep_4_cut_4'
    or private.daily_challenge_expected_game('football-daily-v1', date '2026-08-26') <> 'hit_the_number' then
    raise exception 'Football five-slot schedule is not deterministic';
  end if;

  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  )
  values (
    v_player,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'football-pr3@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'FOOTBALL PR3', 'historical_unclaimed', true)
  )
  on conflict (id) do nothing;

  perform public.register_unclaimed_pin_profile(v_player, 'Football PR3', 'F3');

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  values (
    'test-football-pr3-ufc-v1',
    'America/Chicago',
    v_day,
    v_day + 2000,
    array['find_leader']::text[],
    'ufc'
  )
  on conflict (version) do nothing;

  v_ufc_daily := (public.publish_daily_challenge_setup(
    v_day,
    'test-football-pr3-ufc-v1',
    'find_leader',
    'pr3-ufc-' || v_day::text,
    'pr3-scope-v1',
    'play-official-score-v1',
    jsonb_build_object('question', 'UFC scope proof'),
    jsonb_build_object('leader_id', 'u3'),
    jsonb_build_object('candidate_ids', jsonb_build_array('u1','u2','u3','u4','u5','u6','u7','u8','u9','u10')),
    jsonb_build_object('candidate_ids', jsonb_build_array('u1','u2','u3','u4','u5','u6','u7','u8','u9','u10'), 'leader_id', 'u3'),
    null
  )->>'id')::uuid;

  v_football_daily := (public.publish_daily_challenge_setup(
    v_day,
    'football-daily-v1',
    'find_leader',
    'pr3-football-' || v_day::text,
    'football-find-leader-v1',
    'play-official-score-v1',
    jsonb_build_object('question', 'Football scope proof'),
    jsonb_build_object('leader_id', 'f3'),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10')),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'), 'leader_id', 'f3'),
    null
  )->>'id')::uuid;

  if v_ufc_daily = v_football_daily then
    raise exception 'same-day UFC and Football canonical daily identities collided';
  end if;

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    completed_at,
    content_version,
    scoring_version,
    public_result,
    submission_evidence,
    grading_evidence_snapshot
  )
  values
    (v_ufc_daily, v_player, 'official_first', 8, 80, timestamptz '2026-08-22 17:00:00+00', 'pr3-scope-v1', 'play-official-score-v1', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb),
    (v_football_daily, v_player, 'official_first', 9, 90, timestamptz '2026-08-22 18:00:00+00', 'football-find-leader-v1', 'play-official-score-v1', '{}'::jsonb, '{}'::jsonb, '{}'::jsonb);

  insert into private.daily_challenge_progress (
    daily_challenge_id,
    profile_id,
    revision,
    submission_state,
    public_state
  )
  values
    (v_ufc_daily, v_player, 8, jsonb_build_object('final_submission', jsonb_build_object('eliminated_ids', jsonb_build_array('u1'))), jsonb_build_object('complete', true)),
    (v_football_daily, v_player, 9, jsonb_build_object('action_history', jsonb_build_array(jsonb_build_object('eliminated_id', 'f1')), 'final_submission', jsonb_build_object('eliminated_ids', jsonb_build_array('f1'))), jsonb_build_object('complete', true));

  if (
    select count(*)
    from private.daily_challenge_history
    where profile_id = v_player
      and central_day = v_day
  ) <> 2 then
    raise exception 'same user/date did not preserve independent UFC and Football official records';
  end if;

  if has_table_privilege('authenticated', 'private.daily_challenge_attempts', 'SELECT')
    or has_table_privilege('authenticated', 'private.daily_challenge_progress', 'SELECT') then
    raise exception 'Football persistence weakened the private Daily Challenge RLS boundary';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_player::text, true);

  v_history := public.list_my_daily_challenge_history('football');
  if jsonb_array_length(v_history) <> 1
    or v_history->0->>'schedule_version' <> 'football-daily-v1'
    or (v_history->0->>'normalized_score')::integer <> 90 then
    raise exception 'Football history is not correctly sport-scoped';
  end if;

  v_history := public.list_my_daily_challenge_history('ufc');
  if jsonb_array_length(v_history) <> 1
    or v_history->0->>'schedule_version' <> 'test-football-pr3-ufc-v1'
    or (v_history->0->>'normalized_score')::integer <> 80 then
    raise exception 'UFC history was contaminated by Football';
  end if;

  if public.list_my_daily_challenge_history() <> v_history then
    raise exception 'legacy zero-argument UFC history compatibility changed';
  end if;

  v_streak := public.get_my_daily_challenge_streak('football');
  if (v_streak->>'best_streak')::integer <> 1 then
    raise exception 'Football streak did not use Football-only history';
  end if;

  v_streak := public.get_my_daily_challenge_streak('ufc');
  if (v_streak->>'best_streak')::integer <> 1 then
    raise exception 'UFC streak was contaminated by Football history';
  end if;

  v_leaderboard := public.get_daily_challenge_leaderboard(v_day, 'football-daily-v1', 'football');
  if v_leaderboard->>'unlocked' <> 'true'
    or (v_leaderboard->>'player_count')::integer <> 1
    or v_leaderboard->'entries'->0->>'profile_id' <> v_player::text then
    raise exception 'Football daily leaderboard is not correctly sport-scoped';
  end if;

  begin
    perform public.get_daily_challenge_leaderboard(v_day, 'football-daily-v1', 'ufc');
    raise exception 'cross-sport leaderboard schedule unexpectedly succeeded';
  exception
    when others then
      if sqlerrm not like 'daily leaderboard schedule does not belong to sport %' then
        raise;
      end if;
  end;

  v_standings := public.get_daily_challenge_standings('football');
  select entry into v_entry
  from jsonb_array_elements(v_standings->'entries') entry
  where entry->>'profile_id' = v_player::text;
  if v_entry is null
    or (v_entry->>'played')::integer <> 1
    or (v_entry->>'average_score')::numeric <> 90 then
    raise exception 'Football standings are not correctly sport-scoped';
  end if;

  v_standings := public.get_daily_challenge_standings('ufc');
  select entry into v_entry
  from jsonb_array_elements(v_standings->'entries') entry
  where entry->>'profile_id' = v_player::text;
  if v_entry is null
    or (v_entry->>'played')::integer <> 1
    or (v_entry->>'average_score')::numeric <> 80 then
    raise exception 'UFC standings were contaminated by Football';
  end if;

  if exists (
    select 1
    from public.list_my_find_leader_history() history
    where history.day = v_day
      and history.official_score = 9
  ) then
    raise exception 'legacy UFC Find the Leader history leaked Football results';
  end if;
end
$$;

rollback;
