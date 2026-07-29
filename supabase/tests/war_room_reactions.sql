begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_admin uuid := extensions.gen_random_uuid();
  v_member uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_message_id uuid;
  v_reply_id uuid;
  v_result jsonb;
  v_snapshot jsonb;
  v_reaction jsonb;
  v_reply jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_admin,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-reaction-admin@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM REACTION ADMIN','historical_unclaimed',true)),
    (v_member,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-reaction-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM REACTION MEMBER','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'war-room-reaction-outsider@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','WAR ROOM REACTION OUTSIDER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_admin,'War Room Reaction Admin','WA');
  perform public.register_unclaimed_pin_profile(v_member,'War Room Reaction Member','WM');
  perform public.register_unclaimed_pin_profile(v_outsider,'War Room Reaction Outsider','WO');

  perform public.set_war_room_membership(v_admin, true, 'admin');
  perform public.set_war_room_membership(v_member, true, 'member');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_message_id := (public.post_war_room_message('Reaction target', null, '{}'::uuid[])->>'id')::uuid;

  v_result := public.toggle_war_room_reaction(v_message_id, 'like');
  select item into v_reaction
  from jsonb_array_elements(v_result->'reactions') item
  where item->>'type' = 'like';
  if (v_reaction->>'count')::integer <> 1 or not (v_reaction->>'reacted')::boolean then
    raise exception 'Like reaction did not toggle on: %', v_result;
  end if;

  v_result := public.toggle_war_room_reaction(v_message_id, 'dislike');
  if not exists (
    select 1
    from jsonb_array_elements(v_result->'reactions') item
    where item->>'type' = 'like'
      and (item->>'count')::integer = 1
      and (item->>'reacted')::boolean
  ) or not exists (
    select 1
    from jsonb_array_elements(v_result->'reactions') item
    where item->>'type' = 'dislike'
      and (item->>'count')::integer = 1
      and (item->>'reacted')::boolean
  ) then
    raise exception 'independent War Room reactions did not coexist: %', v_result;
  end if;

  v_result := public.toggle_war_room_reaction(v_message_id, 'like');
  select item into v_reaction
  from jsonb_array_elements(v_result->'reactions') item
  where item->>'type' = 'like';
  if (v_reaction->>'count')::integer <> 0 or (v_reaction->>'reacted')::boolean then
    raise exception 'Like reaction did not toggle off: %', v_result;
  end if;

  perform set_config('request.jwt.claim.sub',v_admin::text,true);
  v_result := public.toggle_war_room_reaction(v_message_id, 'laugh');
  select item into v_reaction
  from jsonb_array_elements(v_result->'reactions') item
  where item->>'type' = 'laugh';
  if (v_reaction->>'count')::integer <> 1 or not (v_reaction->>'reacted')::boolean then
    raise exception 'admin Laugh reaction did not toggle on: %', v_result;
  end if;

  v_reply_id := (public.post_war_room_message('Reply survives deleted parent', v_message_id, '{}'::uuid[])->>'id')::uuid;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_result := public.toggle_war_room_reaction(v_message_id, 'laugh');
  select item into v_reaction
  from jsonb_array_elements(v_result->'reactions') item
  where item->>'type' = 'laugh';
  if (v_reaction->>'count')::integer <> 2 or not (v_reaction->>'reacted')::boolean then
    raise exception 'Laugh reaction count did not aggregate across members: %', v_result;
  end if;

  begin
    perform public.toggle_war_room_reaction(v_message_id, 'confused');
    raise exception 'unsupported War Room reaction was accepted';
  exception
    when others then
      if sqlerrm not like '%Unsupported War Room reaction%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  begin
    perform public.toggle_war_room_reaction(v_message_id, 'exclaim');
    raise exception 'unauthorized profile reacted to a War Room message';
  exception
    when others then
      if sqlerrm not like '%War Room access required%' then
        raise;
      end if;
  end;

  perform set_config('request.jwt.claim.sub',v_member::text,true);
  v_result := public.delete_war_room_message(v_message_id);
  if not (v_result->>'deleted')::boolean then
    raise exception 'owned message was not soft-deleted before disappearing: %', v_result;
  end if;

  v_snapshot := public.get_war_room_snapshot(null, null, 40);
  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'messages') item
    where (item->>'id')::uuid = v_message_id
  ) then
    raise exception 'deleted War Room message remained visible in the snapshot: %', v_snapshot;
  end if;

  select item into v_reply
  from jsonb_array_elements(v_snapshot->'messages') item
  where (item->>'id')::uuid = v_reply_id;
  if v_reply is null then
    raise exception 'reply disappeared with its deleted parent: %', v_snapshot;
  end if;
  if v_reply->'parent' is not null and v_reply->'parent' <> 'null'::jsonb then
    raise exception 'deleted parent preview remained visible on its reply: %', v_reply;
  end if;

  v_result := public.get_war_room_message(v_message_id);
  if not (v_result->>'deleted')::boolean or v_result->>'body' is not null then
    raise exception 'targeted deleted-message reconciliation exposed content: %', v_result;
  end if;

  begin
    perform public.toggle_war_room_reaction(v_message_id, 'like');
    raise exception 'deleted War Room message accepted a reaction';
  exception
    when others then
      if sqlerrm not like '%That War Room message is not available%' then
        raise;
      end if;
  end;

  if exists (
    select 1
    from private.war_room_reactions reaction
    where reaction.message_id = v_message_id
  ) then
    raise exception 'deleted War Room message retained reactions';
  end if;

  if not exists (
    select 1
    from pg_trigger
    where tgrelid = 'private.war_room_reactions'::regclass
      and tgname = 'war_room_reactions_broadcast'
      and not tgisinternal
  ) then
    raise exception 'War Room reaction Broadcast trigger is missing';
  end if;

  if has_table_privilege('authenticated','private.war_room_reactions','SELECT')
    or has_table_privilege('authenticated','private.war_room_reactions','INSERT')
    or has_table_privilege('authenticated','private.war_room_reactions','DELETE')
  then
    raise exception 'authenticated role can access private War Room reactions directly';
  end if;

  if has_function_privilege('anon','public.get_war_room_message(uuid)','EXECUTE')
    or has_function_privilege('anon','public.toggle_war_room_reaction(uuid,text)','EXECUTE')
  then
    raise exception 'anonymous role can use War Room reaction RPCs';
  end if;

  if not has_function_privilege('authenticated','public.get_war_room_message(uuid)','EXECUTE')
    or not has_function_privilege('authenticated','public.toggle_war_room_reaction(uuid,text)','EXECUTE')
  then
    raise exception 'authenticated War Room members cannot use guarded reaction RPCs';
  end if;
end $$;

rollback;
