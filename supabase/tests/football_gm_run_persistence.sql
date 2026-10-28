begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner_id uuid := extensions.gen_random_uuid();
  v_member_id uuid := extensions.gen_random_uuid();
  v_run_id uuid;
  v_state_one jsonb := '{"version":"gm-test","seed":"run-seed","phase":"draft","run":{"roster":[]}}'::jsonb;
  v_state_two jsonb := '{"version":"gm-test","seed":"run-seed","phase":"year1","run":{"roster":[{"slot":"QB","playerId":"demo"}]}}'::jsonb;
  v_count integer;
  v_revision_count integer;
  v_restored jsonb;
  v_rejected boolean := false;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'gm-run-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CODY','historical_unclaimed',true)),
    (v_member_id,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'gm-run-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','GM MEMBER','historical_unclaimed',true));

  perform public.register_unclaimed_pin_profile(v_owner_id,'CODY','CK');
  perform public.register_unclaimed_pin_profile(v_member_id,'GM MEMBER','GM');
  insert into public.pick_control_owners(profile_id) values(v_owner_id);

  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner_id::text,true);

  v_run_id := public.save_my_football_gm_run('run-seed','gm-test',v_state_one,false);
  perform public.save_my_football_gm_run('run-seed','gm-test',v_state_one,false);

  v_restored := public.load_my_latest_football_gm_run();
  if v_restored is distinct from v_state_one then
    raise exception 'latest unfinished GM run was not restorable';
  end if;

  perform public.save_my_football_gm_run('run-seed','gm-test',v_state_two,true);

  if public.load_my_latest_football_gm_run() is not null then
    raise exception 'completed GM run should not remain the active resume target';
  end if;

  select count(*) into v_count
  from private.football_gm_runs
  where id = v_run_id
    and profile_id = v_owner_id
    and seed = 'run-seed'
    and completed_at is not null
    and state = v_state_two;

  if v_count <> 1 then
    raise exception 'GM run did not persist the latest completed state';
  end if;

  select count(*) into v_revision_count
  from private.football_gm_run_snapshots
  where run_id = v_run_id;

  if v_revision_count <> 2 then
    raise exception 'GM run snapshot history should dedupe identical states; got %', v_revision_count;
  end if;

  perform set_config('request.jwt.claim.sub',v_member_id::text,true);
  begin
    perform public.save_my_football_gm_run('blocked-seed','gm-test',v_state_one,false);
  exception when others then
    v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'non-playtest profile was allowed to persist a GM run';
  end if;

  if has_table_privilege('authenticated','private.football_gm_runs','SELECT')
    or has_table_privilege('authenticated','private.football_gm_run_snapshots','SELECT') then
    raise exception 'browser role can read private GM run telemetry tables';
  end if;

  if has_function_privilege('anon','public.save_my_football_gm_run(text,text,jsonb,boolean)','EXECUTE') then
    raise exception 'anonymous role can save GM playtest runs';
  end if;

  if not has_function_privilege('authenticated','public.save_my_football_gm_run(text,text,jsonb,boolean)','EXECUTE') then
    raise exception 'authenticated playtest browser cannot call GM run persistence RPC';
  end if;

  if has_function_privilege('anon','public.load_my_latest_football_gm_run()','EXECUTE') then
    raise exception 'anonymous role can restore private GM runs';
  end if;

  if not has_function_privilege('authenticated','public.load_my_latest_football_gm_run()','EXECUTE') then
    raise exception 'authenticated playtest browser cannot restore its unfinished GM run';
  end if;
end $$;

rollback;
