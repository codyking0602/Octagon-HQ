-- Owner-only, real-production dress rehearsal for the October 13 NFL GM Featured week.
-- Reuses the *same* public.save_my_football_weekly_gm validation and GM engine;
-- test attempts live in a 1980 event excluded from every 2026 Championship projection.
-- No production window, competition attempt, or participant result is changed.
insert into private.football_weekly_gm_events (week_start, opens_at, closes_at, subject_key)
values (
  date '1980-01-29',
  '2026-10-10 00:00:00 America/Chicago'::timestamptz,
  '2026-10-13 00:00:00 America/Chicago'::timestamptz,
  'owner-only-nfl-gm-playtest'
)
on conflict (week_start) do update set
  opens_at = excluded.opens_at,
  closes_at = excluded.closes_at,
  subject_key = excluded.subject_key;

create or replace function private.football_weekly_gm_owner_preview_allowed(p_profile uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles profile
    join public.pick_control_owners owner on owner.profile_id = profile.id
    where profile.id = p_profile
      and upper(trim(profile.display_name)) = 'CODY'
  );
$$;
revoke all on function private.football_weekly_gm_owner_preview_allowed(uuid) from public, anon, authenticated;

create or replace function public.get_my_football_weekly_gm_preview()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
begin
  if not private.football_weekly_gm_owner_preview_allowed(v_profile) then
    raise exception 'Owner-only Weekly GM playtest';
  end if;
  select * into v_event from private.football_weekly_gm_events
    where week_start = date '1980-01-29';
  if not found then raise exception 'GM playtest is unavailable'; end if;
  return jsonb_build_object(
    'week_start',v_event.week_start,
    'opens_at',v_event.opens_at,
    'closes_at',v_event.closes_at,
    'status', case when now()<v_event.opens_at then 'upcoming'
                   when now()>=v_event.closes_at then 'closed' else 'active' end,
    'attempts',coalesce((
      select jsonb_object_agg(attempt.scenario, jsonb_build_object(
        'seed',attempt.seed,'state',attempt.state,
        'completed',attempt.completed_at is not null,'score',attempt.score
      ))
      from private.football_weekly_gm_attempts attempt
      where attempt.week_start=v_event.week_start and attempt.profile_id=v_profile
    ),'{}'::jsonb),
    'leaderboard',coalesce((
      select jsonb_agg(jsonb_build_object(
        'profile_id', scores.profile_id,
        'display_name',profile.display_name,
        'elite_score',scores.elite_score,
        'young_score',scores.young_score,
        'total_score',scores.total_score,
        'completed_runs',scores.completed_runs,
        'rank',1
      ))
      from (
        select attempt.profile_id,
          max(attempt.score) filter (where attempt.scenario='elite') as elite_score,
          max(attempt.score) filter (where attempt.scenario='young') as young_score,
          sum(attempt.score)::numeric as total_score,
          count(*)::integer as completed_runs
        from private.football_weekly_gm_attempts attempt
        where attempt.week_start=v_event.week_start
          and attempt.completed_at is not null
          and attempt.profile_id=v_profile
        group by attempt.profile_id
      ) scores
      join public.profiles profile on profile.id=scores.profile_id
    ),'[]'::jsonb)
  );
end;
$$;

create or replace function public.start_my_football_weekly_gm_preview(p_scenario text)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
  v_attempt private.football_weekly_gm_attempts%rowtype;
begin
  if not private.football_weekly_gm_owner_preview_allowed(v_profile) then
    raise exception 'Owner-only Weekly GM playtest';
  end if;
  if p_scenario is null or p_scenario not in ('elite','young') then
    raise exception 'Invalid Weekly GM scenario';
  end if;
  select * into v_event from private.football_weekly_gm_events
    where week_start=date '1980-01-29'
      and opens_at<=now() and closes_at>now();
  if not found then raise exception 'Owner GM playtest is closed'; end if;
  insert into private.football_weekly_gm_attempts (week_start,profile_id,scenario,seed)
  values (v_event.week_start,v_profile,p_scenario,
    'weekly-gm:2026-10-13:'||p_scenario||':'||gen_random_uuid()::text||':gmdev1')
  on conflict (week_start,profile_id,scenario) do nothing;
  select * into v_attempt from private.football_weekly_gm_attempts
    where week_start=v_event.week_start and profile_id=v_profile and scenario=p_scenario;
  return jsonb_build_object('seed',v_attempt.seed,'state',v_attempt.state,
    'completed',v_attempt.completed_at is not null,'score',v_attempt.score);
