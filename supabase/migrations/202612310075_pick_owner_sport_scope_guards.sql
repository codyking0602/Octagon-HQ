-- Football Picks can now publish beside UFC. Keep every legacy zero-argument
-- UFC owner/read path explicitly MMA-scoped so Football cannot become the
-- accidental current card for UFC setup, control, or monitoring.

create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select public.get_current_pick_event('mma');
$$;

create or replace function public.get_pick_control_event(p_event_id text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_requested_event_id text := nullif(lower(trim(p_event_id)), '');
  v_target_event_id text;
  v_target_sport text;
  v_event jsonb;
  v_bouts jsonb;
  v_recent jsonb;
begin
  if v_requested_event_id is not null then
    v_target_event_id := v_requested_event_id;
  else
    select event.event_id
    into v_target_event_id
    from public.pick_events event
    where event.sport = 'mma'
      and event.status in ('upcoming', 'locked', 'complete')
    order by
      case when event.status in ('upcoming', 'locked') then 0 else 1 end,
      case when event.status = 'complete' then event.completed_at end desc nulls last,
      event.starts_at asc
    limit 1;
  end if;

  if v_target_event_id is null then return null; end if;

  select event.sport into v_target_sport
  from public.pick_events event
  where event.event_id = v_target_event_id;
  if not found then return null; end if;

  v_event := private.get_pick_control_event_live_state_core(v_target_event_id);
  if v_event is null then return null; end if;

  select coalesce(
    jsonb_agg(
      item.payload || jsonb_build_object(
        'live_status', bout.live_status,
        'live_status_provider', bout.live_status_provider
      )
      order by item.ordinality
    ),
    '[]'::jsonb
  )
  into v_bouts
  from jsonb_array_elements(coalesce(v_event->'bouts', '[]'::jsonb))
    with ordinality as item(payload, ordinality)
  join public.pick_bouts bout
    on bout.event_id = v_target_event_id
   and bout.bout_id = item.payload->>'bout_id';

  select coalesce(jsonb_agg(recent.item order by recent.completed_at desc), '[]'::jsonb)
  into v_recent
  from (
    select completed.completed_at,
      jsonb_build_object(
        'event_id', completed.event_id,
        'name', completed.name,
        'starts_at', completed.starts_at,
        'completed_at', completed.completed_at
      ) item
    from public.pick_events completed
    where completed.status = 'complete'
      and completed.sport = v_target_sport
    order by completed.completed_at desc
    limit 5
  ) recent;

  v_event := jsonb_set(v_event, '{bouts}', v_bouts, true);
  return jsonb_set(v_event, '{recent_completed_events}', v_recent, true);
end;
$$;

create or replace function private.get_pick_event_setup_import_segments_core()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select jsonb_build_object(
    'draft_id', draft.draft_id,
    'source', draft.source,
    'source_event_key', draft.source_event_key,
    'source_url', draft.source_url,
    'event_id', draft.event_id,
    'name', draft.name,
    'subtitle', draft.subtitle,
    'venue', draft.venue,
    'location', draft.location,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'season', draft.season,
    'state', draft.state,
    'synced_at', draft.synced_at,
    'updated_at', draft.updated_at,
    'warnings', to_jsonb(array_remove(array[
      case when draft.starts_at is null then 'MISSING EVENT START TIME' end,
      case when draft.locks_at is null then 'MISSING PICKS LOCK TIME' end,
      case when draft.locks_at is not null and draft.locks_at <= now() then 'PICKS LOCK TIME HAS PASSED' end,
      case when nullif(trim(draft.venue),'') is null then 'MISSING VENUE' end,
      case when nullif(trim(draft.location),'') is null then 'MISSING LOCATION' end,
      case when not exists (
        select 1 from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      ) then 'NO INCLUDED FIGHTS' end,
      case when (
        select count(*) from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      ) < 4 then 'CARD HAS FEWER THAN FOUR FIGHTS' end,
      case when exists (
        select 1 from public.pick_events event
        where event.sport = 'mma' and event.status = 'locked'
      ) then 'A LOCKED EVENT BLOCKS PUBLISHING' end,
      case when exists (
        select 1
        from public.pick_events event
        join public.profile_event_picks pick on pick.event_id = event.event_id
        where event.sport = 'mma' and event.status = 'upcoming'
      ) then 'THE CURRENT UPCOMING CARD ALREADY HAS PICKS' end
    ], null)),
    'can_publish', draft.state = 'staged'
      and draft.starts_at is not null
      and draft.starts_at > now()
      and draft.locks_at is not null
      and draft.locks_at > now()
      and draft.locks_at <= draft.starts_at
      and nullif(trim(draft.venue),'') is not null
      and nullif(trim(draft.location),'') is not null
      and exists (
        select 1 from public.pick_event_draft_bouts bout
        where bout.draft_id = draft.draft_id and bout.included
      )
      and not exists (
        select 1 from public.pick_events completed
        where completed.event_id = draft.event_id
          and completed.status = 'complete'
      )
      and not exists (
        select 1 from public.pick_events event
        where event.sport = 'mma' and event.status = 'locked'
      )
      and not exists (
        select 1
        from public.pick_events event
        join public.profile_event_picks pick on pick.event_id = event.event_id
        where event.sport = 'mma' and event.status = 'upcoming'
      ),
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'included', bout.included
      ) order by bout.position)
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_event_drafts draft
  where draft.state = 'staged'
    and draft.sport = 'mma'
    and (draft.starts_at is null or draft.starts_at > now())
    and not exists (
      select 1 from public.pick_events completed
      where completed.event_id = draft.event_id
        and completed.status = 'complete'
    )
  order by draft.synced_at desc
  limit 1;

  return v_result;
end;
$$;

create or replace function private.get_pick_monitoring_event_state_source_context_core()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_staged jsonb;
  v_current jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  select jsonb_build_object(
    'event_id', draft.event_id,
    'source_event_key', draft.source_event_key,
    'name', draft.name,
    'subtitle', draft.subtitle,
    'starts_at', draft.starts_at,
    'locks_at', draft.locks_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_name', bout.blue_fighter_name
      ) order by bout.position)
      from public.pick_event_draft_bouts bout
      where bout.draft_id = draft.draft_id
        and bout.included
    ), '[]'::jsonb)
  ) into v_staged
  from public.pick_event_drafts draft
  where draft.state = 'staged'
    and draft.sport = 'mma'
    and least(draft.starts_at, draft.locks_at) > now()
  order by draft.starts_at asc, draft.synced_at desc
  limit 1;

  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'red_american_odds', bout.red_american_odds,
        'blue_american_odds', bout.blue_american_odds,
        'included_in_picks', bout.included_in_picks
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_current
  from public.pick_events event
  where event.sport = 'mma'
    and event.status in ('upcoming', 'locked')
    and event.starts_at >= now() - interval '12 hours'
  order by event.starts_at asc
  limit 1;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;

notify pgrst, 'reload schema';