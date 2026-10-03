-- NFL Wheel grading runtime: authoritative private grades, frozen selection grades,
-- equal-weight seven-slot team grading, and final-only curved presentation grades.
--
-- Individual player/coach grades remain server-private. The client receives only
-- the two completed team final grades after a natural 14-pick completion.
-- NFL presentation curve (locked): raw 75->50, 80->60, 85->70, 90->80,
-- 95->90, 100->100. Raw seven-slot averages remain the winner source of truth.

create table if not exists private.wheel_football_nfl_grades (
  team_code text not null references private.wheel_football_teams(code) on delete restrict,
  grade_position text not null check (grade_position in (
    'QB', 'RB', 'WR', 'TE', 'Front Seven', 'Secondary', 'Head Coach'
  )),
  display_name text not null,
  normalized_name text not null,
  grade smallint not null check (grade between 0 and 100),
  effective_date date not null,
  grade_version text not null,
  created_at timestamptz not null default now(),
  primary key (team_code, grade_position, normalized_name, effective_date)
);

create index if not exists wheel_football_nfl_grades_current_idx
  on private.wheel_football_nfl_grades (
    team_code, grade_position, normalized_name, effective_date desc
  );

alter table private.wheel_football_nfl_grades enable row level security;
revoke all on private.wheel_football_nfl_grades from public, anon, authenticated;

create or replace function private.wheel_football_normalized_name(p_value text)
returns text
language sql
immutable
set search_path = ''
as $
  select lower(regexp_replace(
    translate(
      trim(coalesce(p_value, '')),
      'ÀÁÂÃÄÅàáâãäåÇçÈÉÊËèéêëÌÍÎÏìíîïÑñÒÓÔÕÖòóôõöÙÚÛÜùúûüÝŸýÿ',
      'AAAAAAaaaaaaCcEEEEeeeeIIIIiiiiNnOOOOOoooooUUUUuuuuYYyy'
    ),
    '[^A-Za-z0-9]',
    '',
    'g'
  ));
$;

revoke all on function private.wheel_football_normalized_name(text)
  from public, anon, authenticated;

