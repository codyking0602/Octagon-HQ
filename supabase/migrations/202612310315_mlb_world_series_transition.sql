-- Publish the verified 2026 World Series without changing any submitted bracket or series pick.
-- Official ALCS: Tampa Bay over Cleveland 4-2 (Oct 19).
-- Official NLCS: Milwaukee over Los Angeles 4-0 (Oct 15).
-- World Series Game 1: Fri Oct 23, 7:00 PM CT, Milwaukee home field.
-- DraftKings series winner prices, Oct 19: TB +135, MIL -155.
DO $mlb_ws$
DECLARE
  v_updated integer;
BEGIN
  IF (SELECT count(*) FROM public.mlb_playoff_seasons
      WHERE season=2026 AND public_enabled AND field_ready
        AND current_round IN ('championship_series','world_series')) <> 1 THEN
    RAISE EXCEPTION '2026 live MLB season not ready for World Series';
  END IF;

  IF (SELECT count(*) FROM public.mlb_playoff_series
      WHERE season=2026 AND round='championship_series') <> 2 THEN
    RAISE EXCEPTION 'expected two 2026 Championship Series';
  END IF;

  IF EXISTS (
    SELECT 1 FROM (VALUES
      ('al-cs'::text,'cle'::text,'tb'::text,'tb'::text),
      ('nl-cs','lad','mil','mil')
    ) AS expected(series_id,team_a_id,team_b_id,winner_id)
    LEFT JOIN public.mlb_playoff_series s
      ON s.series_id=expected.series_id AND s.season=2026
    WHERE s.series_id IS NULL OR s.team_a_id<>expected.team_a_id
      OR s.team_b_id<>expected.team_b_id
      OR (s.winner_team_id IS NOT NULL AND s.winner_team_id<>expected.winner_id)
  ) THEN
    RAISE EXCEPTION '2026 LCS participants or existing winners differ from official results';
  END IF;

  UPDATE public.mlb_playoff_series AS s
  SET status='complete', winner_team_id=official.winner_id,
      series_score=official.final_score, updated_at=now()
  FROM (VALUES
    ('al-cs'::text,'tb'::text,'TB 4–2 CLE'::text),
    ('nl-cs','mil','MIL 4–0 LAD')
  ) AS official(series_id,winner_id,final_score)
  WHERE s.season=2026 AND s.round='championship_series'
    AND s.series_id=official.series_id
    AND (s.status<>'complete' OR s.winner_team_id IS NULL OR s.series_score IS DISTINCT FROM official.final_score);
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated NOT IN (0,2) THEN
    RAISE EXCEPTION 'expected zero or two LCS completions, updated %',v_updated;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.mlb_playoff_series
    WHERE series_id='ws' AND (
      season<>2026 OR round<>'world_series' OR team_a_id<>'tb'
      OR team_b_id<>'mil' OR winner_team_id IS NOT NULL
    )
  ) THEN
    RAISE EXCEPTION 'world series row already exists with conflicting state';
  END IF;

  INSERT INTO public.mlb_playoff_series (
    series_id,season,round,league,label,
    team_a_id,team_a_name,team_b_id,team_b_name,
    starts_at,picks_lock_at,status,winner_team_id,series_score,
    schedule,position,team_a_moneyline,team_b_moneyline,
    odds_source,odds_updated_at,updated_at
  ) VALUES (
    'ws',2026,'world_series',NULL,'World Series · Best of 7',
    'tb','Tampa Bay Rays','mil','Milwaukee Brewers',
    timestamptz '2026-10-24 00:00:00+00',
    timestamptz '2026-10-24 00:00:00+00',
    'scheduled',NULL,NULL,
    jsonb_build_array(
      'G1 · Fri Oct 23 · 7:00 PM CT · FOX',
      'G2 · Sat Oct 24 · 7:00 PM CT · FOX',
      'G3 · Mon Oct 26 · 7:00 PM CT · FOX',
      'G4 · Tue Oct 27 · 7:00 PM CT · FOX',
      'G5 · Wed Oct 28 · 7:00 PM CT · FOX · IF NEEDED',
      'G6 · Fri Oct 30 · 7:00 PM CT · FOX · IF NEEDED',
      'G7 · Sat Oct 31 · 7:00 PM CT · FOX · IF NEEDED'
    ),11,135,-155,
    'DraftKings World Series winner · frozen Oct 19',
    timestamptz '2026-10-20 03:36:00+00',now()
  )
  ON CONFLICT (series_id) DO NOTHING;

  IF (SELECT count(*) FROM public.mlb_playoff_series
      WHERE series_id='ws' AND season=2026 AND round='world_series'
        AND team_a_id='tb' AND team_b_id='mil'
        AND starts_at=timestamptz '2026-10-24 00:00:00+00'
        AND picks_lock_at=timestamptz '2026-10-24 00:00:00+00'
        AND team_a_moneyline=135 AND team_b_moneyline=-155
        AND status='scheduled' AND winner_team_id IS NULL) <> 1 THEN
    RAISE EXCEPTION '2026 World Series matchup, pick lock or frozen prices failed verification';
  END IF;

  UPDATE public.mlb_playoff_seasons
  SET current_round='world_series',
      spotlight=jsonb_build_object(
        'series_id','ws',
        'title','Rays vs. Brewers',
        'round','WORLD SERIES',
        'status','World Series · Best of 7',
        'overview','The Rays and Brewers meet in a World Series that guarantees a first-time champion. Milwaukee hosts Games 1 and 2 before the series moves to Tampa Bay.',
        'keys',jsonb_build_array(
          'Milwaukee swept the Dodgers 4-0 to win the NL pennant',
          'Tampa Bay eliminated Cleveland 4-2 to win the AL pennant',
          'Junior Caminero hit 42 home runs in the 2026 regular season'
        ),
        'player_to_watch','Junior Caminero',
        'player_context','Tampa Bay Rays · third baseman',
        'stats',jsonb_build_array(
          '42 HR · 101 RBI in 2026',
          'Two-run home run in ALCS Game 6',
          'Game 1 Friday, Oct 23 at Milwaukee'
        )
      ),
      updated_at=now()
  WHERE season=2026 AND public_enabled AND field_ready;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated<>1 THEN
    RAISE EXCEPTION 'expected one World Series season advancement, updated %',v_updated;
  END IF;

  -- Bracket scores and round-pick standings derive from immutable submissions
  -- plus the newly completed series. Do not rewrite members' brackets or picks.
END;
$mlb_ws$;
NOTIFY pgrst, 'reload schema';
