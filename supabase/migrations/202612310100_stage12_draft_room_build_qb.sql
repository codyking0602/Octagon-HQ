-- Stage 12: extend the canonical sealed-bid Auction backend for Football Draft Room.
-- Build a QB remains an owner-only admin preview until a later release migration flips
-- private.draft_room_public_release_enabled() and the frontend owner gate is removed.

alter table private.auction_catalog_versions
  add column game_id text not null default 'auction';

alter table private.auction_catalog_versions
  add constraint auction_catalog_versions_game_id_check
  check (game_id in ('auction', 'draft-room'));

drop index private.auction_one_preparation_version;

create unique index auction_one_preparation_version
  on private.auction_catalog_versions (game_id)
  where is_preparation_version;

create or replace function private.protect_auction_catalog_version()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Auction catalog versions cannot be deleted';
  end if;

  if new.content_version is distinct from old.content_version
    or new.rarity_version is distinct from old.rarity_version
    or new.grading_version is distinct from old.grading_version
    or new.game_id is distinct from old.game_id
    or new.created_at is distinct from old.created_at
  then
    raise exception 'Auction catalog version identities are immutable';
  end if;

  return new;
end;
$$;

create or replace function private.draft_room_public_release_enabled()
returns boolean
language sql
immutable
set search_path = ''
as $$
  select false;
$$;

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case when p_mode_id = 'build-qb' then 'draft-room' else 'auction' end;
$$;

