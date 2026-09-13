-- Stage 13 Trio competitive-model recalibration.
-- Board shape is randomized across several hidden archetypes. Most boards provide
-- meaningful quality separation, while a minority are intentionally compressed.
-- Player grades and the final nine-player average remain unchanged.

update private.auction_catalog_versions
set is_preparation_version = false
where game_id = 'draft-room-trio'
  and is_preparation_version;

insert into private.auction_catalog_versions (
  content_version,
  rarity_version,
  grading_version,
  is_preparation_version,
  game_id
) values (
  'football-draft-room-trio-2026-09-v2',
  'football-draft-room-trio-rarity-2026-09-v2',
  'football-draft-room-trio-grading-2026-09-v1',
  true,
  'draft-room-trio'
);

alter table private.draft_room_trio_packages
  drop constraint if exists draft_room_trio_packages_room_profile_check;

alter table private.draft_room_trio_packages
  add constraint draft_room_trio_packages_room_profile_check
  check (room_profile in (
    'Loaded',
    'Strong',
    'Balanced',
    'Gritty',
    'Wide',
    'TopHeavy',
    'BottomHeavy',
    'Compressed',
    'Chaotic'
  ));

create table private.draft_room_trio_board_shapes (
  shape text primary key check (shape in (
    'Wide',
    'Balanced',
    'TopHeavy',
    'BottomHeavy',
    'Compressed',
    'Chaotic'
  )),
  roll_start numeric(6,5) not null check (roll_start >= 0 and roll_start < 1),
  roll_end numeric(6,5) not null check (roll_end > 0 and roll_end <= 1),
  check (roll_start < roll_end),
  unique (roll_start),
  unique (roll_end)
);

insert into private.draft_room_trio_board_shapes (shape, roll_start, roll_end) values
  ('Wide',        0.00, 0.20),
  ('Balanced',    0.20, 0.44),
  ('TopHeavy',    0.44, 0.59),
  ('BottomHeavy', 0.59, 0.73),
  ('Compressed',  0.73, 0.85),
  ('Chaotic',     0.85, 1.00);

create table private.draft_room_trio_shape_slots (
  shape text not null references private.draft_room_trio_board_shapes(shape),
  variant integer not null check (variant between 1 and 3),
  strength_slot integer not null check (strength_slot between 1 and 6),
  tier_1 text not null check (tier_1 in ('Elite','Great','Good','Average')),
  tier_2 text not null check (tier_2 in ('Elite','Great','Good','Average')),
  tier_3 text not null check (tier_3 in ('Elite','Great','Good','Average')),
  primary key (shape, variant, strength_slot),
  check (not (tier_1 = 'Average' and tier_2 = 'Average' and tier_3 = 'Average'))
);

