-- Per-fight Picks locks remain properties of the canonical pick_bouts row.
-- Effective lock rule: an explicitly locked/complete event or a non-pending
-- result locks every relevant bout. Otherwise an explicit bout locks_at is
-- authoritative; only legacy NULL bout deadlines fall back to event.locks_at.
alter table public.pick_bouts
  add column if not exists locks_at timestamptz;

comment on column public.pick_bouts.locks_at is
  'Server-owned bout deadline. NULL preserves the legacy pick_events.locks_at fallback.';

create or replace function private.pick_bout_is_locked(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_event.status in ('locked', 'complete')
    or p_bout.result_status <> 'pending'
    or p_now >= coalesce(p_bout.locks_at, p_event.locks_at);
$$;
revoke all on function private.pick_bout_is_locked(public.pick_events,public.pick_bouts,timestamptz)
  from public, anon, authenticated;

-- Existing approved card-change RPCs still own their workflows. This guard is
-- the common fail-closed boundary that prevents cancellation, restoration,
-- removal, or fighter replacement from bypassing a per-bout lock. Position and
-- official result fields remain owned by their established mutations.
create function private.guard_locked_pick_bout_card_changes()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_event public.pick_events;
begin
  select * into v_event from public.pick_events where event_id=old.event_id;
  if private.pick_bout_is_locked(v_event,old) and (
    new.red_fighter_slug is distinct from old.red_fighter_slug
    or new.red_fighter_name is distinct from old.red_fighter_name
    or new.blue_fighter_slug is distinct from old.blue_fighter_slug
    or new.blue_fighter_name is distinct from old.blue_fighter_name
    or new.included_in_picks is distinct from old.included_in_picks
    or (new.result_status is distinct from old.result_status
      and (new.result_status='cancelled' or old.result_status='cancelled'))
  ) then raise exception 'fight card changes are closed for this locked bout'; end if;
  return new;
end;
$$;
revoke all on function private.guard_locked_pick_bout_card_changes() from public, anon, authenticated;
create trigger guard_locked_pick_bout_card_changes
before update on public.pick_bouts for each row
execute function private.guard_locked_pick_bout_card_changes();

-- Evolve the sole member pick mutation. A locked no-op is accepted, but a
-- first pick or changed fighter always fails closed using database time.
create or replace function public.save_my_event_pick(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text
)
returns public.profile_event_picks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_existing public.profile_event_picks;
  v_slug text := lower(trim(p_fighter_slug));
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then raise exception 'sign in required'; end if;
  select * into v_event from public.pick_events
    where event_id = lower(trim(p_event_id));
  if not found then raise exception 'event not found'; end if;
  select * into v_bout from public.pick_bouts
    where event_id = v_event.event_id and bout_id = lower(trim(p_bout_id));
  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;
  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;
  select * into v_existing from public.profile_event_picks
    where profile_id = v_profile_id and event_id = v_event.event_id and bout_id = v_bout.bout_id;
  if private.pick_bout_is_locked(v_event, v_bout) then
    if found and v_existing.fighter_slug = v_slug then return v_existing; end if;
    raise exception 'pick is locked for this fight';
  end if;
  insert into public.profile_event_picks(profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at)
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_slug,now(),now())
  on conflict (profile_id,event_id,bout_id) do update
    set fighter_slug=excluded.fighter_slug, updated_at=now()
  returning * into v_row;
  return v_row;
end;
$$;
revoke all on function public.save_my_event_pick(text,text,text) from public, anon;
grant execute on function public.save_my_event_pick(text,text,text) to authenticated;

-- Keep the canonical reveal owner, now gating each stable bout independently.
create or replace function public.resolved_bout_group_picks(p_event_id text, p_bout_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (select 1 from public.profiles viewer where viewer.id=auth.uid())
      or not private.pick_bout_is_locked(event,bout)
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(jsonb_build_object(
        'display_name',profile.display_name,
        'picked_fighter_slug',pick.fighter_slug,
        'is_current_user',profile.id=auth.uid()
      ) order by profile.display_name)
      from public.profiles profile
      left join public.profile_event_picks pick
        on pick.profile_id=profile.id and pick.event_id=bout.event_id and pick.bout_id=bout.bout_id
    ),'[]'::jsonb)
  end
  from public.pick_bouts bout join public.pick_events event on event.event_id=bout.event_id
  where bout.event_id=lower(trim(p_event_id)) and bout.bout_id=lower(trim(p_bout_id));
$$;
revoke all on function public.resolved_bout_group_picks(text,text) from public, anon, authenticated;

