-- PR 3: Playable server-authoritative Auction engine.
-- This private catalog is a reviewed gameplay fixture, not the final real content library.

create table private.auction_catalog_versions (
  content_version text primary key,
  rarity_version text not null,
  grading_version text not null,
  is_prepared_default boolean not null default false,
  created_at timestamptz not null default now(),
  constraint auction_catalog_versions_names_present check (
    char_length(trim(content_version)) between 1 and 80
    and char_length(trim(rarity_version)) between 1 and 80
    and char_length(trim(grading_version)) between 1 and 80
  )
);

create unique index auction_catalog_versions_one_prepared_default
  on private.auction_catalog_versions (is_prepared_default)
  where is_prepared_default;

create table private.auction_catalog_items (
  content_version text not null references private.auction_catalog_versions(content_version) on delete restrict,
  mode_id text not null,
  item_key text not null,
  public_item jsonb not null,
  rarity_key text not null,
  grading_inputs jsonb not null,
  fixture_order integer not null,
  primary key (content_version, mode_id, item_key),
  unique (content_version, mode_id, fixture_order),
  constraint auction_catalog_items_key_present check (char_length(trim(item_key)) between 1 and 160),
  constraint auction_catalog_items_public_shape check (
    jsonb_typeof(public_item) = 'object'
    and jsonb_typeof(public_item->'id') = 'string'
    and jsonb_typeof(public_item->'label') = 'string'
  ),
  constraint auction_catalog_items_rarity_present check (char_length(trim(rarity_key)) between 1 and 80),
  constraint auction_catalog_items_grading_shape check (jsonb_typeof(grading_inputs) = 'object'),
  constraint auction_catalog_items_fixture_order_positive check (fixture_order >= 1)
);

alter table private.auction_catalog_versions enable row level security;
alter table private.auction_catalog_items enable row level security;
revoke all on private.auction_catalog_versions from public, anon, authenticated;
revoke all on private.auction_catalog_items from public, anon, authenticated;

insert into private.auction_catalog_versions (
  content_version, rarity_version, grading_version, is_prepared_default
) values (
  'auction-fixture-content-v1',
  'auction-fixture-rarity-v1',
  'auction-grading-placeholder-v1',
  true
);

with modes(mode_id) as (
  values
    ('ultimate-fighter'),
    ('jon-jones-performances'),
    ('conor-mcgregor-performances'),
    ('charles-oliveira-performances'),
    ('fighter-performances'),
    ('strikers'),
    ('grapplers'),
    ('knockout-artists'),
    ('greatest-ufc-card'),
    ('championship-performances'),
    ('finishes'),
    ('dominant-performances'),
    ('wars'),
    ('rivalries'),
    ('iconic-moments'),
    ('nicknames')
)
insert into private.auction_catalog_items (
  content_version,
  mode_id,
  item_key,
  public_item,
  rarity_key,
  grading_inputs,
  fixture_order
)
select
  'auction-fixture-content-v1',
  modes.mode_id,
  modes.mode_id || '-fixture-' || lpad(item_number::text, 2, '0'),
  jsonb_build_object(
    'id', modes.mode_id || '-fixture-' || lpad(item_number::text, 2, '0'),
    'label', initcap(replace(modes.mode_id, '-', ' ')) || ' Fixture ' || lpad(item_number::text, 2, '0')
  ),
  case
    when item_number in (1, 2) then 'fixture-elite'
    when item_number <= 5 then 'fixture-featured'
    else 'fixture-standard'
  end,
  jsonb_build_object('placeholder_value', 60 + item_number, 'fixture_only', true),
  item_number
from modes
cross join generate_series(1, 12) item_number;

alter table private.auction_deck_entries
  add column public_item jsonb,
  add column rarity_key text,
  add column grading_inputs jsonb;

update private.auction_deck_entries
set public_item = jsonb_build_object('id', private_item_reference, 'label', private_item_reference),
    rarity_key = 'legacy-private-fixture',
    grading_inputs = jsonb_build_object('legacy', true)
where public_item is null;

alter table private.auction_deck_entries
  alter column public_item set not null,
  alter column rarity_key set not null,
  alter column grading_inputs set not null,
  add constraint auction_deck_entries_public_shape check (
    jsonb_typeof(public_item) = 'object'
    and jsonb_typeof(public_item->'id') = 'string'
    and jsonb_typeof(public_item->'label') = 'string'
  ),
  add constraint auction_deck_entries_rarity_present check (
    char_length(trim(rarity_key)) between 1 and 80
  ),
  add constraint auction_deck_entries_grading_shape check (
    jsonb_typeof(grading_inputs) = 'object'
  );

create unique index auction_deck_entries_unique_item
  on private.auction_deck_entries (auction_id, private_item_reference);

