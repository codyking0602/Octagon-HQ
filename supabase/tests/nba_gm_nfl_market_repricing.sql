-- NBA GM NFL market-value parity: the same 330 verified signed contracts,
-- but expiring offers are independent market prices (not salary multipliers).
-- Run against the fully migrated backend; rollback all temporary assertions.
BEGIN;
SET LOCAL statement_timeout='120s';
DO $verify_nba_nfl_market$
DECLARE
  v_draft jsonb:='{"economyVersion":4,"developmentModelVersion":2,"repriceModelVersion":2,"phase":"draft","seed":"draft-a"}'::jsonb;
  v_draft_alt jsonb:='{"economyVersion":4,"developmentModelVersion":2,"repriceModelVersion":2,"phase":"draft","seed":"draft-b"}'::jsonb;
  v_off jsonb:='{"economyVersion":4,"developmentModelVersion":2,"repriceModelVersion":2,"phase":"offseason","seed":"nba-gm-14881242-c67d-4e95-9848-9b73bee767b0"}'::jsonb;
  v_old jsonb:='{"economyVersion":4,"developmentModelVersion":2,"phase":"offseason","seed":"nba-gm-14881242-c67d-4e95-9848-9b73bee767b0"}'::jsonb;
  v_row record;v_y1 bigint;v_y2 bigint;v_y3 bigint;v_draft_y2 bigint;
  v_total integer:=0;v_expiring integer:=0;v_locked integer:=0;
BEGIN
  IF NOT private.nba_gm_v4_salary_certified() THEN
    RAISE EXCEPTION '330 contract salaries not certified';END IF;
  FOR v_row IN SELECT p.id,c.candidate_contract,c.provisional_average_salary
    FROM private.nba_gm_dev_players p
    JOIN private.nba_gm_contract_candidates_2026_27 c ON c.player_id=p.id
  LOOP
    v_total:=v_total+1;
    v_y1:=private.nba_gm_v4_salary(v_off,v_row.id,1);
    v_y2:=private.nba_gm_v4_salary(v_off,v_row.id,2);
    v_y3:=private.nba_gm_v4_salary(v_off,v_row.id,3);
    IF v_y1<>v_row.provisional_average_salary THEN
      RAISE EXCEPTION 'Signed first-year salary changed: %',v_row.id;END IF;
    IF v_row.candidate_contract='3YR' THEN
      v_locked:=v_locked+1;
      IF v_y1<>v_y2 OR v_y2<>v_y3 OR
        private.nba_gm_v10_reprice_risk(v_draft,v_row.id)<>'LOCKED' THEN
        RAISE EXCEPTION 'Three-year salary no longer locked: %',v_row.id;END IF;
    ELSE
      v_expiring:=v_expiring+1;
      v_draft_y2:=private.nba_gm_v4_salary(v_draft,v_row.id,2);
      IF v_y2<>v_y3 OR v_draft_y2<>private.nba_gm_v4_salary(v_draft,v_row.id,3)
        OR v_draft_y2<>private.nba_gm_v4_salary(v_draft_alt,v_row.id,2)
        OR v_y2<2500000 OR v_draft_y2<2500000 THEN
        RAISE EXCEPTION 'Extension, cap forecast, or seed independence failed: %',v_row.id;END IF;
      IF private.nba_gm_v10_reprice_risk(v_draft,v_row.id)
        NOT IN ('LOW','MEDIUM','HIGH') THEN
        RAISE EXCEPTION 'Missing market repricing risk: %',v_row.id;END IF;
    END IF;
  END LOOP;
  IF v_total<>330 OR v_expiring=0 OR v_locked=0 THEN
    RAISE EXCEPTION 'Invalid 330-player contract census: %, %, %',
      v_total,v_expiring,v_locked;END IF;
  -- A bargain contract must reprice near his CURRENT ability, even if he
  -- regresses. The current saved 88 -> 85.61 Deni run is the direct proof.
  IF private.nba_gm_v4_salary(v_off,'nba-gm-draft-deniavdija',2) NOT BETWEEN
    30000000 AND 50000000 THEN
    RAISE EXCEPTION 'Deni stayed anchored to his stale $12.5M contract';END IF;
  IF private.nba_gm_v4_salary(v_old,'nba-gm-draft-deniavdija',2) <>
     11000000 THEN
    RAISE EXCEPTION 'Existing unversioned V4 save salary changed';END IF;
  IF private.nba_gm_v11_market_apy(88,'SF',26) <=
     private.nba_gm_v11_market_apy(85,'SF',26) OR
     private.nba_gm_v11_market_apy(88,'SF',36) >=
     private.nba_gm_v11_market_apy(88,'SF',26) THEN
    RAISE EXCEPTION 'NBA market curve grade/age ordering regressed';END IF;
  IF position('repriceModelVersion' IN
    pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0 THEN
    RAISE EXCEPTION 'New games did not opt in to market economy';END IF;
END;
$verify_nba_nfl_market$;
ROLLBACK;
