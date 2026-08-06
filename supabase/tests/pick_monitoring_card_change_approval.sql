begin;
select set_config('request.jwt.claim.role', 'service_role', true);

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
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming', 'locked');

  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'monitoring-approval-owner@login.octagon-hq.app', '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING APPROVAL OWNER', 'historical_unclaimed', true)
    ),
    (
      v_other,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'monitoring-approval-other@login.octagon-hq.app', '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING APPROVAL OTHER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Monitor Owner', 'MO');
  perform public.register_unclaimed_pin_profile(v_other, 'Monitor Other', 'MX');
  insert into public.pick_control_owners(profile_id) values(v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location, starts_at, locks_at, season, status,
    source_event_key, source_url
  ) values(
    'monitor-approval',
    'UFC Approval Test',
    'Alpha vs Beta',
    'Arena',
    'Dallas',
    now() + interval '5 days',
    v_old_lock,
    2199,
    'upcoming',
    'events/monitor-approval',
    'https://www.ufc.com/event/monitor-approval'
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

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now()
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'non-owner', 'card_change', 'warning',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b',
        'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha',
        'expected_blue_fighter_slug', 'beta'
      )
    ), now()
  ) returning finding_id into v_finding;

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

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '1 second'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'deadline', 'card_change', 'warning',
    'Update the event-wide Picks deadline.', to_jsonb(v_old_lock), to_jsonb(v_new_lock),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:locks_at',
      'change_field', 'locks_at',
      'approval_proposal', jsonb_build_object(
        'action', 'adjust_event_lock',
        'event_id', 'monitor-approval',
        'expected_locks_at', v_old_lock,
        'proposed_locks_at', v_new_lock
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official start window confirmed');
  if (select locks_at from public.pick_events where event_id = 'monitor-approval') is distinct from v_new_lock then
    raise exception 'approved monitoring deadline was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '2 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'venue-meta-apex', 'card_change', 'warning',
    'Venue changed.', to_jsonb('Arena'::text), to_jsonb('Meta APEX'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata',
        'event_id', 'monitor-approval',
        'field', 'venue',
        'expected_value', 'Arena',
        'proposed_value', 'Meta APEX'
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official venue confirmed');
  if (select venue from public.pick_events where event_id = 'monitor-approval') <> 'Meta APEX' then
    raise exception 'approved monitoring venue was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '3 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'location-vegas', 'card_change', 'warning',
    'Location changed.', to_jsonb('Dallas'::text), to_jsonb('Las Vegas, Nevada'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:location',
      'change_field', 'location',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata',
        'event_id', 'monitor-approval',
        'field', 'location',
        'expected_value', 'Dallas',
        'proposed_value', 'Las Vegas, Nevada'
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official location confirmed');
  if (select location from public.pick_events where event_id = 'monitor-approval') <> 'Las Vegas, Nevada' then
    raise exception 'approved monitoring location was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '4 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'weight-catchweight', 'card_change', 'warning',
    'alpha|beta', 'approval-a-b', 'Weight class changed for Alpha vs. Beta.',
    to_jsonb('Lightweight'::text), to_jsonb('Catchweight'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:weight_class',
      'change_field', 'weight_class',
      'approval_proposal', jsonb_build_object(
        'action', 'update_bout_weight_class',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b',
        'expected_weight_class', 'Lightweight',
        'proposed_weight_class', 'Catchweight',
        'expected_red_fighter_slug', 'alpha',
        'expected_blue_fighter_slug', 'beta'
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official weight class confirmed');
  if (select weight_class from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-a-b') <> 'Catchweight' then
    raise exception 'approved monitoring weight class was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '5 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'reorder', 'card_change', 'warning',
    'Apply the detected fight order.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:fight_order',
      'change_field', 'fight_order',
      'approval_proposal', jsonb_build_object(
        'action', 'reorder_card',
        'event_id', 'monitor-approval',
        'expected_bout_ids', jsonb_build_array('approval-a-b', 'approval-c-d', 'approval-e-f', 'approval-g-h'),
        'proposed_bout_ids', jsonb_build_array('approval-g-h', 'approval-e-f', 'approval-c-d', 'approval-a-b')
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official fight order confirmed');
  if (select bout_id from public.pick_bouts where event_id = 'monitor-approval' order by position limit 1) <> 'approval-g-h' then
    raise exception 'approved monitoring reorder was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '6 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'replace', 'card_change', 'warning', 'gamma|delta', 'approval-c-d',
    'Replace Delta with Replacement.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-c-d:fighters',
      'change_field', 'fighters',
      'approval_proposal', jsonb_build_object(
        'action', 'replace_fighter',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-c-d',
        'corner', 'blue',
        'expected_red_fighter_slug', 'gamma',
        'expected_blue_fighter_slug', 'delta',
        'replacement_fighter_slug', 'replacement',
        'replacement_fighter_name', 'Replacement'
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official replacement confirmed');
  if (select blue_fighter_slug from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-c-d') <> 'replacement' then
    raise exception 'approved monitoring replacement was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '7 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'remove', 'card_change', 'warning', 'epsilon|phi', 'approval-e-f',
    'Remove Epsilon vs. Phi from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-e-f:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-e-f',
        'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'epsilon',
        'expected_blue_fighter_slug', 'phi'
      )
    ), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Fight left the monitored main card');
  if (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-e-f') then
    raise exception 'approved monitoring removal was not applied';
  end if;

  -- A newer finding for the same event, subject, and field supersedes the older one.
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '8 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'stale-remove-old', 'card_change', 'warning', 'alpha|beta', 'approval-a-b',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b',
        'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha',
        'expected_blue_fighter_slug', 'beta'
      )
    ), now()
  ) returning finding_id into v_finding;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '9 seconds'
  ) returning run_id into v_second_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_second_run, 'monitor-approval', 'stale-remove-new', 'card_change', 'warning', 'alpha|beta', 'approval-a-b',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:included_in_picks',
      'change_field', 'included_in_picks',
      'approval_proposal', jsonb_build_object(
        'action', 'remove_bout',
        'event_id', 'monitor-approval',
        'bout_id', 'approval-a-b',
        'expected_included_in_picks', true,
        'expected_red_fighter_slug', 'alpha',
        'expected_blue_fighter_slug', 'beta'
      )
    ), now() + interval '1 second'
  ) returning finding_id into v_newer_finding;

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

  -- Repeated equivalent findings are inserted only once across monitoring runs.
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '10 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'duplicate-provider-warning', 'provider_error', 'warning',
    'Provider ambiguity remains.',
    jsonb_build_object('finding_identity', 'ufc:events/monitor-approval:provider:ambiguity'), now()
  ) returning finding_id into v_finding;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '11 seconds'
  ) returning run_id into v_second_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary, source_details, detected_at
  ) values(
    v_second_run, 'monitor-approval', 'duplicate-provider-warning', 'provider_error', 'warning',
    'Provider ambiguity remains.',
    jsonb_build_object('finding_identity', 'ufc:events/monitor-approval:provider:ambiguity'), now() + interval '1 second'
  );
  if (
    select count(*)
    from public.pick_monitoring_findings
    where finding_key = 'duplicate-provider-warning'
      and review_status = 'new'
  ) <> 1 then
    raise exception 'equivalent monitoring findings did not collapse to one pending item';
  end if;
  perform public.review_pick_monitoring_finding(v_finding, 'dismissed');

  -- A proposed value already equal to canonical state is not pending.
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '12 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'stale-weight-current', 'card_change', 'warning',
    'alpha|beta', 'approval-a-b', 'Weight class found for Alpha vs. Beta.',
    null, to_jsonb('Catchweight'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:weight_class',
      'change_field', 'weight_class'
    ), now()
  );

  -- Newest same-field proposal is the only pending venue item.
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '13 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'venue-first', 'card_change', 'warning',
    'Venue changed.', to_jsonb('Meta APEX'::text), to_jsonb('First Arena'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata',
        'event_id', 'monitor-approval',
        'field', 'venue',
        'expected_value', 'Meta APEX',
        'proposed_value', 'First Arena'
      )
    ), now()
  );

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:events/monitor-approval', 'monitor-approval', now(), now() + interval '14 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'venue-latest', 'card_change', 'warning',
    'Venue changed.', to_jsonb('Meta APEX'::text), to_jsonb('Latest Arena'::text),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:event:venue',
      'change_field', 'venue',
      'approval_proposal', jsonb_build_object(
        'action', 'update_event_metadata',
        'event_id', 'monitor-approval',
        'field', 'venue',
        'expected_value', 'Meta APEX',
        'proposed_value', 'Latest Arena'
      )
    ), now() + interval '1 second'
  );

  -- Automatically applied odds remain acknowledgment-only and visible.
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'odds-applied', 'odds_change', 'warning',
    'alpha|beta', 'approval-a-b', 'American odds changed and were applied automatically.',
    jsonb_build_array(jsonb_build_object('fighter_identity', 'alpha', 'american_odds', -120)),
    jsonb_build_array(jsonb_build_object('fighter_identity', 'alpha', 'american_odds', -135)),
    jsonb_build_object(
      'finding_identity', 'ufc:events/monitor-approval:bout:approval-a-b:odds',
      'change_field', 'odds',
      'automatically_applied', true
    ), now() + interval '1 second'
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
