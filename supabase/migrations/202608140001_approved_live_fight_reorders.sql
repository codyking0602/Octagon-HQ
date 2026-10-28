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

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (action_type = 'reorder_card' and bout_id is null)
    or
    (action_type in ('cancel_bout', 'restore_bout', 'replace_fighter') and bout_id is not null)
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.pick_card_change_actions'::regclass
      and conname = 'pick_card_change_actions_event_id_fkey'
  ) then
    alter table public.pick_card_change_actions
      add constraint pick_card_change_actions_event_id_fkey
      foreign key (event_id) references public.pick_events(event_id) on delete restrict;
  end if;
end;
$$;

create or replace function public.approve_pick_card_reorder(
  p_event_id text,
  p_expected_bout_ids text[],
  p_proposed_bout_ids text[],
  p_reason text
)
returns jsonb
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
  v_max_position integer;
  v_offset integer;
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

  v_expected := array(
    select lower(trim(input.bout_id))
    from unnest(p_expected_bout_ids) as input(bout_id)
  );
  v_proposed := array(
    select lower(trim(input.bout_id))
    from unnest(p_proposed_bout_ids) as input(bout_id)
  );

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock card reordering is closed';
  end if;

  -- Lock the complete card before comparing or writing any position.
  perform 1
  from public.pick_bouts
  where event_id = v_event_id
  order by position
  for update;

  select
    coalesce(array_agg(bout_id order by position), array[]::text[]),
    count(*),
    coalesce(max(position), 0)
  into v_current, v_count, v_max_position
  from public.pick_bouts
  where event_id = v_event_id;

  if v_count < 2 then
    raise exception 'at least two bouts are required to reorder a card';
  end if;

  if cardinality(v_expected) <> v_count
    or v_expected is distinct from v_current then
    raise exception 'card order changed; reload Fight Night Control';
  end if;

  if cardinality(v_proposed) <> v_count
    or (select count(distinct input.bout_id) from unnest(v_proposed) as input(bout_id)) <> v_count
    or exists (select 1 from unnest(v_proposed) as input(bout_id) where input.bout_id = '')
    or exists (
      select 1
      from unnest(v_proposed) as input(bout_id)
      where not (input.bout_id = any(v_current))
    ) then
    raise exception 'proposed order must contain every current bout exactly once';
  end if;

  if v_proposed = v_current then
    raise exception 'proposed order is unchanged';
  end if;

  select jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'red_fighter_slug', red_fighter_slug,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_slug', blue_fighter_slug,
    'blue_fighter_name', blue_fighter_name
  ) order by position)
  into v_before
  from public.pick_bouts
  where event_id = v_event_id;

  -- Move through a range above the current maximum so the existing
  -- (event_id, position) unique constraint remains valid for any valid card.
  v_offset := v_max_position + v_count + 1;

  update public.pick_bouts
  set position = position + v_offset
  where event_id = v_event_id;

  update public.pick_bouts bout
  set position = proposed.position::integer
  from unnest(v_proposed) with ordinality as proposed(bout_id, position)
  where bout.event_id = v_event_id
    and bout.bout_id = proposed.bout_id;

  select jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'red_fighter_slug', red_fighter_slug,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_slug', blue_fighter_slug,
    'blue_fighter_name', blue_fighter_name
  ) order by position)
  into v_after
  from public.pick_bouts
  where event_id = v_event_id;

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
    'reorder_card',
    v_reason,
    v_before,
    v_after,
    auth.uid()
  );

  return jsonb_build_object(
    'event_id', v_event_id,
    'action_type', 'reorder_card',
    'bout_ids', to_jsonb(v_proposed),
    'bouts', v_after
  );
end;
$$;

revoke all on function public.approve_pick_card_reorder(text,text[],text[],text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_card_reorder(text,text[],text[],text)
  to authenticated, service_role;

-- Keep Fight Night Control as the only browser owner for approved live-card changes.
-- It exposes eligibility and the existence of history, never private audit evidence.
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
      and exists (
        select 1 from public.pick_bouts any_bout
        where any_bout.event_id = event.event_id
      )
      and not exists (
        select 1 from public.pick_bouts pending_bout
        where pending_bout.event_id = event.event_id
          and pending_bout.result_status = 'pending'
      ),
    'can_reorder', event.status = 'upcoming'
      and now() < event.locks_at
      and now() < event.starts_at
      and (
        select count(*) from public.pick_bouts reorder_bout
        where reorder_bout.event_id = event.event_id
      ) >= 2,
    'has_reorder_history', exists (
      select 1
      from public.pick_card_change_actions reorder_action
      where reorder_action.event_id = event.event_id
        and reorder_action.action_type = 'reorder_card'
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
          and now() < event.starts_at
          and bout.result_status = 'pending',
        'can_restore', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.result_status = 'cancelled',
        'can_replace', event.status = 'upcoming'
          and now() < event.locks_at
          and now() < event.starts_at
          and bout.result_status = 'pending',
        'has_replacement_history', exists (
          select 1
          from public.pick_card_change_actions replacement_action
          where replacement_action.event_id = bout.event_id
            and replacement_action.bout_id = bout.bout_id
            and replacement_action.action_type = 'replace_fighter'
        )
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  ) into v_result
  from public.pick_events event
  where event.status in ('upcoming', 'locked')
  order by event.starts_at
  limit 1;

  return v_result;
end;
$$;

revoke all on function public.get_pick_control_event() from public, anon;
grant execute on function public.get_pick_control_event() to authenticated;

notify pgrst, 'reload schema';