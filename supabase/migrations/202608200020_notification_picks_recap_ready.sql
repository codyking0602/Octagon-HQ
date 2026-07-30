-- Connect canonical Picks completion to personal recap-ready notifications.
-- The existing What's New recap publication remains intact.

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

  perform private.upsert_whats_new_item(
    'picks:recap:' || v_event.event_id,
    'new_recap',
    'picks',
    'automatic',
    v_recap_title,
    'The event is complete. Final standings and the full recap are now available in Picks.',
    '/picks',
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
      'Final standings and your full Picks recap are ready.',
      '/picks',
      'VIEW RECAP',
      v_event.completed_at
    );
  end loop;

  return v_event;
end;
$$;

revoke all on function public.transition_pick_event(text, text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text, text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
