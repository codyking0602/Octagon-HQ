-- Per-fight Picks locks remain properties of the canonical pick_bouts row.
-- Explicit event lock/complete states are the master override. Otherwise each
-- explicit bout deadline is authoritative and only legacy NULL values inherit
-- pick_events.locks_at.
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
    or coalesce(p_bout.result_status, 'pending') <> 'pending'
    or p_now >= coalesce(p_bout.locks_at, p_event.locks_at);
$$;
revoke all on function private.pick_bout_is_locked(public.pick_events,public.pick_bouts,timestamptz)
  from public, anon, authenticated;

-- Approved pre-lock cancellation/restoration is a card-change state, not an
-- official post-lock result. This helper keeps those existing owners usable
-- until the stable bout's effective deadline.
create or replace function private.pick_bout_card_changes_are_closed(
  p_event public.pick_events,
  p_bout public.pick_bouts,
  p_now timestamptz default now()
)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_event.status <> 'upcoming'
    or p_now >= p_event.starts_at
    or p_now >= coalesce(p_bout.locks_at, p_event.locks_at)
    or coalesce(p_bout.result_status, 'pending') not in ('pending', 'cancelled');
$$;
revoke all on function private.pick_bout_card_changes_are_closed(public.pick_events,public.pick_bouts,timestamptz)
  from public, anon, authenticated;

-- Preserve the existing cancellation, fighter-replacement, inclusion, and
-- result RPCs. The trigger is only a shared fail-closed boundary for stable
-- bout-owned card fields. Official result entry/correction remains authoritative
-- once the event is explicitly locked or complete.
create or replace function private.guard_locked_pick_bout_card_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  select * into v_event
  from public.pick_events
  where event_id = old.event_id;

  if private.pick_bout_card_changes_are_closed(v_event, old) and (
    new.red_fighter_slug is distinct from old.red_fighter_slug
    or new.red_fighter_name is distinct from old.red_fighter_name
    or new.blue_fighter_slug is distinct from old.blue_fighter_slug
    or new.blue_fighter_name is distinct from old.blue_fighter_name
    or new.included_in_picks is distinct from old.included_in_picks
    or (
      v_event.status = 'upcoming'
      and new.result_status is distinct from old.result_status
      and (new.result_status = 'cancelled' or old.result_status = 'cancelled')
    )
  ) then
    raise exception 'fight card changes are closed for this locked bout';
  end if;

  return new;
end;
$$;
revoke all on function private.guard_locked_pick_bout_card_changes()
  from public, anon, authenticated;
drop trigger if exists guard_locked_pick_bout_card_changes on public.pick_bouts;
create trigger guard_locked_pick_bout_card_changes
before update on public.pick_bouts
for each row execute function private.guard_locked_pick_bout_card_changes();

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

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for share;
  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;
  if v_slug not in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'fighter is not in this bout';
  end if;

  select * into v_existing
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;

  if private.pick_bout_is_locked(v_event, v_bout) then
    if found and v_existing.fighter_slug = v_slug then
      return v_existing;
    end if;
    raise exception 'pick is locked for this fight';
  end if;

  insert into public.profile_event_picks(
    profile_id,event_id,bout_id,fighter_slug,picked_at,updated_at
  )
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_slug,now(),now())
  on conflict (profile_id,event_id,bout_id) do update
    set fighter_slug = excluded.fighter_slug,
        updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;
revoke all on function public.save_my_event_pick(text,text,text) from public, anon;
grant execute on function public.save_my_event_pick(text,text,text) to authenticated;

-- Keep the existing Underdog Lock owner on the same effective bout boundary.
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

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id))
  for share;
  if not found then raise exception 'bout not found'; end if;
  if private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'underdog lock is closed for this fight';
  end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status = 'cancelled' then raise exception 'fight is cancelled'; end if;

  select * into v_pick
  from public.profile_event_picks
  where profile_id = v_profile_id
    and event_id = v_event.event_id
    and bout_id = v_bout.bout_id;
  if not found or v_pick.fighter_slug <> lower(trim(p_fighter_slug)) then
    raise exception 'underdog lock must match your current pick';
  end if;

  v_odds := case v_pick.fighter_slug
    when v_bout.red_fighter_slug then v_bout.red_american_odds
    when v_bout.blue_fighter_slug then v_bout.blue_american_odds
  end;
  if v_odds is null or v_odds < 100 then
    raise exception 'underdog lock requires positive American odds';
  end if;

  insert into public.profile_event_underdog_locks(
    profile_id,event_id,bout_id,fighter_slug,selected_at
  )
  values(v_profile_id,v_event.event_id,v_bout.bout_id,v_pick.fighter_slug,now())
  on conflict(profile_id,event_id) do update set
    bout_id = excluded.bout_id,
    fighter_slug = excluded.fighter_slug,
    selected_at = now(),
    frozen_american_odds = null,
    frozen_at = null
  returning * into v_row;

  return v_row;