insert into private.draft_room_trio_shape_slots (
  shape, variant, strength_slot, tier_1, tier_2, tier_3
) values
  ('Wide', 1, 1, 'Elite', 'Elite', 'Elite'),
  ('Wide', 1, 2, 'Elite', 'Elite', 'Great'),
  ('Wide', 1, 3, 'Elite', 'Great', 'Great'),
  ('Wide', 1, 4, 'Great', 'Great', 'Good'),
  ('Wide', 1, 5, 'Good', 'Good', 'Average'),
  ('Wide', 1, 6, 'Good', 'Average', 'Average'),
  ('Wide', 2, 1, 'Elite', 'Elite', 'Elite'),
  ('Wide', 2, 2, 'Elite', 'Great', 'Good'),
  ('Wide', 2, 3, 'Great', 'Great', 'Good'),
  ('Wide', 2, 4, 'Great', 'Good', 'Good'),
  ('Wide', 2, 5, 'Good', 'Good', 'Average'),
  ('Wide', 2, 6, 'Good', 'Average', 'Average'),
  ('Wide', 3, 1, 'Elite', 'Elite', 'Great'),
  ('Wide', 3, 2, 'Elite', 'Great', 'Great'),
  ('Wide', 3, 3, 'Elite', 'Great', 'Good'),
  ('Wide', 3, 4, 'Great', 'Good', 'Good'),
  ('Wide', 3, 5, 'Good', 'Good', 'Average'),
  ('Wide', 3, 6, 'Good', 'Average', 'Average'),
  ('Balanced', 1, 1, 'Elite', 'Great', 'Great'),
  ('Balanced', 1, 2, 'Elite', 'Great', 'Good'),
  ('Balanced', 1, 3, 'Great', 'Great', 'Good'),
  ('Balanced', 1, 4, 'Great', 'Good', 'Good'),
  ('Balanced', 1, 5, 'Good', 'Good', 'Average'),
  ('Balanced', 1, 6, 'Good', 'Average', 'Average'),
  ('Balanced', 2, 1, 'Elite', 'Elite', 'Great'),
  ('Balanced', 2, 2, 'Great', 'Great', 'Good'),
  ('Balanced', 2, 3, 'Great', 'Good', 'Good'),
  ('Balanced', 2, 4, 'Good', 'Good', 'Good'),
  ('Balanced', 2, 5, 'Good', 'Good', 'Average'),
  ('Balanced', 2, 6, 'Good', 'Average', 'Average'),
  ('Balanced', 3, 1, 'Elite', 'Great', 'Great'),
  ('Balanced', 3, 2, 'Great', 'Great', 'Good'),
  ('Balanced', 3, 3, 'Great', 'Good', 'Good'),
  ('Balanced', 3, 4, 'Great', 'Good', 'Average'),
  ('Balanced', 3, 5, 'Good', 'Good', 'Average'),
  ('Balanced', 3, 6, 'Good', 'Average', 'Average'),
  ('TopHeavy', 1, 1, 'Elite', 'Elite', 'Elite'),
  ('TopHeavy', 1, 2, 'Elite', 'Elite', 'Great'),
  ('TopHeavy', 1, 3, 'Elite', 'Great', 'Great'),
  ('TopHeavy', 1, 4, 'Great', 'Great', 'Great'),
  ('TopHeavy', 1, 5, 'Great', 'Good', 'Average'),
  ('TopHeavy', 1, 6, 'Good', 'Average', 'Average'),
  ('TopHeavy', 2, 1, 'Elite', 'Elite', 'Elite'),
  ('TopHeavy', 2, 2, 'Elite', 'Elite', 'Great'),
  ('TopHeavy', 2, 3, 'Elite', 'Great', 'Good'),
  ('TopHeavy', 2, 4, 'Great', 'Great', 'Good'),
  ('TopHeavy', 2, 5, 'Great', 'Good', 'Average'),
  ('TopHeavy', 2, 6, 'Good', 'Good', 'Average'),
  ('TopHeavy', 3, 1, 'Elite', 'Elite', 'Great'),
  ('TopHeavy', 3, 2, 'Elite', 'Great', 'Great'),
  ('TopHeavy', 3, 3, 'Great', 'Great', 'Good'),
  ('TopHeavy', 3, 4, 'Great', 'Great', 'Great'),
  ('TopHeavy', 3, 5, 'Good', 'Good', 'Average'),
  ('TopHeavy', 3, 6, 'Good', 'Average', 'Average'),
  ('BottomHeavy', 1, 1, 'Elite', 'Elite', 'Great'),
  ('BottomHeavy', 1, 2, 'Great', 'Great', 'Good'),
  ('BottomHeavy', 1, 3, 'Great', 'Good', 'Good'),
  ('BottomHeavy', 1, 4, 'Good', 'Good', 'Good'),
  ('BottomHeavy', 1, 5, 'Good', 'Good', 'Average'),
  ('BottomHeavy', 1, 6, 'Good', 'Average', 'Average'),
  ('BottomHeavy', 2, 1, 'Elite', 'Great', 'Great'),
  ('BottomHeavy', 2, 2, 'Great', 'Great', 'Good'),
  ('BottomHeavy', 2, 3, 'Great', 'Good', 'Good'),
  ('BottomHeavy', 2, 4, 'Good', 'Good', 'Good'),
  ('BottomHeavy', 2, 5, 'Good', 'Good', 'Average'),
  ('BottomHeavy', 2, 6, 'Good', 'Average', 'Average'),
  ('BottomHeavy', 3, 1, 'Elite', 'Great', 'Good'),
  ('BottomHeavy', 3, 2, 'Great', 'Great', 'Good'),
  ('BottomHeavy', 3, 3, 'Great', 'Good', 'Good'),
  ('BottomHeavy', 3, 4, 'Good', 'Good', 'Good'),
  ('BottomHeavy', 3, 5, 'Great', 'Good', 'Average'),
  ('BottomHeavy', 3, 6, 'Good', 'Average', 'Average'),
  ('Compressed', 1, 1, 'Great', 'Great', 'Good'),
  ('Compressed', 1, 2, 'Great', 'Good', 'Good'),
  ('Compressed', 1, 3, 'Good', 'Good', 'Good'),
  ('Compressed', 1, 4, 'Great', 'Good', 'Average'),
  ('Compressed', 1, 5, 'Good', 'Good', 'Average'),
  ('Compressed', 1, 6, 'Good', 'Good', 'Good'),
  ('Compressed', 2, 1, 'Elite', 'Great', 'Good'),
  ('Compressed', 2, 2, 'Great', 'Great', 'Good'),
  ('Compressed', 2, 3, 'Great', 'Good', 'Good'),
  ('Compressed', 2, 4, 'Good', 'Good', 'Good'),
  ('Compressed', 2, 5, 'Great', 'Good', 'Average'),
  ('Compressed', 2, 6, 'Good', 'Good', 'Average'),
  ('Compressed', 3, 1, 'Great', 'Great', 'Good'),
  ('Compressed', 3, 2, 'Great', 'Good', 'Good'),
  ('Compressed', 3, 3, 'Great', 'Good', 'Good'),
  ('Compressed', 3, 4, 'Good', 'Good', 'Good'),
  ('Compressed', 3, 5, 'Great', 'Good', 'Average'),
  ('Compressed', 3, 6, 'Good', 'Good', 'Average'),
  ('Chaotic', 1, 1, 'Elite', 'Elite', 'Elite'),
  ('Chaotic', 1, 2, 'Elite', 'Great', 'Good'),
  ('Chaotic', 1, 3, 'Great', 'Great', 'Good'),
  ('Chaotic', 1, 4, 'Great', 'Good', 'Average'),
  ('Chaotic', 1, 5, 'Good', 'Good', 'Average'),
  ('Chaotic', 1, 6, 'Good', 'Average', 'Average'),
  ('Chaotic', 2, 1, 'Elite', 'Elite', 'Great'),
  ('Chaotic', 2, 2, 'Elite', 'Great', 'Great'),
  ('Chaotic', 2, 3, 'Great', 'Good', 'Good'),
  ('Chaotic', 2, 4, 'Good', 'Good', 'Average'),
  ('Chaotic', 2, 5, 'Good', 'Good', 'Good'),
  ('Chaotic', 2, 6, 'Good', 'Average', 'Average'),
  ('Chaotic', 3, 1, 'Elite', 'Elite', 'Elite'),
  ('Chaotic', 3, 2, 'Great', 'Great', 'Good'),
  ('Chaotic', 3, 3, 'Elite', 'Great', 'Great'),
  ('Chaotic', 3, 4, 'Good', 'Good', 'Average'),
  ('Chaotic', 3, 5, 'Great', 'Good', 'Average'),
  ('Chaotic', 3, 6, 'Good', 'Average', 'Average');

