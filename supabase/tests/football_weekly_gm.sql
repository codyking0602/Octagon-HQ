begin;
select set_config('request.jwt.claim.role','service_role',true);
do $weekly_gm$
declare
  v_player uuid := extensions.gen_random_uuid();
  v_initial jsonb;
  v_started jsonb;
  v_next jsonb;
  v_state jsonb;
  v_bad boolean := false;
  v_count integer;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values (v_player,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
    'weekly-gm-test@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','GM WEEKLY TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_player,'GM WEEKLY TEST','GW');
  update private.football_weekly_gm_events
    set opens_at=now()-interval '1 day',closes_at=now()+interval '1 day'
    where week_start=date '2026-10-13';
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_player::text,true);
  v_started:=public.start_my_football_weekly_gm('elite');
  v_next:=public.start_my_football_weekly_gm('elite');
  if v_started->>'seed' is distinct from v_next->>'seed' or
    position('weekly-gm:2026-10-13:elite:' in v_started->>'seed')<>1 then
    raise exception 'Weekly attempt was rerolled on restart: %, %',v_started,v_next;
  end if;
  v_state:=jsonb_build_object(
    'version','football-gm-v11-seeded-development',
    'seed',v_started->>'seed','phase','draft','spinIndex',1,
    'roster',jsonb_build_array(jsonb_build_object('slot','QB','playerId','BUF|QB|joshallen','acquired','draft')),
    'finalRoster','[]'::jsonb,'resolvedSeasons','[]'::jsonb
  );
  perform public.save_my_football_weekly_gm('elite',v_started->>'seed',v_state,false,null);
  v_initial:=public.get_my_football_weekly_gm();
  if v_initial->'attempts'->'elite'->'state'->>'phase'<>'draft' then
    raise exception 'Official GM draft progress was not saved';
  end if;
  begin
    perform public.save_my_football_weekly_gm('elite','wrong-seed',v_state,false,null);
  exception when others then v_bad:=true; end;
  if not v_bad then raise exception 'Wrong seed was accepted'; end if;
  v_bad:=false;
  begin
    perform public.save_my_football_weekly_gm('elite',v_started->>'seed',v_state,true,99);
  exception when others then v_bad:=true; end;
  if not v_bad then raise exception 'Unfinished GM draft was accepted as complete'; end if;
  select count(*) into v_count from private.football_weekly_gm_attempts
    where week_start=date '2026-10-13' and profile_id=v_player;
  if v_count<>1 then raise exception 'More than one official attempt was created'; end if;
  if has_table_privilege('authenticated','private.football_weekly_gm_attempts','SELECT') or
    has_function_privilege('anon','public.start_my_football_weekly_gm(text)','EXECUTE') then
    raise exception 'Official weekly persistence is exposed to unauthorized API roles';
  end if;
end;
$weekly_gm$;
rollback;
\echo 'Official Weekly NFL GM persistence proof passed.'
