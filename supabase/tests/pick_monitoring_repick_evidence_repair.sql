begin;

select set_config('request.jwt.claim.role', 'service_role', true);

update public.pick_events
set status = 'complete',
    completed_at = coalesce(completed_at, now()),
    updated_at = now()
where status in ('upcoming', 'locked');

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_event text := 'repick-evidence-repair';
  v_action_id bigint;
  v_before_state jsonb;
  v_audit_receipt jsonb;
  v_projection jsonb;
  v_repick boolean;
  v_run uuid;
  v_finding uuid;
  v_receipt jsonb;
  v_repeat jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'repick-owner@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK OWNER', 'historical_unclaimed', true)
    ),
    (
      v_member,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'repick-member@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK MEMBER', 'historical_unclaimed', true)
    ),
    (
      v_other,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'repick-other@login.octagon-hq.app',
      '',
      now(), now(), now(),
      jsonb_build_object('display_name', 'REPICK OTHER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Repick Owner', 'RO');
  perform public.register_unclaimed_pin_profile(v_member, 'Repick Member', 'RM');
  perform public.register_unclaimed_pin_profile(v_other, 'Repick Other', 'RX');
  insert into public.pick_control_owners(profile_id) values (v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location, prelims_starts_at,
    starts_at, locks_at, season, status
  ) values (
    v_event,
    'UFC Repick Evidence Test',
    'Evidence Red vs. Evidence Blue',
    'Test Arena',
    'Dallas, Texas',
    now() + interval '20 hours',
    now() + interval '22 hours',
    now() + interval '8 hours',
    2199,
    'upcoming'
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, included_in_picks, card_segment,
    segment_sequence, locks_at
  ) values
    (
      v_event, 'direct-replace', 1, 'Lightweight',
      'direct-red', 'Direct Red', 'direct-blue', 'Direct Blue',
      'pending', true, 'main', 1, now() + interval '6 hours'
    ),
    (
      v_event, 'monitored-replace', 2, 'Welterweight',
      'monitor-red', 'Monitor Red', 'monitor-blue', 'Monitor Blue',
      'pending', true, 'main', 2, now() + interval '7 hours'
    );

  insert into public.profile_event_picks(
    profile_id, event_id, bout_id, fighter_slug
  ) values
    (v_member, v_event, 'direct-replace', 'direct-red'),
    (v_other, v_event, 'direct-replace', 'direct-blue'),
    (v_member, v_event, 'monitored-replace', 'monitor-red'),
    (v_other, v_event, 'monitored-replace', 'monitor-blue');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_fighter_replacement(
    v_event,
    'direct-replace',
    'red',
    'direct-red',
    'direct-blue',
    'direct-new',
    'Direct New',
    'Preserve exact invalidated selections'
  );

  select action_id, before_state, receipt
  into v_action_id, v_before_state, v_audit_receipt
  from public.pick_card_change_actions
  where event_id = v_event
    and bout_id = 'direct-replace'
    and action_type = 'replace_fighter'
  order by action_id desc
  limit 1;

  if jsonb_array_length(v_before_state->'invalidated_picks') <> 2
    or not exists (
      select 1
      from jsonb_array_elements(v_before_state->'invalidated_picks') entry
      where entry->>'profile_id' = v_member::text
        and entry->>'fighter_slug' = 'direct-red'
    )
    or not exists (
      select 1
      from jsonb_array_elements(v_before_state->'invalidated_picks') entry
      where entry->>'profile_id' = v_other::text
        and entry->>'fighter_slug' = 'direct-blue'
    )
    or v_audit_receipt->'invalidated_picks'
      is distinct from v_before_state->'invalidated_picks'
    or v_audit_receipt->'before_value' is distinct from v_before_state then
    raise exception 'direct replacement did not preserve exact invalidated selections: %',
      v_audit_receipt;
  end if;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_projection := public.get_current_pick_event();
  select coalesce((bout->>'repick_required')::boolean, false)
  into v_repick
  from jsonb_array_elements(v_projection->'bouts') bout
  where bout->>'bout_id' = 'direct-replace';
  if not coalesce(v_repick, false) then
    raise exception 'member projection lost REPICK REQUIRED after direct replacement';
  end if;

  perform set_config('request.jwt.claim.sub', v_other::text, true);
  v_projection := public.get_current_pick_event();
  select coalesce((bout->>'repick_required')::boolean, false)
  into v_repick
  from jsonb_array_elements(v_projection->'bouts') bout
  where bout->>'bout_id' = 'direct-replace';
  if not coalesce(v_repick, false) then
    raise exception 'second member projection lost REPICK REQUIRED after direct replacement';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  insert into public.pick_monitoring_runs(
    trigger_kind, status, source_event_identity, event_id,
    observed_locks_at, started_at, completed_at,
    provider_event_count, complete_snapshot_count,
    missing_snapshot_count, diagnostics
  ) values (
    'manual',
    'completed',
    'ufc:repick-evidence-repair',
    v_event,
    (select locks_at from public.pick_events where event_id = v_event),
    now() - interval '1 minute',
    now(),
    1,
    1,
    0,
    '[]'::jsonb
  ) returning run_id into v_run;

  insert into public.pick_monitoring_findings(
    run_id, event_id, finding_key, finding_type, severity,
    review_status, matchup_identity, bout_id, summary,
    before_value, after_value, source_details, detected_at
  ) values (
    v_run,
    v_event,
    'repick-evidence-monitor-replacement',
    'card_change',
    'warning',
    'new',
    'monitor-red|monitor-blue',
    'monitored-replace',
    'Replace Monitor Red with Monitor New.',
    jsonb_build_object('red_fighter_slug', 'monitor-red'),
    jsonb_build_object('red_fighter_slug', 'monitor-new'),
    jsonb_build_object(
      'finding_identity', 'bout:monitored-replace:fighter:red',
      'approval_proposal', jsonb_build_object(
        'action', 'replace_fighter',
        'event_id', v_event,
        'bout_id', 'monitored-replace',
        'corner', 'red',
        'expected_red_fighter_slug', 'monitor-red',
        'expected_blue_fighter_slug', 'monitor-blue',
        'replacement_fighter_slug', 'monitor-new',
        'replacement_fighter_name', 'Monitor New'
      )
    ),
    now()
  ) returning finding_id into v_finding;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_receipt := public.approve_pick_monitoring_finding(
    v_finding,
    'Approve monitored fighter replacement'
  );
  v_repeat := public.approve_pick_monitoring_finding(
    v_finding,
    'Approve monitored fighter replacement'
  );

  select receipt
  into v_audit_receipt
  from public.pick_card_change_actions
  where action_id = (v_receipt->>'audit_id')::bigint;

  if v_repeat is distinct from v_receipt
    or v_audit_receipt is distinct from v_receipt
    or not exists (
      select 1
      from public.pick_monitoring_findings finding
      where finding.finding_id = v_finding
        and finding.approval_receipt = v_receipt
    )
    or jsonb_array_length(v_receipt->'invalidated_picks') <> 2
    or v_receipt->>'finding_id' <> v_finding::text
    or v_receipt->>'finding_resolved' <> 'true' then
    raise exception 'monitoring finding and audit did not retain one final receipt: %',
      v_receipt;
  end if;

  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_projection := public.get_current_pick_event();
  select coalesce((bout->>'repick_required')::boolean, false)
  into v_repick
  from jsonb_array_elements(v_projection->'bouts') bout
  where bout->>'bout_id' = 'monitored-replace';
  if not coalesce(v_repick, false) then
    raise exception 'member projection lost REPICK REQUIRED after monitored replacement';
  end if;

  perform set_config('request.jwt.claim.sub', v_other::text, true);
  v_projection := public.get_current_pick_event();
  select coalesce((bout->>'repick_required')::boolean, false)
  into v_repick
  from jsonb_array_elements(v_projection->'bouts') bout
  where bout->>'bout_id' = 'monitored-replace';
  if not coalesce(v_repick, false) then
    raise exception 'second member projection lost REPICK REQUIRED after monitored replacement';
  end if;
end;
$$;

rollback;
