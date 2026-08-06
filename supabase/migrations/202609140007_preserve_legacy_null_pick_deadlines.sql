-- Preserve the established legacy fallback: a stored null bout deadline keeps
-- following the event deadline. Newly added fights receive a temporary generated
-- slot marker so the one shared reflow owner can still calculate their real
-- position-owned deadline in the same transaction.

create or replace function private.reflow_active_pick_bout_slots(p_event_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_active_count integer;
  v_slot_owned_bout_ids text[];
begin
  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id))
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock card changes are closed';
  end if;

  perform 1
  from public.pick_bouts
  where event_id = v_event.event_id
  order by position, bout_id
  for update;

  select count(*)::integer into v_active_count
  from public.pick_bouts
  where event_id = v_event.event_id
    and included_in_picks;

  if v_active_count < 1 then raise exception 'at least one active Picks bout is required'; end if;
  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and coalesce(bout.result_status, 'pending') <> 'pending'
  ) then
    raise exception 'only pending active bouts can be reflowed';
  end if;

  -- Only a stored deadline that exactly matches its prior generated segment slot
  -- is position-owned. Explicit overrides remain attached to the bout. Bare null
  -- deadlines remain null so the established event-level fallback keeps working.
  select coalesce(array_agg(bout.bout_id), array[]::text[])
  into v_slot_owned_bout_ids
  from public.pick_bouts bout
  where bout.event_id = v_event.event_id
    and bout.included_in_picks
    and bout.segment_sequence is not null
    and bout.locks_at = (
      case coalesce(bout.card_segment, 'main')
        when 'prelim' then v_event.prelims_starts_at
        else v_event.starts_at
      end
      + make_interval(mins => 30 * (bout.segment_sequence - 1))
    );

  update public.pick_bouts
  set segment_sequence = null
  where event_id = v_event.event_id;

  with active as (
    select bout_id, row_number() over (order by position, bout_id)::integer new_position
    from public.pick_bouts
    where event_id = v_event.event_id and included_in_picks
  ), removed as (
    select bout_id,
      v_active_count + row_number() over (order by position, bout_id)::integer new_position
    from public.pick_bouts
    where event_id = v_event.event_id and not included_in_picks
  ), ordered as (
    select * from active union all select * from removed
  )
  update public.pick_bouts bout
  set position = 10000 + ordered.new_position
  from ordered
  where bout.event_id = v_event.event_id
    and bout.bout_id = ordered.bout_id;

  update public.pick_bouts
  set position = position - 10000
  where event_id = v_event.event_id;

  update public.pick_bouts
  set card_segment = coalesce(card_segment, 'main')
  where event_id = v_event.event_id
    and included_in_picks;

  if exists (
    select 1 from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
      and bout.card_segment = 'prelim'
  ) and v_event.prelims_starts_at is null then
    raise exception 'Prelims require an official start time';
  end if;

  with ranked as (
    select
      bout.bout_id,
      row_number() over (
        partition by bout.card_segment
        order by bout.position desc, bout.bout_id
      )::smallint segment_sequence
    from public.pick_bouts bout
    where bout.event_id = v_event.event_id
      and bout.included_in_picks
  )
  update public.pick_bouts bout
  set segment_sequence = ranked.segment_sequence
  from ranked
  where bout.event_id = v_event.event_id
    and bout.bout_id = ranked.bout_id;

  update public.pick_bouts bout
  set locks_at = case bout.card_segment
      when 'prelim' then v_event.prelims_starts_at
      else v_event.starts_at
    end + make_interval(mins => 30 * (bout.segment_sequence - 1))
  where bout.event_id = v_event.event_id
    and bout.included_in_picks
    and bout.bout_id = any(v_slot_owned_bout_ids);
end;
$$;
revoke all on function private.reflow_active_pick_bout_slots(text)
  from public, anon, authenticated, service_role;

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
  v_marker_sequence smallint := 30000;
  v_marker_base timestamptz;
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
  if exists (
    select 1 from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.included_in_picks
      and bout.card_segment = v_segment
      and bout.segment_sequence = v_marker_sequence
  ) then
    raise exception 'temporary addition slot is unavailable; reload Fight Night Control';
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

  v_marker_base := case v_segment
    when 'prelim' then v_event.prelims_starts_at
    else v_event.starts_at
  end;

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, included_in_picks,
    card_segment, segment_sequence, locks_at
  ) values (
    v_event_id, v_bout_id, 200000, v_weight_class,
    v_red_slug, v_red_name, v_blue_slug, v_blue_name,
    'pending', true,
    v_segment, v_marker_sequence,
    v_marker_base + make_interval(mins => 30 * (v_marker_sequence - 1))
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
revoke all on function public.approve_pick_bout_addition(text,text[],text,text,text,text,integer,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_addition(text,text[],text,text,text,text,integer,text)
  to authenticated, service_role;

notify pgrst, 'reload schema';
