-- Stage 14: wire Longhorns Since 2005 into the existing sealed-bid Draft Room.
-- The approved 64-player Texas-only grades and randomized board calibration live in 202612310115.

alter table private.auction_catalog_versions
  drop constraint auction_catalog_versions_game_id_check;

alter table private.auction_catalog_versions
  add constraint auction_catalog_versions_game_id_check
  check (game_id in ('auction', 'draft-room', 'draft-room-trio', 'draft-room-longhorns'));

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in ('build-qb', 'build-qb-cfb', 'trio-nfl', 'trio-cfb', 'longhorns-2005') then 'draft-room'
    else 'auction'
  end;
$$;

create or replace function private.auction_catalog_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in ('trio-nfl', 'trio-cfb') then 'draft-room-trio'
    when p_mode_id = 'longhorns-2005' then 'draft-room-longhorns'
    when p_mode_id in ('build-qb', 'build-qb-cfb') then 'draft-room'
    else 'auction'
  end;
$$;

revoke all on function private.auction_game_id_for_mode(text) from public, anon, authenticated;
revoke all on function private.auction_catalog_game_id_for_mode(text) from public, anon, authenticated;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version,
  game_id
) values (
  'football-draft-room-longhorns-2005-2026-09-v1',
  'football-draft-room-longhorns-2005-rarity-2026-09-v1',
  'football-draft-room-longhorns-2005-grading-2026-09-v1',
  true,
  'draft-room-longhorns'
);

create table private.draft_room_longhorns_board_entries (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position between 1 and 8),
  item_reference text not null,
  board_shape text not null check (board_shape in ('Wide','Balanced','TopHeavy','BottomHeavy','Compressed','Chaotic')),
  board_variant integer not null check (board_variant between 1 and 4),
  strength_slot integer not null check (strength_slot between 1 and 8),
  player_reference text not null references private.draft_room_longhorns_player_pool(player_reference),
  display_name text not null,
  position_group text not null,
  grade_band text not null check (grade_band in ('Icon','Elite','Star','Strong','Core')),
  primary key (auction_id, deck_position),
  unique (auction_id, item_reference),
  unique (auction_id, player_reference),
  unique (auction_id, strength_slot)
);

create or replace function private.protect_draft_room_longhorns_board_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
    and not exists (
      select 1
      from private.auction_games auction
      where auction.id = old.auction_id
    )
  then
    return old;
  end if;

  raise exception 'Longhorns Since 2005 board entries are immutable';
end;
$$;

create trigger draft_room_longhorns_board_entries_immutable
before update or delete on private.draft_room_longhorns_board_entries
for each row execute function private.protect_draft_room_longhorns_board_entry();

revoke all on private.draft_room_longhorns_board_entries from public, anon, authenticated;
revoke all on function private.protect_draft_room_longhorns_board_entry() from public, anon, authenticated;

