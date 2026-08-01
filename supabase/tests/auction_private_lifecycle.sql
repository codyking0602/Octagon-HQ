begin;
select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_challenger uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_unrelated uuid := extensions.gen_random_uuid();
  v_auction uuid := extensions.gen_random_uuid();
  v_challenge uuid := extensions.gen_random_uuid();
  v_deck_entry uuid := extensions.gen_random_uuid();
  v_payload jsonb;
  v_rejected boolean;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-challenger@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-recipient@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_unrelated, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-unrelated@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Auction Challenger', 'AUCTION CHALLENGER', 'AC'),
    (v_recipient, 'Auction Recipient', 'AUCTION RECIPIENT', 'AR'),
    (v_unrelated, 'Auction Unrelated', 'AUCTION UNRELATED', 'AU');

  insert into public.play_challenges (
    id, code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    v_challenge, 'AUCT0001', 'auction', 'auction-v1', 'Auction', 'Private Auction fixture',
    v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb
  );

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll
  ) values (
    v_auction, v_challenger, v_recipient, 'ultimate-fighter', v_challenge, 'active',
    'catalog-test', 'rarity-test', 'grading-test', v_challenger, 50, 50
  );

  insert into private.auction_deck_entries (
    id, auction_id, deck_position, private_item_reference
  ) values
    (v_deck_entry, v_auction, 1, 'private-current-item'),
    (extensions.gen_random_uuid(), v_auction, 2, 'private-future-item');

  insert into private.auction_pending_bids (
    auction_id, round_number, bidder_id, amount, ultimate_fighter_category
  ) values (v_auction, 1, v_challenger, 37, 'Striking');

  insert into private.auction_awards (
    auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
  ) values (v_auction, v_deck_entry, v_recipient, 1, 'Heart');

  if has_table_privilege('anon', 'private.auction_games', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_games', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_pending_bids', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_deck_entries', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_awards', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_games', 'INSERT,UPDATE,DELETE')
  then
    raise exception 'browser roles have direct Auction-private table access';
  end if;

  if has_function_privilege('anon', 'public.get_auction_participant_state(uuid)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.get_auction_participant_state(uuid)', 'EXECUTE')
  then
    raise exception 'Auction safe projection privileges are incorrect';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload is null
    or v_payload->>'auction_id' <> v_auction::text
    or jsonb_typeof(v_payload->'current_user_submitted_bid') <> 'boolean'
    or (v_payload->>'current_user_submitted_bid')::boolean is not true
  then
    raise exception 'challenger safe projection was missing or malformed: %', v_payload;
  end if;

  if v_payload ?| array[
      'amount', 'bid_amount', 'ultimate_fighter_category', 'private_item_reference',
      'content_version', 'rarity_version', 'grading_version', 'random_seed',
      'grading_weights', 'intermediate_score'
    ]
    or v_payload::text like '%private-future-item%'
    or v_payload::text like '%private-current-item%'
    or v_payload::text like '%"37"%'
    or v_payload::text like '%Striking%'
  then
    raise exception 'safe projection leaked sealed or future private state: %', v_payload;
  end if;

  if jsonb_array_length(v_payload->'awarded_collections') <> 1
    or (v_payload->'awarded_collections'->0)->>'category' <> 'Heart'
  then
    raise exception 'visible awarded collection foundation was not projected safely: %', v_payload;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;
  if v_payload is null
    or jsonb_typeof(v_payload->'current_user_submitted_bid') <> 'boolean'
    or (v_payload->>'current_user_submitted_bid')::boolean is not false
  then
    raise exception 'recipient safe projection was missing or exposed a non-boolean bid state: %', v_payload;
  end if;

  perform set_config('request.jwt.claim.sub', v_unrelated::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_auction)) then
    raise exception 'unrelated authenticated profile read an Auction projection';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_rejected := false;
  begin
    insert into private.auction_games (
      challenger_id, recipient_id, mode_id, lifecycle_state,
      content_version, rarity_version, grading_version, tie_priority_profile_id,
      challenger_bankroll, recipient_bankroll
    ) values (
      v_challenger, v_challenger, 'strikers', 'prepared',
      'v1', 'v1', 'v1', v_challenger, 40, 40
    );
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'self-challenge was accepted'; end if;

  v_rejected := false;
  begin
    insert into private.auction_games (
      challenger_id, recipient_id, mode_id, lifecycle_state,
      content_version, rarity_version, grading_version, tie_priority_profile_id,
      challenger_bankroll, recipient_bankroll
    ) values (
      v_challenger, extensions.gen_random_uuid(), 'strikers', 'prepared',
      'v1', 'v1', 'v1', v_challenger, 40, 40
    );
  exception when foreign_key_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'invalid participant was accepted'; end if;

  v_rejected := false;
  begin
    update private.auction_games set challenger_bankroll = -1 where id = v_auction;
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'negative bankroll was accepted'; end if;

  v_rejected := false;
  begin
    update private.auction_games set challenger_selection_count = 6 where id = v_auction;
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'excess selection count was accepted'; end if;

  v_rejected := false;
  begin
    update private.auction_games set revision = -1 where id = v_auction;
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'negative revision was accepted'; end if;

  v_rejected := false;
  begin
    update private.auction_games set current_round = 11 where id = v_auction;
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'out-of-range round was accepted'; end if;

  v_rejected := false;
  begin
    update private.auction_games
    set lifecycle_state = 'completed', challenger_final_score = 101,
        recipient_final_score = 90, winner_profile_id = v_challenger
    where id = v_auction;
  exception when check_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'out-of-range final score was accepted'; end if;

  v_rejected := false;
  begin
    insert into private.auction_games (
      challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
      content_version, rarity_version, grading_version, tie_priority_profile_id,
      challenger_bankroll, recipient_bankroll
    ) values (
      v_challenger, v_recipient, 'strikers', v_challenge, 'sent',
      'v2', 'v2', 'v2', v_recipient, 40, 40
    );
  exception when unique_violation then v_rejected := true;
  end;
  if not v_rejected then raise exception 'canonical challenge was shared by multiple Auctions'; end if;

  v_rejected := false;
  begin
    update public.play_challenges set game_id = 'wavelength' where id = v_challenge;
  exception when others then
    if position('Linked Auction challenge identity cannot change' in sqlerrm) > 0 then
      v_rejected := true;
    else
      raise;
    end if;
  end;
  if not v_rejected then raise exception 'linked canonical challenge identity was mutable'; end if;
