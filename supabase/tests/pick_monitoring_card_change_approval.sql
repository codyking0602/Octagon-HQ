begin;
select set_config('request.jwt.claim.role', 'service_role', true);

create function pg_temp.monitor_run(
  p_event_id text,
  p_seconds integer,
  p_trigger text default 'manual'
)
returns uuid
language plpgsql
as $$
declare
  v_run uuid;
begin
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    p_trigger,
    'completed',
    'ufc:events/' || p_event_id,
    p_event_id,
    now(),
    now() + make_interval(secs => p_seconds)
  ) returning run_id into v_run;
  return v_run;
end;
$$;

create function pg_temp.monitor_finding(
  p_run_id uuid,
  p_event_id text,
  p_key text,
  p_type text,
  p_summary text,
  p_source_details jsonb,
  p_before jsonb default null,
  p_after jsonb default null,
  p_bout_id text default null,
  p_matchup text default null,
  p_detected_offset integer default 0
)
returns uuid
language plpgsql
as $$
declare
  v_finding uuid;
begin
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity,
    matchup_identity, bout_id, summary, before_value, after_value,
    source_details, detected_at
  ) values(
    p_run_id, p_event_id, p_key, p_type,
    case when p_type = 'odds_available' then 'info' else 'warning' end,
    p_matchup, p_bout_id, p_summary, p_before, p_after,
    p_source_details, now() + make_interval(secs => p_detected_offset)
  ) returning finding_id into v_finding;
  return v_finding;
end;
$$;

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_run uuid;
  v_second_run uuid;
  v_finding uuid;
  v_newer_finding uuid;
  v_old_lock timestamptz := now() + interval '4 days';
  v_new_lock timestamptz := now() + interval '3 days';
  v_inbox jsonb;
  v_pending jsonb;
  v_state jsonb;
