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
  v_auto_run_id uuid;
  v_auto_result jsonb;
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

  update public.pick_events
  set prelims_starts_at = v_starts_at - interval '2 hours'
  where event_id = 'automatic-monitoring-proof';

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
    'prelim-2',
    2,
    'Welterweight',
    'proof-gamma',
    'Proof Gamma',
    'proof-delta',
    'Proof Delta',
    'prelim',
    1,
    true
  );

  v_auto_run_id := public.record_pick_monitoring_run(jsonb_build_object(
    'trigger_kind', 'scheduled',
    'status', 'completed',
    'source_event_identity', v_identity,
    'event_id', 'automatic-monitoring-proof',
    'locks_at', v_locks_at,
    'started_at', now() - interval '1 minute',
    'completed_at', now(),
    'card_source', 'UFC.com event + card',
    'card_source_url', 'https://www.ufc.com/event/automatic-monitoring-proof',
    'odds_provider', 'the-odds-api',
    'quota', jsonb_build_object(
      'requests_remaining', 100,
      'requests_used', 1,
      'last_request_cost', 1
    ),
    'coverage', jsonb_build_object(
      'provider_events', 1,
      'complete_snapshots', 0,
      'missing_snapshots', 0
    ),
    'diagnostics', '[]'::jsonb,
    'odds_snapshots', '[]'::jsonb,
    'findings', jsonb_build_array(
      jsonb_build_object(
        'finding_key', 'auto-reorder-proof',
        'finding_type', 'card_change',
        'severity', 'warning',
        'summary', 'Apply the detected fight order.',
        'detected_at', now(),
        'before_value', jsonb_build_array('main-event-1', 'prelim-2'),
        'after_value', jsonb_build_array('prelim-2', 'main-event-1'),
        'source_details', jsonb_build_object(
          'source_event_identity', v_identity,
          'monitored_event_kind', 'current',
          'finding_identity', 'auto-reorder-proof',
          'change_field', 'fight_order',
          'approval_proposal', jsonb_build_object(
            'action', 'reorder_card',
            'event_id', 'automatic-monitoring-proof',
            'expected_bout_ids', jsonb_build_array('main-event-1', 'prelim-2'),
            'proposed_bout_ids', jsonb_build_array('prelim-2', 'main-event-1')
          )
        )
      ),
      jsonb_build_object(
        'finding_key', 'auto-segment-proof',
        'finding_type', 'card_change',
        'severity', 'warning',
        'summary', 'Apply the detected main/prelim placement.',
        'detected_at', now(),
        'before_value', jsonb_build_array(
          jsonb_build_object('bout_id','main-event-1','card_segment','main','segment_sequence',1),
          jsonb_build_object('bout_id','prelim-2','card_segment','prelim','segment_sequence',1)
        ),
        'after_value', jsonb_build_array(
          jsonb_build_object('bout_id','main-event-1','card_segment','prelim','segment_sequence',1),
          jsonb_build_object('bout_id','prelim-2','card_segment','main','segment_sequence',1)
        ),
        'source_details', jsonb_build_object(
          'source_event_identity', v_identity,
          'monitored_event_kind', 'current',
          'finding_identity', 'auto-segment-proof',
          'change_field', 'card_segments',
          'approval_proposal', jsonb_build_object(
            'action', 'sync_card_segments',
            'event_id', 'automatic-monitoring-proof',
            'expected_segments', jsonb_build_array(
              jsonb_build_object('bout_id','main-event-1','card_segment','main','segment_sequence',1),
              jsonb_build_object('bout_id','prelim-2','card_segment','prelim','segment_sequence',1)
            ),
            'proposed_segments', jsonb_build_array(
              jsonb_build_object('bout_id','main-event-1','card_segment','prelim','segment_sequence',1),
              jsonb_build_object('bout_id','prelim-2','card_segment','main','segment_sequence',1)
            )
          )
        )
      )
    )
  ));

  v_auto_result := public.auto_apply_trusted_pick_monitoring_changes(v_auto_run_id);

  if v_auto_result->>'status' <> 'applied'
    or jsonb_array_length(v_auto_result->'applied') <> 2
    or jsonb_array_length(v_auto_result->'failed') <> 0 then
    raise exception 'trusted monitoring changes did not auto-apply cleanly: %', v_auto_result;
  end if;

  if not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = 'automatic-monitoring-proof'
      and bout.bout_id = 'prelim-2'
      and bout.position = 1
      and bout.card_segment = 'main'
      and bout.segment_sequence = 1
  ) or not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = 'automatic-monitoring-proof'
      and bout.bout_id = 'main-event-1'
      and bout.position = 2
      and bout.card_segment = 'prelim'
      and bout.segment_sequence = 1
  ) then
    raise exception 'trusted auto-apply did not synchronize order and card placement';
  end if;

  if (
    select count(*)
    from public.pick_monitoring_findings finding
    where finding.run_id = v_auto_run_id
      and finding.review_status = 'reviewed'
      and finding.reviewed_automatically
      and finding.reviewed_by is null
      and finding.approval_receipt->>'reviewed_automatically' = 'true'
  ) <> 2 then
    raise exception 'trusted auto-applied findings were not resolved as automated evidence';
  end if;
end;
$$;

rollback;
