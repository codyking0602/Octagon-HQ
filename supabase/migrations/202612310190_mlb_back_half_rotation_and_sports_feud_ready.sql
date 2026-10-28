-- Lock the approved MLB postseason back-half rotation and activate both
-- spoiler-protected Sports Feud dates plus the shifted second Wavelength date.
-- Dates and challenge keys stay fixed; only slot game identities/readiness move.

do $$
declare
  v_updated integer;
begin
  update public.mlb_postseason_challenges challenge
  set game_type = schedule.game_type,
      title = schedule.title,
      kicker = schedule.kicker,
      description = schedule.description,
      content_ready = schedule.content_ready
  from (
    values
      (6::smallint, 'mlb-2026-play-06'::text, date '2026-10-12', 'sports_feud'::text, 'Sports Feud'::text, 'SPORTS FEUD'::text, 'Clear two baseball boards, then finish with Fast Money.'::text, true),
      (7::smallint, 'mlb-2026-play-07'::text, date '2026-10-15', 'hit_the_number'::text, 'Hit the Number'::text, 'HIT THE NUMBER'::text, 'Build a total without going over the target.'::text, false),
      (8::smallint, 'mlb-2026-play-08'::text, date '2026-10-18', 'millionaire'::text, 'Who Wants to Be a Millionaire?'::text, 'MILLIONAIRE'::text, 'Eight questions. Three lifelines. One postseason run.'::text, false),
      (9::smallint, 'mlb-2026-play-09'::text, date '2026-10-23', 'wavelength'::text, 'Wavelength'::text, 'WAVELENGTH'::text, 'Two games. Four adaptive clues each.'::text, true),
      (10::smallint, 'mlb-2026-play-10'::text, date '2026-10-27', 'sports_feud'::text, 'Sports Feud'::text, 'SPORTS FEUD'::text, 'Clear two baseball boards, then finish with Fast Money.'::text, true)
  ) as schedule(slot, challenge_key, scheduled_date, game_type, title, kicker, description, content_ready)
  where challenge.season = 2026
    and challenge.slot = schedule.slot
    and challenge.challenge_key = schedule.challenge_key
    and challenge.scheduled_date = schedule.scheduled_date;

  get diagnostics v_updated = row_count;
  if v_updated <> 5 then
    raise exception 'expected exactly five MLB postseason back-half rows, updated %', v_updated;
  end if;
end;
$$;

notify pgrst, 'reload schema';
