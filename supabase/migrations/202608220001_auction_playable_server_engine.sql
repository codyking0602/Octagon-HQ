-- Auction PR 3: playable server-authoritative engine.
-- Catalogs, fixed decks, pending bids, category intent, and grading boundaries stay private.

create table private.auction_catalog_versions (
  content_version text primary key,
  rarity_version text not null,
  grading_version text not null,
  is_preparation_version boolean not null default false,
  created_at timestamptz not null default now(),
  constraint auction_catalog_versions_names_present check (
    char_length(trim(content_version)) between 1 and 80
    and char_length(trim(rarity_version)) between 1 and 80
    and char_length(trim(grading_version)) between 1 and 80
  )
);

create unique index auction_one_preparation_version
  on private.auction_catalog_versions (is_preparation_version)
  where is_preparation_version;

create table private.auction_catalog (
  content_version text not null
    references private.auction_catalog_versions(content_version) on delete restrict,
  mode_id text not null,
  item_reference text not null,
  display_label text not null,
  rarity_band integer not null check (rarity_band between 1 and 5),
  primary key (content_version, mode_id, item_reference),
  unique (content_version, mode_id, display_label)
);

alter table private.auction_catalog_versions enable row level security;
alter table private.auction_catalog enable row level security;
revoke all on private.auction_catalog_versions from public, anon, authenticated;
revoke all on private.auction_catalog from public, anon, authenticated;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version
) values (
  'fixture-2026-08-22-v1',
  'rarity-fixture-v1',
  'grader-contract-v1',
  true
);

-- Deliberately reviewed fixture content only. Future catalog migrations add rows and
-- versions without changing the generator or hard-coding this temporary item count.
insert into private.auction_catalog (
  content_version,
  mode_id,
  item_reference,
  display_label,
  rarity_band
)
select
  'fixture-2026-08-22-v1',
  mode.mode_id,
  mode.mode_id || '-item-' || item.n,
  mode.label || ' ' || item.n,
  1 + ((item.n - 1) % 5)
from (values
  ('ultimate-fighter', 'Ultimate Fighter'),
  ('jon-jones-performances', 'Jon Jones Performance'),
  ('conor-mcgregor-performances', 'Conor McGregor Performance'),
  ('charles-oliveira-performances', 'Charles Oliveira Performance'),
  ('fighter-performances', 'Fighter Performance'),
  ('strikers', 'Striker'),
  ('grapplers', 'Grappler'),
  ('knockout-artists', 'Knockout Artist'),
  ('greatest-ufc-card', 'UFC Card Fight'),
  ('championship-performances', 'Championship Performance'),
  ('finishes', 'Finish'),
  ('dominant-performances', 'Dominant Performance'),
  ('wars', 'War'),
  ('rivalries', 'Rivalry'),
  ('iconic-moments', 'Iconic Moment'),
  ('nicknames', 'Nickname')
) mode(mode_id, label)
cross join generate_series(1, 12) item(n);

create unique index auction_one_prepared_choice
  on private.auction_games (challenger_id, recipient_id, mode_id)
  where lifecycle_state = 'prepared';

create unique index auction_one_award_per_round
  on private.auction_awards (auction_id, resolved_round);

create unique index auction_one_ultimate_fighter_category
  on private.auction_awards (auction_id, awarded_to, visible_category)
  where visible_category is not null;

create or replace function private.prevent_auction_private_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Auction private records are immutable';
end;
$$;

create trigger auction_catalog_versions_immutable
before update or delete on private.auction_catalog_versions
for each row execute function private.prevent_auction_private_mutation();

create trigger auction_catalog_immutable
before update or delete on private.auction_catalog
for each row execute function private.prevent_auction_private_mutation();

create trigger auction_deck_entries_immutable
before update or delete on private.auction_deck_entries
for each row execute function private.prevent_auction_private_mutation();

create trigger auction_pending_bids_immutable
before update or delete on private.auction_pending_bids
for each row execute function private.prevent_auction_private_mutation();

create trigger auction_awards_immutable
before update or delete on private.auction_awards
for each row execute function private.prevent_auction_private_mutation();

