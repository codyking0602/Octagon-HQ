alter table private.auction_games
  drop constraint auction_games_lifecycle_valid;

alter table private.auction_games
  add constraint auction_games_lifecycle_valid check (lifecycle_state in (
    'prepared', 'sent', 'active', 'completed', 'cancelled', 'abandoned', 'declined'
  ));

alter table private.auction_games
  drop constraint auction_games_challenge_link_state;

alter table private.auction_games
  add constraint auction_games_challenge_link_state check (
    (lifecycle_state in ('prepared', 'abandoned') and challenge_id is null)
    or (lifecycle_state in ('sent', 'active', 'completed', 'cancelled', 'declined') and challenge_id is not null)
  );

alter table private.auction_games
  drop constraint auction_games_cancellation_audit;

alter table private.auction_games
  add constraint auction_games_cancellation_audit check (
    (lifecycle_state = 'cancelled'
      and cancelled_by is not null
      and cancelled_by in (challenger_id, recipient_id)
      and cancelled_at is not null)
    or (lifecycle_state <> 'cancelled'
      and cancelled_by is null
      and cancelled_at is null)
  );

alter table private.auction_games
  drop constraint auction_games_completed_result;

alter table private.auction_games
  add constraint auction_games_completed_result check (
    (lifecycle_state <> 'completed'
      and challenger_final_score is null
      and recipient_final_score is null
      and winner_profile_id is null)
    or (lifecycle_state = 'completed'
      and challenger_final_score is not null
      and recipient_final_score is not null
      and (
        (challenger_final_score = recipient_final_score and winner_profile_id is null)
        or (challenger_final_score > recipient_final_score
          and winner_profile_id is not null
          and winner_profile_id = challenger_id)
        or (recipient_final_score > challenger_final_score
          and winner_profile_id is not null
          and winner_profile_id = recipient_id)
      ))
  );

alter table private.auction_games
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case when mode_id = 'ultimate-fighter' then 50 else 40 end
    and recipient_bankroll <= case when mode_id = 'ultimate-fighter' then 50 else 40 end
  );

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
      or (old.lifecycle_state = 'sent' and new.lifecycle_state in ('active', 'declined'))
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

create or replace function public.get_auction_participant_state(p_auction_id uuid)
returns table (
  auction_id uuid,
  mode_id text,
  challenger_id uuid,
  challenger_display_name text,
  recipient_id uuid,
  recipient_display_name text,
  lifecycle_state text,
  current_round integer,
  revision bigint,
  tie_priority_profile_id uuid,
  challenger_bankroll integer,
  recipient_bankroll integer,
  challenger_selection_count integer,
  recipient_selection_count integer,
  current_user_submitted_bid boolean,
  action_required_by text,
  challenge_code text,
  cancelled_by uuid,
  cancelled_at timestamptz,
  challenger_final_score numeric,
  recipient_final_score numeric,
  winner_profile_id uuid,
  is_tie boolean,
  awarded_collections jsonb
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    auction.id,
    auction.mode_id,
    auction.challenger_id,
    challenger.display_name,
    auction.recipient_id,
    recipient.display_name,
    auction.lifecycle_state,
    auction.current_round,
    auction.revision,
    auction.tie_priority_profile_id,
    auction.challenger_bankroll,
    auction.recipient_bankroll,
    auction.challenger_selection_count,
    auction.recipient_selection_count,
    case
      when auction.lifecycle_state in ('prepared', 'sent', 'active') then exists (
        select 1 from private.auction_pending_bids bid
        where bid.auction_id = auction.id
          and bid.round_number = auction.current_round
          and bid.bidder_id = auth.uid()
      )
      else false
    end,
    case
      when auction.lifecycle_state = 'prepared' then 'challenger'
      when auction.lifecycle_state = 'sent' then 'recipient'
      when auction.lifecycle_state = 'active' then case
        when not exists (
          select 1 from private.auction_pending_bids bid
          where bid.auction_id = auction.id
            and bid.round_number = auction.current_round
            and bid.bidder_id = auction.challenger_id
        ) and not exists (
          select 1 from private.auction_pending_bids bid
          where bid.auction_id = auction.id
            and bid.round_number = auction.current_round
            and bid.bidder_id = auction.recipient_id
        ) then 'both'
        when not exists (
          select 1 from private.auction_pending_bids bid
          where bid.auction_id = auction.id
            and bid.round_number = auction.current_round
            and bid.bidder_id = auction.challenger_id
        ) then 'challenger'
        when not exists (
          select 1 from private.auction_pending_bids bid
          where bid.auction_id = auction.id
            and bid.round_number = auction.current_round
            and bid.bidder_id = auction.recipient_id
        ) then 'recipient'
        else 'none'
      end
      else 'none'
    end,
    challenge.code,
    auction.cancelled_by,
    auction.cancelled_at,
    case when auction.lifecycle_state = 'completed' then auction.challenger_final_score end,
    case when auction.lifecycle_state = 'completed' then auction.recipient_final_score end,
    case when auction.lifecycle_state = 'completed' then auction.winner_profile_id end,
    case when auction.lifecycle_state = 'completed'
      then auction.challenger_final_score = auction.recipient_final_score
      else false
    end,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'deck_position', deck.deck_position,
        'awarded_to', award.awarded_to,
        'category', award.visible_category,
        'resolved_round', award.resolved_round
      ) order by award.resolved_round, deck.deck_position)
      from private.auction_awards award
      join private.auction_deck_entries deck
        on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
      where award.auction_id = auction.id
    ), '[]'::jsonb)
  from private.auction_games auction
  join public.profiles challenger on challenger.id = auction.challenger_id
  join public.profiles recipient on recipient.id = auction.recipient_id
  left join public.play_challenges challenge on challenge.id = auction.challenge_id
  where auction.id = p_auction_id
    and (
      (auction.lifecycle_state = 'prepared' and auth.uid() = auction.challenger_id)
      or (
        auction.lifecycle_state in ('sent', 'active', 'completed', 'cancelled', 'declined')
        and auth.uid() in (auction.challenger_id, auction.recipient_id)
      )
    );
$$;

comment on function public.get_auction_participant_state(uuid) is
  'Lifecycle-aware participant projection: prepared state is challenger-only, abandoned state is unreadable, and sealed bid presence is hidden after terminal states.';
