-- Keep the compact Picks monitoring inbox current, unique, and actionable while
-- preserving the existing runner, evidence ledger, approval dispatcher, card-change
-- audit ledger, canonical card mutations, scheduler, and browser repository.

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
      'update_bout_weight_class'
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
        'update_bout_weight_class'
      )
      and bout_id is not null
    )
  );

create or replace function public.approve_pick_event_metadata_change(
  p_event_id text,
  p_field text,
  p_expected_value text,
  p_proposed_value text,
  p_reason text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_field text := lower(trim(p_field));
  v_expected text := nullif(trim(p_expected_value), '');
  v_proposed text := nullif(trim(p_proposed_value), '');
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_current text;
  v_before jsonb;
  v_after jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if v_field not in ('venue', 'location') then
    raise exception 'supported event metadata field required';
  end if;
  if v_proposed is null or length(v_proposed) > 200 then
    raise exception 'valid proposed event metadata required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'event metadata change reason required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock event metadata changes are closed';
  end if;

  v_current := case v_field
    when 'venue' then nullif(trim(v_event.venue), '')
    else nullif(trim(v_event.location), '')
  end;
  if v_current is distinct from v_expected then
    raise exception 'event metadata changed; reload Manage Open Picks';
  end if;
  if v_current is not distinct from v_proposed then
    raise exception 'proposed event metadata is unchanged';
  end if;

  v_before := jsonb_build_object(
    'field', v_field,
    'value', v_current,
    'venue', v_event.venue,
    'location', v_event.location
  );

  update public.pick_events
  set venue = case when v_field = 'venue' then v_proposed else venue end,
      location = case when v_field = 'location' then v_proposed else location end
  where event_id = v_event_id
  returning * into v_event;

  v_after := jsonb_build_object(
    'field', v_field,
    'value', case when v_field = 'venue' then v_event.venue else v_event.location end,
    'venue', v_event.venue,
    'location', v_event.location
  );

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, null, 'update_event_metadata', v_reason, v_before, v_after, auth.uid()
  );

  return v_event;
