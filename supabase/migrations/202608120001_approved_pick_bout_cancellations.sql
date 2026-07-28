-- Phase 4A: owner-approved pre-lock bout cancellations.
-- Existing pick_bouts.result_status remains the canonical cancellation/scoring field.

create table if not exists public.pick_card_change_actions (
  action_id bigint generated always as identity primary key,
  event_id text not null,
  bout_id text not null,
  action_type text not null,
  reason text not null,
  before_state jsonb not null,
  after_state jsonb not null,
  approved_by uuid references public.profiles(id) on delete set null,
  approved_at timestamptz not null default now(),
  foreign key (event_id, bout_id) references public.pick_bouts(event_id, bout_id) on delete restrict,
  constraint pick_card_change_action_type check (action_type in ('cancel_bout', 'restore_bout')),
  constraint pick_card_change_reason check (length(trim(reason)) between 3 and 500)
);

alter table public.pick_card_change_actions enable row level security;
revoke all on table public.pick_card_change_actions from public, anon, authenticated;

create or replace function public.approve_pick_bout_cancellation(
  p_event_id text,
  p_bout_id text,
  p_cancelled boolean,
  p_reason text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_action_type text;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  if p_cancelled is null then
    raise exception 'cancellation state required';
  end if;

  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'cancellation reason required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then
    raise exception 'pre-lock card changes are closed';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then
    raise exception 'bout not found';
  end if;

  if p_cancelled then
    if v_bout.result_status = 'cancelled' then
      return v_bout;
    end if;
    if v_bout.result_status <> 'pending' then
      raise exception 'only a pending bout can be cancelled before lock';
    end if;
    v_action_type := 'cancel_bout';
  else
    if v_bout.result_status = 'pending' then
      return v_bout;
    end if;
    if v_bout.result_status <> 'cancelled' then
      raise exception 'only a pre-lock cancellation can be restored';
    end if;
    v_action_type := 'restore_bout';
  end if;

  v_before := to_jsonb(v_bout);

  update public.pick_bouts
  set result_status = case when p_cancelled then 'cancelled' else 'pending' end,
      winner_fighter_slug = null,
      result_recorded_at = case when p_cancelled then now() else null end
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  if p_cancelled then
    -- Preserve every original fighter pick. Only the now-invalid mutable bonus choice is removed.
    delete from public.profile_event_underdog_locks
    where event_id = v_event_id
      and bout_id = v_bout_id
      and frozen_at is null;
  end if;

  insert into public.pick_card_change_actions(
    event_id,
    bout_id,
    action_type,
    reason,
    before_state,
    after_state,
    approved_by
  ) values (
    v_event_id,
    v_bout_id,
    v_action_type,
    v_reason,
    v_before,
    to_jsonb(v_bout),
    auth.uid()
  );

  return v_bout;
end;
$$;
revoke all on function public.approve_pick_bout_cancellation(text,text,boolean,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_cancellation(text,text,boolean,text)
  to authenticated, service_role;

-- A cancelled bout remains visible with its preserved pick but is no longer pickable.
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
  v_slug text := lower(trim(p_fighter_slug));
  v_row public.profile_event_picks;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = p_event_id;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = 'complete' or now() >= v_event.locks_at then
    raise exception 'picks are locked';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = p_event_id
    and bout_id = p_bout_id;

  if not found then
    raise exception 'bout not found';
  end if;

  if v_bout.result_status = 'cancelled' then
    raise exception 'fight is cancelled';
  end if;

  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;

  insert into public.profile_event_picks(
    profile_id,
    event_id,
    bout_id,
    fighter_slug,
    picked_at,
    updated_at
  ) values (
    v_profile_id,
    p_event_id,
    p_bout_id,
    v_slug,
    now(),
    now()
  )
  on conflict (profile_id, event_id, bout_id) do update
  set fighter_slug = excluded.fighter_slug,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;
revoke all on function public.save_my_event_pick(text,text,text) from public, anon;
grant execute on function public.save_my_event_pick(text,text,text) to authenticated;

create or replace function public.set_my_event_underdog_lock(
  p_event_id text,
  p_bout_id text,
  p_fighter_slug text
)
returns public.profile_event_underdog_locks
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_pick public.profile_event_picks;
  v_odds integer;
  v_row public.profile_event_underdog_locks;
begin
  if v_profile_id is null then raise exception 'authentication required'; end if;
  select * into v_event from public.pick_events where event_id = lower(trim(p_event_id)) for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at then raise exception 'underdog lock is closed'; end if;
  select * into v_bout from public.pick_bouts
    where event_id = v_event.event_id and bout_id = lower(trim(p_bout_id));
  if not found then raise exception 'bout not found'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;
  select * into v_pick from public.profile_event_picks
    where profile_id = v_profile_id and event_id = v_event.event_id and bout_id = v_bout.bout_id;
  if not found or v_pick.fighter_slug <> lower(trim(p_fighter_slug)) then
    raise exception 'underdog lock must match your current pick';
  end if;
  v_odds := case v_pick.fighter_slug
    when v_bout.red_fighter_slug then v_bout.red_american_odds
    when v_bout.blue_fighter_slug then v_bout.blue_american_odds
  end;
  if v_odds is null or v_odds < 100 then raise exception 'underdog lock requires positive American odds'; end if;
  insert into public.profile_event_underdog_locks(profile_id,event_id,bout_id,fighter_slug,selected_at)
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_pick.fighter_slug,now())
  on conflict(profile_id,event_id) do update set
    bout_id=excluded.bout_id, fighter_slug=excluded.fighter_slug, selected_at=now(),
    frozen_american_odds=null, frozen_at=null
  returning * into v_row;
  return v_row;
end;
$$;
revoke all on function public.set_my_event_underdog_lock(text,text,text) from public, anon;
grant execute on function public.set_my_event_underdog_lock(text,text,text) to authenticated;

-- A pre-lock cancellation is a resolved scoring state, but it must not reveal private picks early.
create or replace function public.resolved_bout_group_picks(p_event_id text, p_bout_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (select 1 from public.profiles viewer where viewer.id = auth.uid())
      or bout.result_status = 'pending'
      or (
        bout.result_status = 'cancelled'
        and event.status = 'upcoming'
        and now() < event.locks_at
      )
      then '[]'::jsonb
    else coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'display_name', profile.display_name,
          'picked_fighter_slug', pick.fighter_slug,
          'is_current_user', entrant.profile_id = auth.uid()
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
$$;
revoke all on function public.resolved_bout_group_picks(text,text) from public, anon, authenticated;

-- Extend the existing owner projection with pre-lock cancellation capabilities only.
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
        'result_recorded_at', bout.result_recorded_at,
        'can_cancel', event.status = 'upcoming'
          and now() < event.locks_at
          and bout.result_status = 'pending',
        'can_restore', event.status = 'upcoming'
          and now() < event.locks_at
          and bout.result_status = 'cancelled'
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

notify pgrst, 'reload schema';
