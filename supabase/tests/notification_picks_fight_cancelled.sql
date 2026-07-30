begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_multi uuid := extensions.gen_random_uuid();
  v_single uuid := extensions.gen_random_uuid();
  v_unaffected uuid := extensions.gen_random_uuid();
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
      'notification-cancel-owner@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CANCEL OWNER', 'historical_unclaimed', true)
    ),
    (
      v_multi,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-cancel-multi@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CANCEL MULTI', 'historical_unclaimed', true)
    ),
    (
      v_single,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-cancel-single@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CANCEL SINGLE', 'historical_unclaimed', true)
    ),
    (
      v_unaffected,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-cancel-unaffected@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'CANCEL UNAFFECTED', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_owner, 'Cancel Owner', 'CO');
  perform public.register_unclaimed_pin_profile(v_multi, 'Cancel Multi', 'CM');
  perform public.register_unclaimed_pin_profile(v_single, 'Cancel Single', 'CS');
  perform public.register_unclaimed_pin_profile(v_unaffected, 'Cancel Unaffected', 'CU');
  insert into public.pick_control_owners(profile_id) values (v_owner);

  insert into public.pick_events(
    event_id, name, subtitle, venue, location,
    starts_at, locks_at, season, status, completed_at
  ) values (
    'notification-cancel-test',
    'UFC Cancellation Notification Test',
    'Alpha Red vs. Alpha Blue',
    'Test Arena',
    'Dallas, Texas',
    now() + interval '2 days',
    now() + interval '1 day',
    2199,
    'upcoming',
    null
  );

  insert into public.pick_bouts(
    event_id, bout_id, position, weight_class,
    red_fighter_slug, red_fighter_name,
    blue_fighter_slug, blue_fighter_name,
    red_american_odds, blue_american_odds, odds_source, odds_updated_at
  ) values
    (
      'notification-cancel-test', 'cancel-one', 1, 'Lightweight',
      'alpha-red', 'Alpha Red', 'alpha-blue', 'Alpha Blue',
      145, -165, 'Test Sportsbook', now()
    ),
    (
      'notification-cancel-test', 'cancel-two', 2, 'Welterweight',
      'bravo-red', 'Bravo Red', 'bravo-blue', 'Bravo Blue',
      155, -175, 'Test Sportsbook', now()
    ),
    (
      'notification-cancel-test', 'unaffected-bout', 3, 'Middleweight',
      'other-red', 'Other Red', 'other-blue', 'Other Blue',
      210, -250, 'Test Sportsbook', now()
    );

  insert into public.profile_event_picks(profile_id, event_id, bout_id, fighter_slug)
  values
    (v_owner, 'notification-cancel-test', 'cancel-one', 'alpha-red'),
    (v_owner, 'notification-cancel-test', 'cancel-two', 'bravo-red'),
    (v_multi, 'notification-cancel-test', 'cancel-one', 'alpha-blue'),
    (v_multi, 'notification-cancel-test', 'cancel-two', 'bravo-blue'),
    (v_single, 'notification-cancel-test', 'cancel-one', 'alpha-red'),
    (v_unaffected, 'notification-cancel-test', 'unaffected-bout', 'other-blue');

  insert into public.profile_event_underdog_locks(
    profile_id, event_id, bout_id, fighter_slug
  ) values
    (v_multi, 'notification-cancel-test', 'cancel-one', 'alpha-blue'),
    (v_unaffected, 'notification-cancel-test', 'unaffected-bout', 'other-blue');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_multi::text, true);

  begin
    perform public.approve_pick_bout_cancellation(
      'notification-cancel-test',
      'cancel-one',
      true,
      'Unauthorized cancellation attempt'
    );
    raise exception 'Non-owner cancellation was accepted';
  exception when others then
    if sqlerrm not like '%pick control owner required%' then raise; end if;
  end;

  v_snapshot := public.get_notification_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 0 then
    raise exception 'Rejected cancellation created a notification: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_bout_cancellation(
    'notification-cancel-test',
    'cancel-one',
    true,
    'Private medical withdrawal detail'
  );

  if (select count(*) from public.profile_event_picks
      where event_id = 'notification-cancel-test' and bout_id = 'cancel-one') <> 3 then
    raise exception 'Approved cancellation did not preserve every saved pick';
  end if;

  if exists (
    select 1 from public.profile_event_underdog_locks
    where event_id = 'notification-cancel-test' and bout_id = 'cancel-one'
  ) then
    raise exception 'Cancelled bout retained a mutable Underdog Lock';
  end if;

  if not exists (
    select 1 from public.profile_event_underdog_locks
    where profile_id = v_unaffected
      and event_id = 'notification-cancel-test'
      and bout_id = 'unaffected-bout'
  ) then
    raise exception 'Cancellation changed an unrelated Underdog Lock';
  end if;

  perform set_config('request.jwt.claim.sub', v_multi::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_fight_cancelled';

  if (v_snapshot->>'unread_count')::integer <> 1
    or v_group is null
    or v_group->>'title' <> 'Fight cancelled'
    or v_group->>'route' <> '/picks'
    or v_group->>'action_label' <> 'VIEW PICKS'
    or (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'summary' not like '%Alpha Red vs. Alpha Blue was cancelled%'
    or v_group->>'summary' not like '%Your pick is preserved%'
    or v_group->>'summary' not like '%excluded from scoring%'
  then
    raise exception 'Affected member did not receive the exact cancellation contract: %', v_snapshot;
  end if;

  if v_group->>'summary' like '%Private medical withdrawal detail%' then
    raise exception 'Member cancellation copy exposed the private owner reason';
  end if;

  perform set_config('request.jwt.claim.sub', v_single::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 1 then
    raise exception 'Single affected member did not receive a cancellation notification: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_unaffected::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 0
    or jsonb_array_length(v_snapshot->'items') <> 0 then
    raise exception 'A profile without a pick on the cancelled bout received notification noise: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_bout_cancellation(
    'notification-cancel-test',
    'cancel-one',
    true,
    'Repeated request should be idempotent'
  );

  perform set_config('request.jwt.claim.sub', v_multi::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_fight_cancelled';
  if (v_group->>'aggregate_count')::integer <> 1 then
    raise exception 'Repeated cancellation replay increased the notification count: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_bout_cancellation(
    'notification-cancel-test',
    'cancel-two',
    true,
    'Second private cancellation reason'
  );

  perform set_config('request.jwt.claim.sub', v_multi::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_fight_cancelled';

  if (v_snapshot->>'unread_count')::integer <> 1
    or (v_group->>'aggregate_count')::integer <> 2
    or v_group->>'summary' not like '%Bravo Red vs. Bravo Blue was cancelled%'
  then
    raise exception 'Multiple cancellations did not aggregate to the latest matchup: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_single::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_fight_cancelled';
  if (v_group->>'aggregate_count')::integer <> 1
    or v_group->>'summary' not like '%Alpha Red vs. Alpha Blue was cancelled%' then
    raise exception 'A member unaffected by the second cancellation received extra count: %', v_snapshot;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  perform public.approve_pick_bout_cancellation(
    'notification-cancel-test',
    'cancel-two',
    false,
    'Official bout restored'
  );

  perform set_config('request.jwt.claim.sub', v_multi::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_group
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'picks_fight_cancelled';
  if (v_group->>'aggregate_count')::integer <> 2 then
    raise exception 'Restoring a bout created cancellation notification noise: %', v_snapshot;
  end if;

  if not exists (
    select 1 from public.pick_bouts
    where event_id = 'notification-cancel-test'
      and bout_id = 'cancel-two'
      and result_status = 'pending'
  ) then
    raise exception 'Canonical restoration behavior changed';
  end if;

  if (select count(*) from public.profile_event_picks
      where event_id = 'notification-cancel-test') <> 6 then
    raise exception 'Notification delivery changed preserved Picks rows';
  end if;

  if (select count(*) from public.pick_card_change_actions
      where event_id = 'notification-cancel-test') <> 3 then
    raise exception 'Notification delivery replaced or duplicated the canonical audit owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'Authenticated Picks clients can bypass the canonical notification producer';
  end if;
end $$;

rollback;
