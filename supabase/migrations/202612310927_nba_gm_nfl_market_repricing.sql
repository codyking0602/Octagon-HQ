-- NFL-style NBA GM: contracts are authentic, expiring 1YR renewals use
-- independently valued basketball market APY (grade, position, age).
-- Only NEW games opt in. Prior saved runs retain old V4 exact behavior.
CREATE OR REPLACE FUNCTION private.nba_gm_v11_market_apy(
  p_grade numeric,p_position text,p_age integer,p_variance numeric DEFAULT 1)
RETURNS bigint LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $market$
DECLARE
  v_grade numeric:=greatest(70,least(99,p_grade));
  v_grades numeric[]:=array[70,75,78,80,82,84,86,88,90,93,96,99];
  v_salaries numeric[]:=array[3000000,6000000,11000000,16000000,22000000,
    30000000,38000000,43000000,48000000,55000000,63000000,68000000];
  v_base numeric:=68000000;v_position numeric;v_age numeric:=1;v_i integer;
BEGIN
  FOR v_i IN 2..array_length(v_grades,1) LOOP
    IF v_grade<=v_grades[v_i] THEN
      v_base:=v_salaries[v_i-1]+(v_grade-v_grades[v_i-1])
        *(v_salaries[v_i]-v_salaries[v_i-1])
        /(v_grades[v_i]-v_grades[v_i-1]);
      EXIT;
    END IF;
  END LOOP;
  v_position:=CASE p_position WHEN 'C' THEN 1.03 WHEN 'SF' THEN 1.02
    WHEN 'SG' THEN .98 ELSE 1 END;
  IF p_age IS NOT NULL THEN
    v_age:=CASE WHEN p_age>=40 THEN .50 WHEN p_age>=37 THEN .62
      WHEN p_age>=35 THEN .75 WHEN p_age>=33 THEN .86
      WHEN p_age>=31 THEN .94 WHEN p_age<=22 THEN 1.02 ELSE 1 END;
  END IF;
  RETURN greatest(2500000,
    round(v_base*v_position*v_age*greatest(.8,least(1.2,p_variance))/500000)
      *500000)::bigint;
END;
$market$;
REVOKE ALL ON FUNCTION private.nba_gm_v11_market_apy(numeric,text,integer,numeric)
  FROM public,anon,authenticated;

-- NFL-style forward-looking reservation: forecast ability independently
-- without revealing a user's future seed or anchoring to their old salary.
CREATE OR REPLACE FUNCTION private.nba_gm_v11_forecast_grade(p_id text)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $grade$
DECLARE v private.nba_gm_dev_players%rowtype;
  v_odds jsonb;v_up numeric;v_ceiling numeric;v_loss numeric;v_expected numeric;
BEGIN
  SELECT * INTO v FROM private.nba_gm_dev_players WHERE id=p_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Unknown NBA GM player';END IF;
  IF v.development_profile IS NULL THEN RETURN v.overall;END IF;
  v_odds:=private.nba_gm_v4_odds('{}'::jsonb,p_id,1,v.overall);
  v_ceiling:=least(99,v.overall+
    (v.development_profile->>'careerHeadroom')::numeric);
  v_up:=least((v.development_profile->>'maxAnnualGain')::numeric,
    greatest(0,v_ceiling-v.overall));
  v_loss:=(v.development_profile->>'maxAnnualLoss')::numeric;
  v_expected:=v.overall
    +(v_odds->>'breakoutPct')::numeric/100*(v_up*.78)
    +(v_odds->>'improvePct')::numeric/100*least(v_up*.62,1.35)
    -(v_odds->>'declinePct')::numeric/100*(v_loss*.60);
  RETURN round(greatest(58,least(v_ceiling,v_expected)),2);
END;
$grade$;
REVOKE ALL ON FUNCTION private.nba_gm_v11_forecast_grade(text)
  FROM public,anon,authenticated;

