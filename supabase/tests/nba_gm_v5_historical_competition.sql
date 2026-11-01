-- NBA GM V5: research-cohort, 7-man strength and series regression.
-- Read-only 150 historical records; all test-only states roll back.
begin;
set local statement_timeout='180s';
select set_config('request.jwt.claim.role','service_role',true);
do $nba_competition$
declare
 v_picks jsonb;v_state jsonb;v_saved_v4 jsonb;v_result jsonb;
 v_owner jsonb;v_post jsonb;v_star jsonb;v_weak jsonb;
 v_id integer;v_seed integer;v_year integer;
 v_wins numeric;v_total numeric[]:=array[0,0,0,0];
 v_count integer:=0;v_champ integer:=0;v_did_advance integer:=0;
 v_sample_old jsonb;v_error text;
begin
 if (select count(*) from private.nba_gm_v5_historical_teams)<>150
   or (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth=5)<>5
   or (select sum(wins) from private.nba_gm_v5_historical_teams)<>6150
   or (select sum(losses) from private.nba_gm_v5_historical_teams)<>6150
 then raise exception 'Incomplete 5-season, 150-team empirical foundation';end if;
 if (select count(*) from private.nba_gm_v5_historical_teams where wins between 40 and 44 and playoff_depth>=1)<>11
   or (select count(*) from private.nba_gm_v5_historical_teams where wins between 45 and 49 and playoff_depth>=1)<>28
   or (select count(*) from private.nba_gm_v5_historical_teams where wins<50 and playoff_depth=5)<>0
 then raise exception 'Historical NBA playoff bin counts drifted';end if;
 -- Exact owner opening and post-Barnes trade: never alter these rosters
 -- to make the calibration look better.
 v_owner:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jrueholiday'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-desmondbane'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-mikalbridges'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-scottiebarnes'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-normanpowell'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-cameronboozer'));
 v_post:=jsonb_set(v_owner,'{3,playerId}','"nba-gm-draft-jalensmith"'::jsonb);
 v_star:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-shaigilgeousalexander'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-ausarthompson'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-cooperflagg'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-isaiahstewart'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-joelembiid'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jrueholiday'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-kristapsporzingis'));
 v_weak:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-trejones'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-isaiahjoe'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-ggjackson'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-leonardmiller'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-adembona'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ryanrollins'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-jocklandale'));
 for v_id in 1..4 loop
  v_picks:=case v_id when 1 then v_owner when 2 then v_post when 3 then v_star else v_weak end;
  if private.nba_gm_v2_assign(v_picks) is null then raise exception 'Invalid test roster %',v_id;end if;
  for v_seed in 1..50 loop
   v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',5,
     'developmentModelVersion',2,'phase','offseason',
     'seed','nba-v5-comparative-'||v_id||'-'||v_seed,
     'picks',v_picks,'yearOnePicks',v_picks,'releasedIds','[]'::jsonb,
     'tradesUsed',0,'caps','[155000000,155000000,155000000]'::jsonb);
   for v_year in 1..3 loop
    v_result:=private.nba_gm_v2_season(v_state,v_year);
    v_wins:=(v_result->>'wins')::numeric;
    if v_wins<8 or v_wins>74 or v_wins+(v_result->>'losses')::numeric<>82
       or v_result->>'finish' not in ('Missed Playoffs','First Round',
         'Conference Semifinals','Conference Finals','Finals','Champion')
       then raise exception 'Invalid 82-game/series outcome %',v_result;end if;
    if v_id=1 and v_seed=1 and v_year=1 and
       (v_result->>'defense')::numeric<78 then
      raise exception 'V5 still underrates Barnes/Wembanyama defense: %',v_result;end if;
    if v_seed=50 and v_year=2 and private.nba_gm_v2_season(v_state,v_year) is distinct from v_result then
       raise exception 'NBA GM v5 season lost deterministic replay';end if;
    v_total[v_id]:=v_total[v_id]+v_wins;
    v_count:=v_count+1;
    if v_id=1 and v_result->>'finish'='Champion' then v_champ:=v_champ+1;end if;
    if v_id=1 and v_result->>'finish' in ('Finals','Champion') then v_did_advance:=v_did_advance+1;end if;
   end loop;
  end loop;
 end loop;
 if v_count<>600 then raise exception 'NBA V5 season sample coverage %',v_count;end if;
 -- Average 150 seasons per roster, rather than cherry-picking one lucky seed.
 if v_total[1]/150 < 54 or v_total[1]/150 > 66
   or v_total[2]/150 < 46 or v_total[2]/150 > 60
   or v_total[3]/150 < 54 or v_total[3]/150 > 67
   or v_total[4]/150 > 30
   or v_total[1] <= v_total[2]+450
   or v_total[1] <= v_total[4]+4500
 then raise exception 'NBA V5 strength ordering not basketball-plausible: %',v_total;end if;
 -- 43-win title is possible in principle, not commonplace; no title is
 -- automatically handed to 50+ wins. Series outcomes must vary by seed.
 if v_champ>=50 or v_did_advance>=100 then
   raise exception 'Playoffs are automatic, not best-of-seven: champion %, finals %',
     v_champ,v_did_advance;end if;

 -- Prior owner run snapshots don't have simulationModelVersion: model isolation.
 v_saved_v4:=v_state-'simulationModelVersion';
 v_sample_old:=private.nba_gm_v2_season(v_saved_v4,1);
 if v_sample_old is distinct from private.nba_gm_v2_season(v_saved_v4,1) then
   raise exception 'Existing V4 season branch became non-deterministic';end if;
 begin
  perform private.nba_gm_v5_season(v_saved_v4,1);
  raise exception 'NO_V5_VERSION_GUARD';
 exception when others then
  get stacked diagnostics v_error=message_text;
  if v_error='NO_V5_VERSION_GUARD' or v_error not like '%opted-in%' then
   raise exception 'V5 version gate failed: %',v_error;end if;
 end;
 raise notice 'NBA V5 600 seasons, mean owner %, posttrade %, contender %, weak %, owner champions % /150',
  round(v_total[1]/150,1),round(v_total[2]/150,1),
  round(v_total[3]/150,1),round(v_total[4]/150,1),v_champ;
end $nba_competition$;
rollback;
