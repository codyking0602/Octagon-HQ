-- One-off owner-authorized NBA Daily Millionaire showcase (Oct 29-31, 2026).
-- Three-day launch slot remains ONE Daily attempt per profile. Host NBA 3.
-- Eight hand-selected, independently reviewed questions from the existing NBA
-- curated bank: accessible to challenging, modern and historical NBA anchors.
-- Retain the two prior Bar Trivia submissions as immutable audit records, but
-- retire them from visible Daily history, streaks, scores and wins.
-- All UFC, Football, and November NBA schedule/results remain unchanged.

DO $preflight$
DECLARE v_count integer; v_old_id uuid; v_old_type text; v_old_profiles text[];
BEGIN
  IF private.daily_challenge_schedule_for_day(date '2026-10-29','nba')
     <> 'nba-daily-launch-oct29-bar-trivia-v1'
     OR private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
     <> 'nba-daily-regular-v3-oct30-public'
     OR private.daily_challenge_active_day(date '2026-10-31','nba')
     <> date '2026-10-29' THEN
    RAISE EXCEPTION 'NBA Daily launch boundary moved; refuse showcase migration';
  END IF;
  SELECT d.id,d.game_type INTO v_old_id,v_old_type
  FROM private.daily_challenges d
  WHERE d.central_day=date '2026-10-29'
    AND d.schedule_version='nba-daily-launch-oct29-bar-trivia-v1';
  IF v_old_id IS NOT NULL THEN
    IF v_old_type <> 'bar_trivia' THEN
      RAISE EXCEPTION 'Refusing to retire a non-Bar Trivia launch board';
    END IF;
    SELECT count(*),array_agg(p.normalized_name ORDER BY p.normalized_name)
    INTO v_count,v_old_profiles
    FROM private.daily_challenge_attempts a
    JOIN public.profiles p ON p.id=a.profile_id
    WHERE a.daily_challenge_id=v_old_id AND a.attempt_kind='official_first';
    -- Production originally has exactly Cody and Shane on the public board;
    -- fail closed if an additional member has played during the cutover.
    IF v_count > 0 AND (v_count <> 2 OR v_old_profiles <> ARRAY['CODY','SHANE']::text[]) THEN
      RAISE EXCEPTION 'NBA launch board has additional player results; inspect before replacing';
    END IF;
  END IF;
END $preflight$;

INSERT INTO private.daily_challenge_schedule_versions
  (version,time_zone,anchor_day,starts_on,game_cycle,sport)
VALUES ('nba-daily-launch-oct29-millionaire-v1','America/Chicago',
        date '2026-10-29',date '2026-10-29',ARRAY['millionaire']::text[],'nba')
ON CONFLICT (version) DO NOTHING;

-- Keep the original immutable launch calendar and scored attempts intact.
-- Only the current Oct 29-31 opening slot is pointed at this new revision.
CREATE OR REPLACE FUNCTION private.daily_challenge_schedule_for_day(p_day date,p_sport text)
RETURNS text LANGUAGE plpgsql STABLE SET search_path='' AS $body$
DECLARE v_version text;
BEGIN
  IF p_sport IS NULL OR p_sport NOT IN ('ufc','football','nba','nba_preview') THEN
    RAISE EXCEPTION 'unsupported Daily Challenge sport %',coalesce(p_sport,'<null>');
  END IF;
  IF p_sport='nba' AND p_day BETWEEN date '2026-10-29' AND date '2026-10-31' THEN
    RETURN 'nba-daily-launch-oct29-millionaire-v1';
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

