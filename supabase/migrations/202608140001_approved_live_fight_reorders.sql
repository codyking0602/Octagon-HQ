-- Phase 4C: owner-approved, pre-lock live-card display reordering.
-- Bout identity and every non-position value remain untouched.

alter table public.pick_card_change_actions
  alter column bout_id drop not null;

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_type;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_type check (
    action_type in ('cancel_bout', 'restore_bout', 'replace_fighter', 'reorder_card')
  );

create or replace function public.approve_pick_card_reorder(
  p_event_id text,
  p_expected_bout_ids text[],
  p_proposed_bout_ids text[],
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_current text[];
  v_expected text[];
  v_proposed text[];
  v_before jsonb;
  v_after jsonb;
  v_count integer;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'reorder reason required';
  end if;
  if p_expected_bout_ids is null or p_proposed_bout_ids is null
    or array_position(p_expected_bout_ids, null) is not null
    or array_position(p_proposed_bout_ids, null) is not null then
    raise exception 'complete expected and proposed orders required';
  end if;

  v_expected := array(select lower(trim(value)) from unnest(p_expected_bout_ids) value);
  v_proposed := array(select lower(trim(value)) from unnest(p_proposed_bout_ids) value);

  select * into v_event from public.pick_events where event_id = v_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming' or now() >= v_event.locks_at or now() >= v_event.starts_at then
    raise exception 'pre-lock card reordering is closed';
  end if;

  -- Lock the complete card before comparing or writing any position.
  perform 1 from public.pick_bouts where event_id = v_event_id order by position for update;
  select array_agg(bout_id order by position), count(*)
    into v_current, v_count from public.pick_bouts where event_id = v_event_id;
  if v_count = 0 then raise exception 'event has no bouts'; end if;
  if cardinality(v_expected) <> v_count or v_expected is distinct from v_current then
    raise exception 'card order changed; reload Fight Night Control';
  end if;
  if cardinality(v_proposed) <> v_count
    or (select count(distinct value) from unnest(v_proposed) value) <> v_count
    or exists (select 1 from unnest(v_proposed) value where value = '')
    or exists (select 1 from unnest(v_proposed) value where not (value = any(v_current))) then
    raise exception 'proposed order must contain every current bout exactly once';
  end if;
  if v_proposed = v_current then raise exception 'proposed order is unchanged'; end if;

  select jsonb_agg(jsonb_build_object(
    'position', position, 'bout_id', bout_id,
    'red_fighter_slug', red_fighter_slug, 'blue_fighter_slug', blue_fighter_slug
  ) order by position) into v_before
  from public.pick_bouts where event_id = v_event_id;

  -- Move through an unused range so the existing (event_id, position) unique
  -- constraint remains valid throughout the atomic transaction.
  update public.pick_bouts set position = position + v_count
  where event_id = v_event_id;
  update public.pick_bouts bout set position = proposed.position
  from unnest(v_proposed) with ordinality proposed(bout_id, position)
  where bout.event_id = v_event_id and bout.bout_id = proposed.bout_id;

  select jsonb_agg(jsonb_build_object(
    'position', position, 'bout_id', bout_id,
    'red_fighter_slug', red_fighter_slug, 'blue_fighter_slug', blue_fighter_slug
  ) order by position) into v_after
  from public.pick_bouts where event_id = v_event_id;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (v_event_id, null, 'reorder_card', v_reason, v_before, v_after, auth.uid());
end;
$$;

revoke all on function public.approve_pick_card_reorder(text,text[],text[],text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_card_reorder(text,text[],text[],text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
