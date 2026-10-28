\set ON_ERROR_STOP on
begin;

do $$
declare
  v_day constant date := date '2039-01-01';
  v_version constant text := 'football-persisted-runtime-proof-v1';
  v_published jsonb;
  v_request jsonb;
  v_unpublished jsonb;
begin
  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values (
    v_version,
    'America/Chicago',
    v_day,
    v_day,
    array['find_leader', 'wavelength']::text[],
    'football'
  );

  v_published := public.publish_daily_challenge_setup(
    v_day,
    v_version,
    'find_leader',
    'football-persisted-runtime-proof:published',
    'football-persisted-runtime-proof-v1',
    'play-official-score-v1',
    jsonb_build_object(
      'initial_state',
      jsonb_build_object(
        'complete', false,
        'eliminated_ids', '[]'::jsonb,
        'native_progress', 0
      )
    ),
    '{}'::jsonb,
    jsonb_build_object(
      'candidate_ids', jsonb_build_array('a', 'b'),
      'leader_id', 'a'
    ),
    jsonb_build_object(
      'candidate_ids', jsonb_build_array('a', 'b'),
      'leader_id', 'a'
    ),
    null
  );

  v_request := public.get_daily_challenge_materialization_request(
    'football',
    timestamptz '2039-01-01 12:00:00-06'
  );

  if (v_request->>'required')::boolean then
    raise exception 'published Football day was incorrectly marked for rematerialization: %', v_request;
  end if;

  if v_request->>'schedule_version' <> v_version
    or v_request->>'daily_challenge_id' <> v_published->>'id'
    or v_request->>'published_game' <> 'find_leader'
    or v_request->>'expected_game' <> 'find_leader' then
    raise exception 'sport-scoped materialization request did not preserve published identity: %', v_request;
  end if;

  v_unpublished := public.get_daily_challenge_materialization_request(
    'football',
    timestamptz '2039-01-02 12:00:00-06'
  );

  if not (v_unpublished->>'required')::boolean
    or v_unpublished->>'schedule_version' <> v_version
    or v_unpublished->>'expected_game' <> 'wavelength'
    or v_unpublished->>'daily_challenge_id' is not null then
    raise exception 'unpublished Football day did not request materialization cleanly: %', v_unpublished;
  end if;
end
$$;

rollback;
\echo 'Football persisted-runtime materialization proof passed.'