-- The completed 81 and 63 are historical audit rows, not today's scores.
-- Central read-side history is shared by standings, streaks and scorecards.
-- Protect every other day/sport and preserve historical immutable storage.
DO $retire_old_results$
DECLARE v_def text; v_old text := 'WHERE attempt.attempt_kind = ''official_first''::text';
BEGIN
  SELECT pg_get_viewdef('private.daily_challenge_history'::regclass,true) INTO v_def;
  IF v_def IS NULL OR position(v_old in v_def)=0
    OR position('UNION ALL' in v_def)=0 THEN
    RAISE EXCEPTION 'Daily history view changed; refuse score reset';
  END IF;
  EXECUTE 'CREATE OR REPLACE VIEW private.daily_challenge_history AS ' ||
    replace(v_def,v_old,v_old ||
      ' AND NOT (daily.schedule_version = ''nba-daily-launch-oct29-bar-trivia-v1''::text' ||
      ' AND daily.central_day = date ''2026-10-29'')');
END $retire_old_results$;

-- Authoritative game identity. No browser-generated boards or answer keys.
INSERT INTO private.daily_challenge_setups
  (game_type,setup_key,content_version,scoring_version,
   public_setup,reveal_setup,private_setup_evidence,private_grading_evidence)
VALUES (
  'millionaire','millionaire-daily-v5-finish-board:nba-daily-launch-oct29-millionaire-v1:2026-10-29:nba','millionaire-daily-v5-finish-board','play-official-score-v1',
  '{"league":"nba","questions":[{"id":"nba-millionaire-q1-18","type":"championship","level":"Q1","money":500,"sport":"nba","prompt":"Which franchise won the 2025 NBA championship?","choices":[{"id":"A","text":"Indiana Pacers"},{"id":"B","text":"Boston Celtics"},{"id":"C","text":"Oklahoma City Thunder"},{"id":"D","text":"Denver Nuggets"}]},{"id":"nba-millionaire-q2-10","type":"player","level":"Q2","money":1000,"sport":"nba","prompt":"Which NBA legend''s nickname was The Answer?","choices":[{"id":"A","text":"Allen Iverson"},{"id":"B","text":"Tracy McGrady"},{"id":"C","text":"Vince Carter"},{"id":"D","text":"Ray Allen"}]},{"id":"nba-millionaire-q3-02","type":"championship","level":"Q3","money":5000,"sport":"nba","prompt":"Which team defeated Golden State to win the 2016 Finals?","choices":[{"id":"A","text":"Oklahoma City Thunder"},{"id":"B","text":"Toronto Raptors"},{"id":"C","text":"San Antonio Spurs"},{"id":"D","text":"Cleveland Cavaliers"}]},{"id":"nba-millionaire-q4-19","type":"awards","level":"Q4","money":10000,"sport":"nba","prompt":"Who was the 2008 NBA Finals MVP?","choices":[{"id":"A","text":"Kevin Garnett"},{"id":"B","text":"Paul Pierce"},{"id":"C","text":"Ray Allen"},{"id":"D","text":"Rajon Rondo"}]},{"id":"nba-millionaire-q5-09","type":"awards","level":"Q5","money":50000,"sport":"nba","prompt":"Who won 2011–12 NBA Sixth Man of the Year?","choices":[{"id":"A","text":"James Harden"},{"id":"B","text":"Lamar Odom"},{"id":"C","text":"Jamal Crawford"},{"id":"D","text":"Jason Terry"}]},{"id":"nba-millionaire-q6-02","type":"awards","level":"Q6","money":100000,"sport":"nba","prompt":"Who won the 1990 NBA Finals MVP?","choices":[{"id":"A","text":"Joe Dumars"},{"id":"B","text":"Bill Laimbeer"},{"id":"C","text":"Dennis Rodman"},{"id":"D","text":"Isiah Thomas"}]},{"id":"nba-millionaire-q7-12","type":"championship","level":"Q7","money":500000,"sport":"nba","prompt":"Which franchise won the 1979 NBA championship?","choices":[{"id":"A","text":"Washington Bullets"},{"id":"B","text":"Portland Trail Blazers"},{"id":"C","text":"Seattle SuperSonics"},{"id":"D","text":"Phoenix Suns"}]},{"id":"nba-millionaire-q8-01","type":"awards","level":"Q8","money":1000000,"sport":"nba","prompt":"Who is the only NBA Finals MVP to win the award while on the losing team?","choices":[{"id":"A","text":"Elgin Baylor"},{"id":"B","text":"Jerry West"},{"id":"C","text":"Wilt Chamberlain"},{"id":"D","text":"Oscar Robertson"}]}],"run_number":31,"host_number":3,"time_bank_ms":120000,"initial_state":{"score":0,"status":"playing","complete":false,"base_score":0,"final_money":null,"current_money":0,"lifelines_used":{"double_dip":false,"stat_sheet":false,"fifty_fifty":false},"question_state":{"double_dip_active":false,"removed_choice_ids":[],"fifty_fifty_applied":false,"stat_sheet_revealed":false,"double_dip_wrong_choice_ids":[]},"time_remaining_ms":120000,"completed_questions":0,"last_answer_outcome":null,"last_lifeline_reveal":null,"last_question_reveal":null,"current_question_index":0,"first_miss_question_index":null},"question_count":8,"runtime_version":"millionaire-daily-v5-finish-board"}'::jsonb,
  '{"league":"nba","questions":[{"id":"nba-millionaire-q1-18","explanation":"Oklahoma City defeated Indiana in the 2025 NBA Finals.","correct_choice_id":"C"},{"id":"nba-millionaire-q2-10","explanation":"Allen Iverson was famously known as The Answer.","correct_choice_id":"A"},{"id":"nba-millionaire-q3-02","explanation":"Cleveland came back from a 3–1 Finals deficit.","correct_choice_id":"D"},{"id":"nba-millionaire-q4-19","explanation":"Pierce took Finals MVP when Boston defeated Los Angeles.","correct_choice_id":"B"},{"id":"nba-millionaire-q5-09","explanation":"Harden won the 2012 Sixth Man award with Oklahoma City.","correct_choice_id":"A"},{"id":"nba-millionaire-q6-02","explanation":"Thomas led Detroit to its second consecutive championship.","correct_choice_id":"D"},{"id":"nba-millionaire-q7-12","explanation":"Seattle beat Washington to win its lone title under that name.","correct_choice_id":"C"},{"id":"nba-millionaire-q8-01","explanation":"West won the inaugural Finals MVP in 1969 despite the Lakers losing.","correct_choice_id":"B"}],"run_number":31,"host_number":3}'::jsonb,
  '{"run":[{"id":"nba-millionaire-q1-18","type":"championship","level":"Q1","money":500,"sport":"nba","prompt":"Which franchise won the 2025 NBA championship?","choices":[{"id":"A","text":"Indiana Pacers"},{"id":"B","text":"Boston Celtics"},{"id":"C","text":"Oklahoma City Thunder"},{"id":"D","text":"Denver Nuggets"}],"statSheet":"The 2025 Finals went seven games, and the champion''s star also won league MVP.","fiftyFifty":{"removalChoiceIds":["A","D"],"survivorChoiceIds":["B","C"]},"explanation":"Oklahoma City defeated Indiana in the 2025 NBA Finals.","correctChoiceId":"C","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q2-10","type":"player","level":"Q2","money":1000,"sport":"nba","prompt":"Which NBA legend''s nickname was The Answer?","choices":[{"id":"A","text":"Allen Iverson"},{"id":"B","text":"Tracy McGrady"},{"id":"C","text":"Vince Carter"},{"id":"D","text":"Ray Allen"}],"statSheet":"He wore No. 3 and starred as an undersized scoring guard in Philadelphia.","fiftyFifty":{"removalChoiceIds":["B","C"],"survivorChoiceIds":["A","D"]},"explanation":"Allen Iverson was famously known as The Answer.","correctChoiceId":"A","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q3-02","type":"championship","level":"Q3","money":5000,"sport":"nba","prompt":"Which team defeated Golden State to win the 2016 Finals?","choices":[{"id":"A","text":"Oklahoma City Thunder"},{"id":"B","text":"Toronto Raptors"},{"id":"C","text":"San Antonio Spurs"},{"id":"D","text":"Cleveland Cavaliers"}],"statSheet":"The winner completed a comeback from a 3–1 Finals deficit.","fiftyFifty":{"removalChoiceIds":["B","C"],"survivorChoiceIds":["A","D"]},"explanation":"Cleveland came back from a 3–1 Finals deficit.","correctChoiceId":"D","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q4-19","type":"awards","level":"Q4","money":10000,"sport":"nba","prompt":"Who was the 2008 NBA Finals MVP?","choices":[{"id":"A","text":"Kevin Garnett"},{"id":"B","text":"Paul Pierce"},{"id":"C","text":"Ray Allen"},{"id":"D","text":"Rajon Rondo"}],"statSheet":"The award went to a Boston forward after defeating Los Angeles in six games.","fiftyFifty":{"removalChoiceIds":["A","D"],"survivorChoiceIds":["B","C"]},"explanation":"Pierce took Finals MVP when Boston defeated Los Angeles.","correctChoiceId":"B","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q5-09","type":"awards","level":"Q5","money":50000,"sport":"nba","prompt":"Who won 2011–12 NBA Sixth Man of the Year?","choices":[{"id":"A","text":"James Harden"},{"id":"B","text":"Lamar Odom"},{"id":"C","text":"Jamal Crawford"},{"id":"D","text":"Jason Terry"}],"statSheet":"The recipient was an Oklahoma City reserve before his 2012 offseason trade.","fiftyFifty":{"removalChoiceIds":["B","C"],"survivorChoiceIds":["A","D"]},"explanation":"Harden won the 2012 Sixth Man award with Oklahoma City.","correctChoiceId":"A","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q6-02","type":"awards","level":"Q6","money":100000,"sport":"nba","prompt":"Who won the 1990 NBA Finals MVP?","choices":[{"id":"A","text":"Joe Dumars"},{"id":"B","text":"Bill Laimbeer"},{"id":"C","text":"Dennis Rodman"},{"id":"D","text":"Isiah Thomas"}],"statSheet":"The 1990 Finals ended with Detroit defeating Portland.","fiftyFifty":{"removalChoiceIds":["B","C"],"survivorChoiceIds":["A","D"]},"explanation":"Thomas led Detroit to its second consecutive championship.","correctChoiceId":"D","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q7-12","type":"championship","level":"Q7","money":500000,"sport":"nba","prompt":"Which franchise won the 1979 NBA championship?","choices":[{"id":"A","text":"Washington Bullets"},{"id":"B","text":"Portland Trail Blazers"},{"id":"C","text":"Seattle SuperSonics"},{"id":"D","text":"Phoenix Suns"}],"statSheet":"The champion was based in the Pacific Northwest and defeated Washington.","fiftyFifty":{"removalChoiceIds":["A","D"],"survivorChoiceIds":["B","C"]},"explanation":"Seattle beat Washington to win its lone title under that name.","correctChoiceId":"C","lifelineCompatibility":{"doubleDip":true,"statSheet":true,"fiftyFifty":true}},{"id":"nba-millionaire-q8-01","type":"awards","level":"Q8","money":1000000,"sport":"nba","prompt":"Who is the only NBA Finals MVP to win the award while on the losing team?","choices":[{"id":"A","text":"Elgin Baylor"},{"id":"B","text":"Jerry West"},{"id":"C","text":"Wilt Chamberlain"},{"id":"D","text":"Oscar Robertson"}],"statSheet":null,"fiftyFifty":{"removalChoiceIds":["A","C"],"survivorChoiceIds":["B","D"]},"explanation":"West won the inaugural Finals MVP in 1969 despite the Lakers losing.","correctChoiceId":"B","lifelineCompatibility":{"doubleDip":false,"statSheet":false,"fiftyFifty":false}}],"proof":"millionaire-daily-v5-finish-board|nba|2026-10-29|nba-daily-launch-oct29-millionaire-v1|nba-millionaire-q1-18:C|nba-millionaire-q2-10:A|nba-millionaire-q3-02:D|nba-millionaire-q4-19:B|nba-millionaire-q5-09:A|nba-millionaire-q6-02:D|nba-millionaire-q7-12:C|nba-millionaire-q8-01:B","league":"nba","run_number":31,"host_number":3}'::jsonb,
  '{"proof":"millionaire-daily-v5-finish-board|nba|2026-10-29|nba-daily-launch-oct29-millionaire-v1|nba-millionaire-q1-18:C|nba-millionaire-q2-10:A|nba-millionaire-q3-02:D|nba-millionaire-q4-19:B|nba-millionaire-q5-09:A|nba-millionaire-q6-02:D|nba-millionaire-q7-12:C|nba-millionaire-q8-01:B"}'::jsonb
)
ON CONFLICT (game_type,setup_key,content_version,scoring_version) DO NOTHING;

