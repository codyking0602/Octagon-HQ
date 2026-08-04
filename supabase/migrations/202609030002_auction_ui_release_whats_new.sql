-- Publish one canonical Auction release announcement after the complete game and mobile polish ship.
-- The durable source key keeps retries and future deploys idempotent.

delete from private.whats_new_items
where kind = 'new_game'
  and source_key <> 'games:release:auction'
  and (
    source_key like 'games:new:%:auction'
    or lower(title) = 'auction is now playable'
  );

select public.publish_whats_new_item(
  'games:release:auction',
  'new_game',
  'games',
  'automatic',
  'Auction is now playable',
  'Choose a UFC auction, bid privately, and build the stronger collection.',
  '/play/auction',
  'PLAY AUCTION',
  now()
);
