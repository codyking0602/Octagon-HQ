begin;
select set_config('request.jwt.claim.role','service_role',true);
do $weekly_gm_privacy$
declare
  v_viewer uuid := extensions.gen_random_uuid();
  v_opponent uuid := extensions.gen_random_uuid();
  v_standing jsonb;
  v_state jsonb;
  v_blocked boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
  (v_viewer,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'gm-privacy-viewer-'||v_viewer::text||'@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','GM PRIVACY VIEWER','historical_unclaimed',true)),
  (v_opponent,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'gm-privacy-opponent-'||v_opponent::text||'@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','GM PRIVACY OPPONENT','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_viewer,'GM PRIVACY VIEWER','GV');
  perform public.register_unclaimed_pin_profile(v_opponent,'GM PRIVACY OPPONENT','GO');
  v_state := jsonb_build_object('version','test-state','phase','final');
  insert into private.football_weekly_gm_attempts(week_start,profile_id,scenario,seed,state,score,completed_at)
  values
  (date '2026-10-13',v_opponent,'elite','gm-privacy-elite-'||v_opponent::text,v_state,95.6,now()),
  (date '2026-10-13',v_opponent,'young','gm-privacy-young-'||v_opponent::text,v_state,92.9,now());

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_viewer::text,true);
  select item into v_standing
  from jsonb_array_elements(public.get_my_football_weekly_gm()->'leaderboard') item
  where item->>'profile_id'=v_opponent::text;
  if v_standing is null then raise exception 'Opponent rank disappeared when scores hidden'; end if;
  if (v_standing->>'completed_runs')::integer<>2
    or v_standing->'elite_score'<>'null'::jsonb
    or v_standing->'young_score'<>'null'::jsonb
    or v_standing->'total_score'<>'null'::jsonb then
    raise exception 'Opponent scores leaked before starting: %',v_standing;
  end if;
  v_blocked:=false;
  begin perform public.get_football_weekly_gm_result('elite',v_opponent);
  exception when others then v_blocked:=true; end;
  if not v_blocked then raise exception 'Opponent elite report leaked before viewer run'; end if;

  insert into private.football_weekly_gm_attempts(week_start,profile_id,scenario,seed,state,score,completed_at)
  values(date '2026-10-13',v_viewer,'elite','gm-privacy-elite-'||v_viewer::text,v_state,88.2,now());
  select item into v_standing
  from jsonb_array_elements(public.get_my_football_weekly_gm()->'leaderboard') item
  where item->>'profile_id'=v_opponent::text;
  if (v_standing->>'elite_score')::numeric<>95.6
    or v_standing->'young_score'<>'null'::jsonb
    or v_standing->'total_score'<>'null'::jsonb then
    raise exception 'One completion must unlock only matching elite score: %',v_standing;
  end if;
  if public.get_football_weekly_gm_result('elite',v_opponent)->>'score'<>'95.6' then
    raise exception 'Matching elite detail failed to unlock'; end if;
  v_blocked:=false;
  begin perform public.get_football_weekly_gm_result('young',v_opponent);
  exception when others then v_blocked:=true; end;
  if not v_blocked then raise exception 'Opponent young report leaked before viewer young run'; end if;

  insert into private.football_weekly_gm_attempts(week_start,profile_id,scenario,seed,state,score,completed_at)
  values(date '2026-10-13',v_viewer,'young','gm-privacy-young-'||v_viewer::text,v_state,82.1,now());
  select item into v_standing
  from jsonb_array_elements(public.get_my_football_weekly_gm()->'leaderboard') item
  where item->>'profile_id'=v_opponent::text;
  if (v_standing->>'total_score')::numeric<>188.5
    or (v_standing->>'young_score')::numeric<>92.9 then
    raise exception 'Both completed franchises must unlock total and young score: %',v_standing;
  end if;
  if public.get_football_weekly_gm_result('young',v_opponent)->>'score'<>'92.9' then
    raise exception 'Matching young report did not unlock'; end if;
end;
$weekly_gm_privacy$;
rollback;
\echo 'Weekly GM per-scenario score/result visibility proof passed.'
