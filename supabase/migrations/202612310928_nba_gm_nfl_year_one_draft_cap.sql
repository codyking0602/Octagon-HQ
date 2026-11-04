-- Match NFL GM: Season 1 is the ONLY cap gate during a new NBA draft.
-- Year 2/3 extension exposure remains visible and enforceable during offseason.
-- Do not modify any player prices, current run state, or scoring.
DO $nba_nfl_draft_cap_parity$
DECLARE
  v_def text;
  v_before text;
  v_old text:=$old$greatest(private.nba_gm_v3_salary(p_state,p.id,1),
          private.nba_gm_v3_salary(p_state,p.id,2),private.nba_gm_v3_salary(p_state,p.id,3))$old$;
  v_new text:='private.nba_gm_v3_salary(p_state,p.id,1)';
  v_loop_old text:=$old$if v_phase='offseason' and v_year=1 then continue; end if;$old$;
  v_loop_new text:=$new$if (v_phase='draft' and v_year<>1)
       or (v_phase='offseason' and v_year=1) then continue; end if;$new$;
BEGIN
  SELECT pg_get_functiondef('private.nba_gm_v2_can_add(jsonb,text)'::regprocedure)
    INTO v_def;
  IF v_def IS NULL
    OR position(v_old IN v_def)=0
    OR position(v_loop_old IN v_def)=0
    OR position('v_reserved_ids:=array_append(v_reserved_ids,v_filler_id)' IN v_def)=0
    OR position(v_loop_new IN v_def)>0
    THEN RAISE EXCEPTION 'NBA GM draft affordability implementation drifted; refuse parity patch';END IF;
  v_before:=v_def;
  v_def:=replace(v_def,v_old,v_new);
  IF length(v_before)-length(replace(v_before,v_old,''))<>2*length(v_old) THEN
    RAISE EXCEPTION 'Expected two future-max reserve lookups';END IF;
  v_def:=replace(v_def,v_loop_old,v_loop_new);
  IF position(v_old IN v_def)>0 OR position(v_loop_new IN v_def)=0 THEN
    RAISE EXCEPTION 'NBA GM draft affordability patch incomplete';END IF;
  EXECUTE v_def;
END;
$nba_nfl_draft_cap_parity$;
