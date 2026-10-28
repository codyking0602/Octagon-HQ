begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_invitee uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_invite_id uuid;
  v_invite_code text;
  v_first_id uuid;
  v_second_id uuid;
  v_third_id uuid;
  v_member_post_id uuid;
  v_access jsonb;
  v_snapshot jsonb;
  v_receipt jsonb;
  v_joined jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-launch-admin@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM LAUNCH ADMIN','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-launch-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM LAUNCH MEMBER','historical_unclaimed',true)),
    (v_invitee,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-launch-invitee@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM LAUNCH INVITEE','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-launch-outsider@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM LAUNCH OUTSIDER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin,'War Room Launch Admin','WA');
  perform public.register_unclaimed_pin_profile(v_member,'War Room Launch Member','WM');
  perform public.register_unclaimed_pin_profile(v_invitee,'War Room Launch Invitee','WI');
  perform public.register_unclaimed_pin_profile(v_outsider,'War Room Launch Outsider','WO');

  perform public.set_war_room_membership(v_admin, true, 'admin');
  perform public.set_war_room_membership(v_member, true, 'member');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'eligible'
    or (v_access->>'unread_count')::integer <> 0
  then
    raise exception 'newly granted member did not start with a clean read position: %', v_access;
  end if;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_first_id := (public.post_war_room_message('First launch message', null, '{}'::uuid[])->>'id')::uuid;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_access := public.get_my_war_room_access(null);
  if (v_access->>'unread_count')::integer <> 1 then
    raise exception 'new War Room message did not increment unread count: %', v_access;
  end if;

  v_snapshot := public.get_war_room_snapshot(null, null, 40);
  if (v_snapshot->>'unread_count')::integer <> 1
    or (v_snapshot->>'latest_message_id')::uuid <> v_first_id
  then
    raise exception 'snapshot did not publish unread and latest-message state: %', v_snapshot;
  end if;

  v_receipt := public.mark_war_room_read(v_first_id);
  if (v_receipt->>'unread_count')::integer <> 0
    or (v_receipt->>'last_read_message_id')::uuid <> v_first_id
  then
    raise exception 'mark read did not clear the first unread message: %', v_receipt;
  end if;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_second_id := (public.post_war_room_message('Second launch message', null, '{}'::uuid[])->>'id')::uuid;
  v_third_id := (public.post_war_room_message('Third launch message', null, '{}'::uuid[])->>'id')::uuid;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_access := public.get_my_war_room_access(null);
  if (v_access->>'unread_count')::integer <> 2 then
    raise exception 'two later messages did not produce two unread messages: %', v_access;
  end if;

  v_receipt := public.mark_war_room_read(v_second_id);
  if (v_receipt->>'unread_count')::integer <> 1 then
    raise exception 'partial read position did not leave one unread message: %', v_receipt;
  end if;

  v_receipt := public.mark_war_room_read(v_first_id);
  if (v_receipt->>'unread_count')::integer <> 1
    or (v_receipt->>'last_read_message_id')::uuid <> v_second_id
  then
    raise exception 'War Room read position moved backward: %', v_receipt;
  end if;

  v_receipt := public.mark_war_room_read(v_third_id);
  if (v_receipt->>'unread_count')::integer <> 0 then
    raise exception 'latest read position did not clear unread messages: %', v_receipt;
  end if;

  v_member_post_id := (public.post_war_room_message('My own launch message', null, '{}'::uuid[])->>'id')::uuid;
  v_access := public.get_my_war_room_access(null);
  if (v_access->>'unread_count')::integer <> 0 then
    raise exception 'member own message counted as unread: %', v_access;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  select invite_id, invite_code
    into v_invite_id, v_invite_code
  from public.create_war_room_invite(now() + interval '7 days', 1, v_admin);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_invitee::text,true);
  v_access := public.get_my_war_room_access(v_invite_code);
  if v_access->>'mode' <> 'invite' then
    raise exception 'valid launch invite did not produce Join with Invite state: %', v_access;
  end if;

  v_joined := public.join_war_room_with_invite(v_invite_code);
  if v_joined->>'mode' <> 'eligible'
    or not (v_joined->>'joined')::boolean
    or (v_joined->>'unread_count')::integer <> 0
  then
    raise exception 'invite join did not start at the current conversation edge: %', v_joined;
  end if;

  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'locked' then
    raise exception 'unauthorized profile received War Room launch access: %', v_access;
  end if;

  begin
    perform public.mark_war_room_read(v_member_post_id);
    raise exception 'unauthorized profile marked the War Room read position';
  exception
    when others then
      if sqlerrm not like '%War Room access required%' then
        raise;
      end if;
  end;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'war_room_members_receive_broadcast'
  ) then
    raise exception 'War Room private Realtime authorization policy is missing';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'private.war_room_messages'::regclass
      and tgname = 'war_room_messages_broadcast'
      and not tgisinternal
  ) then
    raise exception 'War Room database Broadcast trigger is missing';
  end if;

  if has_function_privilege('anon','public.mark_war_room_read(uuid)','EXECUTE') then
    raise exception 'anonymous role can mark War Room messages read';
  end if;

  if not has_function_privilege('authenticated','public.mark_war_room_read(uuid)','EXECUTE') then
    raise exception 'authenticated War Room member cannot mark messages read';
  end if;

  if has_table_privilege('authenticated','private.war_room_messages','SELECT')
    or has_table_privilege('authenticated','private.war_room_memberships','SELECT')
  then
    raise exception 'War Room launch exposed private tables directly';
  end if;
end $$;

rollback;
