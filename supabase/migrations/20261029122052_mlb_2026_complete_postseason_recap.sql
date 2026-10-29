-- Read-only shared 2026 MLB season recap. No result mutations or profile score writes.
CREATE OR REPLACE FUNCTION public.get_mlb_postseason_season_recap(p_season integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_output jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'sign in required';
  END IF;
  IF NOT public.mlb_playoffs_can_view(p_season) THEN
    RAISE EXCEPTION 'mlb_playoffs_not_available';
  END IF;
  WITH ranked AS (
    SELECT c.slot, c.challenge_key, c.title, c.scheduled_date, c.game_type,
           r.profile_id, r.raw_score,
           rank() OVER (PARTITION BY c.challenge_key ORDER BY r.raw_score DESC)::integer AS finish_rank,
           count(*) OVER (PARTITION BY c.challenge_key, r.raw_score)::integer AS tie_count
      FROM public.mlb_postseason_challenges c
      JOIN public.mlb_postseason_challenge_results r
        ON r.season=c.season AND r.challenge_key=c.challenge_key
     WHERE c.season=p_season
  ), scored AS (
    SELECT ranked.*,
      (SELECT avg(CASE place
        WHEN 1 THEN 25::numeric/16
        WHEN 2 THEN 20::numeric/16
        WHEN 3 THEN 15::numeric/16
        WHEN 4 THEN 10::numeric/16
        WHEN 5 THEN 5::numeric/16
        ELSE 0::numeric END)
       FROM generate_series(ranked.finish_rank, ranked.finish_rank+ranked.tie_count-1) place
      ) AS event_points
      FROM ranked
  )
  SELECT jsonb_build_object(
    'season', p_season,
    'play_results', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'slot', s.slot, 'challenge_key', s.challenge_key, 'title', s.title,
        'date', s.scheduled_date, 'game_type', s.game_type,
        'profile_id', s.profile_id, 'raw_score', s.raw_score,
        'rank', s.finish_rank, 'points', round(s.event_points,4)
      ) ORDER BY s.slot, s.finish_rank, s.profile_id)
      FROM scored s
    ), '[]'::jsonb),
    'series_picks', coalesce((
      SELECT jsonb_agg(jsonb_build_object('profile_id', pick.profile_id,
        'series_id', pick.series_id, 'winner_team_id', pick.winner_team_id
      ) ORDER BY pick.profile_id, series_row.position)
      FROM public.mlb_playoff_round_picks pick
      JOIN public.mlb_playoff_series series_row ON series_row.series_id=pick.series_id
      WHERE series_row.season=p_season
    ), '[]'::jsonb)
  ) INTO v_output;
  RETURN v_output;
END
$function$

REVOKE ALL ON FUNCTION public.get_mlb_postseason_season_recap(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_mlb_postseason_season_recap(integer) TO authenticated;
COMMENT ON FUNCTION public.get_mlb_postseason_season_recap(integer) IS 'Read-only MLB season recap: all participants official Play placement rows and saved series selections; authorization required.';
