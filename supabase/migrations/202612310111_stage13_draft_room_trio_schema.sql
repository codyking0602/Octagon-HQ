-- Stage 13: QB / RB / WR Trio on the existing sealed-bid Draft Room architecture.
-- Raw player/trio grades remain in private schema only and are never projected to participants.

alter table private.auction_catalog_versions
  drop constraint auction_catalog_versions_game_id_check;

alter table private.auction_catalog_versions
  add constraint auction_catalog_versions_game_id_check
  check (game_id in ('auction', 'draft-room', 'draft-room-trio'));

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in ('build-qb', 'build-qb-cfb', 'trio-nfl', 'trio-cfb') then 'draft-room'
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
    when p_mode_id in ('build-qb', 'build-qb-cfb') then 'draft-room'
    else 'auction'
  end;
$$;

revoke all on function private.auction_catalog_game_id_for_mode(text) from public, anon, authenticated;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version,
  game_id
) values (
  'football-draft-room-trio-2026-09-v1',
  'football-draft-room-trio-rarity-2026-09-v1',
  'football-draft-room-trio-grading-2026-09-v1',
  true,
  'draft-room-trio'
);

create table private.draft_room_trio_player_pool (
  mode_id text not null check (mode_id in ('trio-nfl', 'trio-cfb')),
  position text not null check (position in ('QB', 'RB', 'WR')),
  player_reference text not null,
  display_name text not null,
  tier text not null check (tier in ('Elite', 'Great', 'Good', 'Average')),
  tier_rank integer not null check (tier_rank between 1 and 4),
  hidden_grade numeric(5,2) not null check (hidden_grade between 0 and 100),
  peak_team text,
  peak_season integer,
  primary key (mode_id, position, player_reference),
  unique (mode_id, position, display_name),
  check (
    (tier = 'Elite' and tier_rank = 4 and hidden_grade between 94 and 98)
    or (tier = 'Great' and tier_rank = 3 and hidden_grade between 89 and 93)
    or (tier = 'Good' and tier_rank = 2 and hidden_grade between 84 and 88)
    or (tier = 'Average' and tier_rank = 1 and hidden_grade between 79 and 83)
  ),
  check (
    (mode_id = 'trio-nfl' and peak_team is null and peak_season is null)
    or (mode_id = 'trio-cfb' and peak_team is not null and peak_season >= 2005)
  )
);

create table private.draft_room_trio_packages (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position between 1 and 6),
  item_reference text not null,
  room_profile text not null check (room_profile in ('Loaded', 'Strong', 'Balanced', 'Gritty')),
  qb_reference text not null,
  qb_display_name text not null,
  qb_tier text not null check (qb_tier in ('Elite', 'Great', 'Good', 'Average')),
  qb_peak_team text,
  qb_peak_season integer,
  rb_reference text not null,
  rb_display_name text not null,
  rb_tier text not null check (rb_tier in ('Elite', 'Great', 'Good', 'Average')),
  rb_peak_team text,
  rb_peak_season integer,
  wr_reference text not null,
  wr_display_name text not null,
  wr_tier text not null check (wr_tier in ('Elite', 'Great', 'Good', 'Average')),
  wr_peak_team text,
  wr_peak_season integer,
  display_label text not null,
  primary key (auction_id, deck_position),
  unique (auction_id, item_reference),
  check (not (qb_tier = 'Average' and rb_tier = 'Average' and wr_tier = 'Average'))
);

revoke all on private.draft_room_trio_player_pool from public, anon, authenticated;
revoke all on private.draft_room_trio_packages from public, anon, authenticated;

create or replace function private.protect_draft_room_trio_private_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
    and tg_table_name = 'draft_room_trio_packages'
    and not exists (
      select 1 from private.auction_games auction where auction.id = old.auction_id
    )
  then
    return old;
  end if;

  raise exception 'Draft Room Trio private records are immutable';
end;
$$;

create trigger draft_room_trio_player_pool_immutable
before update or delete on private.draft_room_trio_player_pool
for each row execute function private.protect_draft_room_trio_private_row();

create trigger draft_room_trio_packages_immutable
before update or delete on private.draft_room_trio_packages
for each row execute function private.protect_draft_room_trio_private_row();

