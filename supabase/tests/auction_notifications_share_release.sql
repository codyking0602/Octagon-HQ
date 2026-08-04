begin;

select set_config('request.jwt.claim.role', 'service_role', true);

-- Exercise push claims without making a network request from the fresh database.
alter table private.notification_groups disable trigger notification_groups_push_delivery;

create or replace function pg_temp.set_auction_actor(p_actor uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.sub', p_actor::text, true);
end;
$$;

do $$
declare
  v_challenger constant uuid := '00000000-0000-4000-8000-0000000006a1';
  v_recipient constant uuid := '00000000-0000-4000-8000-0000000006a2';
  v_outsider constant uuid := '00000000-0000-4000-8000-0000000006a3';
  v_cancel_recipient constant uuid := '00000000-0000-4000-8000-0000000006a4';
  v_auction uuid;
  v_cancel_auction uuid;
  v_decline_auction uuid;
  v_tie_auction uuid := '00000000-0000-4000-8000-0000000006b1';
  v_tie_challenge uuid;
  v_code text;
  v_decline_code text;
  v_revision bigint;
  v_round integer;
  v_snapshot jsonb;
  v_notification jsonb;
  v_claim jsonb;
  v_repeated_claim jsonb;
  v_push_registration jsonb;
  v_push_removal jsonb;
  v_delivery_id uuid;
  v_preview jsonb;
  v_private_text text;
begin
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, created_at, updated_at, raw_user_meta_data
  ) values
    (v_challenger, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr6-a@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr6-b@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_outsider, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr6-c@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb),
    (v_cancel_recipient, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'auction-pr6-d@login.octagon-hq.app', '', now(), now(), now(), '{}'::jsonb);

  insert into public.profiles (id, display_name, normalized_name, initials) values
    (v_challenger, 'PR6 Challenger', 'PR6 CHALLENGER', 'PC'),
    (v_recipient, 'PR6 Recipient', 'PR6 RECIPIENT', 'PR'),
    (v_outsider, 'PR6 Outsider', 'PR6 OUTSIDER', 'PO'),
    (v_cancel_recipient, 'PR6 Cancel Recipient', 'PR6 CANCEL RECIPIENT', 'PX');

  perform pg_temp.set_auction_actor(v_challenger);
  v_auction := public.prepare_auction(v_recipient, 'strikers');

  if public.get_rich_preview_data('auction', v_auction::text) is not null then
    raise exception 'prepared Auction unexpectedly exposed a public preview';
  end if;

  v_code := public.send_auction_first_bid(v_auction, 0, 20, null);

  perform pg_temp.set_auction_actor(v_outsider);
  if exists (select 1 from public.get_auction_participant_state(v_auction)) then
    raise exception 'unrelated profile discovered the sent Auction';
  end if;

  perform pg_temp.set_auction_actor(v_recipient);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_notification
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'game_challenge_received'
    and item->>'route' = '/play/auction?auction=' || v_auction::text;

  if v_notification is null
    or v_notification->>'priority' <> 'push_candidate'
    or v_notification->>'action_label' <> 'VIEW AUCTION'
  then
    raise exception 'Auction received notification was not the canonical actionable push candidate: %', v_snapshot;
  end if;

  select revision into v_revision from private.auction_games where id = v_auction;
  perform public.submit_auction_bid(v_auction, 1, v_revision, 10, null);

  perform pg_temp.set_auction_actor(v_challenger);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_notification
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'auction_action_required';

  if v_notification is null
    or v_notification->>'category' <> 'games'
    or v_notification->>'priority' <> 'push_candidate'
    or v_notification->>'title' <> 'Auction accepted · bid now'
    or position('Round 1 resolved' in v_notification->>'summary') = 0
    or v_notification->>'route' <> '/play/auction?auction=' || v_auction::text
    or v_notification->>'action_label' <> 'PLACE BID'
  then
    raise exception 'first resolved-round action notification was incomplete or unsafe: %', v_snapshot;
  end if;

  if (v_notification->>'summary') ~* '(bid amount|pending|rarity|formula|grade|future deck|category intent)' then
    raise exception 'action notification leaked private Auction state: %', v_notification;
  end if;

  for v_round in 2..4 loop
    select revision into v_revision from private.auction_games where id = v_auction;
    perform pg_temp.set_auction_actor(v_challenger);
    perform public.submit_auction_bid(v_auction, v_round, v_revision, 5, null);
    perform pg_temp.set_auction_actor(v_recipient);
    perform public.submit_auction_bid(v_auction, v_round, v_revision, 1, null);
  end loop;

  if not exists (
    select 1
    from private.auction_games auction
    where auction.id = v_auction
      and auction.lifecycle_state = 'completed'
      and auction.challenger_final_score between 0 and 100
      and auction.recipient_final_score between 0 and 100
      and (
        (auction.challenger_final_score = auction.recipient_final_score and auction.winner_profile_id is null)
        or
        (auction.challenger_final_score <> auction.recipient_final_score and auction.winner_profile_id in (auction.challenger_id, auction.recipient_id))
      )
  ) then
    raise exception 'Auction did not complete with valid 0-100 winner-or-tie semantics';
  end if;

  perform pg_temp.set_auction_actor(v_challenger);
  v_snapshot := public.get_notification_snapshot(50);
  select item into v_notification
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'auction_result_ready'
    and item->>'route' = '/play/auction?auction=' || v_auction::text;

  if v_notification is null
    or v_notification->>'category' <> 'games'
    or v_notification->>'priority' <> 'push_candidate'
    or position('Final score:' in v_notification->>'summary') <> 1
    or v_notification->>'route' <> '/play/auction?auction=' || v_auction::text
    or v_notification->>'action_label' <> 'VIEW RESULT'
    or (v_notification->>'title') !~ '^Auction result · (You won|True tie|PR6 Recipient won)$'
  then
    raise exception 'challenger result notification was missing final public result data: %', v_snapshot;
  end if;

  perform pg_temp.set_auction_actor(v_challenger);
  v_push_registration := public.register_my_notification_push_subscription(
    'https://push.example.test/subscriptions/auction-pr6',
    repeat('A', 65),
    repeat('B', 24),
    'Auction PR 6 push proof'
  );
  if not (v_push_registration->>'current_device_registered')::boolean
    or (v_push_registration->>'active_device_count')::integer <> 1
  then
    raise exception 'Auction push proof subscription was not registered: %', v_push_registration;
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_claim := public.claim_notification_push_delivery((v_notification->>'id')::uuid);

  if v_claim->'notification'->>'kind' <> 'auction_result_ready'
    or v_claim->'notification'->>'route' <> '/play/auction?auction=' || v_auction::text
    or jsonb_array_length(v_claim->'deliveries') <> 1
    or (v_claim->'notification') ?| array[
      'bid', 'pending_bid', 'category_intent', 'future_deck', 'rarity', 'formula',
      'intermediate_grade', 'category_grade', 'item_grade', 'winner_explanation',
      'best_purchase', 'overpay', 'missed_opportunity', 'random_seed'
    ]
  then
    raise exception 'push claim was not eligible, safe, and subscription-aware: %', v_claim;
  end if;

  v_delivery_id := (v_claim->'deliveries'->0->>'delivery_id')::uuid;
  v_repeated_claim := public.claim_notification_push_delivery((v_notification->>'id')::uuid);
  if jsonb_array_length(v_repeated_claim->'deliveries') <> 0 then
    raise exception 'Auction push retry duplicated a delivery: %', v_repeated_claim;
  end if;

  perform public.record_notification_push_delivery(
    v_delivery_id,
    false,
    500,
    'Synthetic Auction push failure'
  );
  if (
    select count(*)
    from private.notification_events
    where source_key = 'auction:completed:' || v_auction::text
      and recipient_profile_id in (v_challenger, v_recipient)
  ) <> 2 then
    raise exception 'failed push delivery duplicated or removed the in-app Auction result';
  end if;

  perform pg_temp.set_auction_actor(v_challenger);
  v_push_removal := public.remove_my_notification_push_subscription(
    'https://push.example.test/subscriptions/auction-pr6'
  );
  if (v_push_removal->>'current_device_registered')::boolean
    or (v_push_removal->>'active_device_count')::integer <> 0
  then
    raise exception 'Auction push preference was not disabled for the proof device: %', v_push_removal;
  end if;

  v_preview := public.get_rich_preview_data('auction', v_auction::text);
  if v_preview is null
    or v_preview->>'kind' <> 'auction-result'
    or v_preview->>'auction_id' <> v_auction::text
    or (v_preview->>'challenger_score')::numeric not between 0 and 100
    or (v_preview->>'recipient_score')::numeric not between 0 and 100
    or v_preview->>'verdict' is null
    or (
      select array_agg(key order by key)
      from jsonb_object_keys(v_preview) key
    ) is distinct from array[
      'auction_id', 'challenger_name', 'challenger_score', 'kind', 'mode_id',
      'recipient_name', 'recipient_score', 'verdict'
    ]::text[]
  then
    raise exception 'completed Auction public preview exceeded or missed its safe projection: %', v_preview;
  end if;

  v_private_text := lower(v_preview::text || ' ' || v_snapshot::text || ' ' || (v_claim->'notification')::text);
  if v_private_text ~ '(private_item|pending_bid|future_deck|rarity_weight|rarity_class|grading_formula|grading_weight|intermediate_grade|category_grade|item_grade|winner_explanation|best_purchase|overpay|missed_opportunity|random_seed)' then
    raise exception 'public result surfaces leaked a forbidden private field: %', v_private_text;
  end if;

  if (
    select count(*)
    from private.notification_events
    where source_key = 'auction:completed:' || v_auction::text
      and recipient_profile_id in (v_challenger, v_recipient)
  ) <> 2 then
    raise exception 'completion notification producer was not exactly once per participant';
  end if;

  if (
    select count(*)
    from private.notification_events
    where source_key = 'auction:accepted:' || v_auction::text
      and recipient_profile_id = v_challenger
  ) <> 1 or (
    select count(*)
    from private.notification_events
    where source_key like 'auction:round:' || v_auction::text || ':%'
  ) <> 2 then
    raise exception 'Auction acceptance or action-needed notification producer was not exactly once';
  end if;

  perform pg_temp.set_auction_actor(v_outsider);
  v_snapshot := public.get_notification_snapshot(50);
  if exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'route' = '/play/auction?auction=' || v_auction::text
  ) then
    raise exception 'unrelated profile received an Auction notification: %', v_snapshot;
  end if;

  -- Build the final two rounds of the canonical real-content tie fixture, then
  -- complete it through the public bid command so tie copy comes from the same
  -- authoritative transition owner as an ordinary production game.
  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);

  insert into public.play_challenges (
    code, game_id, game_version, game_title, summary,
    creator_id, recipient_id, play_url, setup, creator_result, opened_at
  ) values (
    'PR6TIE01', 'auction', 'auction-server-v3', 'Auction', 'strikers',
    v_challenger, v_recipient, '/play/auction?auction=' || v_tie_auction::text,
    '{}'::jsonb, '{}'::jsonb, now()
  ) returning id into v_tie_challenge;

  insert into private.auction_games (
    id, challenger_id, recipient_id, mode_id, challenge_id, lifecycle_state,
    content_version, rarity_version, grading_version, current_round,
    tie_priority_profile_id, challenger_bankroll, recipient_bankroll,
    challenger_selection_count, recipient_selection_count
  ) values (
    v_tie_auction, v_challenger, v_recipient, 'strikers', v_tie_challenge, 'active',
    'ufc-auction-2026-08-v1', 'balanced-rarity-2026-08-v1',
    'ufc-private-grader-2026-08-v1', 7, v_challenger, 40, 40, 3, 3
  );

  insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
  select v_tie_auction, position, reference
  from (values
    (1, 'strikers-1'), (2, 'strikers-2'), (3, 'strikers-3'), (4, 'strikers-4'),
    (5, 'strikers-5'), (6, 'strikers-6'), (7, 'strikers-7'), (8, 'strikers-8')
  ) deck(position, reference);

  insert into private.auction_awards (auction_id, deck_entry_id, awarded_to, resolved_round)
  select v_tie_auction, deck.id,
    case when deck.private_item_reference in ('strikers-1', 'strikers-3', 'strikers-6')
      then v_challenger else v_recipient end,
    deck.deck_position
  from private.auction_deck_entries deck
  where deck.auction_id = v_tie_auction
    and deck.deck_position <= 6;

  select revision into v_revision from private.auction_games where id = v_tie_auction;
  perform pg_temp.set_auction_actor(v_challenger);
  perform public.submit_auction_bid(v_tie_auction, 7, v_revision, 1, null);
  perform pg_temp.set_auction_actor(v_recipient);
  perform public.submit_auction_bid(v_tie_auction, 7, v_revision, 2, null);

  if not exists (
    select 1
    from private.auction_games
    where id = v_tie_auction
      and lifecycle_state = 'completed'
      and challenger_final_score = 96.25
      and recipient_final_score = 96.25
      and winner_profile_id is null
  ) then
    raise exception 'public Auction completion did not preserve the canonical true-tie fixture';
  end if;

  perform pg_temp.set_auction_actor(v_challenger);
  v_snapshot := public.get_notification_snapshot(50);
  if not exists (
    select 1
    from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'auction_result_ready'
      and item->>'title' = 'Auction result · True tie'
      and item->>'route' = '/play/auction?auction=' || v_tie_auction::text
      and position('96.25' in item->>'summary') > 0
  ) then
    raise exception 'true-tie result notification was missing or unsafe: %', v_snapshot;
  end if;

  v_preview := public.get_rich_preview_data('auction', v_tie_auction::text);
  if v_preview->>'verdict' <> 'True tie'
    or (v_preview->>'challenger_score')::numeric <> 96.25
    or (v_preview->>'recipient_score')::numeric <> 96.25
  then
    raise exception 'true-tie public preview was missing or incorrect: %', v_preview;
  end if;

  -- Decline and cancellation remain canonical terminal transitions and safe push candidates.
  perform pg_temp.set_auction_actor(v_challenger);
  v_decline_auction := public.prepare_auction(v_recipient, 'wars');
  v_decline_code := public.send_auction_first_bid(v_decline_auction, 0, 3, null);
  perform pg_temp.set_auction_actor(v_recipient);
  if not public.dismiss_play_challenge(v_decline_code) then
    raise exception 'recipient could not decline the sent Auction';
  end if;

  perform pg_temp.set_auction_actor(v_challenger);
  v_snapshot := public.get_notification_snapshot(50);
  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'auction_result_ready'
      and item->>'title' = 'Auction declined'
      and item->>'priority' = 'push_candidate'
      and item->>'route' = '/play/auction?auction=' || v_decline_auction::text
  ) then
    raise exception 'decline notification did not use the Auction terminal notification owner: %', v_snapshot;
  end if;

  v_cancel_auction := public.prepare_auction(v_cancel_recipient, 'grapplers');
  perform public.send_auction_first_bid(v_cancel_auction, 0, 4, null);
  select revision into v_revision from private.auction_games where id = v_cancel_auction;
  perform pg_temp.set_auction_actor(v_cancel_recipient);
  perform public.submit_auction_bid(v_cancel_auction, 1, v_revision, 2, null);
  select revision into v_revision from private.auction_games where id = v_cancel_auction;
  perform public.cancel_auction(v_cancel_auction, v_revision);

  perform pg_temp.set_auction_actor(v_challenger);
  v_snapshot := public.get_notification_snapshot(50);
  if not exists (
    select 1 from jsonb_array_elements(v_snapshot->'items') item
    where item->>'kind' = 'auction_result_ready'
      and item->>'title' = 'Auction cancelled'
      and item->>'priority' = 'push_candidate'
      and item->>'route' = '/play/auction?auction=' || v_cancel_auction::text
  ) then
    raise exception 'cancel notification did not use the Auction terminal notification owner: %', v_snapshot;
  end if;

  select item into v_notification
  from jsonb_array_elements(v_snapshot->'items') item
  where item->>'kind' = 'auction_result_ready'
    and item->>'title' = 'Auction cancelled'
    and item->>'route' = '/play/auction?auction=' || v_cancel_auction::text;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  v_claim := public.claim_notification_push_delivery((v_notification->>'id')::uuid);
  if v_claim->'notification'->>'kind' <> 'auction_result_ready'
    or jsonb_array_length(v_claim->'deliveries') <> 0
  then
    raise exception 'disabled Auction push device unexpectedly received a delivery: %', v_claim;
  end if;

  if public.get_rich_preview_data('auction', v_cancel_auction::text) is not null
    or public.get_rich_preview_data('auction', v_decline_auction::text) is not null
    or public.get_rich_preview_data('auction', 'not-a-uuid') is not null
  then
    raise exception 'non-completed or invalid Auction produced a public result preview';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform set_config('request.jwt.claim.sub', '', true);
  delete from auth.users where id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient);

  if exists (
    select 1 from public.profiles
    where id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
  ) or exists (
    select 1 from private.auction_games
    where challenger_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
       or recipient_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
  ) or exists (
    select 1 from public.play_challenges
    where creator_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
       or recipient_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
  ) or exists (
    select 1 from private.notification_groups
    where recipient_profile_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
  ) or exists (
    select 1 from private.notification_events
    where recipient_profile_id in (v_challenger, v_recipient, v_outsider, v_cancel_recipient)
  ) then
    raise exception 'temporary Auction proof rows did not cascade cleanly';
  end if;
end $$;

rollback;
