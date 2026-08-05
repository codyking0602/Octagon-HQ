\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_schedule private.daily_challenge_schedule_versions;
  v_index integer;
  v_day date;
  v_expected text;
  v_repeated text;
  v_fallback_day date;
  v_fallback_expected text;
  v_fallback jsonb;
  v_request jsonb;
begin
  select schedule.*
  into v_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v1';

  if v_schedule.version is null
    or v_schedule.time_zone <> 'America/Chicago'
    or v_schedule.anchor_day <> date '2026-08-06'
    or coalesce(array_length(v_schedule.game_cycle, 1), 0) <> 20 then
    raise exception 'versioned twenty-day rotation was not installed exactly: %', row_to_json(v_schedule);
  end if;

  if (select count(*) from unnest(v_schedule.game_cycle) game where game = 'find_leader') <> 8
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_resume') <> 3
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'blind_rank_5') <> 2
    or (select count(*) from unnest(v_schedule.game_cycle) game where game = 'keep_4_cut_4') <> 2 then
    raise exception 'rotation weights do not match the approved 8/3/5/2/2 contract: %', v_schedule.game_cycle;
  end if;

  if exists (
    select 1
    from unnest(v_schedule.game_cycle) game
    where game not in (
      'find_leader',
      'blind_resume',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  )
    or 'auction' = any(v_schedule.game_cycle)
    or 'better_than' = any(v_schedule.game_cycle) then
    raise exception 'an ineligible game entered the official rotation: %', v_schedule.game_cycle;
  end if;

  for v_index in 1..20 loop
    if v_schedule.game_cycle[v_index] = v_schedule.game_cycle[(v_index % 20) + 1] then
      raise exception 'consecutive daily game at cycle position %, including the boundary: %',
        v_index,
        v_schedule.game_cycle;
    end if;
  end loop;

  for v_index in -40..40 loop
    v_day := v_schedule.anchor_day + v_index;
    v_expected := private.daily_challenge_expected_game(v_schedule.version, v_day);
    v_repeated := private.daily_challenge_expected_game(v_schedule.version, v_day);
    if v_expected is distinct from v_repeated
      or v_expected is distinct from v_schedule.game_cycle[(((v_index % 20) + 20) % 20) + 1] then
      raise exception 'schedule version/date resolution was not deterministic for %: %, %',
        v_day,
        v_expected,
        v_repeated;
    end if;
  end loop;

  if exists (
    select 1
    from private.daily_challenges daily
    where daily.schedule_version <> v_schedule.version
      and daily.central_day >= v_schedule.starts_on
  ) then
    raise exception 'rotation activation crossed an already-materialized historical day';
  end if;

  select candidate.day,
         private.daily_challenge_expected_game(v_schedule.version, candidate.day)
  into v_fallback_day, v_fallback_expected
  from generate_series(
    v_schedule.starts_on,
    v_schedule.starts_on + 19,
    interval '1 day'
  ) as candidate(day)
  where private.daily_challenge_expected_game(v_schedule.version, candidate.day::date) <> 'find_leader'
  order by candidate.day
  limit 1;

  begin
    perform public.publish_daily_challenge_setup(
      v_fallback_day,
      v_schedule.version,
      'find_leader',
      'rotation-fallback-without-reason',
      'find-leader-v2-20260724',
      'play-official-score-v1',
      jsonb_build_object('question', 'Fallback proof'),
      jsonb_build_object('leader_id', 'f3'),
      '{}'::jsonb,
      jsonb_build_object(
        'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'),
        'leader_id', 'f3'
      ),
      null
    );
    raise exception 'non-scheduled fallback published without persisted evidence';
  exception
    when others then
      if sqlerrm = 'non-scheduled fallback published without persisted evidence' then
        raise;
      end if;
  end;

  v_fallback := public.publish_daily_challenge_setup(
    v_fallback_day,
    v_schedule.version,
    'find_leader',
    'rotation-fallback-' || v_fallback_day::text,
    'find-leader-v2-20260724',
    'play-official-score-v1',
    jsonb_build_object('question', 'Fallback proof'),
    jsonb_build_object('leader_id', 'f3'),
    '{}'::jsonb,
    jsonb_build_object(
      'candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'),
      'leader_id', 'f3'
    ),
    'scheduled setup could not be materialized before publication'
  );

  v_request := public.get_daily_challenge_materialization_request(
    (v_fallback_day::timestamp + interval '12 hours') at time zone 'America/Chicago'
  );

  if v_fallback_expected = 'find_leader'
    or v_fallback->>'game_type' <> 'find_leader'
    or v_fallback->>'fallback_reason' <> 'scheduled setup could not be materialized before publication'
    or v_request->>'required' <> 'false'
    or v_request->>'schedule_version' <> v_schedule.version
    or v_request->>'expected_game' <> v_fallback_expected
    or v_request->>'published_game' <> 'find_leader'
    or v_request->>'fallback_reason' <> 'scheduled setup could not be materialized before publication' then
    raise exception 'canonical persisted fallback evidence failed: fallback %, request %',
      v_fallback,
      v_request;
  end if;
end
$$;

rollback;

\echo 'Today’s Challenge rotation proof passed.'
