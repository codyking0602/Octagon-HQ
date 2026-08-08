begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_profile uuid := extensions.gen_random_uuid();
  v_setup uuid;
  v_daily uuid;
  v_now timestamptz := '2026-08-20 01:07:00+00';
  v_dispatch jsonb;
  v_picks_count integer;
  v_daily_count integer;
  v_picks_priority text;
  v_daily_priority text;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_profile,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'member-reminder-push@login.octagon-hq.app',
    '', now(), now(), now(),
    jsonb_build_object('display_name', 'MEMBER REMINDER PUSH')
  );

  perform public.register_unclaimed_pin_profile(v_profile, 'Member Reminder Push', 'MRP');

  insert into private.profile_pin_credentials(
    profile_id, internal_email, pin_hash, failed_attempts,
    locked_until, last_failed_at, pin_updated_at
  ) values (
    v_profile,
    'member-reminder-push@login.octagon-hq.app',
    'test-hash', 0, null, null, now()
  );

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'member-reminder-push-test',
    'UFC Member Reminder Push Test',
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
    ('member-reminder-push-test', 'member-reminder-one', 1, 'Lightweight',
      'red-one', 'Red One', 'blue-one', 'Blue One', true),
    ('member-reminder-push-test', 'member-reminder-two', 2, 'Welterweight',
      'red-two', 'Red Two', 'blue-two', 'Blue Two', true);

  insert into private.daily_challenge_schedule_versions(
    version, time_zone, anchor_day, starts_on, game_cycle
  ) values (
    'member-reminder-push-v1',
    'America/Chicago',
    date '2026-08-19',
    date '2026-08-19',
    array['find_leader']::text[]
  );

  insert into private.daily_challenge_setups(
    game_type, setup_key, content_version, scoring_version,
    public_setup, reveal_setup, private_setup_evidence, private_grading_evidence
  ) values (
    'find_leader',
    'member-reminder-push-setup',
    'member-reminder-push-content-v1',
    'member-reminder-push-score-v1',
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb
  ) returning id into v_setup;

  insert into private.daily_challenges(
    central_day, schedule_version, game_type, setup_id,
    content_version, scoring_version, published_at
  ) values (
    date '2026-08-19',
    'member-reminder-push-v1',
    'find_leader',
    v_setup,
    'member-reminder-push-content-v1',
    'member-reminder-push-score-v1',
    v_now - interval '1 hour'
  ) returning id into v_daily;

  -- Intentionally create zero saved Picks and zero official Daily Challenge attempts.
  v_dispatch := public.dispatch_due_in_app_notifications(v_now);

  if (v_dispatch->>'picks_incomplete')::integer < 1 then
    raise exception 'Zero-pick claimed member was not included in Finish your Picks dispatch: %', v_dispatch;
  end if;
  if (v_dispatch->>'daily_challenge')::integer < 1 then
    raise exception 'Incomplete Daily Challenge member was not included in the 8 PM dispatch: %', v_dispatch;
  end if;

  select count(*), max(priority)
    into v_picks_count, v_picks_priority
  from private.notification_groups
  where recipient_profile_id = v_profile
    and kind = 'picks_incomplete_near_lock';

  select count(*), max(priority)
    into v_daily_count, v_daily_priority
  from private.notification_groups
  where recipient_profile_id = v_profile
    and kind = 'daily_challenge_four_hours';

  if v_picks_count <> 1 or v_picks_priority <> 'push_candidate' then
    raise exception 'Zero-pick Finish your Picks notification was not one push candidate: count %, priority %',
      v_picks_count, v_picks_priority;
  end if;

  if v_daily_count <> 1 or v_daily_priority <> 'push_candidate' then
    raise exception 'Daily Challenge reminder was not one push candidate: count %, priority %',
      v_daily_count, v_daily_priority;
  end if;

  perform public.dispatch_due_in_app_notifications(v_now);

  select count(*) into v_picks_count
  from private.notification_events event
  join private.notification_groups notification on notification.id = event.group_id
  where notification.recipient_profile_id = v_profile
    and notification.kind = 'picks_incomplete_near_lock';

  select count(*) into v_daily_count
  from private.notification_events event
  join private.notification_groups notification on notification.id = event.group_id
  where notification.recipient_profile_id = v_profile
    and notification.kind = 'daily_challenge_four_hours';

  if v_picks_count <> 1 or v_daily_count <> 1 then
    raise exception 'Hourly replay duplicated member reminder source events: picks %, daily %',
      v_picks_count, v_daily_count;
  end if;

  if not exists (
    select 1
    from private.daily_challenges challenge
    where challenge.id = v_daily
  ) then
    raise exception 'Focused proof did not preserve the canonical materialized Daily Challenge owner';
  end if;
end;
$$;

rollback;
