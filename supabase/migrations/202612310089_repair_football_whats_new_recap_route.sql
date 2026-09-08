-- Repair Football recap What's New rows that were published before the completion owner became sport-aware.
-- Keep the existing What's New item and source key; only correct its canonical route in place.
update private.whats_new_items item
set route = '/football/picks?event=' || event.event_id || '&view=recap',
    updated_at = now()
from public.pick_events event
where event.sport = 'football'
  and item.source_key = 'picks:recap:' || event.event_id
  and item.route is distinct from '/football/picks?event=' || event.event_id || '&view=recap';
