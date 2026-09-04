\set ON_ERROR_STOP on
begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_source_schedule private.daily_challenge_schedule_versions;
  v_reroll_schedule private.daily_challenge_schedule_versions;
  v_active_schedule private.daily_challenge_schedule_versions;
  v_reroll_next_starts_on date;
  v_cycle_length integer;
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
  into v_source_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v1'
    and schedule.sport = 'ufc';

  if v_source_schedule.version is null
    or v_source_schedule.time_zone <> 'America/Chicago'
    or v_source_schedule.anchor_day <> date '2026-08-06'
    or coalesce(array_length(v_source_schedule.game_cycle, 1), 0) <> 20 then
    raise exception 'source twenty-day rotation was not installed exactly: %', row_to_json(v_source_schedule);
  end if;

  select schedule.*
  into v_reroll_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'play-rotation-v2'
    and schedule.sport = 'ufc';

  if v_reroll_schedule.version is null
    or v_reroll_schedule.time_zone is distinct from v_source_schedule.time_zone
    or v_reroll_schedule.anchor_day is distinct from v_source_schedule.anchor_day
    or v_reroll_schedule.game_cycle is distinct from v_source_schedule.game_cycle
    or v_reroll_schedule.starts_on < v_source_schedule.starts_on then
    raise exception 'reroll rotation does not preserve the source rotation contract: source %, reroll %',
      row_to_json(v_source_schedule),
      row_to_json(v_reroll_schedule);
  end if;

  if (select count(*) from unnest(v_reroll_schedule.game_cycle) game where game = 'find_leader') <> 8
    or (select count(*) from unnest(v_reroll_schedule.game_cycle) game where game = 'blind_resume') <> 3
    or (select count(*) from unnest(v_reroll_schedule.game_cycle) game where game = 'wavelength') <> 5
    or (select count(*) from unnest(v_reroll_schedule.game_cycle) game where game = 'blind_rank_5') <> 2
    or (select count(*) from unnest(v_reroll_schedule.game_cycle) game where game = 'keep_4_cut_4') <> 2 then
    raise exception 'rotation weights do not match the approved 8/3/5/2/2 contract: %', v_reroll_schedule.game_cycle;
  end if;

  if exists (
    select 1
    from unnest(v_reroll_schedule.game_cycle) game
    where game not in (
      'find_leader',
      'blind_resume',
      'wavelength',
      'blind_rank_5',
      'keep_4_cut_4'
    )
  )
    or 'auction' = any(v_reroll_schedule.game_cycle)
    or 'better_than' = any(v_reroll_schedule.game_cycle)
    or 'hit_the_number' = any(v_reroll_schedule.game_cycle) then
    raise exception 'an ineligible game entered the historical reroll rotation: %', v_reroll_schedule.game_cycle;
  end if;

  for v_index in 1..20 loop
    if v_reroll_schedule.game_cycle[v_index] = v_reroll_schedule.game_cycle[(v_index % 20) + 1] then
      raise exception 'consecutive daily game at cycle position %, including the boundary: %',
        v_index,
        v_reroll_schedule.game_cycle;
    end if;
  end loop;

  for v_index in -40..40 loop
    v_day := v_reroll_schedule.anchor_day + v_index;
    v_expected := private.daily_challenge_expected_game(v_reroll_schedule.version, v_day);
    v_repeated := private.daily_challenge_expected_game(v_reroll_schedule.version, v_day);
    if v_expected is distinct from v_repeated
      or v_expected is distinct from v_reroll_schedule.game_cycle[(((v_index % 20) + 20) % 20) + 1] then
      raise exception 'schedule version/date resolution was not deterministic for %: %, %',
        v_day,
        v_expected,
        v_repeated;
    end if;
  end loop;

  select min(schedule.starts_on)
  into v_reroll_next_starts_on
  from private.daily_challenge_schedule_versions schedule
  where schedule.sport = 'ufc'
    and schedule.starts_on > v_reroll_schedule.starts_on;

  if exists (
    select 1
    from private.daily_challenges daily
    join private.daily_challenge_schedule_versions daily_schedule
      on daily_schedule.version = daily.schedule_version
    where daily_schedule.sport = 'ufc'
      and daily.schedule_version <> v_reroll_schedule.version
      and daily.central_day >= v_reroll_schedule.starts_on
      and (
        v_reroll_next_starts_on is null
        or daily.central_day < v_reroll_next_starts_on
      )
  ) then
    raise exception 'reroll activation crossed an already-materialized historical day while that version owned the schedule';
  end if;

  select schedule.*
  into v_active_schedule
  from private.daily_challenge_schedule_versions schedule
  where schedule.sport = 'ufc'
  order by schedule.starts_on desc, schedule.created_at desc, schedule.version desc
  limit 1;

  if v_active_schedule.version is null then
    raise exception 'latest Daily schedule version is missing';
  end if;

  v_cycle_length := coalesce(array_length(v_active_schedule.game_cycle, 1), 0);
  if v_cycle_length = 0 then
    raise exception 'latest Daily schedule has an empty game cycle: %', row_to_json(v_active_schedule);
  end if;

  select candidate.day::date,
         private.daily_challenge_expected_game(v_active_schedule.version, candidate.day::date)
  into v_fallback_day, v_fallback_expected
  from generate_series(
    v_active_schedule.starts_on,
    v_active_schedule.starts_on + (v_cycle_length - 1),
    interval '1 day'
  ) as candidate(day)
  where private.daily_challenge_expected_game(v_active_schedule.version, candidate.day::date) <> 'find_leader'
  order by candidate.day
  limit 1;

  if v_fallback_day is null then
    raise exception 'latest Daily schedule has no non-Find-the-Leader day for fallback proof: %', row_to_json(v_active_schedule);
  end if;

  begin
    perform public.publish_daily_challenge_setup(
      v_fallback_day,
      v_active_schedule.version,
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
    v_active_schedule.version,
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
    or v_request->>'schedule_version' <> v_active_schedule.version
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
