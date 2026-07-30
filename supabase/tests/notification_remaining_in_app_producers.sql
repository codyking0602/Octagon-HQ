begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_incomplete uuid := extensions.gen_random_uuid();
  v_complete uuid := extensions.gen_random_uuid();
  v_daily uuid := extensions.gen_random_uuid();
  v_unclaimed uuid := extensions.gen_random_uuid();
  v_now timestamptz := '2026-08-20 01:07:00+00';
  v_target_recorded_at timestamptz;
  v_snapshot jsonb;
  v_group jsonb;
  v_dispatch jsonb;
  v_run_one uuid := extensions.gen_random_uuid();
  v_run_two uuid := extensions.gen_random_uuid();
  v_run_three uuid := extensions.gen_random_uuid();
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_owner, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'remaining-owner@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'REMAINING OWNER')),
    (v_incomplete, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'remaining-incomplete@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'REMAINING INCOMPLETE')),
    (v_complete, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'remaining-complete@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'REMAINING COMPLETE')),
    (v_daily, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'remaining-daily@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'REMAINING DAILY')),
    (v_unclaimed, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'remaining-unclaimed@login.octagon-hq.app', '', now(), now(), now(), jsonb_build_object('display_name', 'REMAINING UNCLAIMED', 'historical_unclaimed', true));

  perform public.register_unclaimed_pin_profile(v_owner, 'Remaining Owner', 'RO');
  perform public.register_unclaimed_pin_profile(v_incomplete, 'Remaining Incomplete', 'RI');
  perform public.register_unclaimed_pin_profile(v_complete, 'Remaining Complete', 'RC');
  perform public.register_unclaimed_pin_profile(v_daily, 'Remaining Daily', 'RD');
  perform public.register_unclaimed_pin_profile(v_unclaimed, 'Remaining Unclaimed', 'RU');

  insert into private.profile_pin_credentials(
    profile_id, internal_email, pin_hash, failed_attempts,
    locked_until, last_failed_at, pin_updated_at
  ) values
    (v_owner, 'remaining-owner@login.octagon-hq.app', 'test-hash', 0, null, null, now()),
    (v_incomplete, 'remaining-incomplete@login.octagon-hq.app', 'test-hash', 0, null, null, now()),
    (v_complete, 'remaining-complete@login.octagon-hq.app', 'test-hash', 0, null, null, now()),
    (v_daily, 'remaining-daily@login.octagon-hq.app', 'test-hash', 0, null, null, now());

  insert into public.pick_control_owners(profile_id) values (v_owner);
  perform public.set_notification_owner(v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'remaining-notification-test',
    'UFC Remaining Notification Test',
    'Red One vs. Blue One',
    'Test Arena',
    'Dallas, Texas',
    v_now + interval '45 minutes',
    v_now + interval '30 minutes',
    2199,
    'upcoming',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    included_in_picks
  ) values
    ('remaining-notification-test', 'remaining-one', 1, 'Lightweight',
      'red-one', 'Red One', 'blue-one', 'Blue One', true),
    ('remaining-notification-test', 'remaining-two', 2, 'Welterweight',
      'red-two', 'Red Two', 'blue-two', 'Blue Two', true);

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values
    (v_incomplete, 'remaining-notification-test', 'remaining-one', 'red-one'),
    (v_complete, 'remaining-notification-test', 'remaining-one', 'red-one'),
    (v_complete, 'remaining-notification-test', 'remaining-two', 'blue-two');

  -- Suppress the daily reminder for every claimed fixture except the intended recipient.
  insert into public.find_leader_history(
    profile_id, day, official_score, best_score, attempts, completed_at, updated_at
  ) values
    (v_owner, '2026-08-19', 6, 6, 1, v_now, v_now),
    (v_incomplete, '2026-08-19', 7, 7, 1, v_now, v_now),
    (v_complete, '2026-08-19', 8, 8, 1, v_now, v_now);

  insert into public.pick_monitoring_runs(
    run_id, trigger_kind, status, source_event_identity,
    event_id, started_at, completed_at
  ) values
    (v_run_one, 'scheduled', 'failed', 'ufc:remaining-notification-test',
      'remaining-notification-test', v_now - interval '3 hours', v_now - interval '3 hours' + interval '1 minute'),
    (v_run_two, 'scheduled', 'failed', 'ufc:remaining-notification-test',
      'remaining-notification-test', v_now - interval '2 hours', v_now - interval '2 hours' + interval '1 minute'),
    (v_run_three, 'scheduled', 'failed', 'ufc:remaining-notification-test',
      'remaining-notification-test', v_now - interval '1 hour', v_now - interval '1 hour' + interval '1 minute');

  v_dispatch := public.dispatch_due_in_app_notifications(v_now);

  if (v_dispatch->>'picks_incomplete')::integer <> 1
    or (v_dispatch->>'event_starting')::integer <> 1
    or (v_dispatch->>'daily_challenge')::integer <> 1
    or (v_dispatch->>'owner_operations')::integer <> 1
  then
    raise exception 'Consolidated dispatch did not target the expected due actions: %', v_dispatch;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);

  perform set_config('request.jwt.claim.sub', v_incomplete::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_incomplete_near_lock';
  if (v_snapshot->>'unread_count')::integer <> 1
    or v_group is null
    or v_group->>'title' <> 'Finish your Picks'
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'FINISH PICKS'
  then
    raise exception 'Incomplete Picks member did not receive the one correct lock reminder: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_complete::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'ufc_event_starting';
  if (v_snapshot->>'unread_count')::integer <> 1
    or v_group is null
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'VIEW PICKS'
  then
    raise exception 'Complete Picks member did not receive the one event-starting reminder: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_daily::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'daily_challenge_four_hours';
  if (v_snapshot->>'unread_count')::integer <> 1
    or v_group is null
    or v_group->>'route' <> '/play/find-leader'
    or v_group->>'action_label' <> 'PLAY TODAY'
  then
    raise exception 'Incomplete Daily Challenge profile did not receive the one useful reminder: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_unclaimed::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 0
  then
    raise exception 'An unclaimed historical profile received reminder noise: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'monitoring_repeatedly_failed'
      and item->>'route' = '/picks/monitoring'
  ) then
    raise exception 'Three consecutive monitoring failures did not create the owner review action: %', v_snapshot;
  end if;

  -- Replaying the same hourly wake-up is idempotent for every due producer.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform public.dispatch_due_in_app_notifications(v_now);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_incomplete::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if (select item->>'aggregate_count' from jsonb_array_elements(v_snapshot->'items') item
      where item->>'kind' = 'picks_incomplete_near_lock') <> '1' then
    raise exception 'Hourly replay duplicated an incomplete-Picks reminder: %', v_snapshot;
  end if;

  -- Resolve every included fight and prove the single owner completion action.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  update public.pick_events
  set status = 'locked'
  where event_id = 'remaining-notification-test';
  update public.pick_bouts
  set result_status = 'red_win',
      winner_fighter_slug = red_fighter_slug,
      result_recorded_at = v_now + interval '5 minutes'
  where event_id = 'remaining-notification-test';

  perform public.dispatch_due_in_app_notifications(v_now + interval '10 minutes');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'event_ready_to_complete'
      and item->>'route' = '/picks/control'
      and item->>'action_label' = 'COMPLETE EVENT'
  ) then
    raise exception 'Resolved locked event did not create the one owner completion action: %', v_snapshot;
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'all_results_entered'
  ) then
    raise exception 'Event completion created duplicate all-results-entered noise: %', v_snapshot;
  end if;

  -- A correction to a completed event changes member standings immediately.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  update public.pick_events
  set status = 'complete', completed_at = v_now + interval '15 minutes'
  where event_id = 'remaining-notification-test';
  select result_recorded_at into v_target_recorded_at
  from public.pick_bouts
  where event_id = 'remaining-notification-test' and bout_id = 'remaining-one';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.correct_official_pick_bout_result(
    'remaining-notification-test',
    'remaining-one',
    'blue_win',
    'red_win',
    'red-one',
    v_target_recorded_at,
    'Official commission correction for test proof'
  );

  perform set_config('request.jwt.claim.sub', v_incomplete::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_season_result_changed';
  if v_group is null
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'VIEW UPDATED RECAP'
    or v_group->>'summary' like '%commission correction%'
  then
    raise exception 'Completed-event correction did not create safe updated-recap delivery: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_daily::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'picks_season_result_changed'
  ) then
    raise exception 'A non-entrant received completed-event correction noise: %', v_snapshot;
  end if;

  -- A stale replay is rejected before another audit row or notification can exist.
  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  begin
    perform public.correct_official_pick_bout_result(
      'remaining-notification-test',
      'remaining-one',
      'draw',
      'red_win',
      'red-one',
      v_target_recorded_at,
      'Stale replay must fail'
    );
    raise exception 'Stale completed-event correction was accepted';
  exception when others then
    if sqlerrm not like '%official result changed; reload Fight Night Control%' then raise; end if;
  end;

  if (select count(*) from public.pick_result_corrections
      where event_id = 'remaining-notification-test' and bout_id = 'remaining-one') <> 1 then
    raise exception 'Correction notification delivery replaced or duplicated the canonical audit owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.dispatch_due_in_app_notifications(timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated clients can invoke the due-notification dispatcher';
  end if;
  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated clients can bypass the canonical notification publisher';
  end if;
end $$;

rollback;
