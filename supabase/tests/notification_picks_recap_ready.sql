begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_entrant_one uuid := extensions.gen_random_uuid();
  v_entrant_two uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_snapshot jsonb;
  v_group jsonb;
  v_event_count integer;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_entrant_one,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-recap-one@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'RECAP ONE', 'historical_unclaimed', true)
    ),
    (
      v_entrant_two,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-recap-two@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'RECAP TWO', 'historical_unclaimed', true)
    ),
    (
      v_outsider,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-recap-outsider@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'RECAP OUTSIDER', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_entrant_one, 'Recap One', 'R1');
  perform public.register_unclaimed_pin_profile(v_entrant_two, 'Recap Two', 'R2');
  perform public.register_unclaimed_pin_profile(v_outsider, 'Recap Outsider', 'RO');

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'notification-recap-one',
    'UFC Recap Test One',
    'Red One vs. Blue One',
    'Test Arena',
    'Dallas, Texas',
    now() - interval '1 hour',
    now() - interval '2 hours',
    2199,
    'locked',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, winner_fighter_slug, result_recorded_at,
    included_in_picks
  ) values (
    'notification-recap-one',
    'recap-one-bout',
    1,
    'Lightweight',
    'red-one',
    'Red One',
    'blue-one',
    'Blue One',
    'red_win',
    'red-one',
    now() - interval '30 minutes',
    true
  );

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values
    (v_entrant_one, 'notification-recap-one', 'recap-one-bout', 'red-one'),
    (v_entrant_two, 'notification-recap-one', 'recap-one-bout', 'blue-one');

  perform public.transition_pick_event('notification-recap-one', 'complete');

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'notification-recap-two',
    'UFC Recap Test Two',
    'Red Two vs. Blue Two',
    'Test Arena',
    'Dallas, Texas',
    now() - interval '1 hour',
    now() - interval '2 hours',
    2199,
    'locked',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, winner_fighter_slug, result_recorded_at,
    included_in_picks
  ) values (
    'notification-recap-two',
    'recap-two-bout',
    1,
    'Welterweight',
    'red-two',
    'Red Two',
    'blue-two',
    'Blue Two',
    'blue_win',
    'blue-two',
    now() - interval '30 minutes',
    true
  );

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values (v_entrant_one, 'notification-recap-two', 'recap-two-bout', 'blue-two');

  perform public.transition_pick_event('notification-recap-two', 'complete');

  if (select count(*) from private.whats_new_items
      where source_key in ('picks:recap:notification-recap-one', 'picks:recap:notification-recap-two')) <> 2 then
    raise exception 'Personal recap delivery replaced or duplicated the canonical What''s New owner';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_entrant_one::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 1 then
    raise exception 'Two completed event recaps did not collapse into one unread group: %', v_snapshot;
  end if;

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_recap_ready';

  if v_group is null
    or v_group->>'title' <> 'UFC Recap Test Two recap is ready'
    or v_group->>'summary' <> 'Final standings and your full Picks recap are ready.'
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'VIEW RECAP'
    or (v_group->>'aggregate_count')::integer <> 2
  then
    raise exception 'Recap notifications did not aggregate to the newest actionable event: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_entrant_two::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  select item
    into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_recap_ready';

  if (v_snapshot->>'unread_count')::integer <> 1
    or v_group is null
    or (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'title' <> 'UFC Recap Test One recap is ready'
  then
    raise exception 'Single-event entrant did not receive exactly one recap notification: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_outsider::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 0
  then
    raise exception 'A profile that did not enter the event received recap notification noise: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform public.transition_pick_event('notification-recap-two', 'complete');

  select count(*)
    into v_event_count
  from private.notification_events event
  where event.recipient_profile_id = v_entrant_one
    and event.source_key like 'picks-recap-ready:%';

  if v_event_count <> 2 then
    raise exception 'Replaying an already-complete transition duplicated recap delivery';
  end if;

  if (select count(*) from public.profile_event_picks
      where event_id in ('notification-recap-one', 'notification-recap-two')) <> 3 then
    raise exception 'Recap delivery changed canonical submitted Picks';
  end if;

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'notification-recap-lock-only',
    'UFC Lock-Only Test',
    'Red Lock vs. Blue Lock',
    'Test Arena',
    'Dallas, Texas',
    now() + interval '1 hour',
    now() - interval '1 minute',
    2199,
    'upcoming',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    result_status, winner_fighter_slug, result_recorded_at,
    included_in_picks
  ) values (
    'notification-recap-lock-only',
    'lock-only-bout',
    1,
    'Middleweight',
    'red-lock',
    'Red Lock',
    'blue-lock',
    'Blue Lock',
    'pending',
    null,
    null,
    true
  );

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values (v_entrant_one, 'notification-recap-lock-only', 'lock-only-bout', 'red-lock');

  perform public.transition_pick_event('notification-recap-lock-only', 'locked');

  if exists (
    select 1
    from private.notification_events event
    where event.recipient_profile_id = v_entrant_one
      and event.source_key = 'picks-recap-ready:notification-recap-lock-only'
  ) then
    raise exception 'Locking an event created recap notification noise';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated Picks clients can bypass the canonical recap notification producer';
  end if;
end $$;

rollback;