create or replace function private.validate_auction_private_row()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_deck_position integer;
begin
  select auction.*
    into v_auction
  from private.auction_games auction
  where auction.id = new.auction_id;

  if v_auction.id is null then
    raise exception 'Auction private row requires an Auction';
  end if;

  if tg_table_name = 'auction_deck_entries' then
    if new.deck_position > (
      case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end
    ) then
      raise exception 'Auction deck position exceeds the selected mode';
    end if;
    if not exists (
      select 1
      from private.auction_catalog catalog
      where catalog.content_version = v_auction.content_version
        and catalog.mode_id = v_auction.mode_id
        and catalog.item_reference = new.private_item_reference
    ) then
      raise exception 'Auction deck item is not in the pinned catalog';
    end if;
    return new;
  end if;

  if tg_table_name = 'auction_pending_bids' then
    if new.bidder_id not in (v_auction.challenger_id, v_auction.recipient_id) then
      raise exception 'Auction private row must belong to a participant';
    end if;
    if new.round_number > (
      case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end
    ) then
      raise exception 'Auction round exceeds the selected mode';
    end if;
    if v_auction.mode_id = 'ultimate-fighter'
      and new.ultimate_fighter_category is null
    then
      raise exception 'Ultimate Fighter bids require category intent';
    end if;
    if v_auction.mode_id <> 'ultimate-fighter'
      and new.ultimate_fighter_category is not null
    then
      raise exception 'Category intent is only valid for Ultimate Fighter';
    end if;
  else
    if new.awarded_to not in (v_auction.challenger_id, v_auction.recipient_id) then
      raise exception 'Auction private row must belong to a participant';
    end if;
    if new.resolved_round > (
      case when v_auction.mode_id = 'ultimate-fighter' then 10 else 8 end
    ) then
      raise exception 'Auction round exceeds the selected mode';
    end if;
    select deck.deck_position
      into v_deck_position
    from private.auction_deck_entries deck
    where deck.id = new.deck_entry_id
      and deck.auction_id = new.auction_id;
    if v_deck_position is distinct from new.resolved_round then
      raise exception 'Auction award must match its deck round';
    end if;
    if v_auction.mode_id = 'ultimate-fighter'
      and new.visible_category is null
    then
      raise exception 'Ultimate Fighter awards require a visible category';
    end if;
    if v_auction.mode_id <> 'ultimate-fighter'
      and new.visible_category is not null
    then
      raise exception 'Visible category is only valid for Ultimate Fighter';
    end if;
  end if;

  return new;
end;
$$;

