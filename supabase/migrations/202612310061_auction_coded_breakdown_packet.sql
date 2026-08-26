create or replace function public.get_auction_fight_breakdown_packet(p_auction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_game private.auction_games;
  v_user_id uuid := auth.uid();
  v_challenger_name text;
  v_recipient_name text;
  v_challenger_selections jsonb;
  v_recipient_selections jsonb;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_category_count integer;
  v_recipient_category_count integer;
  v_winner_side text;
begin
  if v_user_id is null then
    raise exception 'Auction fight breakdown requires authentication';
  end if;

  select auction.*
  into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.id is null then
    raise exception 'Auction fight breakdown unavailable';
  end if;

  if v_user_id not in (v_game.challenger_id, v_game.recipient_id) then
    raise exception 'Auction fight breakdown unavailable';
  end if;

  if v_game.mode_id <> 'ultimate-fighter' then
    raise exception 'Auction fight breakdown is only available for Build the Ultimate Fighter';
  end if;

  if v_game.lifecycle_state <> 'completed' then
    raise exception 'Auction fight breakdown is only available after completion';
  end if;

  select profile.display_name
  into strict v_challenger_name
  from public.profiles profile
  where profile.id = v_game.challenger_id;

  select profile.display_name
  into strict v_recipient_name
  from public.profiles profile
  where profile.id = v_game.recipient_id;

  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'category', award.visible_category,
        'fighter', catalog.display_label,
        'code', private.auction_rating_code(
          (catalog.grading_inputs ->> award.visible_category)::numeric
        )
      )
      order by award.resolved_round, deck.deck_position
    ), '[]'::jsonb),
    count(*),
    count(distinct award.visible_category)
  into
    v_challenger_selections,
    v_challenger_count,
    v_challenger_category_count
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.auction_catalog catalog
    on catalog.content_version = v_game.content_version
    and catalog.mode_id = v_game.mode_id
    and catalog.item_reference = deck.private_item_reference
  where award.auction_id = v_game.id
    and award.awarded_to = v_game.challenger_id;

  select
    coalesce(jsonb_agg(
      jsonb_build_object(
        'category', award.visible_category,
        'fighter', catalog.display_label,
        'code', private.auction_rating_code(
          (catalog.grading_inputs ->> award.visible_category)::numeric
        )
      )
      order by award.resolved_round, deck.deck_position
    ), '[]'::jsonb),
    count(*),
    count(distinct award.visible_category)
  into
    v_recipient_selections,
    v_recipient_count,
    v_recipient_category_count
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.auction_catalog catalog
    on catalog.content_version = v_game.content_version
    and catalog.mode_id = v_game.mode_id
    and catalog.item_reference = deck.private_item_reference
  where award.auction_id = v_game.id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 5
    or v_recipient_count <> 5
    or v_challenger_category_count <> 5
    or v_recipient_category_count <> 5
  then
    raise exception 'Auction fight breakdown inputs are incomplete or invalid';
  end if;

  v_winner_side := case
    when v_game.winner_profile_id is null then 'tie'
    when v_game.winner_profile_id = v_game.challenger_id then 'challenger'
    when v_game.winner_profile_id = v_game.recipient_id then 'recipient'
    else null
  end;

  if v_winner_side is null then
    raise exception 'Auction fight breakdown result is invalid';
  end if;

  return jsonb_build_object(
    'packet_version', 'auction-fight-breakdown-v1',
    'mode', 'ultimate-fighter',
    'winner', v_winner_side,
    'challenger', jsonb_build_object(
      'name', v_challenger_name,
      'score', v_game.challenger_final_score,
      'selections', v_challenger_selections
    ),
    'recipient', jsonb_build_object(
      'name', v_recipient_name,
      'score', v_game.recipient_final_score,
      'selections', v_recipient_selections
    )
  );
end;
$$;

comment on function public.get_auction_fight_breakdown_packet(uuid) is
  'Participant-only completed Build the Ultimate Fighter packet for Octagon Verdict. Returns public result data plus opaque private-rating codes; never returns hidden ratings, deltas, advantage labels, the decoder, or the separate private matchup-analysis output.';

revoke all on function public.get_auction_fight_breakdown_packet(uuid) from public, anon;
grant execute on function public.get_auction_fight_breakdown_packet(uuid) to authenticated;
