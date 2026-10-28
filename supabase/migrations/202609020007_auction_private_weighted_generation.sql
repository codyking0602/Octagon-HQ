-- Auction PR 5: retain the single generator owner and add private weighted safeguards.

create or replace function private.generate_auction_deck(
  p_auction_id uuid,
  p_content_version text,
  p_mode_id text,
  p_count integer,
  p_random_order double precision[] default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_available integer;
  v_inserted integer;
begin
  if p_count < 1 then
    raise exception 'Auction deck size must be positive';
  end if;

  if exists (
    select 1
    from private.auction_deck_entries deck
    where deck.auction_id = p_auction_id
  ) then
    raise exception 'Auction deck is already fixed';
  end if;

  select count(*)
    into v_available
  from private.auction_catalog catalog
  where catalog.content_version = p_content_version
    and catalog.mode_id = p_mode_id;

  if v_available < p_count then
    raise exception 'Auction catalog does not contain enough unique items';
  end if;

  if p_random_order is not null
    and cardinality(p_random_order) <> v_available
  then
    raise exception 'Injected Auction random order has the wrong size';
  end if;

  with candidates as (
    select
      catalog.item_reference,
      catalog.rarity_band,
      catalog.private_generation_class,
      -ln(greatest(0.0000001, least(0.9999999,
        case
          when p_random_order is null then random()
          else 1.0 / (1.0 + exp(-p_random_order[(row_number() over (order by catalog.item_reference))::integer]))
        end
      ))) / catalog.generation_weight as weighted_key
    from private.auction_catalog catalog
    where catalog.content_version = p_content_version
      and catalog.mode_id = p_mode_id
  ), ranked as (
    select
      candidates.*,
      row_number() over (
        partition by (private_generation_class in ('mythic', 'crown'))
        order by weighted_key, item_reference
      ) as mythic_crown_rank,
      row_number() over (
        partition by (private_generation_class in ('ace', 'headliner', 'signature'))
        order by weighted_key, item_reference
      ) as featured_rank,
      row_number() over (
        partition by (rarity_band >= 4)
        order by weighted_key, item_reference
      ) as high_end_rank
    from candidates
  ), eligible as (
    select *
    from ranked
    where (private_generation_class not in ('mythic', 'crown') or mythic_crown_rank <= 2)
      and (private_generation_class not in ('ace', 'headliner', 'signature') or featured_rank <= 2)
      and (rarity_band < 4 or high_end_rank <= 4)
  ), selected as (
    select item_reference, row_number() over (order by weighted_key, item_reference) as deck_position
    from eligible
    order by weighted_key, item_reference
    limit p_count
  )
  insert into private.auction_deck_entries (
    auction_id,
    deck_position,
    private_item_reference
  )
  select p_auction_id, deck_position, item_reference
  from selected;

  get diagnostics v_inserted = row_count;
  if v_inserted <> p_count then
    raise exception 'Auction generation safeguards underfilled the deck';
  end if;
end;
$$;
