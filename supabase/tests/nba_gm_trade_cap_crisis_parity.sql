-- NBA trade parity with NFL: a server-authored accepted asking price may
-- create a TEMPORARY salary-cap crisis. It cannot be simulated until cured.
-- Transactional authenticated exercise; leaves no member or saved run behind.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $nba_cap_parity$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_id uuid;v_state jsonb;v_roster jsonb;v_offers jsonb;v_offer jsonb;
  v_pick_index integer;v_year integer;v_over2 bigint;v_over3 bigint;v_spend bigint;
  v_rejected boolean:=false;v_player text;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_owner,'00000000-0000-0000-0000-000000000000',
    'authenticated','authenticated',
    'nba-cap-crisis-test-'||v_owner::text||'@test.octagon.invalid',
    '',now(),now(),now,jsonb_build_object('display_name','TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'TEST','NO');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);

  v_state:=public.nba_gm_dev_action('start');
  if v_state->>'simulationModelVersion'<>'9' then
    raise exception 'Expected current V9 simulation before trade parity test';end if;
  select id into v_id from private.football_gm_runs
    where profile_id=v_owner and game_version='nba-gm-dev-v2'
    order by updated_at desc limit 1;

  -- A genuine seven-player legal roster using certified 2026 salary windows.
  -- Replacing Tatum with Anthony Davis is a fair asset exchange by Year-2
  -- grade, but Davis's salary creates an actual two-year cap crisis.
  v_roster:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-shaigilgeousalexander'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-ayodosunmu'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-jaylenwells'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-jaysontatum'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-andredrummond'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-matissethybulle'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-tristandasilva'));
  if private.nba_gm_v2_assign(v_roster) is null then
    raise exception 'Trade cap fixture lost valid positions';end if;
  v_state:=v_state||jsonb_build_object(
    'seed','nba-gm-nfl-trade-cap-parity',
    'phase','offseason','picks',v_roster,'yearOnePicks',v_roster,
    'shopPlayerId','nba-gm-draft-jaysontatum','tradeTeam','WAS',
    'releasedIds','[]'::jsonb,'displacedAssets','[]'::jsonb,
    'displacedReleasedIds','[]'::jsonb,'tradeAttempts',0,'tradesUsed',0);
  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs set state=v_state,updated_at=now() where id=v_id;
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);

  v_offers:=public.nba_gm_dev_trade_offers('nba-gm-draft-anthonydavis');
  if jsonb_array_length(v_offers)=0 then
    raise exception 'NFL parity missing cap-busting NBA trade offers';end if;
  select x.ordinality,x.value into v_pick_index,v_offer
    from jsonb_array_elements(v_offers) with ordinality x(value,ordinality)
    where (x.value->>'capOverYear2')::bigint>0
      and (x.value->>'capOverYear3')::bigint>0
    order by x.ordinality limit 1;
  if v_pick_index is null then
    raise exception 'Expected a realistic over-cap asking price: %',v_offers;end if;
  if v_offer ? 'activePicks' or v_offer ? 'acceptanceSlack' then
    raise exception 'Private trade assets leaked through public RPC';end if;
  if not v_offer->'outgoingPlayerIds' @> '["nba-gm-draft-jaysontatum"]'::jsonb
    or not v_offer->'incomingPlayerIds' @> '["nba-gm-draft-anthonydavis"]'::jsonb
    then raise exception 'Asking price lost target or shopped player';end if;
  v_state:=public.nba_gm_dev_action('trade','offer:'||v_pick_index,
    'nba-gm-draft-anthonydavis');
  if (v_state->>'tradesUsed')::integer<>1
    or v_state->>'shopPlayerId' is not null
    or v_state->>'tradeTeam' is not null
    or not exists(select 1 from jsonb_array_elements(v_state->'picks') x
      where x->>'playerId'='nba-gm-draft-anthonydavis')
  then raise exception 'Accepted cap-busting trade was not persisted';end if;

  -- All active AND held salaries count; a cap crisis is real, not a
  -- waived-contract shortcut. Source of truth is server V4 salary.
  for v_year in 2..3 loop
    select coalesce(sum(private.nba_gm_v3_salary(v_state,x->>'playerId',v_year)),0)
      into v_spend from jsonb_array_elements(v_state->'picks') x;
    v_spend:=v_spend+(select coalesce(sum(private.nba_gm_v3_salary(v_state,
      x#>>'{}',v_year)),0) from
      jsonb_array_elements(coalesce(v_state->'displacedAssets','[]'::jsonb)) x);
    if v_year=2 then
      v_over2:=greatest(0,v_spend-155000000);
    else
      v_over3:=greatest(0,v_spend-155000000);
    end if;
  end loop;
  if v_over2<1 or v_over3<1
    or v_over2<>(v_offer->>'capOverYear2')::bigint
    or v_over3<>(v_offer->>'capOverYear3')::bigint
    then raise exception 'Cap crisis amount/contract accounting drifted';end if;
  if public.nba_gm_dev_action('load')->'picks' is distinct from
    v_state->'picks' then raise exception 'Trade acceptance not durable';end if;
  begin
    perform public.nba_gm_dev_action('advance');
  exception when others then v_rejected:=true;end;
  if not v_rejected then
    raise exception 'Over-cap NBA team advanced in spite of cap crisis';end if;

  -- A cap crisis never freezes the trading interface: held assets may
  -- be shopped first, otherwise a normal rostered player may be shopped.
  select x#>>'{}' into v_player
    from jsonb_array_elements(coalesce(v_state->'displacedAssets','[]'::jsonb)) x
    limit 1;
  if v_player is null then
    select x->>'playerId' into v_player
      from jsonb_array_elements(v_state->'picks') x limit 1;
  end if;
  v_state:=public.nba_gm_dev_action('shop',null,v_player);
  if v_state->>'shopPlayerId'<>v_player then
    raise exception 'Cap crisis blocked follow-up cap recovery trade';end if;
  v_state:=public.nba_gm_dev_action('cancel-trade');
  if v_state->>'shopPlayerId' is not null then
    raise exception 'Cancel did not exit follow-up cap recovery talks';end if;

  raise notice 'NFL-parity cap crisis: accepted price % causes Y2 over %, Y3 over %, simulation blocked and recovery trading possible',
    v_pick_index,v_over2,v_over3;
end;
$nba_cap_parity$;
rollback;