begin
  update public.pick_events
  set status = 'complete', completed_at = coalesce(completed_at, now())
  where status in ('upcoming', 'locked');

  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (
      v_owner, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'monitoring-approval-owner@login.octagon-hq.app', '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING APPROVAL OWNER', 'historical_unclaimed', true)
    ),
    (
      v_other, '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'monitoring-approval-other@login.octagon-hq.app', '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING APPROVAL OTHER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Monitor Owner', 'MO');
  perform public.register_unclaimed_pin_profile(v_other, 'Monitor Other', 'MX');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status
  ) values(
    'monitor-approval', 'UFC Approval Test', 'Alpha vs Beta',
    'Arena', 'Dallas', now() + interval '5 days', v_old_lock,
    2199, 'upcoming'
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name, blue_fighter_slug, blue_fighter_name,
    result_status, winner_fighter_slug, result_recorded_at
  ) values
    ('monitor-approval', 'approval-a-b', 1, 'Lightweight', 'alpha', 'Alpha', 'beta', 'Beta', 'pending', null, null),
    ('monitor-approval', 'approval-c-d', 2, 'Welterweight', 'gamma', 'Gamma', 'delta', 'Delta', 'pending', null, null),
    ('monitor-approval', 'approval-e-f', 3, 'Middleweight', 'epsilon', 'Epsilon', 'phi', 'Phi', 'pending', null, null),
    ('monitor-approval', 'approval-g-h', 4, 'Heavyweight', 'gimel', 'Gimel', 'heta', 'Heta', 'pending', null, null);

  -- The service projection must carry the canonical fields used for stale reconciliation.
  v_state := public.get_pick_monitoring_event_state();
  if v_state->'current'->>'venue' <> 'Arena'
    or v_state->'current'->>'location' <> 'Dallas'
    or v_state->'current'->'bouts'->0->>'weight_class' is null then
    raise exception 'monitoring event state omitted canonical venue, location, or weight class';
  end if;

  -- Non-owner approval remains rejected before any mutation.
  v_run := pg_temp.monitor_run('monitor-approval', 0);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'non-owner', 'card_change',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout', 'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b', 'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha', 'expected_blue_fighter_slug', 'beta'
      )
    ), null, null, 'approval-a-b', 'alpha|beta'
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_other::text, true);
  begin
    perform public.approve_pick_monitoring_finding(v_finding, 'Not allowed');
    raise exception 'non-owner approved monitoring finding';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;
  if not (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-a-b') then
    raise exception 'non-owner monitoring approval changed canonical state';
  end if;
  perform public.review_pick_monitoring_finding(v_finding, 'dismissed');

  perform set_config('request.jwt.claim.sub', v_owner::text, true);

  -- Event-wide deadline approval.
  v_run := pg_temp.monitor_run('monitor-approval', 1);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'deadline', 'card_change',
    'Update the event-wide Picks deadline.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:locks_at',
      'change_field', 'locks_at',
      'approval_proposal', jsonb_build_object(
        'action', 'adjust_event_lock', 'event_id', 'monitor-approval',
        'expected_locks_at', v_old_lock, 'proposed_locks_at', v_new_lock
      )
    ), to_jsonb(v_old_lock), to_jsonb(v_new_lock)
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official start window confirmed');
  if (select locks_at from public.pick_events where event_id = 'monitor-approval') is distinct from v_new_lock then
    raise exception 'approved monitoring deadline was not applied';
  end if;

  -- Venue and location use the same audited event-metadata owner.
  v_run := pg_temp.monitor_run('monitor-approval', 2);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'venue-meta-apex', 'card_change', 'Venue changed.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata', 'event_id', 'monitor-approval',
        'field', 'venue', 'expected_value', 'Arena', 'proposed_value', 'Meta APEX'
      )
    ), to_jsonb('Arena'::text), to_jsonb('Meta APEX'::text)
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official venue confirmed');
  if (select venue from public.pick_events where event_id = 'monitor-approval') <> 'Meta APEX' then
    raise exception 'approved monitoring venue was not applied';
  end if;

  v_run := pg_temp.monitor_run('monitor-approval', 3);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'location-vegas', 'card_change', 'Location changed.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:location',
      'change_field', 'location',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata', 'event_id', 'monitor-approval',
        'field', 'location', 'expected_value', 'Dallas',
        'proposed_value', 'Las Vegas, Nevada'
      )
    ), to_jsonb('Dallas'::text), to_jsonb('Las Vegas, Nevada'::text)
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official location confirmed');
  if (select location from public.pick_events where event_id = 'monitor-approval') <> 'Las Vegas, Nevada' then
    raise exception 'approved monitoring location was not applied';
  end if;

  -- Weight class uses the same expected-matchup and audit protections.
  v_run := pg_temp.monitor_run('monitor-approval', 4);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'weight-catchweight', 'card_change',
    'Weight class changed for Alpha vs. Beta.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:weight_class',
      'change_field', 'weight_class',
      'approval_proposal', jsonb_build_object(
        'action', 'update_bout_weight_class', 'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b', 'expected_weight_class', 'Lightweight',
        'proposed_weight_class', 'Catchweight',
        'expected_red_fighter_slug', 'alpha', 'expected_blue_fighter_slug', 'beta'
      )
    ), to_jsonb('Lightweight'::text), to_jsonb('Catchweight'::text),
    'approval-a-b', 'alpha|beta'
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official weight class confirmed');
  if (select weight_class from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-a-b') <> 'Catchweight' then
    raise exception 'approved monitoring weight class was not applied';
  end if;

  -- Existing reorder, replacement, and removal dispatches remain canonical.
  v_run := pg_temp.monitor_run('monitor-approval', 5, 'scheduled');
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'reorder', 'card_change',
    'Apply the detected fight order.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:fight_order',
      'change_field', 'fight_order',
      'approval_proposal', jsonb_build_object(
        'action', 'reorder_card', 'event_id', 'monitor-approval',
        'expected_bout_ids', jsonb_build_array('approval-a-b', 'approval-c-d', 'approval-e-f', 'approval-g-h'),
        'proposed_bout_ids', jsonb_build_array('approval-g-h', 'approval-e-f', 'approval-c-d', 'approval-a-b')
      )
    )
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official fight order confirmed');
  if (select bout_id from public.pick_bouts where event_id = 'monitor-approval' order by position limit 1) <> 'approval-g-h' then
    raise exception 'approved monitoring reorder was not applied';
  end if;

  v_run := pg_temp.monitor_run('monitor-approval', 6);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'replace', 'card_change',
    'Replace Delta with Replacement.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-c-d:fighters',
      'change_field', 'fighters',
      'approval_proposal', jsonb_build_object(
        'action', 'replace_fighter', 'event_id', 'monitor-approval',
        'bout_id', 'approval-c-d', 'corner', 'blue',
        'expected_red_fighter_slug', 'gamma', 'expected_blue_fighter_slug', 'delta',
        'replacement_fighter_slug', 'replacement',
        'replacement_fighter_name', 'Replacement'
      )
    ), null, null, 'approval-c-d', 'gamma|delta'
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Official replacement confirmed');
  if (select blue_fighter_slug from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-c-d') <> 'replacement' then
    raise exception 'approved monitoring replacement was not applied';
  end if;

  v_run := pg_temp.monitor_run('monitor-approval', 7, 'scheduled');
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'remove', 'card_change',
    'Remove Epsilon vs. Phi from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-e-f:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout', 'event_id', 'monitor-approval',
        'bout_id', 'approval-e-f', 'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'epsilon', 'expected_blue_fighter_slug', 'phi'
      )
    ), null, null, 'approval-e-f', 'epsilon|phi'
  );
  perform public.approve_pick_monitoring_finding(v_finding, 'Fight left the monitored main card');
  if (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-e-f') then
    raise exception 'approved monitoring removal was not applied';
  end if;

  -- Newer evidence must supersede only the same subject and field.
  v_run := pg_temp.monitor_run('monitor-approval', 8);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'stale-remove-old', 'card_change',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout', 'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b', 'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha', 'expected_blue_fighter_slug', 'beta'
      )
    ), null, null, 'approval-a-b', 'alpha|beta'
  );
  v_second_run := pg_temp.monitor_run('monitor-approval', 9, 'scheduled');
  v_newer_finding := pg_temp.monitor_finding(
    v_second_run, 'monitor-approval', 'stale-remove-new', 'card_change',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout', 'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b', 'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha', 'expected_blue_fighter_slug', 'beta'
      )
    ), null, null, 'approval-a-b', 'alpha|beta', 1
  );
  begin
    perform public.approve_pick_monitoring_finding(v_finding, 'Superseded source proposal');
    raise exception 'stale monitoring proposal was accepted';
  exception when others then
    if sqlerrm not like '%newer monitoring evidence exists; refresh Manage Open Picks%' then raise; end if;
  end;
  if (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-a-b') is not true
    or (select review_status from public.pick_monitoring_findings where finding_id = v_finding) <> 'new' then
    raise exception 'stale monitoring proposal changed canonical state';
  end if;
  perform public.review_pick_monitoring_finding(v_newer_finding, 'dismissed');

  -- Exact duplicates do not recreate equivalent pending work.
  v_run := pg_temp.monitor_run('monitor-approval', 10);
  v_finding := pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'duplicate-provider-warning', 'provider_error',
    'Provider ambiguity remains.',
    jsonb_build_object('finding_identity', 'ufc:events/monitor-approval:provider:ambiguity')
  );
  v_second_run := pg_temp.monitor_run('monitor-approval', 11, 'scheduled');
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    source_details, detected_at
  ) values(
    v_second_run, 'monitor-approval', 'duplicate-provider-warning',
    'provider_error', 'warning', 'Provider ambiguity remains.',
    jsonb_build_object('finding_identity', 'ufc:events/monitor-approval:provider:ambiguity'),
    now() + interval '1 second'
  );
  if (
    select count(*) from public.pick_monitoring_findings
    where finding_key = 'duplicate-provider-warning' and review_status = 'new'
  ) <> 1 then
    raise exception 'equivalent monitoring findings did not collapse to one pending item';
  end if;
  perform public.review_pick_monitoring_finding(v_finding, 'dismissed');

  -- Historical stale weight discovery is excluded once canonical already equals proposed.
  v_run := pg_temp.monitor_run('monitor-approval', 12);
  perform pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'stale-weight-current', 'card_change',
    'Weight class found for Alpha vs. Beta.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:weight_class',
      'change_field', 'weight_class'
    ), null, to_jsonb('Catchweight'::text), 'approval-a-b', 'alpha|beta'
  );

  -- Latest same-subject proposal supersedes the older pending venue proposal.
  v_run := pg_temp.monitor_run('monitor-approval', 13);
  perform pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'venue-first', 'card_change', 'Venue changed.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata', 'event_id', 'monitor-approval',
        'field', 'venue', 'expected_value', 'Meta APEX', 'proposed_value', 'First Arena'
      )
    ), to_jsonb('Meta APEX'::text), to_jsonb('First Arena'::text)
  );
  v_run := pg_temp.monitor_run('monitor-approval', 14, 'scheduled');
  perform pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'venue-latest', 'card_change', 'Venue changed.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata', 'event_id', 'monitor-approval',
        'field', 'venue', 'expected_value', 'Meta APEX', 'proposed_value', 'Latest Arena'
      )
    ), to_jsonb('Meta APEX'::text), to_jsonb('Latest Arena'::text), null, null, 1
  );

  -- Auto-applied odds remain visible but have no approval proposal.
  perform pg_temp.monitor_finding(
    v_run, 'monitor-approval', 'odds-applied', 'odds_change',
    'American odds changed and were applied automatically.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:odds',
      'change_field', 'odds', 'automatically_applied', true
    ),
    jsonb_build_array(jsonb_build_object('fighter_identity', 'alpha', 'american_odds', -120)),
    jsonb_build_array(jsonb_build_object('fighter_identity', 'alpha', 'american_odds', -135)),
    'approval-a-b', 'alpha|beta', 1
  );

  v_inbox := public.get_pick_monitoring_inbox();
  v_pending := v_inbox->'new_findings';
  if (v_inbox->>'unresolved_count')::integer <> jsonb_array_length(v_pending) then
    raise exception 'pending count does not equal unique visible unresolved findings';
  end if;
  if jsonb_array_length(v_pending) <> 2 then
    raise exception 'expected only newest venue and applied odds findings, got %', jsonb_array_length(v_pending);
  end if;
  if not exists (
    select 1 from jsonb_array_elements(v_pending) item
    where item->>'finding_key' = 'venue-latest'
  ) or exists (
    select 1 from jsonb_array_elements(v_pending) item
    where item->>'finding_key' in ('venue-first', 'stale-weight-current')
  ) then
    raise exception 'pending inbox did not reconcile stale or superseded findings';
  end if;
  if not exists (
    select 1 from jsonb_array_elements(v_pending) item
    where item->>'finding_key' = 'odds-applied'
      and item->'source_details'->>'automatically_applied' = 'true'
      and not (item->'source_details' ? 'approval_proposal')
  ) then
    raise exception 'automatically applied odds were not acknowledgment-only';
  end if;

  if (select count(*) from public.pick_card_change_actions where event_id = 'monitor-approval') <> 7 then
    raise exception 'monitoring approvals did not preserve canonical audit ownership';
  end if;
end;
$$;

rollback;
