begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_day date := date '2026-08-22';
  v_at timestamptz := timestamptz '2026-08-22 17:00:00+00';
  v_request jsonb;
  v_daily_id uuid;
begin
  v_request := public.get_daily_challenge_materialization_request(v_at, 'football');
  if v_request->>'required' <> 'true'
    or v_request->>'central_day' <> v_day::text
    or v_request->>'schedule_version' <> 'football-daily-v1'
    or v_request->>'expected_game' <> 'find_leader' then
    raise exception 'Football materialization request did not resolve the canonical Football schedule: %', v_request;
  end if;

  v_daily_id := (public.publish_daily_challenge_setup(
    v_day,
    'football-daily-v1',
    'find_leader',
    'materialization-reuse-football-' || v_day::text,
    'football-find-leader-v1',
    'play-official-score-v1',
    jsonb_build_object('question', 'Football materialization reuse proof'),
    jsonb_build_object('leader_id', 'f3'),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10')),
    jsonb_build_object('candidate_ids', jsonb_build_array('f1','f2','f3','f4','f5','f6','f7','f8','f9','f10'), 'leader_id', 'f3'),
    null
  )->>'id')::uuid;

  v_request := public.get_daily_challenge_materialization_request(v_at, 'football');
  if v_request->>'required' <> 'false'
    or (v_request->>'daily_challenge_id')::uuid <> v_daily_id
    or v_request->>'published_game' <> 'find_leader' then
    raise exception 'Football materialization request did not reuse the immutable published daily: %', v_request;
  end if;

  v_request := public.get_daily_challenge_materialization_request(v_at);
  if v_request->>'schedule_version' <> private.daily_challenge_schedule_for_day(v_day) then
    raise exception 'legacy materialization request no longer defaults to UFC: %', v_request;
  end if;
end
$$;

rollback;
