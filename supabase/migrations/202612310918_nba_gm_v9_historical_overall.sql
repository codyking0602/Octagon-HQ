-- NBA GM V9 recalibrates displayed team strength to the 150 real NBA
-- seasons (2022-26) while preserving completed V8 saves, 90/3/7
-- scoring, contracts, season wins, title odds and playoff simulation.
-- Net-rating anchors: P25 -3.40, median +1.07, P75 +3.29,
-- P90 +5.68, P95 +7.91, P99 +11.34.

create or replace function private.nba_gm_v9_overall(p_net numeric)
returns integer language sql immutable set search_path='' as $scale$
  with anchors(net,ovr) as (values
    (-13.00,70), (-9.33,71), (-8.22,73), (-3.40,77),
    (0.00,81), (1.07,83), (3.29,87), (5.68,91),
    (7.91,94), (11.34,98), (12.72,99), (14.00,99)
  ), bounded as (
    select greatest(-13::numeric,least(14::numeric,p_net)) as val
  ), lo as (
    select * from anchors,bounded where net<=bounded.val order by net desc limit 1
  ), hi as (
    select * from anchors,bounded where net>=bounded.val order by net limit 1
  )
  select round(lo.ovr+(hi.ovr-lo.ovr)*(bounded.val-lo.net)
    /greatest(.000001,hi.net-lo.net))::integer from lo,hi,bounded;
$scale$;

revoke all on function private.nba_gm_v9_overall(numeric)
  from public,anon,authenticated;

do $v9$
declare
  v_def text; v_old text; v_new text;
begin
  select pg_get_functiondef('private.nba_gm_v8_season(jsonb,integer)'::regprocedure)
    into v_def;
  if position('v_overall:=private.nba_gm_v7_overall(v_strength);' in v_def)=0
    or position($old$simulationModelVersion' is distinct from '8'$old$ in v_def)=0
    or position('v_def_weakest' in v_def)=0 then
    raise exception 'NBA V8 season drifted; refusing V9 calibration';
  end if;
  v_def:=replace(v_def,'private.nba_gm_v8_season','private.nba_gm_v9_season');
  v_def:=replace(v_def,
    $old$simulationModelVersion' is distinct from '8'$old$,
    $new$simulationModelVersion' is distinct from '9'$new$);
  v_def:=replace(v_def,
    'v_overall:=private.nba_gm_v7_overall(v_strength);',
    'v_overall:=private.nba_gm_v9_overall(v_net);');
  execute v_def;

  select pg_get_functiondef('private.nba_gm_v8_final_score(jsonb)'::regprocedure)
    into v_def;
  if position($old$simulationModelVersion'<>'8'$old$ in v_def)=0
    or position('v_roster*.90+v_record*.03+v_playoff*.07' in v_def)=0 then
    raise exception 'NBA V8 scoring drifted; refusing V9 score';
  end if;
  v_def:=replace(v_def,'private.nba_gm_v8_final_score','private.nba_gm_v9_final_score');
  v_def:=replace(v_def,
    $old$simulationModelVersion'<>'8'$old$,
    $new$simulationModelVersion'<>'9'$new$);
  v_def:=replace(v_def,'V8 final score requires','V9 final score requires');
  execute v_def;

  select pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='8' then$old$;
  v_new:=$new$if p_state->>'economyVersion'='4' and p_state->>'simulationModelVersion'='9' then
    return private.nba_gm_v9_season(p_state,p_year);
  end if;
  $new$||v_old;
  if position(v_old in v_def)=0 or position('nba_gm_v9_season' in v_def)>0 then
    raise exception 'NBA V8 season router drifted';
  end if;
  execute replace(v_def,v_old,v_new);

  select pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure)
    into v_def;
  v_old:=$old$if p_state->>'simulationModelVersion'='8' then$old$;
  v_new:=$new$if p_state->>'simulationModelVersion'='9' then
   return private.nba_gm_v9_final_score(p_state);
 end if;
 $new$||v_old;
  if position(v_old in v_def)=0 or position('nba_gm_v9_final_score' in v_def)>0 then
    raise exception 'NBA V8 score router drifted';
  end if;
  execute replace(v_def,v_old,v_new);

  select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    into v_def;
  if position($old$'simulationModelVersion',8$old$ in v_def)=0 then
    raise exception 'NBA GM current-start version drifted';
  end if;
  execute replace(v_def,
    $old$'simulationModelVersion',8$old$,
    $new$'simulationModelVersion',9$new$);
end;
$v9$;

revoke all on function private.nba_gm_v9_season(jsonb,integer)
  from public,anon,authenticated;
revoke all on function private.nba_gm_v9_final_score(jsonb)
  from public,anon,authenticated;
