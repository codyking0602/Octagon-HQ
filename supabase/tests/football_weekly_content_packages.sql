begin;
select set_config('request.jwt.claim.role','service_role',true);
do $proof$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_spotlight jsonb;
  v_game jsonb;
  v_result jsonb;
  v_blocked boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-editorial-owner@login.octagon-hq.app','',now(),now(),now,'{}'::jsonb),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'football-editorial-member@login.octagon-hq.app','',now(),now(),now,'{}'::jsonb);
  perform public.register_unclaimed_pin_profile(v_owner_id,'Football Editorial Owner','FE');
  perform public.register_unclaimed_pin_profile(v_member_id,'Football Editorial Member','FM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  if has_table_privilege('anon','public.football_weekly_content_packages','SELECT')
    or has_table_privilege('authenticated','public.football_weekly_content_packages','SELECT')
    or has_table_privilege('authenticated','public.football_weekly_content_packages','INSERT')
    or has_function_privilege('anon','public.save_football_weekly_content_draft(date,jsonb)','EXECUTE')
    or has_function_privilege('anon','public.get_football_weekly_content_package(date)','EXECUTE')
  then raise exception 'Unauthorized browser access to editorial storage'; end if;

  v_spotlight := jsonb_build_object(
    'name','Test QB','team','Test Team','position','QB',
    'stats',jsonb_build_array(
      jsonb_build_object('label','PYDS','value','300'),
      jsonb_build_object('label','PASS TD','value','3'),
      jsonb_build_object('label','RYDS','value','40'),
      jsonb_build_object('label','RUSH TD','value','1')),
    'result','W 35-17','measurements','6ft 2in','team_color','#0000FF',
    'highlight_url','https://youtu.be/test');
  v_game := jsonb_build_object(
    'home_team','Notre Dame','away_team','BYU','kickoff_at','2026-10-17T19:30:00Z');

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  v_blocked := false;
  begin
    perform public.save_football_weekly_content_draft(date '2026-10-13',
      jsonb_build_object('cfb_spotlight',v_spotlight));
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Non-owner edited a Football draft'; end if;
  v_blocked := false;
  begin
    perform public.get_football_weekly_content_package(date '2026-10-13');
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Non-owner read a Football draft'; end if;

  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_blocked := false;
  begin
    perform public.save_football_weekly_content_draft(date '2026-10-12',
      jsonb_build_object('cfb_spotlight',v_spotlight));
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Monday week key was accepted'; end if;

  v_result := public.save_football_weekly_content_draft(date '2026-10-13',
    jsonb_build_object('cfb_spotlight',v_spotlight));
  if v_result->>'status' <> 'draft'
    or (v_result->>'release_at')::timestamptz <> timestamptz '2026-10-13 00:00:00 America/Chicago'
    or v_result->'cfb_spotlight'->>'name' <> 'Test QB'
  then raise exception 'Wrong midnight Tuesday package: %',v_result; end if;

  v_result := public.save_football_weekly_content_draft(date '2026-10-13',
    jsonb_build_object('nfl_game_of_week',v_game));
  if v_result->'cfb_spotlight'->>'name' <> 'Test QB'
    or v_result->'nfl_game_of_week'->>'home_team' <> 'Notre Dame'
    or v_result->'nfl_spotlight' is distinct from 'null'::jsonb
  then raise exception 'Patching NFL cleared CFB or lost null slots: %',v_result; end if;

  v_blocked := false;
  begin
    perform public.save_football_weekly_content_draft(date '2026-10-13',
      '{"status":"published"}'::jsonb);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Draft endpoint can publish'; end if;

  v_blocked := false;
  begin
    perform public.save_football_weekly_content_draft(date '2026-10-13',
      '{"cfb_spotlight":{"name":"Incomplete"}}'::jsonb);
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Invalid Spotlight accepted'; end if;

  v_result := public.save_football_weekly_content_draft(date '2026-11-03',
    jsonb_build_object('cfb_game_of_week',v_game));
  if (v_result->>'release_at')::timestamptz <> timestamptz '2026-11-03 06:00:00+00'
  then raise exception 'Tuesday midnight failed after daylight saving time: %',v_result; end if;

  perform set_config('request.jwt.claim.role','service_role',true);
  perform set_config('request.jwt.claim.sub','',true);
  update public.football_weekly_content_packages set status='approved'
    where week_of=date '2026-10-13';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);
  v_blocked := false;
  begin
    perform public.save_football_weekly_content_draft(date '2026-10-13',
      jsonb_build_object('nfl_spotlight',v_spotlight));
  exception when others then v_blocked := true; end;
  if not v_blocked then raise exception 'Approved package was still editable'; end if;
end
$proof$;
rollback;
\echo 'Football weekly editorial Phase 1 SQL proof passed.'
