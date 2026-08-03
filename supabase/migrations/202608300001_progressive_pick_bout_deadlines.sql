-- Keep the canonical publication path as the only initializer of imported
-- per-fight deadlines. Official segment anchors and chronological sequence are
-- already owned by the staged/published Picks rows.
alter function public.publish_pick_event_draft(uuid)
  rename to publish_pick_event_draft_progressive_lock_core;
alter function public.publish_pick_event_draft_progressive_lock_core(uuid)
  set schema private;
revoke all on function private.publish_pick_event_draft_progressive_lock_core(uuid)
  from public, anon, authenticated, service_role;

create function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  v_event := private.publish_pick_event_draft_progressive_lock_core(p_draft_id);

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and (
        bout.card_segment not in ('prelim', 'main')
        or bout.segment_sequence is null
        or bout.segment_sequence < 1
      )
  ) then
    raise exception 'Published Picks fights require valid segment timing metadata';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    join public.pick_events event on event.event_id = bout.event_id
    where bout.event_id = v_event.event_id
      and bout.card_segment = 'prelim'
      and event.prelims_starts_at is null
  ) then
    raise exception 'Published Picks Prelims require an official start time';
  end if;

  update public.pick_bouts bout
  set locks_at = case bout.card_segment
    when 'prelim' then event.prelims_starts_at
    else event.starts_at
  end + make_interval(mins => 30 * (bout.segment_sequence - 1))
  from public.pick_events event
  where event.event_id = v_event.event_id
    and bout.event_id = event.event_id;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event.event_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Repair the existing stable-bout mutation owner. A future deadline may follow
-- the Main Card anchor while the bout is still open; every established no-reopen
-- and event/result safety boundary remains authoritative.
create or replace function public.adjust_pick_bout_lock_time(
  p_event_id text,
  p_bout_id text,
  p_locks_at timestamptz
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_bout public.pick_bouts;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if p_locks_at is null then
    raise exception 'valid future bout lock time required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for update;
  if not found then raise exception 'bout not found'; end if;

  if v_event.status <> 'upcoming' then raise exception 'event cannot be reopened'; end if;
  if coalesce(v_bout.result_status, 'pending') <> 'pending' then
    raise exception 'resulted bout cannot be reopened';
  end if;
  if private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'locked bout cannot be reopened';
  end if;
  if p_locks_at <= now() then
    raise exception 'valid future bout lock time required';
  end if;
  if p_locks_at is not distinct from v_bout.locks_at then
    raise exception 'bout lock time is unchanged';
  end if;

  update public.pick_bouts
  set locks_at = p_locks_at
  where event_id = v_event.event_id
    and bout_id = v_bout.bout_id
  returning * into v_bout;

  return v_bout;
end;
$$;
revoke all on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  to authenticated, service_role;

notify pgrst, 'reload schema';
