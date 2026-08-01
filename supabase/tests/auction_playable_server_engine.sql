begin;

select set_config('request.jwt.claim.role', 'service_role', true);

do $$
declare
  v_challenger uuid := extensions.gen_random_uuid();
  v_recipient uuid := extensions.gen_random_uuid();
  v_outsider uuid := extensions.gen_random_uuid();
  v_recipient_two uuid := extensions.gen_random_uuid();
  v_recipient_three uuid := extensions.gen_random_uuid();
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
    (
      v_challenger,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auction-pr3-challenger@login.octagon-hq.app',
      '',
      now(),
      now(),
      now(),
      '{}'::jsonb
    ),
    (
      v_recipient,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auction-pr3-recipient@login.octagon-hq.app',
      '',
      now(),
      now(),
      now(),
      '{}'::jsonb
    ),
    (
      v_outsider,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auction-pr3-outsider@login.octagon-hq.app',
      '',
      now(),
      now(),
      now(),
      '{}'::jsonb
    ),
    (
      v_recipient_two,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auction-pr3-recipient-two@login.octagon-hq.app',
      '',
      now(),
      now(),
      now(),
      '{}'::jsonb
    ),
    (
      v_recipient_three,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'auction-pr3-recipient-three@login.octagon-hq.app',
      '',
      now(),
      now(),
      now(),
      '{}'::jsonb
    );

  insert into public.profiles (
    id,
    display_name,
    normalized_name,
    initials
  ) values
    (v_challenger, 'Auction PR3 Challenger', 'AUCTION PR3 CHALLENGER', 'AC'),
    (v_recipient, 'Auction PR3 Recipient', 'AUCTION PR3 RECIPIENT', 'AR'),
    (v_outsider, 'Auction PR3 Outsider', 'AUCTION PR3 OUTSIDER', 'AO'),
    (v_recipient_two, 'Auction PR3 Recipient Two', 'AUCTION PR3 RECIPIENT TWO', 'AT'),
    (v_recipient_three, 'Auction PR3 Recipient Three', 'AUCTION PR3 RECIPIENT THREE', 'AH');
end;
$$;

do $$
declare
  v_challenger uuid;
  v_recipient uuid;
  v_outsider uuid;
  v_recipient_two uuid;
  v_recipient_three uuid;
  v_auction uuid;
  v_resumed uuid;
  v_abandoned uuid;
  v_deterministic_one uuid := extensions.gen_random_uuid();
  v_deterministic_two uuid := extensions.gen_random_uuid();
  v_first_snapshot text;
  v_resumed_snapshot text;
  v_second_reference text;
  v_payload jsonb;
  v_order double precision[];
  v_deck_one text[];
  v_deck_two text[];
  v_revision bigint;
  v_rejected boolean;
