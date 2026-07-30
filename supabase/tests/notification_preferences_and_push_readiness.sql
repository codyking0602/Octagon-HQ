begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_member uuid := extensions.gen_random_uuid();
  v_defaults jsonb;
  v_saved jsonb;
  v_suppressed jsonb;
  v_critical jsonb;
  v_enabled jsonb;
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
    'notification-preferences@login.octagon-hq.app',
    '',
    now(),
    now(),
    now(),
    jsonb_build_object('display_name', 'NOTIFICATION PREFERENCES TEST', 'historical_unclaimed', true)
  );

  perform public.register_unclaimed_pin_profile(
    v_member,
    'Notification Preferences Test',
    'NP'
  );

  delete from private.notification_events where recipient_profile_id = v_member;
  delete from private.notification_groups where recipient_profile_id = v_member;
  delete from private.notification_preferences where profile_id = v_member;
  delete from private.notification_owner;
  perform public.set_notification_owner(v_member);

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);

  v_defaults := public.get_my_notification_preferences();
  if not (v_defaults->>'picks_reminders')::boolean
    or not (v_defaults->>'daily_challenge_reminders')::boolean
    or not (v_defaults->>'game_challenge_activity')::boolean
    or not (v_defaults->>'war_room_activity')::boolean
    or not (v_defaults->>'critical_actions')::boolean
  then
    raise exception 'notification preference defaults were not all enabled: %', v_defaults;
  end if;

  v_saved := public.set_my_notification_preferences(false, false, false, false);
  if (v_saved->>'picks_reminders')::boolean
    or (v_saved->>'daily_challenge_reminders')::boolean
    or (v_saved->>'game_challenge_activity')::boolean
    or (v_saved->>'war_room_activity')::boolean
    or not (v_saved->>'critical_actions')::boolean
  then
    raise exception 'optional notification preferences were not saved independently of critical actions: %', v_saved;
  end if;

  v_defaults := public.get_my_notification_preferences();
  if v_defaults is distinct from v_saved then
    raise exception 'cross-device preference read did not match the saved canonical row: %, %', v_defaults, v_saved;
  end if;

  begin
    perform public.set_my_notification_preferences(null, false, false, false);
  exception when others then
    if position('complete notification preferences' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then
    raise exception 'partial notification preference update was accepted';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_suppressed := public.publish_notification(
    v_member,
    'preferences:test:war-room:off',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'Optional War Room activity should respect the member preference.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );
  if coalesce((v_suppressed->>'suppressed')::boolean, false) is not true
    or coalesce((v_suppressed->>'created')::boolean, true) is not false
  then
    raise exception 'disabled optional activity was not suppressed by the canonical publisher: %', v_suppressed;
  end if;

  if exists (
    select 1
    from private.notification_events event
    where event.recipient_profile_id = v_member
      and event.source_key = 'preferences:test:war-room:off'
  ) then
    raise exception 'suppressed optional activity created a source event';
  end if;

  v_critical := public.publish_notification(
    v_member,
    'preferences:test:critical:repick',
    'picks:event-preferences:repick',
    'picks_repick_required',
    'Repick required',
    'Critical Picks actions stay available even when optional reminders are off.',
    '/picks',
    'REVIEW PICKS',
    now()
  );
  if (v_critical->>'created')::boolean is not true
    or coalesce((v_critical->>'suppressed')::boolean, true) is not false
  then
    raise exception 'critical action was incorrectly suppressed: %', v_critical;
  end if;

  v_owner_alert := public.publish_owner_notification(
    'preferences:test:owner-operation',
    'operations:preferences:test',
    'event_ready_to_complete',
    'Event ready to complete',
    'Cody-only operations cannot be disabled by member preferences.',
    '/picks/control',
    'OPEN CONTROL',
    now()
  );
  if (v_owner_alert->>'created')::boolean is not true then
    raise exception 'owner operation was incorrectly suppressed: %', v_owner_alert;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  perform public.set_my_notification_preferences(false, false, false, true);

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_enabled := public.publish_notification(
    v_member,
    'preferences:test:war-room:on',
    'war-room:mentions',
    'war_room_mention',
    'You were mentioned',
    'The newly enabled War Room preference should publish.',
    '/war-room',
    'OPEN WAR ROOM',
    now()
  );
  if (v_enabled->>'created')::boolean is not true
    or coalesce((v_enabled->>'suppressed')::boolean, true) is not false
  then
    raise exception 're-enabled optional activity did not publish: %', v_enabled;
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_member::text, true);
  v_snapshot := public.get_notification_snapshot(50);
  if jsonb_array_length(v_snapshot->'items') <> 3
    or exists (
      select 1
      from jsonb_array_elements(v_snapshot->'items') item
      where item->>'summary' like '%should respect the member preference%'
    )
  then
    raise exception 'notification snapshot included suppressed activity or omitted required activity: %', v_snapshot;
  end if;

  v_rejected := false;
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
    raise exception 'authenticated clients can invoke the private preference evaluator';
  end if;

  if has_table_privilege('authenticated', 'private.notification_preferences', 'select')
    or has_table_privilege('authenticated', 'private.notification_preferences', 'insert')
    or has_table_privilege('authenticated', 'private.notification_preferences', 'update')
  then
    raise exception 'authenticated role can access private notification preferences directly';
  end if;
end;
$$;

rollback;
