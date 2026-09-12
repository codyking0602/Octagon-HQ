\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_day constant date := date '2039-01-01';
  v_version constant text := 'football-materialization-proof-v1';
  v_published jsonb;
  v_request jsonb;
begin
  insert into private.daily_challenge_schedule_versions (
    version, time_zone, anchor_day, starts_on, game_cycle, sport
  )
  values (
    v_version,
    'America/Chicago',
    v_day,
    v_day,
    array['find_leader']::text[],
    'football'
  );

  v_published := public.publish_daily_challenge_setup(
    v_day,
    v_version,
    'find_leader',
    'football-materialization-proof:published',
    'football-materialization-proof-v1',
    'play-official-score-v1',
    jsonb_build_object('initial_state', jsonb_build_object(
      'complete', false,
      'eliminated_ids', '[]'::jsonb,
      'native_progress', 0
    )),
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
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
    or v_request->>'published_game' <> 'find_leader' then
    raise exception 'sport-scoped materialization request did not preserve the immutable published identity: %', v_request;
  end if;

  if (public.get_daily_challenge_materialization_request(
    'ufc',
    timestamptz '2026-09-12 12:00:00-05'
  )->>'schedule_version') <> 'play-rotation-v7' then
    raise exception 'sport-scoped materialization request changed UFC schedule ownership';
  end if;
end
$$;

rollback;
\echo 'Sport-scoped immutable Daily materialization proof passed.'
