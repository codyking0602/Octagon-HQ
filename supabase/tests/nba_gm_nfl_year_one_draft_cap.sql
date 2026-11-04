-- NBA GM draft cap parity: draft ONLY gates Year 1, like Football GM.
-- Future contract extensions are real, but are enforced in the offseason.
-- Full transactional test; no active franchise or player row is updated.
BEGIN;
SET LOCAL statement_timeout='120s';
DO $nba_gm_year_one_cap_parity$
DECLARE
  v_state jsonb:=jsonb_build_object(
    'phase','draft','economyVersion',4,'developmentModelVersion',2,
    'repriceModelVersion',2,'seed','nba-year-one-parity-fixture',
    'pendingTeam','GSW','caps','[155000000,155000000,155000000]'::jsonb,
    'picks',jsonb_build_array(
      jsonb_build_object('slot','SG','playerId','nba-gm-draft-jaylontyson'),
      jsonb_build_object('slot','SF','playerId','nba-gm-draft-keeganmurray'),
      jsonb_build_object('slot','PF','playerId','nba-gm-draft-deniavdija')));
  v_six jsonb;v_seven jsonb;v_one bigint;v_two bigint;v_three bigint;
BEGIN
  IF NOT private.nba_gm_v4_salary_certified() THEN
    RAISE EXCEPTION 'NBA GM signed contract bank not certified';END IF;
  -- Actual three-player roster pattern (synthetic seed, not a saved user run).
  -- Stephen Curry has a legitimate available PG position and affordable Y1.
  IF NOT private.nba_gm_v2_can_add(v_state,'nba-gm-draft-stephencurry') THEN
    RAISE EXCEPTION 'Curry illegally excluded by future-season draft affordability';END IF;
  IF private.nba_gm_v2_assign(v_state->'picks','nba-gm-draft-stephencurry') IS NULL THEN
    RAISE EXCEPTION 'Curry position assignment lost PG eligibility';END IF;
  -- Current-season cap is still hard; it is not a free pass on Y1 payroll.
  IF private.nba_gm_v2_can_add(
    jsonb_set(v_state,'{caps}','[100000000,155000000,155000000]'::jsonb),
    'nba-gm-draft-stephencurry') THEN
    RAISE EXCEPTION 'Over-cap Season 1 player became draftable';END IF;
  -- Finish a realistic seven-player first-season roster that projects a
  -- future cap crisis. Such a draft must be allowed; offseason must fix it.
  v_six:=jsonb_set(v_state,'{picks}',jsonb_build_array(
      jsonb_build_object('slot','PG','playerId','nba-gm-draft-stephencurry'),
      jsonb_build_object('slot','SG','playerId','nba-gm-draft-jaylontyson'),
      jsonb_build_object('slot','SF','playerId','nba-gm-draft-keeganmurray'),
      jsonb_build_object('slot','PF','playerId','nba-gm-draft-deniavdija'),
      jsonb_build_object('slot','C','playerId','nba-gm-draft-babamiller'),
      jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-brucethornton')));
  IF NOT private.nba_gm_v2_can_add(v_six,'nba-gm-draft-camwhitmore') THEN
    RAISE EXCEPTION 'Season 1 draft cannot finish amid future reprice exposure';END IF;
  v_seven:=private.nba_gm_v2_assign(v_six->'picks','nba-gm-draft-camwhitmore');
  IF v_seven IS NULL OR jsonb_array_length(v_seven)<>7 THEN
    RAISE EXCEPTION 'Final draft lineup fails positional assignment';END IF;
  SELECT coalesce(sum(private.nba_gm_v3_salary(v_six,x->>'playerId',1)),0),
         coalesce(sum(private.nba_gm_v3_salary(v_six,x->>'playerId',2)),0),
         coalesce(sum(private.nba_gm_v3_salary(v_six,x->>'playerId',3)),0)
    INTO v_one,v_two,v_three FROM jsonb_array_elements(v_seven) x;
  IF v_one>155000000 OR v_two<=155000000 OR v_three<=155000000 THEN
    RAISE EXCEPTION 'Expected Y1 affordable/Y2-3 crisis, got %, %, %',
      v_one,v_two,v_three;END IF;
  IF private.nba_gm_v2_can_add(
    jsonb_set(v_six,'{phase}',to_jsonb('offseason'::text)),
    'nba-gm-draft-camwhitmore') THEN
    RAISE EXCEPTION 'Offseason incorrectly waived Year 2/3 salary cap';END IF;
END;
$nba_gm_year_one_cap_parity$;
ROLLBACK;