end;
$$;
revoke all on function public.set_my_event_underdog_lock(text,text,text) from public, anon;
grant execute on function public.set_my_event_underdog_lock(text,text,text) to authenticated;

create or replace function public.clear_my_event_underdog_lock(p_event_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_lock public.profile_event_underdog_locks;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  select * into v_lock
  from public.profile_event_underdog_locks
  where profile_id = auth.uid()
    and event_id = lower(trim(p_event_id));
  if not found then return; end if;

  select * into v_event
  from public.pick_events
  where event_id = v_lock.event_id
  for share;
  if not found then raise exception 'event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_lock.event_id
    and bout_id = v_lock.bout_id
  for share;
  if not found then raise exception 'bout not found'; end if;
  if private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'underdog lock is closed for this fight';
  end if;

  delete from public.profile_event_underdog_locks
  where profile_id = auth.uid()
    and event_id = v_lock.event_id;
end;
$$;
revoke all on function public.clear_my_event_underdog_lock(text) from public, anon;
grant execute on function public.clear_my_event_underdog_lock(text) to authenticated;

-- Odds stop moving on the exact bout deadline. Existing event locking still
-- freezes all selections, but each row records its own effective deadline.
create or replace function public.prevent_locked_pick_bout_odds_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
begin
  select * into v_event
  from public.pick_events
  where event_id = old.event_id;
  if not found then raise exception 'event not found'; end if;

  if private.pick_bout_is_locked(v_event, old) and (
    new.red_american_odds is distinct from old.red_american_odds
    or new.blue_american_odds is distinct from old.blue_american_odds
    or new.odds_source is distinct from old.odds_source
    or new.odds_updated_at is distinct from old.odds_updated_at
  ) then
    raise exception 'odds are locked for this fight';
  end if;

  return new;
end;
$$;
revoke all on function public.prevent_locked_pick_bout_odds_changes()
  from public, anon, authenticated;

create or replace function public.freeze_pick_event_underdog_odds()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.status = 'upcoming' and new.status = 'locked' then
    update public.profile_event_underdog_locks lock
    set frozen_american_odds = case
          when lock.fighter_slug = bout.red_fighter_slug
            and bout.red_american_odds >= 100 then bout.red_american_odds
          when lock.fighter_slug = bout.blue_fighter_slug
            and bout.blue_american_odds >= 100 then bout.blue_american_odds
          else null
        end,
        frozen_at = case
          when lock.fighter_slug = bout.red_fighter_slug
            and bout.red_american_odds >= 100 then least(coalesce(bout.locks_at, new.locks_at), new.locks_at)
          when lock.fighter_slug = bout.blue_fighter_slug
            and bout.blue_american_odds >= 100 then least(coalesce(bout.locks_at, new.locks_at), new.locks_at)
          else null
        end
    from public.pick_bouts bout
    where lock.event_id = new.event_id
      and bout.event_id = lock.event_id
      and bout.bout_id = lock.bout_id
      and lock.frozen_at is null;
  end if;
  return new;
end;
$$;
revoke all on function public.freeze_pick_event_underdog_odds()
  from public, anon, authenticated;

-- Keep the canonical reveal owner and its entrant-only payload. A pre-lock
-- owner-approved cancellation remains private until that stable bout's deadline.
create or replace function public.resolved_bout_group_picks(
  p_event_id text,
  p_bout_id text
)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when auth.uid() is null
      or not exists (
        select 1 from public.profiles viewer where viewer.id = auth.uid()
      )
      or (
        event.status not in ('locked', 'complete')
        and now() < coalesce(bout.locks_at, event.locks_at)
        and (
          bout.result_status = 'pending'
          or bout.result_status = 'cancelled'
        )
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
revoke all on function public.resolved_bout_group_picks(text,text)
  from public, anon, authenticated;

-- Preserve the existing group-progress owner while revealing the exact
-- Underdog Lock target only when that selected stable bout is effectively locked.
drop function if exists public.get_event_pick_progress(text);
create function public.get_event_pick_progress(p_event_id text)
returns table (
  profile_id uuid,
  display_name text,
  completed integer,
  total integer,
  has_underdog_lock boolean,
  underdog_lock_bout_id text,
  underdog_lock_fighter_slug text,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_event as (
    select event.*
    from public.pick_events event
    where event.event_id = lower(trim(p_event_id))
  ), eligible_bouts as (
    select bout.bout_id
    from public.pick_bouts bout
    join requested_event event on event.event_id = bout.event_id
    where coalesce(bout.included_in_picks, true)
      and coalesce(bout.result_status, 'pending') <> 'cancelled'
  ), totals as (
    select count(*)::integer total from eligible_bouts
  )
  select
    profile.id profile_id,
    profile.display_name,
    count(pick.bout_id) filter (where eligible.bout_id is not null)::integer completed,
    totals.total,
    count(lock.bout_id) > 0 has_underdog_lock,
    case
      when coalesce(bool_or(
        lock_bout.bout_id is not null
        and private.pick_bout_is_locked(event, lock_bout)
      ), false)
      then max(lock.bout_id)
      else null
    end underdog_lock_bout_id,
    case
      when coalesce(bool_or(
        lock_bout.bout_id is not null
        and private.pick_bout_is_locked(event, lock_bout)
      ), false)
      then max(lock.fighter_slug)
      else null
    end underdog_lock_fighter_slug,
    profile.id = auth.uid() is_current_user
  from public.profiles profile
  cross join requested_event event
  cross join totals
  left join public.profile_event_picks pick
    on pick.profile_id = profile.id
   and pick.event_id = event.event_id
  left join eligible_bouts eligible on eligible.bout_id = pick.bout_id
  left join public.profile_event_underdog_locks lock
    on lock.profile_id = profile.id
   and lock.event_id = event.event_id
  left join public.pick_bouts lock_bout
    on lock_bout.event_id = lock.event_id
   and lock_bout.bout_id = lock.bout_id
  where auth.uid() is not null
    and exists (
      select 1 from public.profiles viewer where viewer.id = auth.uid()
    )
  group by profile.id, profile.display_name, totals.total
  order by
    case when profile.id = auth.uid() then 0 else 1 end,
    completed desc,
    profile.display_name;
$$;
revoke all on function public.get_event_pick_progress(text) from public, anon;
grant execute on function public.get_event_pick_progress(text) to authenticated;

-- Owner-only adjustment uses stable bout identity and cannot reopen any bout
-- that is already effectively locked or resulted.
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
  if v_bout.result_status <> 'pending' then raise exception 'resulted bout cannot be reopened'; end if;
  if private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'locked bout cannot be reopened';
  end if;
  if p_locks_at <= now() or p_locks_at > v_event.starts_at then
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

-- Preserve the existing event-wide deadline owner. Bouts still synchronized to
-- the old default move with it; deliberately adjusted bouts remain independent.
create or replace function public.adjust_pick_event_lock_time(
  p_event_id text,
  p_locks_at timestamptz,
  p_expected_locks_at timestamptz,
  p_reason text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_before jsonb;
  v_after jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if p_locks_at is null or p_expected_locks_at is null then
    raise exception 'current and proposed Picks lock times are required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'lock-time change reason required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' then
    raise exception 'only an upcoming event lock time can change';
  end if;
  if now() >= v_event.starts_at then
    raise exception 'event has started; Picks deadline cannot change';
  end if;
  if v_event.locks_at is distinct from p_expected_locks_at then
    raise exception 'Picks lock time changed; reload Fight Night Control';
  end if;
  if now() >= v_event.locks_at then
    raise exception 'Picks deadline has passed; it cannot be reopened';
  end if;
  if p_locks_at <= now() then
    raise exception 'new Picks lock time must be in the future';
  end if;
  if p_locks_at > v_event.starts_at then
    raise exception 'Picks lock cannot follow the main-card start';
  end if;
  if p_locks_at = v_event.locks_at then
    raise exception 'new Picks lock time is unchanged';
  end if;

  v_before := jsonb_build_object(
    'locks_at', v_event.locks_at,
    'starts_at', v_event.starts_at,
    'status', v_event.status
  );

  update public.pick_bouts
  set locks_at = p_locks_at
  where event_id = v_event_id
    and locks_at is not distinct from v_event.locks_at;

  update public.pick_events
  set locks_at = p_locks_at
  where event_id = v_event_id
  returning * into v_event;

  v_after := jsonb_build_object(
    'locks_at', v_event.locks_at,
    'starts_at', v_event.starts_at,
    'status', v_event.status
  );

  insert into public.pick_card_change_actions(
    event_id,bout_id,action_type,reason,before_state,after_state,approved_by
  )
  values(
    v_event_id,null,'adjust_lock_time',v_reason,v_before,v_after,auth.uid()
  );

  return v_event;
end;
$$;
revoke all on function public.adjust_pick_event_lock_time(text,timestamptz,timestamptz,text)
  from public, anon, authenticated;
grant execute on function public.adjust_pick_event_lock_time(text,timestamptz,timestamptz,text)
  to authenticated, service_role;

-- Publication keeps one initialization path and gives every newly published
-- bout the safe canonical event deadline. No walkout times are invented.
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
  select
    v_draft.event_id,
    bout.bout_id,
    row_number() over(order by bout.position)::smallint,
    bout.weight_class,
    bout.red_fighter_slug,
    bout.red_fighter_name,
    bout.blue_fighter_slug,
    bout.blue_fighter_name,
    v_draft.locks_at
  from public.pick_event_draft_bouts bout
  where bout.draft_id = p_draft_id
    and bout.included
  order by bout.position;

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

-- Enrich, rather than duplicate, both established secure projections.
alter function public.get_current_pick_event()
  rename to get_current_pick_event_per_fight_core;
alter function public.get_current_pick_event_per_fight_core()
  set schema private;
revoke all on function private.get_current_pick_event_per_fight_core()
  from public, anon, authenticated;

create function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with core as (
    select private.get_current_pick_event_per_fight_core() value
  ), enriched as (
    select
      value,
      event,
      coalesce((
        select jsonb_agg(
          item || jsonb_build_object(
            'locks_at', coalesce(bout.locks_at, event.locks_at),
            'is_locked', private.pick_bout_is_locked(event, bout)
          )
          order by (item->>'position')::integer
        )
        from jsonb_array_elements(value->'bouts') item
        join public.pick_bouts bout
          on bout.event_id = event.event_id
         and bout.bout_id = item->>'bout_id'
      ), '[]'::jsonb) bouts
    from core
    join public.pick_events event on event.event_id = value->>'event_id'
    where value is not null
  )
  select case
    when (select value from core) is null then null
    else jsonb_set(
      jsonb_set(value, '{bouts}', bouts),
      '{status}',
      to_jsonb((case
        when event.status = 'locked' then 'locked'
        when not exists (
          select 1
          from public.pick_bouts open_bout
          where open_bout.event_id = event.event_id
            and open_bout.included_in_picks
            and not private.pick_bout_is_locked(event, open_bout)
        ) then 'locked'
        else 'upcoming'
      end)::text)
    )
  end
  from enriched
  union all
  select null
  where (select value from core) is null;
$$;
revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

alter function public.get_pick_control_event(text)
  rename to get_pick_control_event_per_fight_core;
alter function public.get_pick_control_event_per_fight_core(text)
  set schema private;
revoke all on function private.get_pick_control_event_per_fight_core(text)
  from public, anon, authenticated;

create function public.get_pick_control_event(p_event_id text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_event := private.get_pick_control_event_per_fight_core(p_event_id);
  if v_event is null then return null; end if;

  return jsonb_set(
    jsonb_set(
      v_event,
      '{can_reorder}',
      to_jsonb(
        (v_event->>'status') = 'upcoming'
        and now() < (v_event->>'starts_at')::timestamptz
        and (
          select count(*)
          from public.pick_bouts reorder_bout
          where reorder_bout.event_id = v_event->>'event_id'
        ) >= 2
        and not exists (
          select 1
          from public.pick_events event
          join public.pick_bouts locked_bout
            on locked_bout.event_id = event.event_id
          where event.event_id = v_event->>'event_id'
            and private.pick_bout_is_locked(event, locked_bout)
        )
      )
    ),
    '{bouts}',
    coalesce((
      select jsonb_agg(
        item || jsonb_build_object(
          'locks_at', coalesce(bout.locks_at, event.locks_at),
          'is_locked', private.pick_bout_is_locked(event, bout),
          'can_adjust_lock',
            event.status = 'upcoming'
            and bout.result_status = 'pending'
            and not private.pick_bout_is_locked(event, bout),
          'can_cancel',
            event.status = 'upcoming'
            and bout.included_in_picks
            and bout.result_status = 'pending'
            and not private.pick_bout_card_changes_are_closed(event, bout),
          'can_restore',
            event.status = 'upcoming'
            and bout.included_in_picks
            and bout.result_status = 'cancelled'
            and not private.pick_bout_card_changes_are_closed(event, bout),
          'can_replace',
            event.status = 'upcoming'
            and bout.included_in_picks
            and bout.result_status = 'pending'
            and not private.pick_bout_card_changes_are_closed(event, bout),
          'can_remove_from_picks',
            event.status = 'upcoming'
            and bout.included_in_picks
            and bout.result_status = 'pending'
            and not private.pick_bout_card_changes_are_closed(event, bout),
          'can_restore_to_picks',
            event.status = 'upcoming'
            and not bout.included_in_picks
            and bout.result_status = 'pending'
            and not private.pick_bout_card_changes_are_closed(event, bout)
        )
        order by (item->>'position')::integer
      )
      from jsonb_array_elements(v_event->'bouts') item
      join public.pick_events event on event.event_id = v_event->>'event_id'
      join public.pick_bouts bout
        on bout.event_id = event.event_id
       and bout.bout_id = item->>'bout_id'
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

notify pgrst, 'reload schema';
