begin;
select set_config('request.jwt.claim.role', 'service_role', true);

-- The proof validates claim/idempotency without making an external network request.
alter table private.notification_groups disable trigger notification_groups_push_delivery;

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_endpoint text := 'https://push.example.test/subscriptions/octagon-device-proof';
  v_registered jsonb;
  v_status jsonb;
  v_push_notification jsonb;
  v_in_app_notification jsonb;
  v_deadline_notification jsonb;
  v_near_lock_notification jsonb;
  v_claim jsonb;
  v_repeated_claim jsonb;
  v_in_app_claim jsonb;
  v_deadline_claim jsonb;
  v_near_lock_claim jsonb;
  v_delivery_id uuid;
  v_recorded jsonb;
  v_removed jsonb;
  v_rejected boolean := false;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values (
    v_member,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'notification-device-push@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'NOTIFICATION PUSH TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(
    v_member,
    'Notification Push Test',
    'PD'
  );

  delete from private.notification_push_deliveries;
  delete from private.notification_push_subscriptions where profile_id = v_member;
  delete from private.notification_events where recipient_profile_id = v_member;
  delete from private.notification_groups where recipient_profile_id = v_member;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);

  v_registered := public.register_my_notification_push_subscription(
    v_endpoint,
    repeat('A', 65),
    repeat('B', 24),
    'Octagon HQ push rollback proof'
  );
  if not (v_registered->>'current_device_registered')::boolean
    or (v_registered->>'active_device_count')::integer <> 1
  then
    raise exception 'device push subscription was not registered: %', v_registered;
  end if;

  v_status := public.get_my_notification_push_status(v_endpoint);
  if v_status is distinct from v_registered then
    raise exception 'device push status did not match its canonical private row: %, %', v_status, v_registered;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_push_notification := public.publish_notification(
    v_member,
    'push-proof:mention:1',
    'push-proof:mentions',
    'war_room_mention',
    'You were mentioned',
    'A push-candidate notification should claim one delivery for the connected device.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );

  v_claim := public.claim_notification_push_delivery((v_push_notification->>'id')::uuid);
  if jsonb_array_length(v_claim->'deliveries') <> 1
    or v_claim->'notification'->>'title' <> 'You were mentioned'
    or v_claim->'notification'->>'route' <> '/war-room'
  then
    raise exception 'push-candidate delivery was not claimed correctly: %', v_claim;
  end if;

  v_delivery_id := (v_claim->'deliveries'->0->>'delivery_id')::uuid;
  v_repeated_claim := public.claim_notification_push_delivery((v_push_notification->>'id')::uuid);
  if jsonb_array_length(v_repeated_claim->'deliveries') <> 0 then
    raise exception 'the same notification version was claimed twice: %', v_repeated_claim;
  end if;

  v_in_app_notification := public.publish_notification(
    v_member,
    'push-proof:event-starting:1',
    'push-proof:event-starting',
    'ufc_event_starting',
    'UFC event starts soon',
    'An in-app-only notification must never create a device delivery claim.',
    '/picks',
    'OPEN PICKS',
    now()
  );
  v_in_app_claim := public.claim_notification_push_delivery((v_in_app_notification->>'id')::uuid);
  if v_in_app_claim->'notification' <> 'null'::jsonb
    or jsonb_array_length(v_in_app_claim->'deliveries') <> 0
  then
    raise exception 'an in-app-only notification became push eligible: %', v_in_app_claim;
  end if;

  v_deadline_notification := public.publish_notification(
    v_member,
    'push-proof:picks-deadline-changed:1',
    'picks-deadline-changed:test-event:' || v_member,
    'picks_incomplete_near_lock',
    'Picks deadline changed',
    'A changed fight deadline should remain in-app without reaching a device.',
    '/picks',
    'OPEN PICKS',
    now()
  );
  if not exists (
    select 1
    from private.notification_groups notification
    where notification.id = (v_deadline_notification->>'id')::uuid
      and notification.kind = 'picks_incomplete_near_lock'
      and notification.aggregation_key like 'picks-deadline-changed:%'
  ) then
    raise exception 'the Picks deadline-change notification was not retained in-app';
  end if;

  v_deadline_claim := public.claim_notification_push_delivery(
    (v_deadline_notification->>'id')::uuid
  );
  if v_deadline_claim->'notification' <> 'null'::jsonb
    or jsonb_array_length(v_deadline_claim->'deliveries') <> 0
    or exists (
      select 1
      from private.notification_push_deliveries delivery
      where delivery.notification_id = (v_deadline_notification->>'id')::uuid
    )
  then
    raise exception 'the Picks deadline-change notification produced device push work: %', v_deadline_claim;
  end if;

  v_near_lock_notification := public.publish_notification(
    v_member,
    'push-proof:picks-near-lock:1',
    'picks-near-lock:test-event:' || v_member,
    'picks_incomplete_near_lock',
    'Finish your Picks',
    'A legitimate near-lock reminder should still reach the connected device.',
    '/picks',
    'OPEN PICKS',
    now()
  );
  v_near_lock_claim := public.claim_notification_push_delivery(
    (v_near_lock_notification->>'id')::uuid
  );
  if jsonb_array_length(v_near_lock_claim->'deliveries') <> 1
    or not exists (
      select 1
      from private.notification_push_deliveries delivery
      where delivery.notification_id = (v_near_lock_notification->>'id')::uuid
    )
  then
    raise exception 'a normal Picks near-lock reminder did not produce device push work: %', v_near_lock_claim;
  end if;

  v_recorded := public.record_notification_push_delivery(
    v_delivery_id,
    false,
    410,
    'Subscription expired'
  );
  if v_recorded->>'status' <> 'expired'
    or exists (
      select 1
      from private.notification_push_subscriptions subscription
      where subscription.profile_id = v_member
        and subscription.endpoint = v_endpoint
        and subscription.enabled
    )
  then
    raise exception 'expired endpoint was not disabled safely: %', v_recorded;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_registered := public.register_my_notification_push_subscription(
    v_endpoint,
    repeat('C', 65),
    repeat('D', 24),
    'Octagon HQ renewed push rollback proof'
  );
  if not (v_registered->>'current_device_registered')::boolean then
    raise exception 'expired endpoint could not be renewed by its signed-in device: %', v_registered;
  end if;

  v_removed := public.remove_my_notification_push_subscription(v_endpoint);
  if (v_removed->>'current_device_registered')::boolean
    or (v_removed->>'active_device_count')::integer <> 0
    or exists (
      select 1
      from private.notification_push_subscriptions subscription
      where subscription.profile_id = v_member
        and subscription.endpoint = v_endpoint
    )
  then
    raise exception 'signed-in device push removal was incomplete: %', v_removed;
  end if;

  begin
    perform public.claim_notification_push_delivery((v_push_notification->>'id')::uuid);
  exception when others then
    if position('permission denied' in lower(sqlerrm)) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'authenticated clients can claim private push deliveries';
  end if;

  if has_table_privilege('authenticated', 'private.notification_push_subscriptions', 'select')
    or has_table_privilege('authenticated', 'private.notification_push_subscriptions', 'insert')
    or has_table_privilege('authenticated', 'private.notification_push_deliveries', 'select')
  then
    raise exception 'authenticated role can access private push storage directly';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.get_notification_push_configuration()',
    'EXECUTE'
  ) or has_function_privilege(
    'authenticated',
    'public.authorize_notification_push_delivery(text)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can access service-only push secrets or authorization';
  end if;
end;
$$;

rollback;
