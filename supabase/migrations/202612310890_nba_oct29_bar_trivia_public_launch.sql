-- First public NBA Daily: reuse the fully server-graded Oct 29 Bar Trivia setup
-- and preserve the owner's 81/100 as an official first attempt.
-- Oct 29-31 is one extended launch board. Nov 1 resumes 48-hour cadence
-- (Nov 1, 3, 5...) opposite UFC (Oct 29, 31, Nov 2...).
-- The original preview board and attempt remain immutable for audit history.
DO $preflight$
DECLARE v_old private.daily_challenges; v_attempts int; v_progress int;
BEGIN
  SELECT * INTO v_old FROM private.daily_challenges
    WHERE central_day=date '2026-10-29'
      AND schedule_version='nba-daily-owner-prelaunch-v1';
  IF v_old.id IS NULL THEN
    -- Fresh local DBs have no production preview records. In an established
    -- environment that *does* have private previews, a missing launch board
    -- is a hard failure rather than silently generating replacement content.
    IF EXISTS (
      SELECT 1 FROM private.daily_challenges daily
      JOIN private.daily_challenge_schedule_versions schedule
        ON schedule.version=daily.schedule_version
      WHERE schedule.sport='nba_preview'
    ) THEN
      RAISE EXCEPTION 'Oct 29 verified Bar Trivia preview not found';
    END IF;
    RAISE NOTICE 'Fresh database has no historical preview board; scheduled opening will materialize.';
  ELSE
    IF v_old.game_type <> 'bar_trivia' OR v_old.fallback_reason IS NOT NULL THEN
      RAISE EXCEPTION 'Oct 29 reviewed Bar Trivia board changed';
    END IF;
    SELECT count(*) INTO v_attempts FROM private.daily_challenge_attempts
      WHERE daily_challenge_id=v_old.id AND attempt_kind='official_first'
        AND normalized_score=81 AND native_score=81;
    SELECT count(*) INTO v_progress FROM private.daily_challenge_progress
      WHERE daily_challenge_id=v_old.id;
    IF v_attempts <> 1 OR v_progress <> 1 THEN
      RAISE EXCEPTION 'Owner Oct 29 81/100 result is not uniquely intact';
    END IF;
  END IF;
  IF EXISTS (
    SELECT 1 FROM private.daily_challenges daily
    JOIN private.daily_challenge_schedule_versions schedule ON schedule.version=daily.schedule_version
    WHERE schedule.sport='nba' AND daily.central_day>=date '2026-10-29'
  ) THEN RAISE EXCEPTION 'Public NBA Daily already published; refuse replacement'; END IF;
  IF private.daily_challenge_schedule_for_day(date '2026-10-30','nba')
    <> 'nba-daily-regular-v3-oct30-public' THEN
    RAISE EXCEPTION 'Expected public NBA Oct 30 schedule has changed'; END IF;
END $preflight$;

INSERT INTO private.daily_challenge_schedule_versions
(version,time_zone,anchor_day,starts_on,game_cycle,sport)
VALUES ('nba-daily-public-opening-bar-trivia-oct29','America/Chicago',
        date '2026-10-29',date '2026-10-29',array['bar_trivia']::text[],'nba');

INSERT INTO private.daily_challenge_schedule_versions
(version,time_zone,anchor_day,starts_on,game_cycle,sport)
SELECT 'nba-daily-regular-v4-nov01-public',time_zone,date '2026-11-01',
       date '2026-11-01',game_cycle,'nba'
FROM private.daily_challenge_schedule_versions
WHERE version='nba-daily-regular-v3-oct30-public';

