-- Add canonical season-level group standings to the existing authenticated Picks history projection.
-- Event scoring, Underdog Lock bonuses, exclusions, and membership remain owned by the existing tables and helpers.
create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
with personal_bouts as (
  select
    event.*,
    bout.bout_id,
    bout.position,
    bout.weight_class,
    bout.red_fighter_slug,
    bout.red_fighter_name,
    bout.blue_fighter_slug,
    bout.blue_fighter_name,
    bout.result_status,
    bout.winner_fighter_slug,
    bout.included_in_picks,
    pick.fighter_slug picked_fighter_slug,
    case
      when not bout.included_in_picks then 'excluded'
      when bout.result_status in ('draw','no_contest','cancelled') then 'excluded'
      when bout.result_status = 'pending' then 'pending'
      when pick.fighter_slug is null then 'missing'
      when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
      else 'incorrect'
    end verdict
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
personal_events as (
  select
    b.event_id,
    b.name,
    b.subtitle,
    b.venue,
    b.location,
    b.starts_at,
    b.season,
    b.completed_at,
    count(*) filter (where verdict = 'correct')::integer correct,
    count(*) filter (where verdict = 'incorrect')::integer incorrect,
    count(*) filter (where verdict = 'missing')::integer missing,
    count(*) filter (where verdict = 'excluded')::integer excluded,
    (4 * count(*) filter (where verdict = 'correct'))::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
      where b.included_in_picks
        and lock.bout_id = b.bout_id
        and lock.fighter_slug = b.winner_fighter_slug
    ), 0)::integer lock_bonus,
    bool_or(b.included_in_picks and b.picked_fighter_slug is not null) entered,
    case
      when lock.event_id is null then null
      else jsonb_build_object(
        'event_id', lock.event_id,
        'bout_id', lock.bout_id,
        'fighter_slug', lock.fighter_slug,
        'selected_at', lock.selected_at,
        'frozen_american_odds', lock.frozen_american_odds
      )
    end underdog_lock,
    jsonb_agg(jsonb_build_object(
      'bout_id', b.bout_id,
      'position', b.position,
      'weight_class', b.weight_class,
      'red_fighter_slug', b.red_fighter_slug,
      'red_fighter_name', b.red_fighter_name,
      'blue_fighter_slug', b.blue_fighter_slug,
      'blue_fighter_name', b.blue_fighter_name,
      'result_status', b.result_status,
      'winner_fighter_slug', b.winner_fighter_slug,
      'picked_fighter_slug', b.picked_fighter_slug,
      'verdict', b.verdict,
      'included_in_picks', b.included_in_picks,
      'group_picks', public.resolved_bout_group_picks(b.event_id,b.bout_id)
    ) order by b.position) bouts
  from personal_bouts b
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = auth.uid()
   and lock.event_id = b.event_id
  group by
    b.event_id,
    b.name,
    b.subtitle,
    b.venue,
    b.location,
    b.starts_at,
    b.season,
    b.completed_at,
    lock.event_id,
    lock.bout_id,
    lock.fighter_slug,
    lock.selected_at,
    lock.frozen_american_odds
),
entrants as (
  select distinct pick.event_id, pick.profile_id
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  where event.status = 'complete'
    and (p_season is null or event.season = p_season)
),
group_scores as (
  select
    entrant.event_id,
    entrant.profile_id,
    profile.display_name,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug = bout.winner_fighter_slug
    )::integer correct,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug is not null
        and pick.fighter_slug <> bout.winner_fighter_slug
    )::integer incorrect,
    count(*) filter (
      where bout.included_in_picks
        and bout.result_status in ('red_win','blue_win')
        and pick.fighter_slug is null
    )::integer missing,
    count(*) filter (
      where not bout.included_in_picks
        or bout.result_status in ('draw','no_contest','cancelled')
    )::integer excluded,
    (
      4 * count(*) filter (
        where bout.included_in_picks
          and bout.result_status in ('red_win','blue_win')
          and pick.fighter_slug = bout.winner_fighter_slug
      )
    )::integer base_points,
    coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds)) filter (
      where bout.included_in_picks
        and lock.fighter_slug = bout.winner_fighter_slug
    ), 0)::integer lock_bonus
  from entrants entrant
  join public.profiles profile on profile.id = entrant.profile_id
  join public.pick_bouts bout on bout.event_id = entrant.event_id
  left join public.profile_event_picks pick
    on pick.profile_id = entrant.profile_id
   and pick.event_id = entrant.event_id
   and pick.bout_id = bout.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = entrant.profile_id
   and lock.event_id = entrant.event_id
   and lock.bout_id = bout.bout_id
  group by entrant.event_id, entrant.profile_id, profile.display_name
),
ranked as (
  select
    *,
    base_points + lock_bonus total_points,
    rank() over (
      partition by event_id
      order by base_points + lock_bonus desc, correct desc
    )::integer rank
  from group_scores
),
event_standings as (
  select
    event_id,
    jsonb_agg(jsonb_build_object(
      'rank', rank,
      'profile_id', profile_id,
      'display_name', display_name,
      'correct', correct,
      'incorrect', incorrect,
      'missing', missing,
      'excluded', excluded,
      'base_points', base_points,
      'lock_bonus', lock_bonus,
      'total_points', total_points,
      'is_current_user', profile_id = auth.uid()
    ) order by rank, display_name) items
  from ranked
  group by event_id
),
season_scores as (
  select
    profile_id,
    display_name,
    count(*)::integer events_entered,
    coalesce(sum(correct), 0)::integer correct,
    coalesce(sum(incorrect), 0)::integer incorrect,
    coalesce(sum(missing), 0)::integer missing,
    coalesce(sum(excluded), 0)::integer excluded,
    coalesce(sum(base_points), 0)::integer base_points,
    coalesce(sum(lock_bonus), 0)::integer lock_bonus
  from group_scores
  group by profile_id, display_name
),
season_ranked as (
  select
    *,
    base_points + lock_bonus total_points,
    rank() over (order by base_points + lock_bonus desc)::integer rank
  from season_scores
),
season_standings as (
  select coalesce(jsonb_agg(jsonb_build_object(
    'rank', rank,
    'profile_id', profile_id,
    'display_name', display_name,
    'correct', correct,
    'incorrect', incorrect,
    'missing', missing,
    'excluded', excluded,
    'events_entered', events_entered,
    'base_points', base_points,
    'lock_bonus', lock_bonus,
    'total_points', total_points,
    'is_current_user', profile_id = auth.uid()
  ) order by rank, display_name), '[]'::jsonb) items
  from season_ranked
),
season as (
  select
    coalesce(sum(correct), 0)::integer correct,
    coalesce(sum(incorrect), 0)::integer incorrect,
    coalesce(sum(missing), 0)::integer missing,
    coalesce(sum(excluded), 0)::integer excluded,
    count(*) filter (where entered)::integer events_entered,
    coalesce(sum(base_points), 0)::integer base_points,
    coalesce(sum(lock_bonus), 0)::integer lock_bonus
  from personal_events
),
events as (
  select coalesce(jsonb_agg(jsonb_build_object(
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
      'excluded', event.excluded,
      'base_points', event.base_points,
      'lock_bonus', event.lock_bonus,
      'total_points', event.base_points + event.lock_bonus
    ),
    'underdog_lock', event.underdog_lock,
    'bouts', event.bouts,
    'group_results', coalesce(standing.items, '[]'::jsonb)
  ) order by event.starts_at desc), '[]'::jsonb) items
  from personal_events event
  left join event_standings standing on standing.event_id = event.event_id
)
select jsonb_build_object(
  'season', p_season,
  'summary', jsonb_build_object(
    'correct', season.correct,
    'incorrect', season.incorrect,
    'missing', season.missing,
    'excluded', season.excluded,
    'events_entered', season.events_entered,
    'base_points', season.base_points,
    'lock_bonus', season.lock_bonus,
    'total_points', season.base_points + season.lock_bonus
  ),
  'season_standings', standings.items,
  'events', events.items
)
from season
cross join season_standings standings
cross join events;
$$;

revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;

notify pgrst, 'reload schema';
