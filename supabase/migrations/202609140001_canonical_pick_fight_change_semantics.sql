-- PR 3: one transactional backend owner for approved UFC fight-card changes.
-- Existing public mutation RPCs remain compatibility adapters; every supported
-- fight mutation now delegates to private.apply_pick_fight_change.

alter table public.pick_card_change_actions
  add column if not exists receipt jsonb not null default '{}'::jsonb;

alter table public.pick_card_change_actions
  drop constraint if exists pick_card_change_action_receipt_object;
alter table public.pick_card_change_actions
  add constraint pick_card_change_action_receipt_object
  check (jsonb_typeof(receipt) = 'object');

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
      'add_bout',
      'adjust_bout_lock_time'
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
        'add_bout',
        'adjust_bout_lock_time'
      )
      and bout_id is not null
    )
  );

alter table public.pick_monitoring_findings
  add column if not exists approval_receipt jsonb;

alter table public.pick_monitoring_findings
  drop constraint if exists pick_monitoring_finding_approval_receipt_object;
alter table public.pick_monitoring_findings
  add constraint pick_monitoring_finding_approval_receipt_object
  check (
    approval_receipt is null
    or jsonb_typeof(approval_receipt) = 'object'
  );

-- Monitoring evidence remains immutable. Only the established review fields and
-- the canonical approval receipt may change during one owner approval.
create or replace function public.protect_pick_monitoring_evidence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'pick monitoring evidence is append-only';
  end if;

  if tg_table_name = 'pick_monitoring_findings' then
    if (
      to_jsonb(new)
        - 'review_status'
        - 'reviewed_at'
        - 'reviewed_by'
        - 'approval_receipt'
    ) is distinct from (
      to_jsonb(old)
        - 'review_status'
        - 'reviewed_at'
        - 'reviewed_by'
        - 'approval_receipt'
    ) then
      raise exception 'pick monitoring finding evidence is immutable';
    end if;
    return new;
  end if;

  raise exception 'pick monitoring evidence is append-only';
end;
$$;
revoke all on function public.protect_pick_monitoring_evidence()
  from public, anon, authenticated;

