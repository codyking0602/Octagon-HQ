begin;

select set_config('request.jwt.claim.role', 'service_role', true);

create or replace function pg_temp.set_actor(p_actor uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', p_actor::text, true);
end;
$$;

create or replace function pg_temp.expect_rejection(p_command text)
returns void
language plpgsql
as $$
declare
  v_rejected boolean := false;
begin
  begin
    execute p_command;
  exception when others then
    v_rejected := true;
  end;

  if not v_rejected then
    raise exception 'Expected rejection for: %', p_command;
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000a2';
  v_outsider constant uuid := '00000000-0000-0000-0000-0000000000a3';
  v_player_two constant uuid := '00000000-0000-0000-0000-0000000000a4';
  v_player_three constant uuid := '00000000-0000-0000-0000-0000000000a5';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-a1@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-a2@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_outsider, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-a3@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_player_two, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-a4@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_player_three, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-a5@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (
    id,
    display_name,
    normalized_name,
    initials
  ) values
    (v_challenger, 'Auction Challenger', 'AUCTION CHALLENGER', 'AC'),
    (v_recipient, 'Auction Recipient', 'AUCTION RECIPIENT', 'AR'),
    (v_outsider, 'Auction Outsider', 'AUCTION OUTSIDER', 'AO'),
    (v_player_two, 'Auction Player Two', 'AUCTION PLAYER TWO', 'AT'),
    (v_player_three, 'Auction Player Three', 'AUCTION PLAYER THREE', 'AH');
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000a2';
  v_outsider constant uuid := '00000000-0000-0000-0000-0000000000a3';
  v_player_two constant uuid := '00000000-0000-0000-0000-0000000000a4';
  v_player_three constant uuid := '00000000-0000-0000-0000-0000000000a5';
  v_auction uuid;
  v_resumed uuid;
  v_abandoned uuid;
  v_deterministic_one constant uuid := '00000000-0000-0000-0000-0000000000d1';
  v_deterministic_two constant uuid := '00000000-0000-0000-0000-0000000000d2';
  v_snapshot text;
  v_resumed_snapshot text;
  v_future_reference text;
  v_payload jsonb;
  v_revision bigint;
  v_order double precision[];
  v_deck_one text[];
  v_deck_two text[];
begin
  if has_function_privilege('anon', 'public.prepare_auction(uuid,text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.abandon_prepared_auction(uuid,bigint)', 'EXECUTE')
    or has_function_privilege('anon', 'public.send_auction_first_bid(uuid,bigint,numeric,text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.submit_auction_bid(uuid,integer,bigint,numeric,text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.cancel_auction(uuid,bigint)', 'EXECUTE')
    or has_function_privilege('anon', 'public.get_auction_participant_state(uuid)', 'EXECUTE')
  then
    raise exception 'anonymous role inherited an Auction command';
  end if;

  if not has_function_privilege('authenticated', 'public.prepare_auction(uuid,text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.abandon_prepared_auction(uuid,bigint)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.send_auction_first_bid(uuid,bigint,numeric,text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.submit_auction_bid(uuid,integer,bigint,numeric,text)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.cancel_auction(uuid,bigint)', 'EXECUTE')
    or not has_function_privilege('authenticated', 'public.get_auction_participant_state(uuid)', 'EXECUTE')
  then
    raise exception 'authenticated Auction command grants are incomplete';
  end if;

  if has_function_privilege('authenticated', 'private.generate_auction_deck(uuid,text,text,integer,double precision[])', 'EXECUTE')
    or has_function_privilege('authenticated', 'private.resolve_auction_round(uuid)', 'EXECUTE')
  then
    raise exception 'private Auction engine owner leaked to authenticated clients';
  end if;

  perform pg_temp.set_actor(v_challenger);
  perform pg_temp.expect_rejection(format(
    'select public.prepare_auction(%L::uuid, %L)',
    v_challenger,
    'strikers'
  ));
  perform pg_temp.expect_rejection(format(
    'select public.prepare_auction(%L::uuid, %L)',
    '00000000-0000-0000-0000-000000000099',
    'strikers'
  ));
  perform pg_temp.expect_rejection(format(
    'select public.prepare_auction(%L::uuid, %L)',
    v_recipient,
    'not-a-mode'
  ));

  v_auction := public.prepare_auction(v_recipient, 'strikers');
  select string_agg(deck.private_item_reference, ',' order by deck.deck_position)
    into v_snapshot
  from private.auction_deck_entries deck
  where deck.auction_id = v_auction;

  v_resumed := public.prepare_auction(v_recipient, 'strikers');
  select string_agg(deck.private_item_reference, ',' order by deck.deck_position)
    into v_resumed_snapshot
  from private.auction_deck_entries deck
  where deck.auction_id = v_resumed;

  if v_resumed <> v_auction
    or v_snapshot is distinct from v_resumed_snapshot
    or (select count(*) from private.auction_deck_entries where auction_id = v_auction) <> 8
    or (select count(distinct private_item_reference) from private.auction_deck_entries where auction_id = v_auction) <> 8
  then
    raise exception 'prepared Auction rerolled or generated an invalid ordinary deck';
  end if;

  if not exists (
    select 1
    from private.auction_games auction
    where auction.id = v_auction
      and auction.lifecycle_state = 'prepared'
      and auction.content_version = 'fixture-2026-08-22-v1'
      and auction.rarity_version = 'rarity-fixture-v1'
      and auction.grading_version = 'grader-contract-v1'
      and auction.challenger_bankroll = 40
      and auction.recipient_bankroll = 40
      and auction.tie_priority_profile_id in (auction.challenger_id, auction.recipient_id)
  ) then
    raise exception 'prepared Auction did not pin exact versions and opening rules';
  end if;

  if exists (
    select 1 from public.play_challenges
    where creator_id = v_challenger
      and recipient_id = v_recipient
      and game_id = 'auction'
  ) then
    raise exception 'prepared Auction created a public challenge before send';
  end if;

  select private_item_reference into v_future_reference
  from private.auction_deck_entries
  where auction_id = v_auction and deck_position = 2;

  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload is null
    or v_payload->>'lifecycle_state' <> 'prepared'
    or v_payload->>'action_required_by' <> 'challenger'
    or (v_payload->'current_item'->>'deck_position')::integer <> 1
    or v_payload::text like '%' || v_future_reference || '%'
    or v_payload ?| array[
      'content_version',
      'rarity_version',
      'grading_version',
      'rarity_band',
      'random_seed',
      'grading_weights',
      'intermediate_score'
    ]
  then
    raise exception 'prepared safe projection leaked or omitted state: %', v_payload;
  end if;

  perform pg_temp.set_actor(v_recipient);
  if exists (select 1 from public.get_auction_participant_state(v_auction)) then
    raise exception 'recipient discovered an unsent prepared Auction';
  end if;

  perform pg_temp.set_actor(v_outsider);
  if exists (select 1 from public.get_auction_participant_state(v_auction)) then
    raise exception 'unrelated user discovered a prepared Auction';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform pg_temp.expect_rejection(format(
    'update private.auction_games set content_version = %L where id = %L::uuid',
    'changed',
    v_auction
  ));
  perform pg_temp.expect_rejection(format(
    'update private.auction_deck_entries set private_item_reference = %L where auction_id = %L::uuid and deck_position = 1',
    'changed',
    v_auction
  ));

  insert into private.auction_games (
    id,
    challenger_id,
    recipient_id,
    mode_id,
    lifecycle_state,
    content_version,
    rarity_version,
    grading_version,
    tie_priority_profile_id,
    challenger_bankroll,
    recipient_bankroll
  ) values
    (v_deterministic_one, v_challenger, v_player_two, 'grapplers', 'abandoned', 'fixture-2026-08-22-v1', 'rarity-fixture-v1', 'grader-contract-v1', v_challenger, 40, 40),
    (v_deterministic_two, v_challenger, v_player_three, 'grapplers', 'abandoned', 'fixture-2026-08-22-v1', 'rarity-fixture-v1', 'grader-contract-v1', v_challenger, 40, 40);

  select array_agg(series.value::double precision order by series.value)
    into v_order
  from generate_series(
    1,
    (select count(*) from private.auction_catalog where content_version = 'fixture-2026-08-22-v1' and mode_id = 'grapplers')
  ) series(value);

  perform private.generate_auction_deck(v_deterministic_one, 'fixture-2026-08-22-v1', 'grapplers', 8, v_order);
  perform private.generate_auction_deck(v_deterministic_two, 'fixture-2026-08-22-v1', 'grapplers', 8, v_order);

  select array_agg(private_item_reference order by deck_position)
    into v_deck_one
  from private.auction_deck_entries
  where auction_id = v_deterministic_one;

  select array_agg(private_item_reference order by deck_position)
    into v_deck_two
  from private.auction_deck_entries
  where auction_id = v_deterministic_two;

  if v_deck_one is distinct from v_deck_two then
    raise exception 'deterministic private deck generation was not reproducible';
  end if;

  perform pg_temp.expect_rejection(format(
    'select private.generate_auction_deck(%L::uuid, %L, %L, 8, null)',
    v_deterministic_one,
    'fixture-2026-08-22-v1',
    'grapplers'
  ));

  perform pg_temp.set_actor(v_challenger);
  v_abandoned := public.prepare_auction(v_recipient, 'nicknames');
  v_revision := public.abandon_prepared_auction(v_abandoned, 0);
  if v_revision <> 1
    or public.abandon_prepared_auction(v_abandoned, 0) <> 1
    or exists (select 1 from public.get_auction_participant_state(v_abandoned))
  then
    raise exception 'prepared abandonment was not terminal and idempotent';
  end if;
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000a2';
  v_outsider constant uuid := '00000000-0000-0000-0000-0000000000a3';
  v_auction uuid;
  v_code text;
  v_revision bigint;
  v_round integer;
  v_future_reference text;
  v_payload jsonb;
  v_tie_priority uuid;
  v_state private.auction_games;
begin
  perform pg_temp.set_actor(v_challenger);
  select id, tie_priority_profile_id
    into v_auction, v_tie_priority
  from private.auction_games
  where challenger_id = v_challenger
    and recipient_id = v_recipient
    and mode_id = 'strikers'
    and lifecycle_state = 'prepared';

  perform pg_temp.expect_rejection(format(
    'select public.create_play_challenge(%L::uuid, %L, %L, %L, %L, %L, %L::jsonb, %L::jsonb)',
    v_recipient,
    'auction',
    'alternate',
    'Auction',
    'Bypass',
    '/play/auction',
    '{}',
    '{}'
  ));

  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 0, null)', v_auction));
  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 1.5, null)', v_auction));
  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 38, null)', v_auction));
  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 20, %L)', v_auction, 'Power'));

  v_code := public.send_auction_first_bid(v_auction, 0, 20, null);

  if not exists (
    select 1
    from public.play_challenges challenge
    join private.auction_games auction on auction.challenge_id = challenge.id
    where auction.id = v_auction
      and challenge.code = v_code
      and challenge.game_id = 'auction'
      and challenge.creator_id = v_challenger
      and challenge.recipient_id = v_recipient
      and challenge.setup = '{}'::jsonb
      and challenge.play_url = '/play/auction?auction=' || v_auction::text
  ) then
    raise exception 'canonical challenge linkage was not created safely';
  end if;

  if (
    select count(*)
    from private.notification_events event
    where event.recipient_profile_id = v_recipient
      and event.source_key = 'auction:received:' || v_auction::text
  ) <> 1 then
    raise exception 'challenge received notification linkage is incorrect';
  end if;

  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 20, null)', v_auction));
  if (
    select count(*) from public.play_challenges
    where creator_id = v_challenger
      and recipient_id = v_recipient
      and game_id = 'auction'
      and summary = 'strikers'
  ) <> 1 then
    raise exception 'duplicate send created or relinked a challenge';
  end if;

  perform pg_temp.set_actor(v_recipient);
  if not public.open_play_challenge(v_code) then
    raise exception 'recipient could not open canonical Auction challenge';
  end if;

  if not exists (
    select 1 from private.auction_games
    where id = v_auction and lifecycle_state = 'sent'
  )
    or exists (
      select 1 from private.notification_events
      where recipient_profile_id = v_challenger
        and source_key = 'auction:accepted:' || v_auction::text
    )
    or exists (
      select 1 from public.play_challenges
      where code = v_code and opened_at is not null
    )
  then
    raise exception 'opening the route was treated as Auction acceptance';
  end if;

  perform pg_temp.expect_rejection(format(
    'select public.complete_play_challenge(%L, %L::jsonb)',
    v_code,
    '{}'
  ));

  select private_item_reference into v_future_reference
  from private.auction_deck_entries
  where auction_id = v_auction and deck_position = 2;

  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload is null
    or v_payload->>'lifecycle_state' <> 'sent'
    or (v_payload->>'current_user_submitted_bid')::boolean
    or jsonb_array_length(v_payload->'resolved_rounds') <> 0
    or v_payload::text like '%' || v_future_reference || '%'
    or v_payload::text like '%"challenger_bid": 20%'
  then
    raise exception 'recipient projection leaked the challenger sealed bid: %', v_payload;
  end if;

  select revision into v_revision from private.auction_games where id = v_auction;
  perform pg_temp.expect_rejection(format('select public.submit_auction_bid(%L::uuid, 1, %s, 10, null)', v_auction, v_revision - 1));
  perform pg_temp.expect_rejection(format('select public.submit_auction_bid(%L::uuid, 2, %s, 10, null)', v_auction, v_revision));

  perform pg_temp.set_actor(v_outsider);
  perform pg_temp.expect_rejection(format('select public.submit_auction_bid(%L::uuid, 1, %s, 10, null)', v_auction, v_revision));

  perform pg_temp.set_actor(v_recipient);
  perform public.submit_auction_bid(v_auction, 1, v_revision, 10, null);

  select * into v_state from private.auction_games where id = v_auction;
  if v_state.lifecycle_state <> 'active'
    or v_state.current_round <> 2
    or v_state.revision <> v_revision + 1
    or v_state.challenger_bankroll <> 20
    or v_state.recipient_bankroll <> 40
    or v_state.challenger_selection_count <> 1
    or v_state.recipient_selection_count <> 0
    or v_state.tie_priority_profile_id <> v_tie_priority
    or (select count(*) from private.auction_awards where auction_id = v_auction and awarded_to = v_challenger and resolved_round = 1) <> 1
  then
    raise exception 'higher-bid resolution or arithmetic was incorrect';
  end if;

  if not exists (
    select 1 from public.play_challenges
    where code = v_code and opened_at is not null
  )
    or (select count(*) from private.notification_events where recipient_profile_id = v_challenger and source_key = 'auction:accepted:' || v_auction::text) <> 1
  then
    raise exception 'recipient first bid did not own acceptance exactly once';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform private.resolve_auction_round(v_auction);
  if (select count(*) from private.auction_awards where auction_id = v_auction) <> 1 then
    raise exception 'duplicate resolution awarded the same round twice';
  end if;

  for v_round in 2..4 loop
    select revision into v_revision from private.auction_games where id = v_auction;
    perform pg_temp.set_actor(v_challenger);

    if v_round = 4 then
      perform pg_temp.expect_rejection(format(
        'select public.submit_auction_bid(%L::uuid, %s, %s, 11, null)',
        v_auction,
        v_round,
        v_revision
      ));
    end if;

    perform public.submit_auction_bid(v_auction, v_round, v_revision, 5, null);
    perform pg_temp.expect_rejection(format(
      'select public.submit_auction_bid(%L::uuid, %s, %s, 4, null)',
      v_auction,
      v_round,
      v_revision
    ));

    perform pg_temp.set_actor(v_recipient);
    select to_jsonb(state) into v_payload
    from public.get_auction_participant_state(v_auction) state;

    if (v_payload->>'current_user_submitted_bid')::boolean
      or v_payload->>'action_required_by' <> 'current_user'
      or jsonb_array_length(v_payload->'resolved_rounds') <> v_round - 1
      or v_payload::text like '%"challenger_bid": 5%'
    then
      raise exception 'pending opponent bid presence leaked before round % resolution: %', v_round, v_payload;
    end if;

    perform public.submit_auction_bid(v_auction, v_round, v_revision, 1, null);
  end loop;

  select * into v_state from private.auction_games where id = v_auction;
  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 4
    or v_state.recipient_selection_count <> 4
    or v_state.challenger_bankroll <> 5
    or v_state.recipient_bankroll <> 36
    or v_state.challenger_final_score <> 0
    or v_state.recipient_final_score <> 0
    or v_state.winner_profile_id is not null
    or (select count(*) from private.auction_awards where auction_id = v_auction) <> 8
    or (
      select count(*)
      from private.auction_awards award
      left join private.auction_pending_bids cb
        on cb.auction_id = award.auction_id
        and cb.round_number = award.resolved_round
        and cb.bidder_id = v_challenger
      left join private.auction_pending_bids rb
        on rb.auction_id = award.auction_id
        and rb.round_number = award.resolved_round
        and rb.bidder_id = v_recipient
      where award.auction_id = v_auction
        and cb.auction_id is null
        and rb.auction_id is null
    ) <> 4
  then
    raise exception 'forced assignment or completion arithmetic was incorrect';
  end if;

  if not exists (
    select 1 from public.play_challenges
    where code = v_code and completed_at is not null
  ) then
    raise exception 'canonical challenge was not completed by the engine';
  end if;

  perform pg_temp.set_actor(v_challenger);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload->>'current_item' is not null
    or (v_payload->>'current_user_submitted_bid')::boolean
    or v_payload->>'action_required_by' <> 'none'
    or jsonb_array_length(v_payload->'awarded_collections') <> 8
    or jsonb_array_length(v_payload->'resolved_rounds') <> 8
    or (
      select count(*)
      from jsonb_array_elements(v_payload->'resolved_rounds') round_state
      where (round_state->>'forced')::boolean
        and (round_state->>'charged_amount')::integer = 1
    ) <> 4
    or v_payload ?| array['content_version', 'rarity_version', 'grading_version', 'rarity_band', 'grading_weights', 'intermediate_score']
  then
    raise exception 'completed safe projection leaked or omitted state: %', v_payload;
  end if;

  if (select count(*) from private.notification_events where source_key = 'auction:completed:' || v_auction::text and recipient_profile_id in (v_challenger, v_recipient)) <> 2 then
    raise exception 'completion notifications were not published exactly once';
  end if;

  perform pg_temp.expect_rejection(format(
    'select public.submit_auction_bid(%L::uuid, 8, %s, 1, null)',
    v_auction,
    v_state.revision
  ));

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform pg_temp.expect_rejection(format(
    'update private.auction_games set challenger_bankroll = challenger_bankroll - 1 where id = %L::uuid',
    v_auction
  ));
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_recipient constant uuid := '00000000-0000-0000-0000-0000000000a2';
  v_tie_auction uuid;
  v_decline_auction uuid;
  v_tie_code text;
  v_decline_code text;
  v_priority_before uuid;
  v_priority_after uuid;
  v_revision bigint;
  v_cancel_revision bigint;
  v_payload jsonb;
