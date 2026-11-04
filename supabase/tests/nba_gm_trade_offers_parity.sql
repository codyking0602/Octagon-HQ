-- Transactional NBA GM accepted-trade-offer contract: no mutation of real saves.
begin;
do $nba_trade_offer_parity$
declare
  v_state jsonb;v_picks jsonb;v_anchor text;v_target text;v_partner text;
  v_offers jsonb;v_offer jsonb;v_year integer;v_spend bigint;v_count integer;
begin
  -- A saved NBA offseason can have any legal seven-player roster. Validate
  -- helper behavior with source-verified players, keeping existing grades.
  select jsonb_agg(jsonb_build_object('slot',slots.slot,'playerId',p.id) order by slots.n)
    into v_picks from (values
      (1,'PG','nba-gm-draft-lukadoncic'),
      (2,'SG','nba-gm-draft-konknueppel'),
      (3,'SF','nba-gm-draft-acebailey'),
      (4,'PF','nba-gm-draft-lebronjames'),
      (5,'C','nba-gm-draft-victorwembanyama'),
      (6,'GUARD','nba-gm-draft-jamalshead'),
      (7,'BIG','nba-gm-draft-deniavdija')) slots(n,slot,id)
      join private.nba_gm_dev_players p on p.id=slots.id;
  if jsonb_array_length(v_picks)<>7 or private.nba_gm_v2_assign(v_picks) is null
    then raise exception 'Reference NBA roster is no longer legal';end if;
  -- Legal $155M owner rotation. Ace Bailey (~81) for Derrick Jones Jr. (~80.6)
  -- is a source-backed, near-even exchange with cap room in Years 2 and 3.
  -- Unlike a $230M reference superteam, this fixture can produce actual offers.
  v_anchor:='nba-gm-draft-acebailey';
  v_target:='nba-gm-draft-derrickjones'; v_partner:='LAC';
  if not exists(select 1 from private.nba_gm_dev_players
    where id=v_target and team_code=v_partner) then
    raise exception 'Grounded target fixture missing';end if;
  v_state:=jsonb_build_object('phase','offseason',
    'seed','nba-gm-test-offers','shopPlayerId',v_anchor,'tradeTeam',v_partner,
    'picks',v_picks,'releasedIds','[]'::jsonb,'displacedAssets','[]'::jsonb,
    'caps','[155000000,155000000,155000000]'::jsonb,
    'economyVersion',4,'developmentModelVersion',2);
  v_offers:=private.nba_gm_v8_trade_offers(v_state,v_target);
  if jsonb_array_length(v_offers)=0 then raise exception 'Expected a legal same-grade NBA asking price';end if;
  if jsonb_typeof(v_offers)<>'array' or jsonb_array_length(v_offers)>5
    then raise exception 'Offers must be an array of at most 5';end if;
  for v_offer in select value from jsonb_array_elements(v_offers) loop
    if not v_offer->'outgoingPlayerIds' @> jsonb_build_array(v_anchor)
      or not v_offer->'incomingPlayerIds' @> jsonb_build_array(v_target)
      or (v_offer->>'acceptanceSlack')::numeric<0
      or jsonb_array_length(v_offer->'outgoingPlayerIds')>2
      or jsonb_array_length(v_offer->'incomingPlayerIds')>2
      then raise exception 'Trade package violates NFL parity';end if;
    if private.nba_gm_v2_assign(v_offer->'activePicks') is null
      then raise exception 'Offer has illegal active positions';end if;
    for v_year in 2..3 loop
      select coalesce(sum(private.nba_gm_v3_salary(v_state,x->>'playerId',v_year)),0)
        into v_spend from jsonb_array_elements(v_offer->'activePicks') x;
      select v_spend+coalesce(sum(private.nba_gm_v3_salary(v_state,x#>>'{}',v_year)),0)
        into v_spend from jsonb_array_elements(v_offer->'displacedAssets') x;
      if greatest(0,v_spend-155000000)<>
        (v_offer->>(case when v_year=2 then 'capOverYear2' else 'capOverYear3' end))::bigint
        then raise exception 'Trade cap forecast differs from obligated salary';end if;
    end loop;
  end loop;
  -- Reproducible zero-offer outcome: nonexistent target cannot be shopped.
  if private.nba_gm_v8_trade_offers(v_state,'not-an-nba-player')<>'[]'::jsonb
    then raise exception 'Invalid target received offers';end if;
  raise notice 'NBA parity: % accepted asking prices; cap overages disclosed, not rejected',
    jsonb_array_length(v_offers);
end;
$nba_trade_offer_parity$;

-- Exercise the *public server action*, not just the helper: accepted offers
-- must be atomic, owner-gated, persisted and cap-valid on an actual franchise.
select set_config('request.jwt.claim.role','service_role',true);
do $nba_trade_acceptance$
declare
  v_owner uuid:=extensions.gen_random_uuid();
  v_run_id uuid;v_state jsonb;v_roster jsonb;v_offers jsonb;
  v_target text:='nba-gm-draft-derrickjones';
  v_anchor text:='nba-gm-draft-acebailey';
  v_year integer;v_spend bigint;v_rejected boolean;
begin
  insert into auth.users(id,instance_id,aud,role,email,encrypted_password,
    email_confirmed_at,created_at,updated_at,raw_user_meta_data)
  values(v_owner,'00000000-0000-0000-0000-000000000000',
    'authenticated','authenticated','nba-gm-asking-price-'||v_owner::text||'@test.octagon.invalid',
    '',now(),now(),now(),jsonb_build_object('display_name','TEST','historical_unclaimed',true));
  perform public.register_unclaimed_pin_profile(v_owner,'TEST','NO');
  insert into public.pick_control_owners(profile_id) values(v_owner);
  perform set_config('request.jwt.claim.role','authenticated',true);
  perform set_config('request.jwt.claim.sub',v_owner::text,true);
  v_state:=public.nba_gm_dev_action('start');
  if v_state->>'economyVersion'<>'4' then raise exception 'NBA contract model unexpectedly changed';end if;
  select r.id into v_run_id from private.football_gm_runs r
    where r.profile_id=v_owner and r.game_version='nba-gm-dev-v2'
    order by r.updated_at desc limit 1;
  if v_run_id is null then raise exception 'Owner franchise not saved';end if;
  v_roster:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
    jsonb_build_object('slot','SF','playerId',v_anchor),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jamalshead'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija'));
  if private.nba_gm_v2_assign(v_roster) is null then
    raise exception 'Trade action fixture has invalid NBA positions';end if;
  v_state:=v_state||jsonb_build_object(
    'seed','nba-gm-test-offers',
    'phase','offseason','picks',v_roster,'yearOnePicks',v_roster,
    'shopPlayerId',v_anchor,'tradeTeam','LAC','tradeAttempts',0,
    'displacedAssets','[]'::jsonb,'displacedReleasedIds','[]'::jsonb);
  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs set state=v_state,updated_at=now() where id=v_run_id;
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);
  v_offers:=public.nba_gm_dev_trade_offers(v_target);
  if jsonb_array_length(v_offers)=0 or jsonb_array_length(v_offers)>5 then
    raise exception 'Owner RPC failed to return legal asking prices';end if;
  if exists(select 1 from jsonb_array_elements(v_offers) x
    where x ? 'activePicks' or x ? 'acceptanceSlack') then
    raise exception 'Owner RPC leaked internal offer state';end if;
  v_state:=public.nba_gm_dev_action('trade','offer:1',v_target);
  if v_state->>'shopPlayerId' is not null or v_state->>'tradeTeam' is not null
    or (v_state->>'tradesUsed')::integer<>1
    or jsonb_array_length(v_state->'picks')<>7
    or exists(select 1 from jsonb_array_elements(v_state->'picks') x where x->>'playerId'=v_anchor)
    or not exists(select 1 from jsonb_array_elements(v_state->'picks') x where x->>'playerId'=v_target)
    or private.nba_gm_v2_assign(v_state->'picks') is null then
    raise exception 'Accepted asking price failed to update active NBA rotation';end if;
  -- NFL parity permits a temporary cap crisis on an accepted trade.
  -- Verify the disclosed overages against the acquired roster AND holdings,
  -- rather than treating any over-cap offer as an invalid transaction.
  for v_year in 2..3 loop
    select coalesce(sum(private.nba_gm_v3_salary(v_state,x->>'playerId',v_year)),0)
      into v_spend from jsonb_array_elements(v_state->'picks') x;
    select v_spend+coalesce(sum(private.nba_gm_v3_salary(v_state,x#>>'{}',v_year)),0)
      into v_spend from jsonb_array_elements(
        coalesce(v_state->'displacedAssets','[]'::jsonb)) x;
    if greatest(0,v_spend-(v_state->'caps'->>(v_year-1))::bigint) <>
      coalesce((v_offers->0->>(
        case when v_year=2 then 'capOverYear2' else 'capOverYear3' end))::bigint,0)
      then raise exception 'Accepted trade cap forecast differs for Year %',v_year;
    end if;
  end loop;
  if public.nba_gm_dev_action('load')->'picks' is distinct from v_state->'picks' then
    raise exception 'Accepted trade was not saved';end if;
  -- A held trade asset is not an active roster player. The ordinary voluntary
  -- release must reject it; cleanup uses its separate action and does not use
  -- the player's one optional cut.
  v_state:=jsonb_set(v_state,'{displacedAssets}',jsonb_build_array(v_anchor));
  perform set_config('octagon.nba_gm_dev_authorized_write','yes',true);
  update private.football_gm_runs set state=v_state,updated_at=now() where id=v_run_id;
  perform set_config('octagon.nba_gm_dev_authorized_write','',true);
  v_rejected:=false;
  begin
    perform public.nba_gm_dev_action('release',null,v_anchor);
  exception when others then v_rejected:=true;end;
  if not v_rejected then raise exception 'Voluntary release accepted a held asset';end if;
  v_state:=public.nba_gm_dev_action('release-displaced',null,v_anchor);
  if jsonb_array_length(v_state->'displacedAssets')<>0 or
    jsonb_array_length(v_state->'displacedReleasedIds')<>1 or
    jsonb_array_length(v_state->'releasedIds')<>1
    then raise exception 'Held asset cleanup did not persist separately';end if;
  raise notice 'NBA accepted asking price and separate displaced cleanup persisted';
end;
$nba_trade_acceptance$;

rollback;