end;
$$;
revoke all on function public.approve_pick_event_metadata_change(text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_event_metadata_change(text,text,text,text,text)
  to authenticated, service_role;

create or replace function public.approve_pick_bout_weight_class_change(
  p_event_id text,
  p_bout_id text,
  p_expected_weight_class text,
  p_proposed_weight_class text,
  p_expected_red_fighter_slug text,
  p_expected_blue_fighter_slug text,
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
  v_expected_weight text := nullif(trim(p_expected_weight_class), '');
  v_proposed_weight text := nullif(trim(p_proposed_weight_class), '');
  v_expected_red text := lower(trim(p_expected_red_fighter_slug));
  v_expected_blue text := lower(trim(p_expected_blue_fighter_slug));
  v_reason text := trim(p_reason);
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_before jsonb;
begin
  if auth.role() is distinct from 'service_role'
    and not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if v_proposed_weight is null or length(v_proposed_weight) > 100 then
    raise exception 'valid proposed weight class required';
  end if;
  if v_expected_red = '' or v_expected_blue = '' or v_expected_red = v_expected_blue then
    raise exception 'complete expected fighter identities are required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'weight-class change reason required';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;
  if not found then raise exception 'event not found'; end if;
  if v_event.status <> 'upcoming'
    or now() >= v_event.locks_at
    or now() >= v_event.starts_at then
    raise exception 'pre-lock weight-class changes are closed';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id and bout_id = v_bout_id
  for update;
  if not found then raise exception 'bout not found'; end if;
  if v_bout.result_status <> 'pending' or not v_bout.included_in_picks then
    raise exception 'only an included pending bout can change weight class';
  end if;
  if v_bout.red_fighter_slug is distinct from v_expected_red
    or v_bout.blue_fighter_slug is distinct from v_expected_blue then
    raise exception 'matchup changed; reload Manage Open Picks';
  end if;
  if nullif(trim(v_bout.weight_class), '') is distinct from v_expected_weight then
    raise exception 'weight class changed; reload Manage Open Picks';
  end if;
  if nullif(trim(v_bout.weight_class), '') is not distinct from v_proposed_weight then
    raise exception 'proposed weight class is unchanged';
  end if;

  v_before := to_jsonb(v_bout);
  update public.pick_bouts
  set weight_class = v_proposed_weight
  where event_id = v_event_id and bout_id = v_bout_id
  returning * into v_bout;

  insert into public.pick_card_change_actions(
    event_id, bout_id, action_type, reason, before_state, after_state, approved_by
  ) values (
    v_event_id, v_bout_id, 'update_bout_weight_class', v_reason,
    v_before, to_jsonb(v_bout), auth.uid()
  );

  return v_bout;
end;
$$;
revoke all on function public.approve_pick_bout_weight_class_change(text,text,text,text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.approve_pick_bout_weight_class_change(text,text,text,text,text,text,text)
  to authenticated, service_role;

create or replace function private.pick_monitoring_finding_identity(
  p_finding public.pick_monitoring_findings
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_finding.summary ~* '^Venue (found|changed)\.' then 'event:venue'
    when p_finding.summary ~* '^Location (found|changed)\.' then 'event:location'
    when p_finding.summary ~* '^Weight class (found|changed) for ' then
      'weight_class:' || regexp_replace(
        regexp_replace(lower(p_finding.summary), '^weight class (found|changed) for ', ''),
        '[^a-z0-9]+', '-', 'g'
      )
    when p_finding.finding_type in ('odds_available', 'odds_change') then
      'bout:' || coalesce(p_finding.bout_id, p_finding.matchup_identity, 'unknown') || ':odds'
    when p_finding.finding_type = 'unmatched_fight' then
      'bout:' || coalesce(p_finding.bout_id, p_finding.matchup_identity, 'unknown') || ':unmatched'
    when p_finding.source_details ? 'finding_identity' then
      p_finding.source_details->>'finding_identity'
    when p_finding.bout_id is not null then
      p_finding.finding_type || ':bout:' || p_finding.bout_id || ':' ||
        regexp_replace(lower(p_finding.summary), '[^a-z0-9]+', '-', 'g')
    else p_finding.finding_type || ':' || regexp_replace(lower(p_finding.summary), '[^a-z0-9]+', '-', 'g')
  end;
$$;
revoke all on function private.pick_monitoring_finding_identity(public.pick_monitoring_findings)
  from public, anon, authenticated, service_role;

create or replace function private.pick_monitoring_text_equivalent(
  p_left text,
  p_right text
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(lower(trim(coalesce(p_left, ''))), '[^a-z0-9]+', '', 'g')
    = regexp_replace(lower(trim(coalesce(p_right, ''))), '[^a-z0-9]+', '', 'g');
$$;
revoke all on function private.pick_monitoring_text_equivalent(text,text)
  from public, anon, authenticated, service_role;

create or replace function private.deduplicate_current_pick_monitoring_finding()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_event_identity text;
begin
  select run.source_event_identity
    into v_source_event_identity
  from public.pick_monitoring_runs run
  where run.run_id = new.run_id;

  if exists (
    select 1
    from public.pick_monitoring_findings existing
    join public.pick_monitoring_runs run on run.run_id = existing.run_id
    where existing.review_status = 'new'
      and existing.finding_key = new.finding_key
      and existing.event_id is not distinct from new.event_id
      and run.source_event_identity = v_source_event_identity
  ) then
    return null;
  end if;
  return new;
end;
$$;
revoke all on function private.deduplicate_current_pick_monitoring_finding()
  from public, anon, authenticated, service_role;

drop trigger if exists deduplicate_current_pick_monitoring_findings
  on public.pick_monitoring_findings;
create trigger deduplicate_current_pick_monitoring_findings
before insert on public.pick_monitoring_findings
for each row execute function private.deduplicate_current_pick_monitoring_finding();

-- Preserve the existing one service projection and enrich it with the canonical fields
-- required to compare venue, location, and bout weight classes truthfully.
alter function public.get_pick_monitoring_event_state()
  rename to get_pick_monitoring_event_state_actionable_core;
alter function public.get_pick_monitoring_event_state_actionable_core()
  set schema private;
revoke all on function private.get_pick_monitoring_event_state_actionable_core()
  from public, anon, authenticated, service_role;

create function public.get_pick_monitoring_event_state()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_staged jsonb;
  v_current jsonb;
  v_event_id text;
  v_draft_id uuid;
  v_venue text;
  v_location text;
  v_bouts jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read pick monitoring event state';
  end if;

  v_value := private.get_pick_monitoring_event_state_actionable_core();
  v_staged := v_value->'staged';
  v_current := v_value->'current';

  if jsonb_typeof(v_staged) = 'object' then
    select draft.draft_id, draft.venue, draft.location
      into v_draft_id, v_venue, v_location
    from public.pick_event_drafts draft
    where draft.state = 'staged'
      and draft.event_id = v_staged->>'event_id'
    order by draft.synced_at desc
    limit 1;

    if v_draft_id is not null then
      select coalesce(jsonb_agg(
        item || jsonb_build_object('weight_class', bout.weight_class)
        order by ordinality
      ), '[]'::jsonb)
        into v_bouts
      from jsonb_array_elements(v_staged->'bouts') with ordinality source(item, ordinality)
      join public.pick_event_draft_bouts bout
        on bout.draft_id = v_draft_id
       and bout.bout_id = source.item->>'bout_id';

      v_staged := jsonb_set(v_staged, '{venue}', coalesce(to_jsonb(v_venue), 'null'::jsonb), true);
      v_staged := jsonb_set(v_staged, '{location}', coalesce(to_jsonb(v_location), 'null'::jsonb), true);
      v_staged := jsonb_set(v_staged, '{bouts}', v_bouts, true);
    end if;
  end if;

  if jsonb_typeof(v_current) = 'object' then
    v_event_id := v_current->>'event_id';
    select event.venue, event.location
      into v_venue, v_location
    from public.pick_events event
    where event.event_id = v_event_id;

    select coalesce(jsonb_agg(
      item || jsonb_build_object('weight_class', bout.weight_class)
      order by ordinality
    ), '[]'::jsonb)
      into v_bouts
    from jsonb_array_elements(v_current->'bouts') with ordinality source(item, ordinality)
    join public.pick_bouts bout
      on bout.event_id = v_event_id
     and bout.bout_id = source.item->>'bout_id';

    v_current := jsonb_set(v_current, '{venue}', coalesce(to_jsonb(v_venue), 'null'::jsonb), true);
    v_current := jsonb_set(v_current, '{location}', coalesce(to_jsonb(v_location), 'null'::jsonb), true);
    v_current := jsonb_set(v_current, '{bouts}', v_bouts, true);
  end if;

  return jsonb_build_object('staged', v_staged, 'current', v_current);
end;
$$;
revoke all on function public.get_pick_monitoring_event_state()
  from public, anon, authenticated;
grant execute on function public.get_pick_monitoring_event_state()
  to service_role;

create or replace function private.pick_monitoring_finding_is_current(
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
  v_event public.pick_events;
  v_bout public.pick_bouts;
  v_proposal jsonb := p_finding.source_details->'approval_proposal';
  v_action text := v_proposal->>'action';
  v_field text := coalesce(
    p_finding.source_details->>'change_field',
    case
      when p_finding.summary ~* '^Venue ' then 'venue'
      when p_finding.summary ~* '^Location ' then 'location'
      when p_finding.summary ~* '^Weight class ' then 'weight_class'
      else null
    end
  );
  v_current_order jsonb;
  v_current_value text;
  v_after_text text := p_finding.after_value #>> '{}';
  v_matches boolean;
begin
  if p_monitored_kind <> 'current' then
    return true;
  end if;
  if p_finding.event_id is distinct from p_monitored_event_id then
    return false;
  end if;

  select * into v_event
  from public.pick_events event
  where event.event_id = p_monitored_event_id
    and event.status = 'upcoming'
    and least(event.starts_at, event.locks_at) > now();
  if not found then return false; end if;

  if v_action = 'update_event_metadata' then
    v_current_value := case v_proposal->>'field'
      when 'venue' then nullif(trim(v_event.venue), '')
      when 'location' then nullif(trim(v_event.location), '')
      else null
    end;
    return not private.pick_monitoring_text_equivalent(v_current_value, v_proposal->>'proposed_value')
      and private.pick_monitoring_text_equivalent(v_current_value, v_proposal->>'expected_value');
  end if;

  if p_finding.bout_id is not null then
    select * into v_bout
    from public.pick_bouts bout
    where bout.event_id = p_monitored_event_id
      and bout.bout_id = p_finding.bout_id;
  end if;

  if v_action = 'update_bout_weight_class' then
    if v_bout.bout_id is null then return false; end if;
    return v_bout.red_fighter_slug = v_proposal->>'expected_red_fighter_slug'
      and v_bout.blue_fighter_slug = v_proposal->>'expected_blue_fighter_slug'
      and private.pick_monitoring_text_equivalent(v_bout.weight_class, v_proposal->>'expected_weight_class')
      and not private.pick_monitoring_text_equivalent(v_bout.weight_class, v_proposal->>'proposed_weight_class');
  elsif v_action = 'adjust_event_lock' then
    return v_event.locks_at = (v_proposal->>'expected_locks_at')::timestamptz
      and v_event.locks_at <> (v_proposal->>'proposed_locks_at')::timestamptz;
  elsif v_action = 'remove_bout' then
    if v_bout.bout_id is null then return false; end if;
    return v_bout.included_in_picks
      and v_bout.red_fighter_slug = v_proposal->>'expected_red_fighter_slug'
      and v_bout.blue_fighter_slug = v_proposal->>'expected_blue_fighter_slug';
  elsif v_action = 'replace_fighter' then
    if v_bout.bout_id is null then return false; end if;
    return v_bout.red_fighter_slug = v_proposal->>'expected_red_fighter_slug'
      and v_bout.blue_fighter_slug = v_proposal->>'expected_blue_fighter_slug';
  elsif v_action = 'reorder_card' then
    select coalesce(jsonb_agg(to_jsonb(bout.bout_id) order by bout.position), '[]'::jsonb)
      into v_current_order
    from public.pick_bouts bout
    where bout.event_id = p_monitored_event_id;
    return v_current_order = v_proposal->'expected_bout_ids'
      and v_current_order <> v_proposal->'proposed_bout_ids';
  end if;

  -- Reconcile historical findings created before structured proposals existed.
  if p_finding.finding_type = 'card_change' and v_field = 'venue' then
    return not private.pick_monitoring_text_equivalent(v_event.venue, v_after_text);
  elsif p_finding.finding_type = 'card_change' and v_field = 'location' then
    return not private.pick_monitoring_text_equivalent(v_event.location, v_after_text);
  elsif p_finding.finding_type = 'card_change' and v_field = 'weight_class' then
    if v_bout.bout_id is not null then
      return not private.pick_monitoring_text_equivalent(v_bout.weight_class, v_after_text);
    end if;
    select exists (
      select 1
      from public.pick_bouts bout
      where bout.event_id = p_monitored_event_id
        and p_finding.summary in (
          'Weight class changed for ' || bout.red_fighter_name || ' vs. ' || bout.blue_fighter_name || '.',
          'Weight class found for ' || bout.red_fighter_name || ' vs. ' || bout.blue_fighter_name || '.'
        )
        and private.pick_monitoring_text_equivalent(bout.weight_class, v_after_text)
    ) into v_matches;
    return not v_matches;
  end if;

  if p_finding.bout_id is not null and v_bout.bout_id is null then
    return false;
  end if;
  if p_finding.before_value is not null
    and p_finding.after_value is not null
    and p_finding.before_value = p_finding.after_value then
    return false;
  end if;
  return true;
end;
$$;
revoke all on function private.pick_monitoring_finding_is_current(
  public.pick_monitoring_findings, text, text
) from public, anon, authenticated, service_role;

-- Keep the existing owner projection as the one source for automation status and
-- history, replacing only its pending slice with current, unique findings.
alter function public.get_pick_monitoring_inbox()
  rename to get_pick_monitoring_inbox_actionable_core;
alter function public.get_pick_monitoring_inbox_actionable_core()
  set schema private;
revoke all on function private.get_pick_monitoring_inbox_actionable_core()
  from public, anon, authenticated;

create function public.get_pick_monitoring_inbox()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_value jsonb;
  v_event jsonb;
  v_kind text;
  v_event_id text;
  v_source_event_identity text;
  v_pending_count integer := 0;
  v_pending jsonb := '[]'::jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  v_value := private.get_pick_monitoring_inbox_actionable_core();
  v_event := v_value->'monitored_event';
  if jsonb_typeof(v_event) <> 'object' then
    v_value := jsonb_set(v_value, '{unresolved_count}', '0'::jsonb, true);
    return jsonb_set(v_value, '{new_findings}', '[]'::jsonb, true);
  end if;

  v_kind := v_event->>'kind';
  v_event_id := v_event->>'event_id';
  v_source_event_identity := v_event->>'source_event_identity';

  with ranked as (
    select item.*,
      run.trigger_kind,
      run.status as run_status,
      row_number() over (
        partition by private.pick_monitoring_finding_identity(item)
        order by item.detected_at desc, item.created_at desc, item.finding_id desc
      ) as identity_rank
    from public.pick_monitoring_findings item
    join public.pick_monitoring_runs run on run.run_id = item.run_id
    where run.source_event_identity = v_source_event_identity
      and (
        (v_kind = 'current' and item.event_id = v_event_id)
        or (v_kind = 'staged' and item.event_id is null)
      )
  )
  select count(*)::integer
    into v_pending_count
  from ranked item
  where item.identity_rank = 1
    and item.review_status = 'new'
    and private.pick_monitoring_finding_is_current(item, v_kind, v_event_id);

  with ranked as (
    select item.*,
      run.trigger_kind,
      run.status as run_status,
      row_number() over (
        partition by private.pick_monitoring_finding_identity(item)
        order by item.detected_at desc, item.created_at desc, item.finding_id desc
      ) as identity_rank
    from public.pick_monitoring_findings item
    join public.pick_monitoring_runs run on run.run_id = item.run_id
    where run.source_event_identity = v_source_event_identity
      and (
        (v_kind = 'current' and item.event_id = v_event_id)
        or (v_kind = 'staged' and item.event_id is null)
      )
  ), current_pending as (
    select *
    from ranked item
    where item.identity_rank = 1
      and item.review_status = 'new'
      and private.pick_monitoring_finding_is_current(item, v_kind, v_event_id)
    order by item.detected_at desc, item.created_at desc
    limit 50
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'finding_id', finding.finding_id,
    'run_id', finding.run_id,
    'trigger_kind', finding.trigger_kind,
    'run_status', finding.run_status,
    'finding_key', finding.finding_key,
    'finding_type', finding.finding_type,
    'severity', finding.severity,
    'review_status', finding.review_status,
    'matchup_identity', finding.matchup_identity,
    'bout_id', finding.bout_id,
    'summary', finding.summary,
    'before_value', finding.before_value,
    'after_value', finding.after_value,
    'source_details', finding.source_details,
    'detected_at', finding.detected_at,
    'reviewed_at', finding.reviewed_at
  ) order by finding.detected_at desc), '[]'::jsonb)
    into v_pending
  from current_pending finding;

  v_value := jsonb_set(v_value, '{unresolved_count}', to_jsonb(v_pending_count), true);
  return jsonb_set(v_value, '{new_findings}', v_pending, true);
end;
$$;
revoke all on function public.get_pick_monitoring_inbox()
  from public, anon;
grant execute on function public.get_pick_monitoring_inbox()
  to authenticated;

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
  v_result jsonb;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;
  if length(v_reason) < 3 or length(v_reason) > 500 then
    raise exception 'monitoring approval reason required';
  end if;

  select * into v_finding
  from public.pick_monitoring_findings finding
  where finding.finding_id = p_finding_id
  for update;
  if not found then raise exception 'monitoring finding not found'; end if;
  if v_finding.review_status <> 'new' then
    raise exception 'monitoring finding is already resolved';
  end if;
  if v_finding.finding_type <> 'card_change' then
    raise exception 'monitoring finding is not an approvable card change';
  end if;

  select * into v_run
  from public.pick_monitoring_runs run
  where run.run_id = v_finding.run_id
  for share;
  if v_run.event_id is null or v_finding.event_id is distinct from v_run.event_id then
    raise exception 'only a current published event finding can be approved';
  end if;

  v_identity := private.pick_monitoring_finding_identity(v_finding);
  if exists (
    select 1
    from public.pick_monitoring_findings newer
    join public.pick_monitoring_runs newer_run on newer_run.run_id = newer.run_id
    where newer.finding_id <> v_finding.finding_id
      and newer_run.source_event_identity = v_run.source_event_identity
      and newer.event_id is not distinct from v_finding.event_id
      and private.pick_monitoring_finding_identity(newer) = v_identity
      and (newer.detected_at, newer.created_at, newer.finding_id)
        > (v_finding.detected_at, v_finding.created_at, v_finding.finding_id)
  ) then
    raise exception 'newer monitoring evidence exists; refresh Manage Open Picks';
  end if;

  v_proposal := v_finding.source_details->'approval_proposal';
  if jsonb_typeof(v_proposal) <> 'object' then
    raise exception 'monitoring finding has no supported approval proposal';
  end if;
  if v_proposal->>'event_id' is distinct from v_run.event_id then
    raise exception 'monitoring approval event does not match the finding';
  end if;

  v_action := v_proposal->>'action';
  if v_action = 'adjust_event_lock' then
    v_result := to_jsonb(public.adjust_pick_event_lock_time(
      v_run.event_id,
      (v_proposal->>'proposed_locks_at')::timestamptz,
      (v_proposal->>'expected_locks_at')::timestamptz,
      v_reason
    ));
  elsif v_action = 'update_event_metadata' then
    v_result := to_jsonb(public.approve_pick_event_metadata_change(
      v_run.event_id,
      v_proposal->>'field',
      v_proposal->>'expected_value',
      v_proposal->>'proposed_value',
      v_reason
    ));
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
  elsif v_action = 'remove_bout' then
    v_result := public.approve_pick_bout_inclusion(
      v_run.event_id,
      v_proposal->>'bout_id',
      false,
      (v_proposal->>'expected_included_in_picks')::boolean,
      v_proposal->>'expected_red_fighter_slug',
      v_proposal->>'expected_blue_fighter_slug',
      v_reason
    );
  elsif v_action = 'replace_fighter' then
    v_result := to_jsonb(public.approve_pick_fighter_replacement(
      v_run.event_id,
      v_proposal->>'bout_id',
      v_proposal->>'corner',
      v_proposal->>'expected_red_fighter_slug',
      v_proposal->>'expected_blue_fighter_slug',
      v_proposal->>'replacement_fighter_slug',
      v_proposal->>'replacement_fighter_name',
      v_reason
    ));
  elsif v_action = 'reorder_card' then
    v_result := public.approve_pick_card_reorder(
      v_run.event_id,
      array(select jsonb_array_elements_text(v_proposal->'expected_bout_ids')),
      array(select jsonb_array_elements_text(v_proposal->'proposed_bout_ids')),
      v_reason
    );
  else
    raise exception 'monitoring finding approval action is unsupported';
  end if;

  update public.pick_monitoring_findings
  set review_status = 'reviewed',
      reviewed_at = now(),
      reviewed_by = auth.uid()
  where finding_id = v_finding.finding_id
    and review_status = 'new';
  if not found then raise exception 'monitoring finding changed during approval'; end if;

  return jsonb_build_object(
    'finding_id', v_finding.finding_id,
    'review_status', 'reviewed',
    'action', v_action,
    'result', v_result
  );
end;
$$;
revoke all on function public.approve_pick_monitoring_finding(uuid,text)
  from public, anon;
grant execute on function public.approve_pick_monitoring_finding(uuid,text)
  to authenticated;

notify pgrst, 'reload schema';
