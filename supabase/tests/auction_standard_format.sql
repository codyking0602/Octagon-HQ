begin;

select set_config('request.jwt.claim.role', 'service_role', true);

update private.auction_catalog_versions
set is_preparation_version = false
where is_preparation_version;

update private.auction_catalog_versions
set is_preparation_version = true
where content_version = 'ufc-auction-2026-08-v3';

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000f1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000f2';
  v_auction_id uuid;
  v_game private.auction_games;
  v_rejected boolean := false;
  v_definition text;
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

  if v_game.content_version <> 'ufc-auction-2026-08-v3'
    or v_game.rarity_version <> 'balanced-rarity-2026-08-v2'
    or v_game.grading_version <> 'ufc-private-grader-2026-08-v2'
    or v_game.challenger_bankroll <> 30
    or v_game.recipient_bankroll <> 30
    or (select count(*) from private.auction_deck_entries where auction_id = v_auction_id) <> 6
  then
    raise exception 'new standard Auction did not pin the 6-round / $30 v3 format';
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

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  if v_definition not like '%ufc-auction-2026-08-v3%'
    or v_definition not like '%then 6 else 8%'
    or v_definition not like '%then 3 else 4%'
  then
    raise exception 'Auction resolution does not preserve versioned format rules';
  end if;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  if v_definition not like '%ufc-auction-2026-08-v3%'
    or v_definition not like '%then 3 else 4%'
  then
    raise exception 'Auction grading does not support the pinned v3 three-selection format';
  end if;
end;
$$;

rollback;
