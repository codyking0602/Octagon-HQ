-- Promote the already owner-playtested Oct 29 Bar Trivia board, intact, as the
-- first public NBA Daily. Oct 29-31 is ONE introductory 72-hour window.
-- Nov 1 resumes the previously locked NBA every-48h cadence opposite UFC.
-- Original immutable private QA records stay unchanged. The official score is
-- copied from the certified server-graded attempt, not recalculated or invented.
DO $preflight$
DECLARE v_daily private.daily_challenges; v_score integer; v_count integer;
BEGIN
  SELECT * INTO v_daily FROM private.daily_challenges
  WHERE central_day = date '2026-10-29'
    AND schedule_version = 'nba-daily-owner-prelaunch-v1';
  -- Local migration replay can contain seeded profiles or older Daily
  -- records without the real October 29 player-specific result. In that case
  -- install the calendar only. Production's immutable 81/100 source is
  -- independently verified immediately before and after deployment.
  IF v_daily.id IS NULL THEN
    RAISE NOTICE 'No saved Oct 29 preview board; install schedule only';
    RETURN;
  END IF;
  IF v_daily.game_type <> 'bar_trivia'
    OR v_daily.setup_id IS NULL OR v_daily.content_version <> 'nba-bar-trivia-server-v1'
  THEN RAISE EXCEPTION 'Oct 29 canonical prelaunch Bar Trivia changed'; END IF;

  SELECT count(*),max(normalized_score) INTO v_count,v_score
  FROM private.daily_challenge_attempts
  WHERE daily_challenge_id=v_daily.id AND attempt_kind='official_first';
  IF v_count <> 1 OR v_score <> 81 THEN
    RAISE EXCEPTION 'Oct 29 saved owner 81/100 must remain intact before launch';
  END IF;

  IF EXISTS (SELECT 1 FROM private.daily_challenges d
    JOIN private.daily_challenge_schedule_versions s ON s.version=d.schedule_version
    WHERE s.sport='nba' AND d.central_day BETWEEN date '2026-10-29' AND date '2026-10-31')
  THEN RAISE EXCEPTION 'Public NBA Daily already published for launch window'; END IF;

  IF private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
       <> 'nba-daily-regular-v3-oct30-public'
    OR private.daily_challenge_expected_game('nba-daily-regular-v3-oct30-public',
       date '2026-11-01') <> 'sports_feud'
  THEN RAISE EXCEPTION 'Locked Nov 1 NBA cadence changed; do not overwrite'; END IF;
END $preflight$;

INSERT INTO private.daily_challenge_schedule_versions
(version,time_zone,anchor_day,starts_on,game_cycle,sport)
VALUES ('nba-daily-launch-oct29-bar-trivia-v1','America/Chicago',
        date '2026-10-29',date '2026-10-29',ARRAY['bar_trivia']::text[],'nba')
ON CONFLICT (version) DO NOTHING;

CREATE OR REPLACE FUNCTION private.daily_challenge_active_day(p_day date,p_sport text)
RETURNS date LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $body$
BEGIN
  IF p_sport='nba' THEN
    IF p_day BETWEEN date '2026-10-29' AND date '2026-10-31' THEN
      RETURN date '2026-10-29';
    ELSIF p_day >= date '2026-11-01' THEN
      RETURN date '2026-11-01' + ((p_day - date '2026-11-01') / 2) * 2;
    END IF;
    RETURN date '2026-10-30' + ((p_day - date '2026-10-30') / 2) * 2;
  END IF;
  IF p_sport='ufc' AND p_day >= date '2026-10-25' THEN
    RETURN date '2026-10-25' + ((p_day - date '2026-10-25') / 2) * 2;
  END IF;
  IF p_sport IN ('football','ufc') THEN RETURN p_day; END IF;
  RAISE EXCEPTION 'unsupported Daily cadence sport %',p_sport;
END $body$;

