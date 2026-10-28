begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_second uuid := extensions.gen_random_uuid();
  v_revoked uuid := extensions.gen_random_uuid();
  v_invite_id uuid;
  v_invite_code text;
  v_second_invite_id uuid;
  v_second_invite_code text;
  v_revoked_invite_id uuid;
  v_revoked_invite_code text;
  v_access jsonb;
  v_joined jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-admin@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM ADMIN','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM MEMBER','historical_unclaimed',true)),
    (v_second,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-second@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM SECOND','historical_unclaimed',true)),
    (v_revoked,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-revoked@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM REVOKED','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin,'War Room Admin','WA');
  perform public.register_unclaimed_pin_profile(v_member,'War Room Member','WM');
  perform public.register_unclaimed_pin_profile(v_second,'War Room Second','WS');
  perform public.register_unclaimed_pin_profile(v_revoked,'War Room Revoked','WR');

  perform public.set_war_room_membership(v_admin, true, 'admin');

  select invite_id, invite_code
    into v_invite_id, v_invite_code
  from public.create_war_room_invite(now() + interval '7 days', 1, v_admin);

  if v_invite_code is null or v_invite_code !~ '^WR-[A-F0-9]{24}$' then
    raise exception 'service invite creation did not return one usable raw code';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'private'
      and table_name = 'war_room_invites'
      and column_name in ('code', 'invite_code', 'raw_code')
  ) then
    raise exception 'War Room invite table stores a raw invite code';
  end if;

  if not exists (
    select 1
    from private.war_room_invites invite
    where invite.id = v_invite_id
      and invite.code_hash = private.war_room_invite_hash(v_invite_code)
      and invite.use_count = 0
  ) then
    raise exception 'War Room invite was not stored as the expected hash';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);

  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'locked' or (v_access->>'eligible')::boolean then
    raise exception 'unauthorized signed-in member received War Room access: %', v_access;
  end if;

  v_access := public.get_my_war_room_access(v_invite_code);
  if v_access->>'mode' <> 'invite'
    or (v_access->>'eligible')::boolean
    or (v_access->>'invite_uses_remaining')::integer <> 1
  then
    raise exception 'valid invite did not produce the Join with Invite state: %', v_access;
  end if;

  v_joined := public.join_war_room_with_invite(v_invite_code);
  if v_joined->>'mode' <> 'eligible'
    or not (v_joined->>'eligible')::boolean
    or v_joined->>'role' <> 'member'
    or not (v_joined->>'joined')::boolean
  then
    raise exception 'valid invite did not create an eligible membership: %', v_joined;
  end if;

  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'eligible'
    or not (v_access->>'eligible')::boolean
    or v_access->>'role' <> 'member'
  then
    raise exception 'joined member did not retain War Room access without the invite URL: %', v_access;
  end if;

  v_joined := public.join_war_room_with_invite('WR-NOT-A-REAL-CODE');
  if not (v_joined->>'eligible')::boolean or (v_joined->>'joined')::boolean then
    raise exception 'existing member did not receive idempotent eligible access: %', v_joined;
  end if;

  perform set_config('request.jwt.claim.sub',v_second::text,true);
  v_access := public.get_my_war_room_access(v_invite_code);
  if v_access->>'mode' <> 'locked' then
    raise exception 'consumed single-use invite remained visible to another profile: %', v_access;
  end if;

  begin
    perform public.join_war_room_with_invite(v_invite_code);
    raise exception 'consumed single-use invite admitted a second profile';
  exception
    when others then
      if sqlerrm not like '%invalid or expired War Room invite%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  select invite_id, invite_code
    into v_revoked_invite_id, v_revoked_invite_code
  from public.create_war_room_invite(now() + interval '7 days', 2, v_admin);
  perform public.revoke_war_room_invite(v_revoked_invite_id);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_second::text,true);
  v_access := public.get_my_war_room_access(v_revoked_invite_code);
  if v_access->>'mode' <> 'locked' then
    raise exception 'revoked invite produced a join state: %', v_access;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.set_war_room_membership(v_revoked, false, 'member');
  select invite_id, invite_code
    into v_second_invite_id, v_second_invite_code
  from public.create_war_room_invite(now() + interval '7 days', 5, v_admin);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_revoked::text,true);
  v_access := public.get_my_war_room_access(v_second_invite_code);
  if v_access->>'mode' <> 'locked' then
    raise exception 'revoked membership received an invite join state: %', v_access;
  end if;

  begin
    perform public.join_war_room_with_invite(v_second_invite_code);
    raise exception 'revoked membership bypassed revocation with a generic invite';
  exception
    when others then
      if sqlerrm not like '%access is not available for this profile%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform public.set_war_room_membership(v_second, true, 'admin');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_second::text,true);
  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'eligible' or v_access->>'role' <> 'admin' then
    raise exception 'service-managed admin membership was not reflected by access RPC: %', v_access;
  end if;

  if has_function_privilege('anon','public.get_my_war_room_access(text)','EXECUTE')
    or has_function_privilege('anon','public.join_war_room_with_invite(text)','EXECUTE')
  then
    raise exception 'anonymous role can execute a War Room member RPC';
  end if;

  if has_function_privilege('authenticated','public.create_war_room_invite(timestamptz,integer,uuid)','EXECUTE')
    or has_function_privilege('authenticated','public.revoke_war_room_invite(uuid)','EXECUTE')
    or has_function_privilege('authenticated','public.set_war_room_membership(uuid,boolean,text)','EXECUTE')
  then
    raise exception 'authenticated role can execute War Room administrative RPCs';
  end if;

  if has_table_privilege('authenticated','private.war_room_invites','SELECT')
    or has_table_privilege('authenticated','private.war_room_memberships','SELECT')
  then
    raise exception 'authenticated role can read private War Room access tables directly';
  end if;
end $$;

rollback;
