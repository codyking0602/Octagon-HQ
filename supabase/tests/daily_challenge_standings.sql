begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_cody uuid := '76000000-0000-4000-8000-000000000001';
  v_shane uuid := '76000000-0000-4000-8000-000000000002';
  v_tony uuid := '76000000-0000-4000-8000-000000000003';
  v_today date := private.daily_challenge_central_day(now());
  v_week_start date := v_today - (extract(isodow from v_today)::integer - 1);
  v_week_end date := v_today - (extract(isodow from v_today)::integer - 1) + 6;
  v_games text[] := array[
    'find_leader',
    'wavelength',
    'blind_resume',
    'blind_rank_5',
    'keep_4_cut_4'
  ]::text[];
  v_daily_ids uuid[] := array[]::uuid[];
  v_index integer;
  v_setup_id uuid;
  v_daily_id uuid;
  v_standings jsonb;
  v_cody_row jsonb;
  v_shane_row jsonb;
  v_tony_row jsonb;
  v_cody_week jsonb;
begin
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
  values
    (v_cody, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'standings-cody@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'Cody', 'historical_unclaimed', true)),
    (v_shane, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'standings-shane@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'Shane', 'historical_unclaimed', true)),
    (v_tony, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'standings-tony@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'Tony', 'historical_unclaimed', true));

  perform public.register_unclaimed_pin_profile(v_cody, 'Cody', 'CK');
  perform public.register_unclaimed_pin_profile(v_shane, 'Shane', 'SH');
  perform public.register_unclaimed_pin_profile(v_tony, 'Tony', 'TS');

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  ) values (
    'daily-standings-test-v1',
    'America/Chicago',
    v_today - 4,
    v_today - 4,
    v_games
  );

  for v_index in 1..5 loop
    insert into private.daily_challenge_setups (
      game_type,
      setup_key,
      content_version,
      scoring_version,
      public_setup,
      reveal_setup,
      private_setup_evidence,
      private_grading_evidence
    ) values (
      v_games[v_index],
      'standings-' || v_index::text,
      'standings-content-v1',
      'play-official-score-v1',
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    ) returning id into v_setup_id;

    insert into private.daily_challenges (
      central_day,
      schedule_version,
      game_type,
      setup_id,
      content_version,
      scoring_version
    ) values (
      v_today - (5 - v_index),
      'daily-standings-test-v1',
      v_games[v_index],
      v_setup_id,
      'standings-content-v1',
      'play-official-score-v1'
    ) returning id into v_daily_id;

    v_daily_ids := array_append(v_daily_ids, v_daily_id);
  end loop;

  insert into private.daily_challenge_attempts (
    daily_challenge_id,
    profile_id,
    attempt_kind,
    native_score,
    normalized_score,
    completed_at,
    content_version,
    scoring_version
  ) values
    (v_daily_ids[1], v_cody, 'official_first', 8, 80, now() - interval '4 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[2], v_cody, 'official_first', 90, 90, now() - interval '3 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[3], v_cody, 'official_first', 5, 100, now() - interval '2 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[4], v_cody, 'official_first', 8, 80, now() - interval '1 day', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[5], v_cody, 'official_first', 14, 90, now(), 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[1], v_shane, 'official_first', 9, 90, now() - interval '4 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[2], v_shane, 'official_first', 90, 90, now() - interval '3 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[3], v_shane, 'official_first', 4, 80, now() - interval '2 days', 'standings-content-v1', 'play-official-score-v1'),
    (v_daily_ids[4], v_shane, 'official_first', 7, 70, now() - interval '1 day', 'standings-content-v1', 'play-official-score-v1');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_cody::text, true);

  v_standings := public.get_daily_challenge_standings();
  v_cody_row := v_standings->'entries'->0;
  v_shane_row := v_standings->'entries'->1;
  v_tony_row := v_standings->'entries'->2;

  select entry.value
  into v_cody_week
  from jsonb_array_elements(v_standings->'weekly_entries') entry(value)
  where entry.value->>'profile_id' = v_cody::text;

  if (v_standings->>'player_count')::integer <> 3
    or (v_standings->>'current_user_rank')::integer <> 1
    or (v_standings->>'current_user_wins')::integer <> 4 then
    raise exception 'standing summary did not return the complete ranked member set';
  end if;

  if v_cody_row->>'display_name' <> 'CODY'
    or (v_cody_row->>'rank')::integer <> 1
    or (v_cody_row->>'wins')::integer <> 4
    or (v_cody_row->>'played')::integer <> 5
    or (v_cody_row->>'average_score')::numeric <> 88.0
    or (v_cody_row->>'weekly_titles')::integer < 0
    or (v_cody_row->>'championship_rank')::integer < 1
    or (v_cody_row->>'current_streak')::integer <> 5
    or (v_cody_row->>'best_streak')::integer <> 5
    or (v_cody_row->'game_averages'->>'find_leader')::numeric <> 80.0
    or (v_cody_row->'game_averages'->>'wavelength')::numeric <> 90.0
    or (v_cody_row->'game_averages'->>'blind_resume')::numeric <> 100.0
    or (v_cody_row->'game_averages'->>'blind_rank_5')::numeric <> 80.0
    or (v_cody_row->'game_averages'->>'keep_4_cut_4')::numeric <> 90.0 then
    raise exception 'current member standings or game averages are incorrect: %', v_cody_row;
  end if;

  if v_shane_row->>'display_name' <> 'SHANE'
    or (v_shane_row->>'rank')::integer <> 2
    or (v_shane_row->>'wins')::integer <> 2
    or (v_shane_row->>'played')::integer <> 4
    or (v_shane_row->>'average_score')::numeric <> 82.5
    or (v_shane_row->>'current_streak')::integer <> 4
    or (v_shane_row->>'best_streak')::integer <> 4 then
    raise exception 'tied daily wins or yesterday-current streak were calculated incorrectly';
  end if;

  if v_tony_row->>'display_name' <> 'TONY'
    or (v_tony_row->>'rank')::integer <> 3
    or (v_tony_row->>'wins')::integer <> 0
    or (v_tony_row->>'played')::integer <> 0
    or (v_tony_row->>'average_score')::numeric <> 0
    or (v_tony_row->>'current_streak')::integer <> 0
    or (v_tony_row->>'best_streak')::integer <> 0 then
    raise exception 'members without an official play were omitted or misrepresented';
  end if;

  if (v_standings->>'week_start')::date <> v_week_start
    or (v_standings->>'week_end')::date <> v_week_end
    or (v_standings->>'current_user_week_rank')::integer <> 1
    or (v_standings->>'current_user_week_wins')::integer <> (v_cody_week->>'wins')::integer
    or (v_standings->>'current_user_weekly_titles')::integer < 0
    or (v_standings->>'current_user_championship_rank')::integer < 1
    or v_cody_week is null
    or (v_cody_week->>'rank')::integer <> 1
    or (v_cody_week->>'wins')::integer < 1
    or (v_cody_week->>'played')::integer < 1
    or (v_cody_week->>'average_score')::numeric <= 0 then
    raise exception 'Monday-Sunday current weekly standings were calculated incorrectly: %', v_standings;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_standings->'weekly_entries') entry(value)
    where entry.value->>'profile_id' = v_tony::text
  ) then
    raise exception 'zero-play members appeared in the active weekly competition';
  end if;

  if (v_standings->'last_completed_week'->>'week_start')::date <> v_week_start - 7
    or (v_standings->'last_completed_week'->>'week_end')::date <> v_week_start - 1
    or jsonb_typeof(v_standings->'last_completed_week'->'champions') <> 'array' then
    raise exception 'last completed weekly championship window is incorrect';
  end if;

  if has_function_privilege('anon', 'public.get_daily_challenge_standings()', 'EXECUTE') then
    raise exception 'anonymous role can read Daily Challenge Standings';
  end if;
end
$$;

rollback;