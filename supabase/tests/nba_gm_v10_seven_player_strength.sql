-- NBA GM V10 seven-player strength calibration. Read-only transaction.
-- No score/salary/contract history edits; V9 saved runs must replay identically.
begin;
set local statement_timeout='180s';

do $nba_v10_strength_test$
declare
  v_picks jsonb:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-krisdunn'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-jalenbrunson'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-deniavdija'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-rudygobert'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-camspencer'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-leonardmiller'));
  v_state jsonb;v_v9 jsonb;v_v10 jsonb;v_final jsonb;
  v_r9 jsonb;v_r10 jsonb;v_score9 jsonb;v_score10 jsonb;
  v_team text;v_team_picks jsonb;v_old jsonb;v_new jsonb;
  v_current_players integer;v_count integer:=0;
  v_before jsonb;v_after jsonb;
begin
  if (select count(*) from private.nba_gm_v5_historical_teams)<>150
    or (select count(*) from private.nba_gm_dev_players)<>330 then
    raise exception 'V10 historic 150-team cohort or 330 players changed';
  end if;
  if private.nba_gm_v2_assign(v_picks) is null then
    raise exception 'Owner original seven no longer position legal';
  end if;
  v_state:=jsonb_build_object(
    'version','nba-gm-dev-v2','economyVersion',4,
    'simulationModelVersion',9,'developmentModelVersion',2,
    'lineupModelVersion',1,'repriceModelVersion',2,
    'seed','nba-gm-v10-seven-player-regression',
    'phase','year1','picks',v_picks,'yearOnePicks',v_picks,
    'releasedIds','[]'::jsonb,'tradesUsed',0,
    'caps','[155000000,155000000,155000000]'::jsonb);

  v_v9:=private.nba_gm_v2_season(v_state,1);
  if v_v9 is distinct from private.nba_gm_v9_season(v_state,1)
    or (v_v9->>'teamOverall')::integer<>84
    or (v_v9->>'titleOdds')::numeric<>5.2 then
    raise exception 'Original owner V9 benchmark drifted: %',v_v9;
  end if;
  v_state:=jsonb_set(v_state,'{simulationModelVersion}','10'::jsonb);
  v_v10:=private.nba_gm_v2_season(v_state,1);
  if v_v10 is distinct from private.nba_gm_v10_season(v_state,1)
    or (v_v10->>'teamOverall')::integer not between 90 and 93
    or (v_v10->>'titleOdds')::numeric not between 19 and 25
    or (v_v10->>'wins')::integer<=(v_v9->>'wins')::integer
    or (v_v10->>'defense')::numeric<=(v_v9->>'defense')::numeric then
    raise exception 'V10 owner original team strength not corrected: V9 %, V10 %',
      v_v9,v_v10;
  end if;

  -- Verify only the two extra deductions change, never the historic mappings.
  if position('v_off+v_def-1.70+v_fit' in pg_get_functiondef(
       'private.nba_gm_v10_season(jsonb,integer)'::regprocedure))>0
    or position('-least(2.2,greatest(0,80-v_def_weakest)' in pg_get_functiondef(
       'private.nba_gm_v10_season(jsonb,integer)'::regprocedure))>0
    or position('private.nba_gm_v9_overall(v_net)' in pg_get_functiondef(
       'private.nba_gm_v10_season(jsonb,integer)'::regprocedure))=0
    or position('private.nba_gm_v7_outcome_odds(v_strength)' in pg_get_functiondef(
       'private.nba_gm_v10_season(jsonb,integer)'::regprocedure))=0 then
    raise exception 'V10 has duplicate penalty or lost 150-season reference';
  end if;

  -- Year 2/3 developed position selection from V10 source remains active.
  if position('private.nba_gm_v10_season_lineup(p_state,p_year)' in pg_get_functiondef(
       'private.nba_gm_v10_season(jsonb,integer)'::regprocedure))=0 then
    raise exception 'V10 lost seasonal best-five promotion';
  end if;

  -- 5/5 independent real-roster examples, including strong and weak cores.
  foreach v_team in array array['HOU','GSW','SAS','DEN','CHI']
  loop
    select jsonb_agg(jsonb_build_object('playerId',ranked.id) order by ranked.overall desc,ranked.id)
      into v_team_picks
    from (select p.id,p.overall from private.nba_gm_dev_players p
       where p.team_code=v_team order by p.overall desc,p.id limit 7) ranked;
    v_team_picks:=private.nba_gm_v2_assign(v_team_picks);
    if v_team_picks is null then raise exception 'NBA roster % not legal',v_team; end if;
    v_before:=jsonb_set(jsonb_set(v_state,'{picks}',v_team_picks),
      '{simulationModelVersion}','9'::jsonb);
    v_after:=jsonb_set(v_before,'{simulationModelVersion}','10'::jsonb);
    v_old:=private.nba_gm_v2_season(v_before,1);
    v_new:=private.nba_gm_v2_season(v_after,1);
    if (v_new->>'teamOverall')::integer<(v_old->>'teamOverall')::integer
      or (v_new->>'wins')::integer<(v_old->>'wins')::integer
      or (v_new->>'titleOdds')::numeric<(v_old->>'titleOdds')::numeric
      or (v_new->>'teamOverall')::integer not between 70 and 99
      or (v_new->>'titleOdds')::numeric not between 0 and 49.6 then
      raise exception 'V10 % team calibration invalid: V9 % V10 %',
        v_team,v_old,v_new;
    end if;
    if v_team='HOU' and ((v_old->>'titleOdds')::numeric not between 11 and 14
       or (v_new->>'titleOdds')::numeric not between 30 and 36) then
      raise exception 'V10 Houston reference drifted: % to %',v_old,v_new;
    end if;
    v_count:=v_count+1;
  end loop;
  if v_count<>5 then raise exception 'V10 expected five real-team benchmarks'; end if;

  -- Preserve the 90 / 3 / 7 final score with no extra GM scoring credit.
  v_r10:=jsonb_build_array(private.nba_gm_v2_season(v_state,1),
    private.nba_gm_v2_season(v_state,2),
    private.nba_gm_v2_season(v_state,3));
  v_final:=jsonb_set(v_state,'{results}',v_r10);
  v_score10:=private.nba_gm_v3_final_score(v_final);
  v_score9:=private.nba_gm_v9_final_score(jsonb_set(
    v_final,'{simulationModelVersion}','9'::jsonb));
  if v_score10 is distinct from private.nba_gm_v10_final_score(v_final)
    or v_score10 is distinct from v_score9
    or v_score10->'weights' is distinct from '[0.9,0.03,0.07]'::jsonb then
    raise exception 'V10 final scoring drifted: V9 % versus V10 %',
      v_score9,v_score10;
  end if;
  if (select count(*) from private.nba_gm_contract_candidates_2026_27)<>330
    or position($needle$'simulationModelVersion',10,'lineupModelVersion',1$needle$
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    or position('jsonb_build_array(155000000,155000000,155000000)' in
      pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0 then
    raise exception 'V10 changed or lost game contract/cap/new-run boundary';
  end if;

  raise notice 'V10 original seven: V9 overall % and title %, V10 overall % and title %',
    v_v9->>'teamOverall',v_v9->>'titleOdds',
    v_v10->>'teamOverall',v_v10->>'titleOdds';
end;
$nba_v10_strength_test$;
rollback;
