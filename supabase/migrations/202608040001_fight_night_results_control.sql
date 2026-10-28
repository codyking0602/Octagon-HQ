-- Phase 2A: owner-only Fight Night result control.
-- Existing official-result and event-transition functions remain the only mutation owners.

create table if not exists public.pick_control_owners (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  granted_at timestamptz not null default now()
);

alter table public.pick_control_owners enable row level security;
revoke all on table public.pick_control_owners from public, anon, authenticated;

-- Current production has one canonical CODY profile. The allowlist is durable and
-- does not depend on display-name checks after this one-time seed.
insert into public.pick_control_owners(profile_id)
select profile.id
from public.profiles profile
where profile.display_name = 'CODY'
on conflict(profile_id) do nothing;

create or replace function public.is_pick_control_owner(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select p_profile_id is not null and exists (
    select 1
    from public.pick_control_owners owner_row
    where owner_row.profile_id = p_profile_id
  );
$$;
revoke all on function public.is_pick_control_owner(uuid) from public, anon, authenticated;

-- Preserve the canonical result mutation body and expand only its authorization
-- boundary from service-role-only to service role OR the owner allowlist.
create or replace function public.record_official_pick_bout_result(
  p_event_id text,
  p_bout_id text,
  p_result_status text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_result_status text := lower(trim(p_result_status));
  v_event public.pick_events;
  v_bout public.pick_bouts;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if v_result_status not in ('pending', 'red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'invalid official bout result';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = 'complete' then
    raise exception 'completed event results are immutable';
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before recording results';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then
    raise exception 'bout not found';
  end if;

  update public.pick_bouts
  set result_status = v_result_status,
      winner_fighter_slug = case v_result_status
        when 'red_win' then v_bout.red_fighter_slug
        when 'blue_win' then v_bout.blue_fighter_slug
        else null
      end,
      result_recorded_at = case
        when v_result_status = 'pending' then null
        else now()
      end
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  return v_bout;
end;
$$;
revoke all on function public.record_official_pick_bout_result(text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_official_pick_bout_result(text,text,text)
  to authenticated, service_role;

-- Preserve the canonical transition body. The existing status trigger continues
-- to freeze final pre-lock Underdog Lock odds when this function moves to locked.
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

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = v_target_status then
    return v_event;
  end if;

  if v_event.status = 'complete' then
    raise exception 'completed event is immutable';
  end if;

  if now() < v_event.locks_at then
    raise exception 'event cannot advance before Picks lock';
  end if;

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
    select 1 from public.pick_bouts bout where bout.event_id = v_event_id
  ) then
    raise exception 'event has no bouts';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.result_status = 'pending'
  ) then
    raise exception 'all bout results must be resolved before completion';
  end if;

  update public.pick_events
  set status = 'complete',
      completed_at = now(),
      updated_at = now()
  where event_id = v_event_id
  returning * into v_event;

  return v_event;
end;
$$;
revoke all on function public.transition_pick_event(text,text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text,text)
  to authenticated, service_role;

-- Owner-only operational projection. It intentionally does not return member picks.
create or replace function public.get_pick_control_event()
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
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', event.status,
    'can_lock', event.status = 'upcoming' and now() >= event.locks_at,
    'can_complete', event.status = 'locked'
      and exists (select 1 from public.pick_bouts any_bout where any_bout.event_id = event.event_id)
      and not exists (
        select 1 from public.pick_bouts pending_bout
        where pending_bout.event_id = event.event_id
          and pending_bout.result_status = 'pending'
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
        'result_status', bout.result_status,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_recorded_at', bout.result_recorded_at
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_events event
  where event.status in ('upcoming','locked')
  order by event.starts_at
  limit 1;

  return v_result;
end;
$$;
revoke all on function public.get_pick_control_event() from public, anon;
grant execute on function public.get_pick_control_event() to authenticated;

-- Preserve the latest public event projection and add only a safe entry flag.
create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'event_id',event.event_id,
    'name',event.name,
    'subtitle',event.subtitle,
    'venue',event.venue,
    'location',event.location,
    'starts_at',event.starts_at,
    'locks_at',event.locks_at,
    'season',event.season,
    'status',case when now()>=event.locks_at then 'locked' else event.status end,
    'can_control',public.is_pick_control_owner(auth.uid()),
    'bouts',coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id',bout.bout_id,
        'position',bout.position,
        'weight_class',bout.weight_class,
        'red_fighter_slug',bout.red_fighter_slug,
        'red_fighter_name',bout.red_fighter_name,
        'blue_fighter_slug',bout.blue_fighter_slug,
        'blue_fighter_name',bout.blue_fighter_name,
        'red_american_odds',bout.red_american_odds,
        'blue_american_odds',bout.blue_american_odds,
        'winner_fighter_slug',bout.winner_fighter_slug,
        'result_status',bout.result_status,
        'result_recorded_at',bout.result_recorded_at,
        'group_picks',public.resolved_bout_group_picks(bout.event_id,bout.bout_id)
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id=event.event_id
    ),'[]'::jsonb)
  )
  from public.pick_events event
  where event.status in ('upcoming','locked')
  order by event.starts_at
  limit 1;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

notify pgrst, 'reload schema';