create or replace function private.draft_room_trio_room_profile(p_roll double precision)
returns text
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Trio room profile roll must be in [0,1)';
  end if;

  return case
    when p_roll < 0.20 then 'Loaded'
    when p_roll < 0.50 then 'Strong'
    when p_roll < 0.80 then 'Balanced'
    else 'Gritty'
  end;
end;
$$;

create or replace function private.draft_room_trio_tier_combo(
  p_profile text,
  p_roll double precision
)
returns text[]
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Trio tier-combo roll must be in [0,1)';
  end if;

  if p_profile = 'Loaded' then
    return case
      when p_roll < 0.05 then array['Elite','Elite','Elite']::text[]
      when p_roll < 0.20 then array['Elite','Elite','Great']::text[]
      when p_roll < 0.45 then array['Elite','Great','Great']::text[]
      when p_roll < 0.70 then array['Elite','Great','Good']::text[]
      when p_roll < 0.90 then array['Great','Great','Good']::text[]
      else array['Elite','Elite','Good']::text[]
    end;
  elsif p_profile = 'Strong' then
    return case
      when p_roll < 0.10 then array['Elite','Great','Great']::text[]
      when p_roll < 0.30 then array['Elite','Great','Good']::text[]
      when p_roll < 0.60 then array['Great','Great','Good']::text[]
      when p_roll < 0.85 then array['Great','Good','Good']::text[]
      when p_roll < 0.95 then array['Elite','Good','Good']::text[]
      else array['Great','Great','Great']::text[]
    end;
  elsif p_profile = 'Balanced' then
    return case
      when p_roll < 0.05 then array['Elite','Good','Good']::text[]
      when p_roll < 0.30 then array['Great','Good','Good']::text[]
      when p_roll < 0.55 then array['Good','Good','Good']::text[]
      when p_roll < 0.75 then array['Great','Good','Average']::text[]
      when p_roll < 0.95 then array['Good','Good','Average']::text[]
      else array['Great','Average','Average']::text[]
    end;
  elsif p_profile = 'Gritty' then
    return case
      when p_roll < 0.03 then array['Elite','Good','Average']::text[]
      when p_roll < 0.10 then array['Great','Great','Average']::text[]
      when p_roll < 0.25 then array['Great','Good','Average']::text[]
      when p_roll < 0.45 then array['Good','Good','Good']::text[]
      when p_roll < 0.75 then array['Good','Good','Average']::text[]
      else array['Good','Average','Average']::text[]
    end;
  end if;

  raise exception 'Unknown Trio room profile: %', p_profile;
end;
$$;

