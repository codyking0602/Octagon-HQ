begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_admin_message uuid;
  v_member_message uuid;
  v_member_message_two uuid;
  v_roster jsonb;
  v_row jsonb;
  v_result jsonb;
  v_access jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-access-admin@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM ACCESS ADMIN','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-access-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM ACCESS MEMBER','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-access-outsider@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM ACCESS OUTSIDER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin,'War Room Access Admin','WA');
  perform public.register_unclaimed_pin_profile(v_member,'War Room Access Member','WM');
  perform public.register_unclaimed_pin_profile(v_outsider,'War Room Access Outsider','WO');

  perform public.set_war_room_membership(v_admin, true, 'admin');
  perform public.set_war_room_membership(v_member, true, 'member');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);

  begin
    perform public.get_war_room_access_roster();
    raise exception 'regular member loaded the War Room access roster';
  exception
    when others then
      if sqlerrm not like '%War Room admin access required%' then
        raise;
      end if;
  end;

  v_member_message := (public.post_war_room_message('Member owned message', null, '{}'::uuid[])->>'id')::uuid;
  v_result := public.delete_war_room_message(v_member_message);
  if not (v_result->>'deleted')::boolean then
    raise exception 'member could not delete their own War Room message: %', v_result;
  end if;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_admin_message := (public.post_war_room_message('Admin owned message', null, '{}'::uuid[])->>'id')::uuid;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  begin
    perform public.delete_war_room_message(v_admin_message);
    raise exception 'regular member deleted another person''s War Room message';
  exception
    when others then
      if sqlerrm not like '%You cannot delete that War Room message%' then
        raise;
      end if;
  end;

  v_member_message_two := (public.post_war_room_message('Admin deletion target', null, '{}'::uuid[])->>'id')::uuid;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_result := public.delete_war_room_message(v_member_message_two);
  if not (v_result->>'deleted')::boolean then
    raise exception 'War Room admin could not delete another member''s message: %', v_result;
  end if;

  v_roster := public.get_war_room_access_roster();
  select item into v_row
  from jsonb_array_elements(v_roster) item
  where (item->>'id')::uuid = v_outsider;

  if v_row is null or (v_row->>'has_access')::boolean then
    raise exception 'access roster did not show the outsider as disabled: %', v_roster;
  end if;

  v_result := public.set_war_room_profile_access(v_outsider, true);
  if not (v_result->>'has_access')::boolean then
    raise exception 'admin toggle did not enable War Room access: %', v_result;
  end if;

  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'eligible' then
    raise exception 'enabled profile did not receive War Room access: %', v_access;
  end if;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_result := public.set_war_room_profile_access(v_member, false);
  if (v_result->>'has_access')::boolean then
    raise exception 'admin toggle did not revoke War Room access: %', v_result;
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_access := public.get_my_war_room_access(null);
  if v_access->>'mode' <> 'locked' then
    raise exception 'revoked profile retained War Room access: %', v_access;
  end if;

  begin
    perform public.set_war_room_profile_access(v_outsider, false);
    raise exception 'regular member changed another profile''s War Room access';
  exception
    when others then
      if sqlerrm not like '%War Room admin access required%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  begin
    perform public.set_war_room_profile_access(v_admin, false);
    raise exception 'War Room admin removed their own access';
  exception
    when others then
      if sqlerrm not like '%You cannot remove your own War Room access%' then
        raise;
      end if;
  end;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'realtime'
      and tablename = 'messages'
      and policyname = 'war_room_profile_receives_access_broadcast'
  ) then
    raise exception 'War Room profile access Broadcast policy is missing';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'private.war_room_memberships'::regclass
      and tgname = 'war_room_membership_access_broadcast'
      and not tgisinternal
  ) then
    raise exception 'War Room access-change Broadcast trigger is missing';
  end if;

  if has_function_privilege('anon','public.get_war_room_access_roster()','EXECUTE')
    or has_function_privilege('anon','public.set_war_room_profile_access(uuid,boolean)','EXECUTE')
  then
    raise exception 'anonymous role can manage War Room access';
  end if;

  if not has_function_privilege('authenticated','public.get_war_room_access_roster()','EXECUTE')
    or not has_function_privilege('authenticated','public.set_war_room_profile_access(uuid,boolean)','EXECUTE')
  then
    raise exception 'authenticated War Room admin cannot call guarded access RPCs';
  end if;
end $$;

rollback;
