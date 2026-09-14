-- Stage 16: Dallas Cowboys Since 2007.
-- Reuses the existing server-owned sealed-bid Draft Room architecture.
-- Player grades are Dallas-only value from 2007 forward and remain private.

alter table private.auction_catalog_versions
  drop constraint auction_catalog_versions_game_id_check;

alter table private.auction_catalog_versions
  add constraint auction_catalog_versions_game_id_check
  check (game_id in (
    'auction',
    'draft-room',
    'draft-room-trio',
    'draft-room-longhorns',
    'draft-room-longhorn-teams',
    'draft-room-cowboys'
  ));

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_mode_id in (
      'build-qb',
      'build-qb-cfb',
      'trio-nfl',
      'trio-cfb',
      'longhorns-2005',
      'longhorns-teams-2005',
      'cowboys-2007'
    ) then 'draft-room'
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
    when p_mode_id = 'longhorns-teams-2005' then 'draft-room-longhorn-teams'
    when p_mode_id = 'cowboys-2007' then 'draft-room-cowboys'
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
  'football-draft-room-cowboys-2007-2026-09-v1',
  'football-draft-room-cowboys-2007-board-2026-09-v1',
  'football-draft-room-cowboys-2007-grading-2026-09-v1',
  true,
  'draft-room-cowboys'
);

create table private.draft_room_cowboys_player_pool (
  player_reference text primary key,
  display_name text not null unique,
  position_group text not null,
  hidden_grade numeric(5,2) not null check (hidden_grade between 78 and 99),
  grade_band text not null check (grade_band in ('Icon','Elite','Star','Strong','Core','Wildcard')),
  check (
    (grade_band = 'Icon' and hidden_grade between 96 and 99)
    or (grade_band = 'Elite' and hidden_grade between 93 and 95)
    or (grade_band = 'Star' and hidden_grade between 90 and 92)
    or (grade_band = 'Strong' and hidden_grade between 87 and 89)
    or (grade_band = 'Core' and hidden_grade between 83 and 86)
    or (grade_band = 'Wildcard' and hidden_grade between 78 and 82)
  )
);

with raw as (
  select line, ordinality
  from regexp_split_to_table($cowboys$QB|Tony Romo|94
QB|Dak Prescott|94
QB|Jon Kitna|79
QB|Cooper Rush|80
RB|Marion Barber III|88
RB|Felix Jones|82
RB|Tashard Choice|78
RB|DeMarco Murray|94
RB|Darren McFadden|81
RB|Ezekiel Elliott|96
RB|Tony Pollard|87
RB|Rico Dowdle|81
WR|Terrell Owens|92
WR|Patrick Crayton|83
WR|Miles Austin|89
WR|Dez Bryant|94
WR|Cole Beasley|85
WR|Terrance Williams|82
WR|Amari Cooper|89
WR|Michael Gallup|82
WR|CeeDee Lamb|96
WR|KaVontae Turpin|87
TE|Jason Witten|98
TE|Martellus Bennett|79
TE|Dalton Schultz|85
TE|Jake Ferguson|86
OL|Flozell Adams|89
OL|Andre Gurode|91
OL|Leonard Davis|90
OL|Marc Colombo|84
OL|Doug Free|86
OL|Tyron Smith|98
OL|Travis Frederick|95
OL|Zack Martin|99
OL|La'el Collins|85
OL|Connor Williams|81
OL|Tyler Smith|92
DL/EDGE|DeMarcus Ware|99
DL/EDGE|Greg Ellis|85
DL/EDGE|Jay Ratliff|93
DL/EDGE|Marcus Spears|81
DL/EDGE|Anthony Spencer|86
DL/EDGE|DeMarcus Lawrence|91
DL/EDGE|Randy Gregory|80
DL/EDGE|Robert Quinn|83
DL/EDGE|Micah Parsons|96
LB|Sean Lee|91
LB|Rolando McClain|81
LB|Anthony Hitchens|82
LB|Jaylon Smith|84
LB|Leighton Vander Esch|85
DB|Terence Newman|89
DB|Roy Williams|80
DB|Ken Hamlin|84
DB|Mike Jenkins|83
DB|Orlando Scandrick|84
DB|Brandon Carr|84
DB|Morris Claiborne|79
DB|Barry Church|83
DB|Byron Jones|87
DB|Jourdan Lewis|84
DB|Trevon Diggs|89
DB|DaRon Bland|89
DB|Donovan Wilson|83
DB|Malik Hooker|84
ST|Nick Folk|81
ST|Dan Bailey|90
ST|Bryan Anger|86
ST|Brandon Aubrey|93
$cowboys$, E'\n') with ordinality as split(line, ordinality)
  where line <> ''
),
parsed as (
  select
    ordinality,
    split_part(line, '|', 1) as position_group,
    split_part(line, '|', 2) as display_name,
    split_part(line, '|', 3)::numeric as hidden_grade
  from raw
)
insert into private.draft_room_cowboys_player_pool (
  player_reference,
  display_name,
  position_group,
  hidden_grade,
  grade_band
)
select
  'cowboys-2007-' || lpad(ordinality::text, 3, '0'),
  display_name,
  position_group,
  hidden_grade,
  case
    when hidden_grade >= 96 then 'Icon'
    when hidden_grade >= 93 then 'Elite'
    when hidden_grade >= 90 then 'Star'
    when hidden_grade >= 87 then 'Strong'
    when hidden_grade >= 83 then 'Core'
    else 'Wildcard'
  end