begin
  perform pg_temp.set_actor(v_challenger);
  v_tie_auction := public.prepare_auction(v_recipient, 'grapplers');
  select tie_priority_profile_id into v_priority_before
  from private.auction_games where id = v_tie_auction;

  v_tie_code := public.send_auction_first_bid(v_tie_auction, 0, 7, null);
  select revision into v_revision from private.auction_games where id = v_tie_auction;

  perform pg_temp.set_actor(v_recipient);
  perform public.submit_auction_bid(v_tie_auction, 1, v_revision, 7, null);
  select tie_priority_profile_id into v_priority_after
  from private.auction_games where id = v_tie_auction;

  if v_priority_after = v_priority_before
    or not exists (
      select 1 from private.auction_awards
      where auction_id = v_tie_auction
        and resolved_round = 1
        and awarded_to = v_priority_before
    )
    or not exists (
      select 1
      from private.auction_games auction
      where auction.id = v_tie_auction
        and (
          (v_priority_before = auction.challenger_id and auction.challenger_bankroll = 33 and auction.recipient_bankroll = 40)
          or
          (v_priority_before = auction.recipient_id and auction.challenger_bankroll = 40 and auction.recipient_bankroll = 33)
        )
    )
  then
    raise exception 'tied bid did not use and flip visible tie priority';
  end if;

  select revision into v_revision from private.auction_games where id = v_tie_auction;
  perform pg_temp.set_actor(v_challenger);
  perform public.submit_auction_bid(v_tie_auction, 2, v_revision, 2, null);
  perform pg_temp.set_actor(v_recipient);
  perform public.submit_auction_bid(v_tie_auction, 2, v_revision, 1, null);

  if (select tie_priority_profile_id from private.auction_games where id = v_tie_auction) <> v_priority_after then
    raise exception 'non-tied round changed tie priority';
  end if;

  select revision into v_revision from private.auction_games where id = v_tie_auction;
  perform pg_temp.set_actor(v_challenger);
  perform public.submit_auction_bid(v_tie_auction, 3, v_revision, 3, null);
  perform pg_temp.set_actor(v_recipient);

  perform pg_temp.expect_rejection(format('select public.dismiss_play_challenge(%L)', v_tie_code));
  v_cancel_revision := public.cancel_auction(v_tie_auction, v_revision);

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge on challenge.id = auction.challenge_id
    where auction.id = v_tie_auction
      and auction.lifecycle_state = 'cancelled'
      and auction.cancelled_by = v_recipient
      and auction.cancelled_at is not null
      and challenge.creator_hidden_at is not null
      and challenge.recipient_hidden_at is not null
  ) then
    raise exception 'active cancellation did not end the game for both players';
  end if;

  if public.cancel_auction(v_tie_auction, v_revision) <> v_cancel_revision
    or (select count(*) from private.notification_events where recipient_profile_id = v_challenger and source_key = 'auction:cancelled:' || v_tie_auction::text) <> 1
  then
    raise exception 'cancel retry was not idempotent';
  end if;

  perform pg_temp.set_actor(v_challenger);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_tie_auction) state;

  if (v_payload->>'current_user_submitted_bid')::boolean
    or v_payload->>'action_required_by' <> 'none'
    or v_payload->>'current_item' is not null
    or v_payload::text like '%"challenger_bid": 3%'
  then
    raise exception 'cancelled projection exposed pending state: %', v_payload;
  end if;

  v_decline_auction := public.prepare_auction(v_recipient, 'wars');
  v_decline_code := public.send_auction_first_bid(v_decline_auction, 0, 3, null);
  perform pg_temp.set_actor(v_recipient);

  if not public.dismiss_play_challenge(v_decline_code) then
    raise exception 'recipient could not decline sent Auction';
  end if;

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge on challenge.id = auction.challenge_id
    where auction.id = v_decline_auction
      and auction.lifecycle_state = 'declined'
      and challenge.declined_at is not null
  )
    or (select count(*) from private.notification_events where recipient_profile_id = v_challenger and source_key = 'auction:declined:' || v_decline_auction::text) <> 1
  then
    raise exception 'pre-acceptance decline did not use canonical lifecycle';
  end if;

  perform pg_temp.expect_rejection(format(
    'select public.submit_auction_bid(%L::uuid, 1, 1, 2, null)',
    v_decline_auction
  ));
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-0000-0000-0000000000a1';
  v_player_two constant uuid := '00000000-0000-0000-0000-0000000000a4';
  v_auction uuid;
  v_revision bigint;
  v_payload jsonb;
  v_priority uuid;
