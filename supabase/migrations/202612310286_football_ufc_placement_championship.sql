-- 2026 Football / UFC all-sport Championship: 60% Picks, 30% Daily, 10% Featured.
-- Independent of weekly-title/trophy RPCs and existing Picks season standings.
-- In a sport with no finalized Featured results yet, its 10% is temporarily
-- allocated to Daily (60% Picks / 40% Daily); no phantom Featured scores.
--
-- Missing a completed event is LAST PLACE in the active sport cohort, not zero.
-- A never-entered player does not join the cohort; reserved test users are excluded.
-- A tied played result shares its official placement; no synthetic win is awarded.

create or replace function private.sport_championship_placement_points(p_place integer)
returns numeric
language sql immutable strict
set search_path = ''
as $$
  select case
    when p_place <= 1 then 100
    when p_place = 2 then 92
    when p_place = 3 then 85
    when p_place = 4 then 79
    when p_place = 5 then 74
    when p_place = 6 then 70
    else greatest(30, 70 - 4 * (p_place - 6))
  end::numeric;
$$;

create or replace function public.get_sport_championship(
  p_sport text,
  p_season integer default 2026
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_pick_sport text;
  v_daily_start date;
  v_season_end date;
  v_result jsonb;
begin
  if v_viewer is null then
    raise exception 'sign in required';
  end if;
  if p_sport not in ('football', 'ufc') or p_sport is null then
    raise exception 'unsupported Championship sport: %', p_sport;
  end if;
  if p_season not between 2026 and 2100 then
    raise exception 'invalid Championship season: %', p_season;
  end if;

  v_pick_sport := case when p_sport = 'ufc' then 'mma' else 'football' end;
  v_daily_start := case
    when p_season = 2026 and p_sport = 'football' then date '2026-09-15'
    when p_season = 2026 and p_sport = 'ufc' then date '2026-08-10'
    else make_date(p_season, 1, 1)
  end;
  v_season_end := make_date(p_season + 1, 1, 1);

  with
  pick_events as (
    select event_id, starts_at
    from public.pick_events
    where sport = v_pick_sport and season = p_season and status = 'complete'
  ),
  daily_history as (
    select history.profile_id, history.daily_challenge_id,
           history.central_day, history.game_type,
           history.normalized_score,
           private.daily_challenge_hit_number_distance(
             history.game_type, history.public_result
           ) as hit_number_distance
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where schedule.sport = p_sport
      and history.central_day >= v_daily_start
      and history.central_day < v_season_end
  ),
  daily_events as (
    select distinct daily_challenge_id from daily_history
  ),
  -- The canonical completed Football Featured results can represent successive
  -- formats (CFB team-seasons, NFL Build a QB, etc.). Never subject-key filter.
  featured_events as (
    select week.week_start
    from private.football_weekly_auction_weeks week
    where p_sport = 'football'
      and week.finalized_at is not null
      and week.week_start >= v_daily_start
      and week.week_start < v_season_end
      and exists (
        select 1 from private.football_weekly_auction_results result
        where result.week_start = week.week_start
          and result.final_rank is not null
          and result.final_score is not null
          and not private.football_weekly_auction_is_reserved_test_profile(result.profile_id)
      )
  ),
  -- Only genuine participants are in the Championship field; use the same
  -- eligible field for all three lanes, even on a day some players miss.
  active_profiles as (
    select pick.profile_id
    from public.profile_event_picks pick
    join pick_events event on event.event_id = pick.event_id
    union
    select history.profile_id from daily_history history
    union
    select result.profile_id
    from private.football_weekly_auction_results result
    join featured_events event on event.week_start = result.week_start
    where result.final_score is not null
  ),
  field as (
    select profile.id as profile_id, profile.display_name, profile.initials
    from public.profiles profile
    join active_profiles active on active.profile_id = profile.id
    where not private.football_weekly_auction_is_reserved_test_profile(profile.id)
  ),
  field_count as (
    select count(*)::integer as members from field
  ),
  -- Only players who submitted picks are ranked for the event. A completely
  -- missed card receives the cohort's last-place finish, never zero points.
  pick_entrants as (
    select distinct pick.event_id, pick.profile_id
    from public.profile_event_picks pick
    join pick_events event on event.event_id = pick.event_id
    join field member on member.profile_id = pick.profile_id
  ),
  pick_scores as (
    select entrant.event_id, entrant.profile_id,
      count(*) filter (
        where bout.included_in_picks
          and (
            (p_sport = 'football'
              and selection.fighter_slug is not null
              and public.football_pick_ats_points(
                selection.fighter_slug = bout.home_team_slug,
                bout.home_final_score, bout.away_final_score,
                bout.frozen_spread_home, false
              ) > 0.5)
            or (p_sport = 'ufc'
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug)
          )
      )::integer as correct,
      case when p_sport = 'football' then
        coalesce(sum(
          case when bout.included_in_picks
            and bout.result_status <> 'cancelled'
            and selection.fighter_slug is not null
          then public.football_pick_ats_points(
            selection.fighter_slug = bout.home_team_slug,
            bout.home_final_score, bout.away_final_score,
            bout.frozen_spread_home, selection.is_lock
          ) else 0 end
        ), 0)::numeric
      else
        (
          4 * count(*) filter (
            where bout.included_in_picks
              and bout.result_status in ('red_win','blue_win')
              and selection.fighter_slug = bout.winner_fighter_slug
          )
          + coalesce(max(public.pick_underdog_bonus(lock.frozen_american_odds))
            filter (
              where bout.included_in_picks
                and lock.fighter_slug = bout.winner_fighter_slug
            ), 0)
        )::numeric
      end as scored_points
    from pick_entrants entrant
    join public.pick_bouts bout on bout.event_id = entrant.event_id
    left join public.profile_event_picks selection
      on selection.profile_id = entrant.profile_id
      and selection.event_id = entrant.event_id
      and selection.bout_id = bout.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = entrant.profile_id
      and lock.event_id = entrant.event_id
      and lock.bout_id = bout.bout_id
    group by entrant.event_id, entrant.profile_id
  ),
  pick_ranks as (
    select profile_id, event_id,
      rank() over (partition by event_id
        order by scored_points desc, correct desc)::integer as placement
    from pick_scores
  ),
  daily_ranks as (
    select profile_id, daily_challenge_id,
      rank() over (
        partition by daily_challenge_id
        order by normalized_score desc,
          case when game_type = 'hit_the_number'
            then hit_number_distance else null end asc nulls last
      )::integer as placement
    from daily_history
    where profile_id in (select profile_id from field)
  ),
  featured_ranks as (
    select result.profile_id, result.week_start,
      result.final_rank as placement
    from private.football_weekly_auction_results result
    join featured_events event on event.week_start = result.week_start
    join field member on member.profile_id = result.profile_id
    where result.final_score is not null and result.final_rank is not null
  ),
  pick_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join pick_events event
    left join pick_ranks rank
      on rank.profile_id = member.profile_id and rank.event_id = event.event_id
    group by member.profile_id
  ),
  daily_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join daily_events event
    left join daily_ranks rank
      on rank.profile_id = member.profile_id
      and rank.daily_challenge_id = event.daily_challenge_id
    group by member.profile_id
  ),
  featured_totals as (
    select member.profile_id,
      count(*)::integer as events,
      count(rank.placement)::integer as played,
      coalesce(avg(private.sport_championship_placement_points(
        coalesce(rank.placement, field_count.members)
      )), 0)::numeric as average_points
    from field member
    cross join field_count
    cross join featured_events event
    left join featured_ranks rank
      on rank.profile_id = member.profile_id
      and rank.week_start = event.week_start
    group by member.profile_id
  ),
  counts as (
    select (select count(*)::integer from pick_events) as pick_events,
      (select count(*)::integer from daily_events) as daily_events,
      (select count(*)::integer from featured_events) as featured_events
  ),
  weights as (
    select
      case when pick_events > 0 then 60 else 0 end as picks_weight,
      case when daily_events > 0
        then case when featured_events > 0 then 30 else 40 end
        else 0 end as daily_weight,
      case when featured_events > 0 then
        case when daily_events > 0 then 10 else 40 end
        else 0 end as featured_weight,
      pick_events, daily_events, featured_events
    from counts
  ),
  scored as (
    select member.profile_id, member.display_name, member.initials,
      coalesce(picks.average_points, 0) as picks_rating,
      coalesce(daily.average_points, 0) as daily_rating,
      coalesce(featured.average_points, 0) as featured_rating,
      coalesce(picks.played, 0) as picks_played,
      coalesce(daily.played, 0) as daily_played,
      coalesce(featured.played, 0) as featured_played,
      round(
        (
          coalesce(picks.average_points, 0) * weight.picks_weight
          + coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(
          weight.picks_weight + weight.daily_weight + weight.featured_weight, 0
        ), 2
      ) as championship_rating
    from field member
    cross join weights weight
    left join pick_totals picks on picks.profile_id = member.profile_id
    left join daily_totals daily on daily.profile_id = member.profile_id
    left join featured_totals featured on featured.profile_id = member.profile_id
  ),
  ranked as (
    select scored.*,
      rank() over (order by championship_rating desc)::integer as overall_rank,
      rank() over (order by picks_rating desc)::integer as picks_rank,
      rank() over (order by daily_rating desc)::integer as daily_rank,
      rank() over (order by featured_rating desc)::integer as featured_rank
    from scored
  ),
  payload as (
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id', profile_id,
      'display_name', display_name,
      'initials', initials,
      'is_current_user', profile_id = v_viewer,
      'rank', overall_rank,
      'rating', championship_rating,
      'picks_rating', round(picks_rating, 2),
      'daily_rating', round(daily_rating, 2),
      'featured_rating', round(featured_rating, 2),
      'picks_rank', picks_rank,
      'daily_rank', daily_rank,
      'featured_rank', featured_rank,
      'picks_played', picks_played,
      'daily_played', daily_played,
      'featured_played', featured_played
    ) order by overall_rank, display_name, profile_id), '[]'::jsonb) as entries
    from ranked
  )
  select jsonb_build_object(
    'sport', p_sport,
    'season', p_season,
    'field_size', (select members from field_count),
    'weights', jsonb_build_object(
      'picks', weights.picks_weight,
      'daily', weights.daily_weight,
      'featured', weights.featured_weight
    ),
    'event_counts', jsonb_build_object(
      'picks', weights.pick_events,
      'daily', weights.daily_events,
      'featured', weights.featured_events
    ),
    'entries', payload.entries,
    'own', (
      select value from jsonb_array_elements(payload.entries) as value
      where value ->> 'profile_id' = v_viewer::text
      limit 1
    )
  ) into v_result
  from payload cross join weights;

  return v_result;
end;
$$;

revoke all on function private.sport_championship_placement_points(integer)
  from public, anon, authenticated;
revoke all on function public.get_sport_championship(text, integer)
  from public, anon;
grant execute on function public.get_sport_championship(text, integer)
  to authenticated;

comment on function public.get_sport_championship(text, integer) is
  'Football/UFC placement Championship: 60 Picks, 30 Daily, 10 Featured; inactive Featured weight rolls to Daily. Missing events earn active-cohort last-place points. Weekly titles remain untouched.';

notify pgrst, 'reload schema';
