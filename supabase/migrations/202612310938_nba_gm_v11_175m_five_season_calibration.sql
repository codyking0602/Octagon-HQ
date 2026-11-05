-- NBA GM V11 / $175M: owner-approved, five-season-calibrated simulation.
-- New franchises only. Preserve V10 and older saved results and cap JSON.
-- 150 NBA team-seasons (2022-2026) and 2,160 controlled seven-player wheel
-- drafts used as comparison evidence; six formulas, 12,960 Year-1 outputs.
-- The seven-player skill-to-net bridge is a game model, not an empirical fit.
-- Keep contracts, repricing, development, best-five lineup, seeded playoffs,
-- original real NBA net-to-wins/OVR anchors, odds, and 90/3/7 GM scoring.

do $nba_v11_release$
declare
  v_def text;
  v_old text;
  v_new text;
begin
  -- Clone complete V10 season: never change the V10 function in place.
  select pg_get_functiondef('private.nba_gm_v10_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:='v_off+v_def+v_fit';
  v_new:='(.75*v_off)+(.75*v_def)+v_fit-.6'
    ||'-least(1.7,greatest(0,89-v_creator_top)*.20)';
  if v_def is null
    or position('FUNCTION private.nba_gm_v10_season(' in v_def)=0
    or position($old$simulationModelVersion' is distinct from '10'$old$ in v_def)=0
    or position(v_old in v_def)=0
    or position('v_def:=greatest(-9.0,least(6.25,v_def));' in v_def)=0
    or position('private.nba_gm_v10_season_lineup(p_state,p_year)' in v_def)=0
    or position('v_off_grade:=greatest(60,least(99,round(85+1.75*v_off)::integer));' in v_def)=0
    or position('v_def_grade:=greatest(60,least(99,round(85+1.75*v_def)::integer));' in v_def)=0
    or position('private.nba_gm_v7_outcome_odds(v_strength)' in v_def)=0
    or position('private.nba_gm_v9_overall(v_net)' in v_def)=0
    then raise exception 'NBA V10 skill engine drifted: refuse V11'; end if;
  v_def:=replace(v_def,'FUNCTION private.nba_gm_v10_season(',
    'FUNCTION private.nba_gm_v11_season(');
  v_def:=replace(v_def,
    $old$simulationModelVersion' is distinct from '10'$old$,
    $new$simulationModelVersion' is distinct from '11'$new$);
  v_def:=replace(v_def,v_old,v_new);
  -- Displayed offense/defense reflect same scaled simulation components.
  v_def:=replace(v_def,
    'v_off_grade:=greatest(60,least(99,round(85+1.75*v_off)::integer));',
    'v_off_grade:=greatest(60,least(99,round(85+1.75*'
      ||'(.75*v_off-.6-least(1.7,greatest(0,89-v_creator_top)*.20)))::integer));');
  v_def:=replace(v_def,
    'v_def_grade:=greatest(60,least(99,round(85+1.75*v_def)::integer));',
    'v_def_grade:=greatest(60,least(99,round(85+1.75*(.75*v_def))::integer));');
  if position(v_old in v_def)>0
    or position('85+1.75*v_off' in v_def)>0
    or position('85+1.75*v_def' in v_def)>0
    then raise exception 'NBA V11 strength / side grade transform incomplete'; end if;
  execute v_def;

  -- Clone unchanged 90/3/7 GM score and keep all legacy score versions.
  select pg_get_functiondef('private.nba_gm_v10_final_score(jsonb)'::regprocedure)
    into v_def;
  if position('FUNCTION private.nba_gm_v10_final_score(' in v_def)=0
    or position($old$simulationModelVersion'<>'10'$old$ in v_def)=0
    or position('v_roster*.90+v_record*.03+v_playoff*.07' in v_def)=0
    then raise exception 'NBA V10 final score drifted: refuse V11'; end if;
  v_def:=replace(v_def,'FUNCTION private.nba_gm_v10_final_score(',
    'FUNCTION private.nba_gm_v11_final_score(');
  v_def:=replace(v_def,
    $old$simulationModelVersion'<>'10'$old$,
    $new$simulationModelVersion'<>'11'$new$);
  execute v_def;

  select pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='10' then$old$;
  v_new:=$new$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='11' then
    return private.nba_gm_v11_season(p_state,p_year);
  end if;
  $new$||v_old;
  if position(v_old in v_def)=0
    or position('private.nba_gm_v11_season(p_state,p_year)' in v_def)>0
    then raise exception 'NBA V10 season router drifted'; end if;
  execute replace(v_def,v_old,v_new);

  select pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'simulationModelVersion'='10' then$old$;
  v_new:=$new$if p_state->>'simulationModelVersion'='11' then
    return private.nba_gm_v11_final_score(p_state);
  end if;
  $new$||v_old;
  if position(v_old in v_def)=0
    or position('private.nba_gm_v11_final_score(p_state)' in v_def)>0
    then raise exception 'NBA V10 final-score router drifted'; end if;
  execute replace(v_def,v_old,v_new);

  -- New starts ONLY. Old run JSON retains its original $155M cap/model.
  select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    into v_def;
  v_old:=$old$'simulationModelVersion',10,'lineupModelVersion',1$old$;
  v_new:=$new$'simulationModelVersion',11,'lineupModelVersion',1$new$;
  if position(v_old in v_def)=0
    or position($old$'repriceModelVersion',2$old$ in v_def)=0
    or position('jsonb_build_array(155000000,155000000,155000000)' in v_def)=0
    or position('nba_gm_v10_season_lineup(v_next,3)' in v_def)=0
    then raise exception 'NBA new-run version/cap/lineup source drifted'; end if;
  v_def:=replace(v_def,v_old,v_new);
  v_def:=replace(v_def,'jsonb_build_array(155000000,155000000,155000000)',
    'jsonb_build_array(175000000,175000000,175000000)');
  execute v_def;
end;
$nba_v11_release$;

revoke all on function private.nba_gm_v11_season(jsonb,integer)
  from public,anon,authenticated;
revoke all on function private.nba_gm_v11_final_score(jsonb)
  from public,anon,authenticated;
