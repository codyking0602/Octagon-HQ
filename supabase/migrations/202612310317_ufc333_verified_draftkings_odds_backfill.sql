-- UFC 333 verified fallback quotes where The Odds API had no matchup at all.
-- These three moneylines were checked Oct. 20, 2026 against DraftKings' UFC
-- fight-lines board and the named DraftKings sportsbook rows at:
-- https://sportsbook.draftkings.com/leagues/mma/ufc?category=fights&subcategory=fight-lines
-- https://www.ufcalendar.com/events/ufc-333-2026-10-24/alexander-volkanovski-vs-movsar-evloev
-- https://www.ufcalendar.com/events/ufc-333-2026-10-24/lone-er-kavanagh-vs-ramazan-temirov
-- https://www.ufcalendar.com/fights/abus-magomedov-vs-cam-rowston
-- Abus/Rowston used the more recent official DraftKings board (-115/-105).
-- Do NOT overwrite any odds subsequently supplied by canonical monitoring.
-- Do NOT change locks or frozen underdog prices; pre-lock only.
with reviewed(bout_id, red_slug, blue_slug, red_odds, blue_odds) as (
  values
    ('main-event-alexander-volkanovski-movsar-evloev', 'alexander-volkanovski', 'movsar-evloev', -112, -108),
    ('main-loneer-kavanagh-ramazan-temirov', 'loneer-kavanagh', 'ramazan-temirov', -112, -108),
    ('prelim-abus-magomedov-cam-rowston', 'abus-magomedov', 'cam-rowston', -115, -105)
)
update public.pick_bouts bout
set red_american_odds = reviewed.red_odds,
    blue_american_odds = reviewed.blue_odds,
    odds_source = 'DraftKings',
    odds_updated_at = '2026-10-20T14:50:00Z'::timestamptz
from reviewed, public.pick_events event
where bout.event_id = 'ufc-333-alexander-volkanovski-vs-movsar-evloev-2026-10-24'
  and bout.event_id = event.event_id
  and event.status = 'upcoming'
  and bout.included_in_picks
  and bout.locks_at > now()
  and bout.bout_id = reviewed.bout_id
  and bout.red_fighter_slug = reviewed.red_slug
  and bout.blue_fighter_slug = reviewed.blue_slug
  and bout.red_american_odds is null
  and bout.blue_american_odds is null;