end;
$$;

create or replace function public.get_football_weekly_gm_preview_result(
  p_scenario text, p_profile_id uuid default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_result jsonb;
begin
  if not private.football_weekly_gm_owner_preview_allowed(v_profile) then
    raise exception 'Owner-only Weekly GM playtest';
  end if;
  if p_profile_id is not null and p_profile_id <> v_profile then
    raise exception 'Only your own playtest results may be viewed';
  end if;
  if p_scenario is null or p_scenario not in ('elite','young') then
    raise exception 'Invalid Weekly GM scenario';
  end if;
  select jsonb_build_object(
    'display_name',profile.display_name,'score',attempt.score,'state',attempt.state
  ) into v_result
  from private.football_weekly_gm_attempts attempt
  join public.profiles profile on profile.id=attempt.profile_id
  where attempt.week_start=date '1980-01-29'
    and attempt.profile_id=v_profile
    and attempt.scenario=p_scenario
    and attempt.completed_at is not null;
  if v_result is null then raise exception 'Playtest franchise is not complete'; end if;
  return v_result;
end;
$$;

create or replace function public.reset_my_football_weekly_gm_preview()
returns boolean
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
begin
  if not private.football_weekly_gm_owner_preview_allowed(v_profile) then
    raise exception 'Owner-only Weekly GM playtest';
  end if;
  delete from private.football_weekly_gm_attempts
    where week_start=date '1980-01-29' and profile_id=v_profile;
  return true;
end;
$$;

revoke all on function public.get_my_football_weekly_gm_preview() from public, anon;
revoke all on function public.start_my_football_weekly_gm_preview(text) from public, anon;
revoke all on function public.get_football_weekly_gm_preview_result(text,uuid) from public, anon;
revoke all on function public.reset_my_football_weekly_gm_preview() from public, anon;
grant execute on function public.get_my_football_weekly_gm_preview() to authenticated;
grant execute on function public.start_my_football_weekly_gm_preview(text) to authenticated;
grant execute on function public.get_football_weekly_gm_preview_result(text,uuid) to authenticated;
grant execute on function public.reset_my_football_weekly_gm_preview() to authenticated;


-- Keep the ordinary official RPCs pointed only at actual Featured events.
-- Without this, the earlier open 1980 playtest event could be picked by
-- the official start endpoint before October 13.
create or replace function public.start_my_football_weekly_gm(p_scenario text)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
  v_attempt private.football_weekly_gm_attempts%rowtype;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') or p_scenario is null then
    raise exception 'invalid Weekly GM scenario';
  end if;
  select * into v_event from private.football_weekly_gm_events
    where subject_key='nfl-gm-championship'
      and opens_at <= now() and closes_at > now()
    order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not open'; end if;
  insert into private.football_weekly_gm_attempts (week_start,profile_id,scenario,seed)
  values (v_event.week_start,v_profile,p_scenario,
    'weekly-gm:'||v_event.week_start::text||':'||p_scenario||':'||gen_random_uuid()::text||':gmdev1')
  on conflict (week_start,profile_id,scenario) do nothing;
  select * into v_attempt from private.football_weekly_gm_attempts
    where week_start=v_event.week_start and profile_id=v_profile and scenario=p_scenario;
  return jsonb_build_object(
    'seed',v_attempt.seed,'state',v_attempt.state,
    'completed',v_attempt.completed_at is not null,'score',v_attempt.score
  );
end;
$$;

create or replace function public.get_football_weekly_gm_result(
  p_scenario text, p_profile_id uuid default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_profile uuid := coalesce(p_profile_id,auth.uid());
  v_result jsonb;
begin
  if v_viewer is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') then
    raise exception 'invalid Weekly GM scenario';
  end if;
  select jsonb_build_object(
    'display_name',profile.display_name,'score',attempt.score,'state',attempt.state
  )
  into v_result
  from private.football_weekly_gm_attempts attempt
  join private.football_weekly_gm_events event on event.week_start=attempt.week_start
  join public.profiles profile on profile.id=attempt.profile_id
  where attempt.profile_id=v_profile and attempt.scenario=p_scenario
    and event.subject_key='nfl-gm-championship'
    and attempt.completed_at is not null
    and now()>=event.opens_at
  order by attempt.week_start desc limit 1;
  if v_result is null then raise exception 'This franchise result is not complete'; end if;
  return v_result;
end;
$$;
