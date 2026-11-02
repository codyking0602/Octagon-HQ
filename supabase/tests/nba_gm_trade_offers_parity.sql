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
      (1,'PG','nba-gm-draft-shaigilgeousalexander'),
      (2,'SG','nba-gm-draft-ausarthompson'),
      (3,'SF','nba-gm-draft-cooperflagg'),
      (4,'PF','nba-gm-draft-isaiahstewart'),
      (5,'C','nba-gm-draft-joelembiid'),
      (6,'GUARD','nba-gm-draft-jrueholiday'),
      (7,'BIG','nba-gm-draft-kristapsporzingis')) slots(n,slot,id)
      join private.nba_gm_dev_players p on p.id=slots.id;
  if jsonb_array_length(v_picks)<>7 or private.nba_gm_v2_assign(v_picks) is null
    then raise exception 'Reference NBA roster is no longer legal';end if;
  v_anchor:=v_picks->0->>'playerId';
  select p.id,p.team_code into v_target,v_partner
    from private.nba_gm_dev_players p where p.team_code<>'OKC'
      and p.overall between 85 and 90 order by p.id limit 1;
  if v_target is null then raise exception 'No partner test candidate';end if;
  v_state:=jsonb_build_object('phase','offseason',
    'seed','nba-gm-test-offers','shopPlayerId',v_anchor,'tradeTeam',v_partner,
    'picks',v_picks,'releasedIds','[]'::jsonb,'displacedAssets','[]'::jsonb,
    'caps','[155000000,155000000,155000000]'::jsonb,
    'economyVersion',4,'developmentModelVersion',2);
  v_offers:=private.nba_gm_v8_trade_offers(v_state,v_target);
  if jsonb_typeof(v_offers)<>'array' or jsonb_array_length(v_offers)>5
    then raise exception 'Offers must be an array of at most 5';end if;
  for v_offer in select value from jsonb_array_elements(v_offers) loop
    if not v_offer->'outgoingPlayerIds' @> jsonb_build_array(v_anchor)
      or not v_offer->'incomingPlayerIds' @> jsonb_build_array(v_target)
      or (v_offer->>'acceptanceSlack')::numeric not between 0 and .05
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
      if v_spend>155000000 then raise exception 'Offer exceeds future cap';end if;
    end loop;
  end loop;
  -- Reproducible zero-offer outcome: nonexistent target cannot be shopped.
  if private.nba_gm_v8_trade_offers(v_state,'not-an-nba-player')<>'[]'::jsonb
    then raise exception 'Invalid target received offers';end if;
  raise notice 'NBA parity: % fair packages generated, all checked for two-year cap and legal positions',
    jsonb_array_length(v_offers);
end;
$nba_trade_offer_parity$;
rollback;
