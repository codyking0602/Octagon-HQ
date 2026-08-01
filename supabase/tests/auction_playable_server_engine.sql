begin;
select set_config('request.jwt.claim.role', 'service_role', true);

-- The complete proof rolls back, including identities, challenges, notifications, and games.
do $$
declare
  v_challenger uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_alternate uuid := extensions.gen_random_uuid();
  v_unrelated uuid := extensions.gen_random_uuid();
  v_standard uuid;
  v_standard_repeat uuid;
  v_ultimate uuid;
  v_forced uuid;
  v_declined uuid;
  v_full_fixture uuid;
  v_full_challenge uuid := extensions.gen_random_uuid();
  v_standard_code text;
  v_ultimate_code text;
  v_forced_code text;
  v_declined_code text;
  v_payload jsonb;
  v_other_payload jsonb;
  v_current_reference text;
  v_future_reference text;
  v_current_public_id text;
  v_deck_one text[];
  v_deck_two text[];
  v_old_priority uuid;
  v_new_priority uuid;
  v_awarded_to uuid;
  v_rejected boolean;
  v_result boolean;
  v_revision bigint;
  v_round integer;
  v_challenger_bankroll integer;
  v_recipient_bankroll integer;
  v_challenger_count integer;
  v_recipient_count integer;
  v_lifecycle text;
  v_grading_status text;
  v_challenge_id uuid;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-engine-challenger@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-engine-recipient@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_alternate, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-engine-alternate@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_unrelated, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
      'auction-engine-unrelated@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'Engine Challenger', 'ENGINE CHALLENGER', 'EC'),
    (v_recipient, 'Engine Recipient', 'ENGINE RECIPIENT', 'ER'),
    (v_alternate, 'Engine Alternate', 'ENGINE ALTERNATE', 'EA'),
    (v_unrelated, 'Engine Unrelated', 'ENGINE UNRELATED', 'EU');

  if has_table_privilege('authenticated', 'private.auction_catalog_versions', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_catalog_items', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_deck_entries', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_pending_bids', 'SELECT')
    or has_table_privilege('authenticated', 'private.auction_awards', 'SELECT')
  then
    raise exception 'Authenticated clients have direct Auction-private access';
  end if;

  -- Injectable randomness exists only behind the private test boundary.
  v_standard := private.create_or_resume_auction_internal(
    v_challenger, v_recipient, 'strikers', 'deterministic-standard-deck'
  );
  v_standard_repeat := private.create_or_resume_auction_internal(
    v_challenger, v_alternate, 'strikers', 'deterministic-standard-deck'
  );

  select array_agg(deck.private_item_reference order by deck.deck_position)
    into v_deck_one
  from private.auction_deck_entries deck
  where deck.auction_id = v_standard;

  select array_agg(deck.private_item_reference order by deck.deck_position)
    into v_deck_two
  from private.auction_deck_entries deck
  where deck.auction_id = v_standard_repeat;

  if v_deck_one is distinct from v_deck_two then
    raise exception 'Deterministic Auction deck generation diverged';
  end if;

  if (select count(*) from private.auction_deck_entries where auction_id = v_standard) <> 8
    or (select count(distinct private_item_reference) from private.auction_deck_entries where auction_id = v_standard) <> 8
  then
    raise exception 'Eight-round Auction deck length or uniqueness is invalid';
  end if;

  select deck.private_item_reference, deck.public_item->>'id'
    into v_current_reference, v_current_public_id
  from private.auction_deck_entries deck
  where deck.auction_id = v_standard and deck.deck_position = 1;

  select deck.private_item_reference
    into v_future_reference
  from private.auction_deck_entries deck
  where deck.auction_id = v_standard and deck.deck_position = 2;

  -- The authenticated wrapper resumes the same prepared game instead of rerolling.
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  if public.create_or_resume_auction(v_recipient, 'strikers') <> v_standard
    or public.create_or_resume_auction(v_recipient, 'strikers') <> v_standard
  then
    raise exception 'Prepared Auction refresh created a reroll';
  end if;

  if (
    select count(*)
    from private.auction_games auction
    where auction.challenger_id = v_challenger
      and auction.recipient_id = v_recipient
      and auction.mode_id = 'strikers'
      and auction.lifecycle_state = 'prepared'
  ) <> 1 then
    raise exception 'Prepared Auction resume duplicated the game';
  end if;

  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_standard) state;

  if v_payload is null
    or v_payload->>'current_round' <> '1'
    or v_payload->>'round_count' <> '8'
    or v_payload->>'collection_target' <> '4'
    or v_payload->>'challenger_bankroll' <> '40'
    or v_payload->'current_item'->>'id' <> v_current_public_id
  then
    raise exception 'Prepared Auction projection is incomplete: %', v_payload;
  end if;

  if v_payload ?| array[
      'content_version', 'rarity_version', 'grading_version', 'rarity_key',
      'grading_inputs', 'grading_weights', 'intermediate_score', 'amount',
      'bid_amount', 'ultimate_fighter_category', 'private_item_reference', 'random_seed'
    ]
    or v_payload::text like '%' || v_future_reference || '%'
    or v_payload::text like '%' || v_current_reference || '%'
  then
    raise exception 'Prepared projection leaked private or future state: %', v_payload;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_standard)) then
    raise exception 'Recipient discovered an unsent prepared Auction';
  end if;

  perform set_config('request.jwt.claim.sub', v_unrelated::text, true);
  if exists (select 1 from public.get_auction_participant_state(v_standard)) then
    raise exception 'Unrelated user discovered a prepared Auction';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 1, null, 0);
  exception when others then
    if position('only the challenger' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Unauthorized user sent a prepared Auction'; end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_rejected := false;
  begin
    update private.auction_deck_entries
    set public_item = jsonb_set(public_item, '{label}', '"Changed"')
    where auction_id = v_standard and deck_position = 1;
  exception when others then
    if position('deck entries are immutable' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Prepared deck was mutable'; end if;

  -- Ultimate Fighter receives the correct ten-card, $50, five-selection configuration.
  v_ultimate := private.create_or_resume_auction_internal(
    v_challenger, v_recipient, 'ultimate-fighter', 'deterministic-ultimate-deck'
  );
  if (select count(*) from private.auction_deck_entries where auction_id = v_ultimate) <> 10
    or (select count(distinct private_item_reference) from private.auction_deck_entries where auction_id = v_ultimate) <> 10
  then
    raise exception 'Ultimate Fighter deck length or uniqueness is invalid';
  end if;
  if not exists (
    select 1 from private.auction_games
    where id = v_ultimate
      and challenger_bankroll = 50
      and recipient_bankroll = 50
  ) then
    raise exception 'Ultimate Fighter starting bankroll is invalid';
  end if;

  -- Opening bid validation and atomic canonical challenge send.
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 1.5, null, 0);
  exception when others then
    if position('whole dollars' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Fractional opening bid was accepted'; end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 0, null, 0);
  exception when others then
    if position('minimum bid' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception '$0 opening bid was accepted'; end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 38, null, 0);
  exception when others then
    if position('reserve maximum of $37' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Opening bid above the reserve maximum was accepted'; end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 1, 'Striking', 0);
  exception when others then
    if position('only valid for Ultimate Fighter' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Non-Ultimate category intent was accepted'; end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 1, null, 1);
  exception when others then
    if position('stale Auction revision' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Stale opening revision was accepted'; end if;

  v_standard_code := public.submit_auction_challenger_bid_and_send(v_standard, 37, null, 0);

  select auction.challenge_id into v_challenge_id
  from private.auction_games auction where auction.id = v_standard;

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge on challenge.id = auction.challenge_id
    where auction.id = v_standard
      and auction.lifecycle_state = 'sent'
      and auction.revision = 1
      and challenge.code = v_standard_code
      and challenge.game_id = 'auction'
      and challenge.creator_id = v_challenger
      and challenge.recipient_id = v_recipient
      and challenge.setup = jsonb_build_object('auction_id', v_standard, 'mode_id', 'strikers')
      and challenge.creator_result = jsonb_build_object('status', 'bid_locked')
      and challenge.opened_at is null
  ) then
    raise exception 'Challenger send did not create the canonical safe challenge';
  end if;

  if (select count(*) from public.play_challenges where id = v_challenge_id) <> 1
    or not exists (
      select 1 from private.notification_events
      where recipient_profile_id = v_recipient
        and source_key = 'auction:' || v_standard::text || ':challenge-received'
    )
  then
    raise exception 'Canonical Auction challenge or received notification is missing';
  end if;

  if exists (
    select 1 from private.notification_groups notification
    where notification.recipient_profile_id = v_recipient
      and notification.aggregation_key = 'auction:' || v_standard::text
      and (
        notification.summary like '%37%'
        or notification.summary like '%Striking%'
        or notification.summary like '%' || v_future_reference || '%'
      )
  ) then
    raise exception 'Challenge notification leaked private Auction state';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_challenger_bid_and_send(v_standard, 1, null, 1);
  exception when others then
    if position('already been sent or closed' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected or (select count(*) from public.play_challenges where id = v_challenge_id) <> 1 then
    raise exception 'Duplicate send created or relinked a challenge';
  end if;

  if public.open_play_challenge(v_standard_code) then
    raise exception 'Opening an Auction route incorrectly accepted the challenge';
  end if;
  if public.complete_play_challenge(v_standard_code, '{"unsafe":true}'::jsonb) then
    raise exception 'Generic challenge completion bypassed the Auction engine';
  end if;

  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_standard) state;
  if v_payload is null
    or (v_payload->>'current_user_submitted_bid')::boolean is not true
    or v_payload ?| array['amount', 'bid_amount', 'ultimate_fighter_category']
    or v_payload::text like '%"37"%'
    or v_payload::text like '%' || v_future_reference || '%'
  then
    raise exception 'Challenger sealed-bid projection leaked private state: %', v_payload;
  end if;

  -- Recipient accepts only by locking the first legal bid; first round resolves atomically.
  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_standard) state;
  if v_payload is null
    or (v_payload->>'current_user_submitted_bid')::boolean is not false
    or v_payload->>'action_required_by' <> 'recipient'
    or v_payload::text like '%"37"%'
  then
    raise exception 'Recipient saw the sealed challenger bid or wrong action state: %', v_payload;
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_standard, 1, 10, null, 0);
  exception when others then
    if position('stale Auction revision' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Recipient stale revision was accepted'; end if;

  perform public.submit_auction_bid(v_standard, 1, 10, null, 1);

  select lifecycle_state, current_round, revision,
         challenger_bankroll, recipient_bankroll,
         challenger_selection_count, recipient_selection_count
    into v_lifecycle, v_round, v_revision,
         v_challenger_bankroll, v_recipient_bankroll,
         v_challenger_count, v_recipient_count
  from private.auction_games where id = v_standard;

  if v_lifecycle <> 'active'
    or v_round <> 2
    or v_revision <> 2
    or v_challenger_bankroll <> 3
    or v_recipient_bankroll <> 40
    or v_challenger_count <> 1
    or v_recipient_count <> 0
  then
    raise exception 'Higher-bid resolution arithmetic is invalid';
  end if;

  if not exists (
    select 1 from private.auction_awards award
    where award.auction_id = v_standard
      and award.resolved_round = 1
      and award.awarded_to = v_challenger
      and award.winning_bid = 37
      and award.forced_assignment = false
  ) then
    raise exception 'Winner-pay/loser-free award record is invalid';
  end if;

  if not exists (
    select 1 from public.play_challenges
    where id = v_challenge_id and opened_at is not null
  ) or not exists (
    select 1 from private.notification_events
    where recipient_profile_id = v_challenger
      and source_key = 'auction:' || v_standard::text || ':challenge-accepted'
  ) then
    raise exception 'First recipient bid did not own canonical acceptance';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_standard, 1, 10, null, 2);
  exception when others then
    if position('stale Auction round' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Duplicate resolved-round bid was accepted'; end if;

  -- The $37 win leaves exactly $1 as the round-two maximum after reserve protection.
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_standard, 2, 2, null, 2);
  exception when others then
    if position('reserve maximum of $1' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Late-game reserve maximum was not enforced'; end if;

  select tie_priority_profile_id into v_old_priority
  from private.auction_games where id = v_standard;

  perform public.submit_auction_bid(v_standard, 2, 1, null, 2);
  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_standard, 2, 1, null, 2);
  exception when others then
    if position('already locked' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Locked sealed bid was editable or duplicated'; end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_standard) state;
  if (v_payload->>'current_user_submitted_bid')::boolean is not false
    or v_payload ?| array['amount', 'bid_amount', 'ultimate_fighter_category']
  then
    raise exception 'One-player pending bid leaked before resolution: %', v_payload;
  end if;

  perform public.submit_auction_bid(v_standard, 2, 1, null, 2);
  select tie_priority_profile_id into v_new_priority
  from private.auction_games where id = v_standard;
  select awarded_to into v_awarded_to
  from private.auction_awards
  where auction_id = v_standard and resolved_round = 2;

  if v_awarded_to <> v_old_priority or v_new_priority = v_old_priority then
    raise exception 'Tied round did not award visible priority and flip it';
  end if;

  -- A non-tied round preserves the newly flipped priority.
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  perform public.submit_auction_bid(v_standard, 3, 1, null, 3);
  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  perform public.submit_auction_bid(v_standard, 3, 2, null, 3);
  if (select tie_priority_profile_id from private.auction_games where id = v_standard) <> v_new_priority then
    raise exception 'Non-tied round changed tie priority';
  end if;

  -- Ultimate Fighter category intent is sealed before resolution and visible only on award.
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  v_ultimate_code := public.submit_auction_challenger_bid_and_send(
    v_ultimate, 2, 'Striking', 0
  );
  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_ultimate) state;
  if v_payload::text like '%Striking%'
    or v_payload ?| array['ultimate_fighter_category', 'category_intent']
  then
    raise exception 'Ultimate Fighter category intent leaked before resolution: %', v_payload;
  end if;
  perform public.submit_auction_bid(v_ultimate, 1, 1, 'Grappling', 1);
  if not exists (
    select 1 from private.auction_awards
    where auction_id = v_ultimate
      and resolved_round = 1
      and awarded_to = v_challenger
      and visible_category = 'Striking'
  ) then
    raise exception 'Winning Ultimate Fighter category placement was not recorded';
  end if;

  -- A sent Auction remains declineable through the canonical challenge lifecycle.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_declined := private.create_or_resume_auction_internal(
    v_challenger, v_alternate, 'nicknames', 'decline-fixture'
  );
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  v_declined_code := public.submit_auction_challenger_bid_and_send(v_declined, 1, null, 0);
  perform set_config('request.jwt.claim.sub', v_alternate::text, true);
  if not public.dismiss_play_challenge(v_declined_code) then
    raise exception 'Canonical challenge decline failed';
  end if;
  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge on challenge.id = auction.challenge_id
    where auction.id = v_declined
      and auction.lifecycle_state = 'declined'
      and challenge.declined_at is not null
  ) or not exists (
    select 1 from private.notification_events
    where recipient_profile_id = v_challenger
      and source_key = 'auction:' || v_declined::text || ':declined'
  ) then
    raise exception 'Canonical decline did not synchronize Auction or notification state';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_rejected := false;
  begin
    update private.auction_games set lifecycle_state = 'active' where id = v_declined;
  exception when others then
    if position('terminal state cannot change' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Declined Auction was not terminal'; end if;

  -- Four normal wins fill one collection; the remaining four items are forced for $1.
  v_forced := private.create_or_resume_auction_internal(
    v_challenger, v_recipient, 'grapplers', 'forced-assignment-fixture'
  );
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  v_forced_code := public.submit_auction_challenger_bid_and_send(v_forced, 2, null, 0);
  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  perform public.submit_auction_bid(v_forced, 1, 1, null, 1);

  for v_round in 2..4 loop
    select revision into v_revision from private.auction_games where id = v_forced;
    perform set_config('request.jwt.claim.sub', v_challenger::text, true);
    perform public.submit_auction_bid(v_forced, v_round, 2, null, v_revision);
    perform set_config('request.jwt.claim.sub', v_recipient::text, true);
    perform public.submit_auction_bid(v_forced, v_round, 1, null, v_revision);
  end loop;

  select lifecycle_state, grading_status, current_round, revision,
         challenger_bankroll, recipient_bankroll,
         challenger_selection_count, recipient_selection_count
    into v_lifecycle, v_grading_status, v_round, v_revision,
         v_challenger_bankroll, v_recipient_bankroll,
         v_challenger_count, v_recipient_count
  from private.auction_games where id = v_forced;

  if v_lifecycle <> 'completed'
    or v_grading_status <> 'pending'
    or v_round <> 8
    or v_revision <> 9
    or v_challenger_bankroll <> 32
    or v_recipient_bankroll <> 36
    or v_challenger_count <> 4
    or v_recipient_count <> 4
  then
    raise exception 'Forced-assignment completion arithmetic is invalid';
  end if;

  if (select count(*) from private.auction_awards where auction_id = v_forced) <> 8
    or (select count(*) from private.auction_awards where auction_id = v_forced and forced_assignment) <> 4
    or exists (
      select 1 from private.auction_awards
      where auction_id = v_forced and forced_assignment and winning_bid <> 1
    )
  then
    raise exception 'Forced assignments were not sequential $1 awards';
  end if;

  if not exists (
    select 1 from public.play_challenges
    where code = v_forced_code
      and completed_at is not null
      and responder_result = jsonb_build_object('status', 'gameplay_completed', 'grading', 'pending')
  ) then
    raise exception 'Gameplay completion did not update the canonical challenge boundary';
  end if;

  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_forced) state;
  if v_payload->'current_item' <> 'null'::jsonb
    or v_payload->'challenger_final_score' <> 'null'::jsonb
    or v_payload->'recipient_final_score' <> 'null'::jsonb
    or jsonb_array_length(v_payload->'awarded_collections') <> 8
    or v_payload ?| array[
      'grading_status', 'grading_inputs', 'grading_weights', 'intermediate_score',
      'rarity_key', 'content_version', 'rarity_version', 'grading_version'
    ]
  then
    raise exception 'Completion projection exposed future content or grading internals: %', v_payload;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_result := private.resolve_auction_round(v_forced);
  if v_result
    or (select count(*) from private.auction_awards where auction_id = v_forced) <> 8
  then
    raise exception 'Duplicate resolution corrupted a completed Auction';
  end if;

  v_rejected := false;
  begin
    update private.auction_games set recipient_bankroll = recipient_bankroll - 1 where id = v_forced;
  exception when others then
    if position('terminal state cannot change' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Completed Auction remained mutable'; end if;

  -- Explicitly reject normal bids from a participant whose required collection is full.
  v_full_fixture := private.create_or_resume_auction_internal(
    v_challenger, v_alternate, 'wars', 'full-collection-fixture'
  );
  insert into public.play_challenges (
    id, code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result
  ) values (
    v_full_challenge, 'AFULL001', 'auction', 'auction-server-v1', 'Auction', 'Full collection fixture',
    v_challenger, v_alternate, '/play/auction?auction=' || v_full_fixture::text,
    jsonb_build_object('auction_id', v_full_fixture, 'mode_id', 'wars'),
    jsonb_build_object('status', 'bid_locked')
  );
  update private.auction_games
  set challenge_id = v_full_challenge, lifecycle_state = 'sent'
  where id = v_full_fixture;
  update private.auction_games
  set lifecycle_state = 'active', current_round = 5, revision = 1,
      challenger_selection_count = 4, challenger_bankroll = 4
  where id = v_full_fixture;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_full_fixture, 5, 1, null, 1);
  exception when others then
    if position('required collection is already full' in sqlerrm) > 0 then v_rejected := true; else raise; end if;
  end;
  if not v_rejected then raise exception 'Full collection participant was allowed to bid'; end if;

  -- The public wrapper never exposes deterministic material or direct private execution.
  if has_function_privilege(
      'authenticated',
      'private.create_or_resume_auction_internal(uuid,uuid,text,text)',
      'EXECUTE'
    )
    or has_function_privilege('anon', 'public.create_or_resume_auction(uuid,text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.create_or_resume_auction(uuid,text)', 'EXECUTE')
  then
    raise exception 'Auction command privileges expose the wrong boundary';
  end if;
end $$;

rollback;
