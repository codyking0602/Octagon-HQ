do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
  v_challenge uuid;
  v_game constant uuid := '00000000-0000-0000-0000-0000000000e1';
  v_revision bigint;
  v_payload jsonb;
begin
  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'PR5WIN01', 'auction', 'auction-server-v3', 'Auction', 'strikers',
    v_challenger, v_recipient, '/play/auction?auction=' || v_game::text, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_game, v_challenger, v_recipient, 'strikers', v_challenge, 'active',
    'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1', 'ufc-private-grader-2026-08-v1', 8,
    v_challenger, 1, 40, 4, 4
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_game, position, reference
  from (values
    (1, 'strikers-1'), (2, 'strikers-2'), (3, 'strikers-3'), (4, 'strikers-4'),
    (5, 'strikers-13'), (6, 'strikers-14'), (7, 'strikers-15'), (8, 'strikers-16')
  ) deck(position, reference);

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
      and lifecycle_state = 'completed'
      and challenger_final_score = 97.50
      and recipient_final_score = 89.25
      and winner_profile_id = v_challenger
      and challenger_bankroll = 1
      and recipient_bankroll = 40
  ) then
    raise exception 'private grader used the wrong winner, score, or bankroll behavior';
  end if;

  select revision into v_revision from private.auction_games where id = v_game;
  perform private.grade_auction(v_game);
  if (select revision from private.auction_games where id = v_game) <> v_revision then
    raise exception 'private grader was not idempotent';
  end if;

  if not exists (
    select 1
    from public.play_challenges
    where id = v_challenge
      and creator_result = '{"overall_score": 97.50}'::jsonb
      and responder_result = '{"overall_score": 89.25}'::jsonb
      and completed_at is not null
  ) then
    raise exception 'challenge result persisted more or less than final overall scores';
  end if;

  perform pg_temp.set_actor(v_challenger);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_game) state;

  if v_payload is null
    or (v_payload->>'challenger_final_score')::numeric <> 97.50
    or (v_payload->>'recipient_final_score')::numeric <> 89.25
    or (v_payload->>'winner_profile_id')::uuid <> v_challenger
    or (v_payload->>'is_tie')::boolean
    or v_payload::text ~* '(generation_weight|private_generation_class|grading_inputs|rarity_band|content_version|rarity_version|grading_version|item_grade|category_grade|intermediate|explanation|overpay|bankroll_effect)'
  then
    raise exception 'completed participant projection leaked private grading data: %', v_payload;
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000b1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000b2';
  v_challenge uuid;
  v_game constant uuid := '00000000-0000-0000-0000-0000000000e2';
begin
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'PR5TIE01', 'auction', 'auction-server-v3', 'Auction', 'strikers',
    v_challenger, v_recipient, '/play/auction?auction=' || v_game::text, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_game, v_challenger, v_recipient, 'strikers', v_challenge, 'active',
    'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1', 'ufc-private-grader-2026-08-v1', 8,
    v_recipient, 40, 1, 4, 4
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_game, position, reference
  from (values
    (1, 'strikers-1'), (2, 'strikers-2'), (3, 'strikers-3'), (4, 'strikers-4'),
    (5, 'strikers-5'), (6, 'strikers-6'), (7, 'strikers-7'), (8, 'strikers-8')
  ) deck(position, reference);

  insert into private.auction_awards (auction_id, deck_entry_id, awarded_to, resolved_round)
  select v_game, deck.id,
    case when deck.private_item_reference in ('strikers-1', 'strikers-3', 'strikers-6', 'strikers-8')
      then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id = v_game;

  perform private.grade_auction(v_game);

  if not exists (
    select 1
    from private.auction_games
    where id = v_game
      and challenger_final_score = 95.50
      and recipient_final_score = 95.50
      and winner_profile_id is null
  ) then
    raise exception 'equal numeric scores did not produce a true tie';
  end if;
end;
$$;
