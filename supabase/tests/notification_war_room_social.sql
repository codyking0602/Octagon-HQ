begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_author uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_third uuid := extensions.gen_random_uuid();
  v_recipient_root jsonb;
  v_snapshot jsonb;
  v_mention_group_id uuid;
  v_reply_group_id uuid;
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_author,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-war-room-author@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'WAR ROOM AUTHOR', 'historical_unclaimed', true)
    ),
    (
      v_recipient,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-war-room-recipient@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'WAR ROOM RECIPIENT', 'historical_unclaimed', true)
    ),
    (
      v_third,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'notification-war-room-third@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name', 'WAR ROOM THIRD', 'historical_unclaimed', true)
    );

  perform public.register_unclaimed_pin_profile(v_author, 'War Room Author', 'WA');
  perform public.register_unclaimed_pin_profile(v_recipient, 'War Room Recipient', 'WR');
  perform public.register_unclaimed_pin_profile(v_third, 'War Room Third', 'WT');
  perform public.set_war_room_membership(v_author, true, 'member');
  perform public.set_war_room_membership(v_recipient, true, 'member');
  perform public.set_war_room_membership(v_third, true, 'member');

  delete from private.notification_events;
  delete from private.notification_groups;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_author::text, true);

  perform public.post_war_room_message(
    'FIRST @WAR ROOM RECIPIENT',
    null,
    array[v_recipient]
  );
  perform public.post_war_room_message(
    'SECOND @WAR ROOM RECIPIENT',
    null,
    array[v_recipient]
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if jsonb_array_length(v_snapshot->'items') <> 1
    or (v_snapshot->>'unread_count')::integer <> 1
    or (v_snapshot->'items'->0)->>'kind' <> 'war_room_mention'
    or ((v_snapshot->'items'->0)->>'aggregate_count')::integer <> 2
    or (v_snapshot->'items'->0)->>'route' <> '/war-room'
  then
    raise exception 'War Room mentions did not aggregate into one notification row: %', v_snapshot;
  end if;

  v_mention_group_id := ((v_snapshot->'items'->0)->>'id')::uuid;
  perform public.mark_notification_read(v_mention_group_id);

  v_recipient_root := public.post_war_room_message(
    'RECIPIENT ROOT MESSAGE',
    null,
    '{}'::uuid[]
  );

  perform set_config('request.jwt.claim.sub', v_author::text, true);
  perform public.post_war_room_message(
    'REPLYING TO @WAR ROOM RECIPIENT',
    (v_recipient_root->>'id')::uuid,
    array[v_recipient]
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  v_snapshot := public.get_notification_snapshot(50);

  if (v_snapshot->>'unread_count')::integer <> 1
    or jsonb_array_length(v_snapshot->'items') <> 2
  then
    raise exception 'War Room reply notification count was incorrect: %', v_snapshot;
  end if;

  select (item->>'id')::uuid
    into v_reply_group_id
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'war_room_reply';

  if v_reply_group_id is null then
    raise exception 'War Room reply did not create a notification';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'war_room_mention'
      and not (item->>'is_read')::boolean
  ) then
    raise exception 'A reply that also mentioned its parent author created duplicate unread notifications';
  end if;

  perform set_config('request.jwt.claim.sub', v_author::text, true);
  perform public.post_war_room_message(
    'SELF @WAR ROOM AUTHOR',
    null,
    array[v_author]
  );

  v_snapshot := public.get_notification_snapshot(50);
  if (v_snapshot->>'unread_count')::integer <> 0 then
    raise exception 'A self mention created a notification: %', v_snapshot;
  end if;

  if not exists (
    select 1
    from private.notification_events event
    join private.notification_groups notification on notification.id = event.group_id
    where notification.recipient_profile_id = v_recipient
      and notification.kind = 'war_room_mention'
  ) then
    raise exception 'War Room mention did not publish through the canonical notification owner';
  end if;

  if has_function_privilege(
    'authenticated',
    'private.publish_notification_to_profile(uuid,text,text,text,text,text,text,text,timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'authenticated role can bypass the canonical War Room notification transition';
  end if;
end $$;

rollback;