CREATE OR REPLACE FUNCTION private.daily_challenge_schedule_for_day(p_day date,p_sport text)
RETURNS text LANGUAGE plpgsql STABLE SET search_path='' AS $body$
DECLARE v_version text;
BEGIN
  IF p_sport IS NULL OR p_sport NOT IN ('ufc','football','nba','nba_preview') THEN
    RAISE EXCEPTION 'unsupported Daily Challenge sport %',coalesce(p_sport,'<null>');
  END IF;
  IF p_sport='nba' AND p_day BETWEEN date '2026-10-29' AND date '2026-10-31' THEN
    RETURN 'nba-daily-launch-oct29-bar-trivia-v1';
  END IF;
  IF p_sport='nba' AND p_day BETWEEN date '2026-11-01' AND date '2027-04-11' THEN
    RETURN 'nba-daily-regular-v3-oct30-public';
  END IF;
  SELECT s.version INTO v_version
  FROM private.daily_challenge_schedule_versions s
  WHERE s.sport=p_sport AND s.starts_on<=p_day
  ORDER BY s.starts_on DESC,s.created_at DESC,s.version DESC LIMIT 1;
  RETURN v_version;
END $body$;

-- Preserve existing security-definer code, permissions and all non-NBA paths.
-- Refuse to patch functions whose current locked contracts have drifted.
DO $patch$
DECLARE v_sig text; v_reg regprocedure; v_before text; v_after text;
        v_start int; v_end int;
