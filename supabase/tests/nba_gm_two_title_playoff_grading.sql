-- Transactional V9 playoff grading calibration, no persisted owner changes.
BEGIN;
DO $nba_gm_two_titles_score$
DECLARE v_state jsonb;v_base jsonb;v_next jsonb;v_less jsonb;v_triple jsonb;
BEGIN
  v_state:=jsonb_build_object(
    'simulationModelVersion',9,
    'picks',jsonb_build_array('{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb,'{}'::jsonb),
    'results',jsonb_build_array(
      jsonb_build_object('teamOverall',95,'wins',64,'finish','First Round'),
      jsonb_build_object('teamOverall',99,'wins',70,'finish','Champion'),
      jsonb_build_object('teamOverall',99,'wins',70,'finish','Champion')));
  v_base:=private.nba_gm_v9_final_score(v_state);
  v_next:=private.nba_gm_v9_final_score(v_state||jsonb_build_object('playoffScoringVersion',2));
  IF (v_base->>'playoffs')::numeric<>89.3
     OR (v_next->>'playoffs')::numeric<>97.9
     OR (v_base->>'score')::numeric<>97.0
     OR (v_next->>'score')::numeric<>97.6 THEN
    RAISE EXCEPTION 'Two championships with a first-round exit should grade 97.9 playoffs/97.6 overall, old unchanged: % / %',v_base,v_next;
  END IF;
  IF v_next->'weights' IS DISTINCT FROM '[0.90,0.03,0.07]'::jsonb
    OR v_next->>'roster' IS DISTINCT FROM v_base->>'roster'
    OR v_next->>'regularSeason' IS DISTINCT FROM v_base->>'regularSeason' THEN
    RAISE EXCEPTION '90/3/7 weights or non-playoff components changed';END IF;
  v_less:=jsonb_set(v_state,'{results,1,finish}','"Conference Finals"'::jsonb);
  IF private.nba_gm_v9_final_score(v_less)->>'playoffs'
    IS DISTINCT FROM private.nba_gm_v9_final_score(
      v_less||jsonb_build_object('playoffScoringVersion',2))->>'playoffs' THEN
    RAISE EXCEPTION 'One championship must have no dynasty bonus';END IF;
  v_triple:=jsonb_set(v_state,'{results,0,finish}','"Champion"'::jsonb);
  IF (private.nba_gm_v9_final_score(
      v_triple||jsonb_build_object('playoffScoringVersion',2))->>'playoffs')::numeric<>100
    THEN RAISE EXCEPTION 'Three championships should grade 100';END IF;
  IF position($expected$'simulationModelVersion',9,'playoffScoringVersion',2,'phase','draft'$expected$
      IN pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0 THEN
    RAISE EXCEPTION 'New NBA franchises are not opted into calibrated scoring';END IF;
  RAISE NOTICE 'NBA V9 2-title playoff calibration and historical score compatibility passed';
END;
$nba_gm_two_titles_score$;
ROLLBACK;
