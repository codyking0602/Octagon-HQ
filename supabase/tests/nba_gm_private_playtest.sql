-- End-to-end owner-only NBA GM seven-slot server draft, using the existing
-- private Football GM persistence tables. All changes roll back.
begin;
select set_config('request.jwt.claim.role','service_role',true);

do $$
declare
  v_owner uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_state jsonb;
  v_player text;
  v_team text;
  v_slot text;
  v_year integer;
  v_spend bigint;
  v_results jsonb;
  v_rejected boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
     'nba-gm-dev-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CODY','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
     'nba-gm-dev-member@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','NBA MEMBER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'CODY','CG');
  perform public.register_unclaimed_pin_profile(v_outsider,'NBA MEMBER','NM');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  if jsonb_array_length(public.nba_gm_dev_catalog())<>330 then
    raise exception 'Private NBA GM board is not complete';
  end if;
  if public.nba_gm_dev_action('load') is not null then
    raise exception 'New owner unexpectedly has an old NBA GM run';
  end if;
  v_state := public.nba_gm_dev_action('start');
  if v_state->>'phase'<>'draft' then raise exception 'NBA GM start failed'; end if;
  if public.load_my_latest_football_gm_run() is not null then
    raise exception 'NBA GM dev run displaced Football GM solo resume';
  end if;

  foreach v_slot in array array['PG','SG','SF','PF','C','SIXTH','FLEX'] loop
    v_state:=public.nba_gm_dev_action('spin',v_slot);
    v_team:=v_state->>'pendingTeam';
    if v_team is null or v_state->>'pendingSlot'<>v_slot then
      raise exception 'Server did not own the NBA team spin';
    end if;
    select p.id into v_player from private.nba_gm_dev_players p
    where p.team_code=v_team and private.nba_gm_dev_can_pick(v_state,v_slot,p.id)
    order by p.salaries[3] asc limit 1;
    if v_player is null then raise exception 'Server offered an unpickable NBA team'; end if;
    v_state:=public.nba_gm_dev_action('pick',v_slot,v_player);
    if jsonb_array_length(v_state->'picks') <>
      array_position(array['PG','SG','SF','PF','C','SIXTH','FLEX'],v_slot)
      then raise exception 'NBA GM draft pick did not persist'; end if;
  end loop;
  if v_state->>'phase'<>'review' then raise exception 'seven picks not ready for review'; end if;

  for v_year in 1..3 loop
    select sum(p.salaries[v_year]) into v_spend
    from jsonb_array_elements(v_state->'picks') pick
    join private.nba_gm_dev_players p on p.id=pick->>'playerId';
    if v_spend>192500000 then raise exception 'NBA GM season % cap exceeded',v_year; end if;
  end loop;
  v_results:=private.nba_gm_dev_simulate(v_state);
  if v_results is distinct from private.nba_gm_dev_simulate(v_state)
    then raise exception 'Identical NBA GM seed must repeat deterministically'; end if;
  v_state:=public.nba_gm_dev_action('confirm');
  if v_state->>'phase'<>'final' or jsonb_array_length(v_state->'results')<>3
    or v_state->'results' is distinct from v_results
    then raise exception 'Three NBA seasons not locked by the server'; end if;
  if exists(select 1 from jsonb_array_elements(v_state->'results') r
    where (r->>'wins')::integer+(r->>'losses')::integer<>82) then
    raise exception 'NBA season record must total 82 games';
  end if;
  if public.nba_gm_dev_action('load') is distinct from v_state then
    raise exception 'NBA GM completed game failed resume';
  end if;

  v_rejected:=false;
  begin
    perform public.save_my_football_gm_run(v_state->>'seed','gm-test',
      '{"phase":"final","results":[{"wins":82}]}'::jsonb,true);
  exception when others then v_rejected:=true;
  end;
  if not v_rejected then raise exception 'Football GM save RPC tampered with NBA GM results'; end if;

  v_rejected:=false;
  begin perform public.nba_gm_dev_action('spin','PG'); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Completed NBA GM allowed draft mutation'; end if;

  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  v_rejected:=false;
  begin perform public.nba_gm_dev_catalog(); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Nonowner could view provisional NBA ratings'; end if;
  v_rejected:=false;
  begin perform public.nba_gm_dev_action('start'); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Nonowner could start NBA GM'; end if;

  if has_table_privilege('authenticated','private.nba_gm_dev_players','SELECT')
    or has_function_privilege('anon','public.nba_gm_dev_catalog()','EXECUTE')
    or has_function_privilege('anon','public.nba_gm_dev_action(text,text,text)','EXECUTE')
    then raise exception 'NBA GM playtest surface is publicly readable'; end if;
end $$;
rollback;