create or replace function private.generate_auction_deck(
  p_auction_id uuid,
  p_content_version text,
  p_mode_id text,
  p_count integer,
  p_random_order double precision[] default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_available integer;
begin
  if p_count < 1 then
    raise exception 'invalid deck size';
  end if;

  if exists (
    select 1
    from private.auction_deck_entries deck
    where deck.auction_id = p_auction_id
  ) then
    raise exception 'Auction deck is already fixed';
  end if;

  select count(*)
    into v_available
  from private.auction_catalog catalog
  where catalog.content_version = p_content_version
    and catalog.mode_id = p_mode_id;

  if v_available < p_count then
    raise exception 'catalog does not contain enough unique items';
  end if;

  if p_random_order is not null
    and cardinality(p_random_order) < v_available
  then
    raise exception 'test randomness does not cover the catalog';
  end if;

  insert into private.auction_deck_entries (
    auction_id,
    deck_position,
    private_item_reference
  )
  select
    p_auction_id,
    row_number() over (order by candidate.random_key, candidate.item_reference),
    candidate.item_reference
  from (
    select
      catalog.item_reference,
      case
        when p_random_order is null then random()
        else p_random_order[
          (row_number() over (order by catalog.item_reference))::integer
        ]
      end as random_key
    from private.auction_catalog catalog
    where catalog.content_version = p_content_version
      and catalog.mode_id = p_mode_id
  ) candidate
  order by candidate.random_key, candidate.item_reference
  limit p_count;
end;
$$;

create or replace function public.prepare_auction(
  p_recipient_id uuid,
  p_mode_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_id uuid;
  v_rounds integer;
  v_bankroll integer;
  v_content_version text;
  v_rarity_version text;
  v_grading_version text;
  v_tie_priority uuid;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null
    or not exists (
      select 1 from public.profiles profile where profile.id = p_recipient_id
    )
  then
    raise exception 'opponent not found';
  end if;

  if p_recipient_id = v_actor then
    raise exception 'self-challenges are not allowed';
  end if;

  if p_mode_id not in (
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
  ) then
    raise exception 'invalid Auction mode';
  end if;

  select auction.id
    into v_id
  from private.auction_games auction
  where auction.challenger_id = v_actor
    and auction.recipient_id = p_recipient_id
    and auction.mode_id = p_mode_id
    and auction.lifecycle_state = 'prepared'
  for update;

  if found then
    return v_id;
  end if;

  select
    version.content_version,
    version.rarity_version,
    version.grading_version
  into
    v_content_version,
    v_rarity_version,
    v_grading_version
  from private.auction_catalog_versions version
  where version.is_preparation_version;

  if v_content_version is null then
    raise exception 'Auction catalog version is unavailable';
  end if;

  v_rounds := case when p_mode_id = 'ultimate-fighter' then 10 else 8 end;
  v_bankroll := case when p_mode_id = 'ultimate-fighter' then 50 else 40 end;
  v_tie_priority := case
    when get_byte(extensions.gen_random_bytes(1), 0) < 128 then v_actor
    else p_recipient_id
  end;

  begin
    insert into private.auction_games (
      challenger_id,
      recipient_id,
      mode_id,
      content_version,
      rarity_version,
      grading_version,
      tie_priority_profile_id,
      challenger_bankroll,
      recipient_bankroll
    ) values (
      v_actor,
      p_recipient_id,
      p_mode_id,
      v_content_version,
      v_rarity_version,
      v_grading_version,
      v_tie_priority,
      v_bankroll,
      v_bankroll
    )
    returning id into v_id;
  exception when unique_violation then
    select auction.id
      into v_id
    from private.auction_games auction
    where auction.challenger_id = v_actor
      and auction.recipient_id = p_recipient_id
      and auction.mode_id = p_mode_id
      and auction.lifecycle_state = 'prepared';
    return v_id;
  end;

  perform private.generate_auction_deck(
    v_id,
    v_content_version,
    p_mode_id,
    v_rounds,
    null
  );

  return v_id;
end;
$$;

create or replace function public.abandon_prepared_auction(
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
  v_revision bigint;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.revision
    into v_revision
  from private.auction_games auction
  where auction.id = p_auction_id
    and auction.challenger_id = v_actor
  for update;

  if v_revision is null then
    raise exception 'prepared Auction not found';
  end if;

  if exists (
    select 1
    from private.auction_games auction
    where auction.id = p_auction_id
      and auction.lifecycle_state = 'abandoned'
  ) then
    return v_revision;
  end if;

  if v_revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  update private.auction_games
  set lifecycle_state = 'abandoned',
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
    and lifecycle_state = 'prepared'
  returning revision into v_revision;

  if not found then
    raise exception 'Auction is not prepared';
  end if;

  return v_revision;
end;
$$;

create or replace function private.validate_auction_bid(
  p_game private.auction_games,
  p_actor uuid,
  p_amount numeric,
  p_category text
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_bankroll integer;
  v_count integer;
  v_required integer;
  v_maximum integer;
begin
  if p_amount is null
    or p_amount <> trunc(p_amount)
    or p_amount < 1
  then
    raise exception 'bid must be a whole dollar amount of at least $1';
  end if;

  v_required := case when p_game.mode_id = 'ultimate-fighter' then 5 else 4 end;

  if p_actor = p_game.challenger_id then
    v_bankroll := p_game.challenger_bankroll;
    v_count := p_game.challenger_selection_count;
  elsif p_actor = p_game.recipient_id then
    v_bankroll := p_game.recipient_bankroll;
    v_count := p_game.recipient_selection_count;
  else
    raise exception 'not an Auction participant';
  end if;

  if v_count >= v_required then
    raise exception 'collection is already full';
  end if;

  v_maximum := v_bankroll - (v_required - (v_count + 1));
  if p_amount > v_maximum then
    raise exception 'bid exceeds reserve maximum of $%', v_maximum;
  end if;

  if p_game.mode_id = 'ultimate-fighter' then
    if p_category not in ('Striking', 'Grappling', 'Frame', 'Power', 'Heart') then
      raise exception 'an available Ultimate Fighter category is required';
    end if;
    if exists (
      select 1
      from private.auction_awards award
      where award.auction_id = p_game.id
        and award.awarded_to = p_actor
        and award.visible_category = p_category
    ) then
      raise exception 'Ultimate Fighter category is already filled';
    end if;
  elsif p_category is not null then
    raise exception 'category intent is only valid for Ultimate Fighter';
  end if;
end;
$$;

create or replace function private.complete_auction_placeholder(p_auction_id uuid)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_challenge_id uuid;
begin
  -- PR 3 owns only a neutral server-private completion boundary. PR 5 replaces
  -- these equal placeholder scores through the pinned private grading owner.
  update private.auction_games
  set lifecycle_state = 'completed',
      challenger_final_score = 0,
      recipient_final_score = 0,
      winner_profile_id = null,
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
    and lifecycle_state = 'active'
  returning challenge_id into v_challenge_id;

  if not found then
    raise exception 'Auction completion boundary is invalid';
  end if;

  update public.play_challenges
  set completed_at = coalesce(completed_at, now()),
      responder_result = coalesce(responder_result, '{}'::jsonb)
  where id = v_challenge_id;
end;
$$;

create or replace function private.resolve_auction_round(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_challenger_bid private.auction_pending_bids;
  v_recipient_bid private.auction_pending_bids;
  v_deck private.auction_deck_entries;
  v_winner uuid;
  v_winning_amount integer;
  v_category text;
  v_required integer;
  v_rounds integer;
  v_other_id uuid;
  v_position integer;
  v_forced_category text;
begin
  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'Auction not found';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not resolvable';
  end if;

  if exists (
    select 1
    from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_game.current_round
  ) then
    return;
  end if;

  select bid.*
    into v_challenger_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.challenger_id;

  select bid.*
    into v_recipient_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.recipient_id;

  if v_challenger_bid.auction_id is null
    or v_recipient_bid.auction_id is null
  then
    return;
  end if;

  select deck.*
    into v_deck
  from private.auction_deck_entries deck
  where deck.auction_id = p_auction_id
    and deck.deck_position = v_game.current_round;

  if v_deck.id is null then
    raise exception 'Auction current item is unavailable';
  end if;

  if v_challenger_bid.amount > v_recipient_bid.amount then
    v_winner := v_game.challenger_id;
    v_winning_amount := v_challenger_bid.amount;
    v_category := v_challenger_bid.ultimate_fighter_category;
  elsif v_recipient_bid.amount > v_challenger_bid.amount then
    v_winner := v_game.recipient_id;
    v_winning_amount := v_recipient_bid.amount;
    v_category := v_recipient_bid.ultimate_fighter_category;
  else
    v_winner := v_game.tie_priority_profile_id;
    v_winning_amount := v_challenger_bid.amount;
    v_category := case
      when v_winner = v_game.challenger_id
        then v_challenger_bid.ultimate_fighter_category
      else v_recipient_bid.ultimate_fighter_category
    end;
  end if;

  insert into private.auction_awards (
    auction_id,
    deck_entry_id,
    awarded_to,
    resolved_round,
    visible_category
  ) values (
    p_auction_id,
    v_deck.id,
    v_winner,
    v_game.current_round,
    v_category
  );

  update private.auction_games
  set lifecycle_state = 'active',
      challenger_bankroll = challenger_bankroll - case
        when v_winner = challenger_id then v_winning_amount else 0
      end,
      recipient_bankroll = recipient_bankroll - case
        when v_winner = recipient_id then v_winning_amount else 0
      end,
      challenger_selection_count = challenger_selection_count + case
        when v_winner = challenger_id then 1 else 0
      end,
      recipient_selection_count = recipient_selection_count + case
        when v_winner = recipient_id then 1 else 0
      end,
      tie_priority_profile_id = case
        when v_challenger_bid.amount = v_recipient_bid.amount then case
          when tie_priority_profile_id = challenger_id then recipient_id
          else challenger_id
        end
        else tie_priority_profile_id
      end,
      current_round = least(
        current_round + 1,
        case when mode_id = 'ultimate-fighter' then 10 else 8 end
      ),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  v_required := case when v_game.mode_id = 'ultimate-fighter' then 5 else 4 end;
  v_rounds := v_required * 2;

  if v_game.challenger_selection_count = v_required
    or v_game.recipient_selection_count = v_required
  then
    v_other_id := case
      when v_game.challenger_selection_count = v_required
        then v_game.recipient_id
      else v_game.challenger_id
    end;

    for v_position in v_game.current_round..v_rounds loop
      exit when (
        select count(*)
        from private.auction_awards award
        where award.auction_id = p_auction_id
          and award.awarded_to = v_other_id
      ) >= v_required;

      select deck.*
        into v_deck
      from private.auction_deck_entries deck
      where deck.auction_id = p_auction_id
        and deck.deck_position = v_position;

      if v_deck.id is null then
        raise exception 'Auction forced item is unavailable';
      end if;

      if v_game.mode_id = 'ultimate-fighter' then
        select category.name
          into v_forced_category
        from unnest(array[
          'Striking',
          'Grappling',
          'Frame',
          'Power',
          'Heart'
        ]) with ordinality category(name, ordering)
        where not exists (
          select 1
          from private.auction_awards award
          where award.auction_id = p_auction_id
            and award.awarded_to = v_other_id
            and award.visible_category = category.name
        )
        order by category.ordering
        limit 1;
      else
        v_forced_category := null;
      end if;

      insert into private.auction_awards (
        auction_id,
        deck_entry_id,
        awarded_to,
        resolved_round,
        visible_category
      ) values (
        p_auction_id,
        v_deck.id,
        v_other_id,
        v_position,
        v_forced_category
      );

      update private.auction_games
      set challenger_bankroll = challenger_bankroll - case
            when v_other_id = challenger_id then 1 else 0
          end,
          recipient_bankroll = recipient_bankroll - case
            when v_other_id = recipient_id then 1 else 0
          end,
          challenger_selection_count = challenger_selection_count + case
            when v_other_id = challenger_id then 1 else 0
          end,
          recipient_selection_count = recipient_selection_count + case
            when v_other_id = recipient_id then 1 else 0
          end,
          current_round = least(v_position + 1, v_rounds),
          revision = revision + 1,
          updated_at = now()
      where id = p_auction_id
      returning * into v_game;
    end loop;
  end if;

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.challenger_selection_count = v_required
    and v_game.recipient_selection_count = v_required
  then
    perform private.complete_auction_placeholder(p_auction_id);
  end if;
end;
$$;

create or replace function public.send_auction_first_bid(
  p_auction_id uuid,
  p_expected_revision bigint,
  p_amount numeric,
  p_category text default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_game private.auction_games;
  v_code text;
  v_attempt integer := 0;
  v_creator_name text;
  v_created_at timestamptz;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.*
    into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.challenger_id <> v_actor then
    raise exception 'challenger only';
  end if;

  if v_game.lifecycle_state <> 'prepared' then
    raise exception 'Auction already sent';
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

  insert into private.auction_pending_bids (
    auction_id,
    round_number,
    bidder_id,
    amount,
    ultimate_fighter_category
  ) values (
    v_game.id,
    1,
    v_actor,
    p_amount::integer,
    p_category
  );

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code,
        game_id,
        game_version,
        game_title,
        summary,
        creator_id,
        recipient_id,
        play_url,
        setup,
        creator_result
      ) values (
        v_code,
        'auction',
        'auction-server-v3',
        'Auction',
        v_game.mode_id,
        v_game.challenger_id,
        v_game.recipient_id,
        '/play/auction?auction=' || v_game.id::text,
        '{}'::jsonb,
        '{}'::jsonb
      )
      returning created_at into v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then
        raise;
      end if;
    end;
  end loop;

  update private.auction_games
  set challenge_id = (
        select challenge.id
        from public.play_challenges challenge
        where challenge.code = v_code
      ),
      lifecycle_state = 'sent',
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  select profile.display_name
    into v_creator_name
  from public.profiles profile
  where profile.id = v_game.challenger_id;

  perform private.publish_notification_to_profile(
    v_game.recipient_id,
    'auction:received:' || v_game.id::text,
    'auction:' || v_game.id::text,
    'game_challenge_received',
    'Auction challenge received',
    v_creator_name || ' challenged you to Auction.',
    '/play/auction?auction=' || v_game.id::text,
    'VIEW AUCTION',
    v_created_at
  );

  return v_code;
end;
$$;

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

  if v_game.lifecycle_state = 'active' and not v_was_sent then
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

  if v_game.lifecycle_state <> 'active' then
    raise exception 'only an active Auction can be cancelled';
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

  v_opponent := case
    when v_actor = v_game.challenger_id then v_game.recipient_id
    else v_game.challenger_id
  end;

  perform private.publish_notification_to_profile(
    v_opponent,
    'auction:cancelled:' || v_game.id::text,
    'auction:' || v_game.id::text,
    'game_challenge_result_ready',
    'Auction cancelled',
    'Your opponent cancelled this Auction.',
    '/play/auction?auction=' || v_game.id::text,
    'VIEW AUCTION',
    now()
  );

  return v_game.revision;
end;
$$;

create or replace function private.sync_auction_challenge_decline()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_recipient_name text;
begin
  if old.declined_at is null and new.declined_at is not null then
    update private.auction_games
    set lifecycle_state = 'declined',
        revision = revision + 1,
        updated_at = now()
    where challenge_id = new.id
      and lifecycle_state = 'sent'
    returning * into v_auction;

    if found then
      select profile.display_name
        into v_recipient_name
      from public.profiles profile
      where profile.id = v_auction.recipient_id;

      perform private.publish_notification_to_profile(
        v_auction.challenger_id,
        'auction:declined:' || v_auction.id::text,
        'auction:' || v_auction.id::text,
        'game_challenge_result_ready',
        'Auction declined',
        v_recipient_name || ' declined your Auction challenge.',
        '/play/auction?auction=' || v_auction.id::text,
        'VIEW AUCTION',
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists play_challenge_sync_auction_decline
  on public.play_challenges;
create trigger play_challenge_sync_auction_decline
after update of declined_at on public.play_challenges
for each row execute function private.sync_auction_challenge_decline();

-- Preserve the canonical Challenge Center owner while preventing its generic
-- commands from becoming a second Auction creation, acceptance, or completion path.
create or replace function public.create_play_challenge(
  p_recipient_id uuid,
  p_game_id text,
  p_game_version text,
  p_game_title text,
  p_summary text,
  p_play_url text,
  p_setup jsonb,
  p_creator_result jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_code text;
  v_attempt integer := 0;
  v_created_at timestamptz;
  v_route text;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  if trim(p_game_id) = 'auction' then
    raise exception 'Auction challenges must be sent through the Auction engine';
  end if;

  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = p_recipient_id
  ) then
    raise exception 'profile not found';
  end if;

  select profile.display_name
    into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code,
        game_id,
        game_version,
        game_title,
        summary,
        creator_id,
        recipient_id,
        play_url,
        setup,
        creator_result
      ) values (
        v_code,
        trim(p_game_id),
        trim(p_game_version),
        trim(p_game_title),
        trim(p_summary),
        v_creator_id,
        p_recipient_id,
        coalesce(trim(p_play_url), ''),
        p_setup,
        p_creator_result
      )
      returning created_at into v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  v_route := case trim(p_game_id)
    when 'find-leader' then '/play/find-leader?challenge=' || v_code
    when 'wavelength' then '/play/wavelength?match=' || v_code
    when 'blind-resume' then '/play/blind-resume?match=' || v_code
    when 'blind-rank' then '/play/blind-rank?match=' || v_code
    when 'keep-cut' then '/play/keep-cut?match=' || v_code
    when 'better-than' then '/play/better-than?match=' || v_code
    else '/play'
  end;

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'play-challenge:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' challenged you to ' || trim(p_game_title) || '.',
    v_route,
    'VIEW CHALLENGE',
    v_created_at
  );

  return v_code;
end;
$$;

create or replace function public.open_play_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.play_challenges;
  v_recipient_name text;
  v_route text;
begin
  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, now())
  where challenge.code = upper(trim(p_code))
    and challenge.recipient_id = auth.uid()
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  returning challenge.* into v_challenge;

  if not found then
    return false;
  end if;

  if v_challenge.game_id = 'auction' then
    return true;
  end if;

  select profile.display_name
    into v_recipient_name
  from public.profiles profile
  where profile.id = v_challenge.recipient_id;

  v_route := case v_challenge.game_id
    when 'find-leader' then '/play/find-leader?challenge=' || v_challenge.code
    when 'wavelength' then '/play/wavelength?match=' || v_challenge.code
    when 'blind-resume' then '/play/blind-resume?match=' || v_challenge.code
    when 'blind-rank' then '/play/blind-rank?match=' || v_challenge.code
    when 'keep-cut' then '/play/keep-cut?match=' || v_challenge.code
    when 'better-than' then '/play/better-than?match=' || v_challenge.code
    else '/play'
  end;

  perform private.publish_notification_to_profile(
    v_challenge.creator_id,
    'play-challenge:accepted:' || v_challenge.code || ':' || v_challenge.creator_id::text,
    'play-challenges:accepted',
    'game_challenge_accepted',
    'Your challenge was accepted',
    v_recipient_name || ' opened your ' || v_challenge.game_title || ' challenge.',
    v_route,
    'VIEW MATCHUP',
    v_challenge.opened_at
  );

  return true;
end;
$$;

create or replace function public.complete_play_challenge(
  p_code text,
  p_result jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.play_challenges;
  v_recipient_name text;
  v_route text;
begin
  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
  for update;

  if v_challenge.game_id = 'auction' then
    raise exception 'Auction completion is owned by the Auction engine';
  end if;

  update public.play_challenges challenge
  set opened_at = coalesce(challenge.opened_at, now()),
      responder_result = p_result,
      completed_at = now()
  where challenge.code = upper(trim(p_code))
    and challenge.recipient_id = auth.uid()
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  returning challenge.* into v_challenge;

  if not found then
    return false;
  end if;

  select profile.display_name
    into v_recipient_name
  from public.profiles profile
  where profile.id = v_challenge.recipient_id;

  v_route := case v_challenge.game_id
    when 'find-leader' then '/play/find-leader?challenge=' || v_challenge.code
    when 'wavelength' then '/play/wavelength?match=' || v_challenge.code
    when 'blind-resume' then '/play/blind-resume?match=' || v_challenge.code
    when 'blind-rank' then '/play/blind-rank?match=' || v_challenge.code
    when 'keep-cut' then '/play/keep-cut?match=' || v_challenge.code
    when 'better-than' then '/play/better-than?match=' || v_challenge.code
    else '/play'
  end;

  perform private.publish_notification_to_profile(
    v_challenge.creator_id,
    'play-challenge:result-ready:' || v_challenge.code || ':' || v_challenge.creator_id::text,
    'play-challenges:results-ready',
    'game_challenge_result_ready',
    'Challenge result is ready',
    v_recipient_name || ' finished your ' || v_challenge.game_title || ' challenge. See how you matched up.',
    v_route,
    'VIEW RESULT',
    v_challenge.completed_at
  );

  return true;
end;
$$;

create or replace function public.dismiss_play_challenge(p_code text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_challenge public.play_challenges;
  v_auction private.auction_games;
begin
  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and v_actor in (challenge.creator_id, challenge.recipient_id)
  for update;

  if not found then
    return false;
  end if;

  if v_challenge.game_id <> 'auction' then
    update public.play_challenges
    set declined_at = case
          when recipient_id = v_actor and completed_at is null
            then coalesce(declined_at, now())
          else declined_at
        end,
        creator_hidden_at = case
          when creator_id = v_actor then coalesce(creator_hidden_at, now())
          else creator_hidden_at
        end,
        recipient_hidden_at = case
          when recipient_id = v_actor then coalesce(recipient_hidden_at, now())
          else recipient_hidden_at
        end
    where id = v_challenge.id;
    return true;
  end if;

  select auction.*
    into v_auction
  from private.auction_games auction
  where auction.challenge_id = v_challenge.id
  for update;

  if v_auction.id is null then
    raise exception 'Auction challenge linkage is missing';
  end if;

  if v_auction.lifecycle_state = 'active' then
    raise exception 'Use the Auction cancellation command for an active Auction';
  end if;

  if v_auction.lifecycle_state = 'sent'
    and v_actor = v_challenge.recipient_id
  then
    update public.play_challenges
    set declined_at = coalesce(declined_at, now()),
        recipient_hidden_at = coalesce(recipient_hidden_at, now())
    where id = v_challenge.id;
    return true;
  end if;

  update public.play_challenges
  set creator_hidden_at = case
        when creator_id = v_actor then coalesce(creator_hidden_at, now())
        else creator_hidden_at
      end,
      recipient_hidden_at = case
        when recipient_id = v_actor then coalesce(recipient_hidden_at, now())
        else recipient_hidden_at
      end
  where id = v_challenge.id;

  return true;
end;
$$;

drop function public.get_auction_participant_state(uuid);

create function public.get_auction_participant_state(p_auction_id uuid)
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
  awarded_collections jsonb,
  challenge_id uuid,
  current_item jsonb,
  resolved_rounds jsonb
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
        select 1
        from private.auction_pending_bids bid
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
          select 1
          from private.auction_pending_bids bid
          where bid.auction_id = auction.id
            and bid.round_number = auction.current_round
            and bid.bidder_id = auth.uid()
        ) then 'current_user'
        else 'opponent'
      end
      else 'none'
    end,
    challenge.code,
    auction.cancelled_by,
    auction.cancelled_at,
    case
      when auction.lifecycle_state = 'completed'
        then auction.challenger_final_score
    end,
    case
      when auction.lifecycle_state = 'completed'
        then auction.recipient_final_score
    end,
    case
      when auction.lifecycle_state = 'completed'
        then auction.winner_profile_id
    end,
    case
      when auction.lifecycle_state = 'completed'
        then auction.challenger_final_score = auction.recipient_final_score
      else false
    end,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'deck_position', deck.deck_position,
          'item_reference', deck.private_item_reference,
          'display_label', catalog.display_label,
          'awarded_to', award.awarded_to,
          'category', award.visible_category,
          'resolved_round', award.resolved_round
        )
        order by award.resolved_round, deck.deck_position
      )
      from private.auction_awards award
      join private.auction_deck_entries deck
        on deck.id = award.deck_entry_id
        and deck.auction_id = award.auction_id
      join private.auction_catalog catalog
        on catalog.content_version = auction.content_version
        and catalog.mode_id = auction.mode_id
        and catalog.item_reference = deck.private_item_reference
      where award.auction_id = auction.id
    ), '[]'::jsonb),
    auction.challenge_id,
    case
      when auction.lifecycle_state in ('prepared', 'sent', 'active') then (
        select jsonb_build_object(
          'deck_position', deck.deck_position,
          'item_reference', deck.private_item_reference,
          'display_label', catalog.display_label
        )
        from private.auction_deck_entries deck
        join private.auction_catalog catalog
          on catalog.content_version = auction.content_version
          and catalog.mode_id = auction.mode_id
          and catalog.item_reference = deck.private_item_reference
        where deck.auction_id = auction.id
          and deck.deck_position = auction.current_round
      )
    end,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'round', award.resolved_round,
          'challenger_bid', challenger_bid.amount,
          'recipient_bid', recipient_bid.amount,
          'winner', award.awarded_to,
          'forced', challenger_bid.amount is null and recipient_bid.amount is null,
          'charged_amount', case
            when challenger_bid.amount is null and recipient_bid.amount is null then 1
            when award.awarded_to = auction.challenger_id then challenger_bid.amount
            else recipient_bid.amount
          end
        )
        order by award.resolved_round
      )
      from private.auction_awards award
      left join private.auction_pending_bids challenger_bid
        on challenger_bid.auction_id = award.auction_id
        and challenger_bid.round_number = award.resolved_round
        and challenger_bid.bidder_id = auction.challenger_id
      left join private.auction_pending_bids recipient_bid
        on recipient_bid.auction_id = award.auction_id
        and recipient_bid.round_number = award.resolved_round
        and recipient_bid.bidder_id = auction.recipient_id
      where award.auction_id = auction.id
    ), '[]'::jsonb)
  from private.auction_games auction
  join public.profiles challenger on challenger.id = auction.challenger_id
  join public.profiles recipient on recipient.id = auction.recipient_id
  left join public.play_challenges challenge on challenge.id = auction.challenge_id
  where auction.id = p_auction_id
    and (
      (
        auction.lifecycle_state = 'prepared'
        and auth.uid() = auction.challenger_id
      )
      or (
        auction.lifecycle_state in (
          'sent',
          'active',
          'completed',
          'cancelled',
          'declined'
        )
        and auth.uid() in (auction.challenger_id, auction.recipient_id)
      )
    );
