-- Extend the existing authenticated recap projection with compact event-level
-- group standings. Official result administration remains service-role-only.
create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with personal_bout_rows as (
    select
      event.event_id,
      event.name,
      event.subtitle,
      event.venue,
      event.location,
      event.starts_at,
      event.season,
      event.completed_at,
      bout.bout_id,
      bout.position,
      bout.weight_class,
      bout.red_fighter_slug,
      bout.red_fighter_name,
      bout.blue_fighter_slug,
      bout.blue_fighter_name,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug as picked_fighter_slug,
      case
        when bout.result_status in ('draw', 'no_contest', 'cancelled') then 'excluded'
        when bout.result_status = 'pending' then 'pending'
        when pick.fighter_slug is null then 'missing'
        when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
        else 'incorrect'
      end as verdict
    from public.pick_events event
    join public.pick_bouts bout on bout.event_id = event.event_id
    left join public.profile_event_picks pick
      on pick.profile_id = auth.uid()
     and pick.event_id = bout.event_id
     and pick.bout_id = bout.bout_id
    where auth.uid() is not null
      and event.status = 'complete'
      and (p_season is null or event.season = p_season)
  ),
  grouped_personal_events as (
    select
      event_id,
      name,
      subtitle,
      venue,
      location,
      starts_at,
      season,
      completed_at,
      count(*) filter (where verdict = 'correct')::integer as correct,
      count(*) filter (where verdict = 'incorrect')::integer as incorrect,
      count(*) filter (where verdict = 'missing')::integer as missing,
      count(*) filter (where verdict = 'excluded')::integer as excluded,
      jsonb_agg(
        jsonb_build_object(
          'bout_id', bout_id,
          'position', position,
          'weight_class', weight_class,
          'red_fighter_slug', red_fighter_slug,
          'red_fighter_name', red_fighter_name,
          'blue_fighter_slug', blue_fighter_slug,
          'blue_fighter_name', blue_fighter_name,
          'result_status', result_status,
          'winner_fighter_slug', winner_fighter_slug,
          'picked_fighter_slug', picked_fighter_slug,
          'verdict', verdict
        )
        order by position
      ) as bouts
    from personal_bout_rows
    group by event_id, name, subtitle, venue, location, starts_at, season, completed_at
  ),
  entered_profiles as (
    select distinct pick.event_id, pick.profile_id
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    where auth.uid() is not null
      and event.status = 'complete'
      and (p_season is null or event.season = p_season)
  ),
  group_bout_rows as (
    select
      entrant.event_id,
      entrant.profile_id,
      profile.display_name,
      bout.bout_id,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug as picked_fighter_slug,
      case
        when bout.result_status in ('draw', 'no_contest', 'cancelled') then 'excluded'
        when bout.result_status = 'pending' then 'pending'
        when pick.fighter_slug is null then 'missing'
        when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
        else 'incorrect'
      end as verdict
    from entered_profiles entrant
    join public.profiles profile on profile.id = entrant.profile_id
    join public.pick_bouts bout on bout.event_id = entrant.event_id
    left join public.profile_event_picks pick
      on pick.profile_id = entrant.profile_id
     and pick.event_id = entrant.event_id
     and pick.bout_id = bout.bout_id
  ),
  grouped_group_results as (
    select
      event_id,
      profile_id,
      display_name,
      count(*) filter (where verdict = 'correct')::integer as correct,
      count(*) filter (where verdict = 'incorrect')::integer as incorrect,
      count(*) filter (where verdict = 'missing')::integer as missing,
      count(*) filter (where verdict = 'excluded')::integer as excluded,
      profile_id = auth.uid() as is_current_user
    from group_bout_rows
    group by event_id, profile_id, display_name
  ),
  event_group_results as (
    select
      event_id,
      jsonb_agg(
        jsonb_build_object(
          'display_name', display_name,
          'correct', correct,
          'incorrect', incorrect,
          'missing', missing,
          'excluded', excluded,
          'is_current_user', is_current_user
        )
        order by correct desc, incorrect asc, missing asc, display_name asc
      ) as items
    from grouped_group_results
    group by event_id
  ),
  season_summary as (
    select
      count(*) filter (where verdict = 'correct')::integer as correct,
      count(*) filter (where verdict = 'incorrect')::integer as incorrect,
      count(*) filter (where verdict = 'missing')::integer as missing,
      count(*) filter (where verdict = 'excluded')::integer as excluded,
      count(distinct event_id) filter (where picked_fighter_slug is not null)::integer as events_entered
    from personal_bout_rows
  ),
  completed_events as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'event_id', event.event_id,
          'name', event.name,
          'subtitle', event.subtitle,
          'venue', event.venue,
          'location', event.location,
          'starts_at', event.starts_at,
          'season', event.season,
          'completed_at', event.completed_at,
          'record', jsonb_build_object(
            'correct', event.correct,
            'incorrect', event.incorrect,
            'missing', event.missing,
            'excluded', event.excluded
          ),
          'bouts', event.bouts,
          'group_results', coalesce(standing.items, '[]'::jsonb)
        )
        order by event.starts_at desc
      ),
      '[]'::jsonb
    ) as items
    from grouped_personal_events event
    left join event_group_results standing on standing.event_id = event.event_id
  )
  select jsonb_build_object(
    'season', p_season,
    'summary', jsonb_build_object(
      'correct', summary.correct,
      'incorrect', summary.incorrect,
      'missing', summary.missing,
      'excluded', summary.excluded,
      'events_entered', summary.events_entered
    ),
    'events', events.items
  )
  from season_summary summary
  cross join completed_events events;
$$;

revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;
