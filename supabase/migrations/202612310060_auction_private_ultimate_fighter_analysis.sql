create or replace function private.auction_ultimate_fighter_analysis(p_auction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_game private.auction_games;
  v_total integer;
  v_scored integer;
  v_distinct_categories integer;
  v_distinct_pairs integer;
  v_invalid_categories integer;
  v_invalid_participants integer;
  v_invalid_ratings integer;
  v_result jsonb;
begin
  select auction.*
  into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.mode_id <> 'ultimate-fighter' then
    raise exception 'Auction matchup analysis is only available for Build the Ultimate Fighter';
  end if;

  if v_game.lifecycle_state <> 'completed' then
    raise exception 'Auction matchup analysis requires a completed game';
  end if;

  if v_game.winner_profile_id is not null
    and v_game.winner_profile_id <> v_game.challenger_id
    and v_game.winner_profile_id <> v_game.recipient_id
  then
    raise exception 'Auction matchup analysis has an invalid stored winner';
  end if;

  with scored as (
    select
      award.awarded_to,
      award.visible_category,
      catalog.display_label,
      (catalog.grading_inputs ->> award.visible_category)::numeric as private_rating
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id
      and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
  )
  select
    count(*),
    count(private_rating),
    count(distinct visible_category),
    count(distinct (awarded_to, visible_category)),
    count(*) filter (
      where visible_category not in ('Striking', 'Grappling', 'Frame', 'Power', 'Heart')
    ),
    count(*) filter (
      where awarded_to <> v_game.challenger_id
        and awarded_to <> v_game.recipient_id
    ),
    count(*) filter (
      where private_rating is not null
        and private_rating not between 0 and 100
    )
  into
    v_total,
    v_scored,
    v_distinct_categories,
    v_distinct_pairs,
    v_invalid_categories,
    v_invalid_participants,
    v_invalid_ratings
  from scored;

  if v_total <> 10
    or v_scored <> 10
    or v_distinct_categories <> 5
    or v_distinct_pairs <> 10
    or v_invalid_categories <> 0
    or v_invalid_participants <> 0
    or v_invalid_ratings <> 0
  then
    raise exception 'Auction matchup analysis inputs are incomplete or invalid';
  end if;

  with scored as (
    select
      award.awarded_to,
      award.visible_category,
      catalog.display_label,
      (catalog.grading_inputs ->> award.visible_category)::numeric as private_rating
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id
      and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
  ), paired as (
    select
      visible_category as category,
      case visible_category
        when 'Striking' then 1
        when 'Grappling' then 2
        when 'Frame' then 3
        when 'Power' then 4
        when 'Heart' then 5
      end as category_order,
      max(display_label) filter (where awarded_to = v_game.challenger_id) as challenger_fighter,
      max(display_label) filter (where awarded_to = v_game.recipient_id) as recipient_fighter,
      max(private_rating) filter (where awarded_to = v_game.challenger_id) as challenger_rating,
      max(private_rating) filter (where awarded_to = v_game.recipient_id) as recipient_rating
    from scored
    group by visible_category
  ), compared as (
    select
      category,
      category_order,
      challenger_fighter,
      recipient_fighter,
      challenger_rating - recipient_rating as private_delta
    from paired
  ), ranked as (
    select
      category,
      category_order,
      challenger_fighter,
      recipient_fighter,
      private_delta,
      dense_rank() over (order by abs(private_delta) desc) as swing_rank,
      max(abs(private_delta)) over () as max_private_gap,
      min(abs(private_delta)) over () as min_private_gap,
      case
        when private_delta > 0 then 'challenger'
        when private_delta < 0 then 'recipient'
        else 'tie'
      end as edge
    from compared
  )
  select jsonb_build_object(
    'schema_version', 'ultimate-fighter-relational-v1',
    'winner', case
      when v_game.winner_profile_id = v_game.challenger_id then 'challenger'
      when v_game.winner_profile_id = v_game.recipient_id then 'recipient'
      else 'tie'
    end,
    'category_wins', jsonb_build_object(
      'challenger', (select count(*) from ranked where edge = 'challenger'),
      'recipient', (select count(*) from ranked where edge = 'recipient'),
      'ties', (select count(*) from ranked where edge = 'tie')
    ),
    'strongest_swings', coalesce((
      select jsonb_agg(
        jsonb_build_object('category', category, 'edge', edge)
        order by category_order
      )
      from ranked
      where abs(private_delta) = max_private_gap
    ), '[]'::jsonb),
    'closest_swings', coalesce((
      select jsonb_agg(
        jsonb_build_object('category', category, 'edge', edge)
        order by category_order
      )
      from ranked
      where abs(private_delta) = min_private_gap
    ), '[]'::jsonb),
    'category_edges', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'category', category,
          'challenger_fighter', challenger_fighter,
          'recipient_fighter', recipient_fighter,
          'edge', edge,
          'swing_rank', swing_rank
        )
        order by swing_rank, category_order
      )
      from ranked
    ), '[]'::jsonb)
  )
  into v_result;

  return v_result;
end;
$$;

comment on function private.auction_ultimate_fighter_analysis(uuid) is
  'Builds an internal relational matchup packet for a completed Build the Ultimate Fighter game. Exact category ratings, numeric gaps, and rating exchange codes remain private and are never returned.';

revoke all on function private.auction_ultimate_fighter_analysis(uuid) from public, anon, authenticated, service_role;