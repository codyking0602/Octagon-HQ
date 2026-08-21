-- Let the challenger cancel a sent Auction until the recipient opens it.
-- Keep public.cancel_auction as the sole cancellation owner and preserve the
-- existing active-game cancellation semantics and optimistic revision guard.

-- The private lifecycle guard is the canonical transition owner. Extend its
-- sent-state transition set narrowly so cancel_auction can terminate an unopened
-- sent challenge without weakening any other lifecycle edge.
create or replace function private.enforce_auction_terminal_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.challenger_id is distinct from old.challenger_id
    or new.recipient_id is distinct from old.recipient_id
    or new.mode_id is distinct from old.mode_id
  then
    raise exception 'Auction participants and mode cannot change';
  end if;

  if new.content_version is distinct from old.content_version
    or new.rarity_version is distinct from old.rarity_version
    or new.grading_version is distinct from old.grading_version
  then
    raise exception 'Auction version snapshot cannot change';
  end if;

  if old.challenge_id is not null and new.challenge_id is distinct from old.challenge_id then
    raise exception 'Linked Auction challenge cannot change';
  end if;

  if old.challenge_id is null
    and new.challenge_id is not null
    and not (old.lifecycle_state = 'prepared' and new.lifecycle_state = 'sent')
  then
    raise exception 'Auction challenge may only be linked when a prepared Auction is sent';
  end if;

  if old.lifecycle_state in ('cancelled', 'abandoned', 'completed', 'declined') then
    if new is distinct from old then
      raise exception 'Auction terminal state cannot change';
    end if;
    return new;
  end if;

  if new.lifecycle_state is distinct from old.lifecycle_state
    and not (
      (old.lifecycle_state = 'prepared' and new.lifecycle_state in ('sent', 'abandoned'))
      or (old.lifecycle_state = 'sent' and new.lifecycle_state in ('active', 'declined', 'cancelled'))
      or (old.lifecycle_state = 'active' and new.lifecycle_state in ('completed', 'cancelled'))
    )
  then
    raise exception 'Invalid Auction lifecycle transition from % to %', old.lifecycle_state, new.lifecycle_state;
  end if;

  if new.revision >= 0 and new.revision < old.revision then
    raise exception 'Auction revision cannot decrease';
  end if;

  if new.current_round < old.current_round then
    raise exception 'Auction round cannot decrease';
  end if;

  if new.challenger_selection_count < old.challenger_selection_count
    or new.recipient_selection_count < old.recipient_selection_count
  then
    raise exception 'Auction selection progress cannot decrease';
  end if;

  if new.challenger_bankroll > old.challenger_bankroll
    or new.recipient_bankroll > old.recipient_bankroll
  then
    raise exception 'Auction bankroll cannot increase';
  end if;

  return new;
end;
$$;

create or replace function public.cancel_auction(
  p_auction_id uuid,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_game private.auction_games;
  v_opponent uuid;
  v_actor_name text;
  v_challenge_opened_at timestamptz;
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

  if v_game.lifecycle_state = 'cancelled' then
    return v_game.revision;
  end if;

  if v_game.lifecycle_state = 'sent' then
    if v_actor <> v_game.challenger_id then
      raise exception 'only the challenger can cancel a pending Auction';
    end if;

    select challenge.opened_at
      into v_challenge_opened_at
    from public.play_challenges challenge
    where challenge.id = v_game.challenge_id;

    if v_challenge_opened_at is not null then
      raise exception 'pending Auction has already been opened';
    end if;
  elsif v_game.lifecycle_state <> 'active' then
    raise exception 'only a pending or active Auction can be cancelled';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  update private.auction_games
  set lifecycle_state = 'cancelled',
      cancelled_by = v_actor,
      cancelled_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  update public.play_challenges
  set creator_hidden_at = coalesce(creator_hidden_at, now()),
      recipient_hidden_at = coalesce(recipient_hidden_at, now())
  where id = v_game.challenge_id;

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_actor;

  v_opponent := case
    when v_actor = v_game.challenger_id then v_game.recipient_id
    else v_game.challenger_id
  end;

  perform private.publish_notification_to_profile(
    v_opponent,
    'auction:cancelled:' || v_game.id::text,
    'auction:' || v_game.id::text,
    'auction_result_ready',
    'Auction cancelled',
    v_actor_name || ' cancelled this Auction. No winner, score, loss, or forfeit was recorded.',
    '/play/auction?auction=' || v_game.id::text,
    'VIEW AUCTION',
    now()
  );

  return v_game.revision;
end;
$$;

revoke all on function public.cancel_auction(uuid, bigint) from public;
grant execute on function public.cancel_auction(uuid, bigint) to authenticated;

comment on function public.cancel_auction(uuid, bigint) is
  'Cancels an unopened sent Auction for its challenger or an active Auction for either participant, with exact-revision protection.';

notify pgrst, 'reload schema';