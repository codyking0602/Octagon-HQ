-- NBA GM V7 NFL odds parity: exact anchors, real game-series variance,
-- multiple roster strengths and immutable pre-V7 runs. Rollback all data.
begin;
set local statement_timeout='180s';
select set_config('request.jwt.claim.role','service_role',true);
do $nba_v7_proof$
declare
 v_owner jsonb;v_reference jsonb;v_post jsonb;v_star jsonb;v_weak jsonb;
 v_picks jsonb;v_state jsonb;v_result jsonb;v_old jsonb;v_direct jsonb;
 v_odds jsonb;v_count int:=0;v_seed int;v_year int;v_id int;
 v_chips integer[]:=array[0,0,0,0,0];
 v_win_sums numeric[]:=array[0,0,0,0,0];
 v_overall numeric[]:=array[0,0,0,0,0];
 v_title numeric[]:=array[0,0,0,0,0];
 v_sum numeric;v_bucket_count integer;v_error text;
begin
 if (private.nba_gm_v7_outcome_odds(92)->>'Champion')::numeric <> .434 then
   raise exception '92 raw grade no longer matches NFL 43.4 percent';
 end if;
 if (private.nba_gm_v7_outcome_odds(92.5)->>'Champion')::numeric <> .496 then
   raise exception 'NFL top-grade 49.6 percent cap drifted';
 end if;
 if private.nba_gm_v7_overall(92)<>98 or private.nba_gm_v7_overall(94)<>99
   or private.nba_gm_v7_overall(90)<>96 then
   raise exception 'NBA Team OVR no longer matches Football GM anchors';
 end if;
 for v_id in 78..98 loop
   v_odds:=private.nba_gm_v7_outcome_odds(v_id);
   select sum(value::numeric),count(*) into v_sum,v_bucket_count from jsonb_each_text(v_odds);
   if abs(v_sum-1)>.00001 or v_bucket_count<>6 then
     raise exception 'Six NFL parity outcomes not normalized: % %',v_id,v_odds;
   end if;
 end loop;
 v_owner:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-acebailey'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jamalshead'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija'));
 v_reference:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jrueholiday'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-desmondbane'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-mikalbridges'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-scottiebarnes'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-normanpowell'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-cameronboozer'));
 v_post:=jsonb_set(v_reference,'{3,playerId}','"nba-gm-draft-jalensmith"'::jsonb);
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
 for v_id in 1..5 loop
  v_picks:=case v_id when 1 then v_owner when 2 then v_reference
    when 3 then v_post when 4 then v_star else v_weak end;
  if private.nba_gm_v2_assign(v_picks) is null then
    raise exception 'NBA V7 benchmark % missing legal roster',v_id;end if;
  for v_seed in 1..60 loop
    v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',7,
      'developmentModelVersion',2,'seed','nba-v7-matchup-'||v_id||'-'||v_seed,
      'phase','offseason','picks',v_picks,'yearOnePicks',v_picks,
      'releasedIds','[]'::jsonb,'tradesUsed',0,
      'caps','[155000000,155000000,155000000]'::jsonb);
    for v_year in 1..3 loop
      v_result:=private.nba_gm_v2_season(v_state,v_year);
      if v_result->>'finish' not in ('Missed Playoffs','First Round',
        'Conference Semifinals','Conference Finals','Finals','Champion')
        or (v_result->>'wins')::integer+(v_result->>'losses')::integer<>82
        or (v_result->>'teamOverall')::integer not between 70 and 99
        or (v_result->>'titleOdds')::numeric not between 0 and 49.6
        or (v_result->>'offense')::integer not between 60 and 99
        or (v_result->>'defense')::integer not between 60 and 99 then
        raise exception 'NBA V7 invalid season result: %',v_result;end if;
      v_odds:=v_result->'outcomeOdds';
      select sum(value::numeric) into v_sum from jsonb_each_text(v_odds);
      if abs(v_sum-1)>.00001 or round((v_odds->>'Champion')::numeric*100,1)
         <>(v_result->>'titleOdds')::numeric then
        raise exception 'NBA V7 title odds do not reconcile: %',v_result;end if;
      if v_id=1 and v_year=1 and v_seed=1 then
        if (v_result->>'teamOverall')::integer<98
          or (v_result->>'offense')::integer<95
          or (v_result->>'titleOdds')::numeric<40 then
          raise exception 'Actual Luka-Wemby roster lost elite grade: %',v_result;end if;
        if v_result is distinct from private.nba_gm_v7_season(v_state,v_year) then
          raise exception 'V7 router and direct season diverge';end if;
      end if;
      v_count:=v_count+1;
      v_win_sums[v_id]:=v_win_sums[v_id]+(v_result->>'wins')::numeric;
      v_overall[v_id]:=v_overall[v_id]+(v_result->>'teamOverall')::numeric;
      v_title[v_id]:=v_title[v_id]+(v_result->>'titleOdds')::numeric;
      if v_result->>'finish'='Champion' then v_chips[v_id]:=v_chips[v_id]+1;end if;
    end loop;
  end loop;
 end loop;
 if v_count<>900 then raise exception 'Expected 900 V7 team-seasons';end if;
 -- We compare 180 simulations per roster: high enough for a sanity range,
 -- without equating Monte Carlo frequency to a guaranteed championship.
 if v_overall[1]/180<97 or v_title[1]/180<40
    or v_chips[1]<55 or v_chips[1]>105
    or v_chips[5]>5
    or v_win_sums[1]/180 not between 58 and 69
    or v_win_sums[2]/180<=v_win_sums[3]/180+5
    or v_win_sums[5]/180>=30 then
   raise exception 'V7 six-outcome balance broken: champs %, OVR %, title %, wins %',
     v_chips,v_overall,v_title,v_win_sums;end if;
 -- V6, V5 and unmarked older seasons MUST still resolve through old router.
 for v_id in 5..6 loop
   v_state:=jsonb_build_object('economyVersion',4,
      'simulationModelVersion',v_id,'phase','year1',
      'seed','nba-v7-legacy-unchanged','picks',v_owner,
      'releasedIds','[]'::jsonb,'tradesUsed',0);
   v_old:=case v_id when 5 then private.nba_gm_v5_season(v_state,1)
      else private.nba_gm_v6_season(v_state,1) end;
   if private.nba_gm_v2_season(v_state,1) is distinct from v_old then
     raise exception 'V7 changed saved V% engine',v_id;end if;
 end loop;
 v_state:=v_state-'simulationModelVersion';
 begin
   perform private.nba_gm_v7_season(v_state,1);
   raise exception 'NO_V7_GUARD';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_V7_GUARD' or v_error not like '%opted-in%' then
     raise exception 'NBA V7 missing version guard: %',v_error;end if;
 end;
 raise notice 'NBA V7 900-season test. Owner OVR %, title odds %, chips %/180. Other chips %',
  round(v_overall[1]/180,1),round(v_title[1]/180,1),v_chips[1],v_chips;
end;
$nba_v7_proof$;
rollback;
