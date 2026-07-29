-- Allow the existing Fight Night owner to adjust the one event-wide Picks deadline.
-- All bouts continue to share one canonical lock time; no per-bout lock owner is added.

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type in (
      'cancel_bout',
      'restore_bout',
      'replace_fighter',
      'reorder_card',
      'remove_bout_from_picks',
      'restore_bout_to_picks',
      'adjust_lock_time'
    )
  );

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (action_type in ('reorder_card', 'adjust_lock_time') and bout_id is null)
    or
    (
      action_type in (
        'cancel_bout',
        'restore_bout',
        'replace_fighter',
        'remove_bout_from_picks',
        'restore_bout_to_picks'
      )
      and bout_id is not null
    )
  );

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
    event_id,
    bout_id,
    action_type,
    reason,
    before_state,
    after_state,
    approved_by
  ) values (
    v_event_id,
    null,
    'adjust_lock_time',
    v_reason,
    v_before,
    v_after,
    auth.uid()
  );

  return v_event;
end;
$$;

revoke all on function public.adjust_pick_event_lock_time(text,timestamptz,timestamptz,text)
  from public, anon, authenticated;
grant execute on function public.adjust_pick_event_lock_time(text,timestamptz,timestamptz,text)
  to authenticated, service_role;

-- Correct the currently published Belgrade main card to UFC's main-card time:
-- Aug. 1, 2026 at 1:00 p.m. EDT / 17:00 UTC. Preserve any intentionally earlier
-- owner-set lock; otherwise move the lock with the corrected start time.
update public.pick_events
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00'
where status = 'upcoming'
  and lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

update public.pick_event_drafts
set locks_at = case
      when locks_at = starts_at or locks_at > timestamptz '2026-08-01 17:00:00+00'
        then timestamptz '2026-08-01 17:00:00+00'
      else locks_at
    end,
    starts_at = timestamptz '2026-08-01 17:00:00+00',
    updated_at = now()
where lower(subtitle) like '%medic%'
  and lower(subtitle) like '%rodriguez%'
  and starts_at::date = date '2026-08-01';

notify pgrst, 'reload schema';