revoke all on function private.draft_room_trio_room_profile(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_trio_tier_combo(text,double precision) from public, anon, authenticated;

create or replace function private.generate_draft_room_trio_deck(
  p_auction_id uuid,
  p_mode_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_profile text;
  v_combo text[];
  v_permutation integer;
  v_qb_tier text;
  v_rb_tier text;
  v_wr_tier text;
  v_qb private.draft_room_trio_player_pool;
  v_rb private.draft_room_trio_player_pool;
  v_wr private.draft_room_trio_player_pool;
  v_position integer;
  v_item_reference text;
  v_display_label text;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.mode_id <> p_mode_id or p_mode_id not in ('trio-nfl', 'trio-cfb') then
    raise exception 'Trio deck generation requires the matching Draft Room game';
  end if;

  if exists (select 1 from private.auction_deck_entries deck where deck.auction_id = p_auction_id)
    or exists (select 1 from private.draft_room_trio_packages package where package.auction_id = p_auction_id)
  then
    raise exception 'Draft Room Trio deck is already fixed';
  end if;

  v_profile := private.draft_room_trio_room_profile(random());

  for v_position in 1..6 loop
    v_combo := private.draft_room_trio_tier_combo(v_profile, random());
    v_permutation := floor(random() * 6)::integer + 1;

    if v_permutation = 1 then
      v_qb_tier := v_combo[1]; v_rb_tier := v_combo[2]; v_wr_tier := v_combo[3];
    elsif v_permutation = 2 then
      v_qb_tier := v_combo[1]; v_rb_tier := v_combo[3]; v_wr_tier := v_combo[2];
    elsif v_permutation = 3 then
      v_qb_tier := v_combo[2]; v_rb_tier := v_combo[1]; v_wr_tier := v_combo[3];
    elsif v_permutation = 4 then
      v_qb_tier := v_combo[2]; v_rb_tier := v_combo[3]; v_wr_tier := v_combo[1];
    elsif v_permutation = 5 then
      v_qb_tier := v_combo[3]; v_rb_tier := v_combo[1]; v_wr_tier := v_combo[2];
    else
      v_qb_tier := v_combo[3]; v_rb_tier := v_combo[2]; v_wr_tier := v_combo[1];
    end if;

    select player.* into v_qb
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'QB'
      and player.tier = v_qb_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.qb_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    select player.* into v_rb
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'RB'
      and player.tier = v_rb_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.rb_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    select player.* into v_wr
    from private.draft_room_trio_player_pool player
    where player.mode_id = p_mode_id
      and player.position = 'WR'
      and player.tier = v_wr_tier
      and not exists (
        select 1 from private.draft_room_trio_packages package
        where package.auction_id = p_auction_id and package.wr_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    if v_qb.player_reference is null or v_rb.player_reference is null or v_wr.player_reference is null then
      raise exception 'Draft Room Trio generation underfilled a requested tier';
    end if;

    v_item_reference := 'trio-' || v_position::text;
    v_display_label := case
      when p_mode_id = 'trio-cfb' then
        v_qb.display_name || ' · ' || v_qb.peak_team || ' ' || v_qb.peak_season::text || ' | '
        || v_rb.display_name || ' · ' || v_rb.peak_team || ' ' || v_rb.peak_season::text || ' | '
        || v_wr.display_name || ' · ' || v_wr.peak_team || ' ' || v_wr.peak_season::text
      else
        v_qb.display_name || ' | ' || v_rb.display_name || ' | ' || v_wr.display_name
    end;

    insert into private.draft_room_trio_packages (
      auction_id, deck_position, item_reference, room_profile,
      qb_reference, qb_display_name, qb_tier, qb_peak_team, qb_peak_season,
      rb_reference, rb_display_name, rb_tier, rb_peak_team, rb_peak_season,
      wr_reference, wr_display_name, wr_tier, wr_peak_team, wr_peak_season,
      display_label
    ) values (
      p_auction_id, v_position, v_item_reference, v_profile,
      v_qb.player_reference, v_qb.display_name, v_qb.tier, v_qb.peak_team, v_qb.peak_season,
      v_rb.player_reference, v_rb.display_name, v_rb.tier, v_rb.peak_team, v_rb.peak_season,
      v_wr.player_reference, v_wr.display_name, v_wr.tier, v_wr.peak_team, v_wr.peak_season,
      v_display_label
    );

    insert into private.auction_deck_entries (auction_id, deck_position, private_item_reference)
    values (p_auction_id, v_position, v_item_reference);
  end loop;

  if (
    select count(distinct package.room_profile)
    from private.draft_room_trio_packages package
    where package.auction_id = p_auction_id
  ) <> 1 then
    raise exception 'Draft Room Trio room profile drifted within one game';
  end if;
end;
$$;

revoke all on function private.generate_draft_room_trio_deck(uuid,text) from public, anon, authenticated;

create or replace function private.grade_draft_room_trio(p_auction_id uuid)
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
    or v_game.mode_id not in ('trio-nfl', 'trio-cfb')
    or v_game.grading_version <> 'football-draft-room-trio-grading-2026-09-v1'
  then
    raise exception 'Draft Room Trio grading boundary is invalid';
  end if;

  select
    count(*),
    round(sum(qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 9.0, 2)
  into v_challenger_count, v_challenger_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_trio_packages package
    on package.auction_id = award.auction_id and package.item_reference = deck.private_item_reference
  join private.draft_room_trio_player_pool qb
    on qb.mode_id = v_game.mode_id and qb.position = 'QB' and qb.player_reference = package.qb_reference
  join private.draft_room_trio_player_pool rb
    on rb.mode_id = v_game.mode_id and rb.position = 'RB' and rb.player_reference = package.rb_reference
  join private.draft_room_trio_player_pool wr
    on wr.mode_id = v_game.mode_id and wr.position = 'WR' and wr.player_reference = package.wr_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.challenger_id;

  select
    count(*),
    round(sum(qb.hidden_grade + rb.hidden_grade + wr.hidden_grade) / 9.0, 2)
  into v_recipient_count, v_recipient_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_trio_packages package
    on package.auction_id = award.auction_id and package.item_reference = deck.private_item_reference
  join private.draft_room_trio_player_pool qb
    on qb.mode_id = v_game.mode_id and qb.position = 'QB' and qb.player_reference = package.qb_reference
  join private.draft_room_trio_player_pool rb
    on rb.mode_id = v_game.mode_id and rb.position = 'RB' and rb.player_reference = package.rb_reference
  join private.draft_room_trio_player_pool wr
    on wr.mode_id = v_game.mode_id and wr.position = 'WR' and wr.player_reference = package.wr_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 3
    or v_recipient_count <> 3
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'Draft Room Trio grading inputs are incomplete or invalid';
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

revoke all on function private.grade_draft_room_trio(uuid) from public, anon, authenticated;

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
    'trio-cfb'
  )),
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 6
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
  -- The shared generator delegates only Trio modes to the Stage 13 package generator.
  v_definition := pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\\n  if p_count < 1 then',
    E'begin\\n  if p_mode_id in (''trio-nfl'', ''trio-cfb'') then\\n    if p_count <> 6 then raise exception ''Draft Room Trio deck must contain six packages''; end if;\\n    if p_random_order is not null then raise exception ''Injected Auction random order is unavailable for Trio rooms''; end if;\\n    perform private.generate_draft_room_trio_deck(p_auction_id, p_mode_id);\\n    return;\\n  end if;\\n\\n  if p_count < 1 then'
  );
  if v_next = v_definition then raise exception 'Stage 13 generator contract drifted'; end if;
  execute v_next;

  -- Catalog validation accepts the private game-scoped Trio package table without relaxing other modes.
  v_definition := pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\\n  select auction.content_version, auction.mode_id',
    E'begin\\n  if exists (\\n    select 1\\n    from private.auction_games auction\\n    join private.draft_room_trio_packages package on package.auction_id = auction.id\\n    where auction.id = new.auction_id\\n      and auction.mode_id in (''trio-nfl'', ''trio-cfb'')\\n      and package.item_reference = new.private_item_reference\\n  ) then\\n    return new;\\n  end if;\\n\\n  select auction.content_version, auction.mode_id'
  );
  if v_next = v_definition then raise exception 'Stage 13 deck validation contract drifted'; end if;
  execute v_next;

  -- Existing private-row round bounds stay authoritative; Trio adds its six-round ceiling.
  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next := replace(
    v_definition,
    E'case\\n        when v_auction.content_version = ''football-draft-room-2026-09-v6''',
    E'case\\n        when v_auction.mode_id in (''trio-nfl'', ''trio-cfb'') then 6\\n        when v_auction.content_version = ''football-draft-room-2026-09-v6'''
  );
  if v_next = v_definition then raise exception 'Stage 13 private-row round contract drifted'; end if;
  execute v_next;

  -- Trio needs exactly three selections while preserving the existing reserve-max calculation.
  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_required := case\\n    when p_game.content_version',
    E'v_required := case\\n    when p_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3\\n    when p_game.content_version'
  );
  if v_next = v_definition then raise exception 'Stage 13 bid contract drifted'; end if;
  execute v_next;

  -- The existing resolver owns ties, charging and the forced $1 remainder.
  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'v_required := case\\n    when v_game.content_version',
    E'v_required := case\\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 3\\n    when v_game.content_version'
  );
  v_next := replace(
    v_next,
    E'v_rounds := case\\n    when v_game.content_version',
    E'v_rounds := case\\n    when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then 6\\n    when v_game.content_version'
  );
  if v_next = v_definition then raise exception 'Stage 13 round-resolution contract drifted'; end if;
  execute v_next;

  -- Grade Trio through the private nine-player average before the legacy grader version switch.
  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'  if v_game.grading_version = ''grader-contract-v1'' then',
    E'  if v_game.mode_id in (''trio-nfl'', ''trio-cfb'')\\n    and v_game.grading_version = ''football-draft-room-trio-grading-2026-09-v1''\\n  then\\n    perform private.grade_draft_room_trio(p_auction_id);\\n    return;\\n  end if;\\n\\n  if v_game.grading_version = ''grader-contract-v1'' then'
  );
  if v_next = v_definition then raise exception 'Stage 13 grading contract drifted'; end if;
  execute v_next;

  -- Preparation keeps the public challenge game id shared, but pins Trio to its own catalog version.
  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'    ''build-qb'',\\n    ''build-qb-cfb''',
    E'    ''build-qb'',\\n    ''build-qb-cfb'',\\n    ''trio-nfl'',\\n    ''trio-cfb'''
  );
  v_next := replace(
    v_next,
    E'  if p_mode_id in (''build-qb'', ''build-qb-cfb'')\\n    and not private.draft_room_public_release_enabled()',
    E'  if p_mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'')\\n    and not private.draft_room_public_release_enabled()'
  );
  v_next := replace(v_next, 'v_game_id := private.auction_game_id_for_mode(p_mode_id);', 'v_game_id := private.auction_catalog_game_id_for_mode(p_mode_id);');
  v_next := replace(
    v_next,
    E'v_rounds := case\\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'')',
    E'v_rounds := case\\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 6\\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'')'
  );
  v_next := replace(
    v_next,
    E'v_bankroll := case\\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'')',
    E'v_bankroll := case\\n    when p_mode_id in (''trio-nfl'', ''trio-cfb'') then 30\\n    when p_mode_id in (''build-qb'', ''build-qb-cfb'')'
  );
  if v_next = v_definition then raise exception 'Stage 13 preparation contract drifted'; end if;
  execute v_next;

  -- Sending and subsequent bids remain the same shared Draft Room challenge lifecycle.
  v_definition := pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next := replace(v_definition, E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'');', E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');');
  v_next := replace(v_next, E'v_summary := case when v_is_draft then ''Build a QB'' else v_game.mode_id end;', E'v_summary := case\\n    when v_game.mode_id = ''trio-nfl'' then ''NFL QB / RB / WR Trio''\\n    when v_game.mode_id = ''trio-cfb'' then ''CFB QB / RB / WR Trio''\\n    when v_is_draft then ''Build a QB''\\n    else v_game.mode_id end;');
  v_next := replace(v_next, E'when v_is_draft then v_creator_name || '' challenged you to Build a QB.''', E'when v_game.mode_id in (''trio-nfl'', ''trio-cfb'') then v_creator_name || '' challenged you to QB / RB / WR Trio.''\\n    when v_is_draft then v_creator_name || '' challenged you to Build a QB.''');
  if v_next = v_definition then raise exception 'Stage 13 first-bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure);
  v_next := replace(v_definition, E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'');', E'v_is_draft := v_game.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');');
  if v_next = v_definition then raise exception 'Stage 13 submit-bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure);
  v_next := replace(v_definition, E'v_is_draft := v_auction.mode_id in (''build-qb'', ''build-qb-cfb'');', E'v_is_draft := v_auction.mode_id in (''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'');');
  if v_next = v_definition then raise exception 'Stage 13 decline-sync contract drifted'; end if;
  execute v_next;

  -- Participant projection gains Trio labels only; room profile, tier and grade data stay private.
  v_definition := pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'      left join private.auction_catalog catalog\\n        on catalog.content_version = auction.content_version\\n        and catalog.mode_id = auction.mode_id\\n        and catalog.item_reference = deck.private_item_reference',
    E'      left join private.auction_catalog catalog\\n        on catalog.content_version = auction.content_version\\n        and catalog.mode_id = auction.mode_id\\n        and catalog.item_reference = deck.private_item_reference\\n      left join private.draft_room_trio_packages trio\\n        on trio.auction_id = auction.id\\n        and trio.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    E'        join private.auction_catalog catalog\\n          on catalog.content_version = auction.content_version\\n          and catalog.mode_id = auction.mode_id\\n          and catalog.item_reference = deck.private_item_reference',
    E'        left join private.auction_catalog catalog\\n          on catalog.content_version = auction.content_version\\n          and catalog.mode_id = auction.mode_id\\n          and catalog.item_reference = deck.private_item_reference\\n        left join private.draft_room_trio_packages trio\\n          on trio.auction_id = auction.id\\n          and trio.item_reference = deck.private_item_reference'
  );
  v_next := replace(v_next, 'catalog.display_label', 'coalesce(catalog.display_label, trio.display_label)');
  v_next := replace(v_next, 'when catalog.item_reference is not null', 'when catalog.item_reference is not null or trio.item_reference is not null');
  if v_next = v_definition then raise exception 'Stage 13 participant projection contract drifted'; end if;
  execute v_next;
end;
$$;
