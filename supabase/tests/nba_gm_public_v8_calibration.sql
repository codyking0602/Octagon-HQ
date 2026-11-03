-- NBA GM public V8 release: 150-cohort anchors, defensible team grades,
-- server authority, legacy isolation, NFL 90/3/7 score and signed-in RPCs.
DO $test$
DECLARE
  v_picks jsonb;
  v_state jsonb;
  v_legacy jsonb;
  v_current jsonb;
  v_one jsonb;
  v_two jsonb;
  v_three jsonb;
  v_score jsonb;
  v_average numeric;
  v_name text;
  v_def text;
  v_p95attack numeric;
  v_p95stop numeric;
BEGIN
  WITH real AS (
    SELECT t.season_end,t.offensive_rating,t.defensive_rating
    FROM private.nba_gm_v5_historical_teams t
  ), league AS (
    SELECT season_end,avg(offensive_rating) avg_off,avg(defensive_rating) avg_def
    FROM real GROUP BY season_end
  ), centered AS (
    SELECT real.offensive_rating-league.avg_off attack,
           league.avg_def-real.defensive_rating stop
    FROM real JOIN league USING (season_end)
  )
  SELECT percentile_cont(.95) within group(order by attack),
         percentile_cont(.95) within group(order by stop)
    INTO v_p95attack,v_p95stop FROM centered;
  IF v_p95attack NOT BETWEEN 4 AND 6 OR v_p95stop NOT BETWEEN 3.5 AND 6 THEN
    RAISE EXCEPTION 'NBA five-season efficiency anchors drifted: %, %',
      v_p95attack,v_p95stop;
  END IF;
  IF private.nba_gm_v7_overall(92)<>98 THEN
    RAISE EXCEPTION 'V7 OVR history changed';
  END IF;
  v_picks:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-cadecunningham'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-ausarthompson'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-brooklopez'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ajaymitchell'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-yvesmissi'));
  IF private.nba_gm_v2_assign(v_picks) IS NULL THEN
    RAISE EXCEPTION 'V8 calibration roster missing or position-ineligible';
  END IF;
  v_state:=jsonb_build_object(
    'version','nba-gm-dev-v2','economyVersion',4,'simulationModelVersion',8,
    'developmentModelVersion',2,'seed','nba-public-v8-calibration-benchmark',
    'phase','year1','picks',v_picks,'yearOnePicks',v_picks,
    'releasedIds','[]'::jsonb,'tradesUsed',0);
  v_legacy:=jsonb_set(v_state,'{simulationModelVersion}','7'::jsonb);
  v_one:=private.nba_gm_v2_season(v_state,1);
  v_two:=private.nba_gm_v2_season(v_state,2);
  v_three:=private.nba_gm_v2_season(v_state,3);
  v_current:=private.nba_gm_v7_season(v_legacy,1);
  IF v_one IS DISTINCT FROM private.nba_gm_v8_season(v_state,1) OR
     v_two IS DISTINCT FROM private.nba_gm_v8_season(v_state,2) OR
     v_current IS DISTINCT FROM private.nba_gm_v2_season(v_legacy,1) THEN
    RAISE EXCEPTION 'NBA V8 is not deterministic or legacy router changed';
  END IF;
  IF (v_one->>'offense')::numeric NOT BETWEEN 60 AND 99 OR
     (v_one->>'defense')::numeric NOT BETWEEN 60 AND 99 OR
     (v_one->>'teamOverall')::numeric NOT BETWEEN 70 AND 99 OR
     (v_one->>'offense')::numeric >= (v_current->>'offense')::numeric OR
     (v_one->>'defense')::numeric >= (v_current->>'defense')::numeric OR
     (v_one->>'teamOverall')::numeric > (v_current->>'teamOverall')::numeric THEN
    RAISE EXCEPTION 'NBA V8 did not correct overinflated three-way grades: v8 % versus v7 %',
       v_one,v_current;
  END IF;
  v_state:=jsonb_set(v_state,'{results}',jsonb_build_array(v_one,v_two,v_three));
  v_score:=private.nba_gm_v3_final_score(v_state);
  v_average:=round(((v_one->>'teamOverall')::numeric+
    (v_two->>'teamOverall')::numeric+
    (v_three->>'teamOverall')::numeric)/3,1);
  IF (v_score->>'roster')::numeric<>v_average
    OR v_score->'weights'<>'[0.9,0.03,0.07]'::jsonb
    OR (v_score->>'score')::numeric NOT BETWEEN 65 AND 100 THEN
    RAISE EXCEPTION 'NBA V8 final score/strength parity broken: %',v_score;
  END IF;
  IF private.nba_gm_v3_final_score(jsonb_set(v_state,'{simulationModelVersion}','7'::jsonb))
     IS DISTINCT FROM private.nba_gm_v3_final_score(jsonb_set(v_state,'{simulationModelVersion}','7'::jsonb)) THEN
    RAISE EXCEPTION 'Legacy scoring nondeterminism';
  END IF;
  FOREACH v_name IN ARRAY ARRAY['nba_gm_dev_catalog','nba_gm_dev_action','nba_gm_dev_trade_offers'] LOOP
    SELECT pg_get_functiondef(p.oid) INTO v_def FROM pg_proc p
    JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname=v_name;
    IF v_def IS NULL OR position('private.nba_gm_dev_owner()' IN v_def)>0
      OR position('auth.uid()' IN v_def)=0
      OR position('NBA GM sign-in required' IN v_def)=0 THEN
      RAISE EXCEPTION 'Public NBA GM RPC % is incorrectly gated',v_name;
    END IF;
  END LOOP;
  IF has_function_privilege('anon','public.nba_gm_dev_action(text,text,text)','EXECUTE')
    OR has_function_privilege('anon','public.nba_gm_dev_catalog()','EXECUTE')
    OR has_function_privilege('anon','public.nba_gm_dev_trade_offers(text)','EXECUTE')
    OR NOT has_function_privilege('authenticated','public.nba_gm_dev_action(text,text,text)','EXECUTE') THEN
    RAISE EXCEPTION 'NBA GM RPC grants not correctly scoped';
  END IF;
  RAISE NOTICE 'V8 grade evidence: offense % vs %, defense % vs %, OVR % vs %, final GM %, five-season 95th offense % defense %',
    v_one->>'offense',v_current->>'offense',
    v_one->>'defense',v_current->>'defense',
    v_one->>'teamOverall',v_current->>'teamOverall',
    v_score->>'score',round(v_p95attack::numeric,2),round(v_p95stop::numeric,2);
END;
$test$;