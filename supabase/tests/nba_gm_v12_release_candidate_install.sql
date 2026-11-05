-- TEST-ONLY: prepare an isolated V12 new-franchise cutover on a disposable DB.
-- NOT a migration. Do not deploy or call this against production.
-- Validation runs the published V11 new-start regression before installing this
-- candidate and then tests real authenticated V12 franchise actions.
do $v12_candidate_action$
declare
  v_def text;v_old text;v_new text;
  v_lineup_old text;v_lineup_new text;
begin
  select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    into v_def;
  v_old:=$old$'simulationModelVersion',11,'lineupModelVersion',1$old$;
  v_new:=$new$'simulationModelVersion',12,'lineupModelVersion',2$new$;
  -- On a true release branch, the migration has already activated V12.
  -- The same smoke test must verify it rather than apply a second patch.
  if position($needle$'simulationModelVersion',12,'lineupModelVersion',2$needle$ in v_def)>0 then
    if (length(v_def)-length(replace(v_def,
          'private.nba_gm_v12_season_lineup(v_next,3)','')))
          /length('private.nba_gm_v12_season_lineup(v_next,3)')<>2 then
      raise exception 'V12 public action enabled without both developed lineup paths';end if;
    return;
  end if;
  v_lineup_old:=$old$if v_state->>'lineupModelVersion'='1' then
      v_picks:=private.nba_gm_v10_season_lineup(v_next,3);
      v_next:=jsonb_set(v_next,'{picks}',v_picks);
    end if;$old$;
  v_lineup_new:=$new$if v_state->>'lineupModelVersion'='2' then
      v_picks:=private.nba_gm_v12_season_lineup(v_next,3);
      v_next:=jsonb_set(v_next,'{picks}',v_picks);
    elsif v_state->>'lineupModelVersion'='1' then
      v_picks:=private.nba_gm_v10_season_lineup(v_next,3);
      v_next:=jsonb_set(v_next,'{picks}',v_picks);
    end if;$new$;
  if v_def is null
    or position(v_old in v_def)=0
    or (length(v_def)-length(replace(v_def,v_lineup_old,'')))
       /length(v_lineup_old)<>2
    or position('jsonb_build_array(175000000,175000000,175000000)' in v_def)=0
    or position($needle$'repriceModelVersion',2$needle$ in v_def)=0
    or position('private.nba_gm_v3_final_score(v_next)' in v_def)=0
    then raise exception 'NBA V12 release candidate: public action baseline drifted';end if;

  v_def:=replace(v_def,v_old,v_new);
  v_def:=replace(v_def,v_lineup_old,v_lineup_new);
  if position(v_old in v_def)>0
    or (length(v_def)-length(replace(v_def,
        'private.nba_gm_v12_season_lineup(v_next,3)','')))
        /length('private.nba_gm_v12_season_lineup(v_next,3)')<>2 then
    raise exception 'NBA V12 candidate failed to activate both developed lineup paths';end if;
  execute v_def;
end;
$v12_candidate_action$;