create or replace function private.auction_required_selections(p_mode_id text, p_content_version text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in ('ultimate-fighter', 'build-qb') then 5
    when p_content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 3
    else 4
  end;
$$;

create or replace function private.auction_round_count(p_mode_id text, p_content_version text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select private.auction_required_selections(p_mode_id, p_content_version) * 2;
$$;

create or replace function private.auction_starting_bankroll(p_mode_id text, p_content_version text)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in ('ultimate-fighter', 'build-qb') then 50
    when p_content_version in (
      'ufc-auction-2026-08-v3',
      'ufc-auction-2026-08-v4',
      'ufc-auction-2026-08-v5',
      'ufc-auction-2026-08-v6',
      'ufc-auction-2026-08-v7',
      'ufc-auction-2026-08-v8'
    ) then 30
    else 40
  end;
$$;

create or replace function private.auction_category_options(p_mode_id text)
returns text[]
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id = 'ultimate-fighter'
      then array['Striking','Grappling','Frame','Power','Heart']::text[]
    when p_mode_id = 'build-qb'
      then array['Arm','Accuracy','Processing','Mobility','Clutch']::text[]
    else '{}'::text[]
  end;
$$;

revoke all on function private.draft_room_public_release_enabled() from public, anon, authenticated;
revoke all on function private.auction_game_id_for_mode(text) from public, anon, authenticated;
revoke all on function private.auction_required_selections(text,text) from public, anon, authenticated;
revoke all on function private.auction_round_count(text,text) from public, anon, authenticated;
revoke all on function private.auction_starting_bankroll(text,text) from public, anon, authenticated;
revoke all on function private.auction_category_options(text) from public, anon, authenticated;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version,
  game_id
) values (
  'football-draft-room-2026-09-v1',
  'football-draft-room-rarity-2026-09-v1',
  'football-build-qb-traits-2026-09-v1',
  true,
  'draft-room'
);

insert into private.auction_catalog (
  content_version,
  mode_id,
  item_reference,
  display_label,
  rarity_band,
  display_description,
  generation_weight,
  private_generation_class,
  grading_inputs
) values
  ('football-draft-room-2026-09-v1','build-qb','nfl-patrick-mahomes','Patrick Mahomes',5,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',95,'Accuracy',90,'Processing',92,'Mobility',85,'Clutch',96,'overall',92)),
  ('football-draft-room-2026-09-v1','build-qb','nfl-aaron-rodgers','Aaron Rodgers',4,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',82,'Accuracy',89,'Processing',99,'Mobility',74,'Clutch',98,'overall',88)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0034796','Lamar Jackson',4,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',72,'Accuracy',83,'Processing',92,'Mobility',98,'Clutch',94,'overall',88)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0029263','Russell Wilson',4,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',76,'Accuracy',78,'Processing',90,'Mobility',88,'Clutch',93,'overall',85)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0036442','Joe Burrow',4,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',86,'Accuracy',96,'Processing',91,'Mobility',69,'Clutch',78,'overall',84)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0033077','Dak Prescott',4,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',80,'Accuracy',91,'Processing',85,'Mobility',81,'Clutch',79,'overall',83)),
  ('football-draft-room-2026-09-v1','build-qb','nfl-josh-allen','Josh Allen',3,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',71,'Accuracy',67,'Processing',72,'Mobility',97,'Clutch',84,'overall',78)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0029604','Kirk Cousins',3,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',77,'Accuracy',87,'Processing',74,'Mobility',54,'Clutch',77,'overall',74)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0033106','Jared Goff',3,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',83,'Accuracy',82,'Processing',79,'Mobility',44,'Clutch',77,'overall',73)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0021678','Tony Romo',3,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',92,'Accuracy',83,'Processing',64,'Mobility',45,'Clutch',79,'overall',73)),
  ('football-draft-room-2026-09-v1','build-qb','nfl-matthew-stafford','Matthew Stafford',2,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',81,'Accuracy',61,'Processing',68,'Mobility',53,'Clutch',84,'overall',69)),
  ('football-draft-room-2026-09-v1','build-qb','nfl-philip-rivers','Philip Rivers',2,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',87,'Accuracy',74,'Processing',63,'Mobility',35,'Clutch',82,'overall',68)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0031280','Derek Carr',2,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',60,'Accuracy',73,'Processing',76,'Mobility',50,'Clutch',71,'overall',66)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0029701','Ryan Tannehill',2,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',56,'Accuracy',64,'Processing',59,'Mobility',76,'Clutch',72,'overall',65)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0034855','Baker Mayfield',2,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',61,'Accuracy',60,'Processing',59,'Mobility',65,'Clutch',65,'overall',62)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0036971','Trevor Lawrence',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',48,'Accuracy',51,'Processing',55,'Mobility',86,'Clutch',55,'overall',59)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0023436','Alex Smith',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',42,'Accuracy',48,'Processing',60,'Mobility',70,'Clutch',66,'overall',57)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0027973','Andy Dalton',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',52,'Accuracy',52,'Processing',49,'Mobility',61,'Clutch',65,'overall',56)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0021429','Carson Palmer',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',68,'Accuracy',49,'Processing',46,'Mobility',41,'Clutch',75,'overall',56)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0023682','Ryan Fitzpatrick',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',49,'Accuracy',39,'Processing',40,'Mobility',77,'Clutch',62,'overall',53)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0026158','Joe Flacco',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',47,'Accuracy',42,'Processing',50,'Mobility',47,'Clutch',67,'overall',51)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0024218','Vince Young',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',42,'Accuracy',35,'Processing',35,'Mobility',89,'Clutch',48,'overall',50)),
  ('football-draft-room-2026-09-v1','build-qb','nflverse-player-00-0027688','Colt McCoy',1,'Canonical NFL QB profile from Football position-trait model v1',1.0,'qb',jsonb_build_object('Arm',35,'Accuracy',44,'Processing',41,'Mobility',54,'Clutch',38,'overall',42));

create or replace function public.prepare_auction(p_recipient_id uuid, p_mode_id text)
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
  v_game_id text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null
    or not exists (select 1 from public.profiles profile where profile.id = p_recipient_id)
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
    'finishes',
    'wars',
    'rivalries',
    'iconic-moments',
    'nicknames',
    'build-qb'
  ) then
    raise exception 'invalid sealed-bid mode';
  end if;

  if p_mode_id = 'build-qb'
    and not private.draft_room_public_release_enabled()
    and not public.is_pick_control_owner(v_actor)
  then
    raise exception 'Draft Room admin preview access required';
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

  v_game_id := private.auction_game_id_for_mode(p_mode_id);

  select
    version.content_version,
    version.rarity_version,
    version.grading_version
  into
    v_content_version,
    v_rarity_version,
    v_grading_version
  from private.auction_catalog_versions version
  where version.is_preparation_version
    and version.game_id = v_game_id;

  if v_content_version is null then
    raise exception 'sealed-bid catalog version is unavailable';
  end if;

  v_rounds := private.auction_round_count(p_mode_id, v_content_version);
  v_bankroll := private.auction_starting_bankroll(p_mode_id, v_content_version);
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
  v_categories text[];
begin
  if p_amount is null
    or p_amount <> trunc(p_amount)
    or p_amount < 1
  then
    raise exception 'bid must be a whole dollar amount of at least $1';
  end if;

  v_required := private.auction_required_selections(p_game.mode_id, p_game.content_version);

  if p_actor = p_game.challenger_id then
    v_bankroll := p_game.challenger_bankroll;
    v_count := p_game.challenger_selection_count;
  elsif p_actor = p_game.recipient_id then
    v_bankroll := p_game.recipient_bankroll;
    v_count := p_game.recipient_selection_count;
  else
    raise exception 'not a sealed-bid participant';
  end if;

  if v_count >= v_required then
    raise exception 'collection is already full';
  end if;

  v_maximum := v_bankroll - (v_required - (v_count + 1));
  if p_amount > v_maximum then
    raise exception 'bid exceeds reserve maximum of $%', v_maximum;
  end if;

  v_categories := private.auction_category_options(p_game.mode_id);
  if cardinality(v_categories) > 0 then
    if p_category is null or not (p_category = any(v_categories)) then
      raise exception 'an available category is required';
    end if;
    if exists (
      select 1
      from private.auction_awards award
      where award.auction_id = p_game.id
        and award.awarded_to = p_actor
        and award.visible_category = p_category
    ) then
      raise exception 'category is already filled';
    end if;
  elsif p_category is not null then
    raise exception 'category intent is not valid for this mode';
  end if;
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
  v_categories text[];
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'sealed-bid game not found';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'sealed-bid game is not resolvable';
  end if;

  if exists (
    select 1 from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_game.current_round
  ) then
    return;
  end if;

  select bid.* into v_challenger_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.challenger_id;

  select bid.* into v_recipient_bid
  from private.auction_pending_bids bid
  where bid.auction_id = p_auction_id
    and bid.round_number = v_game.current_round
    and bid.bidder_id = v_game.recipient_id;

  if v_challenger_bid.auction_id is null
    or v_recipient_bid.auction_id is null
  then
    return;
  end if;

  select deck.* into v_deck
  from private.auction_deck_entries deck
  where deck.auction_id = p_auction_id
    and deck.deck_position = v_game.current_round;

  if v_deck.id is null then
    raise exception 'sealed-bid current item is unavailable';
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
      when v_winner = v_game.challenger_id then v_challenger_bid.ultimate_fighter_category
      else v_recipient_bid.ultimate_fighter_category
    end;
  end if;

  insert into private.auction_awards (
    auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
  ) values (
    p_auction_id, v_deck.id, v_winner, v_game.current_round, v_category
  );

  v_required := private.auction_required_selections(v_game.mode_id, v_game.content_version);
  v_rounds := private.auction_round_count(v_game.mode_id, v_game.content_version);

  update private.auction_games
  set lifecycle_state = 'active',
      challenger_bankroll = challenger_bankroll - case when v_winner = challenger_id then v_winning_amount else 0 end,
      recipient_bankroll = recipient_bankroll - case when v_winner = recipient_id then v_winning_amount else 0 end,
      challenger_selection_count = challenger_selection_count + case when v_winner = challenger_id then 1 else 0 end,
      recipient_selection_count = recipient_selection_count + case when v_winner = recipient_id then 1 else 0 end,
      tie_priority_profile_id = case
        when v_challenger_bid.amount = v_recipient_bid.amount then case
          when tie_priority_profile_id = challenger_id then recipient_id
          else challenger_id
        end
        else tie_priority_profile_id
      end,
      current_round = least(current_round + 1, v_rounds),
      revision = revision + 1,
      updated_at = now()
  where id = p_auction_id
  returning * into v_game;

  if v_game.challenger_selection_count = v_required
    or v_game.recipient_selection_count = v_required
  then
    v_other_id := case
      when v_game.challenger_selection_count = v_required then v_game.recipient_id
      else v_game.challenger_id
    end;

    v_categories := private.auction_category_options(v_game.mode_id);

    for v_position in v_game.current_round..v_rounds loop
      exit when (
        select count(*) from private.auction_awards award
        where award.auction_id = p_auction_id
          and award.awarded_to = v_other_id
      ) >= v_required;

      select deck.* into v_deck
      from private.auction_deck_entries deck
      where deck.auction_id = p_auction_id
        and deck.deck_position = v_position;

      if v_deck.id is null then
        raise exception 'sealed-bid forced item is unavailable';
      end if;

      if cardinality(v_categories) > 0 then
        select category.name into v_forced_category
        from unnest(v_categories) with ordinality category(name, ordering)
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
        auction_id, deck_entry_id, awarded_to, resolved_round, visible_category
      ) values (
        p_auction_id, v_deck.id, v_other_id, v_position, v_forced_category
      );

      update private.auction_games
      set challenger_bankroll = challenger_bankroll - case when v_other_id = challenger_id then 1 else 0 end,
          recipient_bankroll = recipient_bankroll - case when v_other_id = recipient_id then 1 else 0 end,
          challenger_selection_count = challenger_selection_count + case when v_other_id = challenger_id then 1 else 0 end,
          recipient_selection_count = recipient_selection_count + case when v_other_id = recipient_id then 1 else 0 end,
          current_round = least(v_position + 1, v_rounds),
          revision = revision + 1,
          updated_at = now()
      where id = p_auction_id
      returning * into v_game;
    end loop;
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  if v_game.challenger_selection_count = v_required
    and v_game.recipient_selection_count = v_required
  then
    perform private.complete_auction_placeholder(p_auction_id);
  end if;
end;
$$;

create or replace function private.grade_auction(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_required integer;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_scored integer;
  v_recipient_scored integer;
  v_challenger_score numeric(5,2);
  v_recipient_score numeric(5,2);
  v_winner uuid;
  v_category_builder boolean;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null then
    raise exception 'sealed-bid game not found';
  end if;

  if v_game.lifecycle_state = 'completed' then
    return;
  end if;

  if v_game.lifecycle_state <> 'active' then
    raise exception 'sealed-bid grading boundary is invalid';
  end if;

  if v_game.grading_version = 'grader-contract-v1' then
    update private.auction_games
    set lifecycle_state = 'completed',
        challenger_final_score = 0,
        recipient_final_score = 0,
        winner_profile_id = null,
        revision = revision + 1,
        updated_at = now()
    where id = v_game.id;

    update public.play_challenges
    set completed_at = coalesce(completed_at, now()),
        creator_result = jsonb_build_object('overall_score', 0),
        responder_result = jsonb_build_object('overall_score', 0)
    where id = v_game.challenge_id;
    return;
  end if;

  if not (
    (v_game.content_version = 'ufc-auction-2026-08-v1'
      and v_game.rarity_version = 'balanced-rarity-2026-08-v1'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v1')
    or (v_game.content_version in (
        'ufc-auction-2026-08-v2',
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6'
      )
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v2')
    or (v_game.content_version in ('ufc-auction-2026-08-v7', 'ufc-auction-2026-08-v8')
      and v_game.rarity_version = 'balanced-rarity-2026-08-v2'
      and v_game.grading_version = 'ufc-private-grader-2026-08-v3')
    or (v_game.content_version = 'football-draft-room-2026-09-v1'
      and v_game.rarity_version = 'football-draft-room-rarity-2026-09-v1'
      and v_game.grading_version = 'football-build-qb-traits-2026-09-v1')
  ) then
    raise exception 'sealed-bid grading version is unsupported';
  end if;

  v_required := private.auction_required_selections(v_game.mode_id, v_game.content_version);
  v_category_builder := cardinality(private.auction_category_options(v_game.mode_id)) > 0;

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version in ('ufc-private-grader-2026-08-v3', 'football-build-qb-traits-2026-09-v1')
        then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into v_challenger_count, v_challenger_scored, v_challenger_score
  from (
    select case
      when v_category_builder then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.challenger_id
  ) scored;

  select
    count(*),
    count(score_value),
    case
      when v_game.grading_version in ('ufc-private-grader-2026-08-v3', 'football-build-qb-traits-2026-09-v1')
        then round(avg(score_value))
      else round(avg(score_value), 2)
    end
  into v_recipient_count, v_recipient_scored, v_recipient_score
  from (
    select case
      when v_category_builder then (catalog.grading_inputs ->> award.visible_category)::numeric
      else (catalog.grading_inputs ->> 'overall')::numeric
    end as score_value
    from private.auction_awards award
    join private.auction_deck_entries deck
      on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
    join private.auction_catalog catalog
      on catalog.content_version = v_game.content_version
      and catalog.mode_id = v_game.mode_id
      and catalog.item_reference = deck.private_item_reference
    where award.auction_id = v_game.id
      and award.awarded_to = v_game.recipient_id
  ) scored;

  if v_challenger_count <> v_required
    or v_recipient_count <> v_required
    or v_challenger_scored <> v_required
    or v_recipient_scored <> v_required
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'sealed-bid grading inputs are incomplete or invalid';
  end if;

  v_winner := case
    when v_challenger_score > v_recipient_score then v_game.challenger_id
    when v_recipient_score > v_challenger_score then v_game.recipient_id
    else null
  end;

  update private.auction_games
  set lifecycle_state = 'completed',
      challenger_final_score = v_challenger_score,
      recipient_final_score = v_recipient_score,
      winner_profile_id = v_winner,
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  update public.play_challenges
  set completed_at = coalesce(completed_at, now()),
      creator_result = jsonb_build_object('overall_score', v_challenger_score),
      responder_result = jsonb_build_object('overall_score', v_recipient_score)
  where id = v_game.challenge_id;
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
  v_is_draft boolean;
  v_game_id text;
  v_game_version text;
  v_game_title text;
  v_summary text;
  v_play_url text;
  v_notification_title text;
  v_notification_body text;
  v_notification_action text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.challenger_id <> v_actor then
    raise exception 'challenger only';
  end if;

  if v_game.lifecycle_state <> 'prepared' then
    raise exception 'sealed-bid game already sent';
  end if;

  if v_game.revision <> p_expected_revision then
    raise exception 'stale revision';
  end if;

  v_is_draft := v_game.mode_id = 'build-qb';

  if v_is_draft
    and not private.draft_room_public_release_enabled()
    and not (
      public.is_pick_control_owner(v_game.challenger_id)
      and public.is_pick_control_owner(v_game.recipient_id)
    )
  then
    raise exception 'Draft Room is admin-only until public release';
  end if;

  perform private.validate_auction_bid(v_game, v_actor, p_amount, p_category);

  insert into private.auction_pending_bids (
    auction_id, round_number, bidder_id, amount, ultimate_fighter_category
  ) values (
    v_game.id, 1, v_actor, p_amount::integer, p_category
  );

  v_game_id := case when v_is_draft then 'draft-room' else 'auction' end;
  v_game_version := case when v_is_draft then 'football-draft-room-server-v1' else 'auction-server-v3' end;
  v_game_title := case when v_is_draft then 'Draft Room' else 'Auction' end;
  v_summary := case when v_is_draft then 'Build a QB' else v_game.mode_id end;
  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;

  loop
    v_attempt := v_attempt + 1;
    v_code := upper(substr(replace(extensions.gen_random_uuid()::text, '-', ''), 1, 8));
    begin
      insert into public.play_challenges (
        code, game_id, game_version, game_title, summary,
        creator_id, recipient_id, play_url, setup, creator_result
      ) values (
        v_code, v_game_id, v_game_version, v_game_title, v_summary,
        v_game.challenger_id, v_game.recipient_id, v_play_url, '{}'::jsonb, '{}'::jsonb
      )
      returning created_at into v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  update private.auction_games
  set challenge_id = (select challenge.id from public.play_challenges challenge where challenge.code = v_code),
      lifecycle_state = 'sent',
      revision = revision + 1,
      updated_at = now()
  where id = v_game.id;

  select profile.display_name into v_creator_name
  from public.profiles profile
  where profile.id = v_game.challenger_id;

  v_notification_title := case when v_is_draft then 'Draft Room challenge received' else 'Auction challenge received' end;
  v_notification_body := case
    when v_is_draft then v_creator_name || ' challenged you to Build a QB.'
    else v_creator_name || ' challenged you to Auction.'
  end;
  v_notification_action := case when v_is_draft then 'VIEW DRAFT ROOM' else 'VIEW AUCTION' end;

  perform private.publish_notification_to_profile(
    v_game.recipient_id,
    case when v_is_draft then 'draft-room:received:' else 'auction:received:' end || v_game.id::text,
    case when v_is_draft then 'draft-room:' else 'auction:' end || v_game.id::text,
    'game_challenge_received',
    v_notification_title,
    v_notification_body,
    v_play_url,
    v_notification_action,
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
  v_challenger_name text;
  v_recipient_name text;
  v_challenger_score text;
  v_recipient_score text;
  v_resolved_round integer;
  v_round_resolved boolean;
  v_is_draft boolean;
  v_play_url text;
  v_prefix text;
  v_game_title text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not a sealed-bid participant';
  end if;

  v_is_draft := v_game.mode_id = 'build-qb';

  if v_is_draft
    and not private.draft_room_public_release_enabled()
    and not (
      public.is_pick_control_owner(v_game.challenger_id)
      and public.is_pick_control_owner(v_game.recipient_id)
    )
  then
    raise exception 'Draft Room is admin-only until public release';
  end if;

  if v_game.lifecycle_state not in ('sent', 'active') then
    raise exception 'sealed-bid game is not accepting bids';
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

  perform private.validate_auction_bid(v_game, v_actor, p_amount, p_category);

  begin
    insert into private.auction_pending_bids (
      auction_id, round_number, bidder_id, amount, ultimate_fighter_category
    ) values (
      v_game.id, p_round, v_actor, p_amount::integer, p_category
    );
  exception when unique_violation then
    raise exception 'bid is locked and cannot be edited';
  end;

  if v_was_sent then
    update public.play_challenges
    set opened_at = coalesce(opened_at, now())
    where id = v_game.challenge_id;

    select profile.display_name into v_actor_name
    from public.profiles profile where profile.id = v_actor;
  end if;

  v_resolved_round := v_game.current_round;
  perform private.resolve_auction_round(v_game.id);

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id;

  select challenger.display_name, recipient.display_name
    into v_challenger_name, v_recipient_name
  from public.profiles challenger
  join public.profiles recipient on recipient.id = v_game.recipient_id
  where challenger.id = v_game.challenger_id;

  select exists (
    select 1 from private.auction_awards award
    where award.auction_id = p_auction_id
      and award.resolved_round = v_resolved_round
  ) into v_round_resolved;

  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;
  v_prefix := case when v_is_draft then 'draft-room:' else 'auction:' end;
  v_game_title := case when v_is_draft then 'Draft Room' else 'Auction' end;

  if v_round_resolved and v_game.lifecycle_state = 'active' then
    if v_was_sent then
      perform private.publish_notification_to_profile(
        v_game.challenger_id,
        v_prefix || 'accepted:' || v_game.id::text,
        v_prefix || v_game.id::text,
        'auction_action_required',
        v_game_title || ' accepted · bid now',
        v_actor_name || ' accepted your ' || v_game_title || ' challenge. Round 1 resolved and your next sealed bid is ready.',
        v_play_url,
        'PLACE BID',
        now()
      );
    else
      v_opponent := case
        when v_actor = v_game.challenger_id then v_game.recipient_id
        else v_game.challenger_id
      end;

      perform private.publish_notification_to_profile(
        v_opponent,
        v_prefix || 'round:' || v_game.id::text || ':' || v_resolved_round::text,
        v_prefix || v_game.id::text,
        'auction_action_required',
        v_game_title || ' action required',
        'Round ' || v_resolved_round::text || ' resolved. Your next sealed bid is ready.',
        v_play_url,
        'PLACE BID',
        now()
      );
    end if;
  elsif v_game.lifecycle_state = 'completed' then
    v_challenger_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.challenger_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );
    v_recipient_score := pg_catalog.regexp_replace(
      pg_catalog.regexp_replace(pg_catalog.to_char(v_game.recipient_final_score, 'FM990.00'), '0+$', ''),
      '\.$',
      ''
    );

    perform private.publish_notification_to_profile(
      v_game.challenger_id,
      v_prefix || 'completed:' || v_game.id::text,
      v_prefix || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then v_game_title || ' result · True tie'
        when v_game.winner_profile_id = v_game.challenger_id then v_game_title || ' result · You won'
        else v_game_title || ' result · ' || v_recipient_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      v_play_url,
      'VIEW RESULT',
      now()
    );

    perform private.publish_notification_to_profile(
      v_game.recipient_id,
      v_prefix || 'completed:' || v_game.id::text,
      v_prefix || v_game.id::text,
      'auction_result_ready',
      case
        when v_game.winner_profile_id is null then v_game_title || ' result · True tie'
        when v_game.winner_profile_id = v_game.recipient_id then v_game_title || ' result · You won'
        else v_game_title || ' result · ' || v_challenger_name || ' won'
      end,
      'Final score: ' || v_challenger_name || ' ' || v_challenger_score
        || ' · ' || v_recipient_name || ' ' || v_recipient_score || '.',
      v_play_url,
      'VIEW RESULT',
      now()
    );
  end if;

  return v_game.revision;
end;
$$;

create or replace function public.cancel_auction(p_auction_id uuid, p_expected_revision bigint)
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
  v_is_draft boolean;
  v_play_url text;
  v_title text;
begin
  if v_actor is null then
    raise exception 'sign in required';
  end if;

  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_actor not in (v_game.challenger_id, v_game.recipient_id)
  then
    raise exception 'not a sealed-bid participant';
  end if;

  if v_game.lifecycle_state = 'cancelled' then
    return v_game.revision;
  end if;

  if v_game.lifecycle_state = 'sent' then
    if v_actor <> v_game.challenger_id then
      raise exception 'only the challenger can cancel a pending sealed-bid game';
    end if;

    select challenge.opened_at into v_challenge_opened_at
    from public.play_challenges challenge
    where challenge.id = v_game.challenge_id;

    if v_challenge_opened_at is not null then
      raise exception 'pending sealed-bid game has already been opened';
    end if;
  elsif v_game.lifecycle_state <> 'active' then
    raise exception 'only a pending or active sealed-bid game can be cancelled';
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

  select profile.display_name into v_actor_name
  from public.profiles profile where profile.id = v_actor;

  v_opponent := case
    when v_actor = v_game.challenger_id then v_game.recipient_id
    else v_game.challenger_id
  end;
  v_is_draft := v_game.mode_id = 'build-qb';
  v_play_url := case
    when v_is_draft then '/football/draft-room?auction=' || v_game.id::text
    else '/play/auction?auction=' || v_game.id::text
  end;
  v_title := case when v_is_draft then 'Draft Room' else 'Auction' end;

  perform private.publish_notification_to_profile(
    v_opponent,
    case when v_is_draft then 'draft-room:cancelled:' else 'auction:cancelled:' end || v_game.id::text,
    case when v_is_draft then 'draft-room:' else 'auction:' end || v_game.id::text,
    'auction_result_ready',
    v_title || ' cancelled',
    v_actor_name || ' cancelled this ' || v_title || '. No winner, score, loss, or forfeit was recorded.',
    v_play_url,
    case when v_is_draft then 'VIEW DRAFT ROOM' else 'VIEW AUCTION' end,
    now()
  );

  return v_game.revision;
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
  select challenge.* into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and v_actor in (challenge.creator_id, challenge.recipient_id)
  for update;

  if not found then
    return false;
  end if;

  if v_challenge.game_id not in ('auction', 'draft-room') then
    update public.play_challenges
    set declined_at = case
          when recipient_id = v_actor and completed_at is null then coalesce(declined_at, now())
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

  select auction.* into v_auction
  from private.auction_games auction
  where auction.challenge_id = v_challenge.id
  for update;

  if v_auction.id is null then
    raise exception 'sealed-bid challenge linkage is missing';
  end if;

  if v_auction.lifecycle_state = 'active' then
    raise exception 'Use the sealed-bid cancellation command for an active game';
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

comment on function private.draft_room_public_release_enabled() is
  'Stage 12 release switch. False keeps Football Draft Room restricted to pick-control owners.';
comment on function private.auction_required_selections(text,text) is
  'Canonical sealed-bid collection-size owner shared by UFC Auction and Football Draft Room.';
comment on function private.auction_category_options(text) is
  'Canonical category owner for sealed-bid builder modes, including Build a QB traits.';
