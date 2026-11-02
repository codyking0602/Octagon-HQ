-- NBA GM V6: independently graded offense/defense and five-season peer grades.
-- Transactional tests; no user saves or historical teams are modified.
begin;
set local statement_timeout='180s';
select set_config('request.jwt.claim.role','service_role',true);
do $nba_v6_proof$
declare
  v_owner jsonb;v_reference jsonb;v_post jsonb;v_star jsonb;v_weak jsonb;
  v_state jsonb;v_result jsonb;v_orig jsonb;v_def_changed jsonb;
  v_before_v5 jsonb;v_id integer;v_seed integer;v_year integer;
  v_total numeric[]:=array[0,0,0,0,0];v_champ integer:=0;
  v_count integer:=0;v_old_overall integer;v_old_skills jsonb;
  v_grade_before numeric;v_error text;
begin
 if (select count(*) from private.nba_gm_v5_historical_teams)<>150 then
   raise exception 'V6 historical peers incomplete';end if;

 -- Owner's actual 66-16 saved seven: Luka + Wemby + LeBron, not a fictional substitute.
 v_owner:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-acebailey'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jamalshead'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija'));
 -- Prior owner calibration: strong opening rotation / meaningful downgrade.
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

 if private.nba_gm_v2_assign(v_owner) is null then raise exception 'Owner roster invalid';end if;

 for v_id in 1..5 loop
  for v_seed in 1..40 loop
   v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',6,
      'developmentModelVersion',2,'phase','offseason',
      'seed','nba-v6-independent-'||v_id||'-'||v_seed,
      'picks',case v_id when 1 then v_owner when 2 then v_reference
                        when 3 then v_post when 4 then v_star else v_weak end,
      'releasedIds','[]'::jsonb,'tradesUsed',0,
      'caps','[155000000,155000000,155000000]'::jsonb);
   for v_year in 1..3 loop
    v_result:=private.nba_gm_v2_season(v_state,v_year);
    if v_result->>'finish' not in ('Missed Playoffs','First Round',
       'Conference Semifinals','Conference Finals','Finals','Champion')
       or (v_result->>'wins')::int+(v_result->>'losses')::int<>82
       or (v_result->>'offense')::int not between 60 and 99
       or (v_result->>'defense')::int not between 60 and 99 then
       raise exception 'Invalid V6 season %',v_result;end if;
    if v_id=1 and v_seed=1 and v_year=1 then
       if (v_result->>'offense')::int<95 or (v_result->>'defense')::int<80 then
         raise exception 'Owner historical grades not properly independent: %',v_result;end if;
       if v_result is distinct from private.nba_gm_v6_season(v_state,v_year) then
         raise exception 'V6 router/direct mismatch';end if;
    end if;
    v_total[v_id]:=v_total[v_id]+(v_result->>'wins')::numeric;
    v_count:=v_count+1;
    if v_id=1 and v_result->>'finish'='Champion' then v_champ:=v_champ+1;end if;
   end loop;
  end loop;
 end loop;
 if v_count<>600 then raise exception 'Expected 600 V6 seasons, got %',v_count;end if;
 if v_total[1]/120 not between 58 and 68
    or v_total[2]/120 not between 57 and 68
    or v_total[3]/120 not between 46 and 60
    or v_total[4]/120 not between 57 and 70
    or v_total[5]/120 >=30
    or v_total[2]<=v_total[3]+450
    or v_total[1]<=v_total[5]+3000 then
   raise exception 'V6 historical ordering implausible: mean wins %, %, %, %, %',
      v_total[1]/120,v_total[2]/120,v_total[3]/120,v_total[4]/120,v_total[5]/120;
 end if;
 if v_champ=0 or v_champ>=120 then
    raise exception 'Owner championship deterministic or inaccessible (% of 120)',v_champ;
 end if;
 -- Strict V5 saved-state preservation: both exact router and original callable function.
 v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',5,
    'seed','nba-v5-saved-regression','phase','year1','picks',v_owner,
    'releasedIds','[]'::jsonb,'tradesUsed',0);
 v_before_v5:=private.nba_gm_v5_season(v_state,1);
 if private.nba_gm_v2_season(v_state,1) is distinct from v_before_v5 then
    raise exception 'V5 saved run changed under V6 router';end if;

 -- Trait isolation: changing Luka's OVERALL at fixed SKILLS must not grant
 -- or withdraw defensive/offensive points in Year 1 (no overall baseline).
 v_state:=jsonb_set(v_state,'{simulationModelVersion}','6'::jsonb);
 v_orig:=private.nba_gm_v6_season(v_state,1);
 select overall,skills into v_old_overall,v_old_skills from private.nba_gm_dev_players
   where id='nba-gm-draft-lukadoncic';
 update private.nba_gm_dev_players set overall=overall-15
   where id='nba-gm-draft-lukadoncic';
 v_result:=private.nba_gm_v6_season(v_state,1);
 if v_orig is distinct from v_result then
   raise exception 'Overall grade still boosts simulated side impact: %, %',v_orig,v_result;end if;
 update private.nba_gm_dev_players set overall=v_old_overall,
   skills=jsonb_set(skills,'{perimeterDefense}','35'::jsonb)
   where id='nba-gm-draft-lukadoncic';
 v_def_changed:=private.nba_gm_v6_season(v_state,1);
 if v_def_changed->>'offense' is distinct from v_orig->>'offense'
    or (v_def_changed->>'defense')::numeric >= (v_orig->>'defense')::numeric then
   raise exception 'Luka perimeter defense change did not independently affect defense';
 end if;
 update private.nba_gm_dev_players set skills=v_old_skills
   where id='nba-gm-draft-lukadoncic';

 -- Never route a legacy or unmarked state through the new model.
 v_state:=v_state-'simulationModelVersion';
 begin
   perform private.nba_gm_v6_season(v_state,1);
   raise exception 'NO_VERSION_GUARD';
 exception when others then
   get stacked diagnostics v_error=message_text;
   if v_error='NO_VERSION_GUARD' or v_error not like '%opted-in%' then
     raise exception 'V6 guard broken: %',v_error;end if;
 end;
 raise notice 'V6 600 seasons. Luka mean %, previous owner %, after trade %, star %, weak %. Championships % of 120',
  round(v_total[1]/120,1),round(v_total[2]/120,1),round(v_total[3]/120,1),round(v_total[4]/120,1),round(v_total[5]/120,1),v_champ;
end;
$nba_v6_proof$;
rollback;
