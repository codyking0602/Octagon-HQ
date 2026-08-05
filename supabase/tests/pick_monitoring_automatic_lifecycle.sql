begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_starts_at timestamptz := now() + interval '6 days';
  v_locks_at timestamptz := now() + interval '5 days 23 hours';
  v_claimed_at timestamptz := date_trunc('milliseconds', now());
  v_retry_at timestamptz := date_trunc('milliseconds', now() + interval '1 hour');
  v_identity text;
  v_draft_id uuid;
  v_state jsonb;
  v_schedule jsonb;
  v_decision_id uuid;
  v_first_claim boolean;
  v_second_claim boolean;
  v_released boolean;
begin
  update public.pick_events
  set status = 'complete',
      completed_at = coalesce(completed_at, now())
  where status in ('upcoming', 'locked');

  insert into public.pick_event_drafts (
    source,
    source_event_key,
    source_url,
    event_id,
    name,
    subtitle,
    venue,
    location,
    starts_at,
    locks_at,
    season,
    state,
    synced_at,
    updated_at,
    published_at
  ) values (
    'ufc.com',
    'event/automatic-monitoring-proof',
    'https://www.ufc.com/event/automatic-monitoring-proof',
    'automatic-monitoring-proof',
    'UFC Automatic Monitoring Proof',
    'Proof Red vs. Proof Blue',
    'Proof Arena',
    'Dallas, Texas',
    v_starts_at,
    v_locks_at,
    2199,
    'published',
    now(),
    now(),
    now()
  ) returning draft_id into v_draft_id;

  insert into public.pick_event_draft_bouts (
    draft_id,
    bout_id,
    position,
    weight_class,
    red_fighter_slug,
    red_fighter_name,
    blue_fighter_slug,
    blue_fighter_name,
    included,
    card_segment,
    segment_sequence
  ) values (
    v_draft_id,
    'main-event-1',
    1,
    'Lightweight',
    'proof-red',
    'Proof Red',
    'proof-blue',
    'Proof Blue',
    true,
    'main',
    1
  );

  insert into public.pick_events (
    event_id,
    name,
    subtitle,
    venue,
    location,
    starts_at,
    locks_at,
    season,
    status
  ) values (
    'automatic-monitoring-proof',
    'UFC Automatic Monitoring Proof',
    'Proof Red vs. Proof Blue',
    'Proof Arena',
    'Dallas, Texas',
    v_starts_at,
    v_locks_at,
    2199,
    'upcoming'
  );

  insert into public.pick_bouts (
    event_id,
    bout_id,
    position,
    weight_class,
    red_fighter_slug,
    red_fighter_name,
    blue_fighter_slug,
    blue_fighter_name,
    card_segment,
    segment_sequence,
    included_in_picks
  ) values (
    'automatic-monitoring-proof',
    'main-event-1',
    1,
    'Lightweight',
    'proof-red',
    'Proof Red',
    'proof-blue',
    'Proof Blue',
    'main',
    1,
    true
  );

  v_state := public.get_pick_monitoring_event_state();
  if v_state #>> '{current,event_id}' <> 'automatic-monitoring-proof'
    or v_state #>> '{current,source_url}' <> 'https://www.ufc.com/event/automatic-monitoring-proof'
    or v_state #>> '{current,bouts,0,bout_id}' <> 'main-event-1' then
    raise exception 'published monitoring source context was not preserved: %', v_state;
  end if;

  v_identity := 'ufc:' || to_char(v_starts_at at time zone 'UTC', 'YYYY-MM-DD');
  v_first_claim := public.claim_pick_monitoring_schedule(v_identity, v_claimed_at);
  v_second_claim := public.claim_pick_monitoring_schedule(v_identity, v_claimed_at);
  if v_first_claim is distinct from true or v_second_claim is distinct from false then
    raise exception 'due monitoring work was not claimed exactly once: first %, second %', v_first_claim, v_second_claim;
  end if;

  v_schedule := public.get_pick_monitoring_schedule_state(v_identity);
  if (v_schedule->>'lease_until')::timestamptz <= v_claimed_at then
    raise exception 'monitoring claim did not create a live lease: %', v_schedule;
  end if;

  v_released := public.release_pick_monitoring_schedule(v_identity, v_claimed_at, v_retry_at);
  if v_released is distinct from true then
    raise exception 'exact monitoring claim could not be released';
  end if;

  v_schedule := public.get_pick_monitoring_schedule_state(v_identity);
  if v_schedule->>'lease_until' is not null
    or (v_schedule->>'next_eligible_at')::timestamptz <> v_retry_at then
    raise exception 'released monitoring claim did not retain truthful retry state: %', v_schedule;
  end if;

  if public.claim_pick_monitoring_schedule(v_identity, v_claimed_at) then
    raise exception 'not-due monitoring work was claimed before its retry boundary';
  end if;

  v_decision_id := public.record_pick_monitoring_scheduler_decision(
    'failed',
    'source_preview_failed',
    v_identity,
    v_retry_at,
    false
  );
  if not exists (
    select 1
    from public.pick_monitoring_runs run
    where run.run_id = v_decision_id
      and run.status = 'failed'
      and run.decision_reason = 'source_preview_failed'
      and run.provider_called = false
  ) then
    raise exception 'pre-provider failure was not recorded truthfully';
  end if;
end;
$$;

rollback;