create or replace function private.apply_pick_fight_change(
  p_action text,
  p_event_id text,
  p_payload jsonb,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_action text := lower(trim(coalesce(p_action, ''));
  v_event_id text := lower(trim(coalesce(p_event_id, ''));
  v_payload jsonb := coalesce(p_payload, '{}'::jsonb);
  v_reason text := trim(coalesce(p_reason, ''));
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb := '{}'::jsonb;
  v_after jsonb := '{}'::jsonb;
  v_receipt jsonb;
  v_action_id bigint;
  v_approved_at timestamptz;
  v_bout_id text;
  v_current_order text[];
  v_expected_order text[];
  v_proposed_order text[];
  v_count integer := 0;
  v_open_count integer := 0;
  v_max_position integer := 0;
  v_offset integer := 0;
  v_preserved integer := 0;
  v_invalidated integer := 0;
  v_notification_count integer := 0;
  v_repicks_required boolean := false;
  v_player_action_required boolean := false;
  v_required_action text;
  v_deadlines_changed boolean := false;
  v_card_order_changed boolean := false;
  v_profile_ids jsonb := '[]'::jsonb;
  v_profile_id uuid;
  v_expected_red text;
  v_expected_blue text;
  v_replacement_slug text;
  v_replacement_name text;
  v_corner text;
  v_proposed_lock timestamptz;
  v_expected_lock timestamptz;
  v_expected_included boolean;
  v_requested_included boolean;
  v_segment text;
  v_segment_sequence integer;
  v_weight_class text;
  v_red_slug text;
  v_red_name text;
  v_blue_slug text;
  v_blue_name text;
  v_summary text;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'UNAUTHORIZED: pick control owner required';
  end if;

  if v_action not in (
    'add_bout',
    'remove_bout',
    'restore_bout',
    'replace_fighter',
    'reorder_card',
    'adjust_bout_lock',
    'adjust_event_lock'
  ) then
    raise exception 'UNSUPPORTED: approved fight change action is unsupported';
  end if;

  if v_event_id = '' then
    raise exception 'STALE_STATE: event identity is required';
  end if;
  if jsonb_typeof(v_payload) <> 'object' then
    raise exception 'STALE_STATE: fight change payload must be an object';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'STALE_STATE: fight change reason required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'STALE_STATE: event not found';
  end if;
  if v_event.status = 'complete' then
    raise exception 'PROHIBITED: completed event is immutable';
  end if;
  if v_event.status <> 'upcoming' then
    raise exception 'PROHIBITED: ordinary fight changes require an upcoming event';
  end if;

  -- Serialize every fight-card mutation against scheduler and owner activity.
  perform 1
  from public.pick_bouts
  where event_id = v_event_id
  order by position, bout_id
  for update;

  select
    coalesce(array_agg(bout_id order by position, bout_id), array[]::text[]),
    count(*)::integer,
    coalesce(max(position), 0)::integer
  into v_current_order, v_count, v_max_position
  from public.pick_bouts
  where event_id = v_event_id;

  if v_action = 'add_bout' then
    if jsonb_typeof(v_payload->'expected_bout_ids') <> 'array' then
      raise exception 'STALE_STATE: complete expected fight order required';
    end if;
    select coalesce(
      array_agg(lower(trim(item.value)) order by item.ordinality),
      array[]::text[]
    )
    into v_expected_order
    from jsonb_array_elements_text(v_payload->'expected_bout_ids')
      with ordinality as item(value, ordinality);

    if v_expected_order is distinct from v_current_order then
      raise exception 'STALE_STATE: card order changed; refresh Picks control';
    end if;

    select count(*)::integer into v_open_count
    from public.pick_bouts open_bout
    where open_bout.event_id = v_event_id
      and open_bout.included_in_picks
      and open_bout.result_status = 'pending'
      and not private.pick_bout_is_locked(v_event, open_bout);

    if v_count > 0 and v_open_count = 0 then
      raise exception 'PROHIBITED: a fully locked card cannot add a fight';
    end if;

    v_bout_id := lower(trim(coalesce(v_payload->>'bout_id', '')));
    v_weight_class := trim(coalesce(v_payload->>'weight_class', ''));
    v_red_slug := lower(trim(coalesce(v_payload->>'red_fighter_slug', '')));
    v_red_name := trim(coalesce(v_payload->>'red_fighter_name', ''));
    v_blue_slug := lower(trim(coalesce(v_payload->>'blue_fighter_slug', '')));
    v_blue_name := trim(coalesce(v_payload->>'blue_fighter_name', ''));
    v_segment := lower(trim(coalesce(v_payload->>'card_segment', '')));
    v_segment_sequence := nullif(v_payload->>'segment_sequence', '')::integer;
    v_proposed_lock := nullif(v_payload->>'locks_at', '')::timestamptz;

    if v_bout_id = '' or v_bout_id !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or exists (
        select 1 from public.pick_bouts existing
        where existing.event_id = v_event_id
          and existing.bout_id = v_bout_id
      ) then
      raise exception 'STALE_STATE: valid unused bout identity required';
    end if;
    if v_weight_class = '' or length(v_weight_class) > 100
      or v_red_name = '' or length(v_red_name) > 120
      or v_blue_name = '' or length(v_blue_name) > 120
      or v_red_slug = '' or v_red_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or v_blue_slug = '' or v_blue_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or v_red_slug = v_blue_slug then
      raise exception 'STALE_STATE: complete valid fighter and weight-class values required';
    end if;
    if exists (
      select 1
      from public.pick_bouts booked
      where booked.event_id = v_event_id
        and (
          v_red_slug in (booked.red_fighter_slug, booked.blue_fighter_slug)
          or v_blue_slug in (booked.red_fighter_slug, booked.blue_fighter_slug)
        )
    ) then
      raise exception 'PROHIBITED: added fighter is already booked on this event';
    end if;
    if v_segment not in ('prelim', 'main')
      or v_segment_sequence is null
      or v_segment_sequence < 1
      or exists (
        select 1
        from public.pick_bouts sequenced
        where sequenced.event_id = v_event_id
          and sequenced.card_segment = v_segment
          and sequenced.segment_sequence = v_segment_sequence
      ) then
      raise exception 'STALE_STATE: valid unused card segment sequence required';
    end if;
    if v_segment = 'prelim' and v_event.prelims_starts_at is null then
      raise exception 'PROHIBITED: a prelim fight requires an official prelim start';
    end if;
    if v_proposed_lock is null
      or v_proposed_lock < now() + interval '5 minutes'
      or v_proposed_lock > v_event.starts_at + interval '12 hours' then
      raise exception 'PROHIBITED: added fight deadline must be safely in the future';
    end if;

    select jsonb_build_object(
      'event_id', v_event_id,
      'expected_bout_ids', to_jsonb(v_current_order),
      'existing_bout_count', v_count
    ) into v_before;

    insert into public.pick_bouts(
      event_id,
      bout_id,
      position,
      weight_class,
      red_fighter_slug,
      red_fighter_name,
      blue_fighter_slug,
      blue_fighter_name,
      result_status,
      included_in_picks,
      card_segment,
      segment_sequence,
      locks_at
    ) values (
      v_event_id,
      v_bout_id,
      (v_max_position + 1)::smallint,
      v_weight_class,
      v_red_slug,
      v_red_name,
      v_blue_slug,
      v_blue_name,
      'pending',
      true,
      v_segment,
      v_segment_sequence,
      v_proposed_lock
    )
    returning * into v_bout;

    v_after := to_jsonb(v_bout);
    select count(*)::integer into v_preserved
    from public.profile_event_picks pick
    where pick.event_id = v_event_id;
    select coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
      into v_profile_ids
    from (
      select distinct pick.profile_id
      from public.profile_event_picks pick
      where pick.event_id = v_event_id
    ) entrants;
    v_player_action_required := jsonb_array_length(v_profile_ids) > 0;
    v_required_action := case
      when v_player_action_required then 'pick_new_bout'
      else null
    end;

  elsif v_action in ('remove_bout', 'restore_bout') then
    v_bout_id := lower(trim(coalesce(v_payload->>'bout_id', '')));
    v_expected_red := lower(trim(coalesce(v_payload->>'expected_red_fighter_slug', '')));
    v_expected_blue := lower(trim(coalesce(v_payload->>'expected_blue_fighter_slug', '')));
    v_expected_included := nullif(v_payload->>'expected_included_in_picks', '')::boolean;
    v_requested_included := v_action = 'restore_bout';

    select * into v_bout
    from public.pick_bouts
    where event_id = v_event_id
      and bout_id = v_bout_id
    for update;
    if not found then raise exception 'STALE_STATE: bout not found'; end if;
    if v_bout.result_status <> 'pending' then
      raise exception 'PROHIBITED: completed or resulted fight cannot change card membership';
    end if;
    if private.pick_bout_is_locked(v_event, v_bout) then
      raise exception 'PROHIBITED: locked fight cannot change card membership';
    end if;
    if v_bout.included_in_picks is distinct from v_expected_included
      or v_bout.red_fighter_slug is distinct from v_expected_red
      or v_bout.blue_fighter_slug is distinct from v_expected_blue then
      raise exception 'STALE_STATE: fight state changed; refresh Picks control';
    end if;
    if v_bout.included_in_picks = v_requested_included then
      raise exception 'STALE_STATE: requested card membership is unchanged';
    end if;
    if not v_requested_included and (
      select count(*)
      from public.pick_bouts included
      where included.event_id = v_event_id
        and included.included_in_picks
    ) <= 1 then
      raise exception 'PROHIBITED: final included fight cannot be removed';
    end if;

    select count(*)::integer,
      coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
    into v_preserved, v_profile_ids
    from (
      select pick.profile_id
      from public.profile_event_picks pick
      where pick.event_id = v_event_id
        and pick.bout_id = v_bout_id
      order by pick.profile_id
    ) affected;

    v_before := to_jsonb(v_bout) || jsonb_build_object(
      'preserved_pick_count', v_preserved
    );

    update public.pick_bouts
    set included_in_picks = v_requested_included
    where event_id = v_event_id
      and bout_id = v_bout_id
    returning * into v_bout;

    if not v_requested_included then
      delete from public.profile_event_underdog_locks
      where event_id = v_event_id
        and bout_id = v_bout_id
        and frozen_at is null;
    end if;

    v_after := to_jsonb(v_bout) || jsonb_build_object(
      'preserved_pick_count', v_preserved
    );

  elsif v_action = 'replace_fighter' then
    v_bout_id := lower(trim(coalesce(v_payload->>'bout_id', '')));
    v_corner := lower(trim(coalesce(v_payload->>'corner', '')));
    v_expected_red := lower(trim(coalesce(v_payload->>'expected_red_fighter_slug', '')));
    v_expected_blue := lower(trim(coalesce(v_payload->>'expected_blue_fighter_slug', '')));
    v_replacement_slug := lower(trim(coalesce(v_payload->>'replacement_fighter_slug', '')));
    v_replacement_name := trim(coalesce(v_payload->>'replacement_fighter_name', ''));

    select * into v_bout
    from public.pick_bouts
    where event_id = v_event_id
      and bout_id = v_bout_id
    for update;
    if not found then raise exception 'STALE_STATE: bout not found'; end if;
    if not v_bout.included_in_picks
      or v_bout.result_status <> 'pending'
      or private.pick_bout_is_locked(v_event, v_bout) then
      raise exception 'PROHIBITED: only an open pending included fight can replace a fighter';
    end if;
    if v_bout.red_fighter_slug is distinct from v_expected_red
      or v_bout.blue_fighter_slug is distinct from v_expected_blue then
      raise exception 'STALE_STATE: matchup changed; refresh Picks control';
    end if;
    if v_corner not in ('red', 'blue')
      or v_replacement_name = ''
      or length(v_replacement_name) > 120
      or v_replacement_slug = ''
      or v_replacement_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      or v_replacement_slug in (v_bout.red_fighter_slug, v_bout.blue_fighter_slug) then
      raise exception 'STALE_STATE: valid replacement fighter required';
    end if;
    if exists (
      select 1
      from public.pick_bouts booked
      where booked.event_id = v_event_id
        and booked.bout_id <> v_bout_id
        and v_replacement_slug in (
          booked.red_fighter_slug,
          booked.blue_fighter_slug
        )
    ) then
      raise exception 'PROHIBITED: replacement fighter is already booked on this event';
    end if;

    select count(*)::integer,
      coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
    into v_invalidated, v_profile_ids
    from (
      select pick.profile_id
      from public.profile_event_picks pick
      where pick.event_id = v_event_id
        and pick.bout_id = v_bout_id
      order by pick.profile_id
    ) affected;

    v_before := to_jsonb(v_bout) || jsonb_build_object(
      'invalidated_pick_count', v_invalidated,
      'invalidated_profile_ids', v_profile_ids
    );

    delete from public.profile_event_underdog_locks
    where event_id = v_event_id
      and bout_id = v_bout_id
      and frozen_at is null;

    delete from public.profile_event_picks
    where event_id = v_event_id
      and bout_id = v_bout_id;

    update public.pick_bouts
    set red_fighter_slug = case
          when v_corner = 'red' then v_replacement_slug
          else red_fighter_slug
        end,
        red_fighter_name = case
          when v_corner = 'red' then v_replacement_name
          else red_fighter_name
        end,
        blue_fighter_slug = case
          when v_corner = 'blue' then v_replacement_slug
          else blue_fighter_slug
        end,
        blue_fighter_name = case
          when v_corner = 'blue' then v_replacement_name
          else blue_fighter_name
        end,
        red_american_odds = null,
        blue_american_odds = null,
        odds_source = null,
        odds_updated_at = null,
        winner_fighter_slug = null,
        result_recorded_at = null
    where event_id = v_event_id
      and bout_id = v_bout_id
    returning * into v_bout;

    v_after := to_jsonb(v_bout) || jsonb_build_object(
      'invalidated_pick_count', v_invalidated,
      'invalidated_profile_ids', v_profile_ids
    );
    v_repicks_required := v_invalidated > 0;
    v_player_action_required := v_repicks_required;
    v_required_action := case
      when v_repicks_required then 'repick_bout'
      else null
    end;

  elsif v_action = 'reorder_card' then
    if jsonb_typeof(v_payload->'expected_bout_ids') <> 'array'
      or jsonb_typeof(v_payload->'proposed_bout_ids') <> 'array' then
      raise exception 'STALE_STATE: complete expected and proposed orders required';
    end if;

    select coalesce(
      array_agg(lower(trim(item.value)) order by item.ordinality),
      array[]::text[]
    )
    into v_expected_order
    from jsonb_array_elements_text(v_payload->'expected_bout_ids')
      with ordinality as item(value, ordinality);
    select coalesce(
      array_agg(lower(trim(item.value)) order by item.ordinality),
      array[]::text[]
    )
    into v_proposed_order
    from jsonb_array_elements_text(v_payload->'proposed_bout_ids')
      with ordinality as item(value, ordinality);

    if v_count < 2 then
      raise exception 'PROHIBITED: at least two fights are required to reorder';
    end if;
    if v_expected_order is distinct from v_current_order then
      raise exception 'STALE_STATE: card order changed; refresh Picks control';
    end if;
    if cardinality(v_proposed_order) <> v_count
      or (
        select count(distinct proposed.bout_id)
        from unnest(v_proposed_order) proposed(bout_id)
      ) <> v_count
      or exists (
        select 1
        from unnest(v_proposed_order) proposed(bout_id)
        where proposed.bout_id = ''
          or not proposed.bout_id = any(v_current_order)
      ) then
      raise exception 'STALE_STATE: proposed order must contain every fight exactly once';
    end if;
    if v_proposed_order = v_current_order then
      raise exception 'STALE_STATE: proposed order is unchanged';
    end if;
    if exists (
      select 1
      from public.pick_bouts locked_bout
      join unnest(v_current_order) with ordinality current_order(bout_id, slot)
        on current_order.bout_id = locked_bout.bout_id
      join unnest(v_proposed_order) with ordinality proposed_order(bout_id, slot)
        on proposed_order.bout_id = locked_bout.bout_id
      where locked_bout.event_id = v_event_id
        and private.pick_bout_is_locked(v_event, locked_bout)
        and current_order.slot <> proposed_order.slot
    ) then
      raise exception 'PROHIBITED: locked or resulted fights must remain in their exact card slots';
    end if;

    select count(*)::integer into v_open_count
    from public.pick_bouts open_bout
    where open_bout.event_id = v_event_id
      and not private.pick_bout_is_locked(v_event, open_bout);
    if v_open_count < 2 then
      raise exception 'PROHIBITED: fewer than two open fights remain reorderable';
    end if;

    select coalesce(jsonb_agg(to_jsonb(bout) order by bout.position), '[]'::jsonb)
      into v_before
    from public.pick_bouts bout
    where bout.event_id = v_event_id;

    v_offset := v_max_position + v_count + 1;
    update public.pick_bouts
    set position = position + v_offset
    where event_id = v_event_id;

    update public.pick_bouts bout
    set position = proposed.slot::smallint
    from unnest(v_proposed_order)
      with ordinality as proposed(bout_id, slot)
    where bout.event_id = v_event_id
      and bout.bout_id = proposed.bout_id;

    select coalesce(jsonb_agg(to_jsonb(bout) order by bout.position), '[]'::jsonb)
      into v_after
    from public.pick_bouts bout
    where bout.event_id = v_event_id;

    select count(*)::integer into v_preserved
    from public.profile_event_picks pick
    where pick.event_id = v_event_id;
    v_card_order_changed := true;

  elsif v_action = 'adjust_bout_lock' then
    v_bout_id := lower(trim(coalesce(v_payload->>'bout_id', '')));
    v_expected_lock := nullif(v_payload->>'expected_locks_at', '')::timestamptz;
    v_proposed_lock := nullif(v_payload->>'proposed_locks_at', '')::timestamptz;

    select * into v_bout
    from public.pick_bouts
    where event_id = v_event_id
      and bout_id = v_bout_id
    for update;
    if not found then raise exception 'STALE_STATE: bout not found'; end if;
    if not v_bout.included_in_picks
      or v_bout.result_status <> 'pending'
      or private.pick_bout_is_locked(v_event, v_bout) then
      raise exception 'PROHIBITED: locked, removed, or resulted fight deadline cannot change';
    end if;
    if coalesce(v_bout.locks_at, v_event.locks_at) is distinct from v_expected_lock then
      raise exception 'STALE_STATE: fight deadline changed; refresh Picks control';
    end if;
    if v_proposed_lock is null
      or v_proposed_lock < now() + interval '5 minutes'
      or v_proposed_lock > v_event.starts_at + interval '12 hours' then
      raise exception 'PROHIBITED: new fight deadline must be safely in the future';
    end if;
    if v_proposed_lock is not distinct from coalesce(v_bout.locks_at, v_event.locks_at) then
      raise exception 'STALE_STATE: fight deadline is unchanged';
    end if;

    select count(*)::integer,
      coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
    into v_preserved, v_profile_ids
    from (
      select pick.profile_id
      from public.profile_event_picks pick
      where pick.event_id = v_event_id
        and pick.bout_id = v_bout_id
      order by pick.profile_id
    ) affected;

    v_before := to_jsonb(v_bout) || jsonb_build_object(
      'effective_locks_at', coalesce(v_bout.locks_at, v_event.locks_at)
    );

    update public.pick_bouts
    set locks_at = v_proposed_lock
    where event_id = v_event_id
      and bout_id = v_bout_id
    returning * into v_bout;

    v_after := to_jsonb(v_bout) || jsonb_build_object(
      'effective_locks_at', v_proposed_lock
    );
    v_deadlines_changed := true;

  elsif v_action = 'adjust_event_lock' then
    v_expected_lock := nullif(v_payload->>'expected_locks_at', '')::timestamptz;
    v_proposed_lock := nullif(v_payload->>'proposed_locks_at', '')::timestamptz;

    if v_event.locks_at is distinct from v_expected_lock then
      raise exception 'STALE_STATE: event deadline changed; refresh Picks control';
    end if;
    if v_proposed_lock is null
      or v_proposed_lock < now() + interval '5 minutes'
      or v_proposed_lock > v_event.starts_at then
      raise exception 'PROHIBITED: new master deadline must be safely before the main-card start';
    end if;
    if v_proposed_lock is not distinct from v_event.locks_at then
      raise exception 'STALE_STATE: event deadline is unchanged';
    end if;
    if not exists (
      select 1
      from public.pick_bouts open_bout
      where open_bout.event_id = v_event_id
        and open_bout.included_in_picks
        and open_bout.result_status = 'pending'
        and not private.pick_bout_is_locked(v_event, open_bout)
    ) then
      raise exception 'PROHIBITED: master deadline cannot reopen a fully locked card';
    end if;

    select coalesce(jsonb_agg(to_jsonb(profile_id) order by profile_id), '[]'::jsonb)
      into v_profile_ids
    from (
      select distinct pick.profile_id
      from public.profile_event_picks pick
      join public.pick_bouts bout
        on bout.event_id = pick.event_id
       and bout.bout_id = pick.bout_id
      where pick.event_id = v_event_id
        and (
          bout.locks_at is null
          or bout.locks_at is not distinct from v_event.locks_at
        )
        and not private.pick_bout_is_locked(v_event, bout)
    ) affected;

    select count(*)::integer into v_preserved
    from public.profile_event_picks pick
    where pick.event_id = v_event_id;

    v_before := to_jsonb(v_event) || jsonb_build_object(
      'affected_open_profile_ids', v_profile_ids
    );

    -- A NULL bout deadline inherits the master boundary. Freeze any already
    -- locked inherited bout at the old value before a later master deadline can
    -- change, then move only still-open synchronized bouts.
    update public.pick_bouts locked_inherited
    set locks_at = v_event.locks_at
    where locked_inherited.event_id = v_event_id
      and locked_inherited.locks_at is null
      and private.pick_bout_is_locked(v_event, locked_inherited);

    update public.pick_bouts synchronized
    set locks_at = v_proposed_lock
    where synchronized.event_id = v_event_id
      and synchronized.locks_at is not distinct from v_event.locks_at
      and not private.pick_bout_is_locked(v_event, synchronized);

    update public.pick_events
    set locks_at = v_proposed_lock
    where event_id = v_event_id
    returning * into v_event;

    v_after := to_jsonb(v_event) || jsonb_build_object(
      'affected_open_profile_ids', v_profile_ids
    );
    v_deadlines_changed := true;
  end if;

  insert into public.pick_card_change_actions(
    event_id,
    bout_id,
    action_type,
    reason,
    before_state,
    after_state,
    approved_by,
    receipt
  ) values (
    v_event_id,
    case
      when v_action in ('reorder_card', 'adjust_event_lock') then null
      else v_bout_id
    end,
    case v_action
      when 'add_bout' then 'add_bout'
      when 'remove_bout' then 'remove_bout_from_picks'
      when 'restore_bout' then 'restore_bout_to_picks'
      when 'replace_fighter' then 'replace_fighter'
      when 'reorder_card' then 'reorder_card'
      when 'adjust_bout_lock' then 'adjust_bout_lock_time'
      when 'adjust_event_lock' then 'adjust_lock_time'
    end,
    v_reason,
    v_before,
    v_after,
    auth.uid(),
    '{}'::jsonb
  )
  returning action_id, approved_at
  into v_action_id, v_approved_at;

  if v_action = 'add_bout' then
    v_summary := left(format(
      '%s vs. %s was added. Make a pick before %s.',
      v_red_name,
      v_blue_name,
      to_char(v_proposed_lock at time zone 'UTC', 'Mon DD, YYYY HH24:MI UTC')
    ), 280);
    for v_profile_id in
      select (value #>> '{}')::uuid
      from jsonb_array_elements(v_profile_ids)
    loop
      perform private.publish_notification_to_profile(
        v_profile_id,
        'pick-fight-added:' || v_action_id::text || ':' || v_profile_id::text,
        left('picks-new-fight:' || v_event_id || ':' || v_profile_id::text, 180),
        'picks_repick_required',
        'New fight added',
        v_summary,
        '/picks',
        'MAKE PICK',
        v_approved_at
      );
      v_notification_count := v_notification_count + 1;
    end loop;

  elsif v_action = 'remove_bout' then
    v_summary := left(format(
      '%s vs. %s was removed from Picks. Your submitted pick is preserved and excluded from scoring.',
      v_before->>'red_fighter_name',
      v_before->>'blue_fighter_name'
    ), 280);
    for v_profile_id in
      select (value #>> '{}')::uuid
      from jsonb_array_elements(v_profile_ids)
    loop
      perform private.publish_notification_to_profile(
        v_profile_id,
        'pick-fight-removed:' || v_action_id::text || ':' || v_profile_id::text,
        left('picks-fight-removed:' || v_event_id || ':' || v_profile_id::text, 180),
        'picks_fight_cancelled',
        'Fight removed from Picks',
        v_summary,
        '/picks',
        'VIEW PICKS',
        v_approved_at
      );
      v_notification_count := v_notification_count + 1;
    end loop;

  elsif v_action = 'replace_fighter' then
    v_summary := left(format(
      '%s vs. %s changed to %s vs. %s. Make a new pick before lock.',
      v_before->>'red_fighter_name',
      v_before->>'blue_fighter_name',
      v_after->>'red_fighter_name',
      v_after->>'blue_fighter_name'
    ), 280);
    for v_profile_id in
      select (value #>> '{}')::uuid
      from jsonb_array_elements(v_profile_ids)
    loop
      perform private.publish_notification_to_profile(
        v_profile_id,
        'pick-repick-required:' || v_action_id::text || ':' || v_profile_id::text,
        left('picks-repick-required:' || v_event_id || ':' || v_profile_id::text, 180),
        'picks_repick_required',
        'Repick required',
        v_summary,
        '/picks',
        'REPICK',
        v_approved_at
      );
      v_notification_count := v_notification_count + 1;
    end loop;

  elsif v_action in ('adjust_bout_lock', 'adjust_event_lock') then
    v_summary := left(
      case
        when v_action = 'adjust_bout_lock' then format(
          '%s vs. %s now locks at %s. Existing picks remain valid.',
          v_after->>'red_fighter_name',
          v_after->>'blue_fighter_name',
          to_char(v_proposed_lock at time zone 'UTC', 'Mon DD, YYYY HH24:MI UTC')
        )
        else format(
          'The event-wide Picks deadline changed to %s. Existing picks remain valid.',
          to_char(v_proposed_lock at time zone 'UTC', 'Mon DD, YYYY HH24:MI UTC')
        )
      end,
      280
    );
    for v_profile_id in
      select (value #>> '{}')::uuid
      from jsonb_array_elements(v_profile_ids)
    loop
      perform private.publish_notification_to_profile(
        v_profile_id,
        'pick-deadline-changed:' || v_action_id::text || ':' || v_profile_id::text,
        left('picks-deadline-changed:' || v_event_id || ':' || v_profile_id::text, 180),
        'picks_incomplete_near_lock',
        'Picks deadline changed',
        v_summary,
        '/picks',
        'VIEW PICKS',
        v_approved_at
      );
      v_notification_count := v_notification_count + 1;
    end loop;
  end if;

  v_receipt := jsonb_build_object(
    'decision', 'applied',
    'action', v_action,
    'event_id', v_event_id,
    'bout_id', v_bout_id,
    'before_value', v_before,
    'after_value', v_after,
    'mutation_occurred', true,
    'finding_resolved', false,
    'picks_preserved', v_preserved,
    'picks_invalidated', v_invalidated,
    'repicks_required', v_repicks_required,
    'player_action_required', v_player_action_required,
    'required_action', v_required_action,
    'player_action_profile_ids', v_profile_ids,
    'deadlines_changed', v_deadlines_changed,
    'card_order_changed', v_card_order_changed,
    'notification_recorded', v_notification_count > 0,
    'notification_count', v_notification_count,
    'remains_pending', v_player_action_required,
    'audit_id', v_action_id,
    'failure_code', null
  );

  update public.pick_card_change_actions
  set receipt = v_receipt
  where action_id = v_action_id;

  return v_receipt;
end;
$$;
revoke all on function private.apply_pick_fight_change(text,text,jsonb,text)
  from public, anon, authenticated, service_role;

create or replace function public.approve_pick_bout_addition(
  p_event_id text,
  p_bout_id text,
  p_weight_class text,
  p_red_fighter_slug text,
  p_red_fighter_name text,
  p_blue_fighter_slug text,
  p_blue_fighter_name text,
  p_card_segment text,
  p_segment_sequence integer,
  p_locks_at timestamptz,
  p_expected_bout_ids text[],
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return private.apply_pick_fight_change(
    'add_bout',
    p_event_id,
    jsonb_build_object(
      'bout_id', p_bout_id,
      'weight_class', p_weight_class,
      'red_fighter_slug', p_red_fighter_slug,
      'red_fighter_name', p_red_fighter_name,
      'blue_fighter_slug', p_blue_fighter_slug,
      'blue_fighter_name', p_blue_fighter_name,
      'card_segment', p_card_segment,
      'segment_sequence', p_segment_sequence,
      'locks_at', p_locks_at,
      'expected_bout_ids', to_jsonb(p_expected_bout_ids)
    ),
    p_reason
  );
end;
$$;
revoke all on function public.approve_pick_bout_addition(
  text,text,text,text,text,text,text,text,integer,timestamptz,text[],text
) from public, anon, authenticated;
grant execute on function public.approve_pick_bout_addition(
  text,text,text,text,text,text,text,text,integer,timestamptz,text[],text
) to authenticated, service_role;

create or replace function public.approve_pick_bout_inclusion(
  p_event_id text,
  p_bout_id text,
  p_included_in_picks boolean,
  p_expected_included_in_picks boolean,
  p_expected_red_fighter_slug text,
  p_expected_blue_fighter_slug text,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  return private.apply_pick_fight_change(
    case when p_included_in_picks then 'restore_bout' else 'remove_bout' end,
    p_event_id,
    jsonb_build_object(
      'bout_id', p_bout_id,
      'expected_included_in_picks', p_expected_included_in_picks,
      'expected_red_fighter_slug', p_expected_red_fighter_slug,
      'expected_blue_fighter_slug', p_expected_blue_fighter_slug
    ),
    p_reason
  );
end;
$$;
revoke all on function public.approve_pick_bout_inclusion(
  text,text,boolean,boolean,text,text,text
) from public, anon, authenticated;
grant execute on function public.approve_pick_bout_inclusion(
  text,text,boolean,boolean,text,text,text
) to authenticated, service_role;

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
  v_receipt jsonb;
  v_bout public.pick_bouts;
begin
  v_receipt := private.apply_pick_fight_change(
    'replace_fighter',
    p_event_id,
    jsonb_build_object(
      'bout_id', p_bout_id,
      'corner', p_corner,
      'expected_red_fighter_slug', p_expected_red_fighter_slug,
      'expected_blue_fighter_slug', p_expected_blue_fighter_slug,
      'replacement_fighter_slug', p_replacement_fighter_slug,
      'replacement_fighter_name', p_replacement_fighter_name
    ),
    p_reason
  );
  select * into v_bout
  from public.pick_bouts
  where event_id = lower(trim(p_event_id))
    and bout_id = lower(trim(p_bout_id));
  return v_bout;
end;
$$;
revoke all on function public.approve_pick_fighter_replacement(
  text,text,text,text,text,text,text,text
) from public, anon, authenticated;
grant execute on function public.approve_pick_fighter_replacement(
  text,text,text,text,text,text,text,text
) to authenticated, service_role;

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
  v_receipt jsonb;
begin
  v_receipt := private.apply_pick_fight_change(
    'reorder_card',
    p_event_id,
    jsonb_build_object(
      'expected_bout_ids', to_jsonb(p_expected_bout_ids),
      'proposed_bout_ids', to_jsonb(p_proposed_bout_ids)
    ),
    p_reason
  );
  return v_receipt || jsonb_build_object(
    'action_type', 'reorder_card',
    'bout_ids', to_jsonb(p_proposed_bout_ids),
    'bouts', v_receipt->'after_value'
  );
end;
$$;
revoke all on function public.approve_pick_card_reorder(text,text[],text[],text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_card_reorder(text,text[],text[],text)
  to authenticated, service_role;

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
  v_event public.pick_events;
  v_receipt jsonb;
begin
  v_receipt := private.apply_pick_fight_change(
    'adjust_event_lock',
    p_event_id,
    jsonb_build_object(
      'expected_locks_at', p_expected_locks_at,
      'proposed_locks_at', p_locks_at
    ),
    p_reason
  );

  select * into v_event
  from public.pick_events
  where event_id = lower(trim(p_event_id));
  return v_event;
end;
$$;
revoke all on function public.adjust_pick_event_lock_time(
  text,timestamptz,timestamptz,text
) from public, anon, authenticated;
grant execute on function public.adjust_pick_event_lock_time(
  text,timestamptz,timestamptz,text
) to authenticated, service_role;

-- Keep the established owner projection and allow partial-card reorder only when
-- at least two open fights exist. Locked/resulted fights remain fixed by the
-- mutation engine even though open slots can move around them.
alter function public.get_pick_control_event(text)
  rename to get_pick_control_event_canonical_change_core;
alter function public.get_pick_control_event_canonical_change_core(text)
  set schema private;
revoke all on function private.get_pick_control_event_canonical_change_core(text)
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

  v_event := private.get_pick_control_event_canonical_change_core(p_event_id);
  if v_event is null then return null; end if;

  return jsonb_set(
    v_event,
    '{can_reorder}',
    to_jsonb(
      (v_event->>'status') = 'upcoming'
      and (
        select count(*)
        from public.pick_events event
        join public.pick_bouts open_bout
          on open_bout.event_id = event.event_id
        where event.event_id = v_event->>'event_id'
          and not private.pick_bout_is_locked(event, open_bout)
      ) >= 2
    ),
    true
  );
end;
$$;
revoke all on function public.get_pick_control_event(text) from public, anon;
grant execute on function public.get_pick_control_event(text) to authenticated;

create or replace function public.approve_pick_monitoring_finding(
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
  v_action text;
  v_identity text;
  v_receipt jsonb;
  v_result jsonb;
  v_audit_id bigint;
  v_preserved integer := 0;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'UNAUTHORIZED: pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'STALE_STATE: monitoring approval reason required';
  end if;

  select * into v_finding
  from public.pick_monitoring_findings finding
  where finding.finding_id = p_finding_id
  for update;
  if not found then raise exception 'STALE_STATE: monitoring finding not found'; end if;

  if v_finding.review_status <> 'new' then
    if jsonb_typeof(v_finding.approval_receipt) = 'object' then
      return v_finding.approval_receipt;
    end if;
    raise exception 'PROHIBITED: monitoring finding was resolved without an applied mutation';
  end if;
  if v_finding.finding_type not in ('card_change', 'unmatched_fight') then
    raise exception 'UNSUPPORTED: monitoring finding is not an approvable fight change';
  end if;

  select * into v_run
  from public.pick_monitoring_runs run
  where run.run_id = v_finding.run_id
  for share;
  if v_run.event_id is null
    or v_finding.event_id is distinct from v_run.event_id then
    raise exception 'STALE_STATE: only a current published event finding can be approved';
  end if;

  v_identity := private.pick_monitoring_finding_identity(v_finding);
  if exists (
    select 1
    from public.pick_monitoring_findings newer
    join public.pick_monitoring_runs newer_run
      on newer_run.run_id = newer.run_id
    where newer.finding_id <> v_finding.finding_id
      and newer_run.source_event_identity = v_run.source_event_identity
      and newer.event_id is not distinct from v_finding.event_id
      and private.pick_monitoring_finding_identity(newer) = v_identity
      and (newer.detected_at, newer.created_at, newer.finding_id)
        > (v_finding.detected_at, v_finding.created_at, v_finding.finding_id)
  ) then
    raise exception 'STALE_STATE: newer monitoring evidence exists; refresh Picks control';
  end if;

  v_proposal := v_finding.source_details->'approval_proposal';
  if jsonb_typeof(v_proposal) <> 'object' then
    raise exception 'UNSUPPORTED: monitoring finding has no supported approval proposal';
  end if;
  if v_proposal->>'event_id' is distinct from v_run.event_id then
    raise exception 'STALE_STATE: monitoring approval event does not match the finding';
  end if;

  v_action := v_proposal->>'action';

  if v_action in (
    'add_bout',
    'remove_bout',
    'replace_fighter',
    'reorder_card',
    'adjust_bout_lock',
    'adjust_event_lock'
  ) then
    v_receipt := private.apply_pick_fight_change(
      v_action,
      v_run.event_id,
      v_proposal - 'action' - 'event_id',
      v_reason
    );

  elsif v_action = 'update_event_metadata' then
    v_result := to_jsonb(public.approve_pick_event_metadata_change(
      v_run.event_id,
      v_proposal->>'field',
      v_proposal->>'expected_value',
      v_proposal->>'proposed_value',
      v_reason
    ));
    select action_id into v_audit_id
    from public.pick_card_change_actions
    where event_id = v_run.event_id
      and action_type = 'update_event_metadata'
      and approved_by = auth.uid()
    order by action_id desc
    limit 1;
    select count(*)::integer into v_preserved
    from public.profile_event_picks pick
    where pick.event_id = v_run.event_id;
    v_receipt := jsonb_build_object(
      'decision', 'applied',
      'action', v_action,
      'event_id', v_run.event_id,
      'bout_id', null,
      'before_value', v_finding.before_value,
      'after_value', v_finding.after_value,
      'mutation_occurred', true,
      'finding_resolved', false,
      'picks_preserved', v_preserved,
      'picks_invalidated', 0,
      'repicks_required', false,
      'player_action_required', false,
      'required_action', null,
      'player_action_profile_ids', '[]'::jsonb,
      'deadlines_changed', false,
      'card_order_changed', false,
      'notification_recorded', false,
      'notification_count', 0,
      'remains_pending', false,
      'audit_id', v_audit_id,
      'failure_code', null
    );

  elsif v_action = 'update_bout_weight_class' then
    v_result := to_jsonb(public.approve_pick_bout_weight_class_change(
      v_run.event_id,
      v_proposal->>'bout_id',
      v_proposal->>'expected_weight_class',
      v_proposal->>'proposed_weight_class',
      v_proposal->>'expected_red_fighter_slug',
      v_proposal->>'expected_blue_fighter_slug',
      v_reason
    ));
    select action_id into v_audit_id
    from public.pick_card_change_actions
    where event_id = v_run.event_id
      and bout_id = v_proposal->>'bout_id'
      and action_type = 'update_bout_weight_class'
      and approved_by = auth.uid()
    order by action_id desc
    limit 1;
    select count(*)::integer into v_preserved
    from public.profile_event_picks pick
    where pick.event_id = v_run.event_id
      and pick.bout_id = v_proposal->>'bout_id';
    v_receipt := jsonb_build_object(
      'decision', 'applied',
      'action', v_action,
      'event_id', v_run.event_id,
      'bout_id', v_proposal->>'bout_id',
      'before_value', v_finding.before_value,
      'after_value', v_finding.after_value,
      'mutation_occurred', true,
      'finding_resolved', false,
      'picks_preserved', v_preserved,
      'picks_invalidated', 0,
      'repicks_required', false,
      'player_action_required', false,
      'required_action', null,
      'player_action_profile_ids', '[]'::jsonb,
      'deadlines_changed', false,
      'card_order_changed', false,
      'notification_recorded', false,
      'notification_count', 0,
      'remains_pending', false,
      'audit_id', v_audit_id,
      'failure_code', null
    );
  else
    raise exception 'UNSUPPORTED: monitoring finding approval action is unsupported';
  end if;

  if v_audit_id is not null then
    update public.pick_card_change_actions
    set receipt = v_receipt
    where action_id = v_audit_id;
  end if;

  v_receipt := v_receipt || jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'finding_resolved', true
  );

  update public.pick_monitoring_findings
  set review_status = 'reviewed',
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      approval_receipt = v_receipt
  where finding_id = v_finding.finding_id
    and review_status = 'new';
  if not found then
    raise exception 'STALE_STATE: monitoring finding changed during approval';
  end if;

  return v_receipt;
end;
$$;
revoke all on function public.approve_pick_monitoring_finding(uuid,text)
  from public, anon;
grant execute on function public.approve_pick_monitoring_finding(uuid,text)
  to authenticated;

comment on function private.apply_pick_fight_change(text,text,jsonb,text) is
  'Sole transactional state owner for approved add, remove/restore, replace, reorder, per-fight deadline, and event deadline changes.';

notify pgrst, 'reload schema';