$$;

revoke all on function private.prevent_auction_private_mutation()
  from public, anon, authenticated;
revoke all on function private.validate_auction_private_row()
  from public, anon, authenticated;
revoke all on function private.generate_auction_deck(
  uuid, text, text, integer, double precision[]
) from public, anon, authenticated;
revoke all on function private.validate_auction_bid(
  private.auction_games, uuid, numeric, text
) from public, anon, authenticated;
revoke all on function private.resolve_auction_round(uuid)
  from public, anon, authenticated;
revoke all on function private.complete_auction_placeholder(uuid)
  from public, anon, authenticated;
revoke all on function private.sync_auction_challenge_decline()
  from public, anon, authenticated;

revoke all on function public.prepare_auction(uuid, text)
  from public, anon, authenticated;
revoke all on function public.abandon_prepared_auction(uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.send_auction_first_bid(uuid, bigint, numeric, text)
  from public, anon, authenticated;
revoke all on function public.submit_auction_bid(uuid, integer, bigint, numeric, text)
  from public, anon, authenticated;
revoke all on function public.cancel_auction(uuid, bigint)
  from public, anon, authenticated;
revoke all on function public.get_auction_participant_state(uuid)
  from public, anon, authenticated;

grant execute on function public.prepare_auction(uuid, text) to authenticated;
grant execute on function public.abandon_prepared_auction(uuid, bigint) to authenticated;
grant execute on function public.send_auction_first_bid(
  uuid, bigint, numeric, text
) to authenticated;
grant execute on function public.submit_auction_bid(
  uuid, integer, bigint, numeric, text
) to authenticated;
grant execute on function public.cancel_auction(uuid, bigint) to authenticated;
grant execute on function public.get_auction_participant_state(uuid)
  to authenticated;

comment on table private.auction_catalog_versions is
  'Server-private pinned Auction content, rarity, and grading version owner.';
comment on table private.auction_catalog is
  'Server-private versioned Auction fixture catalog; PR 5 replaces fixture content without moving ownership client-side.';
comment on function public.prepare_auction(uuid, text) is
  'Creates or resumes one private version-pinned Auction without exposing randomness or future deck entries.';
comment on function public.submit_auction_bid(uuid, integer, bigint, numeric, text) is
  'Locks one sealed bid and resolves transactionally; the recipient round-one bid is acceptance.';
comment on function public.cancel_auction(uuid, bigint) is
  'Cancels one active Auction for both participants and publishes one opponent notification.';
comment on function public.get_auction_participant_state(uuid) is
  'Lifecycle-aware participant projection with the current item and resolved state only; pending opponent bids, future deck entries, catalog weights, randomness, and grading internals remain private.';