alter table private.auction_awards
  add column winning_bid integer not null default 1,
  add column forced_assignment boolean not null default false,
  add constraint auction_awards_winning_bid_positive check (winning_bid >= 1);

alter table private.auction_games
  add column grading_status text not null default 'pending';

update private.auction_games
set grading_status = 'graded'
where lifecycle_state = 'completed';

alter table private.auction_games
  add constraint auction_games_grading_status_valid check (
    grading_status in ('pending', 'graded')
  );

alter table private.auction_games
  drop constraint auction_games_completed_result;

alter table private.auction_games
  add constraint auction_games_completed_result check (
    (
      lifecycle_state <> 'completed'
      and grading_status = 'pending'
      and challenger_final_score is null
      and recipient_final_score is null
      and winner_profile_id is null
    )
    or (
      lifecycle_state = 'completed'
      and (
        (
          grading_status = 'pending'
          and challenger_final_score = 0
          and recipient_final_score = 0
          and winner_profile_id is null
        )
        or (
          grading_status = 'graded'
          and challenger_final_score is not null
          and recipient_final_score is not null
          and (
            (challenger_final_score = recipient_final_score and winner_profile_id is null)
            or (
              challenger_final_score > recipient_final_score
              and winner_profile_id is not null
              and winner_profile_id = challenger_id
            )
            or (
              recipient_final_score > challenger_final_score
              and winner_profile_id is not null
              and winner_profile_id = recipient_id
            )
          )
        )
      )
    )
  );

create unique index auction_games_one_prepared_matchup_mode
  on private.auction_games (challenger_id, recipient_id, mode_id)
  where lifecycle_state = 'prepared';