from parsed
order by ordinality;

create table private.draft_room_cowboys_board_shapes (
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

insert into private.draft_room_cowboys_board_shapes (shape, roll_start, roll_end) values
  ('Wide',        0.00, 0.20),
  ('Balanced',    0.20, 0.44),
  ('TopHeavy',    0.44, 0.58),
  ('BottomHeavy', 0.58, 0.72),
  ('Compressed',  0.72, 0.84),
  ('Chaotic',     0.84, 1.00);

create table private.draft_room_cowboys_board_variants (
  shape text not null references private.draft_room_cowboys_board_shapes(shape),
  variant integer not null check (variant between 1 and 4),
  grade_bands text[] not null check (cardinality(grade_bands) = 8),
  primary key (shape, variant),
  check (grade_bands <@ array['Icon','Elite','Star','Strong','Core','Wildcard']::text[])
);

insert into private.draft_room_cowboys_board_variants (shape, variant, grade_bands) values
  ('Wide', 1, array['Icon','Icon','Elite','Star','Strong','Core','Wildcard','Wildcard']),
  ('Wide', 2, array['Icon','Elite','Elite','Star','Strong','Strong','Core','Wildcard']),
  ('Wide', 3, array['Icon','Icon','Elite','Star','Strong','Strong','Core','Core']),
  ('Wide', 4, array['Icon','Elite','Star','Star','Strong','Core','Core','Wildcard']),

  ('Balanced', 1, array['Elite','Elite','Star','Star','Strong','Strong','Core','Core']),
  ('Balanced', 2, array['Icon','Elite','Star','Star','Strong','Strong','Core','Core']),
  ('Balanced', 3, array['Elite','Star','Star','Star','Strong','Strong','Core','Core']),
  ('Balanced', 4, array['Elite','Elite','Star','Strong','Strong','Core','Core','Core']),

  ('TopHeavy', 1, array['Icon','Icon','Elite','Elite','Star','Strong','Core','Wildcard']),
  ('TopHeavy', 2, array['Icon','Icon','Icon','Elite','Star','Strong','Strong','Core']),
  ('TopHeavy', 3, array['Icon','Elite','Elite','Elite','Star','Strong','Core','Core']),
  ('TopHeavy', 4, array['Icon','Icon','Elite','Elite','Star','Star','Strong','Core']),

  ('BottomHeavy', 1, array['Elite','Star','Strong','Strong','Core','Core','Wildcard','Wildcard']),
  ('BottomHeavy', 2, array['Star','Star','Strong','Core','Core','Core','Wildcard','Wildcard']),
  ('BottomHeavy', 3, array['Elite','Strong','Strong','Core','Core','Core','Wildcard','Wildcard']),
  ('BottomHeavy', 4, array['Star','Strong','Strong','Core','Core','Core','Wildcard','Wildcard']),

  ('Compressed', 1, array['Strong','Strong','Strong','Strong','Core','Core','Core','Core']),
  ('Compressed', 2, array['Strong','Strong','Strong','Strong','Strong','Core','Core','Core']),
  ('Compressed', 3, array['Star','Strong','Strong','Strong','Core','Core','Core','Core']),
  ('Compressed', 4, array['Star','Strong','Strong','Strong','Strong','Core','Core','Core']),

  ('Chaotic', 1, array['Icon','Elite','Star','Strong','Core','Core','Wildcard','Wildcard']),
  ('Chaotic', 2, array['Icon','Icon','Star','Strong','Strong','Core','Core','Wildcard']),
  ('Chaotic', 3, array['Icon','Elite','Elite','Star','Strong','Core','Core','Wildcard']),
  ('Chaotic', 4, array['Elite','Star','Strong','Strong','Core','Core','Wildcard','Wildcard']);

create or replace function private.draft_room_cowboys_board_shape(p_roll double precision)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_shape text;
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Cowboys board-shape roll must be in [0,1)';
  end if;

  select shape.shape into v_shape
  from private.draft_room_cowboys_board_shapes shape
  where p_roll >= shape.roll_start
    and p_roll < shape.roll_end
  order by shape.roll_start
  limit 1;

  if v_shape is null then
    raise exception 'Cowboys board-shape configuration does not cover roll %', p_roll;
  end if;

  return v_shape;
end;
$$;

create or replace function private.draft_room_cowboys_board_variant(p_roll double precision)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Cowboys board-variant roll must be in [0,1)';
  end if;

  return floor(p_roll * 4)::integer + 1;
end;
$$;

create or replace function private.draft_room_cowboys_grade_band(
  p_shape text,
  p_variant integer,
  p_slot integer
)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_bands text[];
begin
  if p_slot not between 1 and 8 then
    raise exception 'Cowboys board slot must be between 1 and 8';
  end if;

  select variant.grade_bands into v_bands
  from private.draft_room_cowboys_board_variants variant
  where variant.shape = p_shape
    and variant.variant = p_variant;

  if v_bands is null then
    raise exception 'Unknown Cowboys board variant: shape=%, variant=%', p_shape, p_variant;
  end if;

  return v_bands[p_slot];
end;
$$;

create or replace function private.protect_draft_room_cowboys_calibration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Cowboys Since 2007 calibration records are immutable';
end;
$$;

create trigger draft_room_cowboys_player_pool_immutable
before update or delete on private.draft_room_cowboys_player_pool
for each row execute function private.protect_draft_room_cowboys_calibration();

create trigger draft_room_cowboys_board_shapes_immutable
before update or delete on private.draft_room_cowboys_board_shapes
for each row execute function private.protect_draft_room_cowboys_calibration();

create trigger draft_room_cowboys_board_variants_immutable
before update or delete on private.draft_room_cowboys_board_variants
for each row execute function private.protect_draft_room_cowboys_calibration();

create table private.draft_room_cowboys_board_entries (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position between 1 and 8),
  item_reference text not null,
  board_shape text not null check (board_shape in ('Wide','Balanced','TopHeavy','BottomHeavy','Compressed','Chaotic')),
  board_variant integer not null check (board_variant between 1 and 4),
  strength_slot integer not null check (strength_slot between 1 and 8),
  player_reference text not null references private.draft_room_cowboys_player_pool(player_reference),
  display_name text not null,
  position_group text not null,
  grade_band text not null check (grade_band in ('Icon','Elite','Star','Strong','Core','Wildcard')),
  primary key (auction_id, deck_position),
  unique (auction_id, item_reference),
  unique (auction_id, player_reference),
  unique (auction_id, strength_slot)
);

