begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  owner_profile jsonb;
  member_profile jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'identity-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','IDENTITY OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'identity-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','IDENTITY MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Identity Owner','IO');
  perform public.register_unclaimed_pin_profile(v_member_id,'Identity Member','IM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  owner_profile := public.get_my_identity_profile();

  if owner_profile #>> '{id}' <> v_owner_id::text
    or owner_profile #>> '{display_name}' <> 'IDENTITY OWNER'
    or owner_profile #>> '{initials}' <> 'IO'
    or owner_profile #>> '{can_control_picks}' <> 'true' then
    raise exception 'owner identity projection is incorrect: %',owner_profile;
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  member_profile := public.get_my_identity_profile();

  if member_profile #>> '{id}' <> v_member_id::text
    or member_profile #>> '{display_name}' <> 'IDENTITY MEMBER'
    or member_profile #>> '{initials}' <> 'IM'
    or member_profile #>> '{can_control_picks}' <> 'false' then
    raise exception 'member identity projection is incorrect: %',member_profile;
  end if;

  if has_table_privilege('authenticated','public.pick_control_owners','SELECT') then
    raise exception 'browser role can read the private Picks owner table';
  end if;

  if has_function_privilege('anon','public.get_my_identity_profile()','EXECUTE') then
    raise exception 'anonymous role can execute the private identity projection';
  end if;
end $$;

rollback;
