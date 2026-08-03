-- Default each published Picks bout to an estimated 30-minute card slot.
-- Position 1 remains the main event, so the highest-position opening bout locks
-- at the published card start and each later bout locks 30 minutes afterward.
-- Stable bout identity, individual owner adjustments, and the explicit event
-- lock/complete master override remain owned by the existing per-fight system.

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
  v_bout_count integer;
  v_estimated_card_end timestamptz;
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

  select count(*)::integer into v_bout_count
  from public.pick_bouts
  where event_id = v_event.event_id
    and included_in_picks;

  v_estimated_card_end := v_event.starts_at
    + greatest(v_bout_count - 1, 0) * interval '30 minutes';

  if v_event.status <> 'upcoming' then raise exception 'event cannot be reopened'; end if;
  if v_bout.result_status <> 'pending' then raise exception 'resulted bout cannot be reopened'; end if;
  if private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'locked bout cannot be reopened';
  end if;
  if p_locks_at <= now() or p_locks_at > v_estimated_card_end then
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

create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_draft public.pick_event_drafts;
  v_event public.pick_events;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select * into v_draft
  from public.pick_event_drafts
  where draft_id = p_draft_id
  for update;
  if not found or v_draft.state <> 'staged' then
    raise exception 'staged event draft not found';
  end if;
  if v_draft.starts_at is null
    or v_draft.locks_at is null
    or nullif(trim(v_draft.venue), '') is null
    or nullif(trim(v_draft.location), '') is null then
    raise exception 'event draft is missing required metadata';
  end if;
  if v_draft.locks_at > v_draft.starts_at then
    raise exception 'Picks lock must not follow event start';
  end if;
  if exists (
    select 1 from public.pick_events
    where event_id = v_draft.event_id
      and status = 'complete'
  ) then
    raise exception 'completed event drafts cannot be republished';
  end if;
  if v_draft.starts_at <= now() then
    raise exception 'event draft start time has passed';
  end if;
  if v_draft.locks_at <= now() then
    raise exception 'Picks lock time has passed';
  end if;
  if not exists (
    select 1 from public.pick_event_draft_bouts
    where draft_id = p_draft_id
      and included
  ) then
    raise exception 'event draft has no included fights';
  end if;
  if exists (select 1 from public.pick_events where status = 'locked') then
    raise exception 'a locked event already exists';
  end if;
  if exists (
    select 1
    from public.pick_events event
    join public.profile_event_picks pick on pick.event_id = event.event_id
    where event.status = 'upcoming'
  ) then
    raise exception 'the current upcoming card already has picks';
  end if;

  delete from public.pick_events where status = 'upcoming';

  insert into public.pick_events(
    event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,updated_at
  )
  values(
    v_draft.event_id,v_draft.name,v_draft.subtitle,v_draft.venue,v_draft.location,
    v_draft.starts_at,v_draft.locks_at,v_draft.season,'upcoming',now()
  )
  returning * into v_event;

  insert into public.pick_bouts(
    event_id,bout_id,position,weight_class,
    red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,locks_at
  )
  with included_bouts as (
    select
      bout.*,
      row_number() over(order by bout.position) as sequence_number,
      count(*) over() as included_count
    from public.pick_event_draft_bouts bout
    where bout.draft_id = p_draft_id
      and bout.included
  )
  select
    v_draft.event_id,
    bout.bout_id,
    bout.sequence_number::smallint,
    bout.weight_class,
    bout.red_fighter_slug,
    bout.red_fighter_name,
    bout.blue_fighter_slug,
    bout.blue_fighter_name,
    v_draft.starts_at
      + ((bout.included_count - bout.sequence_number)::double precision
        * interval '30 minutes')
  from included_bouts bout
  order by bout.sequence_number;

  update public.pick_event_drafts
  set state = 'published',
      published_at = now(),
      updated_at = now()
  where draft_id = p_draft_id;

  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Upgrade only an untouched upcoming card whose included bouts still all share
-- the old event default. Any deliberate per-bout owner adjustment prevents the
-- backfill from changing that event.
with eligible_events as (
  select event.event_id, event.starts_at
  from public.pick_events event
  where event.status = 'upcoming'
    and exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = event.event_id
        and bout.included_in_picks
    )
    and not exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = event.event_id
        and bout.included_in_picks
        and bout.locks_at is distinct from event.locks_at
    )
), ranked_bouts as (
  select
    bout.event_id,
    bout.bout_id,
    event.starts_at
      + ((count(*) over(partition by bout.event_id)
          - row_number() over(partition by bout.event_id order by bout.position))::double precision
        * interval '30 minutes') as locks_at
  from public.pick_bouts bout
  join eligible_events event on event.event_id = bout.event_id
  where bout.included_in_picks
)
update public.pick_bouts bout
set locks_at = ranked.locks_at
from ranked_bouts ranked
where bout.event_id = ranked.event_id
  and bout.bout_id = ranked.bout_id;

notify pgrst, 'reload schema';
