begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_cody uuid := extensions.gen_random_uuid();
  v_shane uuid := extensions.gen_random_uuid();
  v_tony uuid := extensions.gen_random_uuid();
  v_day date := date '2199-07-29';
  v_locked jsonb;
  v_unlocked jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_cody,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'leaderboard-cody@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CODY BOARD','historical_unclaimed',true)),
    (v_shane,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'leaderboard-shane@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','SHANE BOARD','historical_unclaimed',true)),
    (v_tony,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'leaderboard-tony@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','TONY BOARD','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_cody,'Cody Board','CB');
  perform public.register_unclaimed_pin_profile(v_shane,'Shane Board','SB');
  perform public.register_unclaimed_pin_profile(v_tony,'Tony Board','TB');

  insert into public.find_leader_history(profile_id,day,official_score,best_score,attempts,completed_at,updated_at)
  values
    (v_shane,v_day,10,10,1,now(),now()),
    (v_tony,v_day,10,10,1,now(),now());

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  v_locked := public.get_find_leader_daily_leaderboard(v_day);

  if (v_locked->>'unlocked')::boolean
    or (v_locked->>'player_count')::integer <> 0
    or jsonb_array_length(v_locked->'entries') <> 0 then
    raise exception 'daily leaderboard revealed scores before the current profile completed: %', v_locked;
  end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  insert into public.find_leader_history(profile_id,day,official_score,best_score,attempts,completed_at,updated_at)
  values (v_cody,v_day,8,10,2,now(),now());

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_cody::text,true);
  v_unlocked := public.get_find_leader_daily_leaderboard(v_day);

  if not (v_unlocked->>'unlocked')::boolean
    or (v_unlocked->>'player_count')::integer <> 3
    or jsonb_array_length(v_unlocked->'entries') <> 3 then
    raise exception 'completed profile did not receive the full daily board: %', v_unlocked;
  end if;

  if not exists (
    select 1
    from jsonb_array_elements(v_unlocked->'entries') item
    where item->>'display_name' = 'CODY BOARD'
      and (item->>'official_score')::integer = 8
      and (item->>'rank')::integer = 3
      and (item->>'is_current_user')::boolean
  ) then
    raise exception 'current profile row or official first-attempt score is incorrect: %', v_unlocked;
  end if;

  if (
    select count(*)
    from jsonb_array_elements(v_unlocked->'entries') item
    where (item->>'official_score')::integer = 10
      and (item->>'rank')::integer = 1
  ) <> 2 then
    raise exception 'tied top scores did not share rank one: %', v_unlocked;
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_unlocked->'entries') item
    where item ? 'best_score'
       or item ? 'attempts'
       or item ? 'completed_at'
       or item ? 'profile_id'
  ) then
    raise exception 'leaderboard exposed private replay or identity fields: %', v_unlocked;
  end if;

  if has_function_privilege('anon','public.get_find_leader_daily_leaderboard(date)','EXECUTE') then
    raise exception 'anonymous role can execute the daily leaderboard RPC';
  end if;
end $$;

rollback;
