-- Owner-held UFC Picks window: one event may be reopened while the event is underway.
-- The existing server-owned ESPN live/final and official-result locks remain authoritative
-- for started/resolved fights. No results, entrants, picks or deadline timestamps change.
-- Manual closing remains available through the existing Fight Night Control LOCK PICKS action.
alter table public.pick_events
  add column if not exists manual_picks_open boolean not null default false;

comment on column public.pick_events.manual_picks_open is
  'Owner-directed UFC Picks reopening; automatic lifecycle advancement pauses until the owner locks the event.';

-- Keep the same transition and scoring owner. Trusted monitoring must not
-- silently re-lock a manually reopened event on its next polling cycle.
create or replace function public.transition_pick_event(
  p_event_id text,
  p_target_status text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event public.pick_events;
  v_target_status text := lower(trim(p_target_status));
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid())
  then
    raise exception 'pick control owner required';
  end if;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = lower(trim(p_event_id))
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  -- Only an actual owner action ends manual-open mode. Monitoring's automatic
  -- lock/completion attempts become no-ops while the hold is active.
  if v_event.sport = 'mma' and v_event.manual_picks_open then
    if auth.role() = 'service_role' then
      return v_event;
    end if;
    if v_target_status = 'locked' then
      update public.pick_events
      set manual_picks_open = false, updated_at = now()
      where event_id = v_event.event_id
      returning * into v_event;
    end if;
  end if;

  if v_target_status = 'complete'
    and v_event.sport = 'mma'
    and v_event.recap_video_required
    and jsonb_array_length(coalesce(v_event.watch_moments, '[]'::jsonb)) = 0
  then
    raise exception 'UFC recap video is required before final standings can publish';
  end if;

  return private.transition_pick_event_ufc_recap_core(
    v_event.event_id,
    v_target_status
  );
end;
$function$;

-- The existing monitoring wake can continue observing fights, recording official
-- results and publishing per-fight reveals, without finalizing the held event.
create or replace function public.finalize_ready_ufc_pick_events()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event record;
  v_completed_ids jsonb := '[]'::jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to finalize UFC Picks events';
  end if;

  for v_event in
    select event.event_id, event.status
    from public.pick_events event
    where event.sport = 'mma'
      and event.status in ('upcoming', 'locked')
      and not event.manual_picks_open
      and event.locks_at <= now()
      and exists (
        select 1 from public.pick_bouts bout
        where bout.event_id = event.event_id
          and bout.included_in_picks
      )
      and not exists (
        select 1 from public.pick_bouts pending
        where pending.event_id = event.event_id
          and pending.included_in_picks
          and pending.result_status = 'pending'
      )
    order by event.starts_at
    for update of event skip locked
  loop
    if v_event.status = 'upcoming' then
      perform public.transition_pick_event(v_event.event_id, 'locked');
    end if;
    perform public.transition_pick_event(v_event.event_id, 'complete');
    v_completed_ids := v_completed_ids || to_jsonb(v_event.event_id);
  end loop;

  return jsonb_build_object(
    'completed', jsonb_array_length(v_completed_ids),
    'event_ids', v_completed_ids
  );
end;
$function$;

notify pgrst, 'reload schema';
