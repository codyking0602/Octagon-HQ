-- V13 superstar calibration. Versioned to preserve every V12 saved franchise.
-- Candidate values: taper 40% -> 20%; elite offensive cap 8 -> 10;
-- OVR above 90 contributes 0.16 net units, capped at 1.2 per player.
do $v13$
declare d text; old text; fresh text;
begin
 select pg_get_functiondef('private.nba_gm_v12_components(jsonb,integer,jsonb)'::regprocedure) into d;
 if d is null or position('v_sc_elastic:=1-.40' in d)=0
   or position('v_pm_elastic:=1-.40' in d)=0
   or position('least(8,.45*(v_oi-v_obo))' in d)=0
 then raise exception 'V13 components baseline drift';end if;
 d:=replace(d,'nba_gm_v12_components','nba_gm_v13_components');
 d:=replace(d,'v_sc_elastic:=1-.40','v_sc_elastic:=1-.20');
 d:=replace(d,'v_pm_elastic:=1-.40','v_pm_elastic:=1-.20');
 d:=replace(d,'least(8,.45*(v_oi-v_obo))','least(case when v_player.overall>=90 then 10 else 8 end,.45*(v_oi-v_obo))');
 d:=replace(d,'v_off:=v_off+v_weight*greatest(-5.5,',
 'v_off:=v_off+v_weight*least(1.2,greatest(0,v_player.overall-90)*.16)+v_weight*greatest(-5.5,');
 execute d;
 select pg_get_functiondef('private.nba_gm_v12_season(jsonb,integer)'::regprocedure) into d;
 if d is null or position('nba_gm_v12_components' in d)=0
   or position('nba_gm_v12_season_lineup' in d)=0
   or position('simulationModelVersion' in d)=0
 then raise exception 'V13 season baseline drift';end if;
 d:=replace(d,'nba_gm_v12_season(','nba_gm_v13_season(');
 d:=replace(d,'nba_gm_v12_components','nba_gm_v13_components');
 d:=replace(d,'simulationModelVersion'' is distinct from ''12','simulationModelVersion'' is distinct from ''13');
 execute d;
 select pg_get_functiondef('private.nba_gm_v12_final_score(jsonb)'::regprocedure) into d;
 if d is null or position('nba_gm_v12_final_score' in d)=0
 then raise exception 'V13 score baseline drift';end if;
 d:=replace(d,'nba_gm_v12_final_score(','nba_gm_v13_final_score(');
 d:=replace(d,'simulationModelVersion''<>''12','simulationModelVersion''<>''13');
 execute d;
 -- Preserve old dispatch and saved runs.
 select pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure) into d;
 old:='if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''12'' then';
 fresh:='if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''13'' then return private.nba_gm_v13_season(p_state,p_year); end if; '||old;
 if position(old in d)=0 then raise exception 'V13 season dispatch drift';end if;
 execute replace(d,old,fresh);
 select pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure) into d;
 old:='if p_state->>''simulationModelVersion''=''12'' then';
 fresh:='if p_state->>''simulationModelVersion''=''13'' then return private.nba_gm_v13_final_score(p_state); end if; '||old;
 if position(old in d)=0 then raise exception 'V13 final dispatch drift';end if;
 execute replace(d,old,fresh);
end $v13$;
revoke all on function private.nba_gm_v13_components(jsonb,integer,jsonb) from public,anon,authenticated;
revoke all on function private.nba_gm_v13_season(jsonb,integer) from public,anon,authenticated;
revoke all on function private.nba_gm_v13_final_score(jsonb) from public,anon,authenticated;
-- Only new starts switch to V13; all existing saved versions remain unchanged.
do $cutover$
declare d text;
begin
 select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure) into d;
 if d is null or position('''simulationModelVersion'',12,''lineupModelVersion'',2' in d)=0
 then raise exception 'V13 action baseline drift';end if;
 d:=replace(d,'''simulationModelVersion'',12,''lineupModelVersion'',2',
 '''simulationModelVersion'',13,''lineupModelVersion'',2');
 execute d;
end $cutover$;
