begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_other uuid := extensions.gen_random_uuid();
  v_run_id uuid;
  v_snapshot jsonb;
  v_group jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_owner,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-monitoring-owner@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING OWNER', 'historical_unclaimed', true)
    ),
    (
      v_other,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-monitoring-member@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING MEMBER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Monitoring Owner', 'MO');
  perform public.register_unclaimed_pin_profile(v_other, 'Monitoring Member', 'MM');
  perform public.set_notification_owner(v_owner);

  insert into public.pick_monitoring_runs(
    trigger_kind,
    status,
    source_event_identity,
    started_at,
    completed_at
  )
  values (
    'scheduled',
    'completed',
    'ufc:notification-monitoring-test',
    now() - interval '1 minute',
    now()
  )
  returning run_id into v_run_id;

  insert into public.pick_monitoring_findings(
    run_id,
    finding_key,
    finding_type,
    severity,
    matchup_identity,
    summary,
    source_details,
    detected_at
  )
  values
    (
      v_run_id,
      'monitoring-card-time',
      'card_change',
      'warning',
      null,
      'Event time changed.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '1 second'
    ),
    (
      v_run_id,
      'monitoring-card-lock',
      'card_change',
      'warning',
      null,
      'Picks lock changed.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '2 seconds'
    ),
    (
      v_run_id,
      'monitoring-order',
      'card_change',
      'warning',
      null,
      'Fight order changed.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '3 seconds'
    ),
    (
      v_run_id,
      'monitoring-removed',
      'card_change',
      'warning',
      null,
      'Removed main card: Fighter One vs. Fighter Two.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '4 seconds'
    ),
    (
      v_run_id,
      'monitoring-unmatched',
      'unmatched_fight',
      'warning',
      'fighter-one|fighter-two',
      'A monitored bout did not confidently match a provider snapshot.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '5 seconds'
    ),
    (
      v_run_id,
      'monitoring-matchup-provider',
      'provider_error',
      'error',
      'fighter-three|fighter-four',
      'Provider returned incomplete prices for a monitored matchup.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '6 seconds'
    ),
    (
      v_run_id,
      'monitoring-quota',
      'quota_warning',
      'warning',
      null,
      'Odds provider quota is low.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '7 seconds'
    ),
    (
      v_run_id,
      'monitoring-line-movement',
      'odds_change',
      'warning',
      'fighter-one|fighter-two',
      'American odds changed for a monitored bout.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '8 seconds'
    ),
    (
      v_run_id,
      'monitoring-odds-available',
      'odds_available',
      'info',
      'fighter-five|fighter-six',
      'Current odds are available for a monitored bout without stored odds.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '9 seconds'
    ),
    (
      v_run_id,
      'monitoring-global-provider',
      'provider_error',
      'error',
      null,
      'The provider request failed once.',
      jsonb_build_object('source_event_identity', 'ufc:notification-monitoring-test'),
      now() + interval '10 seconds'
    );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 5 then
    raise exception 'Meaningful monitoring findings did not create the expected flat owner list: %', v_snapshot;
  end if;

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'card_change_detected';

  if v_group is null
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'route' <> '/picks/monitoring'
    or v_group->>'action_label' <> 'REVIEW'
  then
    raise exception 'Generic card findings did not aggregate into one owner row: %', v_snapshot;
  end if;

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'odds_match_failed';

  if v_group is null or (v_group->>'aggregate_count')::integer <> 2 then
    raise exception 'Matchup-specific odds failures did not aggregate into one owner row: %', v_snapshot;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'fight_order_changed'
  ) then
    raise exception 'Fight-order review notification was missing: %', v_snapshot;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'fight_moved_off_card'
  ) then
    raise exception 'Removed-fight review notification was missing: %', v_snapshot;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'provider_quota_low'
  ) then
    raise exception 'Provider-quota notification was missing: %', v_snapshot;
  end if;

  if exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'summary' in (
      'American odds changed for a monitored bout.',
      'Current odds are available for a monitored bout without stored odds.',
      'The provider request failed once.'
    )
  ) then
    raise exception 'Routine odds activity or an unproven repeated failure created notification noise: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_other::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 0
  then
    raise exception 'Operational monitoring notifications leaked to a non-owner profile: %', v_snapshot;
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_pick_monitoring_finding_notification()',
    'EXECUTE'
  ) then
    raise exception 'Authenticated clients can invoke the private monitoring notification trigger';
  end if;
end $$;

rollback;