INSERT INTO private.daily_challenges
  (central_day,schedule_version,game_type,setup_id,content_version,scoring_version)
SELECT date '2026-10-29','nba-daily-launch-oct29-millionaire-v1','millionaire',s.id,
       'millionaire-daily-v5-finish-board','play-official-score-v1'
FROM private.daily_challenge_setups s
WHERE s.game_type='millionaire' AND s.setup_key='millionaire-daily-v5-finish-board:nba-daily-launch-oct29-millionaire-v1:2026-10-29:nba'
  AND s.content_version='millionaire-daily-v5-finish-board'
  AND s.scoring_version='play-official-score-v1'
ON CONFLICT (schedule_version,central_day) DO NOTHING;

DO $verify$
DECLARE v_id uuid; v_setup private.daily_challenge_setups; v_count integer;
BEGIN
  SELECT d.id,s INTO v_id,v_setup
  FROM private.daily_challenges d
  JOIN private.daily_challenge_setups s ON s.id=d.setup_id
  WHERE d.central_day=date '2026-10-29' AND d.schedule_version='nba-daily-launch-oct29-millionaire-v1';
  IF v_id IS NULL OR v_setup.game_type <> 'millionaire'
    OR v_setup.public_setup->>'league' <> 'nba'
    OR v_setup.public_setup->>'host_number' <> '3'
    OR v_setup.public_setup->>'runtime_version' <> 'millionaire-daily-v5-finish-board'
    OR jsonb_array_length(v_setup.public_setup->'questions') <> 8
    OR jsonb_array_length(v_setup.private_setup_evidence->'run') <> 8
    OR v_setup.private_setup_evidence->>'proof'
      IS DISTINCT FROM v_setup.private_grading_evidence->>'proof'
    OR v_setup.reveal_setup->>'host_number' <> '3'
    OR private.daily_challenge_expected_game('nba-daily-launch-oct29-millionaire-v1',date '2026-10-29')
       <> 'millionaire'
    OR private.daily_challenge_schedule_for_day(date '2026-10-31','nba')
       <> 'nba-daily-launch-oct29-millionaire-v1'
    OR private.daily_challenge_schedule_for_day(date '2026-11-01','nba')
       <> 'nba-daily-regular-v3-oct30-public'
  THEN RAISE EXCEPTION 'NBA Millionaire 3 official launch verification failed'; END IF;
  SELECT count(*) INTO v_count FROM private.daily_challenge_history h
  WHERE h.central_day=date '2026-10-29' AND h.schedule_version='nba-daily-launch-oct29-bar-trivia-v1';
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'Retired NBA Bar Trivia scores remain in public Daily history';
  END IF;
END $verify$;