BEGIN
  v_reg := 'public.get_daily_challenge_materialization_request(text,timestamp with time zone)'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('v_today < date ''2026-10-30''' in v_before)=0 THEN
    RAISE EXCEPTION 'NBA materialization release gate changed';
  END IF;
  EXECUTE replace(v_before,'v_today < date ''2026-10-30''',
     'v_today < date ''2026-10-29''');

  v_reg := 'private.enforce_future_daily_publication_cadence()'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('(v_sport = ''nba'' and new.central_day >= date ''2026-10-30'')' in v_before)=0
  THEN RAISE EXCEPTION 'NBA publication guard changed'; END IF;
  EXECUTE replace(v_before,
     '(v_sport = ''nba'' and new.central_day >= date ''2026-10-30'')',
     '(v_sport = ''nba'' and new.central_day >= date ''2026-10-29'')');

  -- Daily standings, wins and streaks count the copied, verified first attempt
  -- as official while leaving all prior private QA records intact.
  v_reg := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('then (central_day - date ''2026-10-30'') / 2' in v_before)=0
    OR position('  expected_days as (' in v_before)=0
  THEN RAISE EXCEPTION 'NBA standings cadence contract changed'; END IF;
  v_after := replace(v_before,
    'then (central_day - date ''2026-10-30'') / 2',
    'then case when central_day = date ''2026-10-29'' then 0 else 1 + (central_day - date ''2026-11-01'') / 2 end');
  v_start := strpos(v_after,'  expected_days as (');
  v_start := v_start + strpos(substring(v_after from v_start),'case when p_sport = ''nba'' then') - 1;
  v_end := v_start + strpos(substring(v_after from v_start),'when p_sport = ''ufc''') - 1;
  IF v_start <= 0 OR v_end <= v_start THEN
    RAISE EXCEPTION 'NBA expected streak day block changed';
  END IF;
  v_after := substring(v_after from 1 for v_start - 1) ||
    'case when p_sport = ''nba'' then
        case when exists (
          select 1 from history
          where history.profile_id = profile.id
            and history.central_day = private.daily_challenge_active_day(v_today,''nba'')
        ) then private.daily_challenge_active_day(v_today,''nba'')
          when private.daily_challenge_active_day(v_today,''nba'') = date ''2026-11-01''
          then date ''2026-10-29''
          else private.daily_challenge_active_day(v_today,''nba'') - 2
        end
      ' ||
    substring(v_after from v_end);
  EXECUTE v_after;

  -- Oct 31 closing reminder goes with the 72-hour Bar Trivia launch.
  -- Beginning Nov 2, reminders resume every other evening as before.
  FOREACH v_sig IN ARRAY ARRAY[
    'private.publish_combined_daily_closing_reminder(uuid,text,text,text,text,text,timestamp with time zone)',
    'public.dispatch_due_nba_notifications(timestamp with time zone)'
  ] LOOP
    v_reg := to_regprocedure(v_sig);
    IF v_reg IS NULL THEN RAISE EXCEPTION 'Missing daily reminder routine: %',v_sig; END IF;
    v_before := pg_get_functiondef(v_reg::oid);
    IF position('v_day >= date ''2026-10-31''' in v_before)=0
      OR position('(v_day - date ''2026-10-30'') % 2 = 1' in v_before)=0
      OR position('v_start := v_day - 1;' in v_before)=0
        AND position('v_nba_start_day := v_day - 1;' in v_before)=0
    THEN RAISE EXCEPTION 'NBA reminder contract changed: %',v_sig; END IF;
    v_after := replace(v_before,
      '(v_day - date ''2026-10-30'') % 2 = 1',
      '(v_day = date ''2026-10-31'' OR (v_day >= date ''2026-11-02'' AND (v_day - date ''2026-11-01'') % 2 = 1))');
    v_after := replace(v_after,'v_start := v_day - 1;',
      'v_start := case when v_day = date ''2026-10-31'' then date ''2026-10-29'' else v_day - 1 end;');
    v_after := replace(v_after,'v_nba_start_day := v_day - 1;',
      'v_nba_start_day := case when v_day = date ''2026-10-31'' then date ''2026-10-29'' else v_day - 1 end;');
    v_after := replace(v_after,
      'schedule.version = ''nba-daily-regular-v3-oct30-public''',
      'schedule.version IN (''nba-daily-regular-v3-oct30-public'',''nba-daily-launch-oct29-bar-trivia-v1'')');
    IF v_sig LIKE '%dispatch_due_nba_notifications%' THEN
      v_after := replace(v_after,'v_day < date ''2026-10-30''',
        'v_day < date ''2026-10-29''');
    END IF;
    EXECUTE v_after;
  END LOOP;

  -- Retire owner-only Oct 29 prelaunch materialization. The immutable
  -- private record remains safely archived without new private submissions.
  v_reg := 'public.get_nba_owner_prelaunch_materialization_request()'::regprocedure;
  v_before := pg_get_functiondef(v_reg::oid);
  IF position('v_day >= date ''2026-11-01''' in v_before)=0 THEN
    RAISE EXCEPTION 'Owner preview materialization guard changed';
  END IF;
  EXECUTE replace(v_before,
    'v_day >= date ''2026-11-01''','v_day >= date ''2026-10-29''');
END $patch$;

-- The underlying generalized Daily publication and its attempts are immutable.
-- Publish an OFFICIAL instance referencing the IDENTICAL verified setup.
-- Copy the one server-graded 81/100 first attempt and progress without changing
-- any original private QA record, original authored question, or scoring evidence.
-- The private origin stays available for audit; the official clone is the only
-- instance counted by NBA public leaderboards/history/season totals.
DO $carryover$
DECLARE v_source private.daily_challenges; v_public_id uuid := gen_random_uuid();
        v_copied integer;
