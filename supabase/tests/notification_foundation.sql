begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_owner uuid := extensions.gen_random_uuid();
  v_first jsonb;
  v_second jsonb;
  v_repeat jsonb;
  v_reopened jsonb;
  v_repick jsonb;
  v_owner_alert jsonb;
  v_snapshot jsonb;
  v_receipt jsonb;
  v_rejected boolean := false;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
  (
    v_member,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'notification-member@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'NOTIFICATION MEMBER TEST', 'historical_unclaimed', true)
  ),
  (
    v_owner,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'notification-owner@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'NOTIFICATION OWNER TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(v_member, 'Notification Member Test', 'NM');
  perform public.register_unclaimed_pin_profile(v_owner, 'Notification Owner Test', 'NO');

  delete from private.notification_events;
  delete from private.notification_groups;
  delete from private.notification_owner;

  perform public.set_notification_owner(v_owner);

  v_first := public.publish_notification(
    v_member,
    'test:mention:1',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'Someone mentioned you in War Room.',
    '/war-room',
    'OPEN WAR ROOM',
    now() - interval '2 minutes'
  );

  v_second := public.publish_notification(
    v_member,
    'test:mention:2',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'Two unread War Room mentions are waiting.',
    '/war-room',
    'OPEN WAR ROOM',
    now() - interval '1 minute'
  );

  if v_first->>'id' <> v_second->>'id'
    or (v_second->>'aggregate_count')::integer <> 2
  then
    raise exception 'unread notifications did not aggregate into one counted row: %, %', v_first, v_second;
  end if;

  v_repeat := public.publish_notification(
    v_member,
    'test:mention:1',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'A retried source event must remain idempotent.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );

  if v_repeat->>'id' <> v_first->>'id'
    or (v_repeat->>'aggregate_count')::integer <> 2
  then
    raise exception 'source-key idempotency changed the notification group: %', v_repeat;
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.group_id is null
  ) then
    raise exception 'notification event was left without its canonical group';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);

  v_snapshot := public.get_notification_snapshot(50);
  if jsonb_array_length(v_snapshot->'items') <> 1
    or (v_snapshot->>'unread_count')::integer <> 1
    or ((v_snapshot->'items'->0)->>'aggregate_count')::integer <> 2
    or ((v_snapshot->'items'->0)->>'is_read')::boolean
  then
    raise exception 'member notification snapshot was incorrect: %', v_snapshot;
  end if;

  v_receipt := public.mark_notification_read((v_first->>'id')::uuid);
  if (v_receipt->>'unread_count')::integer <> 0 then
    raise exception 'mark as read did not clear the notification badge: %', v_receipt;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_reopened := public.publish_notification(
    v_member,
    'test:mention:3',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'A later mention should reopen the group without carrying the old unread count.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );

  if v_reopened->>'id' <> v_first->>'id'
    or (v_reopened->>'aggregate_count')::integer <> 1
  then
    raise exception 'a read aggregate did not reopen with a fresh count: %', v_reopened;
  end if;

  v_repick := public.publish_notification(
    v_member,
    'test:repick:event-1:fight-2',
    'picks:event-1:repick',
    'picks_repick_required',
    'Repick required',
    'A fighter replacement changed one selected matchup.',
    '/picks',
    'REVIEW PICKS',
    now()
  );

  begin
    perform public.publish_notification(
      v_member,
      'test:operations:wrong-recipient',
      'operations:event-1',
      'card_change_detected',
      'Card change detected',
      'Review is required.',
      '/picks/monitoring',
      'REVIEW CHANGE',
      now()
    );
  exception when others then
    if position('owner account' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;

  if not v_rejected then
    raise exception 'Cody-only operational notification accepted a non-owner recipient';
  end if;

  v_owner_alert := public.publish_owner_notification(
    'test:operations:owner',
    'operations:event-1:card-change',
    'card_change_detected',
    'Card change detected',
    'The monitored card changed and requires review.',
    '/picks/monitoring',
    'OPEN MONITORING',
    now()
  );

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);

  v_snapshot := public.get_notification_snapshot(50);
  if jsonb_array_length(v_snapshot->'items') <> 2
    or (v_snapshot->>'unread_count')::integer <> 2
  then
    raise exception 'member flat notification list or unread count was incorrect: %', v_snapshot;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'id' = v_owner_alert->>'id'
  ) then
    raise exception 'owner-only operational alert leaked into another profile snapshot';
  end if;

  v_receipt := public.mark_all_notifications_read();
  if (v_receipt->>'unread_count')::integer <> 0
    or (v_receipt->>'marked_count')::integer <> 2
  then
    raise exception 'mark all as read did not clear the flat list: %', v_receipt;
  end if;

  perform set_config('request.jwt.claim.sub', v_owner::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if jsonb_array_length(v_snapshot->'items') <> 1
    or (v_snapshot->>'unread_count')::integer <> 1
    or (v_snapshot->'items'->0)->>'category' <> 'operations'
    or (v_snapshot->'items'->0)->>'priority' <> 'push_candidate'
  then
    raise exception 'owner operational notification was not isolated correctly: %', v_snapshot;
  end if;

  if has_table_privilege('authenticated', 'private.notification_groups', 'SELECT')
    or has_table_privilege('authenticated', 'private.notification_events', 'SELECT')
    or has_table_privilege('authenticated', 'private.notification_owner', 'SELECT')
  then
    raise exception 'authenticated role can read private notification tables directly';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.publish_notification(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.publish_owner_notification(text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can publish notifications';
  end if;

  if has_function_privilege('anon', 'public.get_notification_snapshot(integer)', 'EXECUTE')
    or has_function_privilege('anon', 'public.mark_notification_read(uuid)', 'EXECUTE')
    or has_function_privilege('anon', 'public.mark_all_notifications_read()', 'EXECUTE')
  then
    raise exception 'anonymous role can read or mutate personal notifications';
  end if;

  if not has_function_privilege('authenticated', 'public.get_notification_snapshot(integer)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.mark_notification_read(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.mark_all_notifications_read()', 'EXECUTE')
  then
    raise exception 'required notification RPC privileges are missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'notification_profile_receives_broadcast'
  ) then
    raise exception 'profile-scoped notification Realtime policy is missing';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'private.notification_groups'::regclass
      and tgname = 'notification_groups_broadcast'
      and not tgisinternal
  ) then
    raise exception 'notification Broadcast trigger is missing';
  end if;
end $$;

rollback;
