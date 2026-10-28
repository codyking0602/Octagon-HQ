-- A newly detected add_bout finding names a bout that must not exist yet.
-- Keep the existing current-finding owner, but do not discard that proposal merely
-- because its future bout_id is absent from public.pick_bouts. The canonical
-- approval/apply boundary still owns all add-fight stale-state and safety checks.

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

  if v_action = 'add_bout' then
    return v_bout.bout_id is null;
  elsif v_action = 'update_bout_weight_class' then
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

notify pgrst, 'reload schema';
