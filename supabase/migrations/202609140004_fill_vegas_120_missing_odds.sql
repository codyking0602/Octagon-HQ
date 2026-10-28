-- One-time pre-fight repair for the three UFC Vegas 120 main-card bouts
-- that still have no player-facing moneyline. The existing monitoring owner
-- remains canonical for normal odds updates; this only fills currently-null
-- values and will not overwrite an automatic update that lands first.

update public.pick_bouts bout
set red_american_odds = 136,
    blue_american_odds = -162,
    odds_source = 'MMA Mania',
    odds_updated_at = now()
from public.pick_events event
where event.event_id = bout.event_id
  and event.status = 'upcoming'
  and event.starts_at > now()
  and bout.red_fighter_slug = 'billy-quarantillo'
  and bout.blue_fighter_slug = 'diego-ferreira'
  and bout.red_american_odds is null
  and bout.blue_american_odds is null;

update public.pick_bouts bout
set red_american_odds = 500,
    blue_american_odds = -700,
    odds_source = 'MMA Mania',
    odds_updated_at = now()
from public.pick_events event
where event.event_id = bout.event_id
  and event.status = 'upcoming'
  and event.starts_at > now()
  and bout.red_fighter_slug = 'darren-elkins'
  and bout.blue_fighter_slug = 'yadier-del-valle'
  and bout.red_american_odds is null
  and bout.blue_american_odds is null;

update public.pick_bouts bout
set red_american_odds = 230,
    blue_american_odds = -285,
    odds_source = 'MMA Mania',
    odds_updated_at = now()
from public.pick_events event
where event.event_id = bout.event_id
  and event.status = 'upcoming'
  and event.starts_at > now()
  and bout.red_fighter_slug = 'billy-ray-goff'
  and bout.blue_fighter_slug = 'ty-miller'
  and bout.red_american_odds is null
  and bout.blue_american_odds is null;
