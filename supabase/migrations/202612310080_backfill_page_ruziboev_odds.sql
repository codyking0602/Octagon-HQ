-- Backfill the one published UFC Paris matchup omitted by the canonical odds feed.
-- Guard the update so a later canonical sync wins if it fills the line first.
update public.pick_bouts
set
  red_american_odds = -175,
  blue_american_odds = 145,
  odds_source = 'UFC',
  odds_updated_at = now()
where event_id = 'ufc-fight-night-dan-hooker-vs-salahdine-parnasse-2026-09-05'
  and bout_id = 'main-michael-venom-page-nursulton-ruziboev'
  and red_fighter_slug = 'michael-page'
  and blue_fighter_slug = 'nursulton-ruziboev'
  and red_american_odds is null
  and blue_american_odds is null;
