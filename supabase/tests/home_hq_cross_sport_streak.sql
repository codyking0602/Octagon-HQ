begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_player uuid := '79000000-0000-4000-8000-000000000095';
  v_today date := private.daily_challenge_central_day(now());
  v_setup uuid;
  v_daily uuid;
  v_day date;
  v_sport text;
  v_schedule text;
  v_streak jsonb;
  v_offset integer;
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
  values (
    v_player,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'home-hq-streak@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'HOME HQ STREAK', 'historical_unclaimed', true)
  )
  on conflict (id) do nothing;

  perform public.register_unclaimed_pin_profile(v_player, 'Home HQ Streak', 'HQ');

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  values
    ('test-home-hq-streak-ufc-v1', 'America/Chicago', v_today - 10, v_today + 2000, array['find_leader']::text[], 'ufc'),
    ('test-home-hq-streak-football-v1', 'America/Chicago', v_today - 10, v_today + 2000, array['find_leader']::text[], 'football')
  on conflict (version) do nothing;

  for v_offset in reverse 3..0 loop
    v_day := v_today - v_offset;
    if mod(v_offset, 2) = 0 then
      v_sport := 'football';
      v_schedule := 'test-home-hq-streak-football-v1';
    else
      v_sport := 'ufc';
      v_schedule := 'test-home-hq-streak-ufc-v1';
    end if;

    insert into private.daily_challenge_setups (
      game_type,
      setup_key,
      content_version,
      scoring_version,
      public_setup,
      reveal_setup,
      private_setup_evidence,
      private_grading_evidence
    )
    values (
      'find_leader',
      'home-hq-streak-' || v_sport || '-' || v_day::text,
      'home-hq-streak-v1',
      'play-official-score-v1',
      jsonb_build_object('question', 'HQ streak proof'),
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    )
    returning id into v_setup;

    insert into private.daily_challenges (
      central_day,
      schedule_version,
      game_type,
      setup_id,
      content_version,
      scoring_version
    )
    values (
      v_day,
      v_schedule,
      'find_leader',
      v_setup,
      'home-hq-streak-v1',
      'play-official-score-v1'
    )
    returning id into v_daily;

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
    values (
      v_daily,
      v_player,
      'official_first',
      8,
      80,
      now() - make_interval(days => v_offset),
      'home-hq-streak-v1',
      'play-official-score-v1',
      '{}'::jsonb,
      '{}'::jsonb,
      '{}'::jsonb
    );
  end loop;

  -- A second sport completed today must not add a second streak day.
  insert into private.daily_challenge_setups (
    game_type,
    setup_key,
    content_version,
    scoring_version,
    public_setup,
    reveal_setup,
    private_setup_evidence,
    private_grading_evidence
  )
  values (
    'find_leader',
    'home-hq-streak-ufc-duplicate-' || v_today::text,
    'home-hq-streak-v1',
    'play-official-score-v1',
    jsonb_build_object('question', 'HQ duplicate-day proof'),
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  )
  returning id into v_setup;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version
  )
  values (
    v_today,
    'test-home-hq-streak-ufc-v1',
    'find_leader',
    v_setup,
    'home-hq-streak-v1',
    'play-official-score-v1'
  )
  returning id into v_daily;

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
  values (
    v_daily,
    v_player,
    'official_first',
    9,
    90,
    now(),
    'home-hq-streak-v1',
    'play-official-score-v1',
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_player::text, true);

  v_streak := public.get_my_hq_daily_challenge_streak();
  if (v_streak->>'current_streak')::integer <> 4
    or (v_streak->>'best_streak')::integer <> 4 then
    raise exception 'HQ streak did not count one completed UFC-or-Football day exactly once: %', v_streak;
  end if;

  if has_function_privilege('anon', 'public.get_my_hq_daily_challenge_streak()', 'EXECUTE') then
    raise exception 'anonymous role can read the HQ Daily Challenge streak';
  end if;
end
$$;

rollback;