revoke all on private.draft_room_trio_board_shapes from public, anon, authenticated;
revoke all on private.draft_room_trio_shape_slots from public, anon, authenticated;

create or replace function private.draft_room_trio_board_shape(p_roll double precision)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_shape text;
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Trio board-shape roll must be in [0,1)';
  end if;

  select shape.shape
  into v_shape
  from private.draft_room_trio_board_shapes shape
  where p_roll >= shape.roll_start
    and p_roll < shape.roll_end
  order by shape.roll_start
  limit 1;

  if v_shape is null then
    raise exception 'Trio board-shape configuration does not cover roll %', p_roll;
  end if;

  return v_shape;
end;
$$;

create or replace function private.draft_room_trio_shape_variant(p_roll double precision)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Trio shape-variant roll must be in [0,1)';
  end if;

  return floor(p_roll * 3)::integer + 1;
end;
$$;

create or replace function private.draft_room_trio_shape_combo(
  p_shape text,
  p_variant integer,
  p_slot integer
)
returns text[]
language plpgsql
stable
set search_path = ''
as $$
declare
  v_combo text[];
begin
  select array[slot.tier_1, slot.tier_2, slot.tier_3]
  into v_combo
  from private.draft_room_trio_shape_slots slot
  where slot.shape = p_shape
    and slot.variant = p_variant
    and slot.strength_slot = p_slot;

  if v_combo is null then
    raise exception 'Unknown Trio shape slot: shape=%, variant=%, slot=%', p_shape, p_variant, p_slot;
  end if;

  return v_combo;
end;
$$;

revoke all on function private.draft_room_trio_board_shape(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_trio_shape_variant(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_trio_shape_combo(text,integer,integer) from public, anon, authenticated;

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
  v_shape text;
  v_variant integer;
  v_combo text[];
  v_permutation integer;
  v_qb_tier text;
  v_rb_tier text;
  v_wr_tier text;
  v_qb private.draft_room_trio_player_pool;
  v_rb private.draft_room_trio_player_pool;
  v_wr private.draft_room_trio_player_pool;
  v_position integer;
  v_strength_slot integer;
  v_slot_order integer[];
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

  v_shape := private.draft_room_trio_board_shape(random());
  v_variant := private.draft_room_trio_shape_variant(random());

  select array_agg(slot order by random())
  into v_slot_order
  from generate_series(1, 6) slot;

  if array_length(v_slot_order, 1) <> 6 then
    raise exception 'Draft Room Trio strength-slot shuffle failed';
  end if;

  for v_position in 1..6 loop
    v_strength_slot := v_slot_order[v_position];
    v_combo := private.draft_room_trio_shape_combo(v_shape, v_variant, v_strength_slot);
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
      p_auction_id, v_position, v_item_reference, v_shape,
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
    raise exception 'Draft Room Trio board shape drifted within one game';
  end if;
end;
$$;

revoke all on function private.generate_draft_room_trio_deck(uuid,text) from public, anon, authenticated;

do $$
begin
  if (select count(*) from private.draft_room_trio_board_shapes) <> 6 then
    raise exception 'Trio v2 must define exactly six board shapes';
  end if;

  if (select sum(roll_end - roll_start) from private.draft_room_trio_board_shapes) <> 1 then
    raise exception 'Trio v2 board-shape weights must cover exactly 100 percent';
  end if;

  if exists (
    select 1
    from (
      select shape, variant, count(*) as slot_count
      from private.draft_room_trio_shape_slots
      group by shape, variant
    ) configured
    where configured.slot_count <> 6
  ) then
    raise exception 'Every Trio v2 board-shape variant must define six slots';
  end if;

  if (select count(*) from private.draft_room_trio_shape_slots) <> 108 then
    raise exception 'Trio v2 must define 18 six-slot board variants';
  end if;
end;
$$;
