-- Closed weekly NFL GM championships: historical results are derived from the
-- existing server-verified attempts. A championship requires both official runs.
-- Read-only and only for signed-in members; owner preview/test entries are excluded.
create or replace function public.get_football_weekly_gm_history()
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'week_start', event.week_start,
      'opens_at', event.opens_at,
      'closes_at', event.closes_at,
      'standings', ranked.standings,
      'champions', ranked.champions
    ) order by event.week_start desc
  ), '[]'::jsonb)
  from private.football_weekly_gm_events event
  cross join lateral (
    select
      coalesce(jsonb_agg(jsonb_build_object(
        'profile_id', placing.profile_id,
        'display_name', placing.display_name,
        'elite_score', placing.elite_score,
        'young_score', placing.young_score,
        'total_score', placing.total_score,
        'completed_runs', placing.completed_runs,
        'rank', placing.rank
      ) order by placing.rank, placing.display_name), '[]'::jsonb) as standings,
      coalesce(jsonb_agg(jsonb_build_object(
        'profile_id', placing.profile_id,
        'display_name', placing.display_name,
        'elite_score', placing.elite_score,
        'young_score', placing.young_score,
        'total_score', placing.total_score,
        'completed_runs', placing.completed_runs,
        'rank', placing.rank
      ) order by placing.display_name) filter (where placing.rank = 1), '[]'::jsonb) as champions
    from (
      select scored.*, rank() over (order by scored.total_score desc)::integer as rank
      from (
        select attempt.profile_id, profile.display_name,
          max(attempt.score) filter (where attempt.scenario = 'elite') as elite_score,
          max(attempt.score) filter (where attempt.scenario = 'young') as young_score,
          sum(attempt.score)::numeric as total_score,
          count(*)::integer as completed_runs
        from private.football_weekly_gm_attempts attempt
        join public.profiles profile on profile.id = attempt.profile_id
        where attempt.week_start = event.week_start
          and attempt.completed_at is not null
          and not private.football_weekly_auction_is_reserved_test_profile(attempt.profile_id)
        group by attempt.profile_id, profile.display_name
        having count(distinct attempt.scenario) = 2
      ) scored
    ) placing
  ) ranked
  where auth.uid() is not null
    and event.closes_at <= now()
    and jsonb_array_length(ranked.standings) > 0;
$$;

create or replace function public.get_football_weekly_gm_archived_result(
  p_week_start date, p_scenario text, p_profile_id uuid
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite', 'young') then raise exception 'invalid Weekly GM scenario'; end if;
  if p_profile_id is null or private.football_weekly_auction_is_reserved_test_profile(p_profile_id)
    then raise exception 'invalid championship participant'; end if;
  select jsonb_build_object(
    'display_name', profile.display_name,
    'score', attempt.score,
    'state', attempt.state
  ) into v_result
  from private.football_weekly_gm_attempts attempt
  join private.football_weekly_gm_events event on event.week_start = attempt.week_start
  join public.profiles profile on profile.id = attempt.profile_id
  where attempt.week_start = p_week_start
    and attempt.profile_id = p_profile_id
    and attempt.scenario = p_scenario
    and attempt.completed_at is not null
    and event.closes_at <= now()
    and exists (
      select 1 from private.football_weekly_gm_attempts other
      where other.week_start = attempt.week_start
        and other.profile_id = attempt.profile_id
        and other.scenario <> attempt.scenario
        and other.completed_at is not null
    );
  if v_result is null then raise exception 'Archived championship result unavailable'; end if;
  return v_result;
end;
$$;

revoke all on function public.get_football_weekly_gm_history() from public, anon;
revoke all on function public.get_football_weekly_gm_archived_result(date,text,uuid) from public, anon;
grant execute on function public.get_football_weekly_gm_history() to authenticated;
grant execute on function public.get_football_weekly_gm_archived_result(date,text,uuid) to authenticated;
