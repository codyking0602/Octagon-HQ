-- NBA V11 historical replay / 175M legacy guard after V12 new-start promotion.
begin;
set local statement_timeout='180s';
do $nba_v11_test$
declare
  v_picks jsonb:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalensuggs'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-reedsheppard'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-kawhileonard'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-jabarismith'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jaylontyson'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-dayronsharpe'));
  v_state jsonb;v_v9 jsonb;v_v10 jsonb;v_v11 jsonb;
  v_results jsonb;v_score10 jsonb;v_score11 jsonb;
  v_team text;v_team_picks jsonb;v_case jsonb;
  v_year integer;
begin
  if (select count(*) from private.nba_gm_v5_historical_teams)<>150
    or (select count(*) from private.nba_gm_v5_historical_teams where wins>=60)<>8
    or (select count(*) from private.nba_gm_dev_players)<>330
    then raise exception 'Five-season reference / 330-player cohort drifted';end if;
  if private.nba_gm_v2_assign(v_picks) is null
    then raise exception 'Owner reference roster not position-legal';end if;
  v_state:=jsonb_build_object(
    'version','nba-gm-dev-v2','economyVersion',4,
    'simulationModelVersion',11,'developmentModelVersion',2,
    'repriceModelVersion',2,'lineupModelVersion',1,
    'seed','nba-gm-v11-owner-strength-regression',
    'phase','year1','picks',v_picks,'yearOnePicks',v_picks,
    'tradesUsed',0,'releasedIds','[]'::jsonb,
    'caps','[175000000,175000000,175000000]'::jsonb);
  v_v11:=private.nba_gm_v2_season(v_state,1);
  v_v10:=private.nba_gm_v2_season(jsonb_set(v_state,
    '{simulationModelVersion}','10'::jsonb),1);
  v_v9:=private.nba_gm_v2_season(jsonb_set(v_state,
    '{simulationModelVersion}','9'::jsonb),1);
  if v_v11 is distinct from private.nba_gm_v11_season(v_state,1)
    or v_v10 is distinct from private.nba_gm_v10_season(jsonb_set(
       v_state,'{simulationModelVersion}','10'::jsonb),1)
    or v_v9 is distinct from private.nba_gm_v9_season(jsonb_set(
       v_state,'{simulationModelVersion}','9'::jsonb),1)
    or (v_v11->>'teamOverall')::integer not between 90 and 94
    or (v_v11->>'titleOdds')::numeric not between 18 and 30
    or (v_v11->>'titleOdds')::numeric >= (v_v10->>'titleOdds')::numeric
    or (v_v11->>'offense')::integer >= (v_v10->>'offense')::integer
    or (v_v11->>'defense')::integer >= (v_v10->>'defense')::integer
    or (v_v11->>'wins')::integer >= (v_v10->>'wins')::integer
    then raise exception 'V11 owner team miscalibrated: V9 %, V10 %, V11 %',
      v_v9,v_v10,v_v11;end if;
  v_results:='[]'::jsonb;
  for v_year in 1..3 loop
    v_case:=private.nba_gm_v2_season(v_state,v_year);
    if (v_case->>'season')::integer<>v_year
      or (v_case->>'wins')::integer+(v_case->>'losses')::integer<>82
      or (v_case->>'teamOverall')::integer not between 70 and 99
      or (v_case->>'titleOdds')::numeric not between 0 and 49.6
      then raise exception 'V11 Year % malformed: %',v_year,v_case;end if;
    v_results:=v_results||jsonb_build_array(v_case);
  end loop;
  -- Check real-team anchors. No modifications to 150 historical team-seasons.
  foreach v_team in array array['HOU','GSW','SAS','DEN','CHI'] loop
    select jsonb_agg(jsonb_build_object('playerId',q.id)
      order by q.overall desc,q.id) into v_team_picks
      from (select id,overall from private.nba_gm_dev_players
        where team_code=v_team order by overall desc,id limit 7) q;
    v_team_picks:=private.nba_gm_v2_assign(v_team_picks);
    if v_team_picks is null
      then raise exception 'Reference team % not legal',v_team;end if;
    v_case:=private.nba_gm_v2_season(
      jsonb_set(v_state,'{picks}',v_team_picks),1);
    if (v_case->>'teamOverall')::integer not between 70 and 99
      or (v_case->>'titleOdds')::numeric not between 0 and 49.6
      then raise exception 'Reference team % invalid: %',v_team,v_case;end if;
  end loop;
  v_state:=jsonb_set(v_state,'{results}',v_results);
  v_score11:=private.nba_gm_v3_final_score(v_state);
  v_score10:=private.nba_gm_v10_final_score(jsonb_set(
    v_state,'{simulationModelVersion}','10'::jsonb));
  if v_score11 is distinct from private.nba_gm_v11_final_score(v_state)
    or v_score11 is distinct from v_score10
    or v_score11->'weights' is distinct from '[0.9,0.03,0.07]'::jsonb
    then raise exception 'V11 GM 90/3/7 changed: % versus %',
      v_score11,v_score10;end if;
  if position($needle
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    or position('jsonb_build_array(175000000,175000000,175000000)'
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    or position($needle$'repriceModelVersion',2$needle$
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    then raise exception 'V11 saved-run replay / V12 new-start cap-contract gate drifted';end if;
  raise notice 'V11 owner benchmark: V10 % OVR / %%% title, V11 % / %%%',
    v_v10->>'teamOverall',v_v10->>'titleOdds',
    v_v11->>'teamOverall',v_v11->>'titleOdds';
end;
$nba_v11_test$;
rollback;
simulationModelVersion',13,'lineupModelVersion',2$needle$
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    or position('jsonb_build_array(175000000,175000000,175000000)'
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    or position($needle$'repriceModelVersion',2$needle$
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    then raise exception 'V11 saved-run replay / V12 new-start cap-contract gate drifted';end if;
  raise notice 'V11 owner benchmark: V10 % OVR / %%% title, V11 % / %%%',
    v_v10->>'teamOverall',v_v10->>'titleOdds',
    v_v11->>'teamOverall',v_v11->>'titleOdds';
end;
$nba_v11_test$;
rollback;
