begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_run uuid;
  v_finding uuid;
  v_old_lock timestamptz := now() + interval '4 days';
  v_new_lock timestamptz := now() + interval '3 days';
begin
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
    event_id, name, subtitle, venue, location, starts_at, locks_at, season, status
  ) values(
    'monitor-approval',
    'UFC Approval Test',
    'Alpha vs Beta',
    'Arena',
    'Dallas',
    now() + interval '5 days',
    v_old_lock,
    2199,
    'upcoming'
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
    'manual', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now()
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'non-owner', 'card_change', 'warning',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'remove_bout',
      'event_id', 'monitor-approval',
      'bout_id', 'approval-a-b',
      'expected_included_in_picks', true,
      'expected_red_fighter_slug', 'alpha',
      'expected_blue_fighter_slug', 'beta'
    )), now()
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

  perform set_config('request.jwt.claim.sub', v_owner::text, true);

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '1 second'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    before_value, after_value, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'deadline', 'card_change', 'warning',
    'Update the event-wide Picks deadline.', to_jsonb(v_old_lock), to_jsonb(v_new_lock),
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'adjust_event_lock',
      'event_id', 'monitor-approval',
      'expected_locks_at', v_old_lock,
      'proposed_locks_at', v_new_lock
    )), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official start window confirmed');
  if (select locks_at from public.pick_events where event_id = 'monitor-approval') is distinct from v_new_lock then
    raise exception 'approved monitoring deadline was not applied';
  end if;
  if (select review_status from public.pick_monitoring_findings where finding_id = v_finding) <> 'reviewed' then
    raise exception 'approved deadline finding was not resolved';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '2 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, summary,
    source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'reorder', 'card_change', 'warning',
    'Apply the detected fight order.',
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'reorder_card',
      'event_id', 'monitor-approval',
      'expected_bout_ids', jsonb_build_array('approval-a-b', 'approval-c-d', 'approval-e-f', 'approval-g-h'),
      'proposed_bout_ids', jsonb_build_array('approval-g-h', 'approval-e-f', 'approval-c-d', 'approval-a-b')
    )), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official fight order confirmed');
  if (select bout_id from public.pick_bouts where event_id = 'monitor-approval' order by position limit 1) <> 'approval-g-h' then
    raise exception 'approved monitoring reorder was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '3 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'replace', 'card_change', 'warning', 'gamma|delta', 'approval-c-d',
    'Replace Delta with Replacement.',
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'replace_fighter',
      'event_id', 'monitor-approval',
      'bout_id', 'approval-c-d',
      'corner', 'blue',
      'expected_red_fighter_slug', 'gamma',
      'expected_blue_fighter_slug', 'delta',
      'replacement_fighter_slug', 'replacement',
      'replacement_fighter_name', 'Replacement'
    )), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Official replacement confirmed');
  if (select blue_fighter_slug from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-c-d') <> 'replacement' then
    raise exception 'approved monitoring replacement was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '4 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'remove', 'card_change', 'warning', 'epsilon|phi', 'approval-e-f',
    'Remove Epsilon vs. Phi from Picks.',
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'remove_bout',
      'event_id', 'monitor-approval',
      'bout_id', 'approval-e-f',
      'expected_included_in_picks', true,
      'expected_red_fighter_slug', 'epsilon',
      'expected_blue_fighter_slug', 'phi'
    )), now()
  ) returning finding_id into v_finding;
  perform public.approve_pick_monitoring_finding(v_finding, 'Fight left the monitored main card');
  if (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-e-f') then
    raise exception 'approved monitoring removal was not applied';
  end if;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'manual', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '5 seconds'
  ) returning run_id into v_run;
  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity, matchup_identity, bout_id,
    summary, source_details, detected_at
  ) values(
    v_run, 'monitor-approval', 'stale', 'card_change', 'warning', 'alpha|beta', 'approval-a-b',
    'Remove Alpha vs. Beta from Picks.',
    jsonb_build_object('approval_proposal', jsonb_build_object(
      'action', 'remove_bout',
      'event_id', 'monitor-approval',
      'bout_id', 'approval-a-b',
      'expected_included_in_picks', true,
      'expected_red_fighter_slug', 'alpha',
      'expected_blue_fighter_slug', 'beta'
    )), now()
  ) returning finding_id into v_finding;

  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id, started_at, completed_at
  ) values(
    'scheduled', 'completed', 'ufc:monitor-approval', 'monitor-approval', now(), now() + interval '6 seconds'
  );

  begin
    perform public.approve_pick_monitoring_finding(v_finding, 'Superseded source proposal');
    raise exception 'stale monitoring proposal was accepted';
  exception when others then
    if sqlerrm not like '%newer monitoring evidence exists; run a fresh check%' then raise; end if;
  end;
  if (select included_in_picks from public.pick_bouts where event_id = 'monitor-approval' and bout_id = 'approval-a-b') is not true
    or (select review_status from public.pick_monitoring_findings where finding_id = v_finding) <> 'new' then
    raise exception 'stale monitoring proposal changed canonical state';
  end if;

  if (select count(*) from public.pick_card_change_actions where event_id = 'monitor-approval') <> 4 then
    raise exception 'monitoring approvals did not preserve canonical audit ownership';
  end if;
end;
$$;

rollback;
