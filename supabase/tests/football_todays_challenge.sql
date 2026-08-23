begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_today date := private.daily_challenge_central_day(now());
  v_ufc_schedule text;
  v_football_schedule text;
  v_ufc_request jsonb;
  v_football_request jsonb;
  v_football_cycle text[];
begin
  v_ufc_schedule := private.daily_challenge_schedule_for_day(v_today);
  if v_ufc_schedule is null then
    raise exception 'existing UFC daily schedule did not resolve';
  end if;

  if v_ufc_schedule is distinct from private.daily_challenge_schedule_for_day(v_today, 'ufc') then
    raise exception 'legacy one-argument daily schedule lookup no longer resolves the UFC owner';
  end if;

  v_football_schedule := private.daily_challenge_schedule_for_day(v_today, 'football');
  if v_football_schedule is distinct from 'football-daily-v1' then
    raise exception 'Football daily schedule did not resolve football-daily-v1: %', v_football_schedule;
  end if;

  if v_football_schedule = v_ufc_schedule then
    raise exception 'UFC and Football daily schedules unexpectedly share one version identity';
  end if;

  select schedule.game_cycle
  into v_football_cycle
  from private.daily_challenge_schedule_versions schedule
  where schedule.version = 'football-daily-v1'
    and schedule.sport = 'football';

  if v_football_cycle is distinct from array[
    'keep_4_cut_4',
    'blind_resume',
    'hit_the_number',
    'find_leader',
    'wavelength'
  ]::text[] then
    raise exception 'Football five-slot daily rotation is not the approved Daily Double rotation';
  end if;

  v_ufc_request := public.get_daily_challenge_materialization_request(now());
  v_football_request := public.get_daily_challenge_materialization_request('football'::text, now());

  if v_ufc_request->>'sport' <> 'ufc'
    or v_ufc_request->>'schedule_version' <> v_ufc_schedule then
    raise exception 'legacy UFC materialization request changed ownership: %', v_ufc_request;
  end if;

  if v_football_request->>'sport' <> 'football'
    or v_football_request->>'schedule_version' <> 'football-daily-v1' then
    raise exception 'Football materialization request did not resolve the Football schedule: %', v_football_request;
  end if;

  if v_football_request->>'expected_game' not in (
    'keep_4_cut_4',
    'blind_resume',
    'hit_the_number',
    'find_leader',
    'wavelength'
  ) then
    raise exception 'Football materialization request returned an unsupported daily game: %', v_football_request;
  end if;

  if exists (
    select 1
    from private.daily_challenge_schedule_versions schedule
    where schedule.version <> 'football-daily-v1'
      and schedule.sport = 'football'
  ) then
    raise exception 'PR2 introduced more than one Football daily schedule owner';
  end if;
end;
$$;

rollback;
