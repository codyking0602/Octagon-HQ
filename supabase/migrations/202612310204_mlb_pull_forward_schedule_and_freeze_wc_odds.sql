-- Pull the approved 2026 MLB Play cadence forward and freeze the initial
-- Wild Card series-winner lines for owner review. Public MLB release remains off.

do $$
declare
  v_updated integer;
begin
  -- Clear the dates first so the partial unique season/date index never sees
  -- a transient collision while every slot moves into the prior slot's date.
  update public.mlb_postseason_challenges
  set scheduled_date = null
  where season = 2026
    and slot between 1 and 10;

  update public.mlb_postseason_challenges challenge
  set scheduled_date = schedule.scheduled_date
  from (
    values
      (1::smallint,  'mlb-2026-play-01'::text, date '2026-09-27'),
      (2::smallint,  'mlb-2026-play-02'::text, date '2026-09-29'),
      (3::smallint,  'mlb-2026-play-03'::text, date '2026-10-01'),
      (4::smallint,  'mlb-2026-play-04'::text, date '2026-10-03'),
      (5::smallint,  'mlb-2026-play-05'::text, date '2026-10-06'),
      (6::smallint,  'mlb-2026-play-06'::text, date '2026-10-09'),
      (7::smallint,  'mlb-2026-play-07'::text, date '2026-10-12'),
      (8::smallint,  'mlb-2026-play-08'::text, date '2026-10-15'),
      (9::smallint,  'mlb-2026-play-09'::text, date '2026-10-18'),
      (10::smallint, 'mlb-2026-play-10'::text, date '2026-10-23')
  ) as schedule(slot, challenge_key, scheduled_date)
  where challenge.season = 2026
    and challenge.slot = schedule.slot
    and challenge.challenge_key = schedule.challenge_key;

  get diagnostics v_updated = row_count;
  if v_updated <> 10 then
    raise exception 'expected exactly ten MLB postseason schedule rows, updated %', v_updated;
  end if;

  update public.mlb_playoff_series series
  set team_a_moneyline = odds.team_a_moneyline,
      team_b_moneyline = odds.team_b_moneyline,
      odds_source = 'DraftKings opening · frozen Sep 27',
      odds_updated_at = timestamptz '2026-09-27 18:30:00-05'
  from (
    values
      ('nl-wc-1'::text,  105, -125),
      ('al-wc-1'::text,  125, -145),
      ('al-wc-2'::text,  140, -170),
      ('nl-wc-2'::text,  100, -120)
  ) as odds(series_id, team_a_moneyline, team_b_moneyline)
  where series.season = 2026
    and series.series_id = odds.series_id;

  get diagnostics v_updated = row_count;
  if v_updated <> 4 then
    raise exception 'expected exactly four MLB Wild Card series odds rows, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';
