-- NBA GM V10: honor the seven-man rotation and avoid double-counting
-- defensive weakness. Source evidence: 30 current NBA-team top-seven cohorts,
-- the owner Luka/Brunson run, and 150 historical 2022-2026 team-seasons.
--
-- V9 applied (1) a -1.70 "unrepresented minutes" tax to a complete 7-player
-- rotation, and (2) another up-to-2.20 defensive tax after already grading
-- both weak players' perimeter/interior/rebounding skills individually.
-- Across almost every top-seven team cohort the latter saturated at -2.20.
--
-- Preserve the six-skill side impacts, positional role weights, shot/creator/
-- rim fit, seeded outcomes, 2022-2026 net-to-wins anchors, 90/3/7 score,
-- game contracts, $155M cap, and immutable V9 or older saved results.
-- The six-skill-to-team-net bridge is still a game model, not an independently
-- learned regression on seven-player lineup minutes.

do $nba_seven_player_v10$
declare
  v_def text;
  v_old text;
  v_new text;
begin
  -- Strictly clone the complete V9 simulation and change only the two
  -- additive deductions. All old versioned runs still execute V9 verbatim.
  select pg_get_functiondef('private.nba_gm_v9_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:=$old$v_def:=greatest(-9.0,least(6.25,v_def
      -least(2.2,greatest(0,80-v_def_weakest)*.23
          +greatest(0,80-v_def_second)*.12)));$old$;
  v_new:=$new$v_def:=greatest(-9.0,least(6.25,v_def));$new$;
  if v_def is null
    or position('FUNCTION private.nba_gm_v9_season(' in v_def)=0
    or position($old$simulationModelVersion' is distinct from '9'$old$ in v_def)=0
    or position(v_old in v_def)=0
    or position('v_off+v_def-1.70+v_fit' in v_def)=0
    or position('nba_gm_v10_season(' in v_def)>0
    or position('private.nba_gm_v10_season_lineup(p_state,p_year)' in v_def)=0
    or position('private.nba_gm_v7_outcome_odds(v_strength)' in v_def)=0
    or position('private.nba_gm_v9_overall(v_net)' in v_def)=0
    then raise exception 'NBA V9 skill engine drifted: refuse V10 recalibration'; end if;
  v_def:=replace(v_def,'FUNCTION private.nba_gm_v9_season(', 'FUNCTION private.nba_gm_v10_season(');
  v_def:=replace(v_def,
    $old$simulationModelVersion' is distinct from '9'$old$,
    $new$simulationModelVersion' is distinct from '10'$new$);
  v_def:=replace(v_def,v_old,v_new);
  v_def:=replace(v_def,'v_off+v_def-1.70+v_fit','v_off+v_def+v_fit');
  if position(v_old in v_def)>0 or position('v_off+v_def-1.70+v_fit' in v_def)>0
    then raise exception 'V10 penalties not completely removed'; end if;
  execute v_def;

  -- The 90/3/7 season/record/playoffs final score is unchanged.
  select pg_get_functiondef('private.nba_gm_v9_final_score(jsonb)'::regprocedure)
    into v_def;
  if position('FUNCTION private.nba_gm_v9_final_score(' in v_def)=0
    or position($old$simulationModelVersion'<>'9'$old$ in v_def)=0
    or position('v_roster*.90+v_record*.03+v_playoff*.07' in v_def)=0
    then raise exception 'V9 score function drifted: refuse V10'; end if;
  v_def:=replace(v_def,'FUNCTION private.nba_gm_v9_final_score(','FUNCTION private.nba_gm_v10_final_score(');
  v_def:=replace(v_def,
    $old$simulationModelVersion'<>'9'$old$,
    $new$simulationModelVersion'<>'10'$new$);
  execute v_def;

  -- Preserve versioned routing for saved V9 and earlier franchises.
  select pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='9' then$old$;
  v_new:=$new$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='10' then
    return private.nba_gm_v10_season(p_state,p_year);
  end if;
  $new$||v_old;
  if position(v_old in v_def)=0 or position('nba_gm_v10_season(p_state,p_year)' in v_def)>0
    then raise exception 'NBA V9 season router drifted'; end if;
  execute replace(v_def,v_old,v_new);

  select pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'simulationModelVersion'='9' then$old$;
  v_new:=$new$if p_state->>'simulationModelVersion'='10' then
   return private.nba_gm_v10_final_score(p_state);
 end if;
 $new$||v_old;
  if position(v_old in v_def)=0 or position('nba_gm_v10_final_score(p_state)' in v_def)>0
    then raise exception 'NBA V9 score router drifted'; end if;
  execute replace(v_def,v_old,v_new);

  -- New runs only. Game contracts and Year 1 / Years 2-3 cap remain locked.
  select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    into v_def;
  v_old:=$old$'simulationModelVersion',9,'lineupModelVersion',1$old$;
  v_new:=$new$'simulationModelVersion',10,'lineupModelVersion',1$new$;
  if position(v_old in v_def)=0
    or position($old$'repriceModelVersion',2$old$ in v_def)=0
    or position($old$jsonb_build_array(155000000,155000000,155000000)$old$ in v_def)=0
    or position('nba_gm_v10_season_lineup(v_next,3)' in v_def)=0
    then raise exception 'NBA new-run version/cap/lineup drifted'; end if;
  execute replace(v_def,v_old,v_new);
end;
$nba_seven_player_v10$;

revoke all on function private.nba_gm_v10_season(jsonb,integer)
  from public,anon,authenticated;
revoke all on function private.nba_gm_v10_final_score(jsonb)
  from public,anon,authenticated;
