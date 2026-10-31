-- Owner-only NBA GM V3 Football parity lifecycle. Transactional fixture; no production changes.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_outsider uuid:=extensions.gen_random_uuid();
  v_state jsonb;v_player text;v_team text;v_index integer;v_year integer;
  v_spend bigint;v_old text;v_rejected boolean;v_before jsonb;v_year_one jsonb;
  v_legacy jsonb;v_trade_accepted boolean;
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
  if v_state->>'version'<>'nba-gm-dev-v2' or v_state->>'economyVersion'<>'3'
    or v_state->>'phase'<>'draft'
    or v_state->'caps' is distinct from '[155000000,155000000,155000000]'::jsonb
    or v_state->>'pendingSlot' is not null then raise exception 'V3 parity start invalid'; end if;
  if (select count(*) from private.nba_gm_dev_players where verified_birth_date is not null)<>301
    then raise exception 'Age provenance must be exactly 301 verified birthdates'; end if;
  -- Old V2 saves keep the historical agreement and do not gain V3 development.
  v_legacy:=v_state-'economyVersion';
  select p.id into v_player from private.nba_gm_dev_players p
    where private.nba_gm_v2_contract(p.id)='1YR' order by p.overall desc limit 1;
  if private.nba_gm_v3_contract_for_state(v_legacy,v_player)
       is distinct from private.nba_gm_v2_contract(v_player)
    or private.nba_gm_v3_salary(v_legacy,v_player,2)
       is distinct from private.nba_gm_v2_salary(v_player,2)
    or private.nba_gm_v3_grade(v_legacy,v_player,2)
       is distinct from (select overall from private.nba_gm_dev_players where id=v_player)
     then raise exception 'Legacy V2 player contracts or grade were retroactively changed'; end if;
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
  if (select count(*) from jsonb_object_keys(coalesce(v_state->'development','{}'::jsonb)))<>7
     then raise exception 'Expected seven actual individual progression reports'; end if;
  if not exists(select 1 from jsonb_each(v_state->'development') entry
    where (entry.value->>'year2Grade')::numeric <>
          (entry.value->>'startingGrade')::numeric)
     then raise exception 'Development did not change any player abilities'; end if;

  -- Trade partner wheel may be explored and cancelled without changing the roster.
  v_old:=v_state->'picks'->0->>'playerId';
  v_state:=public.nba_gm_dev_action('shop',null,v_old);
  v_state:=public.nba_gm_dev_action('trade-spin');
  if v_state->>'tradeTeam' is null then raise exception 'No server-owned trade partner'; end if;
  v_state:=public.nba_gm_dev_action('cancel-trade');
  if v_state->>'tradeTeam' is not null or v_state->>'shopPlayerId' is not null then
    raise exception 'Failed to cancel trade without roster changes'; end if;

  -- Negotiation is evaluated server-side. Not every partner must offer a legal
  -- one-for-one deal: displaying a player never implies auto-acceptance.
  v_year_one:=v_state->'yearOnePicks';
  v_state:=public.nba_gm_dev_action('shop',null,v_old);
  v_state:=public.nba_gm_dev_action('trade-spin');
  select p.id into v_player from private.nba_gm_dev_players p
    where p.team_code=v_state->>'tradeTeam'
      and private.nba_gm_v2_can_add(jsonb_set(v_state,'{picks}',
        (select coalesce(jsonb_agg(x),'[]'::jsonb) from jsonb_array_elements(v_state->'picks') x
          where x->>'playerId'<>v_old)),p.id)
    order by p.overall,p.id limit 1;
  if v_player is not null then
    v_state:=public.nba_gm_dev_action('trade',null,v_player);
  end if;
  v_trade_accepted:=(v_state->>'tradesUsed')::integer=1;
  if v_state->>'shopPlayerId' is not null then
    v_state:=public.nba_gm_dev_action('cancel-trade'); end if;
  if v_state->'yearOnePicks' is distinct from v_year_one
    or jsonb_array_length(v_state->'picks')<>7
    or (v_trade_accepted and not exists(select 1 from jsonb_array_elements(v_state->'picks') x
       where x->>'playerId'=v_player)) then
      raise exception 'Trade changed Season 1 history or broke the seven-player rotation'; end if;

  -- Expiring/retained assets reprice as 1YR; guaranteed game-price fixtures lock for 3YR.
  for v_year in 2..3 loop
    select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',v_year)),0) into v_spend
      from jsonb_array_elements(v_state->'picks') pick;
    if v_spend>(v_state->'caps'->>(v_year-1))::bigint then
      raise exception 'Future season cap exceeded'; end if;
  end loop;
  v_state:=public.nba_gm_dev_action('advance');
  if v_state->>'phase'<>'final' or jsonb_array_length(v_state->'results')<>3
    or (v_state->'results'->0) is distinct from (v_before->0)
    or (v_state->'scoreBreakdown'->>'score')::numeric not between 0 and 100
    then raise exception 'Three-year locked season or server 90/3/7 score failed'; end if;
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

  -- Start a second private franchise to exercise the formerly terminal
  -- three-visit offseason bug. The owner must always be able to refill a cut.
  v_state:=public.nba_gm_dev_action('start');
  for v_index in 1..7 loop
    v_state:=public.nba_gm_dev_action('spin');
    v_team:=v_state->>'pendingTeam';
    select p.id into v_player from private.nba_gm_dev_players p
      where p.team_code=v_team and private.nba_gm_v2_can_add(v_state,p.id)
      order by private.nba_gm_v2_salary(p.id,3),p.id limit 1;
    if v_player is null then raise exception 'Recovery test draft hit dead-end'; end if;
    v_state:=public.nba_gm_dev_action('pick',null,v_player);
  end loop;
  v_before:=v_state->'yearOnePicks';
  v_state:=public.nba_gm_dev_action('offseason');
  v_old:=v_state->'picks'->0->>'playerId';
  v_state:=public.nba_gm_dev_action('release',null,v_old);
  if jsonb_array_length(v_state->'picks')<>6 then raise exception 'Offseason cut did not create vacancy'; end if;
  for v_index in 1..3 loop
    v_state:=public.nba_gm_dev_action('fa-spin');
    if v_state->>'freeAgencyTeam' is null then raise exception 'No free-agent team'; end if;
    v_state:=public.nba_gm_dev_action('pass-fa');
  end loop;
  if (v_state->>'freeAgencyVisits')::integer<>3 then
    raise exception 'NBA free agency did not enforce exactly three market visits'; end if;
  v_rejected:=false;
  begin perform public.nba_gm_dev_action('fa-spin');
  exception when others then v_rejected:=true; end;
  if not v_rejected then raise exception 'A fourth free-agency reroll was wrongly allowed'; end if;
  select p.id into v_player from private.nba_gm_dev_players p
    where p.overall<=78 and private.nba_gm_v3_contract_for_state(v_state,p.id)='1YR'
      and p.id<>v_old and private.nba_gm_v2_can_add(v_state,p.id)
    order by p.salaries[1],p.id limit 1;
  if v_player is null then raise exception 'No affordable emergency replacement after visits'; end if;
  v_state:=public.nba_gm_dev_action('emergency-sign',null,v_player);
  if jsonb_array_length(v_state->'picks')<>7 or v_state->'yearOnePicks' is distinct from v_before
    then raise exception 'Emergency signing or original Year 1 roster corrupted'; end if;
  v_state:=public.nba_gm_dev_action('advance');
  if v_state->>'phase'<>'final' or jsonb_array_length(v_state->'results')<>3
    then raise exception 'Replacement did not permit full franchise completion'; end if;

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