end $$;

do $$
declare
  v_challenger uuid;
  v_recipient uuid;
  v_challenge uuid;
  v_cancelled uuid;
  v_tie uuid := extensions.gen_random_uuid();
  v_tie_challenge uuid := extensions.gen_random_uuid();
  v_rejected boolean := false;
begin
  select id into v_challenger from public.profiles where normalized_name = 'AUCTION CHALLENGER';
  select id into v_recipient from public.profiles where normalized_name = 'AUCTION RECIPIENT';
  select id into v_challenge from public.play_challenges where code = 'AUCT0001';

  select id into v_cancelled from private.auction_games where challenge_id = v_challenge;
  update private.auction_games
  set lifecycle_state = 'cancelled', cancelled_by = v_recipient, cancelled_at = now()
  where id = v_cancelled;

  begin
    update private.auction_games set lifecycle_state = 'active', cancelled_by = null, cancelled_at = null
    where id = v_cancelled;
  exception when others then
    if position('terminal state' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'cancelled Auction was not terminal'; end if;

  insert into public.play_challenges (
    id, code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    v_tie_challenge, 'AUCT0002', 'auction', 'auction-v1', 'Auction', 'Tie fixture',
    v_challenger, v_recipient, '/play/auction', '{}'::jsonb, '{}'::jsonb
  );

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, tie_priority_profile_id,
    challenger_bankroll, recipient_bankroll,
    challenger_final_score, recipient_final_score, winner_profile_id
  ) values (
    v_tie, v_challenger, v_recipient, 'strikers', v_tie_challenge, 'completed',
    'v1', 'v1', 'v1', v_recipient, 20, 20, 88, 88, null
  );

  if not exists (select 1 from private.auction_games where id = v_tie and winner_profile_id is null) then
    raise exception 'numeric tie result invariant is missing';
  end if;
end $$;

rollback;
