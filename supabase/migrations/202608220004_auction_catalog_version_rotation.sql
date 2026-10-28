-- Auction PR 3 hardening: keep pinned version identities immutable while allowing
-- a future reviewed catalog release to become the preparation version.

create or replace function private.protect_auction_catalog_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Auction catalog versions cannot be deleted';
  end if;

  if new.content_version is distinct from old.content_version
    or new.rarity_version is distinct from old.rarity_version
    or new.grading_version is distinct from old.grading_version
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Auction catalog version identities are immutable';
  end if;

  return new;
end;
$$;

create or replace function private.validate_auction_catalog_deck_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_content_version text;
  v_mode_id text;
begin
  select auction.content_version, auction.mode_id
    into v_content_version, v_mode_id
  from private.auction_games auction
  where auction.id = new.auction_id;

  if exists (
    select 1
    from private.auction_catalog_versions version
    where version.content_version = v_content_version
  )
    and not exists (
      select 1
      from private.auction_catalog catalog
      where catalog.content_version = v_content_version
        and catalog.mode_id = v_mode_id
        and catalog.item_reference = new.private_item_reference
    )
  then
    raise exception 'Auction deck item is not in the pinned catalog';
  end if;

  return new;
end;
$$;

drop trigger auction_catalog_versions_immutable
  on private.auction_catalog_versions;

create trigger auction_catalog_version_identity_immutable
before update or delete on private.auction_catalog_versions
for each row execute function private.protect_auction_catalog_version();

create trigger auction_catalog_deck_entry_valid
before insert on private.auction_deck_entries
for each row execute function private.validate_auction_catalog_deck_entry();

revoke all on function private.protect_auction_catalog_version()
  from public, anon, authenticated;
revoke all on function private.validate_auction_catalog_deck_entry()
  from public, anon, authenticated;

comment on function private.protect_auction_catalog_version() is
  'Preserves immutable content, rarity, and grading identities while allowing a reviewed preparation-version pointer change.';
comment on function private.validate_auction_catalog_deck_entry() is
  'Requires catalog-backed Auction decks to use only items from the game pinned content version and mode.';
