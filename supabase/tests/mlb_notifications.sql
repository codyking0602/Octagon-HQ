begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_incomplete uuid := extensions.gen_random_uuid();
  v_complete uuid := extensions.gen_random_uuid();
  v_base_position integer;
  v_snapshot jsonb;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_incomplete, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'mlb-notification-incomplete@login.octagon-hq.app', '', now(), now(), now(),
      jsonb_build_object('display_name', 'MLB NOTIFICATION INCOMPLETE')),
    (v_complete, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'mlb-notification-complete@login.octagon-hq.app', '', now(), now(), now(),
      jsonb_build_object('display_name', 'MLB NOTIFICATION COMPLETE'));

  perform public.register_unclaimed_pin_profile(v_incomplete, 'MLB Notification Incomplete', 'MI');
  perform public.register_unclaimed_pin_profile(v_complete, 'MLB Notification Complete', 'MC');

  insert into private.profile_pin_credentials(
    profile_id, internal_email, pin_hash, failed_attempts,
    locked_until, last_failed_at, pin_updated_at
  ) values
    (v_incomplete, 'mlb-notification-incomplete@login.octagon-hq.app', 'test-hash', 0, null, null, now()),
    (v_complete, 'mlb-notification-complete@login.octagon-hq.app', 'test-hash', 0, null, null, now());

  update public.mlb_playoff_seasons
  set public_enabled = false,
      current_round = 'wild_card',
      updated_at = now()
  where season = 2026;

  select coalesce(max(series_row.position), 0) + 100
    into v_base_position
  from public.mlb_playoff_series series_row
  where series_row.season = 2026;

  insert into public.mlb_playoff_series(
    series_id, season, round, league, label,
    team_a_id, team_a_name, team_b_id, team_b_name,
    starts_at, status, winner_team_id, series_score,
    schedule, position, updated_at
  ) values (
    'mlb-notification-test-wc',
    2026,
    'wild_card',
    'AL',
    'Notification Wild Card',
    'mlb-notification-a',
    'Notification A',
    'mlb-notification-b',
    'Notification B',
    '2026-09-29 18:00:00+00',
    'scheduled',
    null,
    null,
    '[]'::jsonb,
    v_base_position,
    '2026-09-28 12:00:00+00'
  );

  -- Shipping the infrastructure while MLB is private must be completely dormant.
  perform public.dispatch_due_mlb_notifications('2026-09-29 13:05:00+00');

  if exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id in (v_incomplete, v_complete)
      and notification.kind like 'mlb_%'
  ) then
    raise exception 'Private Baseball HQ emitted MLB notification rows';
  end if;

  update public.mlb_playoff_seasons
  set public_enabled = true,
      updated_at = now()
  where season = 2026;

  -- 8:05 AM Central on the first challenge date: public launch + challenge live.
  perform public.dispatch_due_mlb_notifications('2026-09-29 13:05:00+00');

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_launch_available'
      and notification.priority = 'push_candidate'
      and notification.route = '/mlb'
  ) then
    raise exception 'MLB launch notification was not push eligible';
  end if;

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_challenge_available'
      and notification.priority = 'push_candidate'
      and notification.route = '/mlb/challenge'
      and notification.title = 'Today''s MLB Challenge is live'
  ) then
    raise exception 'MLB challenge-live notification was not published correctly';
  end if;

  if exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_round_available'
  ) then
    raise exception 'Initial Wild Card slate double-pushed alongside public launch';
  end if;

  insert into public.mlb_postseason_challenge_results(
    season, challenge_key, profile_id, raw_score, game_type,
    completed_at, updated_at
  ) values (
    2026, 'mlb-2026-play-01', v_complete, 88, 'find_leader',
    '2026-09-29 15:00:00+00', '2026-09-29 15:00:00+00'
  );

  update public.mlb_playoff_series
  set status = 'complete',
      winner_team_id = 'mlb-notification-a',
      series_score = '2-0',
      updated_at = '2026-09-30 20:00:00+00'
  where series_id = 'mlb-notification-test-wc';

  -- 8:05 PM Central on Sep 30: slot 1 ends in four hours when slot 2 takes over.
  perform public.dispatch_due_mlb_notifications('2026-10-01 01:05:00+00');

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_challenge_four_hours'
      and notification.priority = 'push_candidate'
  ) then
    raise exception 'Incomplete MLB player did not receive the ending-soon push';
  end if;

  if exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_complete
      and notification.kind = 'mlb_challenge_four_hours'
  ) then
    raise exception 'Completed MLB player received an ending-soon reminder';
  end if;

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_round_recap'
      and notification.priority = 'in_app'
      and notification.route = '/mlb'
  ) then
    raise exception 'Completed MLB round did not create the one in-app-only recap';
  end if;

  insert into public.mlb_playoff_series(
    series_id, season, round, league, label,
    team_a_id, team_a_name, team_b_id, team_b_name,
    starts_at, status, winner_team_id, series_score,
    schedule, position, updated_at
  ) values (
    'mlb-notification-test-ds',
    2026,
    'division_series',
    'AL',
    'Notification Division Series',
    'mlb-notification-c',
    'Notification C',
    'mlb-notification-d',
    'Notification D',
    '2026-10-02 18:00:00+00',
    'scheduled',
    null,
    null,
    '[]'::jsonb,
    v_base_position + 1,
    '2026-10-01 12:30:00+00'
  );

  update public.mlb_playoff_seasons
  set current_round = 'division_series',
      updated_at = '2026-10-01 12:30:00+00'
  where season = 2026;

  -- 8:05 AM Central on Oct 1: slot 2 live + newly published Division Series slate.
  perform public.dispatch_due_mlb_notifications('2026-10-01 13:05:00+00');

  if not exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_round_available'
      and notification.priority = 'push_candidate'
      and notification.route = '/mlb/picks'
  ) then
    raise exception 'New MLB playoff slate did not create a push-eligible notification';
  end if;

  if (
    select count(*)
    from private.notification_groups notification
    where notification.recipient_profile_id = v_incomplete
      and notification.kind = 'mlb_challenge_available'
  ) <> 2 then
    raise exception 'The two scheduled MLB challenge dates did not each create one challenge-live row';
  end if;

  -- Replaying the same trusted wake-up must never aggregate duplicate MLB events.
  perform public.dispatch_due_mlb_notifications('2026-10-01 13:05:00+00');

  if exists (
    select 1
    from private.notification_groups notification
    where notification.recipient_profile_id in (v_incomplete, v_complete)
      and notification.kind like 'mlb_%'
      and notification.aggregate_count <> 1
  ) then
    raise exception 'MLB notification dispatch is not idempotent';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_incomplete::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if not exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'mlb_round_recap'
      and item->>'priority' = 'in_app'
  ) then
    raise exception 'MLB round recap was not visible in the canonical inbox: %', v_snapshot;
  end if;
end;
$$;

rollback;
