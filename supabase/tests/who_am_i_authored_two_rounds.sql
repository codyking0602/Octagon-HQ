begin;

do $$
declare
  v_grade record;
  v_evidence constant jsonb := '{
    "format_version":"who-am-i-two-round-v1",
    "rounds":[
      {
        "subject_ids":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d","nfl-e"],
        "hidden_subject_id":"nfl-hidden",
        "league":"NFL",
        "clue_limit":10,
        "clues_per_reveal":2
      },
      {
        "subject_ids":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d","cfb-e"],
        "hidden_subject_id":"cfb-hidden",
        "league":"CFB",
        "clue_limit":10,
        "clues_per_reveal":2
      }
    ]
  }'::jsonb;
begin
  select * into v_grade
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "outcome":"natural",
          "revealed_count":2,
          "natural_guesses":["nfl-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        },
        {
          "outcome":"natural",
          "revealed_count":6,
          "natural_guesses":["cfb-a","cfb-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        }
      ]
    }'::jsonb,
    v_evidence
  );

  if v_grade.native_score <> 90 or v_grade.normalized_score <> 90 then
    raise exception 'two-round Who Am I must average 100 and 80 to 90, got %', row_to_json(v_grade);
  end if;
  if v_grade.grading_snapshot is distinct from v_evidence then
    raise exception 'two-round Who Am I must preserve its grading snapshot, got %', row_to_json(v_grade);
  end if;
  if jsonb_array_length(v_grade.public_result->'rounds') <> 2
    or (v_grade.public_result->'rounds'->0->>'score')::integer <> 100
    or (v_grade.public_result->'rounds'->1->>'score')::integer <> 80
    or v_grade.public_result->'rounds'->0->>'league' <> 'NFL'
    or v_grade.public_result->'rounds'->1->>'league' <> 'CFB' then
    raise exception 'two-round Who Am I public result lost component scores or leagues: %', v_grade.public_result;
  end if;
end
$$;

do $$
declare
  v_grade record;
begin
  select * into v_grade
  from private.grade_daily_challenge(
    'who_am_i',
    'play-official-score-v1',
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "outcome":"recovered",
          "revealed_count":10,
          "natural_guesses":[],
          "recovery_choices":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d"],
          "recovery_guesses":["nfl-hidden"]
        },
        {
          "outcome":"recovered",
          "revealed_count":10,
          "natural_guesses":[],
          "recovery_choices":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d"],
          "recovery_guesses":["cfb-a","cfb-hidden"]
        }
      ]
    }'::jsonb,
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "subject_ids":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d","nfl-e"],
          "hidden_subject_id":"nfl-hidden",
          "league":"NFL",
          "clue_limit":10,
          "clues_per_reveal":2
        },
        {
          "subject_ids":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d","cfb-e"],
          "hidden_subject_id":"cfb-hidden",
          "league":"CFB",
          "clue_limit":10,
          "clues_per_reveal":2
        }
      ]
    }'::jsonb
  );

  if v_grade.normalized_score <> 38 then
    raise exception 'two-round Who Am I must round the 45 and 30 average to 38, got %', row_to_json(v_grade);
  end if;
end
$$;

do $$
declare
  v_rejected boolean := false;
begin
  begin
    perform *
    from private.grade_daily_challenge(
      'who_am_i',
      'play-official-score-v1',
      '{"format_version":"who-am-i-two-round-v1","rounds":[]}'::jsonb,
      '{"format_version":"who-am-i-two-round-v1","rounds":[]}'::jsonb
    );
  exception when others then
    v_rejected := position('exactly two rounds' in lower(sqlerrm)) > 0;
  end;
  if not v_rejected then
    raise exception 'two-round Who Am I grader must reject a malformed round count';
  end if;
end
$$;


do $$
declare
  v_user constant uuid := '72000000-0000-4000-8000-000000000001';
  v_today date := private.daily_challenge_central_day(now());
  v_schedule constant text := 'test-who-am-i-two-round-submit-v1';
  v_setup uuid;
  v_daily uuid;
  v_result jsonb;
  v_evidence constant jsonb := '{
    "format_version":"who-am-i-two-round-v1",
    "rounds":[
      {
        "subject_ids":["nfl-hidden","nfl-a","nfl-b","nfl-c","nfl-d","nfl-e"],
        "hidden_subject_id":"nfl-hidden",
        "league":"NFL",
        "clue_limit":10,
        "clues_per_reveal":2
      },
      {
        "subject_ids":["cfb-hidden","cfb-a","cfb-b","cfb-c","cfb-d","cfb-e"],
        "hidden_subject_id":"cfb-hidden",
        "league":"CFB",
        "clue_limit":10,
        "clues_per_reveal":2
      }
    ]
  }'::jsonb;
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);

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
    v_user,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'who-am-i-two-round-submit@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'WAI TEST', 'historical_unclaimed', true)
  )
  on conflict (id) do nothing;

  perform public.register_unclaimed_pin_profile(v_user, 'WAI Test', 'WT');

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle,
    sport
  )
  values (
    v_schedule,
    'America/Chicago',
    v_today,
    v_today + 5000,
    array['who_am_i']::text[],
    'ufc'
  )
  on conflict (version) do nothing;

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
    'who_am_i',
    'test-who-am-i-two-round-submit:' || v_today::text,
    'who-am-i-authored-daily-v1',
    'play-official-score-v1',
    '{"format_version":"who-am-i-two-round-v1","round_count":2}'::jsonb,
    '{"format_version":"who-am-i-two-round-v1","rounds":[]}'::jsonb,
    v_evidence,
    v_evidence
  )
  returning id into v_setup;

  insert into private.daily_challenges (
    central_day,
    schedule_version,
    game_type,
    setup_id,
    content_version,
    scoring_version,
    fallback_reason,
    published_at
  )
  values (
    v_today,
    v_schedule,
    'who_am_i',
    v_setup,
    'who-am-i-authored-daily-v1',
    'play-official-score-v1',
    null,
    now()
  )
  returning id into v_daily;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_user::text, true);

  v_result := public.submit_my_daily_challenge_attempt(
    v_daily,
    '{
      "format_version":"who-am-i-two-round-v1",
      "rounds":[
        {
          "outcome":"natural",
          "revealed_count":2,
          "natural_guesses":["nfl-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        },
        {
          "outcome":"natural",
          "revealed_count":6,
          "natural_guesses":["cfb-a","cfb-hidden"],
          "recovery_choices":[],
          "recovery_guesses":[]
        }
      ]
    }'::jsonb
  );

  if v_result->>'attempt_kind' <> 'official_first'
    or (v_result->>'normalized_score')::integer <> 90 then
    raise exception 'two-round Who Am I official submit did not persist the expected result: %', v_result;
  end if;

  if not exists (
    select 1
    from private.daily_challenge_attempts attempt
    where attempt.daily_challenge_id = v_daily
      and attempt.profile_id = v_user
      and attempt.attempt_kind = 'official_first'
      and attempt.normalized_score = 90
      and attempt.grading_evidence_snapshot = v_evidence
  ) then
    raise exception 'two-round Who Am I official submit lost its non-null grading snapshot';
  end if;
end
$$;

rollback;
