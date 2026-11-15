-- UFC owner manual override: allow all included nine bouts to accept selections,
-- even once ESPN has marked them live/final, without altering the canonical
-- result, odds or card locking. Late picks remain timestamped for audit.
-- Ordinary UFC events and all Football events keep their existing lock rules.
create or replace function private.pick_bout_player_submission_open(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $function$
  select case
    when p_event.sport = 'mma'
      and p_event.status = 'upcoming'
      and p_event.manual_picks_open
      and p_bout.included_in_picks
      and coalesce(p_bout.result_status, 'pending') <> 'cancelled'
    then true
    else not private.pick_bout_is_locked(p_event, p_bout, p_now)
  end;
$function$;

revoke all on function private.pick_bout_player_submission_open(
  public.pick_events, public.pick_bouts, timestamptz
) from public, anon, authenticated;

-- save_my_event_pick: player selection scope; authoritative official results unchanged.
CREATE OR REPLACE FUNCTION public.save_my_event_pick(p_event_id text, p_bout_id text, p_fighter_slug text, p_is_lock boolean DEFAULT false)
 RETURNS profile_event_picks
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_existing public.profile_event_picks;
  v_slug text := lower(trim(p_fighter_slug));
  v_is_lock boolean := coalesce(p_is_lock, false);
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then raise exception 'sign in required'; end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for share;
  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;
  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;
  if v_is_lock and v_event.sport <> 'football' then
    raise exception 'football locks are only available for football picks';
  end if;

  select * into v_existing
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;

  if not private.pick_bout_player_submission_open(v_event, v_bout) then
    if found
      and v_existing.fighter_slug = v_slug
      and v_existing.is_lock = v_is_lock then
      return v_existing;
    end if;
    raise exception 'pick is locked for this fight';
  end if;

  insert into public.profile_event_picks(
    profile_id,event_id,bout_id,fighter_slug,is_lock,picked_at,updated_at
  )
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_slug,v_is_lock,now(),now())
  on conflict (profile_id,event_id,bout_id) do update
    set fighter_slug = excluded.fighter_slug,
        is_lock = excluded.is_lock,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$function$;

-- set_my_event_underdog_lock: player selection scope; authoritative official results unchanged.
CREATE OR REPLACE FUNCTION public.set_my_event_underdog_lock(p_event_id text, p_bout_id text, p_fighter_slug text)
 RETURNS profile_event_underdog_locks
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_pick public.profile_event_picks;
  v_odds integer;
  v_row public.profile_event_underdog_locks;
begin
  if v_profile_id is null then raise exception 'authentication required'; end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for share;
  if not found then raise exception 'bout not found'; end if;
  if not private.pick_bout_player_submission_open(v_event, v_bout) then
    raise exception 'underdog lock is closed for this fight';
  end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;

  select * into v_pick
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;
  if not found or v_pick.fighter_slug <> lower(trim(p_fighter_slug)) then
    raise exception 'underdog lock must match your current pick';
  end if;

  v_odds := case v_pick.fighter_slug
    when v_bout.red_fighter_slug then v_bout.red_american_odds
    when v_bout.blue_fighter_slug then v_bout.blue_american_odds
  end;
  if v_odds is null or v_odds < 100 then
    raise exception 'underdog lock requires positive American odds';
  end if;

  insert into public.profile_event_underdog_locks(
    profile_id,event_id,bout_id,fighter_slug,selected_at
  )
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_pick.fighter_slug,now())
  on conflict(profile_id,event_id) do update set
    bout_id = excluded.bout_id,
    fighter_slug = excluded.fighter_slug,
    selected_at = now(),
    frozen_american_odds = null,
    frozen_at = null
  returning * into v_row;

  return v_row;
end;
$function$;