create or replace function private.generate_draft_room_longhorns_deck(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_shape text;
  v_variant integer;
  v_slot_order integer[];
  v_position integer;
  v_strength_slot integer;
  v_grade_band text;
  v_player private.draft_room_longhorns_player_pool;
  v_item_reference text;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.mode_id <> 'longhorns-2005' then
    raise exception 'Longhorns deck generation requires a matching Draft Room game';
  end if;

  if exists (
    select 1 from private.auction_deck_entries deck where deck.auction_id = p_auction_id
  ) or exists (
    select 1 from private.draft_room_longhorns_board_entries entry where entry.auction_id = p_auction_id
  ) then
    raise exception 'Longhorns Since 2005 deck is already fixed';
  end if;

  v_shape := private.draft_room_longhorns_board_shape(random());
  v_variant := private.draft_room_longhorns_board_variant(random());

  select array_agg(slot order by random())
  into v_slot_order
  from generate_series(1, 8) slot;

  if array_length(v_slot_order, 1) <> 8 then
    raise exception 'Longhorns strength-slot shuffle failed';
  end if;

  for v_position in 1..8 loop
    v_strength_slot := v_slot_order[v_position];
    v_grade_band := private.draft_room_longhorns_grade_band(v_shape, v_variant, v_strength_slot);

    select player.* into v_player
    from private.draft_room_longhorns_player_pool player
    where player.grade_band = v_grade_band
      and not exists (
        select 1
        from private.draft_room_longhorns_board_entries entry
        where entry.auction_id = p_auction_id
          and entry.player_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    if v_player.player_reference is null then
      raise exception 'Longhorns board generation underfilled grade band %', v_grade_band;
    end if;

    v_item_reference := 'longhorn-' || v_position::text;

    insert into private.draft_room_longhorns_board_entries (
      auction_id,
      deck_position,
      item_reference,
      board_shape,
      board_variant,
      strength_slot,
      player_reference,
      display_name,
      position_group,
      grade_band
    ) values (
      p_auction_id,
      v_position,
      v_item_reference,
      v_shape,
      v_variant,
      v_strength_slot,
      v_player.player_reference,
      v_player.display_name,
      v_player.position_group,
      v_player.grade_band
    );

    insert into private.auction_deck_entries (
      auction_id,
      deck_position,
      private_item_reference
    ) values (
      p_auction_id,
      v_position,
      v_item_reference
    );
  end loop;

  if (
    select count(*) from private.draft_room_longhorns_board_entries entry
    where entry.auction_id = p_auction_id
  ) <> 8
    or (
      select count(distinct entry.player_reference)
      from private.draft_room_longhorns_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 8
    or (
      select count(distinct entry.board_shape)
      from private.draft_room_longhorns_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 1
    or (
      select count(distinct entry.board_variant)
      from private.draft_room_longhorns_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 1
  then
    raise exception 'Longhorns Since 2005 board generation drifted from the eight-player contract';
  end if;
end;
$$;

revoke all on function private.generate_draft_room_longhorns_deck(uuid) from public, anon, authenticated;

create or replace function private.grade_draft_room_longhorns(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_challenger_count integer;
  v_recipient_count integer;
  v_challenger_score numeric(5,2);
  v_recipient_score numeric(5,2);
  v_winner uuid;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null
    or v_game.mode_id <> 'longhorns-2005'
    or v_game.grading_version <> 'football-draft-room-longhorns-2005-grading-2026-09-v1'
  then
    raise exception 'Longhorns Since 2005 grading boundary is invalid';
  end if;

  select
    count(*),
    round(avg(player.hidden_grade), 2)
  into v_challenger_count, v_challenger_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_board_entries entry
    on entry.auction_id = award.auction_id
    and entry.item_reference = deck.private_item_reference
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.challenger_id;

  select
    count(*),
    round(avg(player.hidden_grade), 2)
  into v_recipient_count, v_recipient_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id
    and deck.auction_id = award.auction_id
  join private.draft_room_longhorns_board_entries entry
    on entry.auction_id = award.auction_id
    and entry.item_reference = deck.private_item_reference
  join private.draft_room_longhorns_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 4
    or v_recipient_count <> 4
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'Longhorns Since 2005 grading inputs are incomplete or invalid';
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
  where id = p_auction_id;

  update public.play_challenges
  set completed_at = coalesce(completed_at, now()),
      creator_result = jsonb_build_object('overall_score', v_challenger_score),
      responder_result = jsonb_build_object('overall_score', v_recipient_score)
  where id = v_game.challenge_id;
end;
$$;

revoke all on function private.grade_draft_room_longhorns(uuid) from public, anon, authenticated;

alter table private.auction_games
  drop constraint auction_games_mode_valid,
  drop constraint auction_games_round_valid,
  drop constraint auction_games_selection_counts_valid,
  drop constraint auction_games_bankroll_ceiling;

alter table private.auction_games
  add constraint auction_games_mode_valid check (mode_id in (
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
    'nicknames',
    'build-qb',
    'build-qb-cfb',
    'trio-nfl',
    'trio-cfb',
    'longhorns-2005'
  )),
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 6
      when mode_id = 'longhorns-2005' then 8
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 8
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 8
      when content_version in (
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6',
        'ufc-auction-2026-08-v7',
        'ufc-auction-2026-08-v8'
      ) then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id in ('trio-nfl', 'trio-cfb') then 3
      when mode_id = 'longhorns-2005' then 4
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6',
        'ufc-auction-2026-08-v7',
        'ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id in ('trio-nfl', 'trio-cfb') then 3
      when mode_id = 'longhorns-2005' then 4
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6',
        'ufc-auction-2026-08-v7',
        'ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 30
      when mode_id = 'longhorns-2005' then 40
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6',
        'ufc-auction-2026-08-v7',
        'ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 30
      when mode_id = 'longhorns-2005' then 40
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3',
        'ufc-auction-2026-08-v4',
        'ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6',
        'ufc-auction-2026-08-v7',
        'ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
  );

do $$
declare
  v_definition text;
  v_next text;
begin
  -- Delegate Longhorns to its calibrated private board generator before the generic catalog path.
  v_definition := pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\n  if p_mode_id in (''trio-nfl'', ''trio-cfb'') then',
    E'begin\n  if p_mode_id = ''longhorns-2005'' then\n    if p_count <> 8 then raise exception ''Longhorns Since 2005 deck must contain eight players''; end if;\n    if p_random_order is not null then raise exception ''Injected Auction random order is unavailable for Longhorns rooms''; end if;\n    perform private.generate_draft_room_longhorns_deck(p_auction_id);\n    return;\n  end if;\n\n  if p_mode_id in (''trio-nfl'', ''trio-cfb'') then'
  );
  if v_next = v_definition then raise exception 'Longhorns generator contract drifted'; end if;
  execute v_next;

  -- Accept game-scoped Longhorn board entries without weakening the catalog trigger for other modes.
  v_definition := pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_trio_packages package',
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_longhorns_board_entries entry on entry.auction_id = auction.id\n    where auction.id = new.auction_id\n      and auction.mode_id = ''longhorns-2005''\n      and entry.item_reference = new.private_item_reference\n  ) then\n    return new;\n  end if;\n\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_trio_packages package'
  );
  if v_next = v_definition then raise exception 'Longhorns deck validation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next := replace(
    v_definition,
    E'case\n        when v_auction.mode_id in (''trio-nfl'', ''trio-cfb'') then 6',
    E'case\n        when v_auction.mode_id = ''longhorns-2005'' then 8\n        when v_auction.mode_id in (''trio-nfl'', ''trio-cfb'') then 6'
  );
  if v_next = v_definition then raise exception 'Longhorns private-row round contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_required := case\n    when p_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3',
    E'v_required := case\n    when p_game.mode_id = ''longhorns-2005'' then 4\n    when p_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3'
  );
  if v_next = v_definition then raise exception 'Longhorns bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_required := case\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3',
    E'v_required := case\n    when v_game.mode_id = ''longhorns-2005'' then 4\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3'
  );
  v_next := replace(
    v_next,
    E'v_rounds := case\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 6',
    E'v_rounds := case\n    when v_game.mode_id = ''longhorns-2005'' then 8\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 6'
  );
  if v_next = v_definition then raise exception 'Longhorns round-resolution contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'  if v_game.mode_id in (''trio-nfl'', ''trio-cfb'')',
    E'  if v_game.mode_id = ''longhorns-2005''\n    and v_game.grading_version = ''football-draft-room-longhorns-2005-grading-2026-09-v1''\n  then\n    perform private.grade_draft_room_longhorns(p_auction_id);\n    return;\n  end if;\n\n  if v_game.mode_id in (''trio-nfl'', ''trio-cfb'')'
  );
  if v_next = v_definition then raise exception 'Longhorns grading contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'    ''build-qb'',\n    ''build-qb-cfb'',\n    ''trio-nfl'',\n    ''trio-cfb''',
    E'    ''build-qb'',\n    ''build-qb-cfb'',\n    ''trio-nfl'',\n    ''trio-cfb'',\n    ''longhorns-2005'''
  );
  v_next := replace(
    v_next,
    E'  if p_mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'')\n    and not private.draft_room_public_release_enabled()',
    E'  if p_mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'')\n    and not private.draft_room_public_release_enabled()'
  );
  v_next := replace(
    v_next,
    E'v_rounds := case\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 6',
    E'v_rounds := case\n    when p_mode_id = ''longhorns-2005'' then 8\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 6'
  );
  v_next := replace(
    v_next,
    E'v_bankroll := case\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 30',
    E'v_bankroll := case\n    when p_mode_id = ''longhorns-2005'' then 40\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 30'
  );
  if v_next = v_definition then raise exception 'Longhorns preparation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');',
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'');'
  );
  v_next := replace(
    v_next,
    E'    when v_game.mode_id = ''trio-cfb'' then ''CFB QB / RB / WR Trio''',
    E'    when v_game.mode_id = ''trio-cfb'' then ''CFB QB / RB / WR Trio''\n    when v_game.mode_id = ''longhorns-2005'' then ''Longhorns Since 2005'''
  );
  v_next := replace(
    v_next,
    E'when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then v_creator_name || '' challenged you to QB / RB / WR Trio.''',
    E'when v_game.mode_id = ''longhorns-2005'' then v_creator_name || '' challenged you to Longhorns Since 2005.''\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then v_creator_name || '' challenged you to QB / RB / WR Trio.'''
  );
  if v_next = v_definition then raise exception 'Longhorns first-bid notification contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');',
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'');'
  );
  if v_next = v_definition then raise exception 'Longhorns submit-bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_is_draft := v_auction.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');',
    E'v_is_draft := v_auction.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'');'
  );
  if v_next = v_definition then raise exception 'Longhorns decline-sync contract drifted'; end if;
  execute v_next;

  -- Keep cancellation inside the shared Draft Room route for every Football Draft Room mode.
  v_definition := pg_get_functiondef('public.cancel_auction(uuid,bigint)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'');',
    E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'');'
  );
  if v_next = v_definition then raise exception 'Draft Room cancellation routing contract drifted'; end if;
  execute v_next;

  -- Extend the participant projection with display names only. Grades, bands and board metadata stay private.
  v_definition := pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'      left join private.draft_room_trio_packages trio\n        on trio.auction_id = auction.id\n        and trio.item_reference = deck.private_item_reference',
    E'      left join private.draft_room_trio_packages trio\n        on trio.auction_id = auction.id\n        and trio.item_reference = deck.private_item_reference\n      left join private.draft_room_longhorns_board_entries longhorn\n        on longhorn.auction_id = auction.id\n        and longhorn.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    E'        left join private.draft_room_trio_packages trio\n          on trio.auction_id = auction.id\n          and trio.item_reference = deck.private_item_reference',
    E'        left join private.draft_room_trio_packages trio\n          on trio.auction_id = auction.id\n          and trio.item_reference = deck.private_item_reference\n        left join private.draft_room_longhorns_board_entries longhorn\n          on longhorn.auction_id = auction.id\n          and longhorn.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    'coalesce(catalog.display_label, trio.display_label)',
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name)'
  );
  v_next := replace(
    v_next,
    'when catalog.item_reference is not null or trio.item_reference is not null',
    'when catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null'
  );
  v_next := replace(
    v_next,
    E'          and (catalog.item_reference is not null or trio.item_reference is not null)',
    E'          and (catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null)'
  );
  if v_next = v_definition then raise exception 'Longhorns participant projection contract drifted'; end if;
  execute v_next;
end;
$$;
