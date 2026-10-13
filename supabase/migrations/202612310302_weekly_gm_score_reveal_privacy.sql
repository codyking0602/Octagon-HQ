-- Hide opponent GM results until viewer completes the same scenario in the same week.
-- Keep public placement and run counts available while locking scores and full run states.
create or replace function public.get_my_football_weekly_gm()
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
  v_elite_unlocked boolean := false;
  v_young_unlocked boolean := false;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  select * into v_event from private.football_weekly_gm_events
  order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not configured'; end if;
  select exists(select 1 from private.football_weekly_gm_attempts mine
    where mine.week_start=v_event.week_start and mine.profile_id=v_profile
      and mine.scenario='elite' and mine.completed_at is not null),
    exists(select 1 from private.football_weekly_gm_attempts mine
    where mine.week_start=v_event.week_start and mine.profile_id=v_profile
      and mine.scenario='young' and mine.completed_at is not null)
  into v_elite_unlocked,v_young_unlocked;
  return jsonb_build_object(
    'week_start', v_event.week_start,
    'opens_at', v_event.opens_at,
    'closes_at', v_event.closes_at,
    'status', case when now() < v_event.opens_at then 'upcoming'
               when now() >= v_event.closes_at then 'closed' else 'active' end,
    'attempts', coalesce((
      select jsonb_object_agg(attempt.scenario, jsonb_build_object(
        'seed',attempt.seed,'state',attempt.state,
        'completed',attempt.completed_at is not null,'score',attempt.score
      ))
      from private.football_weekly_gm_attempts attempt
      where attempt.week_start=v_event.week_start and attempt.profile_id=v_profile
    ), '{}'::jsonb),
    'leaderboard', coalesce((
      select jsonb_agg(jsonb_build_object(
        'profile_id', ranked.profile_id, 'display_name',ranked.display_name,
        'elite_score',case when ranked.profile_id=v_profile or v_elite_unlocked then ranked.elite_score else null end,
        'young_score',case when ranked.profile_id=v_profile or v_young_unlocked then ranked.young_score else null end,
        'total_score',case when ranked.profile_id=v_profile or (v_elite_unlocked and v_young_unlocked) then ranked.total_score else null end,
        'completed_runs',ranked.completed_runs,
        'rank',ranked.rank
      ) order by ranked.rank,ranked.display_name)
      from (
        select rank() over (order by scores.total_score desc)::integer as rank,
          scores.profile_id,profile.display_name,scores.elite_score,scores.young_score,
          scores.total_score,scores.completed_runs
        from (
          select attempt.profile_id,
            max(attempt.score) filter (where attempt.scenario='elite') as elite_score,
            max(attempt.score) filter (where attempt.scenario='young') as young_score,
            sum(attempt.score)::numeric as total_score,
            count(*)::integer as completed_runs
          from private.football_weekly_gm_attempts attempt
          where attempt.week_start=v_event.week_start and attempt.completed_at is not null
          group by attempt.profile_id
        ) scores
        join public.profiles profile on profile.id=scores.profile_id
        where not private.football_weekly_auction_is_reserved_test_profile(scores.profile_id)
      ) ranked
    ),'[]'::jsonb)
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
    and (v_profile=v_viewer or exists (
      select 1 from private.football_weekly_gm_attempts mine
      where mine.week_start=attempt.week_start
        and mine.profile_id=v_viewer and mine.scenario=p_scenario
        and mine.completed_at is not null
    ))
  order by attempt.week_start desc limit 1;
  if v_result is null then raise exception 'Complete your own matching QB franchise before inspecting another result'; end if;
  return v_result;
end;
$$;