BEGIN
  SELECT * INTO v_source FROM private.daily_challenges
  WHERE central_day=date '2026-10-29'
    AND schedule_version='nba-daily-owner-prelaunch-v1'
    AND game_type='bar_trivia';
  IF v_source.id IS NULL THEN RETURN; END IF;

  INSERT INTO private.daily_challenges
  (id,central_day,schedule_version,game_type,setup_id,content_version,
   scoring_version,fallback_reason,published_at)
  SELECT v_public_id,central_day,'nba-daily-launch-oct29-bar-trivia-v1',
         game_type,setup_id,content_version,scoring_version,fallback_reason,published_at
  FROM private.daily_challenges WHERE id=v_source.id;

  INSERT INTO private.daily_challenge_progress
  (daily_challenge_id,profile_id,revision,submission_state,public_state,started_at,updated_at)
  SELECT v_public_id,profile_id,revision,submission_state,public_state,started_at,updated_at
  FROM private.daily_challenge_progress WHERE daily_challenge_id=v_source.id;
  GET DIAGNOSTICS v_copied = ROW_COUNT;
  IF v_copied <> 1 THEN RAISE EXCEPTION 'Owner saved gameplay progress must copy exactly once'; END IF;

  INSERT INTO private.daily_challenge_attempts
  (id,daily_challenge_id,profile_id,attempt_kind,native_score,normalized_score,
   completed_at,content_version,scoring_version,public_result,
   submission_evidence,grading_evidence_snapshot,legacy_find_leader_day,created_at)
  SELECT gen_random_uuid(),v_public_id,profile_id,attempt_kind,native_score,normalized_score,
         completed_at,content_version,scoring_version,public_result,
         submission_evidence,grading_evidence_snapshot,legacy_find_leader_day,created_at
  FROM private.daily_challenge_attempts
  WHERE daily_challenge_id=v_source.id AND attempt_kind='official_first';
  GET DIAGNOSTICS v_copied = ROW_COUNT;
  IF v_copied <> 1 THEN RAISE EXCEPTION 'Owner server-graded 81/100 attempt must copy exactly once'; END IF;
END $carryover$;

DO $verify$
DECLARE v_daily uuid;
BEGIN
  SELECT id INTO v_daily FROM private.daily_challenges
  WHERE central_day=date '2026-10-29'
  AND schedule_version='nba-daily-launch-oct29-bar-trivia-v1';
  IF v_daily IS NULL THEN
    IF NOT EXISTS (SELECT 1 FROM private.daily_challenges
      WHERE central_day=date '2026-10-29'
        AND schedule_version='nba-daily-owner-prelaunch-v1')
    THEN RETURN; END IF;
    RAISE EXCEPTION 'Saved source exists but public Oct 29 Bar Trivia was not published';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM private.daily_challenge_history h
    WHERE h.daily_challenge_id=v_daily AND h.normalized_score=81
      AND h.game_type='bar_trivia'
  ) THEN RAISE EXCEPTION 'Owner 81 score missing from official history'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM private.daily_challenges source
      JOIN private.daily_challenges official ON official.setup_id=source.setup_id
    WHERE source.central_day=date '2026-10-29'
      AND source.schedule_version='nba-daily-owner-prelaunch-v1'
      AND official.id=v_daily
      AND source.game_type=official.game_type
      AND source.content_version=official.content_version
  ) THEN RAISE EXCEPTION 'Official board differs from certified owner source'; END IF;
  IF private.daily_challenge_active_day(date '2026-10-29','nba') <> date '2026-10-29'
     OR private.daily_challenge_active_day(date '2026-10-30','nba') <> date '2026-10-29'
     OR private.daily_challenge_active_day(date '2026-10-31','nba') <> date '2026-10-29'
     OR private.daily_challenge_active_day(date '2026-11-01','nba') <> date '2026-11-01'
     OR private.daily_challenge_active_day(date '2026-11-02','nba') <> date '2026-11-01'
     OR private.daily_challenge_active_day(date '2026-11-03','nba') <> date '2026-11-03'
  THEN RAISE EXCEPTION 'NBA inaugural and subsequent 48-hour cadence invalid'; END IF;
  IF private.daily_challenge_schedule_for_day(date '2026-10-29','nba')
       <> 'nba-daily-launch-oct29-bar-trivia-v1'
     OR private.daily_challenge_expected_game('nba-daily-launch-oct29-bar-trivia-v1',
       date '2026-10-29') <> 'bar_trivia'
     OR private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
       <> 'nba-daily-regular-v3-oct30-public'
  THEN RAISE EXCEPTION 'Public NBA schedule contract invalid'; END IF;
END $verify$;
