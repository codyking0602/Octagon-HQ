-- Finish the canonical Picks owner workflow without adding a second card,
-- monitoring, deadline, audit, repository, or deployment owner.

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
      'adjust_lock_time',
      'update_event_metadata',
      'update_bout_weight_class',
      'add_bout_to_picks'
    )
  );

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_subject;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_subject check (
    (
      action_type in ('reorder_card', 'adjust_lock_time', 'update_event_metadata')
      and bout_id is null
    )
    or
    (
      action_type in (
        'cancel_bout',
        'restore_bout',
        'replace_fighter',
        'remove_bout_from_picks',
        'restore_bout_to_picks',
        'update_bout_weight_class',
        'add_bout_to_picks'
      )
      and bout_id is not null
    )
  );

-- Position is the canonical deadline slot for an open card. This one helper is
-- reused by both the existing reorder owner and the new narrow addition action.
create or replace function private.reflow_active_pick_bout_slots(p_event_id text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_active_count integer;
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

  -- Release the partial unique segment-sequence index before recomputing.
  update public.pick_bouts
  set segment_sequence = null
  where event_id = v_event.event_id;

  -- Active fights own positions 1..N. Private removed audit rows remain stored
  -- after the active card and never reappear in the ordinary owner/player list.
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
    and bout.included_in_picks;
end;
$$;
revoke all on function private.reflow_active_pick_bout_slots(text)
  from public, anon, authenticated, service_role;

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
    count(*)::integer,
    coalesce(max(position), 0)
  into v_current, v_count, v_max_position
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
  set position = position + v_max_position + v_count + 100
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
revoke all on function public.approve_pick_card_reorder(text,text[],text[],text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_card_reorder(text,text[],text[],text)
  to authenticated, service_role;

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

  v_proposed := array[
    select item
    from (
      select p_position as ordinal, v_bout_id as item
      union all
      select case when ordinality >= p_position then ordinality + 1 else ordinality end,
        value
      from unnest(v_current) with ordinality current(value, ordinality)
    ) proposed
    order by ordinal
  ];

  update public.pick_bouts
  set position = position + v_count + 100
  where event_id = v_event_id and included_in_picks;

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    included_in_picks, card_segment, segment_sequence, locks_at
  ) values (
    v_event_id, v_bout_id, v_count + 101, v_weight_class,
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
revoke all on function public.approve_pick_bout_addition(text,text[],text,text,text,text,integer,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_addition(text,text[],text,text,text,text,integer,text)
  to authenticated, service_role;

-- Extend the existing current-finding test without replacing its established
-- metadata, removal, replacement, reorder, and stale-state rules.
alter function private.pick_monitoring_finding_is_current(
  public.pick_monitoring_findings, text, text
) rename to pick_monitoring_finding_is_current_owner_core;

create function private.pick_monitoring_finding_is_current(
  p_finding public.pick_monitoring_findings,
  p_monitored_kind text,
  p_monitored_event_id text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_proposal jsonb := p_finding.source_details->'approval_proposal';
  v_current_order jsonb;
begin
  if v_proposal->>'action' = 'add_bout' then
    if p_monitored_kind <> 'current'
      or p_finding.event_id is distinct from p_monitored_event_id then
      return false;
    end if;
    select coalesce(jsonb_agg(to_jsonb(bout.bout_id) order by bout.position), '[]'::jsonb)
      into v_current_order
    from public.pick_bouts bout
    join public.pick_events event on event.event_id = bout.event_id
    where bout.event_id = p_monitored_event_id
      and bout.included_in_picks
      and event.status = 'upcoming'
      and least(event.starts_at, event.locks_at) > now();
    return v_current_order = v_proposal->'expected_bout_ids'
      and not exists (
        select 1 from public.pick_bouts bout
        where bout.event_id = p_monitored_event_id
          and (
            (bout.red_fighter_slug = v_proposal->>'red_fighter_slug'
              and bout.blue_fighter_slug = v_proposal->>'blue_fighter_slug')
            or
            (bout.red_fighter_slug = v_proposal->>'blue_fighter_slug'
              and bout.blue_fighter_slug = v_proposal->>'red_fighter_slug')
          )
      );
  end if;
  return private.pick_monitoring_finding_is_current_owner_core(
    p_finding, p_monitored_kind, p_monitored_event_id
  );
end;
$$;
revoke all on function private.pick_monitoring_finding_is_current(
  public.pick_monitoring_findings, text, text
) from public, anon, authenticated, service_role;

-- Keep one public approval dispatcher. The prior implementation remains a
-- private core for every already-supported action.
alter function public.approve_pick_monitoring_finding(uuid,text)
  rename to approve_pick_monitoring_finding_owner_core;
alter function public.approve_pick_monitoring_finding_owner_core(uuid,text)
  set schema private;
revoke all on function private.approve_pick_monitoring_finding_owner_core(uuid,text)
  from public, anon, authenticated;

create function public.approve_pick_monitoring_finding(
  p_finding_id uuid,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reason text := trim(coalesce(p_reason, ''));
  v_finding public.pick_monitoring_findings;
  v_run public.pick_monitoring_runs;
  v_proposal jsonb;
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'monitoring approval audit description required';
  end if;

  select * into v_finding
  from public.pick_monitoring_findings
  where finding_id = p_finding_id
  for update;
  if not found then raise exception 'monitoring finding not found'; end if;

  v_proposal := v_finding.source_details->'approval_proposal';
  if v_proposal->>'action' <> 'add_bout' then
    return private.approve_pick_monitoring_finding_owner_core(p_finding_id, p_reason);
  end if;
  if v_finding.review_status <> 'new' or v_finding.finding_type <> 'card_change' then
    raise exception 'monitoring finding is not an unresolved card change';
  end if;

  select * into v_run
  from public.pick_monitoring_runs
  where run_id = v_finding.run_id
  for share;
  if not found or v_run.event_id is null
    or v_finding.event_id is distinct from v_run.event_id
    or v_proposal->>'event_id' is distinct from v_run.event_id then
    raise exception 'monitoring addition does not match the current event';
  end if;
  if not private.pick_monitoring_finding_is_current(v_finding, 'current', v_run.event_id) then
    raise exception 'monitoring addition is stale; refresh Manage Open Picks';
  end if;

  v_result := public.approve_pick_bout_addition(
    v_run.event_id,
    array(select jsonb_array_elements_text(v_proposal->'expected_bout_ids')),
    v_proposal->>'red_fighter_name',
    v_proposal->>'blue_fighter_name',
    v_proposal->>'weight_class',
    v_proposal->>'card_segment',
    (v_proposal->>'position')::integer,
    v_reason
  );

  update public.pick_monitoring_findings
  set review_status = 'reviewed', reviewed_at = now(), reviewed_by = auth.uid()
  where finding_id = p_finding_id and review_status = 'new';
  if not found then raise exception 'monitoring finding changed during approval'; end if;

  return jsonb_build_object(
    'finding_id', p_finding_id,
    'review_status', 'reviewed',
    'action', 'add_bout',
    'result', v_result
  );
end;
$$;
revoke all on function public.approve_pick_monitoring_finding(uuid,text)
  from public, anon;
grant execute on function public.approve_pick_monitoring_finding(uuid,text)
  to authenticated;

notify pgrst, 'reload schema';
