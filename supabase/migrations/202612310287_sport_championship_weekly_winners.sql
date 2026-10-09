-- Weekly overall champion replaces the separate Daily-win weekly title system.
-- Historical Daily titles/attempts stay untouched for auditability.
create or replace function private.sport_championship_week_projection(
  p_sport text,
  p_season integer,
  p_week_start date,
  p_week_end date
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
  if p_season is null or p_season not between 2026 and 2100 then
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
      and starts_at >= (p_week_start::timestamp at time zone 'America/Chicago')
      and starts_at < ((p_week_end + 1)::timestamp at time zone 'America/Chicago')
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
      and history.central_day >= greatest(v_daily_start, p_week_start)
      and history.central_day <= p_week_end
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
      and week.week_start >= greatest(v_daily_start, p_week_start)
      and week.week_start <= p_week_end
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
    -- The weekly field is the full season Championship cohort. Someone who
    -- misses a week receives last-place points rather than disappearing.
    select pick.profile_id
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    where event.sport = v_pick_sport and event.season = p_season and event.status = 'complete'
    union
    select history.profile_id
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule on schedule.version = history.schedule_version
    where schedule.sport = p_sport
      and history.central_day between v_daily_start and v_season_end - 1
    union
    select result.profile_id
    from private.football_weekly_auction_results result
    join private.football_weekly_auction_weeks week on week.week_start = result.week_start
    where p_sport = 'football'
      and week.finalized_at is not null
      and week.week_start between v_daily_start and v_season_end - 1
      and result.final_score is not null
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
      rank() over (
        partition by result.week_start order by result.final_rank
      )::integer as placement
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
      case
        when pick_events > 0 then case when daily_events + featured_events > 0 then 60 else 100 end
        else 0 end as picks_weight,
      case
        when daily_events = 0 then 0
        when pick_events = 0 and featured_events = 0 then 100
        when pick_events = 0 then 75
        when featured_events = 0 then 40
        else 30 end as daily_weight,
      case
        when featured_events = 0 then 0
        when pick_events = 0 and daily_events = 0 then 100
        when pick_events = 0 then 25
        when daily_events = 0 then 40
        else 10 end as featured_weight,
      pick_events, daily_events, featured_events
    from counts
  ),
  scored as (
    select member.profile_id, member.display_name, member.initials,
      coalesce(picks.average_points, 0) as picks_rating,
      coalesce(daily.average_points, 0) as daily_rating,
      coalesce(featured.average_points, 0) as featured_rating,
      round(
        (
          coalesce(daily.average_points, 0) * weight.daily_weight
          + coalesce(featured.average_points, 0) * weight.featured_weight
        ) / nullif(weight.daily_weight + weight.featured_weight, 0), 2
      ) as play_rating,
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
      row_number() over (
        order by championship_rating desc, picks_rating desc, play_rating desc nulls last,
        (picks_played + daily_played + featured_played) desc, profile_id
      )::integer as overall_rank,
      rank() over (order by picks_rating desc)::integer as picks_rank,
      rank() over (order by daily_rating desc)::integer as daily_rank,
      rank() over (order by play_rating desc)::integer as play_rank,
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
      'play_rating', play_rating,
      'picks_rank', picks_rank,
      'daily_rank', daily_rank,
      'featured_rank', featured_rank,
      'play_rank', play_rank,
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

-- Completed weekly championship uses exactly the season's placement ladder.
-- Weekly title history is retained in the old schema but not used for new banners.
create or replace function public.get_sport_championship_weekly(
  p_sport text,
  p_season integer default 2026
) returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'America/Chicago')::date;
  v_first date;
  v_latest_start date;
  v_week date;
  v_projection jsonb;
  v_weeks jsonb := '[]'::jsonb;
  v_row jsonb;
  v_counts jsonb;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;
  if p_sport is null or p_sport not in ('football', 'ufc') then
    raise exception 'unsupported sport'; end if;
  if p_season is null or p_season not between 2026 and 2100 then
    raise exception 'invalid season'; end if;

  v_first := case
    when p_sport = 'football' and p_season = 2026 then date '2026-09-15'
    when p_sport = 'ufc' and p_season = 2026 then date '2026-08-10'
    when p_sport = 'football' then (date_trunc('week', make_date(p_season,1,1)::timestamp - interval '1 day') + interval '1 day')::date
    else date_trunc('week', make_date(p_season,1,1)::timestamp)::date
  end;
  v_latest_start := case
    when p_sport = 'football'
      then (date_trunc('week', v_today::timestamp - interval '1 day') + interval '1 day')::date - 7
    else date_trunc('week', v_today::timestamp)::date - 7
  end;
  v_latest_start := least(v_latest_start, make_date(p_season + 1,1,1)-7);
  if v_latest_start < v_first then
    return jsonb_build_object('sport',p_sport,'season',p_season,'latest',null,'weeks',v_weeks);
  end if;

  for v_week in
    select gs::date from generate_series(v_latest_start::timestamp, v_first::timestamp, interval '-7 days') gs
    limit 54
  loop
    v_projection := private.sport_championship_week_projection(p_sport,p_season,v_week,v_week+6);
    v_counts := v_projection -> 'event_counts';
    if coalesce((v_counts->>'picks')::integer,0)
      + coalesce((v_counts->>'daily')::integer,0)
      + coalesce((v_counts->>'featured')::integer,0) > 0
      and jsonb_array_length(v_projection->'entries') > 0 then
      v_row := jsonb_build_object(
        'week_start',v_week,'week_end',v_week+6,
        'winner',(v_projection->'entries')->0,
        'entries',v_projection->'entries',
        'weights',v_projection->'weights',
        'event_counts',v_counts
      );
      v_weeks := v_weeks || jsonb_build_array(v_row);
    end if;
  end loop;
  return jsonb_build_object(
    'sport',p_sport,
    'season',p_season,
    'latest',case when jsonb_array_length(v_weeks)>0 then v_weeks->0 else null end,
    'weeks',v_weeks
  );
end;
$$;

revoke all on function private.sport_championship_week_projection(text,integer,date,date) from public,anon,authenticated;
revoke all on function public.get_sport_championship_weekly(text,integer) from public,anon;
grant execute on function public.get_sport_championship_weekly(text,integer) to authenticated;
comment on function public.get_sport_championship_weekly(text,integer) is
  'Weekly Football/UFC overall Championship winners based on 60 Picks / 30 Daily / 10 Featured when present; unused lanes redistributed among actual competitions. Uses season population and deterministic winner tiebreak.';
notify pgrst,'reload schema';
