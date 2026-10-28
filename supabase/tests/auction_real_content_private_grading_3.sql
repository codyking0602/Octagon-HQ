do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
  v_challenge uuid;
  v_game constant uuid := '00000000-0000-0000-0000-0000000000e3';
begin
  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'PR5ULT01', 'auction', 'auction-server-v3', 'Auction', 'ultimate-fighter',
    v_challenger, v_recipient, '/play/auction?auction=' || v_game::text, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_game, v_challenger, v_recipient, 'ultimate-fighter', v_challenge, 'active',
    'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1', 'ufc-private-grader-2026-08-v1', 10,
    v_challenger, 0, 50, 5, 5
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_game, position, reference
  from (values
    (1, 'ultimate-fighter-1'), (2, 'ultimate-fighter-2'), (3, 'ultimate-fighter-3'),
    (4, 'ultimate-fighter-6'), (5, 'ultimate-fighter-7'), (6, 'ultimate-fighter-29'),
    (7, 'ultimate-fighter-14'), (8, 'ultimate-fighter-23'), (9, 'ultimate-fighter-24'),
    (10, 'ultimate-fighter-20')
  ) deck(position, reference);

  insert into private.auction_awards (
    auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
  )
  select v_game, deck.id, assignment.awarded_to, deck.deck_position, assignment.category
  from private.auction_deck_entries deck
  join (values
    ('ultimate-fighter-1', v_challenger, 'Frame'),
    ('ultimate-fighter-2', v_challenger, 'Grappling'),
    ('ultimate-fighter-3', v_challenger, 'Striking'),
    ('ultimate-fighter-6', v_challenger, 'Power'),
    ('ultimate-fighter-7', v_challenger, 'Heart'),
    ('ultimate-fighter-29', v_recipient, 'Striking'),
    ('ultimate-fighter-14', v_recipient, 'Grappling'),
    ('ultimate-fighter-23', v_recipient, 'Frame'),
    ('ultimate-fighter-24', v_recipient, 'Power'),
    ('ultimate-fighter-20', v_recipient, 'Heart')
  ) assignment(reference, awarded_to, category)
    on assignment.reference = deck.private_item_reference
  where deck.auction_id = v_game;

  perform private.grade_auction(v_game);

  if not exists (
    select 1
    from private.auction_games
    where id = v_game
      and challenger_final_score = 99.00
      and recipient_final_score = 76.60
      and winner_profile_id = v_challenger
      and challenger_bankroll = 0
      and recipient_bankroll = 50
  ) then
    raise exception 'Ultimate Fighter category grading or bankroll isolation is incorrect';
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
  v_challenge uuid;
  v_game constant uuid := '00000000-0000-0000-0000-0000000000e4';
begin
  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'PR5OLD01', 'auction', 'auction-server-v3', 'Auction', 'strikers',
    v_challenger, v_recipient, '/play/auction?auction=' || v_game::text, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_game, v_challenger, v_recipient, 'strikers', v_challenge, 'active',
    'fixture-2026-08-22-v1', 'rarity-fixture-v1', 'grader-contract-v1', 8,
    v_challenger, 20, 20, 4, 4
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_game, row_number() over (order by catalog.item_reference), catalog.item_reference
  from private.auction_catalog catalog
  where catalog.content_version = 'fixture-2026-08-22-v1'
    and catalog.mode_id = 'strikers'
  order by catalog.item_reference
  limit 8;

  insert into private.auction_awards (auction_id, deck_entry_id, awarded_to, resolved_round)
  select v_game, deck.id,
    case when deck.deck_position <= 4 then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id = v_game;

  perform private.grade_auction(v_game);

  if not exists (
    select 1
    from private.auction_games
    where id = v_game
      and challenger_final_score = 0
      and recipient_final_score = 0
      and winner_profile_id is null
  ) then
    raise exception 'pinned pre-PR5 games did not retain their fixed neutral grader';
  end if;
end;
$$;
