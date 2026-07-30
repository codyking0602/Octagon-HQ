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
  v_affected_picks jsonb;
  v_affected_pick jsonb;
  v_action_type text;
  v_action_id bigint;
  v_approved_at timestamptz;
  v_summary text;
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

  if not v_bout.included_in_picks then
    raise exception 'removed bout must be restored to Picks before cancellation changes';
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

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb)
    into v_affected_picks
  from public.profile_event_picks pick
  where pick.event_id = v_event_id
    and pick.bout_id = v_bout_id;

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
  )
  returning action_id, approved_at into v_action_id, v_approved_at;

  if p_cancelled then
    v_summary := format(
      '%s vs. %s was cancelled. Your pick is preserved and this fight is excluded from scoring.',
      v_before->>'red_fighter_name',
      v_before->>'blue_fighter_name'
    );

    for v_affected_pick in
      select value from jsonb_array_elements(v_affected_picks)
    loop
      perform private.publish_notification_to_profile(
        (v_affected_pick->>'profile_id')::uuid,
        'pick-fight-cancelled:' || v_action_id::text || ':' || (v_affected_pick->>'profile_id'),
        'picks-fight-cancelled:' || v_event_id,
        'picks_fight_cancelled',
        'Fight cancelled',
        v_summary,
        '/picks',
        'VIEW PICKS',
        v_approved_at
      );
    end loop;
  end if;

  return v_bout;
end;
$$;

revoke all on function public.approve_pick_bout_cancellation(text,text,boolean,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_cancellation(text,text,boolean,text)
  to authenticated, service_role;

comment on function public.approve_pick_bout_cancellation(text,text,boolean,text) is
  'Keeps the canonical owner-approved cancellation transition and notifies only members whose preserved pick is directly affected.';
