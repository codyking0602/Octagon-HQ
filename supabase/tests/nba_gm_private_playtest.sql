-- Owner-only NBA GM V2 lifecycle. Transactional fixture: no production changes.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_outsider uuid:=extensions.gen_random_uuid();
  v_state jsonb;v_player text;v_team text;v_index integer;v_year integer;
  v_spend bigint;v_old text;v_rejected boolean;v_before jsonb;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values
    (v_owner,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'nba-v2-owner@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','CODY','historical_unclaimed',true)),
    (v_outsider,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
      'nba-v2-outsider@login.octagon-hq.app','',now(),now(),now(),jsonb_build_object('display_name','NBA MEMBER','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'CODY','CG');
  perform public.register_unclaimed_pin_profile(v_outsider,'NBA MEMBER','NM');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  if jsonb_array_length(public.nba_gm_dev_catalog())<>330
     or exists(select 1 from jsonb_array_elements(public.nba_gm_dev_catalog()) p
       where p->>'gameContract' not in ('1YR','3YR')) then
    raise exception 'Private NBA contract/scouting fixtures incomplete';
  end if;
  if public.nba_gm_dev_action('load') is not null then raise exception 'Unexpected saved V2 franchise'; end if;
  v_state:=public.nba_gm_dev_action('start');
  if v_state->>'version'<>'nba-gm-dev-v2' or v_state->>'phase'<>'draft'
    or v_state->>'pendingSlot' is not null then raise exception 'V2 start invalid'; end if;
  if public.load_my_latest_football_gm_run() is not null then raise exception 'V2 displaced Football GM save'; end if;

  for v_index in 1..7 loop
    v_state:=public.nba_gm_dev_action('spin');
    v_team:=v_state->>'pendingTeam';
    if v_team is null or v_state->>'pendingSlot' is not null then
      raise exception 'NBA wheel must spin team without a preselected position';
    end if;
    select p.id into v_player from private.nba_gm_dev_players p
      where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)
      order by private.nba_gm_v2_salary(p.id,3),p.id limit 1;
    if v_player is null then raise exception 'Server spun a dead-end NBA team'; end if;
    v_state:=public.nba_gm_dev_action('pick',null,v_player);
    if jsonb_array_length(v_state->'picks')<>v_index then
      raise exception 'NBA pick did not persist'; end if;
    if private.nba_gm_v2_assign(v_state->'picks') is null then
      raise exception 'NBA slots cannot be reflowed'; end if;
  end loop;

  if v_state->>'phase'<>'year1' or jsonb_array_length(v_state->'results')<>1
    or jsonb_array_length(v_state->'yearOnePicks')<>7 then
    raise exception 'Season 1 did not lock after 7 picks'; end if;
  if (select count(distinct pick->>'slot') from jsonb_array_elements(v_state->'picks') pick)<>7 then
    raise exception 'Roster does not contain all seven legal NBA roles'; end if;
  if exists(select 1 from jsonb_array_elements(v_state->'results') s
    where (s->>'wins')::integer+(s->>'losses')::integer<>82) then
    raise exception 'Season 1 record does not total 82'; end if;
  v_before:=v_state->'results';
  v_state:=public.nba_gm_dev_action('offseason');
  if v_state->>'phase'<>'offseason' or v_state->'results' is distinct from v_before then
    raise exception 'Offseason changed a locked Year 1 result'; end if;

  -- Trade partner wheel may be explored and cancelled without changing the roster.
  v_old:=v_state->'picks'->0->>'playerId';
  v_state:=public.nba_gm_dev_action('shop',null,v_old);
  v_state:=public.nba_gm_dev_action('trade-spin');
  if v_state->>'tradeTeam' is null then raise exception 'No server-owned trade partner'; end if;
  v_state:=public.nba_gm_dev_action('cancel-trade');
  if v_state->>'tradeTeam' is not null or v_state->>'shopPlayerId' is not null then
    raise exception 'Failed to cancel trade without roster changes'; end if;

  -- Expiring/retained assets reprice as 1YR; guaranteed game-price fixtures lock for 3YR.
  for v_year in 2..3 loop
    select coalesce(sum(private.nba_gm_v2_salary(pick->>'playerId',v_year)),0) into v_spend
      from jsonb_array_elements(v_state->'picks') pick;
    if v_spend>192500000 then raise exception 'Future season cap exceeded'; end if;
  end loop;
  v_state:=public.nba_gm_dev_action('advance');
  if v_state->>'phase'<>'final' or jsonb_array_length(v_state->'results')<>3
    or (v_state->'results'->0) is distinct from (v_before->0)
    then raise exception 'Three-year locked season transition failed'; end if;
  if exists(select 1 from jsonb_array_elements(v_state->'results') s
    where (s->>'wins')::integer+(s->>'losses')::integer<>82) then
    raise exception 'NBA season did not play 82 games'; end if;
  if public.nba_gm_dev_action('load') is distinct from v_state then
    raise exception 'Completed V2 run not saved'; end if;

  v_rejected:=false;
  begin
    perform public.save_my_football_gm_run(v_state->>'seed','gm-test',
      '{"phase":"final","results":[{"wins":82}]}'::jsonb,true);
  exception when others then v_rejected:=true;
  end;
  if not v_rejected then raise exception 'Football save tampered with private NBA GM'; end if;
  v_rejected:=false;
  begin perform public.nba_gm_dev_action('spin'); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Completed V2 draft was mutable'; end if;

  perform set_config('request.jwt.claim.sub',v_outsider::text,true);
  v_rejected:=false;
  begin perform public.nba_gm_dev_catalog(); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Non-owner could see player board'; end if;
  v_rejected:=false;
  begin perform public.nba_gm_dev_action('start'); exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'Non-owner could start NBA GM'; end if;

  if has_table_privilege('authenticated','private.nba_gm_dev_players','SELECT')
    or has_function_privilege('anon','public.nba_gm_dev_catalog()','EXECUTE')
    or has_function_privilege('anon','public.nba_gm_dev_action(text,text,text)','EXECUTE')
    then raise exception 'Private catalog or action exposed publicly'; end if;
end $$;
rollback;
