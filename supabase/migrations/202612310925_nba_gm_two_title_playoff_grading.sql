-- NBA + NFL GM share 90% roster / 3% record / 7% playoffs. NFL's
-- client-side scorer is versioned in the matching frontend change. For NEW
-- NBA V9 runs only, two or more championships earn 80% title credit plus 20%
-- of the actual three-year playoff mean. This keeps the disappointing third
-- season visible without treating back-to-back titles as an 89-point playoff
-- performance. Do not rewrite historical runs, standings, scores, or seasons.
DO $nba_v9_two_titles$
DECLARE v_def text;
BEGIN
  SELECT pg_get_functiondef('private.nba_gm_v9_final_score(jsonb)'::regprocedure) INTO v_def;
  IF position($old$v_playoff:=round(v_playoff/3,1);$old$ IN v_def)=0
    OR position($old$v_score:=round(v_roster*.90+v_record*.03+v_playoff*.07,1);$old$ IN v_def)=0
    OR position('playoffScoringVersion' IN v_def)>0
  THEN RAISE EXCEPTION 'NBA V9 scoring changed unexpectedly; refuse dynasty adjustment';END IF;
  v_def:=replace(v_def,
    $old$v_playoff:=round(v_playoff/3,1);$old$,
    $new$v_playoff:=round(v_playoff/3,1);
    -- Explicit opt-in only; old saved V9 (and all prior versions) is immutable.
    IF p_state->>'playoffScoringVersion'='2'
      AND (SELECT count(*) FROM jsonb_array_elements(p_state->'results') season
        WHERE season->>'finish'='Champion')>=2 THEN
      v_playoff:=round(80+v_playoff*0.20,1);
    END IF;$new$);
  EXECUTE v_def;

  SELECT pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure) INTO v_def;
  IF position($old$'simulationModelVersion',9,'phase','draft'$old$ IN v_def)=0
    OR position('playoffScoringVersion' IN v_def)>0
  THEN RAISE EXCEPTION 'NBA V9 new-run initialization changed unexpectedly';END IF;
  v_def:=replace(v_def,
    $old$'simulationModelVersion',9,'phase','draft'$old$,
    $new$'simulationModelVersion',9,'playoffScoringVersion',2,'phase','draft'$new$);
  EXECUTE v_def;
END;
$nba_v9_two_titles$;
