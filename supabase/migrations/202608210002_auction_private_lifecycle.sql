create table private.auction_games (
  id uuid primary key default extensions.gen_random_uuid(),
  challenger_id uuid not null references public.profiles(id) on delete restrict,
  recipient_id uuid not null references public.profiles(id) on delete restrict,
  mode_id text not null,
  challenge_id uuid unique references public.play_challenges(id) on delete restrict,
  lifecycle_state text not null default 'prepared',
  content_version text not null,
  rarity_version text not null,
  grading_version text not null,
  current_round integer not null default 1,
  revision bigint not null default 0,
  tie_priority_profile_id uuid not null references public.profiles(id) on delete restrict,
  challenger_bankroll integer not null,
  recipient_bankroll integer not null,
  challenger_selection_count integer not null default 0,
  recipient_selection_count integer not null default 0,
  cancelled_by uuid references public.profiles(id) on delete restrict,
  cancelled_at timestamptz,
  challenger_final_score numeric(5,2),
  recipient_final_score numeric(5,2),
  winner_profile_id uuid references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint auction_games_different_profiles check (challenger_id <> recipient_id),
  constraint auction_games_mode_valid check (mode_id in (
    'ultimate-fighter',
    'jon-jones-performances',
    'conor-mcgregor-performances',
    'charles-oliveira-performances',
    'fighter-performances',
    'strikers',
    'grapplers',
    'knockout-artists',
    'greatest-ufc-card',
    'championship-performances',
    'finishes',
    'dominant-performances',
    'wars',
    'rivalries',
    'iconic-moments',
    'nicknames'
  )),
  constraint auction_games_lifecycle_valid check (lifecycle_state in (
    'prepared', 'sent', 'active', 'completed', 'cancelled', 'abandoned'
  )),
  constraint auction_games_versions_present check (
    char_length(trim(content_version)) between 1 and 80
    and char_length(trim(rarity_version)) between 1 and 80
    and char_length(trim(grading_version)) between 1 and 80
  ),
  constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case when mode_id = 'ultimate-fighter' then 10 else 8 end
  ),
  constraint auction_games_revision_valid check (revision >= 0),
  constraint auction_games_tie_priority_participant check (
    tie_priority_profile_id in (challenger_id, recipient_id)
  ),
  constraint auction_games_bankrolls_nonnegative check (
    challenger_bankroll >= 0 and recipient_bankroll >= 0
  ),
  constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case when mode_id = 'ultimate-fighter' then 5 else 4 end
    and recipient_selection_count between 0 and case when mode_id = 'ultimate-fighter' then 5 else 4 end
  ),
  constraint auction_games_challenge_link_state check (
    (lifecycle_state in ('prepared', 'abandoned') and challenge_id is null)
    or (lifecycle_state in ('sent', 'active', 'completed', 'cancelled') and challenge_id is not null)
  ),
  constraint auction_games_cancellation_audit check (
    (lifecycle_state = 'cancelled'
      and cancelled_by in (challenger_id, recipient_id)
      and cancelled_at is not null)
    or (lifecycle_state <> 'cancelled' and cancelled_by is null and cancelled_at is null)
  ),
  constraint auction_games_final_scores_valid check (
    (challenger_final_score is null or challenger_final_score between 0 and 100)
    and (recipient_final_score is null or recipient_final_score between 0 and 100)
  ),
  constraint auction_games_completed_result check (
    (lifecycle_state <> 'completed'
      and challenger_final_score is null
      and recipient_final_score is null
      and winner_profile_id is null)
    or (lifecycle_state = 'completed'
      and challenger_final_score is not null
      and recipient_final_score is not null
      and (
        (challenger_final_score = recipient_final_score and winner_profile_id is null)
        or (challenger_final_score > recipient_final_score and winner_profile_id = challenger_id)
        or (recipient_final_score > challenger_final_score and winner_profile_id = recipient_id)
      ))
  )
);

create table private.auction_deck_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position >= 1),
  private_item_reference text not null check (char_length(trim(private_item_reference)) between 1 and 160),
  unique (auction_id, deck_position),
  unique (id, auction_id)
);

create table private.auction_pending_bids (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  round_number integer not null check (round_number >= 1),
  bidder_id uuid not null references public.profiles(id) on delete restrict,
  amount integer not null check (amount >= 1),
  ultimate_fighter_category text check (ultimate_fighter_category in (
    'Striking', 'Grappling', 'Frame', 'Power', 'Heart'
  )),
  submitted_at timestamptz not null default now(),
  primary key (auction_id, round_number, bidder_id)
);

create table private.auction_awards (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_entry_id uuid not null,
  awarded_to uuid not null references public.profiles(id) on delete restrict,
  resolved_round integer not null check (resolved_round >= 1),
  visible_category text check (visible_category in (
    'Striking', 'Grappling', 'Frame', 'Power', 'Heart'
  )),
  awarded_at timestamptz not null default now(),
  primary key (auction_id, deck_entry_id),
  foreign key (deck_entry_id, auction_id)
    references private.auction_deck_entries(id, auction_id) on delete restrict
);