-- Patch existing routines with exact-contract guards. No UFC/Football changes.
DO $routines$
DECLARE v_signature text; v_reg regprocedure; v_before text; v_after text; v_old text; v_new text;
BEGIN
  FOREACH v_signature IN ARRAY ARRAY[
    'private.daily_challenge_active_day(date,text)',
    'private.daily_challenge_schedule_for_day(date,text)',
    'private.enforce_future_daily_publication_cadence()',
    'public.get_daily_challenge_materialization_request(text,timestamp with time zone)',
    'public.get_daily_challenge_standings(text)',
    'private.publish_combined_daily_closing_reminder(uuid,text,text,text,text,text,timestamp with time zone)',
    'public.dispatch_due_nba_notifications(timestamp with time zone)'
  ] LOOP
    v_reg:=to_regprocedure(v_signature);
    IF v_reg IS NULL THEN RAISE EXCEPTION 'Missing NBA cadence routine: %',v_signature; END IF;
    v_before:=pg_get_functiondef(v_reg::oid);
    v_after:=v_before;

    IF v_signature LIKE '%daily_challenge_active_day%' THEN
      v_old:='return date ''2026-10-30'' + ((p_day - date ''2026-10-30'') / 2) * 2;';
      v_new:='if p_day between date ''2026-10-29'' and date ''2026-10-31'' then return date ''2026-10-29''; end if;
    if p_day >= date ''2026-11-01'' then return date ''2026-11-01'' + ((p_day - date ''2026-11-01'') / 2) * 2; end if;
    return date ''2026-10-30'' + ((p_day - date ''2026-10-30'') / 2) * 2;';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA active day contract changed'; END IF;
      v_after:=replace(v_after,v_old,v_new);
    ELSIF v_signature LIKE '%daily_challenge_schedule_for_day%' THEN
      v_old:='IF p_sport=''nba'' AND p_day BETWEEN date ''2026-10-30'' AND date ''2027-04-11'' THEN
    RETURN ''nba-daily-regular-v3-oct30-public'';
  END IF;';
      v_new:='IF p_sport=''nba'' AND p_day BETWEEN date ''2026-10-29'' AND date ''2026-10-31'' THEN
    RETURN ''nba-daily-public-opening-bar-trivia-oct29'';
  END IF;
  IF p_sport=''nba'' AND p_day BETWEEN date ''2026-11-01'' AND date ''2027-04-11'' THEN
    RETURN ''nba-daily-regular-v4-nov01-public'';
  END IF;';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA schedule resolver contract changed'; END IF;
      v_after:=replace(v_after,v_old,v_new);
    ELSIF v_signature LIKE '%enforce_future_daily_publication_cadence%' THEN
      v_old:='v_sport = ''nba'' and new.central_day >= date ''2026-10-30''';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA cadence guard contract changed'; END IF;
      v_after:=replace(v_after,v_old,'v_sport = ''nba'' and new.central_day >= date ''2026-10-29''');
    ELSIF v_signature LIKE '%get_daily_challenge_materialization_request%' THEN
      v_old:='v_today < date ''2026-10-30''';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA materialization gate contract changed'; END IF;
      v_after:=replace(v_after,v_old,'v_today < date ''2026-10-29''');
    ELSIF v_signature LIKE '%get_daily_challenge_standings%' THEN
      v_old:='(date ''2026-10-30'' + ((greatest(v_today, date ''2026-10-30'') - date ''2026-10-30'') / 2) * 2)';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA standings active-day contract changed'; END IF;
      v_after:=replace(v_after,v_old,'private.daily_challenge_active_day(v_today, ''nba'')');
      -- The grouped day sequence remains valid: Oct 29→0, Nov 1→1, Nov 3→2.
    ELSIF v_signature LIKE '%publish_combined_daily_closing_reminder%' THEN
      v_old:='v_nba_start_day := v_day - 1;';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA combined reminder day contract changed'; END IF;
      v_after:=replace(v_after,v_old, 'v_nba_start_day := case when v_day = date ''2026-10-31'' then date ''2026-10-29'' else v_day - 1 end;');
      v_old:='schedule.version = ''nba-daily-regular-v3-oct30-public''';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA combined reminder version contract changed'; END IF;
      v_after:=replace(v_after,v_old,'schedule.version in (''nba-daily-public-opening-bar-trivia-oct29'',''nba-daily-regular-v4-nov01-public'')');
    ELSIF v_signature LIKE '%dispatch_due_nba_notifications%' THEN
      v_old:='v_day < date ''2026-10-30''';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA notification window contract changed'; END IF;
      v_after:=replace(v_after,v_old,'v_day < date ''2026-10-29''');
      v_old:='v_start := v_day - 1;';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA closing reminder start contract changed'; END IF;
      v_after:=replace(v_after,v_old,'v_start := case when v_day = date ''2026-10-31'' then date ''2026-10-29'' else v_day - 1 end;');
      v_old:='schedule.version = ''nba-daily-regular-v3-oct30-public''';
      IF position(v_old in v_after)=0 THEN RAISE EXCEPTION 'NBA dispatcher schedule contract changed'; END IF;
      v_after:=replace(v_after,v_old,'schedule.version in (''nba-daily-public-opening-bar-trivia-oct29'',''nba-daily-regular-v4-nov01-public'')');
      -- Already-suppressed launch broadcast stays disabled: NO duplicate push.
      IF position('if false and v_day = date ''2026-10-30''' in v_after)=0 THEN
        RAISE EXCEPTION 'NBA announcement suppression must remain intact';
      END IF;
    END IF;
    EXECUTE v_after;
  END LOOP;
END $routines$;