-- clear_my_event_underdog_lock: player selection scope; authoritative official results unchanged.
CREATE OR REPLACE FUNCTION public.clear_my_event_underdog_lock(p_event_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_lock public.profile_event_underdog_locks;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  select * into v_lock
  from public.profile_event_underdog_locks
  where profile_id = auth.uid()
    and event_id = lower(trim(p_event_id));
  if not found then return; end if;

  select * into v_event
  from public.pick_events
  where event_id = v_lock.event_id
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_lock.event_id
    and bout_id = v_lock.bout_id
  for share;
  if not found then raise exception 'bout not found'; end if;
  if not private.pick_bout_player_submission_open(v_event, v_bout) then
    raise exception 'underdog lock is closed for this fight';
  end if;

  delete from public.profile_event_underdog_locks
  where profile_id = auth.uid()
    and event_id = v_lock.event_id;
end;
$function$;

-- get_current_pick_event: player selection scope; authoritative official results unchanged.
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
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_status', bout.result_status,
        'result_recorded_at', bout.result_recorded_at,
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

-- resolved_bout_group_picks: player selection scope; authoritative official results unchanged.
CREATE OR REPLACE FUNCTION public.resolved_bout_group_picks(p_event_id text, p_bout_id text)
 RETURNS jsonb
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  select case
    when auth.uid() is null
      or not exists (
        select 1 from public.profiles viewer where viewer.id = auth.uid()
      )
      or (
        event.manual_picks_open
        and private.pick_bout_player_submission_open(event, bout)
      )
      or (
        event.status not in ('locked', 'complete')
        and now() < coalesce(bout.locks_at, event.locks_at)
        and (
          bout.result_status = 'pending'
          or bout.result_status = 'cancelled'
        )
      )
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'display_name', profile.display_name,
          'picked_fighter_slug', pick.fighter_slug,
          'is_current_user', entrant.profile_id = auth.uid(),
          'is_lock', coalesce(pick.is_lock, false)
        )
        order by profile.display_name
      )
      from (
        select distinct event_pick.profile_id
        from public.profile_event_picks event_pick
        where event_pick.event_id = bout.event_id
      ) entrant
      join public.profiles profile on profile.id = entrant.profile_id
      left join public.profile_event_picks pick
        on pick.profile_id = entrant.profile_id
       and pick.event_id = bout.event_id
       and pick.bout_id = bout.bout_id
    ), '[]'::jsonb)
  end
  from public.pick_bouts bout
  join public.pick_events event on event.event_id = bout.event_id
  where bout.event_id = lower(trim(p_event_id))
    and bout.bout_id = lower(trim(p_bout_id));
$function$;

-- get_event_pick_progress: player selection scope; authoritative official results unchanged.
CREATE OR REPLACE FUNCTION public.get_event_pick_progress(p_event_id text)
 RETURNS TABLE(profile_id uuid, display_name text, completed integer, total integer, has_underdog_lock boolean, underdog_lock_bout_id text, underdog_lock_fighter_slug text, is_current_user boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  with requested_event as (
    select event.*
    from public.pick_events event
    where event.event_id = lower(trim(p_event_id))
  ), eligible_bouts as (
    select bout.bout_id
    from public.pick_bouts bout
    join requested_event event on event.event_id = bout.event_id
    where coalesce(bout.included_in_picks, true)
      and coalesce(bout.result_status, 'pending') <> 'cancelled'
  ), totals as (
    select count(*)::integer total from eligible_bouts
  )
  select
    profile.id profile_id,
    profile.display_name,
    count(pick.bout_id) filter (where eligible.bout_id is not null)::integer completed,
    totals.total,
    count(lock.bout_id) > 0 has_underdog_lock,
    case
      when coalesce(bool_or(
        lock_bout.bout_id is not null
        and not private.pick_bout_player_submission_open(event, lock_bout)
      ), false)
      then max(lock.bout_id)
      else null
    end underdog_lock_bout_id,
    case
      when coalesce(bool_or(
        lock_bout.bout_id is not null
        and not private.pick_bout_player_submission_open(event, lock_bout)
      ), false)
      then max(lock.fighter_slug)
      else null
    end underdog_lock_fighter_slug,
    profile.id = auth.uid() is_current_user
  from public.profiles profile
  cross join requested_event event
  cross join totals
  left join public.profile_event_picks pick
    on pick.profile_id = profile.id
   and pick.event_id = event.event_id
  left join eligible_bouts eligible on eligible.bout_id = pick.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = profile.id
   and lock.event_id = event.event_id
  left join public.pick_bouts lock_bout
    on lock_bout.event_id = lock.event_id
   and lock_bout.bout_id = lock.bout_id
  where auth.uid() is not null
    and exists (
      select 1 from public.profiles viewer where viewer.id = auth.uid()
    )
  group by profile.id, profile.display_name, totals.total
  order by
    case when profile.id = auth.uid() then 0 else 1 end,
    completed desc,
    profile.display_name;
$function$;

notify pgrst, 'reload schema';
