-- Verify NBA dynasty grading is opt-in and preserves the original
-- 90/3/7 weights and exact V9 scores for older completed franchises.
DO $nba_dynasty_playoff$
DECLARE v_state jsonb;v_original jsonb;v_new jsonb;
  v_results jsonb;v_old_score numeric;
BEGIN
  IF position($check$'playoffScoringVersion',2$check$ IN
      pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0 THEN
    RAISE EXCEPTION 'New NBA franchises are not opted into scoring version 2';
  END IF;
  v_state:=jsonb_build_object(
    'simulationModelVersion',9,
    'picks',jsonb_build_array(
      jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
      jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
      jsonb_build_object('slot','SF','playerId','nba-gm-draft-lebronjames'),
      jsonb_build_object('slot','PF','playerId','nba-gm-draft-aaronnesmith'),
      jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
      jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-milesmcbride'),
      jsonb_build_object('slot','BIG','playerId','nba-gm-draft-jabarismith')),
    'results',jsonb_build_array(
      jsonb_build_object('season',1,'teamOverall',95,'wins',64,'finish','First Round'),
      jsonb_build_object('season',2,'teamOverall',99,'wins',70,'finish','Champion'),
      jsonb_build_object('season',3,'teamOverall',99,'wins',70,'finish','Champion')));
  v_original:=private.nba_gm_v9_final_score(v_state);
  v_new:=private.nba_gm_v9_final_score(jsonb_set(v_state,'{playoffScoringVersion}','2'::jsonb));
  IF (v_original->>'playoffs')::numeric<>89.3 OR (v_new->>'playoffs')::numeric<>97.3 THEN
    RAISE EXCEPTION 'First-round exit plus two titles misgraded: old %, new %',v_original,v_new;
  END IF;
  IF v_original->'weights'<>'[0.9,0.03,0.07]'::jsonb OR
     v_new->'weights'<>'[0.9,0.03,0.07]'::jsonb OR
     v_original->>'roster' IS DISTINCT FROM v_new->>'roster' OR
     v_original->>'regularSeason' IS DISTINCT FROM v_new->>'regularSeason' OR
     (v_new->>'score')::numeric <= (v_original->>'score')::numeric THEN
    RAISE EXCEPTION 'Dynasty bonus changed roster, record or locked weights';
  END IF;
  -- The actual result is still less than a perfect three-peat.
  IF (v_new->>'playoffs')::numeric>=100
    THEN RAISE EXCEPTION 'Two championships must not equal three';END IF;

  -- One championship alone is not a dynasty bonus.
  v_results:=jsonb_build_array(
    jsonb_build_object('season',1,'teamOverall',95,'wins',64,'finish','First Round'),
    jsonb_build_object('season',2,'teamOverall',99,'wins',70,'finish','Champion'),
    jsonb_build_object('season',3,'teamOverall',99,'wins',70,'finish','Missed Playoffs'));
  v_state:=jsonb_set(v_state,'{results}',v_results);
  IF private.nba_gm_v9_final_score(v_state) IS DISTINCT FROM
     private.nba_gm_v9_final_score(jsonb_set(v_state,'{playoffScoringVersion}','2'::jsonb))
     THEN RAISE EXCEPTION 'Single championship incorrectly gained dynasty bonus';END IF;

  -- A non-playoff first year still matters, and a stronger third season
  -- earns a higher subgrade than a weaker third season.
  v_results:=jsonb_build_array(
    jsonb_build_object('season',1,'teamOverall',95,'wins',64,'finish','Missed Playoffs'),
    jsonb_build_object('season',2,'teamOverall',99,'wins',70,'finish','Champion'),
    jsonb_build_object('season',3,'teamOverall',99,'wins',70,'finish','Champion'));
  v_state:=jsonb_set(v_state,'{results}',v_results);
  v_new:=private.nba_gm_v9_final_score(jsonb_set(v_state,'{playoffScoringVersion}','2'::jsonb));
  IF (v_new->>'playoffs')::numeric<>93.8 THEN
    RAISE EXCEPTION 'Missing playoffs before two titles must remain a penalty: %',v_new;
  END IF;

  -- Three consecutive championships are the only 100 playoff grade.
  v_results:=jsonb_build_array(
    jsonb_build_object('season',1,'teamOverall',99,'wins',70,'finish','Champion'),
    jsonb_build_object('season',2,'teamOverall',99,'wins',70,'finish','Champion'),
    jsonb_build_object('season',3,'teamOverall',99,'wins',70,'finish','Champion'));
  v_state:=jsonb_set(v_state,'{results}',v_results);
  IF (private.nba_gm_v9_final_score(jsonb_set(v_state,'{playoffScoringVersion}','2'::jsonb))->>'playoffs')::numeric<>100
    THEN RAISE EXCEPTION 'Three-peat grade must remain 100';END IF;
END;
$nba_dynasty_playoff$;