-- Owner-only adjustment uses stable bout identity and cannot reopen any bout
-- that is already effectively locked or resulted.
create function public.adjust_pick_bout_lock_time(
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
  if not public.is_pick_control_owner(auth.uid()) then raise exception 'pick control owner required'; end if;
  if p_locks_at is null then raise exception 'valid future bout lock time required'; end if;
  select * into v_event from public.pick_events
    where event_id=lower(trim(p_event_id)) for update;
  if not found then raise exception 'event not found'; end if;
  select * into v_bout from public.pick_bouts
    where event_id=v_event.event_id and bout_id=lower(trim(p_bout_id)) for update;
  if not found then raise exception 'bout not found'; end if;
  if v_event.status <> 'upcoming' then raise exception 'event cannot be reopened'; end if;
  if v_bout.result_status <> 'pending' then raise exception 'resulted bout cannot be reopened'; end if;
  if private.pick_bout_is_locked(v_event,v_bout) then raise exception 'locked bout cannot be reopened'; end if;
  if p_locks_at <= now() or p_locks_at > v_event.starts_at then
    raise exception 'valid future bout lock time required';
  end if;
  update public.pick_bouts set locks_at=p_locks_at
    where event_id=v_event.event_id and bout_id=v_bout.bout_id returning * into v_bout;
  return v_bout;
end;
$$;
revoke all on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  to authenticated, service_role;

-- Publication keeps one initialization path and gives every newly published
-- bout the safe canonical event deadline (legacy rows intentionally stay NULL).
create or replace function public.publish_pick_event_draft(p_draft_id uuid)
returns public.pick_events
language plpgsql security definer set search_path = ''
as $$
declare v_draft public.pick_event_drafts; v_event public.pick_events;
begin
  if not public.is_pick_control_owner(auth.uid()) then raise exception 'pick control owner required'; end if;
  select * into v_draft from public.pick_event_drafts where draft_id=p_draft_id for update;
  if not found or v_draft.state<>'staged' then raise exception 'staged event draft not found'; end if;
  if v_draft.starts_at is null or v_draft.locks_at is null or nullif(trim(v_draft.venue),'') is null
    or nullif(trim(v_draft.location),'') is null then raise exception 'event draft is missing required metadata'; end if;
  if v_draft.locks_at>v_draft.starts_at then raise exception 'Picks lock must not follow event start'; end if;
  if exists(select 1 from public.pick_events where event_id=v_draft.event_id and status='complete') then
    raise exception 'completed event drafts cannot be republished'; end if;
  if v_draft.starts_at<=now() then raise exception 'event draft start time has passed'; end if;
  if v_draft.locks_at<=now() then raise exception 'Picks lock time has passed'; end if;
  if not exists(select 1 from public.pick_event_draft_bouts where draft_id=p_draft_id and included) then
    raise exception 'event draft has no included fights'; end if;
  if exists(select 1 from public.pick_events where status='locked') then raise exception 'a locked event already exists'; end if;
  if exists(select 1 from public.pick_events event join public.profile_event_picks pick on pick.event_id=event.event_id
    where event.status='upcoming') then raise exception 'the current upcoming card already has picks'; end if;
  delete from public.pick_events where status='upcoming';
  insert into public.pick_events(event_id,name,subtitle,venue,location,starts_at,locks_at,season,status,updated_at)
  values(v_draft.event_id,v_draft.name,v_draft.subtitle,v_draft.venue,v_draft.location,v_draft.starts_at,
    v_draft.locks_at,v_draft.season,'upcoming',now()) returning * into v_event;
  insert into public.pick_bouts(event_id,bout_id,position,weight_class,red_fighter_slug,red_fighter_name,
    blue_fighter_slug,blue_fighter_name,locks_at)
  select v_draft.event_id,bout.bout_id,row_number() over(order by bout.position)::smallint,bout.weight_class,
    bout.red_fighter_slug,bout.red_fighter_name,bout.blue_fighter_slug,bout.blue_fighter_name,v_draft.locks_at
  from public.pick_event_draft_bouts bout where bout.draft_id=p_draft_id and bout.included order by bout.position;
  update public.pick_event_drafts set state='published',published_at=now(),updated_at=now() where draft_id=p_draft_id;
  return v_event;
end;
$$;
revoke all on function public.publish_pick_event_draft(uuid) from public, anon;
grant execute on function public.publish_pick_event_draft(uuid) to authenticated;

-- Enrich, rather than duplicate, both established secure projections.
alter function public.get_current_pick_event() rename to get_current_pick_event_per_fight_core;
alter function public.get_current_pick_event_per_fight_core() set schema private;
revoke all on function private.get_current_pick_event_per_fight_core() from public, anon, authenticated;
create function public.get_current_pick_event()
returns jsonb language sql stable security definer set search_path = '' as $$
  with core as (select private.get_current_pick_event_per_fight_core() value)
  select case when value is null then null else jsonb_set(value,'{bouts}',coalesce((
    select jsonb_agg(item || jsonb_build_object(
      'locks_at',coalesce(bout.locks_at,event.locks_at),
      'is_locked',private.pick_bout_is_locked(event,bout)
    ) order by (item->>'position')::integer)
    from jsonb_array_elements(value->'bouts') item
    join public.pick_events event on event.event_id=value->>'event_id'
    join public.pick_bouts bout on bout.event_id=event.event_id and bout.bout_id=item->>'bout_id'
  ),'[]'::jsonb)) end from core;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

alter function public.get_pick_control_event(text) rename to get_pick_control_event_per_fight_core;
alter function public.get_pick_control_event_per_fight_core(text) set schema private;
revoke all on function private.get_pick_control_event_per_fight_core(text) from public, anon, authenticated;
create function public.get_pick_control_event(p_event_id text default null)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_event jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then raise exception 'pick control owner required'; end if;
  v_event:=private.get_pick_control_event_per_fight_core(p_event_id);
  if v_event is null then return null; end if;
  return jsonb_set(v_event,'{bouts}',coalesce((select jsonb_agg(item || jsonb_build_object(
    'locks_at',coalesce(bout.locks_at,event.locks_at),
    'is_locked',private.pick_bout_is_locked(event,bout),
    'can_adjust_lock',event.status='upcoming' and bout.result_status='pending'
      and not private.pick_bout_is_locked(event,bout)
  ) order by (item->>'position')::integer)
  from jsonb_array_elements(v_event->'bouts') item
  join public.pick_events event on event.event_id=v_event->>'event_id'
  join public.pick_bouts bout on bout.event_id=event.event_id and bout.bout_id=item->>'bout_id'),'[]'::jsonb));
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

notify pgrst, 'reload schema';