create or replace function private.protect_draft_room_cowboys_board_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
    and not exists (
      select 1 from private.auction_games auction where auction.id = old.auction_id
    )
  then
    return old;
  end if;

  raise exception 'Cowboys Since 2007 board entries are immutable';
end;
$$;

create trigger draft_room_cowboys_board_entries_immutable
before update or delete on private.draft_room_cowboys_board_entries
for each row execute function private.protect_draft_room_cowboys_board_entry();

revoke all on private.draft_room_cowboys_player_pool from public, anon, authenticated;
revoke all on private.draft_room_cowboys_board_shapes from public, anon, authenticated;
revoke all on private.draft_room_cowboys_board_variants from public, anon, authenticated;
revoke all on private.draft_room_cowboys_board_entries from public, anon, authenticated;
revoke all on function private.draft_room_cowboys_board_shape(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_cowboys_board_variant(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_cowboys_grade_band(text,integer,integer) from public, anon, authenticated;
revoke all on function private.protect_draft_room_cowboys_calibration() from public, anon, authenticated;
revoke all on function private.protect_draft_room_cowboys_board_entry() from public, anon, authenticated;

create or replace function private.generate_draft_room_cowboys_deck(p_auction_id uuid)
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
  v_player private.draft_room_cowboys_player_pool;
  v_item_reference text;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.mode_id <> 'cowboys-2007' then
    raise exception 'Cowboys deck generation requires a matching Draft Room game';
  end if;

  if exists (
    select 1 from private.auction_deck_entries deck where deck.auction_id = p_auction_id
  ) or exists (
    select 1 from private.draft_room_cowboys_board_entries entry where entry.auction_id = p_auction_id
  ) then
    raise exception 'Cowboys Since 2007 deck is already fixed';
  end if;

  v_shape := private.draft_room_cowboys_board_shape(random());
  v_variant := private.draft_room_cowboys_board_variant(random());

  select array_agg(slot order by random())
  into v_slot_order
  from generate_series(1, 8) slot;

  if array_length(v_slot_order, 1) <> 8 then
    raise exception 'Cowboys strength-slot shuffle failed';
  end if;

  for v_position in 1..8 loop
    v_strength_slot := v_slot_order[v_position];
    v_grade_band := private.draft_room_cowboys_grade_band(v_shape, v_variant, v_strength_slot);

    select player.* into v_player
    from private.draft_room_cowboys_player_pool player
    where player.grade_band = v_grade_band
      and not exists (
        select 1
        from private.draft_room_cowboys_board_entries entry
        where entry.auction_id = p_auction_id
          and entry.player_reference = player.player_reference
      )
    order by random(), player.player_reference
    limit 1;

    if v_player.player_reference is null then
      raise exception 'Cowboys board generation underfilled grade band %', v_grade_band;
    end if;

    v_item_reference := 'cowboy-' || v_position::text;

    insert into private.draft_room_cowboys_board_entries (
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
    select count(*) from private.draft_room_cowboys_board_entries entry
    where entry.auction_id = p_auction_id
  ) <> 8
    or (
      select count(distinct entry.player_reference)
      from private.draft_room_cowboys_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 8
    or (
      select count(distinct entry.board_shape)
      from private.draft_room_cowboys_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 1
    or (
      select count(distinct entry.board_variant)
      from private.draft_room_cowboys_board_entries entry
      where entry.auction_id = p_auction_id
    ) <> 1
  then
    raise exception 'Cowboys Since 2007 board generation drifted from the eight-player contract';
  end if;
end;
$$;

revoke all on function private.generate_draft_room_cowboys_deck(uuid) from public, anon, authenticated;

create or replace function private.grade_draft_room_cowboys(p_auction_id uuid)
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
    or v_game.mode_id <> 'cowboys-2007'
    or v_game.grading_version <> 'football-draft-room-cowboys-2007-grading-2026-09-v1'
  then
    raise exception 'Cowboys Since 2007 grading boundary is invalid';
  end if;

  select count(*), round(avg(player.hidden_grade), 2)
  into v_challenger_count, v_challenger_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_cowboys_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_cowboys_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.challenger_id;

  select count(*), round(avg(player.hidden_grade), 2)
  into v_recipient_count, v_recipient_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_cowboys_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_cowboys_player_pool player
    on player.player_reference = entry.player_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 4
    or v_recipient_count <> 4
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'Cowboys Since 2007 grading inputs are incomplete or invalid';
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

revoke all on function private.grade_draft_room_cowboys(uuid) from public, anon, authenticated;

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
    'longhorns-2005',
    'longhorns-teams-2005',
    'cowboys-2007'
  )),
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 6
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007') then 8
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
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007') then 4
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
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007') then 4
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
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007') then 40
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
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007') then 40
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
  v_definition := pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\n  if p_mode_id = ''longhorns-teams-2005'' then',
    E'begin\n  if p_mode_id = ''cowboys-2007'' then\n    if p_count <> 8 then raise exception ''Cowboys Since 2007 deck must contain eight players''; end if;\n    if p_random_order is not null then raise exception ''Injected Auction random order is unavailable for Cowboys rooms''; end if;\n    perform private.generate_draft_room_cowboys_deck(p_auction_id);\n    return;\n  end if;\n\n  if p_mode_id = ''longhorns-teams-2005'' then'
  );
  if v_next = v_definition then raise exception 'Cowboys generator contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_longhorn_teams_board_entries team on team.auction_id = auction.id',
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cowboys_board_entries cowboy on cowboy.auction_id = auction.id\n    where auction.id = new.auction_id\n      and auction.mode_id = ''cowboys-2007''\n      and cowboy.item_reference = new.private_item_reference\n  ) then\n    return new;\n  end if;\n\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_longhorn_teams_board_entries team on team.auction_id = auction.id'
  );
  if v_next = v_definition then raise exception 'Cowboys deck validation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next := replace(
    v_definition,
    E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',
    E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8'
  );
  if v_next = v_definition then raise exception 'Cowboys private-row round contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 4',
    E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 4'
  );
  if v_next = v_definition then raise exception 'Cowboys bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 4',
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 4'
  );
  v_next := replace(
    v_next,
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8'
  );
  if v_next = v_definition then raise exception 'Cowboys round-resolution contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'  if v_game.mode_id = ''longhorns-teams-2005''',
    E'  if v_game.mode_id = ''cowboys-2007''\n    and v_game.grading_version = ''football-draft-room-cowboys-2007-grading-2026-09-v1''\n  then\n    perform private.grade_draft_room_cowboys(p_auction_id);\n    return;\n  end if;\n\n  if v_game.mode_id = ''longhorns-teams-2005'''
  );
  if v_next = v_definition then raise exception 'Cowboys grading contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'    ''longhorns-2005'',\n    ''longhorns-teams-2005''',
    E'    ''longhorns-2005'',\n    ''longhorns-teams-2005'',\n    ''cowboys-2007'''
  );
  v_next := replace(
    v_next,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')'
  );
  v_next := replace(
    v_next,
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 8',
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8'
  );
  v_next := replace(
    v_next,
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'') then 40',
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 40'
  );
  if v_next = v_definition then raise exception 'Cowboys preparation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')'
  );
  v_next := replace(
    v_next,
    E'    when v_game.mode_id = ''longhorns-teams-2005'' then ''Longhorns Teams Since 2005''',
    E'    when v_game.mode_id = ''longhorns-teams-2005'' then ''Longhorns Teams Since 2005''\n    when v_game.mode_id = ''cowboys-2007'' then ''Cowboys Since 2007'''
  );
  v_next := replace(
    v_next,
    E'when v_game.mode_id = ''longhorns-teams-2005'' then v_creator_name || '' challenged you to Longhorns Teams Since 2005.''',
    E'when v_game.mode_id = ''longhorns-teams-2005'' then v_creator_name || '' challenged you to Longhorns Teams Since 2005.''\n    when v_game.mode_id = ''cowboys-2007'' then v_creator_name || '' challenged you to Cowboys Since 2007.'''
  );
  if v_next = v_definition then raise exception 'Cowboys first-bid notification contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')'
  );
  if v_next = v_definition then raise exception 'Cowboys submit-bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')'
  );
  if v_next = v_definition then raise exception 'Cowboys decline-sync contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.cancel_auction(uuid,bigint)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')'
  );
  if v_next = v_definition then raise exception 'Cowboys cancellation routing contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'      left join private.draft_room_longhorn_teams_board_entries longhorn_team\n        on longhorn_team.auction_id = auction.id\n        and longhorn_team.item_reference = deck.private_item_reference',
    E'      left join private.draft_room_longhorn_teams_board_entries longhorn_team\n        on longhorn_team.auction_id = auction.id\n        and longhorn_team.item_reference = deck.private_item_reference\n      left join private.draft_room_cowboys_board_entries cowboy\n        on cowboy.auction_id = auction.id\n        and cowboy.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    E'        left join private.draft_room_longhorn_teams_board_entries longhorn_team\n          on longhorn_team.auction_id = auction.id\n          and longhorn_team.item_reference = deck.private_item_reference',
    E'        left join private.draft_room_longhorn_teams_board_entries longhorn_team\n          on longhorn_team.auction_id = auction.id\n          and longhorn_team.item_reference = deck.private_item_reference\n        left join private.draft_room_cowboys_board_entries cowboy\n          on cowboy.auction_id = auction.id\n          and cowboy.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label)',
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name)'
  );
  v_next := replace(
    v_next,
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null',
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null'
  );
  if v_next = v_definition then raise exception 'Cowboys participant projection contract drifted'; end if;
  execute v_next;
end;
$$;

do $$
begin
  if (select count(*) from private.draft_room_cowboys_player_pool) <> 69 then
    raise exception 'Cowboys Since 2007 must contain exactly 69 approved players';
  end if;

  if (
    select jsonb_object_agg(grade_band, player_count)
    from (
      select grade_band, count(*) player_count
      from private.draft_room_cowboys_player_pool
      group by grade_band
    ) counts
  ) <> '{"Core":21,"Elite":7,"Icon":7,"Star":7,"Strong":10,"Wildcard":17}'::jsonb then
    raise exception 'Cowboys Since 2007 grade-band distribution drifted';
  end if;

  if (select count(*) from private.draft_room_cowboys_board_shapes) <> 6
    or (select count(*) from private.draft_room_cowboys_board_variants) <> 24
  then
    raise exception 'Cowboys board calibration must define six shapes and 24 variants';
  end if;

  if (select sum(roll_end - roll_start) from private.draft_room_cowboys_board_shapes) <> 1 then
    raise exception 'Cowboys board-shape weights must cover exactly 100 percent';
  end if;
end;
$$;
