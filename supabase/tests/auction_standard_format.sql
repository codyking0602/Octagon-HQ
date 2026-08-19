begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Prior frozen Auction suites deliberately commit their pinned preparation pointer.
-- Re-establish the current v4 pointer inside this rollback-only focused test.
update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'ufc-auction-2026-08-v4';

do $$
declare
  v_v3_fighter_count integer;
  v_v4_fighter_count integer;
  v_mode text;
begin
  if (select count(*) from private.auction_catalog_versions where is_preparation_version) <> 1
    or not exists (
      select 1
      from private.auction_catalog_versions
      where content_version = 'ufc-auction-2026-08-v4'
        and rarity_version = 'balanced-rarity-2026-08-v2'
        and grading_version = 'ufc-private-grader-2026-08-v2'
        and is_preparation_version
    )
  then
    raise exception 'v4 is not the single current Auction preparation snapshot';
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v4'
      and mode_id in ('championship-performances', 'dominant-performances')
  ) then
    raise exception 'retired performance modes leaked into the current catalog';
  end if;

  if (select count(distinct mode_id) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v4') <> 14 then
    raise exception 'v4 does not contain exactly fourteen current Auction modes';
  end if;

  select count(*) into v_v3_fighter_count
  from private.auction_catalog
  where content_version = 'ufc-auction-2026-08-v3'
    and mode_id = 'fighter-performances';

  select count(*) into v_v4_fighter_count
  from private.auction_catalog
  where content_version = 'ufc-auction-2026-08-v4'
    and mode_id = 'fighter-performances';

  if v_v4_fighter_count - v_v3_fighter_count < 12 then
    raise exception 'Best Fighter Performances was not meaningfully deepened: v3 %, v4 %', v_v3_fighter_count, v_v4_fighter_count;
  end if;

  if exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v4'
      and mode_id = 'fighter-performances'
      and item_reference like 'consolidated-%'
      and (grading_inputs ->> 'overall')::numeric < 90
  ) then
    raise exception 'a non-elite retired performance was promoted into the consolidated pool';
  end if;

  if exists (
    select 1
    from (
      (
        select item_reference, display_label, display_description, rarity_band,
          generation_weight, private_generation_class, grading_inputs
        from private.auction_catalog
        where content_version = 'ufc-auction-2026-08-v3' and mode_id = 'finishes'
        except
        select item_reference, display_label, display_description, rarity_band,
          generation_weight, private_generation_class, grading_inputs
        from private.auction_catalog
        where content_version = 'ufc-auction-2026-08-v4' and mode_id = 'finishes'
      )
      union all
      (
        select item_reference, display_label, display_description, rarity_band,
          generation_weight, private_generation_class, grading_inputs
        from private.auction_catalog
        where content_version = 'ufc-auction-2026-08-v4' and mode_id = 'finishes'
        except
        select item_reference, display_label, display_description, rarity_band,
          generation_weight, private_generation_class, grading_inputs
        from private.auction_catalog
        where content_version = 'ufc-auction-2026-08-v3' and mode_id = 'finishes'
      )
    ) finish_diff
  ) then
    raise exception 'Best Finishes changed during performance consolidation';
  end if;

  foreach v_mode in array array['rivalries', 'iconic-moments', 'nicknames'] loop
    if (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v4' and mode_id = v_mode)
      <> (select count(*) from private.auction_catalog where content_version = 'ufc-auction-2026-08-v3' and mode_id = v_mode)
    then
      raise exception 'current Auction mode % did not survive v4 unchanged', v_mode;
    end if;
  end loop;

  if not exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v3'
      and mode_id = 'championship-performances'
  ) or not exists (
    select 1
    from private.auction_catalog
    where content_version = 'ufc-auction-2026-08-v3'
      and mode_id = 'dominant-performances'
  ) then
    raise exception 'historical v3 retired-mode snapshots were mutated';
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000f1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000f2';
  v_historical_game constant uuid := '00000000-0000-0000-0000-0000000000f3';
  v_current_game_a constant uuid := '00000000-0000-0000-0000-0000000000f4';
  v_current_game_b constant uuid := '00000000-0000-0000-0000-0000000000f5';
  v_auction_id uuid;
  v_challenge uuid;
  v_game private.auction_games;
  v_rejected boolean := false;
  v_definition text;
  v_historical_score numeric;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-standard-f1@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-standard-f2@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Auction Standard F1', 'AUCTION STANDARD F1', 'F1'),
    (v_recipient, 'Auction Standard F2', 'AUCTION STANDARD F2', 'F2');

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_auction_id := public.prepare_auction(v_recipient, 'strikers');

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = v_auction_id;

  if v_game.content_version <> 'ufc-auction-2026-08-v4'
    or v_game.rarity_version <> 'balanced-rarity-2026-08-v2'
    or v_game.grading_version <> 'ufc-private-grader-2026-08-v2'
    or v_game.challenger_bankroll <> 30
    or v_game.recipient_bankroll <> 30
    or (select count(*) from private.auction_deck_entries where auction_id = v_auction_id) <> 6
  then
    raise exception 'new standard Auction did not pin the 6-round / $30 v4 format';
  end if;

  perform private.validate_auction_bid(v_game, v_challenger, 28, null);
  begin
    perform private.validate_auction_bid(v_game, v_challenger, 29, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'new standard Auction did not reserve $1 for both remaining selections';
  end if;

  v_rejected := false;
  begin
    perform public.prepare_auction(v_recipient, 'championship-performances');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Best Championship Performances is still selectable';
  end if;

  v_rejected := false;
  begin
    perform public.prepare_auction(v_recipient, 'dominant-performances');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Most Dominant Performances is still selectable';
  end if;

  v_game.content_version := 'ufc-auction-2026-08-v1';
  v_game.challenger_bankroll := 40;
  v_game.challenger_selection_count := 0;
  v_rejected := false;
  begin
    perform private.validate_auction_bid(v_game, v_challenger, 38, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'legacy pinned Auction no longer keeps its four-selection reserve rule';
  end if;

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary, creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'AUCV3H01', 'auction', 'auction-server-v3', 'Auction', 'championship-performances',
    v_challenger, v_recipient, '/play/auction?auction=' || v_historical_game, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll, challenger_selection_count, recipient_selection_count
  ) values (
    v_historical_game, v_challenger, v_recipient, 'championship-performances', v_challenge, 'active',
    'ufc-auction-2026-08-v3', 'balanced-rarity-2026-08-v2', 'ufc-private-grader-2026-08-v2',
    6, v_challenger, 20, 20, 3, 3
  );

  perform private.generate_auction_deck(
    v_historical_game, 'ufc-auction-2026-08-v3', 'championship-performances', 6, null
  );
  insert into private.auction_awards (auction_id, deck_entry_id, awarded_to, resolved_round)
  select v_historical_game, deck.id,
    case when deck.deck_position <= 3 then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id = v_historical_game;

  perform private.grade_auction(v_historical_game);
  select challenger_final_score into v_historical_score
  from private.auction_games where id = v_historical_game;
  perform private.grade_auction(v_historical_game);
  if (select lifecycle_state from private.auction_games where id = v_historical_game) <> 'completed'
    or (select challenger_final_score from private.auction_games where id = v_historical_game) is distinct from v_historical_score
  then
    raise exception 'historical v3 retired-mode snapshot did not replay idempotently';
  end if;

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary, creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'AUCV4A01', 'auction', 'auction-server-v3', 'Auction', 'fighter-performances',
    v_challenger, v_recipient, '/play/auction?auction=' || v_current_game_a, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;
  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll, challenger_selection_count, recipient_selection_count
  ) values (
    v_current_game_a, v_challenger, v_recipient, 'fighter-performances', v_challenge, 'active',
    'ufc-auction-2026-08-v4', 'balanced-rarity-2026-08-v2', 'ufc-private-grader-2026-08-v2',
    6, v_challenger, 20, 20, 3, 3
  );

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary, creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    'AUCV4B01', 'auction', 'auction-server-v3', 'Auction', 'fighter-performances',
    v_challenger, v_recipient, '/play/auction?auction=' || v_current_game_b, '{}'::jsonb, '{}'::jsonb
  ) returning id into v_challenge;
  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll, challenger_selection_count, recipient_selection_count
  ) values (
    v_current_game_b, v_challenger, v_recipient, 'fighter-performances', v_challenge, 'active',
    'ufc-auction-2026-08-v4', 'balanced-rarity-2026-08-v2', 'ufc-private-grader-2026-08-v2',
    6, v_challenger, 20, 20, 3, 3
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_current_game_a, row_number() over (order by catalog.item_reference), catalog.item_reference
  from private.auction_catalog catalog
  where catalog.content_version = 'ufc-auction-2026-08-v4'
    and catalog.mode_id = 'fighter-performances'
  order by catalog.item_reference
  limit 6;

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_current_game_b, source.deck_position, source.private_item_reference
  from private.auction_deck_entries source
  where source.auction_id = v_current_game_a
  order by source.deck_position;

  insert into private.auction_awards (auction_id, deck_entry_id, awarded_to, resolved_round)
  select deck.auction_id, deck.id,
    case when deck.deck_position <= 3 then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id in (v_current_game_a, v_current_game_b);

  perform private.grade_auction(v_current_game_a);
  perform private.grade_auction(v_current_game_b);

  if (select challenger_final_score from private.auction_games where id = v_current_game_a)
      is distinct from (select challenger_final_score from private.auction_games where id = v_current_game_b)
    or (select recipient_final_score from private.auction_games where id = v_current_game_a)
      is distinct from (select recipient_final_score from private.auction_games where id = v_current_game_b)
    or (select winner_profile_id from private.auction_games where id = v_current_game_a)
      is distinct from (select winner_profile_id from private.auction_games where id = v_current_game_b)
  then
    raise exception 'identical current Auction decks did not grade identically';
  end if;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  if v_definition not like '%ufc-auction-2026-08-v3%'
    or v_definition not like '%ufc-auction-2026-08-v4%'
    or v_definition not like '%then 6 else 8%'
    or v_definition not like '%then 3 else 4%'
  then
    raise exception 'Auction resolution does not preserve versioned v3/v4 format rules';
  end if;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  if v_definition not like '%ufc-auction-2026-08-v3%'
    or v_definition not like '%ufc-auction-2026-08-v4%'
    or v_definition not like '%then 3 else 4%'
  then
    raise exception 'Auction grading does not support the pinned v3/v4 three-selection format';
  end if;
end;
$$;

rollback;
