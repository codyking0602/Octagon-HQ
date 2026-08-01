-- Public item identity must not reveal the private catalog key used by the server.
drop trigger auction_catalog_items_immutable on private.auction_catalog_items;
drop trigger auction_deck_entries_immutable on private.auction_deck_entries;

update private.auction_catalog_items
set public_item = jsonb_set(
  public_item,
  '{id}',
  to_jsonb('public-' || item_key),
  false
)
where content_version = 'auction-fixture-content-v1';

update private.auction_deck_entries deck
set public_item = jsonb_set(
  deck.public_item,
  '{id}',
  to_jsonb('public-' || deck.private_item_reference),
  false
)
from private.auction_games auction
where auction.id = deck.auction_id
  and auction.content_version = 'auction-fixture-content-v1';

create trigger auction_catalog_items_immutable
before update or delete on private.auction_catalog_items
for each row execute function private.enforce_auction_catalog_immutability();

create trigger auction_deck_entries_immutable
before update or delete on private.auction_deck_entries
for each row execute function private.enforce_auction_deck_immutability();