begin
  perform pg_temp.set_actor(v_challenger);
  v_auction := public.prepare_auction(v_player_two, 'ultimate-fighter');

  if not exists (
    select 1 from private.auction_games auction
    where auction.id = v_auction
      and auction.challenger_bankroll = 50
      and auction.recipient_bankroll = 50
      and (select count(*) from private.auction_deck_entries where auction_id = auction.id) = 10
  ) then
    raise exception 'Ultimate Fighter opening rules are incorrect';
  end if;

  select tie_priority_profile_id into v_priority
  from private.auction_games where id = v_auction;

  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 10, null)', v_auction));
  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 10, %L)', v_auction, 'Takedowns'));
  perform pg_temp.expect_rejection(format('select public.send_auction_first_bid(%L::uuid, 0, 47, %L)', v_auction, 'Striking'));
  perform public.send_auction_first_bid(v_auction, 0, 10, 'Striking');

  perform pg_temp.set_actor(v_player_two);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload::text like '%Striking%'
    or jsonb_array_length(v_payload->'resolved_rounds') <> 0
  then
    raise exception 'pending Ultimate Fighter intent leaked: %', v_payload;
  end if;

  select revision into v_revision from private.auction_games where id = v_auction;
  perform public.submit_auction_bid(v_auction, 1, v_revision, 5, 'Grappling');

  perform pg_temp.set_actor(v_challenger);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if jsonb_array_length(v_payload->'awarded_collections') <> 1
    or (v_payload->'awarded_collections'->0)->>'category' <> 'Striking'
    or v_payload::text like '%Grappling%'
    or (select tie_priority_profile_id from private.auction_games where id = v_auction) <> v_priority
  then
    raise exception 'Ultimate Fighter resolved intent visibility is incorrect: %', v_payload;
  end if;

  select revision into v_revision from private.auction_games where id = v_auction;
  perform pg_temp.expect_rejection(format(
    'select public.submit_auction_bid(%L::uuid, 2, %s, 5, %L)',
    v_auction,
    v_revision,
    'Striking'
  ));

  perform public.submit_auction_bid(v_auction, 2, v_revision, 5, 'Power');
  perform pg_temp.set_actor(v_player_two);
  select to_jsonb(state) into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload::text like '%Power%'
    or jsonb_array_length(v_payload->'resolved_rounds') <> 1
  then
    raise exception 'later pending Ultimate Fighter intent leaked: %', v_payload;
  end if;

  perform public.submit_auction_bid(v_auction, 2, v_revision, 1, 'Frame');
  if not exists (
    select 1 from private.auction_awards
    where auction_id = v_auction
      and awarded_to = v_challenger
      and visible_category = 'Power'
      and resolved_round = 2
  ) then
    raise exception 'Ultimate Fighter category placement was not awarded';
  end if;

  select revision into v_revision from private.auction_games where id = v_auction;
  perform public.cancel_auction(v_auction, v_revision);
end;
$$;

rollback;
