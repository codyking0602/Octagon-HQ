-- Keep the existing sport-aware Picks history owner and enrich only the canonical
-- completed football bout projection with fields already stored on pick_bouts.
create or replace function public.get_my_pick_history(
  p_season integer default null,
  p_sport text default 'mma'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_history jsonb;
  v_events jsonb;
begin
  if p_sport not in ('mma','football') then
    raise exception 'unsupported Picks sport';
  end if;

  v_history := private.get_my_pick_history_core(p_season,p_sport);

  select coalesce(jsonb_agg(
    item.value || jsonb_build_object(
      'watch_moments',case when p_sport = 'mma' then coalesce(event.watch_moments,'[]'::jsonb) else '[]'::jsonb end,
      'header_storage_path',event.header_storage_path,
      'header_natural_width',event.header_natural_width,
      'header_natural_height',event.header_natural_height,
      'bouts',coalesce((
        select jsonb_agg(
          bout_item.value || jsonb_build_object(
            'home_team_slug',bout.home_team_slug,
            'away_team_slug',bout.away_team_slug,
            'frozen_spread_home',bout.frozen_spread_home,
            'spread_source',bout.spread_source,
            'spread_frozen_at',bout.spread_frozen_at,
            'home_final_score',bout.home_final_score,
            'away_final_score',bout.away_final_score
          ) order by bout_item.ordinality
        )
        from jsonb_array_elements(coalesce(item.value->'bouts','[]'::jsonb))
          with ordinality as bout_item(value,ordinality)
        left join public.pick_bouts bout
          on bout.event_id = item.value->>'event_id'
         and bout.bout_id = bout_item.value->>'bout_id'
      ),'[]'::jsonb)
    ) order by item.ordinality
  ),'[]'::jsonb)
  into v_events
  from jsonb_array_elements(coalesce(v_history->'events','[]'::jsonb))
    with ordinality as item(value,ordinality)
  left join public.pick_events event
    on event.event_id = item.value->>'event_id';

  return jsonb_set(v_history,'{events}',v_events,true);
end;
$$;

revoke all on function public.get_my_pick_history(integer,text) from public, anon;
grant execute on function public.get_my_pick_history(integer,text) to authenticated, service_role;

-- Completion remains owned by transition_pick_event. Make its recap destination
-- sport-aware without creating a second notification or settlement path.
create or replace function public.transition_pick_event(
  p_event_id text,
  p_target_status text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_target_status text := lower(trim(p_target_status));
  v_event public.pick_events;
  v_recipient record;
  v_recap_title text;
  v_recap_route text;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_target_status not in ('locked', 'complete') then
    raise exception 'invalid event transition';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status = v_target_status then return v_event; end if;
  if v_event.status = 'complete' then raise exception 'completed event is immutable'; end if;
  if now() < v_event.locks_at then raise exception 'event cannot advance before Picks lock'; end if;

  if v_target_status = 'locked' then
    if v_event.status <> 'upcoming' then
      raise exception 'event cannot transition to locked';
    end if;

    update public.pick_events
    set status = 'locked',
        completed_at = null,
        updated_at = now()
    where event_id = v_event_id
    returning * into v_event;

    return v_event;
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before completion';
  end if;

  if not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
  ) then
    raise exception 'event has no included Picks bouts';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
      and bout.result_status = 'pending'
  ) then
    raise exception 'all included bout results must be resolved before completion';
  end if;

  update public.pick_events
  set status = 'complete',
      completed_at = now(),
      updated_at = now()
  where event_id = v_event_id
  returning * into v_event;

  v_recap_title := left(
    coalesce(nullif(trim(v_event.name), ''), 'Picks event') || ' recap is ready',
    100
  );
  v_recap_route := case
    when v_event.sport = 'football' then '/football/picks?event=' || v_event.event_id || '&view=recap'
    else '/picks?event=' || v_event.event_id || '&view=recap'
  end;

  perform private.upsert_whats_new_item(
    'picks:recap:' || v_event.event_id,
    'new_recap',
    'picks',
    'automatic',
    v_recap_title,
    case when v_event.sport = 'football'
      then 'The week is complete. Final standings and the full recap are now available in Football Picks.'
      else 'The event is complete. Final standings and the full recap are now available in Picks.'
    end,
    v_recap_route,
    'VIEW RECAP',
    v_event.completed_at
  );

  for v_recipient in
    select distinct pick.profile_id
    from public.profile_event_picks pick
    where pick.event_id = v_event.event_id
    order by pick.profile_id
  loop
    perform private.publish_notification_to_profile(
      v_recipient.profile_id,
      'picks-recap-ready:' || v_event.event_id,
      'picks-recap-ready',
      'picks_recap_ready',
      v_recap_title,
      case when v_event.sport = 'football'
        then 'Final standings and your full Football Picks week recap are ready.'
        else 'Final standings and your full Picks recap are ready.'
      end,
      v_recap_route,
      'VIEW RECAP',
      v_event.completed_at
    );
  end loop;

  return v_event;
end;
$$;

revoke all on function public.transition_pick_event(text,text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text,text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