insert into private.wheel_football_nfl_grades (
  team_code,
  grade_position,
  display_name,
  normalized_name,
  grade,
  effective_date,
  grade_version
) values
  ('BUF', 'QB', 'Josh Allen', 'joshallen', 99, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('KC', 'QB', 'Patrick Mahomes', 'patrickmahomes', 97, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('BAL', 'QB', 'Lamar Jackson', 'lamarjackson', 96, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('LAR', 'QB', 'Matthew Stafford', 'matthewstafford', 95, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('CIN', 'QB', 'Joe Burrow', 'joeburrow', 95, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('DAL', 'QB', 'Dak Prescott', 'dakprescott', 92, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('NE', 'QB', 'Drake Maye', 'drakemaye', 88, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('PHI', 'QB', 'Jalen Hurts', 'jalenhurts', 85, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('SF', 'QB', 'Brock Purdy', 'brockpurdy', 89, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('DET', 'QB', 'Jared Goff', 'jaredgoff', 89, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('LAC', 'QB', 'Justin Herbert', 'justinherbert', 88, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('JAX', 'QB', 'Trevor Lawrence', 'trevorlawrence', 87, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('WSH', 'QB', 'Jayden Daniels', 'jaydendaniels', 84, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('GB', 'QB', 'Jordan Love', 'jordanlove', 85, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('TB', 'QB', 'Baker Mayfield', 'bakermayfield', 86, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('HOU', 'QB', 'C.J. Stroud', 'cjstroud', 82, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('SEA', 'QB', 'Sam Darnold', 'samdarnold', 88, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('NYJ', 'QB', 'Geno Smith', 'genosmith', 82, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('CHI', 'QB', 'Caleb Williams', 'calebwilliams', 87, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('MIN', 'QB', 'Kyler Murray', 'kylermurray', 80, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('IND', 'QB', 'Daniel Jones', 'danieljones', 80, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('LV', 'QB', 'Kirk Cousins', 'kirkcousins', 80, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('NYG', 'QB', 'Jaxson Dart', 'jaxsondart', 82, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('ARI', 'QB', 'Jacoby Brissett', 'jacobybrissett', 80, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('NO', 'QB', 'Tyler Shough', 'tylershough', 82, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('CAR', 'QB', 'Bryce Young', 'bryceyoung', 82, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('DEN', 'QB', 'Bo Nix', 'bonix', 79, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('CLE', 'QB', 'Deshaun Watson', 'deshaunwatson', 78, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('PIT', 'QB', 'Aaron Rodgers', 'aaronrodgers', 79, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('ATL', 'QB', 'Michael Penix Jr.', 'michaelpenixjr', 78, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('MIA', 'QB', 'Malik Willis', 'malikwillis', 76, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('TEN', 'QB', 'Cam Ward', 'camward', 75, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('LV', 'QB', 'Fernando Mendoza', 'fernandomendoza', 73, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('NYG', 'QB', 'Jameis Winston', 'jameiswinston', 72, '2026-10-03', 'nfl-wheel-qb-grades-2026-10-03-v1'),
  ('ARI', 'RB', 'Jeremiyah Love', 'jeremiyahlove', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('ARI', 'RB', 'Tyler Allgeier', 'tylerallgeier', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('ARI', 'RB', 'James Conner', 'jamesconner', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('ATL', 'RB', 'Bijan Robinson', 'bijanrobinson', 99, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('ATL', 'RB', 'Brian Robinson', 'brianrobinson', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('BAL', 'RB', 'Derrick Henry', 'derrickhenry', 94, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('BAL', 'RB', 'Justice Hill', 'justicehill', 78, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('BUF', 'RB', 'James Cook III', 'jamescookiii', 94, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('BUF', 'RB', 'Ty Johnson', 'tyjohnson', 77, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CAR', 'RB', 'Chuba Hubbard', 'chubahubbard', 84, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CAR', 'RB', 'Jonathon Brooks', 'jonathonbrooks', 76, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CHI', 'RB', 'D''Andre Swift', 'dandreswift', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CHI', 'RB', 'Kyle Monangai', 'kylemonangai', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CIN', 'RB', 'Chase Brown', 'chasebrown', 85, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CIN', 'RB', 'Samaje Perine', 'samajeperine', 78, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CLE', 'RB', 'Quinshon Judkins', 'quinshonjudkins', 80, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('CLE', 'RB', 'Dylan Sampson', 'dylansampson', 77, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DAL', 'RB', 'Javonte Williams', 'javontewilliams', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DAL', 'RB', 'Tyler Goodson', 'tylergoodson', 74, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DEN', 'RB', 'J.K. Dobbins', 'jkdobbins', 84, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DEN', 'RB', 'RJ Harvey', 'rjharvey', 78, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DET', 'RB', 'Jahmyr Gibbs', 'jahmyrgibbs', 98, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('DET', 'RB', 'Isiah Pacheco', 'isiahpacheco', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('GB', 'RB', 'Josh Jacobs', 'joshjacobs', 86, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('GB', 'RB', 'MarShawn Lloyd', 'marshawnlloyd', 76, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('HOU', 'RB', 'David Montgomery', 'davidmontgomery', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('HOU', 'RB', 'Woody Marks', 'woodymarks', 79, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('IND', 'RB', 'Jonathan Taylor', 'jonathantaylor', 95, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('IND', 'RB', 'Seth McGowan', 'sethmcgowan', 72, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('JAX', 'RB', 'Bhayshul Tuten', 'bhayshultuten', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('JAX', 'RB', 'Chris Rodriguez Jr.', 'chrisrodriguezjr', 77, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('KC', 'RB', 'Kenneth Walker', 'kennethwalker', 89, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('KC', 'RB', 'Emmett Johnson', 'emmettjohnson', 75, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LAC', 'RB', 'Omarion Hampton', 'omarionhampton', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LAC', 'RB', 'Keaton Mitchell', 'keatonmitchell', 81, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LAR', 'RB', 'Kyren Williams', 'kyrenwilliams', 88, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LAR', 'RB', 'Blake Corum', 'blakecorum', 81, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LV', 'RB', 'Ashton Jeanty', 'ashtonjeanty', 83, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('LV', 'RB', 'Mike Washington Jr.', 'mikewashingtonjr', 76, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('MIA', 'RB', 'De''Von Achane', 'devonachane', 91, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('MIA', 'RB', 'Jaylen Wright', 'jaylenwright', 79, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('MIN', 'RB', 'Aaron Jones Sr.', 'aaronjonessr', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('MIN', 'RB', 'Jordan Mason', 'jordanmason', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NE', 'RB', 'Rhamondre Stevenson', 'rhamondrestevenson', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NE', 'RB', 'TreVeyon Henderson', 'treveyonhenderson', 86, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NO', 'RB', 'Travis Etienne Jr.', 'travisetiennejr', 84, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NO', 'RB', 'Alvin Kamara', 'alvinkamara', 80, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NYG', 'RB', 'Cam Skattebo', 'camskattebo', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NYG', 'RB', 'Najee Harris', 'najeeharris', 80, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NYJ', 'RB', 'Breece Hall', 'breecehall', 86, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('NYJ', 'RB', 'Braelon Allen', 'braelonallen', 78, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('PHI', 'RB', 'Saquon Barkley', 'saquonbarkley', 94, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('PHI', 'RB', 'Tank Bigsby', 'tankbigsby', 79, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('PIT', 'RB', 'Jaylen Warren', 'jaylenwarren', 88, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('PIT', 'RB', 'Rico Dowdle', 'ricodowdle', 80, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('SEA', 'RB', 'Jadarian Price', 'jadarianprice', 78, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('SEA', 'RB', 'Zach Charbonnet', 'zachcharbonnet', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('SF', 'RB', 'Christian McCaffrey', 'christianmccaffrey', 96, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('SF', 'RB', 'Isaac Guerendo', 'isaacguerendo', 77, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('TB', 'RB', 'Bucky Irving', 'buckyirving', 87, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('TB', 'RB', 'Kenny Gainwell', 'kennygainwell', 79, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('TEN', 'RB', 'Tony Pollard', 'tonypollard', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('TEN', 'RB', 'Tyjae Spears', 'tyjaespears', 81, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('WSH', 'RB', 'Jacory Croskey-Merritt', 'jacorycroskeymerritt', 81, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('WSH', 'RB', 'Rachaad White', 'rachaadwhite', 82, '2026-10-03', 'nfl-wheel-rb-grades-2026-10-03-v1'),
  ('ARI', 'WR', 'Marvin Harrison Jr.', 'marvinharrisonjr', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ARI', 'WR', 'Michael Wilson', 'michaelwilson', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ARI', 'WR', 'Kendrick Bourne', 'kendrickbourne', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ATL', 'WR', 'Drake London', 'drakelondon', 91, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ATL', 'WR', 'Jahan Dotson', 'jahandotson', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ATL', 'WR', 'Olamide Zaccheaus', 'olamidezaccheaus', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BAL', 'WR', 'Zay Flowers', 'zayflowers', 90, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BAL', 'WR', 'Rashod Bateman', 'rashodbateman', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BAL', 'WR', 'Ja''Kobi Lane', 'jakobilane', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BUF', 'WR', 'DJ Moore', 'djmoore', 86, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BUF', 'WR', 'Khalil Shakir', 'khalilshakir', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('BUF', 'WR', 'Keon Coleman', 'keoncoleman', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CAR', 'WR', 'Tetairoa McMillan', 'tetairoamcmillan', 90, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CAR', 'WR', 'Jalen Coker', 'jalencoker', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CAR', 'WR', 'Xavier Legette', 'xavierlegette', 80, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CHI', 'WR', 'Rome Odunze', 'romeodunze', 88, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CHI', 'WR', 'Luther Burden III', 'lutherburdeniii', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CHI', 'WR', 'Kalif Raymond', 'kalifraymond', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CIN', 'WR', 'Ja''Marr Chase', 'jamarrchase', 99, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CIN', 'WR', 'Tee Higgins', 'teehiggins', 88, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CIN', 'WR', 'Andrei Iosivas', 'andreiiosivas', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CLE', 'WR', 'Jerry Jeudy', 'jerryjeudy', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CLE', 'WR', 'KC Concepcion Jr.', 'kcconcepcionjr', 80, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('CLE', 'WR', 'Denzel Boston', 'denzelboston', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DAL', 'WR', 'CeeDee Lamb', 'ceedeelamb', 96, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DAL', 'WR', 'George Pickens', 'georgepickens', 93, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DAL', 'WR', 'Ryan Flournoy', 'ryanflournoy', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DEN', 'WR', 'Courtland Sutton', 'courtlandsutton', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DEN', 'WR', 'Jaylen Waddle', 'jaylenwaddle', 86, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DEN', 'WR', 'Marvin Mims Jr.', 'marvinmimsjr', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DEN', 'WR', 'Pat Bryant', 'patbryant', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DET', 'WR', 'Amon-Ra St. Brown', 'amonrastbrown', 96, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DET', 'WR', 'Jameson Williams', 'jamesonwilliams', 87, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('DET', 'WR', 'Isaac TeSlaa', 'isaacteslaa', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('GB', 'WR', 'Christian Watson', 'christianwatson', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('GB', 'WR', 'Jayden Reed', 'jaydenreed', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('GB', 'WR', 'Matthew Golden', 'matthewgolden', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('HOU', 'WR', 'Nico Collins', 'nicocollins', 92, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('HOU', 'WR', 'Tank Dell', 'tankdell', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('HOU', 'WR', 'Kayshon Boutte', 'kayshonboutte', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('HOU', 'WR', 'Xavier Hutchinson', 'xavierhutchinson', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('IND', 'WR', 'Keenan Allen', 'keenanallen', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('IND', 'WR', 'Josh Downs', 'joshdowns', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('IND', 'WR', 'Alec Pierce', 'alecpierce', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('IND', 'WR', 'Darius Slayton', 'dariusslayton', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('JAX', 'WR', 'Brian Thomas Jr.', 'brianthomasjr', 86, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('JAX', 'WR', 'Travis Hunter', 'travishunter', 77, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('JAX', 'WR', 'Jakobi Meyers', 'jakobimeyers', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('JAX', 'WR', 'Parker Washington', 'parkerwashington', 80, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('KC', 'WR', 'Rashee Rice', 'rasheerice', 90, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('KC', 'WR', 'Xavier Worthy', 'xavierworthy', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('KC', 'WR', 'Tyquan Thornton', 'tyquanthornton', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAC', 'WR', 'Ladd McConkey', 'laddmcconkey', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAC', 'WR', 'Quentin Johnston', 'quentinjohnston', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAC', 'WR', 'Tre'' Harris', 'treharris', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAR', 'WR', 'Puka Nacua', 'pukanacua', 98, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAR', 'WR', 'Davante Adams', 'davanteadams', 87, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LAR', 'WR', 'Konata Mumpfield', 'konatamumpfield', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LV', 'WR', 'Tre Tucker', 'tretucker', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LV', 'WR', 'Jack Bech', 'jackbech', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('LV', 'WR', 'Jalen Nailor', 'jalennailor', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIA', 'WR', 'Malik Washington', 'malikwashington', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIA', 'WR', 'Caleb Douglas', 'calebdouglas', 75, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIA', 'WR', 'Chris Bell', 'chrisbell', 75, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIN', 'WR', 'Justin Jefferson', 'justinjefferson', 97, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIN', 'WR', 'Jordan Addison', 'jordanaddison', 86, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('MIN', 'WR', 'Jauan Jennings', 'jauanjennings', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NE', 'WR', 'A.J. Brown', 'ajbrown', 92, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NE', 'WR', 'Romeo Doubs', 'romeodoubs', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NE', 'WR', 'DeMario Douglas', 'demariodouglas', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NE', 'WR', 'Mack Hollins', 'mackhollins', 76, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NO', 'WR', 'Chris Olave', 'chrisolave', 90, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NO', 'WR', 'Devaughn Vele', 'devaughnvele', 80, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NO', 'WR', 'Bryce Lance', 'brycelance', 75, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYG', 'WR', 'Malik Nabers', 'maliknabers', 89, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYG', 'WR', 'Darnell Mooney', 'darnellmooney', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYG', 'WR', 'Malachi Fields', 'malachifields', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYJ', 'WR', 'Garrett Wilson', 'garrettwilson', 91, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYJ', 'WR', 'Adonai Mitchell', 'adonaimitchell', 81, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('NYJ', 'WR', 'Isaiah Williams', 'isaiahwilliams', 72, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PHI', 'WR', 'DeVonta Smith', 'devontasmith', 88, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PHI', 'WR', 'Dontayvion Wicks', 'dontayvionwicks', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PHI', 'WR', 'Makai Lemon', 'makailemon', 77, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PIT', 'WR', 'DK Metcalf', 'dkmetcalf', 88, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PIT', 'WR', 'Michael Pittman Jr.', 'michaelpittmanjr', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('PIT', 'WR', 'Roman Wilson', 'romanwilson', 77, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SEA', 'WR', 'Jaxon Smith-Njigba', 'jaxonsmithnjigba', 99, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SEA', 'WR', 'Cooper Kupp', 'cooperkupp', 82, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SEA', 'WR', 'Rashid Shaheed', 'rashidshaheed', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SF', 'WR', 'Mike Evans', 'mikeevans', 87, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SF', 'WR', 'Deebo Samuel Sr.', 'deebosamuelsr', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SF', 'WR', 'Ricky Pearsall', 'rickypearsall', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('SF', 'WR', 'Jacob Cowing', 'jacobcowing', 75, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TB', 'WR', 'Emeka Egbuka', 'emekaegbuka', 87, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TB', 'WR', 'Chris Godwin Jr.', 'chrisgodwinjr', 85, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TB', 'WR', 'Jalen McMillan', 'jalenmcmillan', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TB', 'WR', 'Ted Hurst III', 'tedhurstiii', 78, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TEN', 'WR', 'Calvin Ridley', 'calvinridley', 83, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TEN', 'WR', 'Carnell Tate', 'carnelltate', 79, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('TEN', 'WR', 'Wan''Dale Robinson', 'wandalerobinson', 84, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('WSH', 'WR', 'Terry McLaurin', 'terrymclaurin', 87, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('WSH', 'WR', 'Stefon Diggs', 'stefondiggs', 86, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('WSH', 'WR', 'Dyami Brown', 'dyamibrown', 80, '2026-10-03', 'nfl-wheel-wr-grades-2026-10-03-v1'),
  ('ARI', 'TE', 'Trey McBride', 'treymcbride', 99, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('ATL', 'TE', 'Kyle Pitts Sr.', 'kylepittssr', 84, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('BAL', 'TE', 'Mark Andrews', 'markandrews', 82, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('BUF', 'TE', 'Dalton Kincaid', 'daltonkincaid', 91, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('CAR', 'TE', 'Tommy Tremble', 'tommytremble', 76, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('CHI', 'TE', 'Colston Loveland', 'colstonloveland', 87, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('CIN', 'TE', 'Drew Sample', 'drewsample', 72, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('CLE', 'TE', 'Harold Fannin Jr.', 'haroldfanninjr', 84, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('DAL', 'TE', 'Jake Ferguson', 'jakeferguson', 82, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('DEN', 'TE', 'Evan Engram', 'evanengram', 78, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('DET', 'TE', 'Sam LaPorta', 'samlaporta', 94, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('GB', 'TE', 'Tucker Kraft', 'tuckerkraft', 87, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('HOU', 'TE', 'Dalton Schultz', 'daltonschultz', 83, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('IND', 'TE', 'Tyler Warren', 'tylerwarren', 86, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('JAX', 'TE', 'Brenton Strange', 'brentonstrange', 80, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('KC', 'TE', 'Travis Kelce', 'traviskelce', 88, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('LAC', 'TE', 'Charlie Kolar', 'charliekolar', 73, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('LAC', 'TE', 'David Njoku', 'davidnjoku', 81, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('LAR', 'TE', 'Colby Parkinson', 'colbyparkinson', 79, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('LV', 'TE', 'Brock Bowers', 'brockbowers', 98, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('MIA', 'TE', 'Greg Dulcich', 'gregdulcich', 75, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('MIN', 'TE', 'T.J. Hockenson', 'tjhockenson', 80, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('NE', 'TE', 'Hunter Henry', 'hunterhenry', 82, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('NO', 'TE', 'Juwan Johnson', 'juwanjohnson', 86, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('NYG', 'TE', 'Isaiah Likely', 'isaiahlikely', 83, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('NYJ', 'TE', 'Mason Taylor', 'masontaylor', 76, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('PHI', 'TE', 'Dallas Goedert', 'dallasgoedert', 82, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('PIT', 'TE', 'Pat Freiermuth', 'patfreiermuth', 82, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('SEA', 'TE', 'AJ Barner', 'ajbarner', 81, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('SF', 'TE', 'George Kittle', 'georgekittle', 98, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('TB', 'TE', 'Cade Otton', 'cadeotton', 79, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('TEN', 'TE', 'Gunnar Helm', 'gunnarhelm', 76, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('WSH', 'TE', 'Chig Okonkwo', 'chigokonkwo', 78, '2026-10-03', 'nfl-wheel-te-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Josh Sweat', 'joshsweat', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Walter Nolen III', 'walternoleniii', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Mack Wilson Sr.', 'mackwilsonsr', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Jack Gibbens', 'jackgibbens', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Zaven Collins', 'zavencollins', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Front Seven', 'Dante Stills', 'dantestills', 74, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'James Pearce Jr.', 'jamespearcejr', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'Gervon Dexter Sr.', 'gervondextersr', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'Za''Darius Smith', 'zadariussmith', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'Jalon Walker', 'jalonwalker', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'Divine Deablo', 'divinedeablo', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ATL', 'Front Seven', 'Maason Smith', 'maasonsmith', 74, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Trey Hendrickson', 'treyhendrickson', 91, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Roquan Smith', 'roquansmith', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Nnamdi Madubuike', 'nnamdimadubuike', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Tavius Robinson', 'taviusrobinson', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Calais Campbell', 'calaiscampbell', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BAL', 'Front Seven', 'Trenton Simpson', 'trentonsimpson', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'Greg Rousseau', 'gregrousseau', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'Bradley Chubb', 'bradleychubb', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'Ed Oliver', 'edoliver', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'Terrel Bernard', 'terrelbernard', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'Dorian Williams', 'dorianwilliams', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('BUF', 'Front Seven', 'T.J. Sanders', 'tjsanders', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Derrick Brown', 'derrickbrown', 94, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Devin Lloyd', 'devinlloyd', 92, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Jaelan Phillips', 'jaelanphillips', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Bobby Okereke', 'bobbyokereke', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Princely Umanmielen', 'princelyumanmielen', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CAR', 'Front Seven', 'Lee Hunter', 'leehunter', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'Montez Sweat', 'montezsweat', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'Grady Jarrett', 'gradyjarrett', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'T.J. Edwards', 'tjedwards', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'Austin Booker', 'austinbooker', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'Devin Bush', 'devinbush', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CHI', 'Front Seven', 'Dayo Odeyingbo', 'dayoodeyingbo', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Dexter Lawrence II', 'dexterlawrenceii', 92, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Jonathan Allen', 'jonathanallen', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Boye Mafe', 'boyemafe', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Myles Murphy', 'mylesmurphy', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Demetrius Knight Jr.', 'demetriusknightjr', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CIN', 'Front Seven', 'Barrett Carter', 'barrettcarter', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Jared Verse', 'jaredverse', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Mason Graham', 'masongraham', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Jeremiah Owusu-Koramoah', 'jeremiahowusukoramoah', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Quincy Williams', 'quincywilliams', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Carson Schwesinger', 'carsonschwesinger', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('CLE', 'Front Seven', 'Isaiah McGuire', 'isaiahmcguire', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'Quinnen Williams', 'quinnenwilliams', 93, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'Rashan Gary', 'rashangary', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'Kenny Clark', 'kennyclark', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'DeMarvion Overshown', 'demarvionovershown', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'Donovan Ezeiruaku', 'donovanezeiruaku', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DAL', 'Front Seven', 'Dee Winters', 'deewinters', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'Nik Bonitto', 'nikbonitto', 92, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'Zach Allen', 'zachallen', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'Alex Singleton', 'alexsingleton', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'Jonah Elliss', 'jonahelliss', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'D.J. Jones', 'djjones', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DEN', 'Front Seven', 'Justin Strnad', 'justinstrnad', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'Aidan Hutchinson', 'aidanhutchinson', 98, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'Alim McNeill', 'alimmcneill', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'Jack Campbell', 'jackcampbell', 91, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'Derrick Barnes', 'derrickbarnes', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'Tyleik Williams', 'tyleikwilliams', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('DET', 'Front Seven', 'DJ Wonnum', 'djwonnum', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Micah Parsons', 'micahparsons', 96, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Edgerrin Cooper', 'edgerrincooper', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Zaire Franklin', 'zairefranklin', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Javon Hargrave', 'javonhargrave', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Devonte Wyatt', 'devontewyatt', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('GB', 'Front Seven', 'Lukas Van Ness', 'lukasvanness', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Will Anderson Jr.', 'willandersonjr', 99, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Danielle Hunter', 'daniellehunter', 95, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Azeez Al-Shaair', 'azeezalshaair', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Jadeveon Clowney', 'jadeveonclowney', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Sheldon Rankins', 'sheldonrankins', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('HOU', 'Front Seven', 'Henry To''oTo''o', 'henrytootoo', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'DeForest Buckner', 'deforestbuckner', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'Laiatu Latu', 'laiatulatu', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'Grover Stewart', 'groverstewart', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'Arden Key', 'ardenkey', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'Jaylon Carlies', 'jayloncarlies', 74, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('IND', 'Front Seven', 'Akeem Davis-Gaither', 'akeemdavisgaither', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'Josh Hines-Allen', 'joshhinesallen', 92, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'Travon Walker', 'travonwalker', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'Foyesade Oluokun', 'foyesadeoluokun', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'Arik Armstead', 'arikarmstead', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'DaVon Hamilton', 'davonhamilton', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('JAX', 'Front Seven', 'Ventrell Miller', 'ventrellmiller', 74, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'Chris Jones', 'chrisjones', 94, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'George Karlaftis', 'georgekarlaftis', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'Nick Bolton', 'nickbolton', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'Drue Tranquill', 'druetranquill', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'Peter Woods', 'peterwoods', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('KC', 'Front Seven', 'Felix Anudike-Uzomah', 'felixanudikeuzomah', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Khalil Mack', 'khalilmack', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Tuli Tuipulotu', 'tulituipulotu', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Daiyan Henley', 'daiyanhenley', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Denzel Perryman', 'denzelperryman', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Dalvin Tomlinson', 'dalvintomlinson', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAC', 'Front Seven', 'Teair Tart', 'teairtart', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Myles Garrett', 'mylesgarrett', 99, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Aaron Donald', 'aarondonald', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Kobie Turner', 'kobieturner', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Braden Fiske', 'bradenfiske', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Byron Young', 'byronyoung', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LAR', 'Front Seven', 'Nate Landman', 'natelandman', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Maxx Crosby', 'maxxcrosby', 96, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Kwity Paye', 'kwitypaye', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Nakobe Dean', 'nakobedean', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Quay Walker', 'quaywalker', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Adam Butler', 'adambutler', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('LV', 'Front Seven', 'Tonka Hemingway', 'tonkahemingway', 72, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Jordyn Brooks', 'jordynbrooks', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Zach Sieler', 'zachsieler', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Chop Robinson', 'choprobinson', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Josh Uche', 'joshuche', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Jacob Rodriguez', 'jacobrodriguez', 76, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIA', 'Front Seven', 'Willie Gay Jr.', 'williegayjr', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Dallas Turner', 'dallasturner', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Andrew Van Ginkel', 'andrewvanginkel', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Blake Cashman', 'blakecashman', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Jalen Redmond', 'jalenredmond', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Eric Wilson', 'ericwilson', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('MIN', 'Front Seven', 'Tyrion Ingram-Dawkins', 'tyrioningramdawkins', 73, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NE', 'Front Seven', 'Christian Barmore', 'christianbarmore', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NE', 'Front Seven', 'Harold Landry III', 'haroldlandryiii', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NE', 'Front Seven', 'Milton Williams', 'miltonwilliams', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NE', 'Front Seven', 'Dre''Mont Jones', 'dremontjones', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NE', 'Front Seven', 'Robert Spillane', 'robertspillane', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Chase Young', 'chaseyoung', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Cameron Jordan', 'cameronjordan', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Carl Granderson', 'carlgranderson', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Kaden Elliss', 'kadenelliss', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Bryan Bresee', 'bryanbresee', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NO', 'Front Seven', 'Pete Werner', 'petewerner', 78, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'Brian Burns', 'brianburns', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'Abdul Carter', 'abdulcarter', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'Kayvon Thibodeaux', 'kayvonthibodeaux', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'Tremaine Edmunds', 'tremaineedmunds', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'Arvell Reese', 'arvellreese', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYG', 'Front Seven', 'D.J. Reader', 'djreader', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'David Bailey', 'davidbailey', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'Will McDonald IV', 'willmcdonaldiv', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'Jamien Sherwood', 'jamiensherwood', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'Demario Davis', 'demariodavis', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'T''Vondre Sweat', 'tvondresweat', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('NYJ', 'Front Seven', 'Harrison Phillips', 'harrisonphillips', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Jalen Carter', 'jalencarter', 93, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Zack Baun', 'zackbaun', 95, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Jonathan Greenard', 'jonathangreenard', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Jalyx Hunt', 'jalyxhunt', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Jihaad Campbell', 'jihaadcampbell', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PHI', 'Front Seven', 'Jordan Davis', 'jordandavis', 86, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'T.J. Watt', 'tjwatt', 93, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'Cameron Heyward', 'cameronheyward', 95, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'Alex Highsmith', 'alexhighsmith', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'Patrick Queen', 'patrickqueen', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'Payton Wilson', 'paytonwilson', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('PIT', 'Front Seven', 'Derrick Harmon', 'derrickharmon', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Leonard Williams', 'leonardwilliams', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Ernest Jones IV', 'ernestjonesiv', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Byron Murphy II', 'byronmurphyii', 89, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Demarcus Lawrence', 'demarcuslawrence', 88, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Derick Hall', 'derickhall', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SEA', 'Front Seven', 'Drake Thomas', 'drakethomas', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Nick Bosa', 'nickbosa', 94, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Fred Warner', 'fredwarner', 97, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Dre Greenlaw', 'dregreenlaw', 87, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Osa Odighizuwa', 'osaodighizuwa', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Keion White', 'keionwhite', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('SF', 'Front Seven', 'Mykel Williams', 'mykelwilliams', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Vita Vea', 'vitavea', 90, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Calijah Kancey', 'calijahkancey', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Yaya Diaby', 'yayadiaby', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Rueben Bain Jr.', 'ruebenbainjr', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Alex Anzalone', 'alexanzalone', 81, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TB', 'Front Seven', 'Josiah Trotter', 'josiahtrotter', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'Jeffery Simmons', 'jefferysimmons', 95, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'Jermaine Johnson II', 'jermainejohnsonii', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'John Franklin-Myers', 'johnfranklinmyers', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'Keldric Faulk', 'keldricfaulk', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'Anthony Hill Jr.', 'anthonyhilljr', 79, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('TEN', 'Front Seven', 'Cedric Gray', 'cedricgray', 84, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'Daron Payne', 'daronpayne', 85, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'Frankie Luvu', 'frankieluvu', 82, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'Odafe Oweh', 'odafeoweh', 83, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'Sonny Styles', 'sonnystyles', 80, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'Javon Kinlaw', 'javonkinlaw', 75, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('WSH', 'Front Seven', 'K''Lavon Chaisson', 'klavonchaisson', 77, '2026-10-03', 'nfl-wheel-front-seven-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Budda Baker', 'buddabaker', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Will Johnson', 'willjohnson', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Andrew Wingard', 'andrewwingard', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Garrett Williams', 'garrettwilliams', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Max Melton', 'maxmelton', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Secondary', 'Denzel Burke', 'denzelburke', 74, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'Jessie Bates III', 'jessiebatesiii', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'A.J. Terrell Jr.', 'ajterrelljr', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'Xavier Watts', 'xavierwatts', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'Mike Hughes', 'mikehughes', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'C.J. Henderson', 'cjhenderson', 73, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ATL', 'Secondary', 'Billy Bowman Jr.', 'billybowmanjr', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BAL', 'Secondary', 'Kyle Hamilton', 'kylehamilton', 99, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BAL', 'Secondary', 'Marlon Humphrey', 'marlonhumphrey', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BAL', 'Secondary', 'Nate Wiggins', 'natewiggins', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BAL', 'Secondary', 'Malaki Starks', 'malakistarks', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BAL', 'Secondary', 'Jaylinn Hawkins', 'jaylinnhawkins', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BUF', 'Secondary', 'Christian Benford', 'christianbenford', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BUF', 'Secondary', 'C.J. Gardner-Johnson', 'cjgardnerjohnson', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BUF', 'Secondary', 'Maxwell Hairston', 'maxwellhairston', 81, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BUF', 'Secondary', 'Cole Bishop', 'colebishop', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('BUF', 'Secondary', 'Dee Alford', 'deealford', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Jaycee Horn', 'jayceehorn', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Tre''von Moehrig', 'trevonmoehrig', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Lathan Ransom', 'lathanransom', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Will Lee III', 'willleeiii', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Nick Scott', 'nickscott', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CAR', 'Secondary', 'Akayleb Evans', 'akaylebevans', 74, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Jaylon Johnson', 'jaylonjohnson', 85, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Kyler Gordon', 'kylergordon', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Dillon Thieneman', 'dillonthieneman', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Tyrique Stevenson Sr.', 'tyriquestevensonsr', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Xavier Woods', 'xavierwoods', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CHI', 'Secondary', 'Malik Muhammad II', 'malikmuhammadii', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CIN', 'Secondary', 'Dax Hill', 'daxhill', 81, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CIN', 'Secondary', 'DJ Turner II', 'djturnerii', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CIN', 'Secondary', 'Jordan Battle', 'jordanbattle', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CIN', 'Secondary', 'Bryan Cook', 'bryancook', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CIN', 'Secondary', 'Tacario Davis', 'tacariodavis', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CLE', 'Secondary', 'Denzel Ward', 'denzelward', 94, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CLE', 'Secondary', 'Tyson Campbell', 'tysoncampbell', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CLE', 'Secondary', 'Grant Delpit', 'grantdelpit', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CLE', 'Secondary', 'Ronnie Hickman', 'ronniehickman', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('CLE', 'Secondary', 'Myles Harden', 'mylesharden', 73, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DAL', 'Secondary', 'DaRon Bland', 'daronbland', 85, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DAL', 'Secondary', 'Joey Porter Jr.', 'joeyporterjr', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DAL', 'Secondary', 'Caleb Downs', 'calebdowns', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DAL', 'Secondary', 'Malik Hooker', 'malikhooker', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DAL', 'Secondary', 'Markquese Bell', 'markquesebell', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DEN', 'Secondary', 'Pat Surtain II', 'patsurtainii', 96, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DEN', 'Secondary', 'Talanoa Hufanga', 'talanoahufanga', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DEN', 'Secondary', 'Brandon Jones', 'brandonjones', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DEN', 'Secondary', 'Riley Moss', 'rileymoss', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DEN', 'Secondary', 'Ja''Quan McMillian', 'jaquanmcmillian', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DET', 'Secondary', 'Brian Branch', 'brianbranch', 94, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DET', 'Secondary', 'Kerby Joseph', 'kerbyjoseph', 88, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DET', 'Secondary', 'D.J. Reed', 'djreed', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DET', 'Secondary', 'Roger McCreary', 'rogermccreary', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('DET', 'Secondary', 'Ennis Rakestraw Jr.', 'ennisrakestrawjr', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('GB', 'Secondary', 'Xavier McKinney', 'xaviermckinney', 88, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('GB', 'Secondary', 'Evan Williams', 'evanwilliams', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('GB', 'Secondary', 'Keisean Nixon', 'keiseannixon', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('GB', 'Secondary', 'Javon Bullard', 'javonbullard', 81, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('GB', 'Secondary', 'Brandon Cisse', 'brandoncisse', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('HOU', 'Secondary', 'Derek Stingley Jr.', 'derekstingleyjr', 95, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('HOU', 'Secondary', 'Jalen Pitre', 'jalenpitre', 94, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('HOU', 'Secondary', 'Calen Bullock', 'calenbullock', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('HOU', 'Secondary', 'Kamari Lassiter', 'kamarilassiter', 89, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('HOU', 'Secondary', 'Reed Blankenship', 'reedblankenship', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('IND', 'Secondary', 'Sauce Gardner', 'saucegardner', 91, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('IND', 'Secondary', 'Charvarius Ward', 'charvariusward', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('IND', 'Secondary', 'Cam Bynum', 'cambynum', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('IND', 'Secondary', 'AJ Haulcy', 'ajhaulcy', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('IND', 'Secondary', 'Justin Walley', 'justinwalley', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('JAX', 'Secondary', 'Travis Hunter', 'travishunter', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('JAX', 'Secondary', 'Jourdan Lewis', 'jourdanlewis', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('JAX', 'Secondary', 'Eric Murray', 'ericmurray', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('JAX', 'Secondary', 'Antonio Johnson', 'antoniojohnson', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('JAX', 'Secondary', 'Montaric Brown', 'montaricbrown', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('KC', 'Secondary', 'L''Jarius Sneed', 'ljariussneed', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('KC', 'Secondary', 'Mansoor Delane', 'mansoordelane', 85, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('KC', 'Secondary', 'Chamarri Conner', 'chamarriconner', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('KC', 'Secondary', 'Nohl Williams', 'nohlwilliams', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('KC', 'Secondary', 'Alohi Gilman', 'alohigilman', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAC', 'Secondary', 'Derwin James Jr.', 'derwinjamesjr', 89, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAC', 'Secondary', 'Tarheeb Still', 'tarheebstill', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAC', 'Secondary', 'Elijah Molden', 'elijahmolden', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAC', 'Secondary', 'Cam Hart', 'camhart', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAC', 'Secondary', 'Tony Jefferson', 'tonyjefferson', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAR', 'Secondary', 'Trent McDuffie', 'trentmcduffie', 98, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAR', 'Secondary', 'Quentin Lake', 'quentinlake', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAR', 'Secondary', 'Kam Curl', 'kamcurl', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAR', 'Secondary', 'Jaylen Watson', 'jaylenwatson', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LAR', 'Secondary', 'Kamren Kinchens', 'kamrenkinchens', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LV', 'Secondary', 'Taron Johnson', 'taronjohnson', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LV', 'Secondary', 'Jeremy Chinn', 'jeremychinn', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LV', 'Secondary', 'Eric Stokes', 'ericstokes', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LV', 'Secondary', 'Hezekiah Masses', 'hezekiahmasses', 74, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('LV', 'Secondary', 'Treydan Stukes', 'treydanstukes', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIA', 'Secondary', 'Chris Johnson', 'chrisjohnson', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIA', 'Secondary', 'JuJu Brents', 'jujubrents', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIA', 'Secondary', 'Dante Trader Jr.', 'dantetraderjr', 73, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIA', 'Secondary', 'Michael Taaffe', 'michaeltaaffe', 74, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIA', 'Secondary', 'Jason Marshall Jr.', 'jasonmarshalljr', 74, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIN', 'Secondary', 'Byron Murphy Jr.', 'byronmurphyjr', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIN', 'Secondary', 'Joshua Metellus', 'joshuametellus', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIN', 'Secondary', 'Harrison Smith', 'harrisonsmith', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIN', 'Secondary', 'Isaiah Rodgers', 'isaiahrodgers', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('MIN', 'Secondary', 'Jay Ward', 'jayward', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NE', 'Secondary', 'Christian Gonzalez', 'christiangonzalez', 97, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NE', 'Secondary', 'Carlton Davis III', 'carltondavisiii', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NE', 'Secondary', 'Kevin Byard III', 'kevinbyardiii', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NE', 'Secondary', 'Marcus Jones', 'marcusjones', 85, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NE', 'Secondary', 'Craig Woodson', 'craigwoodson', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NO', 'Secondary', 'Justin Reid', 'justinreid', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NO', 'Secondary', 'Kool-Aid McKinstry', 'koolaidmckinstry', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NO', 'Secondary', 'Julian Blackmon', 'julianblackmon', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NO', 'Secondary', 'Jonas Sanker', 'jonassanker', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NO', 'Secondary', 'Quincy Riley', 'quincyriley', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Paulson Adebo', 'paulsonadebo', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Deonte Banks', 'deontebanks', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Tyler Nubin', 'tylernubin', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Jevón Holland', 'jevonholland', 85, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Greg Newsome II', 'gregnewsomeii', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYG', 'Secondary', 'Dru Phillips', 'druphillips', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYJ', 'Secondary', 'Minkah Fitzpatrick', 'minkahfitzpatrick', 90, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYJ', 'Secondary', 'Azareye''h Thomas', 'azareyehthomas', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYJ', 'Secondary', 'Brandon Stephens', 'brandonstephens', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYJ', 'Secondary', 'Dane Belton', 'danebelton', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('NYJ', 'Secondary', 'Jarvis Brownlee Jr.', 'jarvisbrownleejr', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PHI', 'Secondary', 'Quinyon Mitchell', 'quinyonmitchell', 93, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PHI', 'Secondary', 'Cooper DeJean', 'cooperdejean', 92, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PHI', 'Secondary', 'Riq Woolen', 'riqwoolen', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PHI', 'Secondary', 'Andrew Mukuba', 'andrewmukuba', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PHI', 'Secondary', 'Marcus Epps', 'marcusepps', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PIT', 'Secondary', 'Jalen Ramsey', 'jalenramsey', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PIT', 'Secondary', 'Jamel Dean', 'jameldean', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PIT', 'Secondary', 'Asante Samuel Jr.', 'asantesamueljr', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PIT', 'Secondary', 'DeShon Elliott', 'deshonelliott', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('PIT', 'Secondary', 'Jaquan Brisker', 'jaquanbrisker', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Devon Witherspoon', 'devonwitherspoon', 97, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Julian Love', 'julianlove', 87, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Terrion Arnold', 'terrionarnold', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Nick Emmanwori', 'nickemmanwori', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Josh Jobe', 'joshjobe', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SEA', 'Secondary', 'Ty Okada', 'tyokada', 77, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Deommodore Lenoir', 'deommodorelenoir', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Renardo Green', 'renardogreen', 81, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Malik Mustapha', 'malikmustapha', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Ji''Ayir Brown', 'jiayirbrown', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Marques Sigle', 'marquessigle', 76, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('SF', 'Secondary', 'Upton Stout', 'uptonstout', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TB', 'Secondary', 'Antoine Winfield Jr.', 'antoinewinfieldjr', 86, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TB', 'Secondary', 'Zyon McCollum', 'zyonmccollum', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TB', 'Secondary', 'Tykee Smith', 'tykeesmith', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TB', 'Secondary', 'Jacob Parrish', 'jacobparrish', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TB', 'Secondary', 'Keionte Scott', 'keiontescott', 79, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TEN', 'Secondary', 'Amani Hooker', 'amanihooker', 84, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TEN', 'Secondary', 'Alontae Taylor', 'alontaetaylor', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TEN', 'Secondary', 'Kevin Winston Jr.', 'kevinwinstonjr', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TEN', 'Secondary', 'Cor''Dale Flott', 'cordaleflott', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('TEN', 'Secondary', 'Marcus Harris', 'marcusharris', 75, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Mike Sainristil', 'mikesainristil', 78, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Trey Amos', 'treyamos', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Amik Robertson', 'amikrobertson', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Rasul Douglas', 'rasuldouglas', 83, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Quan Martin', 'quanmartin', 80, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('WSH', 'Secondary', 'Nick Cross', 'nickcross', 82, '2026-10-03', 'nfl-wheel-secondary-grades-2026-10-03-v1'),
  ('ARI', 'Head Coach', 'Mike LaFleur', 'mikelafleur', 76, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('ATL', 'Head Coach', 'Kevin Stefanski', 'kevinstefanski', 84, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('BAL', 'Head Coach', 'Jesse Minter', 'jesseminter', 83, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('BUF', 'Head Coach', 'Joe Brady', 'joebrady', 84, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('CAR', 'Head Coach', 'Dave Canales', 'davecanales', 79, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('CHI', 'Head Coach', 'Ben Johnson', 'benjohnson', 92, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('CIN', 'Head Coach', 'Zac Taylor', 'zactaylor', 79, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('CLE', 'Head Coach', 'Todd Monken', 'toddmonken', 80, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('DAL', 'Head Coach', 'Brian Schottenheimer', 'brianschottenheimer', 81, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('DEN', 'Head Coach', 'Sean Payton', 'seanpayton', 94, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('DET', 'Head Coach', 'Dan Campbell', 'dancampbell', 91, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('GB', 'Head Coach', 'Matt LaFleur', 'mattlafleur', 87, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('HOU', 'Head Coach', 'DeMeco Ryans', 'demecoryans', 88, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('IND', 'Head Coach', 'Shane Steichen', 'shanesteichen', 81, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('JAX', 'Head Coach', 'Liam Coen', 'liamcoen', 85, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('KC', 'Head Coach', 'Andy Reid', 'andyreid', 96, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('LAC', 'Head Coach', 'Jim Harbaugh', 'jimharbaugh', 90, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('LAR', 'Head Coach', 'Sean McVay', 'seanmcvay', 99, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('LV', 'Head Coach', 'Klint Kubiak', 'klintkubiak', 84, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('MIA', 'Head Coach', 'Jeff Hafley', 'jeffhafley', 77, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('MIN', 'Head Coach', 'Kevin O''Connell', 'kevinoconnell', 89, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('NE', 'Head Coach', 'Mike Vrabel', 'mikevrabel', 93, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('NO', 'Head Coach', 'Kellen Moore', 'kellenmoore', 82, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('NYG', 'Head Coach', 'John Harbaugh', 'johnharbaugh', 88, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('NYJ', 'Head Coach', 'Aaron Glenn', 'aaronglenn', 74, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('PHI', 'Head Coach', 'Nick Sirianni', 'nicksirianni', 83, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('PIT', 'Head Coach', 'Mike McCarthy', 'mikemccarthy', 84, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('SEA', 'Head Coach', 'Mike Macdonald', 'mikemacdonald', 98, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('SF', 'Head Coach', 'Kyle Shanahan', 'kyleshanahan', 97, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('TB', 'Head Coach', 'Todd Bowles', 'toddbowles', 80, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('TEN', 'Head Coach', 'Robert Saleh', 'robertsaleh', 78, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1'),
  ('WSH', 'Head Coach', 'Dan Quinn', 'danquinn', 82, '2026-10-03', 'nfl-wheel-head-coach-grades-2026-10-03-v1')
on conflict (team_code, grade_position, normalized_name, effective_date) do update
set display_name = excluded.display_name,
    grade = excluded.grade,
    grade_version = excluded.grade_version;

do $$
declare
  v_total integer;
  v_qb integer;
  v_rb integer;
  v_wr integer;
  v_te integer;
  v_front integer;
  v_secondary integer;
  v_coach integer;
begin
  select count(*) into v_total
  from private.wheel_football_nfl_grades
  where effective_date = date '2026-10-03';

  select count(*) into v_qb from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'QB';
  select count(*) into v_rb from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'RB';
  select count(*) into v_wr from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'WR';
  select count(*) into v_te from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'TE';
  select count(*) into v_front from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'Front Seven';
  select count(*) into v_secondary from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'Secondary';
  select count(*) into v_coach from private.wheel_football_nfl_grades where effective_date = date '2026-10-03' and grade_position = 'Head Coach';

  if v_total <> 626
    or v_qb <> 34
    or v_rb <> 65
    or v_wr <> 103
    or v_te <> 33
    or v_front <> 191
    or v_secondary <> 168
    or v_coach <> 32 then
    raise exception
      'NFL Wheel grade seed mismatch total=% QB=% RB=% WR=% TE=% Front=% Secondary=% HC=%',
      v_total, v_qb, v_rb, v_wr, v_te, v_front, v_secondary, v_coach;
  end if;
end;
$$;

create or replace function private.resolve_wheel_football_nfl_grade(
  p_team_code text,
  p_grade_position text,
  p_display_name text,
  p_as_of date default ((now() at time zone 'America/Chicago')::date)
)
returns table (
  grade smallint,
  grade_version text,
  effective_date date
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    source.grade,
    source.grade_version,
    source.effective_date
  from private.wheel_football_nfl_grades source
  where source.team_code = upper(trim(p_team_code))
    and source.grade_position = trim(p_grade_position)
    and source.normalized_name = private.wheel_football_normalized_name(p_display_name)
    and source.effective_date <= p_as_of
  order by source.effective_date desc
  limit 1;
$$;

revoke all on function private.resolve_wheel_football_nfl_grade(text, text, text, date)
  from public, anon, authenticated;

alter table private.wheel_football_picks
  add column if not exists selected_grade smallint check (selected_grade between 0 and 100),
  add column if not exists grade_version text,
  add column if not exists grade_effective_date date;

update private.wheel_football_picks pick
set selected_grade = source.grade,
    grade_version = source.grade_version,
    grade_effective_date = source.effective_date
from private.wheel_football_nfl_grades source
where pick.selected_grade is null
  and source.team_code = pick.team_code
  and source.grade_position = case
    when pick.roster_slot = 'Flex' then upper(trim(pick.position_abbreviation))
    when pick.roster_slot in ('QB', 'RB', 'WR', 'Front Seven', 'Secondary', 'Head Coach') then pick.roster_slot
    else ''
  end
  and source.normalized_name = private.wheel_football_normalized_name(pick.display_name)
  and source.effective_date = (
    select max(candidate.effective_date)
    from private.wheel_football_nfl_grades candidate
    where candidate.team_code = pick.team_code
      and candidate.grade_position = source.grade_position
      and candidate.normalized_name = source.normalized_name
      and candidate.effective_date <= date '2026-10-03'
  );

do $$
declare
  v_missing integer;
begin
  select count(*) into v_missing
  from private.wheel_football_picks
  where selected_grade is null
     or grade_version is null
     or grade_effective_date is null;

  if v_missing <> 0 then
    raise exception 'Existing Wheel picks missing authoritative frozen grades: %', v_missing;
  end if;
end;
$$;

alter table private.wheel_football_picks
  alter column selected_grade set not null,
  alter column grade_version set not null,
  alter column grade_effective_date set not null;

alter table private.wheel_football_matches
  add column if not exists creator_raw_grade numeric(8,4),
  add column if not exists recipient_raw_grade numeric(8,4),
  add column if not exists creator_final_grade numeric(5,1),
  add column if not exists recipient_final_grade numeric(5,1),
  add column if not exists winner_profile_id uuid references public.profiles(id) on delete restrict;

create or replace function private.finalize_wheel_football_grades(p_challenge_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_creator_count integer;
  v_recipient_count integer;
  v_creator_raw numeric;
  v_recipient_raw numeric;
  v_creator_final numeric(5,1);
  v_recipient_final numeric(5,1);
  v_winner uuid;
begin
  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.id = p_challenge_id;

  if not found then
    raise exception 'Wheel of Football challenge not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = p_challenge_id
  for update;

  if not found then
    raise exception 'Wheel of Football state not found';
  end if;

  if v_match.forfeited_by_profile_id is not null then
    update private.wheel_football_matches match
    set creator_raw_grade = null,
        recipient_raw_grade = null,
        creator_final_grade = null,
        recipient_final_grade = null,
        winner_profile_id = null
    where match.challenge_id = p_challenge_id;
    return;
  end if;

  select count(*), avg(pick.selected_grade::numeric)
    into v_creator_count, v_creator_raw
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = v_challenge.creator_id;

  select count(*), avg(pick.selected_grade::numeric)
    into v_recipient_count, v_recipient_raw
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = v_challenge.recipient_id;

  if v_creator_count <> 7 or v_recipient_count <> 7 then
    raise exception
      'Wheel final grading requires exactly seven frozen grades per roster (creator %, recipient %)',
      v_creator_count, v_recipient_count;
  end if;

  -- NFL-specific amplified presentation curve. Keep the raw average private and
  -- use it (not the curved/rounded display grade) to determine the actual winner.
  v_creator_final := round(v_creator_raw * 2 - 100, 1);
  v_recipient_final := round(v_recipient_raw * 2 - 100, 1);

  v_winner := case
    when v_creator_raw > v_recipient_raw then v_challenge.creator_id
    when v_recipient_raw > v_creator_raw then v_challenge.recipient_id
    else null
  end;

  update private.wheel_football_matches match
  set creator_raw_grade = round(v_creator_raw, 4),
      recipient_raw_grade = round(v_recipient_raw, 4),
      creator_final_grade = v_creator_final,
      recipient_final_grade = v_recipient_final,
      winner_profile_id = v_winner
  where match.challenge_id = p_challenge_id;
end;
$$;

revoke all on function private.finalize_wheel_football_grades(uuid)
  from public, anon, authenticated;

do $$
declare
  v_row record;
begin
  for v_row in
    select match.challenge_id
    from private.wheel_football_matches match
    where match.phase = 'complete'
      and match.turn_count = 14
      and match.forfeited_by_profile_id is null
  loop
    perform private.finalize_wheel_football_grades(v_row.challenge_id);
  end loop;
end;
$$;

update public.play_challenges challenge
set creator_result = coalesce(challenge.creator_result, '{}'::jsonb)
      || jsonb_build_object(
        'finalGrade', match.creator_final_grade,
        'winnerProfileId', match.winner_profile_id
      ),
    responder_result = coalesce(challenge.responder_result, '{}'::jsonb)
      || jsonb_build_object(
        'finalGrade', match.recipient_final_grade,
        'winnerProfileId', match.winner_profile_id
      )
from private.wheel_football_matches match
where match.challenge_id = challenge.id
  and match.phase = 'complete'
  and match.turn_count = 14
  and match.forfeited_by_profile_id is null
  and match.creator_final_grade is not null
  and match.recipient_final_grade is not null;

create or replace function private.wheel_football_state_json(p_challenge_id uuid)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'code', challenge.code,
    'pool_scope', match.pool_scope,
    'division', match.division,
    'phase', match.phase,
    'turn_count', match.turn_count,
    'current_turn_profile_id', match.current_turn_profile_id,
    'pending_team', case when pending.code is null then null else jsonb_build_object(
      'code', pending.code,
      'name', pending.name,
      'conference', pending.conference,
      'division', pending.division
    ) end,
    'creator', jsonb_build_object(
      'id', challenge.creator_id,
      'display_name', creator.display_name
    ),
    'recipient', jsonb_build_object(
      'id', challenge.recipient_id,
      'display_name', recipient.display_name
    ),
    'creator_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.creator_id
    ), '[]'::jsonb),
    'recipient_roster', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'turn_number', pick.turn_number,
          'team_code', pick.team_code,
          'team_name', team.name,
          'roster_slot', pick.roster_slot,
          'athlete_id', pick.athlete_id,
          'display_name', pick.display_name,
          'position_label', pick.position_label,
          'position_abbreviation', pick.position_abbreviation,
          'headshot_url', pick.headshot_url
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'creator_final_grade', case
      when match.phase = 'complete'
       and match.turn_count = 14
       and match.forfeited_by_profile_id is null
      then match.creator_final_grade
      else null
    end,
    'recipient_final_grade', case
      when match.phase = 'complete'
       and match.turn_count = 14
       and match.forfeited_by_profile_id is null
      then match.recipient_final_grade
      else null
    end,
    'winner_profile_id', case
      when match.phase = 'complete'
       and match.turn_count = 14
       and match.forfeited_by_profile_id is null
      then match.winner_profile_id
      else null
    end,
    'opened_at', challenge.opened_at,
    'completed_at', challenge.completed_at,
    'forfeited_by_profile_id', match.forfeited_by_profile_id,
    'forfeited_at', match.forfeited_at
  )
  from public.play_challenges challenge
  join private.wheel_football_matches match on match.challenge_id = challenge.id
  join public.profiles creator on creator.id = challenge.creator_id
  join public.profiles recipient on recipient.id = challenge.recipient_id
  left join private.wheel_football_teams pending on pending.code = match.pending_team_code
  where challenge.id = p_challenge_id;
$$;

create or replace function private.pick_wheel_football(
  p_code text,
  p_athlete_id text,
  p_display_name text,
  p_position_label text,
  p_position_abbreviation text,
  p_roster_slot text,
  p_headshot_url text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_abbreviation text := upper(trim(coalesce(p_position_abbreviation, '')));
  v_slot text := trim(coalesce(p_roster_slot, ''));
  v_grade_position text;
  v_selected_grade smallint;
  v_grade_version text;
  v_grade_effective_date date;
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
begin
  if v_user_id is null then
    raise exception 'sign in required';
  end if;

  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.code = upper(trim(p_code))
    and challenge.game_id = 'wheel-football'
    and (challenge.creator_id = v_user_id or challenge.recipient_id = v_user_id);

  if not found then
    raise exception 'Wheel of Football match not found';
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = v_challenge.id
  for update;

  if v_challenge.declined_at is not null or v_challenge.completed_at is not null then
    raise exception 'This Wheel of Football match is closed';
  end if;

  if v_match.current_turn_profile_id <> v_user_id or v_match.phase <> 'pick' or v_match.pending_team_code is null then
    raise exception 'It is not your pick';
  end if;

  if v_slot not in ('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach') then
    raise exception 'invalid Superteam roster slot';
  end if;

  if not (
    (v_slot = 'QB' and v_abbreviation = 'QB')
    or (v_slot = 'RB' and v_abbreviation = 'RB')
    or (v_slot = 'WR' and v_abbreviation = 'WR')
    or (v_slot = 'Flex' and v_abbreviation in ('RB', 'WR', 'TE'))
    or (v_slot = 'Front Seven' and v_abbreviation in ('DE', 'DT', 'NT', 'DL', 'LB', 'ILB', 'OLB', 'EDGE'))
    or (v_slot = 'Secondary' and v_abbreviation in ('CB', 'S', 'FS', 'SS', 'DB'))
    or (v_slot = 'Head Coach' and v_abbreviation = 'HC')
  ) then
    raise exception 'That player is not eligible for that Superteam slot';
  end if;

  if char_length(trim(coalesce(p_athlete_id, ''))) = 0
    or char_length(trim(coalesce(p_display_name, ''))) = 0
    or char_length(trim(coalesce(p_position_label, ''))) = 0 then
    raise exception 'invalid player selection';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.roster_slot = v_slot
  ) then
    raise exception 'That Superteam slot is already filled';
  end if;

  if exists (
    select 1
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_user_id
      and pick.athlete_id = trim(p_athlete_id)
  ) then
    raise exception 'You already used that player';
  end if;

  v_grade_position := case
    when v_slot = 'Flex' then v_abbreviation
    when v_slot in ('QB', 'RB', 'WR', 'Front Seven', 'Secondary', 'Head Coach') then v_slot
    else ''
  end;

  select resolved.grade, resolved.grade_version, resolved.effective_date
    into v_selected_grade, v_grade_version, v_grade_effective_date
  from private.resolve_wheel_football_nfl_grade(
    v_match.pending_team_code,
    v_grade_position,
    p_display_name
  ) resolved;

  if v_selected_grade is null then
    raise exception
      'No authoritative NFL Wheel grade for % / % / %',
      v_match.pending_team_code, v_grade_position, trim(p_display_name);
  end if;

  v_next_turn_count := v_match.turn_count + 1;

  insert into private.wheel_football_picks (
    challenge_id,
    profile_id,
    turn_number,
    team_code,
    roster_slot,
    athlete_id,
    display_name,
    position_label,
    position_abbreviation,
    headshot_url,
    selected_grade,
    grade_version,
    grade_effective_date
  ) values (
    v_challenge.id,
    v_user_id,
    v_next_turn_count,
    v_match.pending_team_code,
    v_slot,
    trim(p_athlete_id),
    trim(p_display_name),
    trim(p_position_label),
    v_abbreviation,
    nullif(trim(coalesce(p_headshot_url, '')), ''),
    v_selected_grade,
    v_grade_version,
    v_grade_effective_date
  );

  select profile.display_name
    into v_actor_name
  from public.profiles profile
  where profile.id = v_user_id;

  if v_next_turn_count = 14 then
    update private.wheel_football_matches match
    set turn_count = 14,
        phase = 'complete',
        current_turn_profile_id = null,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        completed_at = now(),
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.finalize_wheel_football_grades(v_challenge.id);

    select match.*
      into v_match
    from private.wheel_football_matches match
    where match.challenge_id = v_challenge.id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_creator_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.creator_id;

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_recipient_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.recipient_id;

    update public.play_challenges challenge
    set creator_result = jsonb_build_object(
          'complete', true,
          'roster', v_creator_roster,
          'finalGrade', v_match.creator_final_grade,
          'winnerProfileId', v_match.winner_profile_id
        ),
        responder_result = jsonb_build_object(
          'complete', true,
          'roster', v_recipient_roster,
          'finalGrade', v_match.recipient_final_grade,
          'winnerProfileId', v_match.winner_profile_id
        ),
        completed_at = now(),
        opened_at = coalesce(challenge.opened_at, now())
    where challenge.id = v_challenge.id;

    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:complete:' || v_challenge.code || ':' || v_next_profile::text,
      'play-challenges:results-ready',
      'game_challenge_result_ready',
      'Wheel of Football is complete',
      v_actor_name || ' made the final pick. Final Superteam grades are ready.',
      '/football/wheel?match=' || v_challenge.code,
      'VIEW RESULTS',
      now()
    );
  else
    v_next_profile := case
      when v_user_id = v_challenge.creator_id then v_challenge.recipient_id
      else v_challenge.creator_id
    end;

    update private.wheel_football_matches match
    set turn_count = v_next_turn_count,
        phase = 'spin',
        current_turn_profile_id = v_next_profile,
        pending_team_code = null,
        creator_last_team_code = case when v_user_id = v_challenge.creator_id then v_match.pending_team_code else match.creator_last_team_code end,
        recipient_last_team_code = case when v_user_id = v_challenge.recipient_id then v_match.pending_team_code else match.recipient_last_team_code end,
        updated_at = now()
    where match.challenge_id = v_challenge.id;

    perform private.publish_notification_to_profile(
      v_next_profile,
      'wheel-football:turn:' || v_challenge.code || ':' || v_next_turn_count::text || ':' || v_next_profile::text,
      'play-challenges:received',
      'game_challenge_received',
      'Your turn in Wheel of Football',
      v_actor_name || ' made a pick. Spin for your next team.',
      '/football/wheel?match=' || v_challenge.code,
      'TAKE YOUR TURN',
      now()
    );
  end if;

  return private.wheel_football_state_json(v_challenge.id);
end;
$$;

comment on table private.wheel_football_nfl_grades is
  'Versioned server-private authoritative NFL Wheel grades. Future maintenance appends effective-dated rows; selected picks freeze the resolved grade/version/date.';
comment on column private.wheel_football_picks.selected_grade is
  'Server-resolved authoritative grade frozen when the pick is made. Never included in public Wheel state.';
comment on function private.finalize_wheel_football_grades(uuid) is
  'Computes equal-weight raw seven-slot averages privately, stores the raw winner truth, and stores only the NFL-specific curved final team grades for reveal.';
comment on function public.pick_wheel_football(text, text, text, text, text, text, text) is
  'Locks one eligible curated NFL player or head coach with a server-resolved frozen authoritative grade, then advances the turn. Individual grades are never exposed.';
