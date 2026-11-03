-- New NBA franchises only: two championships across three seasons earn
-- a playoff grade representing dynasty-level success without erasing the
-- third season's finish. The bonus closes 75% of the distance to 100.
-- Existing V9 and older saves retain their exact saved scoreBreakdown,
-- simulated games, contracts, records, title odds and player grades.
DO $nba_gm_dynasty$
DECLARE v_score_def text;v_action_def text;
BEGIN
  SELECT pg_get_functiondef('private.nba_gm_v9_final_score(jsonb)'::regprocedure)
    INTO v_score_def;
  IF v_score_def IS NULL
    OR position($old$v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;v_finish text;$old$ IN v_score_def)=0
    OR position($old$v_finish:=p_state->'results'->(v_year-1)->>'finish';$old$ IN v_score_def)=0
    OR position($old$v_playoff:=round(v_playoff/3,1);$old$ IN v_score_def)=0
    OR position('playoffScoringVersion' IN v_score_def)>0
    THEN RAISE EXCEPTION 'NBA V9 scorer changed; refuse dynasty migration';END IF;

  v_score_def:=replace(v_score_def,
    $old$v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;v_finish text;$old$,
    $new$v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;v_finish text;v_titles integer:=0;$new$);
  v_score_def:=replace(v_score_def,
    $old$v_finish:=p_state->'results'->(v_year-1)->>'finish';$old$,
    $new$v_finish:=p_state->'results'->(v_year-1)->>'finish';
      IF v_finish='Champion' THEN v_titles:=v_titles+1;END IF;$new$);
  v_score_def:=replace(v_score_def,
    $old$v_playoff:=round(v_playoff/3,1);$old$,
    $new$v_playoff:=round(v_playoff/3,1);
    -- An ordinary three-season average penalizes two championships too
    -- severely. Two titles alone qualify; one title is still scored raw.
    -- The original average is preserved for unversioned historical runs.
    IF p_state->>'playoffScoringVersion'='2' AND v_titles=2 THEN
      v_playoff:=round(v_playoff+(100-v_playoff)*.75,1);
    END IF;$new$);

  SELECT pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    INTO v_action_def;
  IF v_action_def IS NULL
    OR position($old$'simulationModelVersion',9,'phase','draft'$old$ IN v_action_def)=0
    OR position('playoffScoringVersion' IN v_action_def)>0
    THEN RAISE EXCEPTION 'NBA action start changed; refuse dynasty migration';END IF;
  -- The server alone determines the version at new-run creation.
  -- A paused franchise started before this patch intentionally has no flag.
  v_action_def:=replace(v_action_def,
    $old$'simulationModelVersion',9,'phase','draft'$old$,
    $new$'simulationModelVersion',9,'playoffScoringVersion',2,'phase','draft'$new$);

  EXECUTE v_score_def;
  EXECUTE v_action_def;
END;
$nba_gm_dynasty$;
