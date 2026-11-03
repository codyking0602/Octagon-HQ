-- Public NBA GM launch and versioned V8 ratings/GM-score calibration.
-- All prior saved simulations, final grades and unrelated NBA preview gates are immutable.
-- Only authenticated members can use the existing private, per-profile server-owned runtime.

DO $nba_gm_v8$
DECLARE
  v_def text;
  v_old text;
  v_new text;
  v_name text;
  v_signature regprocedure;
BEGIN
  -- Clone V7 to V8 rather than replacing existing run math.
  SELECT pg_get_functiondef('private.nba_gm_v7_season(jsonb,integer)'::regprocedure) INTO v_def;
  IF position('private.nba_gm_v7_season' IN v_def)=0
    OR position('v_def:=greatest(-9.0,least(6.25,v_def));' IN v_def)=0
    OR position('v_off_grade:=greatest(60,least(99,round(60+39*v_below_off::numeric/150)::integer));' IN v_def)=0
    OR position('v_def_grade:=greatest(60,least(99,round(60+39*v_below_def::numeric/150)::integer));' IN v_def)=0
    OR position('simulationModelVersion' IN v_def)=0 THEN
    RAISE EXCEPTION 'V7 NBA simulation drifted; refusing V8 calibration';
  END IF;
  v_def:=replace(v_def,'private.nba_gm_v7_season','private.nba_gm_v8_season');
  v_def:=replace(v_def,'simulationModelVersion' || chr(39) || ' is distinct from ' || chr(39) || '7' || chr(39),
    'simulationModelVersion' || chr(39) || ' is distinct from ' || chr(39) || '8' || chr(39));
  IF position('simulationModelVersion' || chr(39) || ' is distinct from ' || chr(39) || '8' || chr(39) IN v_def)=0 THEN
    RAISE EXCEPTION 'V8 simulation version guard missing';
  END IF;
  -- Cap-adjusted weak-link calibration: an elite stopper cannot cancel two
  -- vulnerable starters. Starter-only defensive indices, not public scouting labels.
  v_def:=replace(v_def,'v_front numeric:=0;v_perim_sum numeric:=0;v_perim_count integer:=0;',
    'v_front numeric:=0;v_perim_sum numeric:=0;v_perim_count integer:=0;
    v_def_weakest numeric:=999;v_def_second numeric:=999;');
  v_def:=replace(v_def,'-- Independently graded side-specific impact; no overall baseline.',
    'if v_slot not in (' || chr(39) || 'GUARD' || chr(39) || ',' || chr(39) || 'BIG' || chr(39) || ') then
      if v_def_index<v_def_weakest then
        v_def_second:=v_def_weakest;v_def_weakest:=v_def_index;
      elsif v_def_index<v_def_second then v_def_second:=v_def_index;end if;
    end if;
    -- Independently graded side-specific impact; no overall baseline.');
  v_def:=replace(v_def,'v_def:=greatest(-9.0,least(6.25,v_def));',
    'v_def:=greatest(-9.0,least(6.25,v_def
      -least(2.2,greatest(0,80-v_def_weakest)*.23
          +greatest(0,80-v_def_second)*.12)));');
  -- Historic five-year cohort: season-centered real NBA efficiency. Zero = league
  -- average (grade 85); 95th percentile ≈ +4.5–4.9 points/100 (grade 93–94).
  -- This measures magnitude rather than awarding a near-99 at every high percentile.
  v_def:=replace(v_def,
    'v_off_grade:=greatest(60,least(99,round(60+39*v_below_off::numeric/150)::integer));',
    'v_off_grade:=greatest(60,least(99,round(85+1.75*v_off)::integer));');
  v_def:=replace(v_def,
    'v_def_grade:=greatest(60,least(99,round(60+39*v_below_def::numeric/150)::integer));',
    'v_def_grade:=greatest(60,least(99,round(85+1.75*v_def)::integer));');
  EXECUTE v_def;

  -- Existing season dispatcher remains backward compatible for V7/V6/V5.
  SELECT pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure) INTO v_def;
  v_old:='if p_state->>' || chr(39) || 'economyVersion' || chr(39) || '=' || chr(39) || '4' || chr(39)
    || ' and p_state->>' || chr(39) || 'simulationModelVersion' || chr(39) || '=' || chr(39) || '7' || chr(39) || ' then';
  v_new:='if p_state->>' || chr(39) || 'economyVersion' || chr(39) || '=' || chr(39) || '4' || chr(39)
    || ' and p_state->>' || chr(39) || 'simulationModelVersion' || chr(39) || '=' || chr(39) || '8' || chr(39)
    || ' then
    return private.nba_gm_v8_season(p_state,p_year);
  end if;
  ' || v_old;
  IF position(v_old IN v_def)=0 OR position('nba_gm_v8_season' IN v_def)>0 THEN
    RAISE EXCEPTION 'NBA V7 router drifted; refusing V8 routing';
  END IF;
  EXECUTE replace(v_def,v_old,v_new);

  -- New complete franchises use team strength, rather than unrelated averages
  -- of individual player grades, for the 90% roster component. 3% wins and 7%
  -- postseason outcomes retain the audited NFL-compatible weighting.
  CREATE OR REPLACE FUNCTION private.nba_gm_v8_final_score(p_state jsonb)
  RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $score$
  DECLARE
    v_roster numeric:=0;v_record numeric:=0;v_playoff numeric:=0;v_finish text;
    v_year integer;v_overall numeric;v_score numeric;
  BEGIN
    IF p_state->>'simulationModelVersion'<>'8'
      OR jsonb_array_length(coalesce(p_state->'results','[]'::jsonb))<>3
      OR jsonb_array_length(coalesce(p_state->'picks','[]'::jsonb))<>7 THEN
      RAISE EXCEPTION 'V8 final score requires a complete calibrated franchise';
    END IF;
    FOR v_year IN 1..3 LOOP
      v_overall:=(p_state->'results'->(v_year-1)->>'teamOverall')::numeric;
      IF v_overall IS NULL OR v_overall NOT BETWEEN 70 AND 99 THEN
        RAISE EXCEPTION 'V8 season team OVR missing';
      END IF;
      v_roster:=v_roster+v_overall;
      v_record:=v_record+(p_state->'results'->(v_year-1)->>'wins')::numeric;
      v_finish:=p_state->'results'->(v_year-1)->>'finish';
      v_playoff:=v_playoff+CASE v_finish
        WHEN 'Champion' THEN 100 WHEN 'Finals' THEN 95
        WHEN 'Conference Finals' THEN 89 WHEN 'Conference Semifinals' THEN 80
        WHEN 'First Round' THEN 68 WHEN 'Missed Playoffs' THEN 25
        ELSE 0 END;
    END LOOP;
    v_roster:=round(v_roster/3,1);
    v_record:=round(60+40*v_record/(82*3),1);
    v_playoff:=round(v_playoff/3,1);
    v_score:=round(v_roster*.90+v_record*.03+v_playoff*.07,1);
    RETURN jsonb_build_object('score',v_score,'roster',v_roster,
      'regularSeason',v_record,'playoffs',v_playoff,
      'weights',jsonb_build_array(.90,.03,.07));
  END;
  $score$;
  REVOKE ALL ON FUNCTION private.nba_gm_v8_final_score(jsonb) FROM public,anon,authenticated;
  REVOKE ALL ON FUNCTION private.nba_gm_v8_season(jsonb,integer) FROM public,anon,authenticated;

  SELECT pg_get_functiondef('private.nba_gm_v3_final_score(jsonb)'::regprocedure) INTO v_def;
  v_old:='begin' || chr(10) || ' if jsonb_array_length(p_state->' || chr(39) || 'results' || chr(39) || ')<>3';
  v_new:='begin' || chr(10) || ' if p_state->>' || chr(39) || 'simulationModelVersion' || chr(39)
    || '=' || chr(39) || '8' || chr(39) || ' then
   return private.nba_gm_v8_final_score(p_state);
 end if;
 if jsonb_array_length(p_state->' || chr(39) || 'results' || chr(39) || ')<>3';
  IF position(v_old IN v_def)=0 OR position('nba_gm_v8_final_score' IN v_def)>0 THEN
    RAISE EXCEPTION 'NBA scoring router drifted; refusing V8 final grading';
  END IF;
  EXECUTE replace(v_def,v_old,v_new);

  -- Public launch is explicitly limited to three NBA GM RPCs. All other NBA
  -- owner previews, pick-control functions, private tables, and policies stay gated.
  FOREACH v_name IN ARRAY ARRAY['nba_gm_dev_catalog','nba_gm_dev_action','nba_gm_dev_trade_offers'] LOOP
    v_signature:=CASE v_name
      WHEN 'nba_gm_dev_catalog' THEN 'public.nba_gm_dev_catalog()'::regprocedure
      WHEN 'nba_gm_dev_action' THEN 'public.nba_gm_dev_action(text,text,text)'::regprocedure
      ELSE 'public.nba_gm_dev_trade_offers(text)'::regprocedure END;
    SELECT pg_get_functiondef(v_signature) INTO v_def;
    IF position('private.nba_gm_dev_owner()' IN v_def)=0
      OR position('auth.uid()' IN v_def)=0 THEN
      RAISE EXCEPTION 'NBA GM % access guard drifted; refusing public release',v_name;
    END IF;
    v_def:=replace(v_def,'private.nba_gm_dev_owner()','(auth.uid() is not null)');
    v_def:=replace(v_def,'NBA GM playtest access required','NBA GM sign-in required');
    IF v_name='nba_gm_dev_action' THEN
      v_old:='''simulationModelVersion'',7';
      v_new:='''simulationModelVersion'',8';
      IF position(v_old IN v_def)=0 THEN
        RAISE EXCEPTION 'NBA GM start version drifted; refusing public release';
      END IF;
      v_def:=replace(v_def,v_old,v_new);
    END IF;
    EXECUTE v_def;
  END LOOP;
END;
$nba_gm_v8$;

-- RPCs stay authenticated only; individual franchises and revision snapshots
-- remain server-owned and scoped by auth.uid() throughout existing functions.
REVOKE ALL ON FUNCTION public.nba_gm_dev_catalog() FROM public,anon;
REVOKE ALL ON FUNCTION public.nba_gm_dev_action(text,text,text) FROM public,anon;
REVOKE ALL ON FUNCTION public.nba_gm_dev_trade_offers(text) FROM public,anon;
GRANT EXECUTE ON FUNCTION public.nba_gm_dev_catalog() TO authenticated;
GRANT EXECUTE ON FUNCTION public.nba_gm_dev_action(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.nba_gm_dev_trade_offers(text) TO authenticated;
