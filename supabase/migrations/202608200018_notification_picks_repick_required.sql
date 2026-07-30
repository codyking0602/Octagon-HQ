create or replace function public.approve_pick_fighter_replacement(
  p_event_id text,
  p_bout_id text,
  p_corner text,
  p_expected_red_fighter_slug text,
  p_expected_blue_fighter_slug text,
  p_replacement_fighter_slug text,
  p_replacement_fighter_name text,
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
  v_corner text := lower(trim(p_corner));
  v_expected_red text := lower(trim(p_expected_red_fighter_slug));
  v_expected_blue text := lower(trim(p_expected_blue_fighter_slug));
  v_replacement_slug text := lower(trim(p_replacement_fighter_slug));
  v_replacement_name text := trim(p_replacement_fighter_name);
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
  v_affected_picks jsonb;
  v_invalidated_pick jsonb;
  v_action_id bigint;
  v_approved_at timestamptz;
  v_summary text;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'replacement reason required';
  end if;
  if v_corner not in ('red', 'blue') then raise exception 'replacement corner must be red or blue'; end if;
  if v_replacement_name = '' or length(v_replacement_name) > 120
    or v_replacement_slug = '' or v_replacement_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'invalid replacement fighter identity';
  end if;

  select * into v_event from public.pick_events where event_id = v_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at or now() >= v_event.starts_at then
    raise exception 'pre-lock fighter replacements are closed';
  end if;

  select * into v_bout from public.pick_bouts
  where event_id = v_event_id and bout_id = v_bout_id for update;
  if not found then raise exception 'bout not found'; end if;
  if v_bout.result_status <> 'pending' then raise exception 'only a pending bout can replace a fighter'; end if;
  if v_bout.red_fighter_slug <> v_expected_red or v_bout.blue_fighter_slug <> v_expected_blue then
    raise exception 'matchup changed; reload Fight Night Control';
  end if;
  if v_expected_red = v_expected_blue then raise exception 'ambiguous current fighter identity'; end if;
  if v_replacement_slug in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
    raise exception 'replacement fighter must be different from both current fighters';
  end if;
  if exists (
    select 1
    from public.pick_bouts booked_bout
    where booked_bout.event_id = v_event_id
      and booked_bout.bout_id <> v_bout_id
      and v_replacement_slug in (booked_bout.red_fighter_slug, booked_bout.blue_fighter_slug)
  ) then
    raise exception 'replacement fighter is already booked on this event';
  end if;

  select coalesce(jsonb_agg(to_jsonb(pick) order by pick.profile_id), '[]'::jsonb)
  into v_affected_picks from public.profile_event_picks pick
  where pick.event_id = v_event_id and pick.bout_id = v_bout_id;

  v_before := to_jsonb(v_bout) || jsonb_build_object(
    'invalidated_picks', v_affected_picks,
    'mutable_underdog_locks', coalesce((
      select jsonb_agg(to_jsonb(lock_row) order by lock_row.profile_id)
      from public.profile_event_underdog_locks lock_row
      where lock_row.event_id = v_event_id and lock_row.bout_id = v_bout_id and lock_row.frozen_at is null
    ), '[]'::jsonb)
  );

  -- Delete, rather than map, every current selection for the changed matchup.
  delete from public.profile_event_underdog_locks
  where event_id = v_event_id and bout_id = v_bout_id and frozen_at is null;
  delete from public.profile_event_picks
  where event_id = v_event_id and bout_id = v_bout_id;

  update public.pick_bouts set
    red_fighter_slug = case when v_corner = 'red' then v_replacement_slug else red_fighter_slug end,
    red_fighter_name = case when v_corner = 'red' then v_replacement_name else red_fighter_name end,
    blue_fighter_slug = case when v_corner = 'blue' then v_replacement_slug else blue_fighter_slug end,
    blue_fighter_name = case when v_corner = 'blue' then v_replacement_name else blue_fighter_name end,
    red_american_odds = null,
    blue_american_odds = null,
    odds_source = null,
    odds_updated_at = null,
    winner_fighter_slug = null,
    result_recorded_at = null
  where event_id = v_event_id and bout_id = v_bout_id
  returning * into v_bout;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, v_bout_id, 'replace_fighter', v_reason, v_before,
    to_jsonb(v_bout) || jsonb_build_object('invalidated_pick_count', jsonb_array_length(v_affected_picks)),
    auth.uid()
  )
  returning action_id, approved_at into v_action_id, v_approved_at;

  v_summary := left(
    format(
      '%s vs. %s changed to %s vs. %s. Make a new pick before lock.',
      v_before->>'red_fighter_name',
      v_before->>'blue_fighter_name',
      v_bout.red_fighter_name,
      v_bout.blue_fighter_name
    ),
    280
  );

  for v_invalidated_pick in
    select invalidated.value
    from jsonb_array_elements(v_affected_picks) invalidated(value)
  loop
    perform private.publish_notification_to_profile(
      (v_invalidated_pick->>'profile_id')::uuid,
      'pick-repick-required:' || v_action_id::text || ':' || (v_invalidated_pick->>'profile_id'),
      left('picks-repick-required:' || v_event_id || ':' || (v_invalidated_pick->>'profile_id'), 180),
      'picks_repick_required',
      'Repick required',
      v_summary,
      '/picks',
      'REPICK',
      v_approved_at
    );
  end loop;

  return v_bout;
end;
$$;

comment on function public.approve_pick_fighter_replacement(text,text,text,text,text,text,text,text) is
  'Atomically approves one pre-lock fighter replacement, preserves its existing audit evidence, invalidates affected picks, and notifies only those profiles through the canonical notification owner.';
