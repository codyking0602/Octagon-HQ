-- Longhorns Since 2005 calibration foundation.
-- This intentionally does not expose or route the mode yet. It locks the approved
-- 64-player Texas-only value curve and the randomized 8-player board model that a
-- later wiring PR can reuse on the existing sealed-bid Draft Room architecture.

create table private.draft_room_longhorns_player_pool (
  player_reference text primary key,
  display_name text not null unique,
  position_group text not null,
  hidden_grade numeric(5,2) not null check (hidden_grade between 83 and 99),
  grade_band text not null check (grade_band in ('Icon','Elite','Star','Strong','Core')),
  check (
    (grade_band = 'Icon' and hidden_grade between 96 and 99)
    or (grade_band = 'Elite' and hidden_grade between 93 and 95)
    or (grade_band = 'Star' and hidden_grade between 90 and 92)
    or (grade_band = 'Strong' and hidden_grade between 87 and 89)
    or (grade_band = 'Core' and hidden_grade between 83 and 86)
  )
);

with raw as (
  select line, ordinality
  from regexp_split_to_table($longhorns$
QB|Vince Young|99
QB|Colt McCoy|98
QB|Sam Ehlinger|89
QB|Quinn Ewers|90
QB|Shane Buechele|84
QB|David Ash|83
RB|Jamaal Charles|94
RB|Bijan Robinson|97
RB|D'Onta Foreman|96
RB|Jonathon Brooks|88
RB|Roschon Johnson|85
RB|Tre Wisner|87
WR|Jordan Shipley|95
WR|Quan Cosby|91
WR|Limas Sweed|87
WR|Marquise Goodwin|84
WR|Mike Davis|86
WR|Devin Duvernay|91
WR|Lil'Jordan Humphrey|87
WR|Xavier Worthy|93
WR|Adonai Mitchell|87
WR|Matthew Golden|87
TE|Ja'Tavion Sanders|89
TE|Gunnar Helm|87
OL|Justin Blalock|95
OL|Kasey Studdard|88
OL|Tony Hills|85
OL|Connor Williams|92
OL|Sam Cosmi|90
OL|Kelvin Banks Jr.|97
OL|Jake Majors|84
DL/EDGE|Brian Orakpo|98
DL/EDGE|Sergio Kindle|94
DL/EDGE|Lamarr Houston|90
DL/EDGE|Sam Acho|91
DL/EDGE|Alex Okafor|92
DL/EDGE|Jackson Jeffcoat|95
DL/EDGE|Malcom Brown|94
DL/EDGE|Poona Ford|89
DL/EDGE|Charles Omenihu|89
DL/EDGE|Joseph Ossai|90
DL/EDGE|T'Vondre Sweat|96
DL/EDGE|Byron Murphy II|91
DL/EDGE|Alfred Collins|92
LB|Roddrick Muckelroy|89
LB|Emmanuel Acho|86
LB|Jordan Hicks|89
LB|Malik Jefferson|89
LB|Gary Johnson|85
LB|Jaylan Ford|93
LB|Anthony Hill Jr.|94
DB|Michael Huff|96
DB|Aaron Ross|95
DB|Michael Griffin|92
DB|Earl Thomas|94
DB|Quandre Diggs|89
DB|Kenny Vaccaro|91
DB|DeShon Elliott|94
DB|Brandon Jones|86
DB|Caden Sterns|88
DB|Jahdae Barron|96
ST|Justin Tucker|88
ST|Michael Dickson|96
ST|Cameron Dicker|87
$longhorns$, E'\n') with ordinality as split(line, ordinality)
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
insert into private.draft_room_longhorns_player_pool (
  player_reference,
  display_name,
  position_group,
  hidden_grade,
  grade_band
)
select
  'longhorns-2005-' || lpad(ordinality::text, 3, '0'),
  display_name,
  position_group,
  hidden_grade,
  case
    when hidden_grade >= 96 then 'Icon'
    when hidden_grade >= 93 then 'Elite'
    when hidden_grade >= 90 then 'Star'
    when hidden_grade >= 87 then 'Strong'
    else 'Core'
  end
from parsed
order by ordinality;

create table private.draft_room_longhorns_board_shapes (
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

insert into private.draft_room_longhorns_board_shapes (shape, roll_start, roll_end) values
  ('Wide',        0.00, 0.20),
  ('Balanced',    0.20, 0.44),
  ('TopHeavy',    0.44, 0.58),
  ('BottomHeavy', 0.58, 0.72),
  ('Compressed',  0.72, 0.84),
  ('Chaotic',     0.84, 1.00);

create table private.draft_room_longhorns_board_variants (
  shape text not null references private.draft_room_longhorns_board_shapes(shape),
  variant integer not null check (variant between 1 and 4),
  grade_bands text[] not null check (cardinality(grade_bands) = 8),
  primary key (shape, variant),
  check (grade_bands <@ array['Icon','Elite','Star','Strong','Core']::text[])
);

insert into private.draft_room_longhorns_board_variants (shape, variant, grade_bands) values
  ('Wide', 1, array['Icon','Icon','Elite','Star','Star','Strong','Core','Core']),
  ('Wide', 2, array['Icon','Elite','Elite','Star','Strong','Strong','Core','Core']),
  ('Wide', 3, array['Icon','Icon','Elite','Star','Strong','Strong','Strong','Core']),
  ('Wide', 4, array['Icon','Elite','Star','Star','Strong','Strong','Core','Core']),

  ('Balanced', 1, array['Elite','Elite','Star','Star','Strong','Strong','Core','Core']),
  ('Balanced', 2, array['Icon','Elite','Star','Star','Strong','Strong','Strong','Core']),
  ('Balanced', 3, array['Elite','Star','Star','Star','Strong','Strong','Strong','Core']),
  ('Balanced', 4, array['Elite','Elite','Star','Strong','Strong','Strong','Core','Core']),

  ('TopHeavy', 1, array['Icon','Icon','Elite','Elite','Star','Strong','Core','Core']),
  ('TopHeavy', 2, array['Icon','Icon','Icon','Elite','Star','Strong','Strong','Core']),
  ('TopHeavy', 3, array['Icon','Elite','Elite','Elite','Star','Strong','Core','Core']),
  ('TopHeavy', 4, array['Icon','Icon','Elite','Elite','Star','Star','Strong','Core']),

  ('BottomHeavy', 1, array['Icon','Elite','Star','Strong','Strong','Core','Core','Core']),
  ('BottomHeavy', 2, array['Elite','Elite','Star','Strong','Strong','Core','Core','Core']),
  ('BottomHeavy', 3, array['Icon','Star','Star','Strong','Strong','Strong','Core','Core']),
  ('BottomHeavy', 4, array['Elite','Star','Strong','Strong','Strong','Core','Core','Core']),

  ('Compressed', 1, array['Star','Star','Star','Strong','Strong','Strong','Strong','Strong']),
  ('Compressed', 2, array['Elite','Star','Star','Strong','Strong','Strong','Strong','Strong']),
  ('Compressed', 3, array['Star','Star','Strong','Strong','Strong','Strong','Strong','Core']),
  ('Compressed', 4, array['Elite','Star','Strong','Strong','Strong','Strong','Strong','Core']),

  ('Chaotic', 1, array['Icon','Icon','Elite','Star','Strong','Strong','Core','Core']),
  ('Chaotic', 2, array['Icon','Elite','Elite','Star','Star','Strong','Strong','Core']),
  ('Chaotic', 3, array['Icon','Icon','Star','Star','Strong','Core','Core','Core']),
  ('Chaotic', 4, array['Icon','Elite','Star','Star','Strong','Strong','Core','Core']);

create or replace function private.draft_room_longhorns_board_shape(p_roll double precision)
returns text
language plpgsql
stable
set search_path = ''
as $$
declare
  v_shape text;
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Longhorns board-shape roll must be in [0,1)';
  end if;

  select shape.shape
  into v_shape
  from private.draft_room_longhorns_board_shapes shape
  where p_roll >= shape.roll_start
    and p_roll < shape.roll_end
  order by shape.roll_start
  limit 1;

  if v_shape is null then
    raise exception 'Longhorns board-shape configuration does not cover roll %', p_roll;
  end if;

  return v_shape;
end;
$$;

create or replace function private.draft_room_longhorns_board_variant(p_roll double precision)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_roll is null or p_roll < 0 or p_roll >= 1 then
    raise exception 'Longhorns board-variant roll must be in [0,1)';
  end if;

  return floor(p_roll * 4)::integer + 1;
end;
$$;

create or replace function private.draft_room_longhorns_grade_band(
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
    raise exception 'Longhorns board slot must be between 1 and 8';
  end if;

  select variant.grade_bands
  into v_bands
  from private.draft_room_longhorns_board_variants variant
  where variant.shape = p_shape
    and variant.variant = p_variant;

  if v_bands is null then
    raise exception 'Unknown Longhorns board variant: shape=%, variant=%', p_shape, p_variant;
  end if;

  return v_bands[p_slot];
end;
$$;

create or replace function private.protect_draft_room_longhorns_calibration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Longhorns Since 2005 calibration records are immutable';
end;
$$;

create trigger draft_room_longhorns_player_pool_immutable
before update or delete on private.draft_room_longhorns_player_pool
for each row execute function private.protect_draft_room_longhorns_calibration();

create trigger draft_room_longhorns_board_shapes_immutable
before update or delete on private.draft_room_longhorns_board_shapes
for each row execute function private.protect_draft_room_longhorns_calibration();

create trigger draft_room_longhorns_board_variants_immutable
before update or delete on private.draft_room_longhorns_board_variants
for each row execute function private.protect_draft_room_longhorns_calibration();

revoke all on private.draft_room_longhorns_player_pool from public, anon, authenticated;
revoke all on private.draft_room_longhorns_board_shapes from public, anon, authenticated;
revoke all on private.draft_room_longhorns_board_variants from public, anon, authenticated;
revoke all on function private.draft_room_longhorns_board_shape(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_longhorns_board_variant(double precision) from public, anon, authenticated;
revoke all on function private.draft_room_longhorns_grade_band(text,integer,integer) from public, anon, authenticated;
revoke all on function private.protect_draft_room_longhorns_calibration() from public, anon, authenticated;

do $$
begin
  if (select count(*) from private.draft_room_longhorns_player_pool) <> 64 then
    raise exception 'Longhorns Since 2005 calibration must contain exactly 64 approved players';
  end if;

  if (select count(*) from private.draft_room_longhorns_board_shapes) <> 6 then
    raise exception 'Longhorns Since 2005 must define exactly six randomized board shapes';
  end if;

  if (select count(*) from private.draft_room_longhorns_board_variants) <> 24 then
    raise exception 'Longhorns Since 2005 must define exactly 24 hidden board variants';
  end if;

  if (select sum(roll_end - roll_start) from private.draft_room_longhorns_board_shapes) <> 1 then
    raise exception 'Longhorns Since 2005 board-shape weights must cover exactly 100 percent';
  end if;
end;
$$;