create or replace function private.auction_round_count(p_mode_id text)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_mode_id = 'ultimate-fighter' then
    return 10;
  end if;

  if p_mode_id in (
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
    return 8;
  end if;

  raise exception 'unsupported Auction mode';
end;
$$;

create or replace function private.auction_collection_target(p_mode_id text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_mode_id = 'ultimate-fighter' then 5 else 4 end;
$$;

create or replace function private.auction_starting_bankroll(p_mode_id text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when p_mode_id = 'ultimate-fighter' then 50 else 40 end;
$$;

create or replace function private.auction_mode_title(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select initcap(replace(p_mode_id, '-', ' '));
$$;

create or replace function private.auction_validate_category_intent(
  p_mode_id text,
  p_category text
)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_category text := nullif(trim(p_category), '');
begin
  if p_mode_id = 'ultimate-fighter' then
    if v_category is null or v_category not in (
      'Striking', 'Grappling', 'Frame', 'Power', 'Heart'
    ) then
      raise exception 'Ultimate Fighter category intent is required';
    end if;
    return v_category;
  end if;

  if v_category is not null then
    raise exception 'category intent is only valid for Ultimate Fighter';
  end if;

  return null;
end;
$$;

create or replace function private.auction_next_open_category(
  p_auction_id uuid,
  p_profile_id uuid
)
returns text
language sql
stable
set search_path = ''
as $$
  select category
  from unnest(array['Striking', 'Grappling', 'Frame', 'Power', 'Heart']) with ordinality
    categories(category, category_order)
  where not exists (
    select 1
    from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.awarded_to = p_profile_id
      and award.visible_category = categories.category
  )
  order by category_order
  limit 1;
$$;

create or replace function private.auction_maximum_legal_bid(
  p_auction private.auction_games,
  p_bidder_id uuid
)
returns integer
language plpgsql
stable
set search_path = ''
as $$
declare
  v_target integer := private.auction_collection_target(p_auction.mode_id);
  v_bankroll integer;
  v_selection_count integer;
begin
  if p_bidder_id = p_auction.challenger_id then
    v_bankroll := p_auction.challenger_bankroll;
    v_selection_count := p_auction.challenger_selection_count;
  elsif p_bidder_id = p_auction.recipient_id then
    v_bankroll := p_auction.recipient_bankroll;
    v_selection_count := p_auction.recipient_selection_count;
  else
    raise exception 'Auction participant required';
  end if;

  if v_selection_count >= v_target then
    raise exception 'required collection is already full';
  end if;

  return v_bankroll - greatest(v_target - (v_selection_count + 1), 0);
end;
$$;

create or replace function private.auction_validate_bid(
  p_auction private.auction_games,
  p_bidder_id uuid,
  p_amount numeric,
  p_category text
)
returns table(amount integer, category_intent text)
language plpgsql
stable
set search_path = ''
as $$
declare
  v_maximum integer;
  v_category text;
begin
  if p_amount is null or p_amount <> trunc(p_amount) then
    raise exception 'Auction bids must be whole dollars';
  end if;

  if p_amount < 1 then
    raise exception 'Auction minimum bid is $1';
  end if;

  v_maximum := private.auction_maximum_legal_bid(p_auction, p_bidder_id);
  if p_amount > v_maximum then
    raise exception 'Auction bid exceeds reserve maximum of $%', v_maximum;
  end if;

  v_category := private.auction_validate_category_intent(p_auction.mode_id, p_category);

  if v_category is not null and exists (
    select 1
    from private.auction_awards award
    where award.auction_id = p_auction.id
      and award.awarded_to = p_bidder_id
      and award.visible_category = v_category
  ) then
    raise exception 'Ultimate Fighter category is already filled';
  end if;

  return query select p_amount::integer, v_category;
end;
$$;

create or replace function private.enforce_auction_catalog_immutability()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Auction catalog versions and items are append-only';
end;
$$;

create trigger auction_catalog_versions_immutable
before update or delete on private.auction_catalog_versions
for each row execute function private.enforce_auction_catalog_immutability();

create trigger auction_catalog_items_immutable
before update or delete on private.auction_catalog_items
for each row execute function private.enforce_auction_catalog_immutability();

create or replace function private.enforce_auction_deck_immutability()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Auction deck entries are immutable';
end;
$$;

create trigger auction_deck_entries_immutable
before update or delete on private.auction_deck_entries
for each row execute function private.enforce_auction_deck_immutability();

create or replace function private.enforce_auction_bid_lock()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Auction sealed bids are locked';
end;
$$;

create trigger auction_pending_bids_locked
before update or delete on private.auction_pending_bids
for each row execute function private.enforce_auction_bid_lock();

create or replace function private.enforce_auction_award_immutability()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Auction awards are immutable';
end;
$$;

create trigger auction_awards_immutable
before update or delete on private.auction_awards
for each row execute function private.enforce_auction_award_immutability();

create or replace function private.create_or_resume_auction_internal(
  p_challenger_id uuid,
  p_recipient_id uuid,
  p_mode_id text,
  p_test_random_material text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_existing_id uuid;
  v_auction_id uuid;
  v_content_version text;
  v_rarity_version text;
  v_grading_version text;
  v_round_count integer;
  v_bankroll integer;
  v_random_material text;
  v_tie_priority uuid;
  v_inserted_count integer;
begin
  if p_challenger_id is null or p_recipient_id is null then
    raise exception 'Auction participants are required';
  end if;
  if p_challenger_id = p_recipient_id then
    raise exception 'choose another profile';
  end if;
  if not exists (select 1 from public.profiles where id = p_challenger_id)
    or not exists (select 1 from public.profiles where id = p_recipient_id)
  then
    raise exception 'profile not found';
  end if;

  v_round_count := private.auction_round_count(trim(p_mode_id));
  v_bankroll := private.auction_starting_bankroll(trim(p_mode_id));

  perform pg_advisory_xact_lock(
    hashtextextended(
      p_challenger_id::text || ':' || p_recipient_id::text || ':' || trim(p_mode_id),
      0
    )
  );

  select auction.id
    into v_existing_id
  from private.auction_games auction
  where auction.challenger_id = p_challenger_id
    and auction.recipient_id = p_recipient_id
    and auction.mode_id = trim(p_mode_id)
    and auction.lifecycle_state = 'prepared'
  order by auction.created_at desc
  limit 1;

  if v_existing_id is not null then
    return v_existing_id;
  end if;

  select version.content_version, version.rarity_version, version.grading_version
  into v_content_version, v_rarity_version, v_grading_version
  from private.auction_catalog_versions version
  where version.is_prepared_default;

  if v_content_version is null then
    raise exception 'Auction catalog default is not configured';
  end if;

  v_random_material := coalesce(
    nullif(p_test_random_material, ''),
    encode(extensions.gen_random_bytes(32), 'hex')
  );
  v_tie_priority := case
    when mod(abs(hashtextextended(v_random_material || ':tie', 0)), 2) = 0
      then p_challenger_id
    else p_recipient_id
  end;

  insert into private.auction_games (
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
  ) values (
    p_challenger_id,
    p_recipient_id,
    trim(p_mode_id),
    'prepared',
    v_content_version,
    v_rarity_version,
    v_grading_version,
    v_tie_priority,
    v_bankroll,
    v_bankroll
  ) returning id into v_auction_id;

  insert into private.auction_deck_entries (
    auction_id,
    deck_position,
    private_item_reference,
    public_item,
    rarity_key,
    grading_inputs
  )
  select
    v_auction_id,
    row_number() over (order by md5(item.item_key || ':' || v_random_material), item.item_key)::integer,
    item.item_key,
    item.public_item,
    item.rarity_key,
    item.grading_inputs
  from (
    select catalog.*
    from private.auction_catalog_items catalog
    where catalog.content_version = v_content_version
      and catalog.mode_id = trim(p_mode_id)
    order by md5(catalog.item_key || ':' || v_random_material), catalog.item_key
    limit v_round_count
  ) item;

  get diagnostics v_inserted_count = row_count;
  if v_inserted_count <> v_round_count then
    raise exception 'Auction catalog does not contain enough unique items';
  end if;

  return v_auction_id;
end;
$$;

create or replace function public.create_or_resume_auction(
  p_recipient_id uuid,
  p_mode_id text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenger_id uuid := auth.uid();
begin
  if v_challenger_id is null then
    raise exception 'sign in required';
  end if;

  return private.create_or_resume_auction_internal(
    v_challenger_id,
    p_recipient_id,
    p_mode_id,
    null
  );
end;
$$;

create or replace function public.abandon_auction(
  p_auction_id uuid,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;

  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if not found then raise exception 'Auction not found'; end if;
  if auth.uid() <> v_auction.challenger_id then
    raise exception 'only the challenger can abandon a prepared Auction';
  end if;
  if v_auction.lifecycle_state <> 'prepared' then
    raise exception 'only a prepared Auction can be abandoned';
  end if;
  if v_auction.revision <> p_expected_revision then
    raise exception 'stale Auction revision';
  end if;

  update private.auction_games
  set lifecycle_state = 'abandoned', revision = revision + 1, updated_at = now()
  where id = p_auction_id;

  return true;
end;
$$;

create or replace function private.create_auction_challenge(
  p_auction private.auction_games
)
returns public.play_challenges
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.play_challenges;
  v_code text;
  v_attempt integer := 0;
  v_route text := '/play/auction?auction=' || p_auction.id::text;
begin
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
        'auction-server-v1',
        'Auction',
        private.auction_mode_title(p_auction.mode_id) || ' Auction challenge',
        p_auction.challenger_id,
        p_auction.recipient_id,
        v_route,
        jsonb_build_object('auction_id', p_auction.id, 'mode_id', p_auction.mode_id),
        jsonb_build_object('status', 'bid_locked')
      ) returning * into v_challenge;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  perform private.publish_notification_to_profile(
    p_auction.recipient_id,
    'auction:' || p_auction.id::text || ':challenge-received',
    'auction:' || p_auction.id::text,
    'game_challenge_received',
    'Auction challenge received',
    private.auction_mode_title(p_auction.mode_id) || ' is waiting for your sealed bid.',
    v_route,
    'Place bid',
    now()
  );

  return v_challenge;
end;
$$;

create or replace function public.submit_auction_challenger_bid_and_send(
  p_auction_id uuid,
  p_amount numeric,
  p_category_intent text,
  p_expected_revision bigint
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_validated record;
  v_challenge public.play_challenges;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;

  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if not found then raise exception 'Auction not found'; end if;
  if auth.uid() <> v_auction.challenger_id then
    raise exception 'only the challenger can send this Auction';
  end if;
  if v_auction.lifecycle_state <> 'prepared' then
    raise exception 'Auction has already been sent or closed';
  end if;
  if v_auction.challenge_id is not null then
    raise exception 'Auction is already linked to a challenge';
  end if;
  if v_auction.revision <> p_expected_revision then
    raise exception 'stale Auction revision';
  end if;
  if exists (
    select 1 from private.auction_pending_bids bid
    where bid.auction_id = p_auction_id
      and bid.round_number = v_auction.current_round
      and bid.bidder_id = auth.uid()
  ) then
    raise exception 'Auction bid is already locked';
  end if;

  select * into v_validated
  from private.auction_validate_bid(v_auction, auth.uid(), p_amount, p_category_intent);

  insert into private.auction_pending_bids (
    auction_id,
    round_number,
    bidder_id,
    amount,
    ultimate_fighter_category
  ) values (
    p_auction_id,
    v_auction.current_round,
    auth.uid(),
    v_validated.amount,
    v_validated.category_intent
  );

  v_challenge := private.create_auction_challenge(v_auction);

  update private.auction_games
  set challenge_id = v_challenge.id,
      lifecycle_state = 'sent',
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id;

  return v_challenge.code;
end;
$$;

create or replace function private.publish_auction_action_required(
  p_auction private.auction_games,
  p_recipient_id uuid,
  p_source_suffix text,
  p_summary text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.publish_notification_to_profile(
    p_recipient_id,
    'auction:' || p_auction.id::text || ':' || p_source_suffix,
    'auction:' || p_auction.id::text,
    'game_opponent_finished',
    'Auction bid needed',
    p_summary,
    '/play/auction?auction=' || p_auction.id::text,
    'Place bid',
    now()
  );
end;
$$;

create or replace function private.complete_auction_gameplay(
  p_auction private.auction_games
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update private.auction_games
  set lifecycle_state = 'completed',
      grading_status = 'pending',
      challenger_final_score = 0,
      recipient_final_score = 0,
      winner_profile_id = null,
      updated_at = now()
  where id = p_auction.id;

  update public.play_challenges
  set opened_at = coalesce(opened_at, now()),
      responder_result = jsonb_build_object('status', 'gameplay_completed', 'grading', 'pending'),
      completed_at = coalesce(completed_at, now())
  where id = p_auction.challenge_id;

  perform private.publish_notification_to_profile(
    p_auction.challenger_id,
    'auction:' || p_auction.id::text || ':gameplay-completed:' || p_auction.current_round::text,
    'auction:' || p_auction.id::text,
    'game_opponent_finished',
    'Auction gameplay complete',
    'Both collections are complete. Private grading remains pending.',
    '/play/auction?auction=' || p_auction.id::text,
    'View Auction',
    now()
  );

  perform private.publish_notification_to_profile(
    p_auction.recipient_id,
    'auction:' || p_auction.id::text || ':gameplay-completed:' || p_auction.current_round::text,
    'auction:' || p_auction.id::text,
    'game_opponent_finished',
    'Auction gameplay complete',
    'Both collections are complete. Private grading remains pending.',
    '/play/auction?auction=' || p_auction.id::text,
    'View Auction',
    now()
  );
end;
$$;

create or replace function private.resolve_auction_round(p_auction_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_challenger_bid private.auction_pending_bids;
  v_recipient_bid private.auction_pending_bids;
  v_deck private.auction_deck_entries;
  v_winner_id uuid;
  v_winning_bid integer;
  v_visible_category text;
  v_tied boolean;
  v_next_tie_priority uuid;
  v_challenger_bankroll integer;
  v_recipient_bankroll integer;
  v_challenger_count integer;
  v_recipient_count integer;
  v_target integer;
  v_round_count integer;
  v_next_round integer;
  v_forced_recipient uuid;
  v_forced_category text;
  v_forced_position integer;
begin
  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if not found then raise exception 'Auction not found'; end if;
  if v_auction.lifecycle_state not in ('sent', 'active') then return false; end if;

  select bid.* into v_challenger_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_auction.current_round
    and bid.bidder_id = v_auction.challenger_id;

  select bid.* into v_recipient_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_auction.current_round
    and bid.bidder_id = v_auction.recipient_id;

  if v_challenger_bid.bidder_id is null or v_recipient_bid.bidder_id is null then
    return false;
  end if;

  if exists (
    select 1 from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_auction.current_round
  ) then
    return false;
  end if;

  select deck.* into v_deck
  from private.auction_deck_entries deck
  where deck.auction_id = p_auction_id
    and deck.deck_position = v_auction.current_round;

  if v_deck.id is null then raise exception 'Auction current deck entry is missing'; end if;

  v_tied := v_challenger_bid.amount = v_recipient_bid.amount;
  if v_challenger_bid.amount > v_recipient_bid.amount then
    v_winner_id := v_auction.challenger_id;
    v_winning_bid := v_challenger_bid.amount;
    v_visible_category := v_challenger_bid.ultimate_fighter_category;
  elsif v_recipient_bid.amount > v_challenger_bid.amount then
    v_winner_id := v_auction.recipient_id;
    v_winning_bid := v_recipient_bid.amount;
    v_visible_category := v_recipient_bid.ultimate_fighter_category;
  elsif v_auction.tie_priority_profile_id = v_auction.challenger_id then
    v_winner_id := v_auction.challenger_id;
    v_winning_bid := v_challenger_bid.amount;
    v_visible_category := v_challenger_bid.ultimate_fighter_category;
  else
    v_winner_id := v_auction.recipient_id;
    v_winning_bid := v_recipient_bid.amount;
    v_visible_category := v_recipient_bid.ultimate_fighter_category;
  end if;

  v_next_tie_priority := case
    when not v_tied then v_auction.tie_priority_profile_id
    when v_auction.tie_priority_profile_id = v_auction.challenger_id then v_auction.recipient_id
    else v_auction.challenger_id
  end;

  v_challenger_bankroll := v_auction.challenger_bankroll;
  v_recipient_bankroll := v_auction.recipient_bankroll;
  v_challenger_count := v_auction.challenger_selection_count;
  v_recipient_count := v_auction.recipient_selection_count;

  if v_winner_id = v_auction.challenger_id then
    v_challenger_bankroll := v_challenger_bankroll - v_winning_bid;
    v_challenger_count := v_challenger_count + 1;
  else
    v_recipient_bankroll := v_recipient_bankroll - v_winning_bid;
    v_recipient_count := v_recipient_count + 1;
  end if;

  insert into private.auction_awards (
    auction_id,
    deck_entry_id,
    awarded_to,
    resolved_round,
    visible_category,
    winning_bid,
    forced_assignment
  ) values (
    p_auction_id,
    v_deck.id,
    v_winner_id,
    v_auction.current_round,
    v_visible_category,
    v_winning_bid,
    false
  );

  v_target := private.auction_collection_target(v_auction.mode_id);
  v_round_count := private.auction_round_count(v_auction.mode_id);
  v_next_round := least(v_auction.current_round + 1, v_round_count);

  update private.auction_games
  set lifecycle_state = 'active',
      current_round = v_next_round,
      revision = revision + 1,
      tie_priority_profile_id = v_next_tie_priority,
      challenger_bankroll = v_challenger_bankroll,
      recipient_bankroll = v_recipient_bankroll,
      challenger_selection_count = v_challenger_count,
      recipient_selection_count = v_recipient_count,
      updated_at = now()
  where id = p_auction_id
  returning * into v_auction;

  if v_challenger_count = v_target and v_recipient_count < v_target then
    v_forced_recipient := v_auction.recipient_id;
  elsif v_recipient_count = v_target and v_challenger_count < v_target then
    v_forced_recipient := v_auction.challenger_id;
  else
    v_forced_recipient := null;
  end if;

  if v_forced_recipient is not null then
    for v_forced_position in v_auction.current_round..v_round_count loop
      exit when v_challenger_count = v_target and v_recipient_count = v_target;

      select deck.* into v_deck
      from private.auction_deck_entries deck
      where deck.auction_id = p_auction_id
        and deck.deck_position = v_forced_position;

      if v_deck.id is null then raise exception 'Auction forced deck entry is missing'; end if;

      v_forced_category := case
        when v_auction.mode_id = 'ultimate-fighter'
          then private.auction_next_open_category(p_auction_id, v_forced_recipient)
        else null
      end;

      insert into private.auction_awards (
        auction_id,
        deck_entry_id,
        awarded_to,
        resolved_round,
        visible_category,
        winning_bid,
        forced_assignment
      ) values (
        p_auction_id,
        v_deck.id,
        v_forced_recipient,
        v_forced_position,
        v_forced_category,
        1,
        true
      );

      if v_forced_recipient = v_auction.challenger_id then
        if v_challenger_bankroll < 1 then raise exception 'Auction reserve invariant failed for challenger'; end if;
        v_challenger_bankroll := v_challenger_bankroll - 1;
        v_challenger_count := v_challenger_count + 1;
      else
        if v_recipient_bankroll < 1 then raise exception 'Auction reserve invariant failed for recipient'; end if;
        v_recipient_bankroll := v_recipient_bankroll - 1;
        v_recipient_count := v_recipient_count + 1;
      end if;

      update private.auction_games
      set current_round = v_forced_position,
          revision = revision + 1,
          challenger_bankroll = v_challenger_bankroll,
          recipient_bankroll = v_recipient_bankroll,
          challenger_selection_count = v_challenger_count,
          recipient_selection_count = v_recipient_count,
          updated_at = now()
      where id = p_auction_id
      returning * into v_auction;
    end loop;
  end if;

  if v_challenger_count = v_target and v_recipient_count = v_target then
    perform private.complete_auction_gameplay(v_auction);
  else
    select auction.* into v_auction
    from private.auction_games auction
    where auction.id = p_auction_id;

    perform private.publish_auction_action_required(
      v_auction,
      v_auction.challenger_id,
      'round-' || v_auction.current_round::text || ':challenger-action',
      'The next item is ready for your sealed bid.'
    );
    perform private.publish_auction_action_required(
      v_auction,
      v_auction.recipient_id,
      'round-' || v_auction.current_round::text || ':recipient-action',
      'The next item is ready for your sealed bid.'
    );
  end if;

  return true;
end;
$$;

create or replace function public.submit_auction_bid(
  p_auction_id uuid,
  p_round integer,
  p_amount numeric,
  p_category_intent text,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_validated record;
  v_other_profile_id uuid;
  v_resolved boolean;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;

  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if not found then raise exception 'Auction not found'; end if;
  if auth.uid() not in (v_auction.challenger_id, v_auction.recipient_id) then
    raise exception 'Auction participant required';
  end if;
  if v_auction.lifecycle_state not in ('sent', 'active') then
    raise exception 'Auction is not accepting bids';
  end if;
  if v_auction.lifecycle_state = 'sent' and auth.uid() <> v_auction.recipient_id then
    raise exception 'only the recipient can accept through the first bid';
  end if;
  if p_round <> v_auction.current_round then raise exception 'stale Auction round'; end if;
  if p_expected_revision <> v_auction.revision then raise exception 'stale Auction revision'; end if;
  if exists (
    select 1 from private.auction_pending_bids bid
    where bid.auction_id = p_auction_id
      and bid.round_number = p_round
      and bid.bidder_id = auth.uid()
  ) then
    raise exception 'Auction bid is already locked';
  end if;

  select * into v_validated
  from private.auction_validate_bid(v_auction, auth.uid(), p_amount, p_category_intent);

  insert into private.auction_pending_bids (
    auction_id,
    round_number,
    bidder_id,
    amount,
    ultimate_fighter_category
  ) values (
    p_auction_id,
    p_round,
    auth.uid(),
    v_validated.amount,
    v_validated.category_intent
  );

  if v_auction.lifecycle_state = 'sent' then
    update public.play_challenges
    set opened_at = coalesce(opened_at, now())
    where id = v_auction.challenge_id
      and recipient_id = auth.uid()
      and completed_at is null
      and declined_at is null;

    perform private.publish_notification_to_profile(
      v_auction.challenger_id,
      'auction:' || v_auction.id::text || ':challenge-accepted',
      'auction:' || v_auction.id::text,
      'game_challenge_accepted',
      'Auction challenge accepted',
      'Your opponent locked the first sealed bid.',
      '/play/auction?auction=' || v_auction.id::text,
      'View Auction',
      now()
    );
  end if;

  v_resolved := private.resolve_auction_round(p_auction_id);
  if v_resolved then return true; end if;

  v_other_profile_id := case
    when auth.uid() = v_auction.challenger_id then v_auction.recipient_id
    else v_auction.challenger_id
  end;

  perform private.publish_auction_action_required(
    v_auction,
    v_other_profile_id,
    'round-' || p_round::text || ':opponent-bid-locked',
    'Your opponent locked a sealed bid. Your bid is required.'
  );

  return true;
end;
$$;

create or replace function public.cancel_auction(
  p_auction_id uuid,
  p_expected_revision bigint
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
  v_other_profile_id uuid;
begin
  if auth.uid() is null then raise exception 'sign in required'; end if;

  select auction.* into v_auction
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if not found then raise exception 'Auction not found'; end if;
  if auth.uid() not in (v_auction.challenger_id, v_auction.recipient_id) then
    raise exception 'Auction participant required';
  end if;
  if v_auction.lifecycle_state <> 'active' then
    raise exception 'only an active Auction can be cancelled';
  end if;
  if v_auction.revision <> p_expected_revision then raise exception 'stale Auction revision'; end if;

  update private.auction_games
  set lifecycle_state = 'cancelled',
      cancelled_by = auth.uid(),
      cancelled_at = now(),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id;

  v_other_profile_id := case
    when auth.uid() = v_auction.challenger_id then v_auction.recipient_id
    else v_auction.challenger_id
  end;

  perform private.publish_notification_to_profile(
    v_other_profile_id,
    'auction:' || v_auction.id::text || ':cancelled',
    'auction:' || v_auction.id::text,
    'game_opponent_finished',
    'Auction cancelled',
    'Your opponent cancelled the active Auction.',
    '/play/auction?auction=' || v_auction.id::text,
    'View Auction',
    now()
  );

  return true;
end;
$$;

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
  if v_creator_id is null then raise exception 'sign in required'; end if;
  if trim(p_game_id) = 'auction' then
    raise exception 'Auction challenges must be created by the Auction server engine';
  end if;
  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;
  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  select profile.display_name into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code, game_id, game_version, game_title, summary,
        creator_id, recipient_id, play_url, setup, creator_result
      ) values (
        v_code, trim(p_game_id), trim(p_game_version), trim(p_game_title), trim(p_summary),
        v_creator_id, p_recipient_id, coalesce(trim(p_play_url), ''), p_setup, p_creator_result
      ) returning created_at into v_created_at;
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
    and challenge.game_id <> 'auction'
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  returning challenge.* into v_challenge;

  if not found then return false; end if;

  select profile.display_name into v_recipient_name
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

create or replace function public.complete_play_challenge(p_code text, p_result jsonb)
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
  set opened_at = coalesce(challenge.opened_at, now()),
      responder_result = p_result,
      completed_at = now()
  where challenge.code = upper(trim(p_code))
    and challenge.recipient_id = auth.uid()
    and challenge.game_id <> 'auction'
    and challenge.completed_at is null
    and challenge.declined_at is null
    and challenge.recipient_hidden_at is null
  returning challenge.* into v_challenge;

  if not found then return false; end if;

  select profile.display_name into v_recipient_name
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

create or replace function private.sync_declined_auction_challenge()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_auction private.auction_games;
begin
  if old.declined_at is null and new.declined_at is not null and new.game_id = 'auction' then
    select auction.* into v_auction
    from private.auction_games auction
    where auction.challenge_id = new.id
    for update;

    if found and v_auction.lifecycle_state = 'sent' then
      update private.auction_games
      set lifecycle_state = 'declined', revision = revision + 1, updated_at = now()
      where id = v_auction.id;

      perform private.publish_notification_to_profile(
        v_auction.challenger_id,
        'auction:' || v_auction.id::text || ':declined',
        'auction:' || v_auction.id::text,
        'game_opponent_finished',
        'Auction declined',
        'Your opponent declined the Auction challenge.',
        '/play/auction?auction=' || v_auction.id::text,
        'View Auction',
        now()
      );
    end if;
  end if;

  return new;
end;
$$;

create trigger play_challenges_sync_auction_decline
after update of declined_at on public.play_challenges
for each row execute function private.sync_declined_auction_challenge();

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
  round_count integer,
  collection_target integer,
  revision bigint,
  tie_priority_profile_id uuid,
  challenger_bankroll integer,
  recipient_bankroll integer,
  challenger_selection_count integer,
  recipient_selection_count integer,
  current_user_submitted_bid boolean,
  action_required_by text,
  challenge_code text,
  current_item jsonb,
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
    private.auction_round_count(auction.mode_id),
    private.auction_collection_target(auction.mode_id),
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
    case
      when auction.lifecycle_state in ('prepared', 'sent', 'active') then (
        select deck.public_item
        from private.auction_deck_entries deck
        where deck.auction_id = auction.id
          and deck.deck_position = auction.current_round
      )
      else null
    end,
    auction.cancelled_by,
    auction.cancelled_at,
    case
      when auction.lifecycle_state = 'completed' and auction.grading_status = 'graded'
        then auction.challenger_final_score
    end,
    case
      when auction.lifecycle_state = 'completed' and auction.grading_status = 'graded'
        then auction.recipient_final_score
    end,
    case
      when auction.lifecycle_state = 'completed' and auction.grading_status = 'graded'
        then auction.winner_profile_id
    end,
    case
      when auction.lifecycle_state = 'completed' and auction.grading_status = 'graded'
        then auction.challenger_final_score = auction.recipient_final_score
      else false
    end,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'deck_position', deck.deck_position,
        'item', deck.public_item,
        'awarded_to', award.awarded_to,
        'category', award.visible_category,
        'resolved_round', award.resolved_round,
        'forced_assignment', award.forced_assignment
      ) order by award.resolved_round, deck.deck_position)
      from private.auction_awards award
      join private.auction_deck_entries deck
        on deck.id = award.deck_entry_id
       and deck.auction_id = award.auction_id
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
  'Safe playable Auction projection: only the current public item and awarded public collection are visible; bids, categories before award, future deck entries, rarity, grading inputs, versions, and placeholder scores remain private.';

revoke all on function private.auction_round_count(text) from public, anon, authenticated;
revoke all on function private.auction_collection_target(text) from public, anon, authenticated;
revoke all on function private.auction_starting_bankroll(text) from public, anon, authenticated;
revoke all on function private.auction_mode_title(text) from public, anon, authenticated;
revoke all on function private.auction_validate_category_intent(text, text) from public, anon, authenticated;
revoke all on function private.auction_next_open_category(uuid, uuid) from public, anon, authenticated;
revoke all on function private.auction_maximum_legal_bid(private.auction_games, uuid) from public, anon, authenticated;
revoke all on function private.auction_validate_bid(private.auction_games, uuid, numeric, text) from public, anon, authenticated;
revoke all on function private.create_or_resume_auction_internal(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function private.create_auction_challenge(private.auction_games) from public, anon, authenticated;
revoke all on function private.publish_auction_action_required(private.auction_games, uuid, text, text) from public, anon, authenticated;
revoke all on function private.complete_auction_gameplay(private.auction_games) from public, anon, authenticated;
revoke all on function private.resolve_auction_round(uuid) from public, anon, authenticated;

revoke all on function public.create_or_resume_auction(uuid, text) from public, anon;
revoke all on function public.abandon_auction(uuid, bigint) from public, anon;
revoke all on function public.submit_auction_challenger_bid_and_send(uuid, numeric, text, bigint) from public, anon;
revoke all on function public.submit_auction_bid(uuid, integer, numeric, text, bigint) from public, anon;
revoke all on function public.cancel_auction(uuid, bigint) from public, anon;

grant execute on function public.create_or_resume_auction(uuid, text) to authenticated;
grant execute on function public.abandon_auction(uuid, bigint) to authenticated;
grant execute on function public.submit_auction_challenger_bid_and_send(uuid, numeric, text, bigint) to authenticated;
grant execute on function public.submit_auction_bid(uuid, integer, numeric, text, bigint) to authenticated;
grant execute on function public.cancel_auction(uuid, bigint) to authenticated;
grant execute on function public.get_auction_participant_state(uuid) to authenticated;