alter table private.auction_games enable row level security;
alter table private.auction_deck_entries enable row level security;
alter table private.auction_pending_bids enable row level security;
alter table private.auction_awards enable row level security;

revoke all on private.auction_games from public, anon, authenticated;
revoke all on private.auction_deck_entries from public, anon, authenticated;
revoke all on private.auction_pending_bids from public, anon, authenticated;
revoke all on private.auction_awards from public, anon, authenticated;

create index auction_games_challenger_created_idx
  on private.auction_games (challenger_id, created_at desc);
create index auction_games_recipient_created_idx
  on private.auction_games (recipient_id, created_at desc);
create index auction_pending_bids_lookup_idx
  on private.auction_pending_bids (auction_id, round_number);
create index auction_awards_participant_idx
  on private.auction_awards (auction_id, awarded_to, resolved_round);

create or replace function private.validate_auction_challenge_link()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.challenge_id is not null and not exists (
    select 1
    from public.play_challenges challenge
    where challenge.id = new.challenge_id
      and challenge.game_id = 'auction'
      and challenge.creator_id = new.challenger_id
      and challenge.recipient_id = new.recipient_id
  ) then
    raise exception 'Auction challenge link must use the same game and participants';
  end if;
  return new;
end;
$$;

create constraint trigger auction_games_validate_challenge_link
after insert or update of challenge_id, challenger_id, recipient_id
on private.auction_games
deferrable initially immediate
for each row execute function private.validate_auction_challenge_link();

create or replace function private.protect_linked_auction_challenge()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1
    from private.auction_games auction
    where auction.challenge_id = new.id
      and (
        new.game_id <> 'auction'
        or new.creator_id <> auction.challenger_id
        or new.recipient_id <> auction.recipient_id
      )
  ) then
    raise exception 'Linked Auction challenge identity cannot change';
  end if;
  return new;
end;
$$;

create trigger play_challenges_protect_auction_identity
before update of game_id, creator_id, recipient_id on public.play_challenges
for each row execute function private.protect_linked_auction_challenge();

create or replace function private.validate_auction_private_row()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_profile_id uuid;
  v_round integer;
begin
  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = new.auction_id;

  if tg_table_name = 'auction_pending_bids' then
    v_profile_id := new.bidder_id;
    v_round := new.round_number;
    if new.ultimate_fighter_category is not null and v_auction.mode_id <> 'ultimate-fighter' then
      raise exception 'Category intent is only valid for Ultimate Fighter';
    end if;
  else
    v_profile_id := new.awarded_to;
    v_round := new.resolved_round;
    if new.visible_category is not null and v_auction.mode_id <> 'ultimate-fighter' then
      raise exception 'Visible category is only valid for Ultimate Fighter';
    end if;
  end if;

  if v_profile_id not in (v_auction.challenger_id, v_auction.recipient_id) then
    raise exception 'Auction private row must belong to a participant';
  end if;
  if v_round > (case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end) then
    raise exception 'Auction round exceeds the selected mode';
  end if;
  return new;
end;
$$;

create trigger auction_pending_bids_validate
before insert or update on private.auction_pending_bids
for each row execute function private.validate_auction_private_row();
create trigger auction_awards_validate
before insert or update on private.auction_awards
for each row execute function private.validate_auction_private_row();

create or replace function private.enforce_auction_terminal_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.lifecycle_state in ('cancelled', 'abandoned', 'completed')
    and new.lifecycle_state <> old.lifecycle_state
  then
    raise exception 'Auction terminal state cannot change';
  end if;
  return new;
end;
$$;

create trigger auction_games_terminal_state
before update on private.auction_games
for each row execute function private.enforce_auction_terminal_state();

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
    exists (
      select 1 from private.auction_pending_bids bid
      where bid.auction_id = auction.id
        and bid.round_number = auction.current_round
        and bid.bidder_id = auth.uid()
    ),
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
    and auth.uid() in (auction.challenger_id, auction.recipient_id);
$$;

revoke all on function private.validate_auction_challenge_link() from public, anon, authenticated;
revoke all on function private.protect_linked_auction_challenge() from public, anon, authenticated;
revoke all on function private.validate_auction_private_row() from public, anon, authenticated;
revoke all on function private.enforce_auction_terminal_state() from public, anon, authenticated;
revoke all on function public.get_auction_participant_state(uuid) from public, anon;
grant execute on function public.get_auction_participant_state(uuid) to authenticated;

comment on table private.auction_games is 'Server-private Auction lifecycle state linked to the canonical Play challenge when published.';
comment on table private.auction_deck_entries is 'Server-private fixed deck order; only awarded positions may enter the participant projection.';
comment on table private.auction_pending_bids is 'Server-private sealed bids and pending Ultimate Fighter category intent.';
comment on function public.get_auction_participant_state(uuid) is 'Participant-only Auction projection with explicit safe columns and no sealed bid, future deck, or grading internals.';
