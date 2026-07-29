begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_top jsonb;
  v_reply jsonb;
  v_snapshot jsonb;
  v_older jsonb;
  v_cursor jsonb;
  v_loop integer;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-core-admin@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CORE ADMIN','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-core-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CORE MEMBER','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-core-outsider@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CORE OUTSIDER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin,'Core Admin','CA');
  perform public.register_unclaimed_pin_profile(v_member,'Core Member','CM');
  perform public.register_unclaimed_pin_profile(v_outsider,'Core Outsider','CO');
  perform public.set_war_room_membership(v_admin, true, 'admin');
  perform public.set_war_room_membership(v_member, true, 'member');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_outsider::text,true);

  begin
    perform public.get_war_room_snapshot(null, null, 40);
    raise exception 'unauthorized profile loaded the War Room conversation';
  exception
    when others then
      if sqlerrm not like '%War Room access required%' then raise; end if;
  end;

  begin
    perform public.post_war_room_message('OUTSIDER POST', null, '{}'::uuid[]);
    raise exception 'unauthorized profile posted to the War Room';
  exception
    when others then
      if sqlerrm not like '%War Room access required%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_top := public.post_war_room_message('HEY @CORE MEMBER', null, array[v_member]);

  if v_top->>'body' <> 'HEY @CORE MEMBER'
    or v_top->'author'->>'display_name' <> 'CORE ADMIN'
    or jsonb_array_length(v_top->'mentions') <> 1
    or v_top->'mentions'->0->>'id' <> v_member::text
  then
    raise exception 'top-level War Room message or mention was not returned correctly: %', v_top;
  end if;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_reply := public.post_war_room_message('REPLYING NOW', (v_top->>'id')::uuid, '{}'::uuid[]);

  if v_reply->'parent'->>'id' <> v_top->>'id'
    or v_reply->'parent'->>'body' <> 'HEY @CORE MEMBER'
    or v_reply->'author'->>'display_name' <> 'CORE MEMBER'
  then
    raise exception 'one-level War Room reply did not retain its parent preview: %', v_reply;
  end if;

  begin
    perform public.post_war_room_message('NESTED REPLY', (v_reply->>'id')::uuid, '{}'::uuid[]);
    raise exception 'War Room accepted a nested reply';
  exception
    when others then
      if sqlerrm not like '%one level only%' then raise; end if;
  end;

  begin
    perform public.delete_war_room_message((v_top->>'id')::uuid);
    raise exception 'member deleted another profile message';
  exception
    when others then
      if sqlerrm not like '%cannot delete%' then raise; end if;
  end;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_reply := public.delete_war_room_message((v_reply->>'id')::uuid);
  if not (v_reply->>'deleted')::boolean or v_reply->'body' <> 'null'::jsonb then
    raise exception 'admin soft delete exposed the deleted body: %', v_reply;
  end if;

  for v_loop in 1..42 loop
    perform public.post_war_room_message('PAGING MESSAGE ' || v_loop, null, '{}'::uuid[]);
  end loop;

  v_snapshot := public.get_war_room_snapshot(null, null, 40);
  if jsonb_array_length(v_snapshot->'messages') <> 40
    or not (v_snapshot->>'has_more')::boolean
    or v_snapshot->'next_cursor' is null
    or jsonb_array_length(v_snapshot->'members') <> 2
  then
    raise exception 'latest War Room page did not enforce the 40-message contract: %', v_snapshot;
  end if;

  v_cursor := v_snapshot->'next_cursor';
  v_older := public.get_war_room_snapshot(
    (v_cursor->>'created_at')::timestamptz,
    (v_cursor->>'id')::uuid,
    40
  );

  if jsonb_array_length(v_older->'messages') < 4 then
    raise exception 'older War Room page did not return the remaining conversation: %', v_older;
  end if;

  if has_table_privilege('authenticated','private.war_room_messages','SELECT')
    or has_table_privilege('authenticated','private.war_room_messages','INSERT')
    or has_table_privilege('authenticated','private.war_room_mentions','SELECT')
  then
    raise exception 'authenticated role can access private War Room conversation tables directly';
  end if;

  if has_function_privilege('anon','public.get_war_room_snapshot(timestamptz,uuid,integer)','EXECUTE')
    or has_function_privilege('anon','public.post_war_room_message(text,uuid,uuid[])','EXECUTE')
    or has_function_privilege('anon','public.delete_war_room_message(uuid)','EXECUTE')
  then
    raise exception 'anonymous role can execute War Room conversation RPCs';
  end if;
end $$;

rollback;
