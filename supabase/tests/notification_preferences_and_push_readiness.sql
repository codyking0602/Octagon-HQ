begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_saved jsonb;
  v_optional jsonb;
  v_critical jsonb;
  v_owner_alert jsonb;
  v_snapshot jsonb;
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
    'notification-push-only@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'NOTIFICATION PUSH ONLY TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(
    v_member,
    'Notification Push Only Test',
    '7311'
  );

  delete from private.notification_events where recipient_profile_id = v_member;
  delete from private.notification_groups where recipient_profile_id = v_member;
  delete from private.notification_preferences where profile_id = v_member;
  delete from private.notification_owner;
  perform public.set_notification_owner(v_member);

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);

  -- Legacy category values may still be stored for compatibility, but they no longer mute the bell.
  v_saved := public.set_my_notification_preferences(false, false, false, false);
  if (v_saved->>'picks_reminders')::boolean
    or (v_saved->>'daily_challenge_reminders')::boolean
    or (v_saved->>'game_challenge_activity')::boolean
    or (v_saved->>'war_room_activity')::boolean
  then
    raise exception 'legacy compatibility values were not saved: %', v_saved;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_optional := public.publish_notification(
    v_member,
    'push-only:test:war-room',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'The in-app bell must remain available even when legacy category values are false.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );
  if (v_optional->>'created')::boolean is not true
    or coalesce((v_optional->>'suppressed')::boolean, true) is not false
  then
    raise exception 'an optional in-app notification was incorrectly suppressed: %', v_optional;
  end if;

  v_critical := public.publish_notification(
    v_member,
    'push-only:test:critical',
    'picks:push-only:repick',
    'picks_repick_required',
    'Repick required',
    'Critical Picks actions remain in the bell.',
    '/picks',
    'REVIEW PICKS',
    now()
  );
  if (v_critical->>'created')::boolean is not true then
    raise exception 'critical action did not publish: %', v_critical;
  end if;

  v_owner_alert := public.publish_owner_notification(
    'push-only:test:owner-operation',
    'operations:push-only:test',
    'event_ready_to_complete',
    'Event ready to complete',
    'Cody-only operations remain in the bell.',
    '/picks/control',
    'OPEN CONTROL',
    now()
  );
  if (v_owner_alert->>'created')::boolean is not true then
    raise exception 'owner operation did not publish: %', v_owner_alert;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if jsonb_array_length(v_snapshot->'items') <> 3 then
    raise exception 'bell snapshot did not include all expected notifications: %', v_snapshot;
  end if;

  begin
    perform private.notification_preference_enabled(v_member, 'war_room_mention');
  exception when others then
    if position('permission denied' in lower(sqlerrm)) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'authenticated clients can invoke the private compatibility helper';
  end if;

  if has_table_privilege('authenticated', 'private.notification_preferences', 'select')
    or has_table_privilege('authenticated', 'private.notification_preferences', 'insert')
    or has_table_privilege('authenticated', 'private.notification_preferences', 'update')
  then
    raise exception 'authenticated role can access private notification compatibility storage directly';
  end if;
end;
$$;

rollback;
