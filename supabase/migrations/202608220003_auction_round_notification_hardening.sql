-- Auction PR 3 hardening: pending bids must not trigger opponent notifications.
-- A round notification is published only after the authoritative award exists.

create or replace function public.submit_auction_bid(
  p_auction_id uuid,
  p_round integer,
  p_expected_revision bigint,
  p_amount numeric,
  p_category text default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_actor uuid := auth.uid();
  v_opponent uuid;
  v_was_sent boolean;
  v_actor_name text;
  v_resolved_round integer;
  v_round_resolved boolean;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not an Auction participant';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not accepting bids';
  end if;

  v_was_sent := v_game.lifecycle_state = 'sent';

  if v_was_sent and v_actor <> v_game.recipient_id then
    raise exception 'recipient must accept with the first bid';
  end if;

  if v_game.current_round <> p_round then
    raise exception 'wrong round';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  perform private.validate_auction_bid(
    v_game,
    v_actor,
    p_amount,
    p_category
  );

  begin
    insert into private.auction_pending_bids (
      auction_id,
      round_number,
      bidder_id,
      amount,
      ultimate_fighter_category
    ) values (
      v_game.id,
      p_round,
      v_actor,
      p_amount::integer,
      p_category
    );
  exception when unique_violation then
    raise exception 'bid is locked and cannot be edited';
  end;

  if v_was_sent then
    update public.play_challenges
    set opened_at = coalesce(opened_at, now())
    where id = v_game.challenge_id;

    select profile.display_name
      into v_actor_name
    from public.profiles profile
    where profile.id = v_actor;

    perform private.publish_notification_to_profile(
      v_game.challenger_id,
      'auction:accepted:' || v_game.id::text,
      'auction:' || v_game.id::text,
      'game_challenge_accepted',
      'Auction accepted',
      v_actor_name || ' accepted your Auction challenge.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW AUCTION',
      now()
    );
  end if;

  v_resolved_round := v_game.current_round;
  perform private.resolve_auction_round(v_game.id);

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  select exists (
    select 1
    from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_resolved_round
  ) into v_round_resolved;

  if v_round_resolved
    and v_game.lifecycle_state = 'active'
    and not v_was_sent
  then
    v_opponent := case
      when v_actor = v_game.challenger_id then v_game.recipient_id
      else v_game.challenger_id
    end;

    perform private.publish_notification_to_profile(
      v_opponent,
      'auction:round:' || v_game.id::text || ':' || v_resolved_round::text,
      'auction:' || v_game.id::text,
      'game_challenge_accepted',
      'Auction action required',
      'An Auction round resolved. Your next bid is ready.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW AUCTION',
      now()
    );
  elsif v_game.lifecycle_state = 'completed' then
    perform private.publish_notification_to_profile(
      v_game.challenger_id,
      'auction:completed:' || v_game.id::text,
      'auction:' || v_game.id::text,
      'game_challenge_result_ready',
      'Auction completed',
      'Your Auction is complete.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW RESULT',
      now()
    );
    perform private.publish_notification_to_profile(
      v_game.recipient_id,
      'auction:completed:' || v_game.id::text,
      'auction:' || v_game.id::text,
      'game_challenge_result_ready',
      'Auction completed',
      'Your Auction is complete.',
      '/play/auction?auction=' || v_game.id::text,
      'VIEW RESULT',
      now()
    );
  end if;

  return v_game.revision;
end;
$$;

comment on function public.submit_auction_bid(uuid, integer, bigint, numeric, text) is
  'Locks one sealed bid and resolves transactionally; opponent notifications require a persisted round award and never reveal a pending bid.';