begin
  select id into v_challenger
  from public.profiles
  where normalized_name = 'AUCTION PR3 CHALLENGER';

  select id into v_recipient
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT';

  select id into v_outsider
  from public.profiles
  where normalized_name = 'AUCTION PR3 OUTSIDER';

  select id into v_recipient_two
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT TWO';

  select id into v_recipient_three
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT THREE';

  if has_function_privilege(
      'anon',
      'public.prepare_auction(uuid,text)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.abandon_prepared_auction(uuid,bigint)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.send_auction_first_bid(uuid,bigint,numeric,text)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.submit_auction_bid(uuid,integer,bigint,numeric,text)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.cancel_auction(uuid,bigint)',
      'EXECUTE'
    )
    or has_function_privilege(
      'anon',
      'public.get_auction_participant_state(uuid)',
      'EXECUTE'
    )
  then
    raise exception 'anonymous role inherited an Auction command';
  end if;

  if not has_function_privilege(
      'authenticated',
      'public.prepare_auction(uuid,text)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'authenticated',
      'public.abandon_prepared_auction(uuid,bigint)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'authenticated',
      'public.send_auction_first_bid(uuid,bigint,numeric,text)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'authenticated',
      'public.submit_auction_bid(uuid,integer,bigint,numeric,text)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'authenticated',
      'public.cancel_auction(uuid,bigint)',
      'EXECUTE'
    )
    or not has_function_privilege(
      'authenticated',
      'public.get_auction_participant_state(uuid)',
      'EXECUTE'
    )
  then
    raise exception 'authenticated Auction command grants are incomplete';
  end if;

  if has_function_privilege(
      'authenticated',
      'private.generate_auction_deck(uuid,text,text,integer,double precision[])',
      'EXECUTE'
    )
    or has_function_privilege(
      'authenticated',
      'private.resolve_auction_round(uuid)',
      'EXECUTE'
    )
  then
    raise exception 'private Auction engine owner leaked to authenticated clients';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_rejected := false;
  begin
    perform public.prepare_auction(v_challenger, 'strikers');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'self-challenge preparation was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.prepare_auction(extensions.gen_random_uuid(), 'strikers');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'missing opponent preparation was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.prepare_auction(v_recipient, 'not-a-mode');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'invalid Auction mode was accepted';
  end if;

  v_auction := public.prepare_auction(v_recipient, 'strikers');

  select string_agg(
      deck.private_item_reference,
      ',' order by deck.deck_position
    )
    into v_first_snapshot
  from private.auction_deck_entries deck
  where deck.auction_id = v_auction;

  v_resumed := public.prepare_auction(v_recipient, 'strikers');

  select string_agg(
      deck.private_item_reference,
      ',' order by deck.deck_position
    )
    into v_resumed_snapshot
  from private.auction_deck_entries deck
  where deck.auction_id = v_resumed;

  if v_resumed <> v_auction
    or v_first_snapshot is distinct from v_resumed_snapshot
    or (
      select count(*)
      from private.auction_deck_entries deck
      where deck.auction_id = v_auction
    ) <> 8
    or (
      select count(distinct deck.private_item_reference)
      from private.auction_deck_entries deck
      where deck.auction_id = v_auction
    ) <> 8
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
      and auction.tie_priority_profile_id in (
        auction.challenger_id,
        auction.recipient_id
      )
  ) then
    raise exception 'prepared Auction did not pin exact versions and opening rules';
  end if;

  if exists (
    select 1
    from public.play_challenges challenge
    where challenge.creator_id = v_challenger
      and challenge.recipient_id = v_recipient
      and challenge.game_id = 'auction'
  ) then
    raise exception 'prepared Auction created a public challenge before send';
  end if;

  select deck.private_item_reference
    into v_second_reference
  from private.auction_deck_entries deck
  where deck.auction_id = v_auction
    and deck.deck_position = 2;

  select to_jsonb(state)
    into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload is null
    or (v_payload->'current_item'->>'deck_position')::integer <> 1
    or v_payload->>'lifecycle_state' <> 'prepared'
    or v_payload->>'action_required_by' <> 'challenger'
    or v_payload::text like '%' || v_second_reference || '%'
    or v_payload ?| array[
      'content_version',
      'rarity_version',
      'grading_version',
      'random_seed',
      'rarity_band',
      'grading_weights',
      'intermediate_score'
    ]
  then
    raise exception 'prepared safe projection leaked or omitted state: %', v_payload;
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if exists (
    select 1 from public.get_auction_participant_state(v_auction)
  ) then
    raise exception 'recipient discovered an unsent prepared Auction';
  end if;

  perform set_config('request.jwt.claim.sub', v_outsider::text, true);
  if exists (
    select 1 from public.get_auction_participant_state(v_auction)
  ) then
    raise exception 'unrelated user discovered a prepared Auction';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_rejected := false;
  begin
    update private.auction_games
    set content_version = 'changed'
    where id = v_auction;
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'prepared version snapshot remained mutable';
  end if;

  v_rejected := false;
  begin
    update private.auction_deck_entries
    set private_item_reference = 'changed'
    where auction_id = v_auction
      and deck_position = 1;
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'fixed Auction deck remained mutable';
  end if;

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
    (
      v_deterministic_one,
      v_challenger,
      v_recipient_two,
      'grapplers',
      'abandoned',
      'fixture-2026-08-22-v1',
      'rarity-fixture-v1',
      'grader-contract-v1',
      v_challenger,
      40,
      40
    ),
    (
      v_deterministic_two,
      v_challenger,
      v_recipient_three,
      'grapplers',
      'abandoned',
      'fixture-2026-08-22-v1',
      'rarity-fixture-v1',
      'grader-contract-v1',
      v_challenger,
      40,
      40
    );

  select array_agg(series.value::double precision order by series.value)
    into v_order
  from generate_series(
    1,
    (
      select count(*)
      from private.auction_catalog catalog
      where catalog.content_version = 'fixture-2026-08-22-v1'
        and catalog.mode_id = 'grapplers'
    )
  ) series(value);

  perform private.generate_auction_deck(
    v_deterministic_one,
    'fixture-2026-08-22-v1',
    'grapplers',
    8,
    v_order
  );

  perform private.generate_auction_deck(
    v_deterministic_two,
    'fixture-2026-08-22-v1',
    'grapplers',
    8,
    v_order
  );

  select array_agg(
      deck.private_item_reference order by deck.deck_position
    )
    into v_deck_one
  from private.auction_deck_entries deck
  where deck.auction_id = v_deterministic_one;

  select array_agg(
      deck.private_item_reference order by deck.deck_position
    )
    into v_deck_two
  from private.auction_deck_entries deck
  where deck.auction_id = v_deterministic_two;

  if v_deck_one is distinct from v_deck_two then
    raise exception 'deterministic private deck generation was not reproducible';
  end if;

  v_rejected := false;
  begin
    perform private.generate_auction_deck(
      v_deterministic_one,
      'fixture-2026-08-22-v1',
      'grapplers',
      8,
      v_order
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'fixed private deck generated twice';
  end if;

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_abandoned := public.prepare_auction(v_recipient, 'nicknames');
  v_revision := public.abandon_prepared_auction(v_abandoned, 0);

  if v_revision <> 1
    or public.abandon_prepared_auction(v_abandoned, 0) <> 1
    or exists (
      select 1 from public.get_auction_participant_state(v_abandoned)
    )
  then
    raise exception 'prepared abandonment was not terminal and idempotent';
  end if;
end;
$$;

do $$
declare
  v_challenger uuid;
  v_recipient uuid;
  v_outsider uuid;
  v_auction uuid;
  v_code text;
  v_revision bigint;
  v_round integer;
  v_payload jsonb;
  v_future_reference text;
  v_tie_priority uuid;
  v_rejected boolean;
  v_state private.auction_games;
begin
  select id into v_challenger
  from public.profiles
  where normalized_name = 'AUCTION PR3 CHALLENGER';

  select id into v_recipient
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT';

  select id into v_outsider
  from public.profiles
  where normalized_name = 'AUCTION PR3 OUTSIDER';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  select id, tie_priority_profile_id
    into v_auction, v_tie_priority
  from private.auction_games
  where challenger_id = v_challenger
    and recipient_id = v_recipient
    and mode_id = 'strikers'
    and lifecycle_state = 'prepared';

  v_rejected := false;
  begin
    perform public.create_play_challenge(
      v_recipient,
      'auction',
      'alternate',
      'Auction',
      'Bypass',
      '/play/auction',
      '{}'::jsonb,
      '{}'::jsonb
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'generic challenge creation bypassed the Auction engine';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 0, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception '$0 opening bid was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 1.5, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'fractional opening bid was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 38, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'opening reserve maximum was not enforced';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 20, 'Power');
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'ordinary Auction accepted category intent';
  end if;

  v_code := public.send_auction_first_bid(v_auction, 0, 20, null);

  if not exists (
    select 1
    from public.play_challenges challenge
    join private.auction_games auction
      on auction.challenge_id = challenge.id
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
    ) <> 1
  then
    raise exception 'challenge received notification linkage is incorrect';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 20, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected
    or (
      select count(*)
      from public.play_challenges challenge
      where challenge.creator_id = v_challenger
        and challenge.recipient_id = v_recipient
        and challenge.game_id = 'auction'
        and challenge.summary = 'strikers'
    ) <> 1
  then
    raise exception 'duplicate send created or relinked a challenge';
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);

  if not public.open_play_challenge(v_code) then
    raise exception 'recipient could not open canonical Auction challenge';
  end if;

  if not exists (
      select 1
      from private.auction_games auction
      where auction.id = v_auction
        and auction.lifecycle_state = 'sent'
    )
    or exists (
      select 1
      from private.notification_events event
      where event.recipient_profile_id = v_challenger
        and event.source_key = 'auction:accepted:' || v_auction::text
    )
  then
    raise exception 'opening the route was treated as Auction acceptance';
  end if;

  v_rejected := false;
  begin
    perform public.complete_play_challenge(v_code, '{}'::jsonb);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'generic challenge completion bypassed the Auction engine';
  end if;

  select deck.private_item_reference
    into v_future_reference
  from private.auction_deck_entries deck
  where deck.auction_id = v_auction
    and deck.deck_position = 2;

  select to_jsonb(state)
    into v_payload
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

  select revision into v_revision
  from private.auction_games
  where id = v_auction;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_auction, 1, v_revision - 1, 10, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'stale recipient acceptance was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_auction, 2, v_revision, 10, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'wrong recipient round was accepted';
  end if;

  perform set_config('request.jwt.claim.sub', v_outsider::text, true);
  v_rejected := false;
  begin
    perform public.submit_auction_bid(v_auction, 1, v_revision, 10, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'unrelated user submitted an Auction bid';
  end if;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  perform public.submit_auction_bid(v_auction, 1, v_revision, 10, null);

  select *
    into v_state
  from private.auction_games
  where id = v_auction;

  if v_state.lifecycle_state <> 'active'
    or v_state.current_round <> 2
    or v_state.revision <> v_revision + 1
    or v_state.challenger_bankroll <> 20
    or v_state.recipient_bankroll <> 40
    or v_state.challenger_selection_count <> 1
    or v_state.recipient_selection_count <> 0
    or v_state.tie_priority_profile_id <> v_tie_priority
    or (
      select count(*)
      from private.auction_awards award
      where award.auction_id = v_auction
        and award.awarded_to = v_challenger
        and award.resolved_round = 1
    ) <> 1
  then
    raise exception 'higher-bid resolution or arithmetic was incorrect';
  end if;

  if (
      select count(*)
      from private.notification_events event
      where event.recipient_profile_id = v_challenger
        and event.source_key = 'auction:accepted:' || v_auction::text
    ) <> 1
  then
    raise exception 'first recipient bid did not publish acceptance exactly once';
  end if;

  perform private.resolve_auction_round(v_auction);
  if (
      select count(*)
      from private.auction_awards award
      where award.auction_id = v_auction
    ) <> 1
  then
    raise exception 'duplicate resolution awarded the same round twice';
  end if;

  for v_round in 2..4 loop
    select revision into v_revision
    from private.auction_games
    where id = v_auction;

    perform set_config('request.jwt.claim.sub', v_challenger::text, true);

    if v_round = 4 then
      v_rejected := false;
      begin
        perform public.submit_auction_bid(
          v_auction,
          v_round,
          v_revision,
          11,
          null
        );
      exception when others then
        v_rejected := true;
      end;
      if not v_rejected then
        raise exception 'late-game reserve maximum was not enforced';
      end if;
    end if;

    perform public.submit_auction_bid(
      v_auction,
      v_round,
      v_revision,
      5,
      null
    );

    v_rejected := false;
    begin
      perform public.submit_auction_bid(
        v_auction,
        v_round,
        v_revision,
        4,
        null
      );
    exception when others then
      v_rejected := true;
    end;
    if not v_rejected then
      raise exception 'locked bid was edited in round %', v_round;
    end if;

    perform set_config('request.jwt.claim.sub', v_recipient::text, true);

    select to_jsonb(state)
      into v_payload
    from public.get_auction_participant_state(v_auction) state;

    if (v_payload->>'current_user_submitted_bid')::boolean
      or jsonb_array_length(v_payload->'resolved_rounds') <> v_round - 1
    then
      raise exception 'pending opponent bid presence leaked before round % resolution', v_round;
    end if;

    perform public.submit_auction_bid(
      v_auction,
      v_round,
      v_revision,
      1,
      null
    );
  end loop;

  select *
    into v_state
  from private.auction_games
  where id = v_auction;

  if v_state.lifecycle_state <> 'completed'
    or v_state.challenger_selection_count <> 4
    or v_state.recipient_selection_count <> 4
    or v_state.challenger_bankroll <> 5
    or v_state.recipient_bankroll <> 36
    or v_state.challenger_final_score <> 0
    or v_state.recipient_final_score <> 0
    or v_state.winner_profile_id is not null
    or (
      select count(*)
      from private.auction_awards award
      where award.auction_id = v_auction
    ) <> 8
    or (
      select count(*)
      from private.auction_awards award
      left join private.auction_pending_bids challenger_bid
        on challenger_bid.auction_id = award.auction_id
        and challenger_bid.round_number = award.resolved_round
        and challenger_bid.bidder_id = v_challenger
      left join private.auction_pending_bids recipient_bid
        on recipient_bid.auction_id = award.auction_id
        and recipient_bid.round_number = award.resolved_round
        and recipient_bid.bidder_id = v_recipient
      where award.auction_id = v_auction
        and challenger_bid.auction_id is null
        and recipient_bid.auction_id is null
    ) <> 4
  then
    raise exception 'forced assignment or completion arithmetic was incorrect';
  end if;

  if not exists (
    select 1
    from public.play_challenges challenge
    where challenge.code = v_code
      and challenge.completed_at is not null
  ) then
    raise exception 'canonical challenge was not completed by the engine';
  end if;

  select to_jsonb(state)
    into v_payload
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
    or v_payload ?| array[
      'content_version',
      'rarity_version',
      'grading_version',
      'rarity_band',
      'grading_weights',
      'intermediate_score'
    ]
  then
    raise exception 'completed safe projection leaked or omitted state: %', v_payload;
  end if;

  if (
      select count(*)
      from private.notification_events event
      where event.source_key = 'auction:completed:' || v_auction::text
        and event.recipient_profile_id in (v_challenger, v_recipient)
    ) <> 2
  then
    raise exception 'completion notifications were not published exactly once';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(
      v_auction,
      8,
      v_state.revision,
      1,
      null
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'completed Auction accepted another bid';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  v_rejected := false;
  begin
    update private.auction_games
    set challenger_bankroll = challenger_bankroll - 1
    where id = v_auction;
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'completed Auction remained mutable';
  end if;
end;
$$;

do $$
declare
  v_challenger uuid;
  v_recipient uuid;
  v_tie_auction uuid;
  v_decline_auction uuid;
  v_tie_code text;
  v_decline_code text;
  v_priority_before uuid;
  v_priority_after uuid;
  v_revision bigint;
  v_cancel_revision bigint;
  v_payload jsonb;
  v_rejected boolean;
begin
  select id into v_challenger
  from public.profiles
  where normalized_name = 'AUCTION PR3 CHALLENGER';

  select id into v_recipient
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_tie_auction := public.prepare_auction(v_recipient, 'grapplers');
  select tie_priority_profile_id
    into v_priority_before
  from private.auction_games
  where id = v_tie_auction;

  v_tie_code := public.send_auction_first_bid(
    v_tie_auction,
    0,
    7,
    null
  );

  select revision into v_revision
  from private.auction_games
  where id = v_tie_auction;

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  perform public.submit_auction_bid(
    v_tie_auction,
    1,
    v_revision,
    7,
    null
  );

  select tie_priority_profile_id
    into v_priority_after
  from private.auction_games
  where id = v_tie_auction;

  if v_priority_after = v_priority_before
    or not exists (
      select 1
      from private.auction_awards award
      where award.auction_id = v_tie_auction
        and award.resolved_round = 1
        and award.awarded_to = v_priority_before
    )
    or not exists (
      select 1
      from private.auction_games auction
      where auction.id = v_tie_auction
        and (
          (
            v_priority_before = auction.challenger_id
            and auction.challenger_bankroll = 33
            and auction.recipient_bankroll = 40
          )
          or (
            v_priority_before = auction.recipient_id
            and auction.challenger_bankroll = 40
            and auction.recipient_bankroll = 33
          )
        )
    )
  then
    raise exception 'tied bid did not use and flip visible tie priority';
  end if;

  select revision into v_revision
  from private.auction_games
  where id = v_tie_auction;

  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  perform public.submit_auction_bid(
    v_tie_auction,
    2,
    v_revision,
    2,
    null
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  perform public.submit_auction_bid(
    v_tie_auction,
    2,
    v_revision,
    1,
    null
  );

  if (
      select tie_priority_profile_id
      from private.auction_games
      where id = v_tie_auction
    ) <> v_priority_after
  then
    raise exception 'non-tied round changed tie priority';
  end if;

  select revision into v_revision
  from private.auction_games
  where id = v_tie_auction;

  perform set_config('request.jwt.claim.sub', v_challenger::text, true);
  perform public.submit_auction_bid(
    v_tie_auction,
    3,
    v_revision,
    3,
    null
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);

  v_rejected := false;
  begin
    perform public.dismiss_play_challenge(v_tie_code);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'active Auction was dismissed instead of cancelled';
  end if;

  v_cancel_revision := public.cancel_auction(
    v_tie_auction,
    v_revision
  );

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge
      on challenge.id = auction.challenge_id
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
    or (
      select count(*)
      from private.notification_events event
      where event.recipient_profile_id = v_challenger
        and event.source_key = 'auction:cancelled:' || v_tie_auction::text
    ) <> 1
  then
    raise exception 'cancel retry was not idempotent';
  end if;

  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  select to_jsonb(state)
    into v_payload
  from public.get_auction_participant_state(v_tie_auction) state;

  if (v_payload->>'current_user_submitted_bid')::boolean
    or v_payload->>'action_required_by' <> 'none'
    or v_payload->>'current_item' is not null
    or v_payload::text like '%"challenger_bid": 3%'
  then
    raise exception 'cancelled projection exposed pending state: %', v_payload;
  end if;

  v_decline_auction := public.prepare_auction(v_recipient, 'wars');
  v_decline_code := public.send_auction_first_bid(
    v_decline_auction,
    0,
    3,
    null
  );

  perform set_config('request.jwt.claim.sub', v_recipient::text, true);
  if not public.dismiss_play_challenge(v_decline_code) then
    raise exception 'recipient could not decline sent Auction';
  end if;

  if not exists (
    select 1
    from private.auction_games auction
    join public.play_challenges challenge
      on challenge.id = auction.challenge_id
    where auction.id = v_decline_auction
      and auction.lifecycle_state = 'declined'
      and challenge.declined_at is not null
  )
    or (
      select count(*)
      from private.notification_events event
      where event.recipient_profile_id = v_challenger
        and event.source_key = 'auction:declined:' || v_decline_auction::text
    ) <> 1
  then
    raise exception 'pre-acceptance decline did not use canonical lifecycle';
  end if;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(
      v_decline_auction,
      1,
      1,
      2,
      null
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'declined Auction accepted a bid';
  end if;
end;
$$;

do $$
declare
  v_challenger uuid;
  v_recipient_two uuid;
  v_auction uuid;
  v_code text;
  v_revision bigint;
  v_payload jsonb;
  v_priority uuid;
  v_rejected boolean;
begin
  select id into v_challenger
  from public.profiles
  where normalized_name = 'AUCTION PR3 CHALLENGER';

  select id into v_recipient_two
  from public.profiles
  where normalized_name = 'AUCTION PR3 RECIPIENT TWO';

  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  v_auction := public.prepare_auction(
    v_recipient_two,
    'ultimate-fighter'
  );

  if not exists (
    select 1
    from private.auction_games auction
    where auction.id = v_auction
      and auction.challenger_bankroll = 50
      and auction.recipient_bankroll = 50
      and (
        select count(*)
        from private.auction_deck_entries deck
        where deck.auction_id = auction.id
      ) = 10
  ) then
    raise exception 'Ultimate Fighter opening rules are incorrect';
  end if;

  select tie_priority_profile_id
    into v_priority
  from private.auction_games
  where id = v_auction;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(v_auction, 0, 10, null);
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Ultimate Fighter bid without intent was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(
      v_auction,
      0,
      10,
      'Takedowns'
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'invalid Ultimate Fighter category was accepted';
  end if;

  v_rejected := false;
  begin
    perform public.send_auction_first_bid(
      v_auction,
      0,
      47,
      'Striking'
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'Ultimate Fighter opening reserve maximum was not enforced';
  end if;

  v_code := public.send_auction_first_bid(
    v_auction,
    0,
    10,
    'Striking'
  );

  perform set_config('request.jwt.claim.sub', v_recipient_two::text, true);

  select to_jsonb(state)
    into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload::text like '%Striking%'
    or jsonb_array_length(v_payload->'resolved_rounds') <> 0
  then
    raise exception 'pending Ultimate Fighter intent leaked: %', v_payload;
  end if;

  select revision into v_revision
  from private.auction_games
  where id = v_auction;

  perform public.submit_auction_bid(
    v_auction,
    1,
    v_revision,
    5,
    'Grappling'
  );

  perform set_config('request.jwt.claim.sub', v_challenger::text, true);

  select to_jsonb(state)
    into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if jsonb_array_length(v_payload->'awarded_collections') <> 1
    or (v_payload->'awarded_collections'->0)->>'category' <> 'Striking'
    or v_payload::text like '%Grappling%'
    or (
      select tie_priority_profile_id
      from private.auction_games
      where id = v_auction
    ) <> v_priority
  then
    raise exception 'Ultimate Fighter resolved intent visibility is incorrect: %', v_payload;
  end if;

  select revision into v_revision
  from private.auction_games
  where id = v_auction;

  v_rejected := false;
  begin
    perform public.submit_auction_bid(
      v_auction,
      2,
      v_revision,
      5,
      'Striking'
    );
  exception when others then
    v_rejected := true;
  end;
  if not v_rejected then
    raise exception 'filled Ultimate Fighter category was accepted again';
  end if;

  perform public.submit_auction_bid(
    v_auction,
    2,
    v_revision,
    5,
    'Power'
  );

  perform set_config('request.jwt.claim.sub', v_recipient_two::text, true);

  select to_jsonb(state)
    into v_payload
  from public.get_auction_participant_state(v_auction) state;

  if v_payload::text like '%Power%'
    or jsonb_array_length(v_payload->'resolved_rounds') <> 1
  then
    raise exception 'later pending Ultimate Fighter intent leaked: %', v_payload;
  end if;

  perform public.submit_auction_bid(
    v_auction,
    2,
    v_revision,
    1,
    'Frame'
  );

  if not exists (
    select 1
    from private.auction_awards award
    where award.auction_id = v_auction
      and award.awarded_to = v_challenger
      and award.visible_category = 'Power'
      and award.resolved_round = 2
  ) then
    raise exception 'Ultimate Fighter category placement was not awarded';
  end if;

  select revision into v_revision
  from private.auction_games
  where id = v_auction;

  perform public.cancel_auction(v_auction, v_revision);
end;
$$;

rollback;