-- Both the private preview and official attempt are immutable. Clone the SAME
-- reviewed setup, server-evaluated result and state into the public day.
-- Do not recompute score, regenerate the question board, or edit old records.
WITH preview AS (
  SELECT d.* FROM private.daily_challenges d
  WHERE d.central_day=date '2026-10-29'
    AND d.schedule_version='nba-daily-owner-prelaunch-v1'
)
INSERT INTO private.daily_challenges
(id,central_day,schedule_version,game_type,setup_id,content_version,scoring_version,fallback_reason,published_at)
SELECT gen_random_uuid(),central_day,'nba-daily-public-opening-bar-trivia-oct29',
       game_type,setup_id,content_version,scoring_version,NULL,published_at
FROM preview;

INSERT INTO private.daily_challenge_progress
(daily_challenge_id,profile_id,revision,submission_state,public_state,started_at,updated_at)
SELECT public_day.id,progress.profile_id,progress.revision,progress.submission_state,
       progress.public_state,progress.started_at,progress.updated_at
FROM private.daily_challenge_progress progress
JOIN private.daily_challenges preview_day ON preview_day.id=progress.daily_challenge_id
JOIN private.daily_challenges public_day ON public_day.central_day=preview_day.central_day
  AND public_day.schedule_version='nba-daily-public-opening-bar-trivia-oct29'
WHERE preview_day.central_day=date '2026-10-29'
  AND preview_day.schedule_version='nba-daily-owner-prelaunch-v1';

INSERT INTO private.daily_challenge_attempts
(id,daily_challenge_id,profile_id,attempt_kind,native_score,normalized_score,
 completed_at,content_version,scoring_version,public_result,submission_evidence,
 grading_evidence_snapshot,legacy_find_leader_day,created_at)
SELECT gen_random_uuid(),public_day.id,attempt.profile_id,attempt.attempt_kind,
       attempt.native_score,attempt.normalized_score,attempt.completed_at,
       attempt.content_version,attempt.scoring_version,attempt.public_result,
       attempt.submission_evidence,attempt.grading_evidence_snapshot,
       attempt.legacy_find_leader_day,attempt.created_at
FROM private.daily_challenge_attempts attempt
JOIN private.daily_challenges preview_day ON preview_day.id=attempt.daily_challenge_id
JOIN private.daily_challenges public_day ON public_day.central_day=preview_day.central_day
  AND public_day.schedule_version='nba-daily-public-opening-bar-trivia-oct29'
WHERE preview_day.central_day=date '2026-10-29'
  AND preview_day.schedule_version='nba-daily-owner-prelaunch-v1';

DO $verify$
DECLARE v_day date; v_expected date; v_public private.daily_challenges; v_n integer;
BEGIN
  FOR v_day IN SELECT d::date FROM generate_series('2026-10-29'::date,'2026-11-04'::date,'1 day'::interval) d LOOP
    IF v_day <= date '2026-10-31' THEN
      v_expected := date '2026-10-29';
    ELSE
      v_expected := date '2026-11-01' + ((v_day-date '2026-11-01')/2)*2;
    END IF;
    IF private.daily_challenge_active_day(v_day,'nba') <> v_expected THEN
      RAISE EXCEPTION 'NBA October 29 cadence invalid on %',v_day;
    END IF;
  END LOOP;
  IF private.daily_challenge_expected_game('nba-daily-public-opening-bar-trivia-oct29',date '2026-10-29') <> 'bar_trivia'
    OR private.daily_challenge_expected_game('nba-daily-regular-v4-nov01-public',date '2026-11-01') <> 'average_fan' THEN
    RAISE EXCEPTION 'Launch or first followup board differs from locked schedule'; END IF;
  SELECT * INTO v_public FROM private.daily_challenges
   WHERE central_day=date '2026-10-29' AND schedule_version='nba-daily-public-opening-bar-trivia-oct29';
  SELECT count(*) INTO v_n FROM private.daily_challenge_attempts
    WHERE daily_challenge_id=v_public.id AND attempt_kind='official_first'
      AND native_score=81 AND normalized_score=81;
  IF v_public.id IS NULL THEN
    -- Only a truly fresh database, with no owner preview history at all,
    -- may wait for scheduled board materialization. Production must promote.
    IF EXISTS (
      SELECT 1 FROM private.daily_challenges daily
      JOIN private.daily_challenge_schedule_versions schedule
        ON schedule.version=daily.schedule_version
      WHERE schedule.sport='nba_preview'
    ) THEN RAISE EXCEPTION 'Existing preview history was not promoted'; END IF;
  ELSIF v_n<>1 THEN
    RAISE EXCEPTION 'Public launch board did not preserve 81/100';
  END IF;
END $verify$;
