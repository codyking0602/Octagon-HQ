-- Let the existing Picks owner act fight-by-fight during a live card.
--
-- Ownership stays unchanged:
-- - private.apply_pick_fight_change remains the sole deadline mutation/audit owner.
-- - record_official_pick_bout_result remains the sole initial-result owner.
-- - player pick privacy and lock enforcement still use private.pick_bout_is_locked.
--
-- A passed deadline may be explicitly moved only through the existing owner RPC.
-- The scoped transaction setting exists solely so that canonical mutation can
-- distinguish an intentional owner reopen from ordinary player/runtime reads.

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
    or (
      current_setting('octagon.pick_deadline_owner_override', true) is distinct from 'on'
      and p_now >= coalesce(p_bout.locks_at, p_event.locks_at)
    );
$$;
revoke all on function private.pick_bout_is_locked(
  public.pick_events,public.pick_bouts,timestamptz
) from public, anon, authenticated;

-- Preserve the existing public adapter and canonical private owner. The only
-- new behavior is that an owner may explicitly submit a new future timestamp
-- after this individual fight's prior timestamp elapsed. Event-wide lock,
-- completion, removal, and an already-recorded result remain hard stops inside
-- private.apply_pick_fight_change.
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
  v_receipt jsonb;
begin
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id));
  if not found then raise exception 'STALE_STATE: event not found'; end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id));
  if not found then raise exception 'STALE_STATE: bout not found'; end if;

  perform set_config('octagon.pick_deadline_owner_override', 'on', true);
  begin
    v_receipt := private.apply_pick_fight_change(
      'adjust_bout_lock',
      v_event.event_id,
      jsonb_build_object(
        'bout_id', v_bout.bout_id,
        'expected_locks_at', coalesce(v_bout.locks_at, v_event.locks_at),
        'proposed_locks_at', p_locks_at
      ),
      'Owner adjusted the fight deadline.'
    );
  exception when others then
    perform set_config('octagon.pick_deadline_owner_override', 'off', true);
    raise;
  end;
  perform set_config('octagon.pick_deadline_owner_override', 'off', true);

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event.event_id
    and bout_id = lower(trim(p_bout_id));
  return v_bout;
end;
$$;
revoke all on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  from public, anon, authenticated;
grant execute on function public.adjust_pick_bout_lock_time(text,text,timestamptz)
  to authenticated, service_role;

-- The existing trigger distinguishes owner card cancellations from official
-- results while an event is upcoming. Keep that guard, but let the established
-- official-result RPC write a final cancellation after this fight has locked.
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
      and current_setting('octagon.pick_official_result_write', true) is distinct from 'on'
    )
  ) then
    raise exception 'fight card changes are closed for this locked bout';
  end if;

  return new;
end;
$$;
revoke all on function private.guard_locked_pick_bout_card_changes()
  from public, anon, authenticated;

-- Initial result entry remains one canonical RPC, but an individual pending
-- included fight no longer waits for the whole event to transition to locked.
-- Its own authoritative per-fight lock boundary is sufficient. Later fights
-- remain open and editable until their own deadlines.
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

  if v_result_status not in ('red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'initial result entry requires a final official result';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status = 'complete' then
    raise exception 'completed event results require the correction workflow';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then raise exception 'bout not found'; end if;
  if not v_bout.included_in_picks then raise exception 'fight is removed from Picks'; end if;
  if v_bout.result_status <> 'pending' then
    raise exception 'official result already recorded; use correction workflow';
  end if;

  if v_event.status = 'upcoming'
    and not private.pick_bout_is_locked(v_event, v_bout) then
    raise exception 'fight must be locked before recording its result';
  end if;
  if v_event.status not in ('upcoming', 'locked') then
    raise exception 'event must be active before recording results';
  end if;

  perform set_config('octagon.pick_official_result_write', 'on', true);
  begin
    update public.pick_bouts
    set result_status = v_result_status,
        winner_fighter_slug = case v_result_status
          when 'red_win' then v_bout.red_fighter_slug
          when 'blue_win' then v_bout.blue_fighter_slug
          else null
        end,
        result_recorded_at = now()
    where event_id = v_event_id
      and bout_id = v_bout_id
    returning * into v_bout;
  exception when others then
    perform set_config('octagon.pick_official_result_write', 'off', true);
    raise;
  end;
  perform set_config('octagon.pick_official_result_write', 'off', true);

  return v_bout;
end;
$$;
revoke all on function public.record_official_pick_bout_result(text,text,text)
  from public, anon, authenticated;
grant execute on function public.record_official_pick_bout_result(text,text,text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
