-- STAGED NBA 2026 public Daily launch. Oct 30 first board; every 48h opposite UFC.
-- Does not touch UFC/Football schedules or earlier owner-only rehearsal results.
-- Must remain unmerged until exact-head verification and owner's GO LIVE authorization.
-- On deployment: backend first, frontend/Edge next, manual push only after live verification.
DO $preflight$
BEGIN
  IF EXISTS (
    SELECT 1 FROM private.daily_challenges d
    JOIN private.daily_challenge_schedule_versions s ON s.version=d.schedule_version
    WHERE s.sport='nba' AND d.central_day >= date '2026-10-30'
  ) THEN
    RAISE EXCEPTION 'NBA public cutover refused: official NBA board already published';
  END IF;
  IF private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
      <> 'nba-daily-regular-v2-locked' THEN
    RAISE EXCEPTION 'NBA locked schedule changed: re-audit before early public launch';
  END IF;
END $preflight$;

INSERT INTO private.daily_challenge_schedule_versions
 (version,time_zone,anchor_day,starts_on,game_cycle,sport)
VALUES ('nba-daily-regular-v3-oct30-public','America/Chicago',
 date '2026-10-30',date '2026-10-30',array[
    'average_fan',
    'sports_feud',
    'who_am_i',
    'millionaire',
    'hit_the_number',
    'find_leader',
    'wavelength',
    'sports_feud',
    'average_fan',
    'higher_lower',
    'bar_trivia',
    'millionaire',
    'who_am_i',
    'find_leader',
    'average_fan',
    'wavelength',
    'sports_feud',
    'bar_trivia',
    'hit_the_number',
    'millionaire',
    'who_am_i',
    'average_fan',
    'sports_feud',
    'higher_lower',
    'find_leader',
    'wavelength',
    'millionaire',
    'bar_trivia',
]::text[],'nba')
ON CONFLICT (version) DO NOTHING;

-- Special-case only the early NBA season; old schedule rows and owner previews stay intact.
CREATE OR REPLACE FUNCTION private.daily_challenge_schedule_for_day(p_day date,p_sport text)
RETURNS text LANGUAGE plpgsql STABLE SET search_path='' AS $fn$
DECLARE v_version text;
BEGIN
  IF p_sport IS NULL OR p_sport NOT IN ('ufc','football','nba','nba_preview') THEN
    RAISE EXCEPTION 'unsupported Daily Challenge sport %',coalesce(p_sport,'<null>');
  END IF;
  IF p_sport='nba' AND p_day BETWEEN date '2026-10-30' AND date '2027-04-11' THEN
    RETURN 'nba-daily-regular-v3-oct30-public';
  END IF;
  SELECT s.version INTO v_version
  FROM private.daily_challenge_schedule_versions s
  WHERE s.sport=p_sport AND s.starts_on<=p_day
  ORDER BY s.starts_on DESC,s.created_at DESC,s.version DESC LIMIT 1;
  RETURN v_version;
END $fn$;

-- Update only NBA date anchors in current live routines, with fail-closed
-- guards: refuse release if a previous main migration changed their contracts.
-- pg_get_functiondef preserves the existing non-NBA logic and grants.
DO $patch$
DECLARE v_signature text; v_reg regprocedure; v_before text; v_after text;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'private.daily_challenge_active_day(date,text)',
    'private.enforce_future_daily_publication_cadence()',
    'public.get_daily_challenge_materialization_request(text,timestamp with time zone)',
    'public.get_daily_challenge_standings(text)',
    'private.publish_combined_daily_closing_reminder(uuid,text,text,text,text,text,timestamp with time zone)',
    'public.dispatch_due_nba_notifications(timestamp with time zone)'
  ] LOOP
    v_reg:=to_regprocedure(v_signature);
    IF v_reg IS NULL THEN RAISE EXCEPTION 'Missing NBA launch routine: %',v_signature; END IF;
    v_before:=pg_get_functiondef(v_reg::oid);
    IF position('2026-11-01' IN v_before)=0 THEN
      RAISE EXCEPTION 'NBA anchor contract changed: %',v_signature;
    END IF;
    v_after:=replace(v_before,'2026-11-01','2026-10-30');
    IF v_signature LIKE '%dispatch_due_nba_notifications%' THEN
      -- This automated dispatcher must NEVER send a duplicate launch push.
      -- The one-time launch announcement remains a separate verified owner action.
      IF position('if v_day = date ''2026-10-30''' IN lower(v_after))=0 THEN
        RAISE EXCEPTION 'NBA auto launch guard changed: %',v_signature;
      END IF;
      v_after:=replace(v_after,'if v_day = date ''2026-10-30''',
                                  'if false and v_day = date ''2026-10-30''');
    END IF;
    IF v_signature LIKE '%dispatch_due_nba_notifications%'
       OR v_signature LIKE '%publish_combined_daily_closing_reminder%' THEN
      -- The deployed reminders currently use v2, not the original v1.
      -- Require both the old version and final-day threshold before rewriting.
      IF position('''nba-daily-regular-v2-locked''' IN v_after)=0
         OR position('2026-11-02' IN v_after)=0 THEN
        RAISE EXCEPTION 'NBA closing reminder contract changed: %',v_signature;
      END IF;
      v_after:=replace(v_after,'''nba-daily-regular-v2-locked''',
                                   '''nba-daily-regular-v3-oct30-public''');
      -- Oct 30–31 is the first 48-hour slot; first 8pm close is Oct 31.
      v_after:=replace(v_after,'2026-11-02','2026-10-31');
    END IF;
    EXECUTE v_after;
  END LOOP;
END $patch$;

-- No changes to notification_nba_release_gate: remains false until verification.
-- No notification is sent by this migration.
DO $verify$
BEGIN
  IF private.daily_challenge_schedule_for_day(date '2026-10-30','nba')
     <> 'nba-daily-regular-v3-oct30-public'
     OR private.daily_challenge_expected_game('nba-daily-regular-v3-oct30-public',
                                              date '2026-10-30') <> 'average_fan'
     OR private.daily_challenge_active_day(date '2026-10-31','nba')
        <> date '2026-10-30' THEN
    RAISE EXCEPTION 'NBA early 48-hour Daily schedule contract invalid';
  END IF;
END $verify$;