-- Patch in place: ALL existing calls to v4_salary (cap, draft, trades,
-- free agents, catalogs and development) share ONE authoritative model.
-- Legacy code remains byte-for-byte unchanged outside the version gate.
DO $nba_market_patch$
DECLARE v_def text;v_risk text;v_action text;
BEGIN
  SELECT pg_get_functiondef('private.nba_gm_v4_salary(jsonb,text,integer)'::regprocedure)
    INTO v_def;
  IF v_def IS NULL OR position('v_start*(1.065)' IN v_def)=0
    OR position('v_grade numeric;v_age integer;v_multiplier numeric' IN v_def)>0 THEN
    RAISE EXCEPTION 'NBA V4 salary authority drift; refuse market patch';END IF;
  v_def:=replace(v_def,
    $old$v_delta numeric; v_factor numeric; v_pct numeric; v_market numeric;$old$,
    $new$v_delta numeric; v_factor numeric; v_pct numeric; v_market numeric;
  v_grade numeric;v_age integer;v_spread numeric;v_roll numeric;v_multiplier numeric:=1;$new$);
  IF position('v_grade numeric;v_age integer;v_spread numeric' IN v_def)=0 THEN
    RAISE EXCEPTION 'NBA V4 salary declaration drift';END IF;
  v_def:=replace(v_def,
    $old$  if p_year=1 or private.nba_gm_v4_contract(p_state,p_id)='3YR' then$old$,
    $new$  -- Only NEW V11 games use NFL-style independent market offers.
  IF p_state->>'economyVersion'='4'
    AND p_state->>'repriceModelVersion'='2'
    AND p_year>1
    AND private.nba_gm_v4_contract(p_state,p_id)='1YR' THEN
    v_age:=CASE WHEN v_player.verified_birth_date IS NULL THEN NULL ELSE
      extract(year from age(date '2026-10-30',v_player.verified_birth_date))::integer+1 END;
    IF coalesce(p_state->>'phase','draft') IN ('draft','year1') THEN
      v_grade:=private.nba_gm_v11_forecast_grade(p_id);
    ELSE
      v_grade:=private.nba_gm_v3_grade(p_state,p_id,2);
      IF p_state->>'developmentModelVersion'='2' THEN
        v_spread:=coalesce((v_player.development_profile->>'marketVariancePct')::numeric,0)/100;
        v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_id||':2:market'),1,8))
          ::bit(32)::int::bigint)%10000)::numeric/10000;
        v_multiplier:=1+(v_roll*2-1)*v_spread;
      END IF;
    END IF;
    RETURN private.nba_gm_v11_market_apy(v_grade,v_player.positions[1],
      v_age,v_multiplier);
  END IF;
  if p_year=1 or private.nba_gm_v4_contract(p_state,p_id)='3YR' then$new$);
  IF position('private.nba_gm_v11_market_apy(v_grade' IN v_def)=0 THEN
    RAISE EXCEPTION 'NBA V4 salary patch failed';END IF;

  SELECT pg_get_functiondef('private.nba_gm_v10_reprice_risk(jsonb,text)'::regprocedure)
    INTO v_risk;
  IF v_risk IS NULL OR position('v_start*1.065' IN v_risk)=0 THEN
    RAISE EXCEPTION 'NBA V4 risk authority drift';END IF;
  -- Reuse NFL's original absolute uplift/multiple thresholds for NEW games.
  v_risk:=replace(v_risk,
    $old$  -- Legacy fixtures retain the original V5 forecast and compatibility policy.$old$,
    $new$  IF p_state->>'economyVersion'='4'
     AND p_state->>'repriceModelVersion'='2' THEN
    IF private.nba_gm_v4_contract(p_state,p_id)='3YR' THEN RETURN 'LOCKED';END IF;
    SELECT provisional_average_salary INTO v_start FROM
      private.nba_gm_contract_candidates_2026_27 WHERE player_id=p_id;
    v_forecast:=private.nba_gm_v4_salary(p_state,p_id,2);
    IF v_forecast-v_start>=20000000 OR v_forecast::numeric/greatest(1,v_start)>=4
      THEN RETURN 'HIGH';END IF;
    IF v_forecast-v_start>=8000000 OR v_forecast::numeric/greatest(1,v_start)>=2
      THEN RETURN 'MEDIUM';END IF;
    RETURN 'LOW';
  END IF;
  -- Legacy fixtures retain the original V5 forecast and compatibility policy.$new$);
  IF position('v_forecast-v_start>=20000000' IN v_risk)=0 THEN
    RAISE EXCEPTION 'NBA V4 risk patch failed';END IF;

  SELECT pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
    INTO v_action;
  IF v_action IS NULL
    OR position($old$'simulationModelVersion',9,'playoffScoringVersion',2,'phase','draft'$old$ IN v_action)=0
    OR position('repriceModelVersion' IN v_action)>0 THEN
    RAISE EXCEPTION 'NBA GM new-game creation drift; refuse opt-in';END IF;
  v_action:=replace(v_action,
    $old$'simulationModelVersion',9,'playoffScoringVersion',2,'phase','draft'$old$,
    $new$'simulationModelVersion',9,'playoffScoringVersion',2,'repriceModelVersion',2,'phase','draft'$new$);

  EXECUTE v_def;
  EXECUTE v_risk;
  EXECUTE v_action;
END;
$nba_market_patch$;
