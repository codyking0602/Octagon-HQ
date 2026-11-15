-- UFC Picks spoiler protection: while the owner keeps all fights manually
-- open, never show recorded winners or live points on member-facing endpoints.
-- Canonical official results and timestamps stay in the private authoritative tables.
-- The owner control and ESPN monitoring remain unaffected.
CREATE OR REPLACE FUNCTION public.get_current_pick_event(p_sport text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with selected_event as (
    select event.*, event as event_row
    from public.pick_events event
    where event.status in ('upcoming', 'locked')
      and event.sport = case lower(trim(p_sport))
        when 'mma' then 'mma'
        when 'football' then 'football'
        else null
      end
    order by event.starts_at
    limit 1
  )
  select jsonb_build_object(
    'event_id', event.event_id,
    'sport', event.sport,
    'league', event.league,
    'event_kind', event.event_kind,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case
      when event.status = 'locked' then 'locked'
      when not exists (
        select 1
        from public.pick_bouts open_bout
        where open_bout.event_id = event.event_id
          and open_bout.included_in_picks
          and private.pick_bout_player_submission_open(event.event_row, open_bout)
      ) then 'locked'
      else 'upcoming'
    end,
    'can_control', public.is_pick_control_owner(auth.uid()),
    'header_storage_path', event.header_storage_path,
    'header_natural_width', event.header_natural_width,
    'header_natural_height', event.header_natural_height,
    'spotlights', coalesce((
      select jsonb_agg(spotlight.value order by spotlight.ordinality)
      from jsonb_array_elements(coalesce(event.spotlights, '[]'::jsonb))
        with ordinality as spotlight(value, ordinality)
      where private.pick_event_spotlight_is_valid(event.event_id, jsonb_build_array(spotlight.value))
    ), '[]'::jsonb),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'locks_at', coalesce(bout.locks_at, event.locks_at),
        'is_locked', not private.pick_bout_player_submission_open(event.event_row, bout),
        'position', bout.position,
        'card_segment', bout.card_segment,
        'segment_sequence', bout.segment_sequence,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'home_team_slug', bout.home_team_slug,
        'away_team_slug', bout.away_team_slug,
        'home_team_logo_url', home_asset.logo_url,
        'away_team_logo_url', away_asset.logo_url,
        'frozen_spread_home', bout.frozen_spread_home,
        'spread_source', bout.spread_source,
        'spread_frozen_at', bout.spread_frozen_at,
        'home_final_score', bout.home_final_score,
        'away_final_score', bout.away_final_score,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds,
        'odds_source', bout.odds_source,
        'odds_updated_at', bout.odds_updated_at,
        'winner_fighter_slug', case
          when event.sport = 'mma' and event.manual_picks_open
          then null
          else bout.winner_fighter_slug
        end,
        'result_status', case
          when event.sport = 'mma' and event.manual_picks_open
            and bout.result_status <> 'cancelled'
          then 'pending'
          else bout.result_status
        end,
        'result_recorded_at', case
          when event.sport = 'mma' and event.manual_picks_open
          then null
          else bout.result_recorded_at
        end,
        'included_in_picks', bout.included_in_picks,
        'repick_required', bout.included_in_picks
          and auth.uid() is not null
          and not exists (
            select 1 from public.profile_event_picks current_pick
            where current_pick.profile_id = auth.uid()
              and current_pick.event_id = bout.event_id
              and current_pick.bout_id = bout.bout_id
          )
          and exists (
            select 1
            from public.pick_card_change_actions action,
              jsonb_array_elements(action.before_state->'invalidated_picks') evidence
            where action.event_id = bout.event_id
              and action.bout_id = bout.bout_id
              and action.action_type = 'replace_fighter'
              and evidence->>'profile_id' = auth.uid()::text
          ),
        'group_picks', public.resolved_bout_group_picks(bout.event_id, bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      left join public.football_team_assets home_asset on home_asset.team_slug = bout.home_team_slug
      left join public.football_team_assets away_asset on away_asset.team_slug = bout.away_team_slug
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from selected_event event;
$function$;

-- Do not indirectly disclose results through current-season scoring totals
-- before the owner has closed the manually reopened UFC card.
CREATE OR REPLACE FUNCTION public.get_my_pick_summary(p_season integer DEFAULT NULL::integer, p_sport text DEFAULT 'mma'::text)
 RETURNS TABLE(correct integer, incorrect integer, pending integer, events_entered integer, base_points numeric, lock_bonus numeric, total_points numeric)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  if p_sport not in ('mma','football') then
    raise exception 'unsupported Picks sport';
  end if;

  return query
  with scored as (
    select
      event.event_id,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug,
      lock.bout_id = pick.bout_id
        and lock.fighter_slug = pick.fighter_slug
        and lock.fighter_slug = bout.winner_fighter_slug as ufc_lock_won,
      lock.frozen_american_odds,
      case when p_sport = 'football' then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,
          bout.home_final_score,
          bout.away_final_score,
          bout.frozen_spread_home,
          false
        )
      end as football_base_points,
      case when p_sport = 'football' then
        public.football_pick_ats_points(
          pick.fighter_slug = bout.home_team_slug,
          bout.home_final_score,
          bout.away_final_score,
          bout.frozen_spread_home,
          pick.is_lock
        )
      end as football_points
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    join public.pick_bouts bout
      on bout.event_id = pick.event_id
     and bout.bout_id = pick.bout_id
    left join public.profile_event_underdog_locks lock
      on lock.profile_id = pick.profile_id
     and lock.event_id = pick.event_id
    where pick.profile_id = auth.uid()
      and event.sport = p_sport
      and not (event.sport = 'mma' and event.manual_picks_open)
      and bout.included_in_picks
      and (p_season is null or event.season = p_season)
  ),
  totals as (
    select
      case when p_sport = 'football' then
        count(*) filter (where football_base_points > 0.5)::integer
      else
        count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug = fighter_slug
        )::integer
      end as correct,
      case when p_sport = 'football' then
        count(*) filter (where football_base_points = 0)::integer
      else
        count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug <> fighter_slug
        )::integer
      end as incorrect,
      case when p_sport = 'football' then
        count(*) filter (where football_base_points is null and result_status <> 'cancelled')::integer
      else
        count(*) filter (where result_status = 'pending')::integer
      end as pending,
      count(distinct event_id)::integer as events_entered,
      case when p_sport = 'football' then
        coalesce(sum(football_base_points), 0)::numeric
      else
        (4 * count(*) filter (
          where result_status in ('red_win','blue_win')
            and winner_fighter_slug = fighter_slug
        ))::numeric
      end as base_points,
      case when p_sport = 'football' then
        coalesce(sum(football_points - football_base_points), 0)::numeric
      else
        coalesce(
          sum(public.pick_underdog_bonus(frozen_american_odds)) filter (where ufc_lock_won),
          0
        )::numeric
      end as lock_bonus
    from scored
  )
  select totals.correct, totals.incorrect, totals.pending, totals.events_entered,
    totals.base_points, totals.lock_bonus, totals.base_points + totals.lock_bonus
  from totals;
end;
$function$;

-- Public table reads otherwise bypass the safe member-facing projection.
-- Hide manually open UFC bouts from direct REST reads; the security-definer
-- Picks projection still returns full matchup/odds data with masked outcomes.
alter policy pick_bouts_public_read on public.pick_bouts
  using (
    not exists (
      select 1
      from public.pick_events event
      where event.event_id = pick_bouts.event_id
        and event.sport = 'mma'
        and event.manual_picks_open
    )
  );

notify pgrst, 'reload schema';
