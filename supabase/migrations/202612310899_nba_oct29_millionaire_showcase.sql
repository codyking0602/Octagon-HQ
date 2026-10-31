-- Owner-approved Oct 29–31 NBA Millionaire showcase (host 3).
-- New immutable daily identity; archive the original launch Bar Trivia board
-- and its player submissions without deleting or mutating historic records.
-- Nov 1+ every-other-day NBA rotation and all other sports remain unchanged.

INSERT INTO private.daily_challenge_schedule_versions
 (version,time_zone,anchor_day,starts_on,game_cycle,sport)
VALUES
 ('nba-daily-oct29-millionaire-showcase-v1','America/Chicago',
  date '2026-10-29',date '2026-10-29',ARRAY['millionaire']::text[],'nba')
ON CONFLICT (version) DO NOTHING;

DO $switch$
DECLARE v_reg regprocedure; v_before text; v_after text;
BEGIN
  v_reg := 'private.daily_challenge_schedule_for_day(date,text)'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('RETURN ''nba-daily-launch-oct29-bar-trivia-v1'';' IN v_before) = 0
    OR position('RETURN ''nba-daily-regular-v3-oct30-public'';' IN v_before) = 0
  THEN RAISE EXCEPTION 'NBA introductory publication contract has drifted'; END IF;
  v_after := replace(v_before,
    'RETURN ''nba-daily-launch-oct29-bar-trivia-v1'';',
    'RETURN ''nba-daily-oct29-millionaire-showcase-v1'';');
  EXECUTE v_after;

  -- Keep old immutable Bar Trivia attempts available to admins/audits but
  -- exclude them from active NBA totals and history. Current leaderboard
  -- points to the new empty Millionaire daily ID: Cody and Shane replay fresh.
  FOREACH v_reg IN ARRAY ARRAY[
    'public.get_daily_challenge_standings(text)'::regprocedure,
    'public.list_my_daily_challenge_history(text)'::regprocedure,
    'public.list_member_daily_challenge_history(text,text)'::regprocedure
  ] LOOP
    v_before := pg_get_functiondef(v_reg::oid);
    IF position('schedule.sport = p_sport' IN v_before) = 0
      OR position('source.schedule_version <> ''nba-daily-launch-oct29-bar-trivia-v1''' IN v_before) > 0
    THEN RAISE EXCEPTION 'NBA history function contract has drifted: %',v_reg; END IF;
    v_after := replace(v_before,
      'schedule.sport = p_sport',
      'schedule.sport = p_sport AND (p_sport <> ''nba'' OR source.schedule_version <> ''nba-daily-launch-oct29-bar-trivia-v1'')');
    EXECUTE v_after;
  END LOOP;

  v_reg := 'public.get_my_daily_challenge_streak(text)'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('and s.sport=p_sport' IN v_before) = 0
    OR position('h.schedule_version<>''nba-daily-launch-oct29-bar-trivia-v1''' IN v_before) > 0
  THEN RAISE EXCEPTION 'NBA streak function contract has drifted'; END IF;
  EXECUTE replace(v_before,'and s.sport=p_sport',
    'and s.sport=p_sport and (p_sport<>''nba'' or h.schedule_version<>''nba-daily-launch-oct29-bar-trivia-v1'')');
END $switch$;

DO $verify$
BEGIN
  IF private.daily_challenge_schedule_for_day(date '2026-10-29','nba')
       <> 'nba-daily-oct29-millionaire-showcase-v1'
    OR private.daily_challenge_schedule_for_day(date '2026-10-31','nba')
       <> 'nba-daily-oct29-millionaire-showcase-v1'
    OR private.daily_challenge_expected_game('nba-daily-oct29-millionaire-showcase-v1',date '2026-10-29')
       <> 'millionaire'
    OR private.daily_challenge_active_day(date '2026-10-30','nba') <> date '2026-10-29'
    OR private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
       <> 'nba-daily-regular-v3-oct30-public'
    OR private.daily_challenge_expected_game('nba-daily-regular-v3-oct30-public',date '2026-11-01')
       <> 'sports_feud'
  THEN RAISE EXCEPTION 'NBA Millionaire showcase date/cadence verification failed'; END IF;
  IF EXISTS (
    SELECT 1 FROM private.daily_challenges d
    WHERE d.central_day=date '2026-10-29'
      AND d.schedule_version='nba-daily-oct29-millionaire-showcase-v1'
      AND d.game_type<>'millionaire'
  ) THEN RAISE EXCEPTION 'NBA showcase identity conflicts with existing publication'; END IF;
END $verify$;
