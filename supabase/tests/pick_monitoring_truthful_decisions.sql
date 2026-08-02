begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_starts_at timestamptz := now() + interval '10 days';
  v_locks_at timestamptz := now() + interval '9 days 23 hours';
  v_identity text;
  v_provider_run_id uuid;
  v_provider_completed_at timestamptz := now() - interval '2 minutes';
  v_decision_run_id uuid;
  v_event_state jsonb;
  v_schedule_state jsonb;
  v_inbox jsonb;
begin
  update public.pick_events
  set status = 'complete'
  where status in ('upcoming', 'locked');

  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (
      v_owner_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'monitoring-owner@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING OWNER', 'historical_unclaimed', true)
    ),
    (
      v_member_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'monitoring-member@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'MONITORING MEMBER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner_id, 'Monitoring Owner', 'MO');
  perform public.register_unclaimed_pin_profile(v_member_id, 'Monitoring Member', 'MM');
  insert into public.pick_control_owners(profile_id) values (v_owner_id);

  insert into public.pick_events (
    event_id, name, subtitle, venue, location, starts_at, locks_at, season, status
  ) values (
    'pick-monitoring-boundary-past',
    'UFC Boundary Test',
    'Past Red vs. Past Blue',
    'Test Arena',
    'Dallas, Texas',
    now() - interval '1 hour',
    now() - interval '2 hours',
    2199,
    'upcoming'
  );

  insert into public.pick_bouts (
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name, blue_fighter_slug, blue_fighter_name
  ) values (
    'pick-monitoring-boundary-past',
    'boundary-past-main',
    1,
    'Lightweight',
    'past-red',
    'Past Red',
    'past-blue',
    'Past Blue'
  );

  v_event_state := public.get_pick_monitoring_event_state();
  if v_event_state->'current' is not null then
    raise exception 'boundary-past event remained monitorable: %', v_event_state;
  end if;

  update public.pick_events
  set status = 'complete'
  where event_id = 'pick-monitoring-boundary-past';

  insert into public.pick_events (
    event_id, name, subtitle, venue, location, starts_at, locks_at, season, status
  ) values (
    'pick-monitoring-future',
    'UFC Monitoring Test',
    'Future Red vs. Future Blue',
    'Test Arena',
    'Dallas, Texas',
    v_starts_at,
    v_locks_at,
    2199,
    'upcoming'
  );

  insert into public.pick_bouts (
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name, blue_fighter_slug, blue_fighter_name
  ) values (
    'pick-monitoring-future',
    'monitoring-future-main',
    1,
    'Welterweight',
    'future-red',
    'Future Red',
    'future-blue',
    'Future Blue'
  );

  v_identity := 'ufc:' || to_char(v_starts_at at time zone 'UTC', 'YYYY-MM-DD');

  v_event_state := public.get_pick_monitoring_event_state();
  if v_event_state #>> '{current,event_id}' <> 'pick-monitoring-future'
    or v_event_state #>> '{current,bouts,0,included_in_picks}' <> 'true' then
    raise exception 'future event was not the canonical monitoring target: %', v_event_state;
  end if;

  insert into public.pick_monitoring_schedule_state (
    source_event_identity, next_eligible_at, lease_until, last_claimed_at, updated_at
  ) values (
    v_identity,
    now() + interval '6 hours',
    null,
    v_provider_completed_at,
    now()
  );

  insert into public.pick_monitoring_runs (
    trigger_kind,
    status,
    source_event_identity,
    event_id,
    observed_locks_at,
    started_at,
    completed_at,
    card_source,
    card_source_url,
    odds_provider,
    provider_requests_remaining,
    provider_requests_used,
    provider_last_request_cost,
    provider_event_count,
    complete_snapshot_count,
    missing_snapshot_count,
    diagnostics
  ) values (
    'scheduled',
    'completed',
    v_identity,
    'pick-monitoring-future',
    v_locks_at,
    v_provider_completed_at - interval '5 seconds',
    v_provider_completed_at,
    'MMA Mania',
    'https://www.mmamania.com/test',
    'the-odds-api',
    42,
    1,
    1,
    1,
    1,
    0,
    '[]'::jsonb
  ) returning run_id into v_provider_run_id;

  v_decision_run_id := public.record_pick_monitoring_scheduler_decision(
    'skipped',
    'not_due',
    v_identity,
    now() + interval '6 hours'
  );

  if not exists (
    select 1
    from public.pick_monitoring_runs
    where run_id = v_decision_run_id
      and status = 'skipped'
      and decision_reason = 'not_due'
      and provider_called = false
  ) then
    raise exception 'truthful skipped scheduler evidence was not recorded';
  end if;

  v_schedule_state := public.get_pick_monitoring_schedule_state(v_identity);
  if (v_schedule_state->>'last_completed_at')::timestamptz <> v_provider_completed_at
    or v_schedule_state #>> '{provider_requests_remaining}' <> '42' then
    raise exception 'decision-only row corrupted provider cadence or quota state: %', v_schedule_state;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner_id::text, true);

  v_inbox := public.get_pick_monitoring_inbox();
  if v_inbox #>> '{monitored_event,kind}' <> 'current'
    or v_inbox #>> '{monitored_event,event_id}' <> 'pick-monitoring-future'
    or v_inbox #>> '{latest_run,run_id}' <> v_provider_run_id::text
    or v_inbox #>> '{latest_scheduled_decision,outcome}' <> 'skipped'
    or v_inbox #>> '{latest_scheduled_decision,reason}' <> 'not_due'
    or v_inbox #>> '{latest_scheduled_decision,provider_called}' <> 'false' then
    raise exception 'owner inbox mixed scheduler decisions with provider runs: %', v_inbox;
  end if;

  perform set_config('request.jwt.claim.sub', v_member_id::text, true);
  begin
    perform public.get_pick_monitoring_inbox();
    raise exception 'non-owner loaded Monitoring Inbox';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then
      raise;
    end if;
  end;

  if has_function_privilege(
    'authenticated',
    'public.record_pick_monitoring_scheduler_decision(text,text,text,timestamptz,boolean)',
    'EXECUTE'
  ) then
    raise exception 'authenticated browser role inherited scheduler-decision write access';
  end if;
end;
$$;

rollback;
