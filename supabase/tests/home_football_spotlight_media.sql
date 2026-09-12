begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_media jsonb;
  v_member_blocked boolean := false;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'home-spotlight-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','HOME SPOTLIGHT OWNER','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'home-spotlight-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','HOME SPOTLIGHT MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'Home Spotlight Owner','HS');
  perform public.register_unclaimed_pin_profile(v_member_id,'Home Spotlight Member','HM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  perform set_config('request.jwt.claim.role','anon',true);
  perform set_config('request.jwt.claim.sub','',true);
  v_media := public.get_home_feature_media('football-player-spotlight');
  if coalesce(v_media->>'photo_source','') = '' then
    raise exception 'signed-out Home cannot read the seeded Football Spotlight photo';
  end if;

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.set_home_feature_media(
      'football-player-spotlight',
      'https://example.com/member-must-not-write.webp'
    );
  exception when others then
    v_member_blocked := true;
  end;
  if not v_member_blocked then
    raise exception 'non-owner profile changed Home feature media';
  end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_media := public.set_home_feature_media(
    'football-player-spotlight',
    'data:image/webp;base64,UklGRg=='
  );
  if v_media->>'photo_source' <> 'data:image/webp;base64,UklGRg==' then
    raise exception 'owner Home feature media write did not round-trip: %',v_media;
  end if;

  v_media := public.get_home_feature_media('football-player-spotlight');
  if v_media->>'photo_source' <> 'data:image/webp;base64,UklGRg==' then
    raise exception 'canonical Home media read did not return the owner update: %',v_media;
  end if;

  if has_table_privilege('anon','public.home_feature_media','SELECT')
    or has_table_privilege('authenticated','public.home_feature_media','SELECT') then
    raise exception 'browser roles can bypass the Home feature media RPC';
  end if;

  if has_function_privilege('anon','public.set_home_feature_media(text,text)','EXECUTE') then
    raise exception 'anonymous role can write Home feature media';
  end if;
end $$;

rollback;
