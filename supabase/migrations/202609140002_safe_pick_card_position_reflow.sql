-- Replace the two canonical card-membership writers with collision-safe
-- temporary positions before the shared slot reflow finalizes positions.

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
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'reorder audit description required';
  end if;
  if p_expected_bout_ids is null or p_proposed_bout_ids is null
    or array_position(p_expected_bout_ids, null) is not null
    or array_position(p_proposed_bout_ids, null) is not null then
    raise exception 'complete expected and proposed orders required';
  end if;

  v_expected := array(select lower(trim(value)) from unnest(p_expected_bout_ids) value);
  v_proposed := array(select lower(trim(value)) from unnest(p_proposed_bout_ids) value);

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock card reordering is closed';
  end if;

  perform 1 from public.pick_bouts
  where event_id = v_event_id
  order by position for update;

  select
    coalesce(array_agg(bout_id order by position), array[]::text[]),
    count(*)::integer
  into v_current, v_count
  from public.pick_bouts
  where event_id = v_event_id
    and included_in_picks;

  if v_count < 2 then raise exception 'at least two active bouts are required to reorder a card'; end if;
  if cardinality(v_expected) <> v_count or v_expected is distinct from v_current then
    raise exception 'card order changed; reload Fight Night Control';
  end if;
  if cardinality(v_proposed) <> v_count
    or (select count(distinct value) from unnest(v_proposed) value) <> v_count
    or exists (select 1 from unnest(v_proposed) value where value = '')
    or exists (select 1 from unnest(v_proposed) value where not value = any(v_current)) then
    raise exception 'proposed order must contain every active bout exactly once';
  end if;
  if v_proposed = v_current then raise exception 'proposed order is unchanged'; end if;

  select jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'locks_at', locks_at,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_name', blue_fighter_name
  ) order by position)
  into v_before
  from public.pick_bouts
  where event_id = v_event_id and included_in_picks;

  update public.pick_bouts
  set position = position + 100000
  where event_id = v_event_id and included_in_picks;

  update public.pick_bouts bout
  set position = proposed.position::integer
  from unnest(v_proposed) with ordinality proposed(bout_id, position)
  where bout.event_id = v_event_id
    and bout.bout_id = proposed.bout_id;

  perform private.reflow_active_pick_bout_slots(v_event_id);

  select jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'locks_at', locks_at,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_name', blue_fighter_name
  ) order by position)
  into v_after
  from public.pick_bouts
  where event_id = v_event_id and included_in_picks;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, null, 'reorder_card', v_reason, v_before, v_after, auth.uid()
  );

  return jsonb_build_object(
    'event_id', v_event_id,
    'action_type', 'reorder_card',
    'bout_ids', to_jsonb(v_proposed),
    'bouts', v_after
  );
end;
$$;

create or replace function public.approve_pick_bout_addition(
  p_event_id text,
  p_expected_bout_ids text[],
  p_red_fighter_name text,
  p_blue_fighter_name text,
  p_weight_class text,
  p_card_segment text,
  p_position integer,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_red_name text := trim(p_red_fighter_name);
  v_blue_name text := trim(p_blue_fighter_name);
  v_red_slug text := public.slugify_pick_text(v_red_name);
  v_blue_slug text := public.slugify_pick_text(v_blue_name);
  v_weight_class text := trim(p_weight_class);
  v_segment text := lower(trim(p_card_segment));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_current text[];
  v_proposed text[];
  v_bout_id text;
  v_count integer;
  v_before jsonb;
  v_after jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'addition audit description required';
  end if;
  if v_red_name = '' or v_blue_name = '' or v_red_slug = '' or v_blue_slug = ''
    or v_red_slug = v_blue_slug then
    raise exception 'two distinct fighter names are required';
  end if;
  if v_weight_class = '' or length(v_weight_class) > 100 then
    raise exception 'weight class required';
  end if;
  if v_segment not in ('main', 'prelim') then
    raise exception 'card segment must be main or prelim';
  end if;

  select * into v_event from public.pick_events
  where event_id = v_event_id for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock fight additions are closed';
  end if;
  if v_segment = 'prelim' and v_event.prelims_starts_at is null then
    raise exception 'this event has no official Prelims start time';
  end if;

  perform 1 from public.pick_bouts
  where event_id = v_event_id order by position for update;

  select coalesce(array_agg(bout_id order by position), array[]::text[]), count(*)::integer
  into v_current, v_count
  from public.pick_bouts
  where event_id = v_event_id and included_in_picks;

  if p_expected_bout_ids is null
    or array_position(p_expected_bout_ids, null) is not null
    or array(select lower(trim(value)) from unnest(p_expected_bout_ids) value) is distinct from v_current then
    raise exception 'card membership changed; reload Fight Night Control';
  end if;
  if p_position < 1 or p_position > v_count + 1 then
    raise exception 'addition position is outside the active card';
  end if;
  if exists (
    select 1 from public.pick_bouts bout
    where bout.event_id = v_event_id
      and (
        (bout.red_fighter_slug = v_red_slug and bout.blue_fighter_slug = v_blue_slug)
        or (bout.red_fighter_slug = v_blue_slug and bout.blue_fighter_slug = v_red_slug)
      )
  ) then
    raise exception 'that matchup already exists on the stored card';
  end if;

  v_bout_id := public.slugify_pick_text(concat(v_segment, '-', v_red_slug, '-', v_blue_slug));
  if exists (select 1 from public.pick_bouts where event_id = v_event_id and bout_id = v_bout_id) then
    raise exception 'generated bout identity already exists';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'locks_at', locks_at,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_name', blue_fighter_name
  ) order by position), '[]'::jsonb)
  into v_before
  from public.pick_bouts
  where event_id = v_event_id and included_in_picks;

  v_proposed := array(
    select item
    from (
      select p_position as ordinal, v_bout_id as item
      union all
      select case when ordinality >= p_position then ordinality + 1 else ordinality end,
        value
      from unnest(v_current) with ordinality current(value, ordinality)
    ) proposed
    order by ordinal
  );

  update public.pick_bouts
  set position = position + 100000
  where event_id = v_event_id and included_in_picks;

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    included_in_picks, card_segment, segment_sequence, locks_at
  ) values (
    v_event_id, v_bout_id, 200000, v_weight_class,
    v_red_slug, v_red_name, v_blue_slug, v_blue_name,
    true, v_segment, null, null
  );

  update public.pick_bouts bout
  set position = proposed.position::integer
  from unnest(v_proposed) with ordinality proposed(bout_id, position)
  where bout.event_id = v_event_id and bout.bout_id = proposed.bout_id;

  perform private.reflow_active_pick_bout_slots(v_event_id);

  select coalesce(jsonb_agg(jsonb_build_object(
    'position', position,
    'bout_id', bout_id,
    'locks_at', locks_at,
    'weight_class', weight_class,
    'red_fighter_name', red_fighter_name,
    'blue_fighter_name', blue_fighter_name
  ) order by position), '[]'::jsonb)
  into v_after
  from public.pick_bouts
  where event_id = v_event_id and included_in_picks;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, v_bout_id, 'add_bout_to_picks', v_reason,
    jsonb_build_object('active_card', v_before),
    jsonb_build_object('active_card', v_after, 'added_bout_id', v_bout_id),
    auth.uid()
  );

  return jsonb_build_object(
    'event_id', v_event_id,
    'bout_id', v_bout_id,
    'action_type', 'add_bout_to_picks',
    'bout_ids', to_jsonb(v_proposed),
    'bouts', v_after
  );
end;
$$;

notify pgrst, 'reload schema';
