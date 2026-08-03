-- Keep initial per-fight deadlines owned by the one canonical Event Setup
-- publication path. The published card is headline-first: position 1 is the
-- main event and receives the latest initial deadline. Every following fight
-- receives a deadline exactly 30 minutes earlier.
create or replace function private.apply_initial_pick_bout_deadlines(
  p_event_id text,
  p_require_uniform_default boolean default false
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  -- Lock the complete canonical card before validating or changing deadlines.
  perform 1
  from public.pick_bouts
  where event_id = v_event.event_id
  order by position, bout_id
  for update;

  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
    )
    or exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = v_event.event_id
        and (
          not bout.included_in_picks
          or coalesce(bout.result_status, 'pending') <> 'pending'
          or private.pick_bout_is_locked(v_event, bout)
        )
    )
  then
    return false;
  end if;

  -- Existing upcoming cards are eligible for automatic repair only while every
  -- bout still carries the untouched legacy event-wide default. Any distinct
  -- deadline is treated as an intentional owner adjustment and preserved.
  if p_require_uniform_default and exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.locks_at is distinct from v_event.locks_at
  ) then
    return false;
  end if;

  with ordered_bouts as (
    select
      bout.bout_id,
      (row_number() over (order by bout.position, bout.bout_id) - 1)::integer
        as deadline_offset
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
  )
  update public.pick_bouts bout
  set locks_at = v_event.locks_at
    - make_interval(mins => 30 * ordered.deadline_offset)
  from ordered_bouts ordered
  where bout.event_id = v_event.event_id
    and bout.bout_id = ordered.bout_id;

  return true;
end;
$$;
revoke all on function private.apply_initial_pick_bout_deadlines(text,boolean)
  from public, anon, authenticated, service_role;

-- Extend the sole publication owner rather than adding another initializer.
alter function public.publish_pick_event_draft(uuid)
  rename to publish_pick_event_draft_initial_deadline_core;
alter function public.publish_pick_event_draft_initial_deadline_core(uuid)
  set schema private;
revoke all on function private.publish_pick_event_draft_initial_deadline_core(uuid)
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
  v_event := private.publish_pick_event_draft_initial_deadline_core(p_draft_id);

  if not private.apply_initial_pick_bout_deadlines(v_event.event_id, false) then
    raise exception 'Published Picks fights require valid initial deadlines';
  end if;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = v_event.event_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Repair untouched upcoming cards through the same calculator. This safely
-- catches the current Gamrot vs. Quillan card without hard-coding an event ID,
-- while preserving any card with a manual, finalized, removed, or resulted bout.
do $$
declare
  v_event_id text;
begin
  for v_event_id in
    select event.event_id
    from public.pick_events event
    where event.status = 'upcoming'
    order by event.starts_at, event.event_id
  loop
    perform private.apply_initial_pick_bout_deadlines(v_event_id, true);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
