begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_cody uuid := '71000000-0000-4000-8000-000000000001';
  v_shane uuid := '71000000-0000-4000-8000-000000000002';
  v_tony uuid := '71000000-0000-4000-8000-000000000003';
  v_today date := private.daily_challenge_central_day(now());
  v_ftl uuid;
  v_resume uuid;
  v_wavelength uuid;
  v_rank uuid;
  v_keep uuid;
  v_first jsonb;
  v_replay jsonb;
  v_public jsonb;
  v_board jsonb;
  v_history jsonb;
  v_streak jsonb;
  v_row public.find_leader_history;
begin
  if private.daily_challenge_central_day(timestamptz '2026-03-08 05:59:59+00') <> date '2026-03-07'
    or private.daily_challenge_central_day(timestamptz '2026-03-08 06:00:00+00') <> date '2026-03-08'
    or private.daily_challenge_central_day(timestamptz '2026-11-01 04:59:59+00') <> date '2026-10-31'
    or private.daily_challenge_central_day(timestamptz '2026-11-01 05:00:00+00') <> date '2026-11-01'
    or private.daily_challenge_central_day(timestamptz '2026-11-01 06:30:00+00') <> date '2026-11-01'
    or private.daily_challenge_central_day(timestamptz '2026-11-01 07:30:00+00') <> date '2026-11-01' then
    raise exception 'Central-time day boundary failed across daylight-saving transitions';
  end if;

  if private.daily_challenge_expected_game('find-leader-v1', v_today) <> 'find_leader'
    or private.daily_challenge_expected_game('find-leader-v1', v_today + 1) <> 'find_leader' then
    raise exception 'Find the Leader-only schedule is not deterministic';
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
  values
    (v_cody, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daily-cody@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'DAILY CODY', 'historical_unclaimed', true)),
    (v_shane, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daily-shane@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'DAILY SHANE', 'historical_unclaimed', true)),
    (v_tony, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'daily-tony@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'DAILY TONY', 'historical_unclaimed', true))
  on conflict (id) do nothing;

  perform public.register_unclaimed_pin_profile(v_cody, 'Daily Cody', 'DC');
  perform public.register_unclaimed_pin_profile(v_shane, 'Daily Shane', 'DS');
  perform public.register_unclaimed_pin_profile(v_tony, 'Daily Tony', 'DT');

  insert into private.daily_challenge_schedule_versions (
    version,
    time_zone,
    anchor_day,
    starts_on,
    game_cycle
  )
  values
    ('test-blind-resume-v1', 'America/Chicago', v_today, v_today + 1000, array['blind_resume']::text[]),
    ('test-wavelength-v1', 'America/Chicago', v_today, v_today + 1001, array['wavelength']::text[]),
    ('test-blind-rank-v1', 'America/Chicago', v_today, v_today + 1002, array['blind_rank_5']::text[]),
    ('test-keep-cut-v1', 'America/Chicago', v_today, v_today + 1003, array['keep_4_cut_4']::text[])
  on conflict (version) do nothing;

  v_ftl := (public.publish_daily_challenge_setup(
    v_today,
    'find-leader-v1',
    'find_leader',
    'ftl-' || v_today::text,
    'find-leader-v2-20260724',
    'play-official-score-v1',
    jsonb_build_object('question', 'Who is the leader?', 'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10')),
    jsonb_build_object('leader_id', 'f3'),
    jsonb_build_object('definition_id', 'wins'),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'), 'leader_id', 'f3'),
    null
  )->>'id')::uuid;

  if v_ftl is distinct from (public.publish_daily_challenge_setup(
    v_today,
    'find-leader-v1',
    'find_leader',
    'ftl-' || v_today::text,
    'find-leader-v2-20260724',
    'play-official-score-v1',
    jsonb_build_object('question', 'Who is the leader?', 'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10')),
    jsonb_build_object('leader_id', 'f3'),
    jsonb_build_object('definition_id', 'wins'),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'), 'leader_id', 'f3'),
    null
  )->>'id')::uuid then
    raise exception 'idempotent publication did not return the same exact daily identity';
  end if;

  begin
    perform public.publish_daily_challenge_setup(
      v_today,
      'find-leader-v1',
      'find_leader',
      'ftl-' || v_today::text,
      'find-leader-v2-20260724',
      'play-official-score-v1',
      jsonb_build_object('question', 'MUTATED'),
      jsonb_build_object('leader_id', 'f3'),
      jsonb_build_object('definition_id', 'wins'),
      jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'), 'leader_id', 'f3'),
      null
    );
    raise exception 'conflicting setup publication unexpectedly succeeded';
  exception
    when others then
      if sqlerrm = 'conflicting setup publication unexpectedly succeeded' then
        raise;
      end if;
  end;

  v_resume := (public.publish_daily_challenge_setup(
    v_today,
    'test-blind-resume-v1',
    'blind_resume',
    'resume-' || v_today::text,
    'blind-resume-content-v1',
    'play-official-score-v1',
    jsonb_build_object('rounds', 5),
    jsonb_build_object('correct_choices', jsonb_build_array('L','R','L','R','L')),
    '{}'::jsonb,
    jsonb_build_object('correct_choices', jsonb_build_array('L','R','L','R','L')),
    null
  )->>'id')::uuid;

  v_wavelength := (public.publish_daily_challenge_setup(
    v_today,
    'test-wavelength-v1',
    'wavelength',
    'wavelength-' || v_today::text,
    'wavelength-catalog-v1',
    'play-official-score-v1',
    jsonb_build_object('first_clue', 'public clue'),
    jsonb_build_object('target', 67),
    jsonb_build_object('catalog_version', 'wavelength-catalog-v1'),
    jsonb_build_object('target', 67),
    null
  )->>'id')::uuid;

  v_rank := (public.publish_daily_challenge_setup(
    v_today,
    'test-blind-rank-v1',
    'blind_rank_5',
    'rank-' || v_today::text,
    'blind-rank-archetype-v1',
    'play-official-score-v1',
    jsonb_build_object('fighter_ids', jsonb_build_array('a','b','c','d','e')),
    jsonb_build_object('canonical_order', jsonb_build_array('a','b','c','d','e')),
    '{}'::jsonb,
    jsonb_build_object('fighter_ids', jsonb_build_array('a','b','c','d','e'), 'ratings', jsonb_build_object('a',100,'b',90,'c',80,'d',70,'e',60), 'tolerance', 1),
    null
  )->>'id')::uuid;

  v_keep := (public.publish_daily_challenge_setup(
    v_today,
    'test-keep-cut-v1',
    'keep_4_cut_4',
    'keep-' || v_today::text,
    'keep-cut-board-v1',
    'play-official-score-v1',
    jsonb_build_object('fighter_ids', jsonb_build_array('a','b','c','d','e','f','g','h')),
    jsonb_build_object('model_top_four', jsonb_build_array('a','b','c','d')),
    '{}'::jsonb,
    jsonb_build_object('fighter_ids', jsonb_build_array('a','b','c','d','e','f','g','h'), 'ratings', jsonb_build_object('a',100,'b',90,'c',80,'d',70,'e',60,'f',50,'g',40,'h',30), 'tolerance', 1),
    null
  )->>'id')::uuid;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_cody::text, true);

  v_public := public.get_today_challenge_public();
  if (v_public->>'id')::uuid <> v_ftl
    or v_public->>'setup_key' <> 'ftl-' || v_today::text
    or v_public->>'content_version' <> 'find-leader-v2-20260724'
    or v_public->>'scoring_version' <> 'play-official-score-v1'
    or v_public->'reveal_setup' <> 'null'::jsonb
    or v_public->'official_attempt' <> 'null'::jsonb
    or v_public::text like '%definition_id%'
    or v_public::text like '%leader_id%' then
    raise exception 'pre-completion projection exposed private/reveal evidence or lost exact identity: %', v_public;
  end if;

  v_first := public.submit_my_daily_challenge_attempt(
    v_ftl,
    jsonb_build_object('eliminated_ids', jsonb_build_array('f1','f2','f3'))
  );
  v_replay := public.submit_my_daily_challenge_attempt(
    v_ftl,
    jsonb_build_object('eliminated_ids', jsonb_build_array('f1','f2','f4','f5','f6','f7','f8','f9','f10'))
  );

  if v_first->>'attempt_kind' <> 'official_first'
    or (v_first->>'native_score')::integer <> 3
    or (v_first->>'normalized_score')::integer <> 30 then
    raise exception 'server-owned Find the Leader grading failed: %', v_first;
  end if;
  if v_replay->>'attempt_kind' <> 'replay'
    or (v_replay->>'official_normalized_score')::integer <> 30
    or (v_replay->>'replay_normalized_score')::integer <> 100 then
    raise exception 'replay replaced the immutable official result: %', v_replay;
  end if;
  if (
    select count(*)
    from private.daily_challenge_attempts
    where daily_challenge_id = v_ftl
      and profile_id = v_cody
      and attempt_kind = 'official_first'
  ) <> 1 then
    raise exception 'more than one official first attempt exists';
  end if;

  v_public := public.get_today_challenge_public();
  if v_public->'reveal_setup'->>'leader_id' <> 'f3'
    or (v_public->'official_attempt'->>'normalized_score')::integer <> 30
    or v_public::text like '%private_setup_evidence%'
    or v_public::text like '%private_grading_evidence%'
    or v_public::text like '%ratings%' then
    raise exception 'post-completion projection crossed the reveal/private boundary: %', v_public;
  end if;

  perform public.submit_my_daily_challenge_attempt(
    v_resume,
    jsonb_build_object('choices', jsonb_build_array('L','R','R','R','L'))
  );
  perform public.submit_my_daily_challenge_attempt(
    v_wavelength,
    jsonb_build_object('guesses', jsonb_build_array(20,40,60,70))
  );
  perform public.submit_my_daily_challenge_attempt(
    v_rank,
    jsonb_build_object('ordered_ids', jsonb_build_array('a','b','c','d','e'))
  );
  perform public.submit_my_daily_challenge_attempt(
    v_keep,
    jsonb_build_object('kept_ids', jsonb_build_array('a','b','c','d'))
  );

  if not exists (
    select 1 from private.daily_challenge_attempts
    where daily_challenge_id = v_resume and profile_id = v_cody
      and native_score = 4 and normalized_score = 80
  ) or not exists (
    select 1 from private.daily_challenge_attempts
    where daily_challenge_id = v_wavelength and profile_id = v_cody
      and native_score = 97 and normalized_score = 97
  ) or not exists (
    select 1 from private.daily_challenge_attempts
    where daily_challenge_id = v_rank and profile_id = v_cody
      and native_score = 10 and normalized_score = 100
  ) or not exists (
    select 1 from private.daily_challenge_attempts
    where daily_challenge_id = v_keep and profile_id = v_cody
      and native_score = 16 and normalized_score = 100
  ) then
    raise exception 'one or more future eligible games did not fit the generalized server grader';
  end if;

  perform set_config('request.jwt.claim.sub', v_shane::text, true);
  perform public.submit_my_daily_challenge_attempt(
    v_ftl,
    jsonb_build_object('eliminated_ids', jsonb_build_array('f10','f9','f3'))
  );

  v_board := public.get_daily_challenge_leaderboard(v_today, 'find-leader-v1');
  if (
    select count(*)
    from jsonb_array_elements(v_board->'entries') entry
    where (entry->>'rank')::integer = 1
      and (entry->>'normalized_score')::integer = 30
  ) <> 2
    or v_board::text like '%profile_id%'
    or v_board::text like '%completed_at%'
    or v_board::text like '%submission_evidence%'
    or v_board::text like '%grading_evidence%' then
    raise exception 'leaderboard tie/privacy contract failed: %', v_board;
  end if;

  perform set_config('request.jwt.claim.sub', v_cody::text, true);
  v_history := public.list_my_daily_challenge_history();
  if jsonb_array_length(v_history) <> 5
    or v_history::text not like '%find-leader-v2-20260724%'
    or v_history::text not like '%play-official-score-v1%'
    or v_history::text not like '%blind_resume%'
    or v_history::text not like '%wavelength%'
    or v_history::text not like '%blind_rank_5%'
    or v_history::text not like '%keep_4_cut_4%' then
    raise exception 'generalized history did not preserve all game/version snapshots: %', v_history;
  end if;

  v_streak := public.get_my_daily_challenge_streak();
  if (v_streak->>'current_streak')::integer <> 1
    or (v_streak->>'best_streak')::integer <> 1 then
    raise exception 'generalized streak projection failed: %', v_streak;
  end if;

  select *
  into v_row
  from public.list_my_find_leader_history()
  where day = v_today;
  if v_row.official_score <> 3
    or v_row.best_score <> 10
    or v_row.attempts <> 2 then
    raise exception 'Find the Leader compatibility history changed first-attempt/replay behavior: %', row_to_json(v_row);
  end if;

  begin
    update private.daily_challenge_attempts
    set normalized_score = 100
    where daily_challenge_id = v_ftl
      and profile_id = v_cody
      and attempt_kind = 'official_first';
    raise exception 'immutable attempt update unexpectedly succeeded';
  exception
    when sqlstate '55000' then null;
  end;

  if to_regclass('public.daily_challenges') is not null then
    raise exception 'official daily base state is exposed in the public schema';
  end if;
  if has_table_privilege('authenticated', 'private.daily_challenge_setups', 'SELECT')
    or has_table_privilege('authenticated', 'private.daily_challenges', 'SELECT')
    or has_table_privilege('authenticated', 'private.daily_challenge_attempts', 'SELECT')
    or has_table_privilege('authenticated', 'private.daily_challenge_attempts', 'UPDATE') then
    raise exception 'authenticated role has direct private daily evidence access';
  end if;
  if has_function_privilege('anon', 'public.submit_my_daily_challenge_attempt(uuid,jsonb)', 'EXECUTE')
    or has_function_privilege('anon', 'public.get_daily_challenge_leaderboard(date,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.publish_daily_challenge_setup(date,text,text,text,text,text,jsonb,jsonb,jsonb,jsonb,text)', 'EXECUTE') then
    raise exception 'daily function grants are broader than intended';
  end if;
  if to_regprocedure('public.record_my_daily_challenge_attempt(uuid,integer,jsonb,jsonb,timestamp with time zone)') is not null then
    raise exception 'competing client-score RPC remains installed';
  end if;

  begin
    insert into private.daily_challenge_schedule_versions (
      version, time_zone, anchor_day, starts_on, game_cycle
    ) values (
      'invalid-auction', 'America/Chicago', v_today, v_today + 2000, array['auction']::text[]
    );
    raise exception 'Auction entered the Today''s Challenge schedule contract';
  exception
    when check_violation then null;
  end;
end
$$;

rollback;
