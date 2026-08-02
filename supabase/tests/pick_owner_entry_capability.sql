begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
begin
  insert into auth.users(
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  )
  values
    (
      v_owner_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'pick-owner-entry@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name','PICKS OWNER ENTRY','historical_unclaimed',true)
    ),
    (
      v_member_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'pick-member-entry@login.octagon-hq.app',
      '', now(), now(), now(),
      jsonb_build_object('display_name','PICKS MEMBER ENTRY','historical_unclaimed',true)
    );

  perform public.register_unclaimed_pin_profile(v_owner_id,'Picks Owner Entry','PO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Picks Member Entry','PM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  if not has_function_privilege(
    'authenticated',
    'public.get_my_pick_control_capability()',
    'EXECUTE'
  ) then
    raise exception 'authenticated profiles cannot read their Picks owner capability';
  end if;

  if has_function_privilege(
    'anon',
    'public.get_my_pick_control_capability()',
    'EXECUTE'
  ) then
    raise exception 'anonymous users can read the Picks owner capability';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.is_pick_control_owner(uuid)',
    'EXECUTE'
  ) then
    raise exception 'browser roles can invoke the canonical owner predicate directly';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  if public.get_my_pick_control_capability() then
    raise exception 'non-owner profile received the Picks owner capability';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  if not public.get_my_pick_control_capability() then
    raise exception 'canonical Picks owner did not receive the owner capability';
  end if;

  if has_table_privilege('authenticated','public.pick_control_owners','SELECT') then
    raise exception 'browser role can read the private Picks owner allowlist';
  end if;
end $$;

rollback;
