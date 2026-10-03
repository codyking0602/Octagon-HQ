-- Wheel of Football NFL grading runtime.
-- Canonical source: the seven locked machine-readable grade artifacts dated 2026-10-03.
-- Runtime policy: resolve server-side at selection time, freeze the grade on the pick,
-- keep grades hidden until natural 14-pick completion, and never reveal grades on forfeits.

create table if not exists private.wheel_football_nfl_grades (
  team_code text not null references private.wheel_football_teams(code) on update cascade on delete restrict,
  grade_family text not null check (grade_family in ('QB', 'RB', 'WR', 'TE', 'Front Seven', 'Secondary', 'Head Coach')),
  display_name text not null,
  name_key text not null,
  grade smallint not null check (grade between 0 and 100),
  effective_date date not null,
  grade_version text not null,
  source_artifact text not null,
  primary key (team_code, grade_family, name_key, effective_date)
);

alter table private.wheel_football_nfl_grades enable row level security;
revoke all on private.wheel_football_nfl_grades from public, anon, authenticated;

insert into private.wheel_football_nfl_grades (
  team_code,
  grade_family,
  display_name,
  name_key,
  grade,
  effective_date,
  grade_version,
  source_artifact
) values
  ('BUF', 'QB', 'Josh Allen', 'joshallen', 99, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('KC', 'QB', 'Patrick Mahomes', 'patrickmahomes', 97, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('BAL', 'QB', 'Lamar Jackson', 'lamarjackson', 96, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LAR', 'QB', 'Matthew Stafford', 'matthewstafford', 95, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CIN', 'QB', 'Joe Burrow', 'joeburrow', 95, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DAL', 'QB', 'Dak Prescott', 'dakprescott', 92, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NE', 'QB', 'Drake Maye', 'drakemaye', 88, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('PHI', 'QB', 'Jalen Hurts', 'jalenhurts', 85, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('SF', 'QB', 'Brock Purdy', 'brockpurdy', 89, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DET', 'QB', 'Jared Goff', 'jaredgoff', 89, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LAC', 'QB', 'Justin Herbert', 'justinherbert', 88, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('JAX', 'QB', 'Trevor Lawrence', 'trevorlawrence', 87, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('WSH', 'QB', 'Jayden Daniels', 'jaydendaniels', 84, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('GB', 'QB', 'Jordan Love', 'jordanlove', 85, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('TB', 'QB', 'Baker Mayfield', 'bakermayfield', 86, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('HOU', 'QB', 'C.J. Stroud', 'cjstroud', 82, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('SEA', 'QB', 'Sam Darnold', 'samdarnold', 88, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYJ', 'QB', 'Geno Smith', 'genosmith', 82, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CHI', 'QB', 'Caleb Williams', 'calebwilliams', 87, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('MIN', 'QB', 'Kyler Murray', 'kylermurray', 80, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('IND', 'QB', 'Daniel Jones', 'danieljones', 80, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LV', 'QB', 'Kirk Cousins', 'kirkcousins', 80, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYG', 'QB', 'Jaxson Dart', 'jaxsondart', 82, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ARI', 'QB', 'Jacoby Brissett', 'jacobybrissett', 80, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NO', 'QB', 'Tyler Shough', 'tylershough', 82, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CAR', 'QB', 'Bryce Young', 'bryceyoung', 82, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DEN', 'QB', 'Bo Nix', 'bonix', 79, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CLE', 'QB', 'Deshaun Watson', 'deshaunwatson', 78, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('PIT', 'QB', 'Aaron Rodgers', 'aaronrodgers', 79, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ATL', 'QB', 'Michael Penix Jr.', 'michaelpenixjr', 78, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('MIA', 'QB', 'Malik Willis', 'malikwillis', 76, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('TEN', 'QB', 'Cam Ward', 'camward', 75, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('LV', 'QB', 'Fernando Mendoza', 'fernandomendoza', 73, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('NYG', 'QB', 'Jameis Winston', 'jameiswinston', 72, '2026-10-03'::date, 'nfl-wheel-qb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('ARI', 'RB', 'Jeremiyah Love', 'jeremiyahlove', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI', 'RB', 'Tyler Allgeier', 'tylerallgeier', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI', 'RB', 'James Conner', 'jamesconner', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ATL', 'RB', 'Bijan Robinson', 'bijanrobinson', 99, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ATL', 'RB', 'Brian Robinson', 'brianrobinson', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BAL', 'RB', 'Derrick Henry', 'derrickhenry', 94, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BAL', 'RB', 'Justice Hill', 'justicehill', 78, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BUF', 'RB', 'James Cook III', 'jamescookiii', 94, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('BUF', 'RB', 'Ty Johnson', 'tyjohnson', 77, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CAR', 'RB', 'Chuba Hubbard', 'chubahubbard', 84, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CAR', 'RB', 'Jonathon Brooks', 'jonathonbrooks', 76, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CHI', 'RB', 'D''Andre Swift', 'dandreswift', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CHI', 'RB', 'Kyle Monangai', 'kylemonangai', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CIN', 'RB', 'Chase Brown', 'chasebrown', 85, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CIN', 'RB', 'Samaje Perine', 'samajeperine', 78, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CLE', 'RB', 'Quinshon Judkins', 'quinshonjudkins', 80, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CLE', 'RB', 'Dylan Sampson', 'dylansampson', 77, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DAL', 'RB', 'Javonte Williams', 'javontewilliams', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DAL', 'RB', 'Tyler Goodson', 'tylergoodson', 74, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DEN', 'RB', 'J.K. Dobbins', 'jkdobbins', 84, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DEN', 'RB', 'RJ Harvey', 'rjharvey', 78, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DET', 'RB', 'Jahmyr Gibbs', 'jahmyrgibbs', 98, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('DET', 'RB', 'Isiah Pacheco', 'isiahpacheco', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('GB', 'RB', 'Josh Jacobs', 'joshjacobs', 86, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('GB', 'RB', 'MarShawn Lloyd', 'marshawnlloyd', 76, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('HOU', 'RB', 'David Montgomery', 'davidmontgomery', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('HOU', 'RB', 'Woody Marks', 'woodymarks', 79, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('IND', 'RB', 'Jonathan Taylor', 'jonathantaylor', 95, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('IND', 'RB', 'Seth McGowan', 'sethmcgowan', 72, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('JAX', 'RB', 'Bhayshul Tuten', 'bhayshultuten', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('JAX', 'RB', 'Chris Rodriguez Jr.', 'chrisrodriguezjr', 77, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('KC', 'RB', 'Kenneth Walker', 'kennethwalker', 89, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('KC', 'RB', 'Emmett Johnson', 'emmettjohnson', 75, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAC', 'RB', 'Omarion Hampton', 'omarionhampton', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAC', 'RB', 'Keaton Mitchell', 'keatonmitchell', 81, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAR', 'RB', 'Kyren Williams', 'kyrenwilliams', 88, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LAR', 'RB', 'Blake Corum', 'blakecorum', 81, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LV', 'RB', 'Ashton Jeanty', 'ashtonjeanty', 83, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LV', 'RB', 'Mike Washington Jr.', 'mikewashingtonjr', 76, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIA', 'RB', 'De''Von Achane', 'devonachane', 91, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIA', 'RB', 'Jaylen Wright', 'jaylenwright', 79, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIN', 'RB', 'Aaron Jones Sr.', 'aaronjonessr', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('MIN', 'RB', 'Jordan Mason', 'jordanmason', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NE', 'RB', 'Rhamondre Stevenson', 'rhamondrestevenson', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NE', 'RB', 'TreVeyon Henderson', 'treveyonhenderson', 86, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NO', 'RB', 'Travis Etienne Jr.', 'travisetiennejr', 84, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NO', 'RB', 'Alvin Kamara', 'alvinkamara', 80, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYG', 'RB', 'Cam Skattebo', 'camskattebo', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYG', 'RB', 'Najee Harris', 'najeeharris', 80, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYJ', 'RB', 'Breece Hall', 'breecehall', 86, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('NYJ', 'RB', 'Braelon Allen', 'braelonallen', 78, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PHI', 'RB', 'Saquon Barkley', 'saquonbarkley', 94, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PHI', 'RB', 'Tank Bigsby', 'tankbigsby', 79, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PIT', 'RB', 'Jaylen Warren', 'jaylenwarren', 88, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('PIT', 'RB', 'Rico Dowdle', 'ricodowdle', 80, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SEA', 'RB', 'Jadarian Price', 'jadarianprice', 78, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SEA', 'RB', 'Zach Charbonnet', 'zachcharbonnet', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SF', 'RB', 'Christian McCaffrey', 'christianmccaffrey', 96, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SF', 'RB', 'Isaac Guerendo', 'isaacguerendo', 77, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TB', 'RB', 'Bucky Irving', 'buckyirving', 87, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TB', 'RB', 'Kenny Gainwell', 'kennygainwell', 79, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TEN', 'RB', 'Tony Pollard', 'tonypollard', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('TEN', 'RB', 'Tyjae Spears', 'tyjaespears', 81, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('WSH', 'RB', 'Jacory Croskey-Merritt', 'jacorycroskeymerritt', 81, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('WSH', 'RB', 'Rachaad White', 'rachaadwhite', 82, '2026-10-03'::date, 'nfl-wheel-rb-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('ARI', 'WR', 'Marvin Harrison Jr.', 'marvinharrisonjr', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI', 'WR', 'Michael Wilson', 'michaelwilson', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI', 'WR', 'Kendrick Bourne', 'kendrickbourne', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL', 'WR', 'Drake London', 'drakelondon', 91, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL', 'WR', 'Jahan Dotson', 'jahandotson', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ATL', 'WR', 'Olamide Zaccheaus', 'olamidezaccheaus', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL', 'WR', 'Zay Flowers', 'zayflowers', 90, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL', 'WR', 'Rashod Bateman', 'rashodbateman', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BAL', 'WR', 'Ja''Kobi Lane', 'jakobilane', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF', 'WR', 'DJ Moore', 'djmoore', 86, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF', 'WR', 'Khalil Shakir', 'khalilshakir', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('BUF', 'WR', 'Keon Coleman', 'keoncoleman', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR', 'WR', 'Tetairoa McMillan', 'tetairoamcmillan', 90, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR', 'WR', 'Jalen Coker', 'jalencoker', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CAR', 'WR', 'Xavier Legette', 'xavierlegette', 80, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI', 'WR', 'Rome Odunze', 'romeodunze', 88, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI', 'WR', 'Luther Burden III', 'lutherburdeniii', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI', 'WR', 'Kalif Raymond', 'kalifraymond', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN', 'WR', 'Ja''Marr Chase', 'jamarrchase', 99, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN', 'WR', 'Tee Higgins', 'teehiggins', 88, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CIN', 'WR', 'Andrei Iosivas', 'andreiiosivas', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE', 'WR', 'Jerry Jeudy', 'jerryjeudy', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE', 'WR', 'KC Concepcion Jr.', 'kcconcepcionjr', 80, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CLE', 'WR', 'Denzel Boston', 'denzelboston', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL', 'WR', 'CeeDee Lamb', 'ceedeelamb', 96, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL', 'WR', 'George Pickens', 'georgepickens', 93, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL', 'WR', 'Ryan Flournoy', 'ryanflournoy', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN', 'WR', 'Courtland Sutton', 'courtlandsutton', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN', 'WR', 'Jaylen Waddle', 'jaylenwaddle', 86, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN', 'WR', 'Marvin Mims Jr.', 'marvinmimsjr', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DEN', 'WR', 'Pat Bryant', 'patbryant', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET', 'WR', 'Amon-Ra St. Brown', 'amonrastbrown', 96, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET', 'WR', 'Jameson Williams', 'jamesonwilliams', 87, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DET', 'WR', 'Isaac TeSlaa', 'isaacteslaa', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB', 'WR', 'Christian Watson', 'christianwatson', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB', 'WR', 'Jayden Reed', 'jaydenreed', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('GB', 'WR', 'Matthew Golden', 'matthewgolden', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU', 'WR', 'Nico Collins', 'nicocollins', 92, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU', 'WR', 'Tank Dell', 'tankdell', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU', 'WR', 'Kayshon Boutte', 'kayshonboutte', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('HOU', 'WR', 'Xavier Hutchinson', 'xavierhutchinson', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND', 'WR', 'Keenan Allen', 'keenanallen', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND', 'WR', 'Josh Downs', 'joshdowns', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND', 'WR', 'Alec Pierce', 'alecpierce', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND', 'WR', 'Darius Slayton', 'dariusslayton', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX', 'WR', 'Brian Thomas Jr.', 'brianthomasjr', 86, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX', 'WR', 'Travis Hunter', 'travishunter', 77, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX', 'WR', 'Jakobi Meyers', 'jakobimeyers', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('JAX', 'WR', 'Parker Washington', 'parkerwashington', 80, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC', 'WR', 'Rashee Rice', 'rasheerice', 90, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC', 'WR', 'Xavier Worthy', 'xavierworthy', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC', 'WR', 'Tyquan Thornton', 'tyquanthornton', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC', 'WR', 'Ladd McConkey', 'laddmcconkey', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC', 'WR', 'Quentin Johnston', 'quentinjohnston', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC', 'WR', 'Tre'' Harris', 'treharris', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR', 'WR', 'Puka Nacua', 'pukanacua', 98, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR', 'WR', 'Davante Adams', 'davanteadams', 87, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAR', 'WR', 'Konata Mumpfield', 'konatamumpfield', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV', 'WR', 'Tre Tucker', 'tretucker', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV', 'WR', 'Jack Bech', 'jackbech', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LV', 'WR', 'Jalen Nailor', 'jalennailor', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA', 'WR', 'Malik Washington', 'malikwashington', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA', 'WR', 'Caleb Douglas', 'calebdouglas', 75, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIA', 'WR', 'Chris Bell', 'chrisbell', 75, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN', 'WR', 'Justin Jefferson', 'justinjefferson', 97, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN', 'WR', 'Jordan Addison', 'jordanaddison', 86, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('MIN', 'WR', 'Jauan Jennings', 'jauanjennings', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE', 'WR', 'A.J. Brown', 'ajbrown', 92, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE', 'WR', 'Romeo Doubs', 'romeodoubs', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE', 'WR', 'DeMario Douglas', 'demariodouglas', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NE', 'WR', 'Mack Hollins', 'mackhollins', 76, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO', 'WR', 'Chris Olave', 'chrisolave', 90, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO', 'WR', 'Devaughn Vele', 'devaughnvele', 80, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO', 'WR', 'Bryce Lance', 'brycelance', 75, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG', 'WR', 'Malik Nabers', 'maliknabers', 89, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG', 'WR', 'Darnell Mooney', 'darnellmooney', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYG', 'WR', 'Malachi Fields', 'malachifields', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ', 'WR', 'Garrett Wilson', 'garrettwilson', 91, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ', 'WR', 'Adonai Mitchell', 'adonaimitchell', 81, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NYJ', 'WR', 'Isaiah Williams', 'isaiahwilliams', 72, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI', 'WR', 'DeVonta Smith', 'devontasmith', 88, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI', 'WR', 'Dontayvion Wicks', 'dontayvionwicks', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PHI', 'WR', 'Makai Lemon', 'makailemon', 77, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT', 'WR', 'DK Metcalf', 'dkmetcalf', 88, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT', 'WR', 'Michael Pittman Jr.', 'michaelpittmanjr', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('PIT', 'WR', 'Roman Wilson', 'romanwilson', 77, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA', 'WR', 'Jaxon Smith-Njigba', 'jaxonsmithnjigba', 99, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA', 'WR', 'Cooper Kupp', 'cooperkupp', 82, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SEA', 'WR', 'Rashid Shaheed', 'rashidshaheed', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF', 'WR', 'Mike Evans', 'mikeevans', 87, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF', 'WR', 'Deebo Samuel Sr.', 'deebosamuelsr', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF', 'WR', 'Ricky Pearsall', 'rickypearsall', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('SF', 'WR', 'Jacob Cowing', 'jacobcowing', 75, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB', 'WR', 'Emeka Egbuka', 'emekaegbuka', 87, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB', 'WR', 'Chris Godwin Jr.', 'chrisgodwinjr', 85, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB', 'WR', 'Jalen McMillan', 'jalenmcmillan', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TB', 'WR', 'Ted Hurst III', 'tedhurstiii', 78, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN', 'WR', 'Calvin Ridley', 'calvinridley', 83, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN', 'WR', 'Carnell Tate', 'carnelltate', 79, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('TEN', 'WR', 'Wan''Dale Robinson', 'wandalerobinson', 84, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH', 'WR', 'Terry McLaurin', 'terrymclaurin', 87, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH', 'WR', 'Stefon Diggs', 'stefondiggs', 86, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('WSH', 'WR', 'Dyami Brown', 'dyamibrown', 80, '2026-10-03'::date, 'nfl-wheel-wr-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('ARI', 'TE', 'Trey McBride', 'treymcbride', 99, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('ATL', 'TE', 'Kyle Pitts Sr.', 'kylepittssr', 84, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('BAL', 'TE', 'Mark Andrews', 'markandrews', 82, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('BUF', 'TE', 'Dalton Kincaid', 'daltonkincaid', 91, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CAR', 'TE', 'Tommy Tremble', 'tommytremble', 76, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CHI', 'TE', 'Colston Loveland', 'colstonloveland', 87, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CIN', 'TE', 'Drew Sample', 'drewsample', 72, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CLE', 'TE', 'Harold Fannin Jr.', 'haroldfanninjr', 84, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DAL', 'TE', 'Jake Ferguson', 'jakeferguson', 82, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DEN', 'TE', 'Evan Engram', 'evanengram', 78, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('DET', 'TE', 'Sam LaPorta', 'samlaporta', 94, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('GB', 'TE', 'Tucker Kraft', 'tuckerkraft', 87, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('HOU', 'TE', 'Dalton Schultz', 'daltonschultz', 83, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('IND', 'TE', 'Tyler Warren', 'tylerwarren', 86, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('JAX', 'TE', 'Brenton Strange', 'brentonstrange', 80, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('KC', 'TE', 'Travis Kelce', 'traviskelce', 88, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAC', 'TE', 'Charlie Kolar', 'charliekolar', 73, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAC', 'TE', 'David Njoku', 'davidnjoku', 81, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LAR', 'TE', 'Colby Parkinson', 'colbyparkinson', 79, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('LV', 'TE', 'Brock Bowers', 'brockbowers', 98, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('MIA', 'TE', 'Greg Dulcich', 'gregdulcich', 75, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('MIN', 'TE', 'T.J. Hockenson', 'tjhockenson', 80, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NE', 'TE', 'Hunter Henry', 'hunterhenry', 82, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NO', 'TE', 'Juwan Johnson', 'juwanjohnson', 86, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NYG', 'TE', 'Isaiah Likely', 'isaiahlikely', 83, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('NYJ', 'TE', 'Mason Taylor', 'masontaylor', 76, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('PHI', 'TE', 'Dallas Goedert', 'dallasgoedert', 82, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('PIT', 'TE', 'Pat Freiermuth', 'patfreiermuth', 82, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('SEA', 'TE', 'AJ Barner', 'ajbarner', 81, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('SF', 'TE', 'George Kittle', 'georgekittle', 98, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('TB', 'TE', 'Cade Otton', 'cadeotton', 79, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('TEN', 'TE', 'Gunnar Helm', 'gunnarhelm', 76, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('WSH', 'TE', 'Chig Okonkwo', 'chigokonkwo', 78, '2026-10-03'::date, 'nfl-wheel-te-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Josh Sweat', 'joshsweat', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Walter Nolen III', 'walternoleniii', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Mack Wilson Sr.', 'mackwilsonsr', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Jack Gibbens', 'jackgibbens', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Zaven Collins', 'zavencollins', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Front Seven', 'Dante Stills', 'dantestills', 74, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'James Pearce Jr.', 'jamespearcejr', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'Gervon Dexter Sr.', 'gervondextersr', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'Za''Darius Smith', 'zadariussmith', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'Jalon Walker', 'jalonwalker', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'Divine Deablo', 'divinedeablo', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ATL', 'Front Seven', 'Maason Smith', 'maasonsmith', 74, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Trey Hendrickson', 'treyhendrickson', 91, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Roquan Smith', 'roquansmith', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Nnamdi Madubuike', 'nnamdimadubuike', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Tavius Robinson', 'taviusrobinson', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Calais Campbell', 'calaiscampbell', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BAL', 'Front Seven', 'Trenton Simpson', 'trentonsimpson', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'Greg Rousseau', 'gregrousseau', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'Bradley Chubb', 'bradleychubb', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'Ed Oliver', 'edoliver', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'Terrel Bernard', 'terrelbernard', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'Dorian Williams', 'dorianwilliams', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('BUF', 'Front Seven', 'T.J. Sanders', 'tjsanders', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Derrick Brown', 'derrickbrown', 94, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Devin Lloyd', 'devinlloyd', 92, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Jaelan Phillips', 'jaelanphillips', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Bobby Okereke', 'bobbyokereke', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Princely Umanmielen', 'princelyumanmielen', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CAR', 'Front Seven', 'Lee Hunter', 'leehunter', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'Montez Sweat', 'montezsweat', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'Grady Jarrett', 'gradyjarrett', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'T.J. Edwards', 'tjedwards', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'Austin Booker', 'austinbooker', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'Devin Bush', 'devinbush', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CHI', 'Front Seven', 'Dayo Odeyingbo', 'dayoodeyingbo', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Dexter Lawrence II', 'dexterlawrenceii', 92, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Jonathan Allen', 'jonathanallen', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Boye Mafe', 'boyemafe', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Myles Murphy', 'mylesmurphy', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Demetrius Knight Jr.', 'demetriusknightjr', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CIN', 'Front Seven', 'Barrett Carter', 'barrettcarter', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Jared Verse', 'jaredverse', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Mason Graham', 'masongraham', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Jeremiah Owusu-Koramoah', 'jeremiahowusukoramoah', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Quincy Williams', 'quincywilliams', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Carson Schwesinger', 'carsonschwesinger', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('CLE', 'Front Seven', 'Isaiah McGuire', 'isaiahmcguire', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'Quinnen Williams', 'quinnenwilliams', 93, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'Rashan Gary', 'rashangary', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'Kenny Clark', 'kennyclark', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'DeMarvion Overshown', 'demarvionovershown', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'Donovan Ezeiruaku', 'donovanezeiruaku', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL', 'Front Seven', 'Dee Winters', 'deewinters', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'Nik Bonitto', 'nikbonitto', 92, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'Zach Allen', 'zachallen', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'Alex Singleton', 'alexsingleton', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'Jonah Elliss', 'jonahelliss', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'D.J. Jones', 'djjones', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DEN', 'Front Seven', 'Justin Strnad', 'justinstrnad', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'Aidan Hutchinson', 'aidanhutchinson', 98, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'Alim McNeill', 'alimmcneill', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'Jack Campbell', 'jackcampbell', 91, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'Derrick Barnes', 'derrickbarnes', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'Tyleik Williams', 'tyleikwilliams', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DET', 'Front Seven', 'DJ Wonnum', 'djwonnum', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Micah Parsons', 'micahparsons', 96, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Edgerrin Cooper', 'edgerrincooper', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Zaire Franklin', 'zairefranklin', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Javon Hargrave', 'javonhargrave', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Devonte Wyatt', 'devontewyatt', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('GB', 'Front Seven', 'Lukas Van Ness', 'lukasvanness', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Will Anderson Jr.', 'willandersonjr', 99, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Danielle Hunter', 'daniellehunter', 95, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Azeez Al-Shaair', 'azeezalshaair', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Jadeveon Clowney', 'jadeveonclowney', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Sheldon Rankins', 'sheldonrankins', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('HOU', 'Front Seven', 'Henry To''oTo''o', 'henrytootoo', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'DeForest Buckner', 'deforestbuckner', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'Laiatu Latu', 'laiatulatu', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'Grover Stewart', 'groverstewart', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'Arden Key', 'ardenkey', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'Jaylon Carlies', 'jayloncarlies', 74, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('IND', 'Front Seven', 'Akeem Davis-Gaither', 'akeemdavisgaither', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'Josh Hines-Allen', 'joshhinesallen', 92, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'Travon Walker', 'travonwalker', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'Foyesade Oluokun', 'foyesadeoluokun', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'Arik Armstead', 'arikarmstead', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'DaVon Hamilton', 'davonhamilton', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('JAX', 'Front Seven', 'Ventrell Miller', 'ventrellmiller', 74, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'Chris Jones', 'chrisjones', 94, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'George Karlaftis', 'georgekarlaftis', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'Nick Bolton', 'nickbolton', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'Drue Tranquill', 'druetranquill', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'Peter Woods', 'peterwoods', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC', 'Front Seven', 'Felix Anudike-Uzomah', 'felixanudikeuzomah', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Khalil Mack', 'khalilmack', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Tuli Tuipulotu', 'tulituipulotu', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Daiyan Henley', 'daiyanhenley', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Denzel Perryman', 'denzelperryman', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Dalvin Tomlinson', 'dalvintomlinson', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC', 'Front Seven', 'Teair Tart', 'teairtart', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Myles Garrett', 'mylesgarrett', 99, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Aaron Donald', 'aarondonald', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Kobie Turner', 'kobieturner', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Braden Fiske', 'bradenfiske', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Byron Young', 'byronyoung', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR', 'Front Seven', 'Nate Landman', 'natelandman', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Maxx Crosby', 'maxxcrosby', 96, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Kwity Paye', 'kwitypaye', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Nakobe Dean', 'nakobedean', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Quay Walker', 'quaywalker', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Adam Butler', 'adambutler', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LV', 'Front Seven', 'Tonka Hemingway', 'tonkahemingway', 72, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Jordyn Brooks', 'jordynbrooks', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Zach Sieler', 'zachsieler', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Chop Robinson', 'choprobinson', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Josh Uche', 'joshuche', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Jacob Rodriguez', 'jacobrodriguez', 76, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIA', 'Front Seven', 'Willie Gay Jr.', 'williegayjr', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Dallas Turner', 'dallasturner', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Andrew Van Ginkel', 'andrewvanginkel', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Blake Cashman', 'blakecashman', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Jalen Redmond', 'jalenredmond', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Eric Wilson', 'ericwilson', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN', 'Front Seven', 'Tyrion Ingram-Dawkins', 'tyrioningramdawkins', 73, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE', 'Front Seven', 'Christian Barmore', 'christianbarmore', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE', 'Front Seven', 'Harold Landry III', 'haroldlandryiii', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE', 'Front Seven', 'Milton Williams', 'miltonwilliams', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE', 'Front Seven', 'Dre''Mont Jones', 'dremontjones', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE', 'Front Seven', 'Robert Spillane', 'robertspillane', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Chase Young', 'chaseyoung', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Cameron Jordan', 'cameronjordan', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Carl Granderson', 'carlgranderson', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Kaden Elliss', 'kadenelliss', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Bryan Bresee', 'bryanbresee', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NO', 'Front Seven', 'Pete Werner', 'petewerner', 78, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'Brian Burns', 'brianburns', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'Abdul Carter', 'abdulcarter', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'Kayvon Thibodeaux', 'kayvonthibodeaux', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'Tremaine Edmunds', 'tremaineedmunds', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'Arvell Reese', 'arvellreese', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG', 'Front Seven', 'D.J. Reader', 'djreader', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'David Bailey', 'davidbailey', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'Will McDonald IV', 'willmcdonaldiv', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'Jamien Sherwood', 'jamiensherwood', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'Demario Davis', 'demariodavis', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'T''Vondre Sweat', 'tvondresweat', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYJ', 'Front Seven', 'Harrison Phillips', 'harrisonphillips', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Jalen Carter', 'jalencarter', 93, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Zack Baun', 'zackbaun', 95, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Jonathan Greenard', 'jonathangreenard', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Jalyx Hunt', 'jalyxhunt', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Jihaad Campbell', 'jihaadcampbell', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI', 'Front Seven', 'Jordan Davis', 'jordandavis', 86, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'T.J. Watt', 'tjwatt', 93, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'Cameron Heyward', 'cameronheyward', 95, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'Alex Highsmith', 'alexhighsmith', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'Patrick Queen', 'patrickqueen', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'Payton Wilson', 'paytonwilson', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PIT', 'Front Seven', 'Derrick Harmon', 'derrickharmon', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Leonard Williams', 'leonardwilliams', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Ernest Jones IV', 'ernestjonesiv', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Byron Murphy II', 'byronmurphyii', 89, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Demarcus Lawrence', 'demarcuslawrence', 88, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Derick Hall', 'derickhall', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SEA', 'Front Seven', 'Drake Thomas', 'drakethomas', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Nick Bosa', 'nickbosa', 94, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Fred Warner', 'fredwarner', 97, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Dre Greenlaw', 'dregreenlaw', 87, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Osa Odighizuwa', 'osaodighizuwa', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Keion White', 'keionwhite', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF', 'Front Seven', 'Mykel Williams', 'mykelwilliams', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Vita Vea', 'vitavea', 90, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Calijah Kancey', 'calijahkancey', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Yaya Diaby', 'yayadiaby', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Rueben Bain Jr.', 'ruebenbainjr', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Alex Anzalone', 'alexanzalone', 81, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB', 'Front Seven', 'Josiah Trotter', 'josiahtrotter', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'Jeffery Simmons', 'jefferysimmons', 95, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'Jermaine Johnson II', 'jermainejohnsonii', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'John Franklin-Myers', 'johnfranklinmyers', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'Keldric Faulk', 'keldricfaulk', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'Anthony Hill Jr.', 'anthonyhilljr', 79, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TEN', 'Front Seven', 'Cedric Gray', 'cedricgray', 84, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'Daron Payne', 'daronpayne', 85, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'Frankie Luvu', 'frankieluvu', 82, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'Odafe Oweh', 'odafeoweh', 83, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'Sonny Styles', 'sonnystyles', 80, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'Javon Kinlaw', 'javonkinlaw', 75, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('WSH', 'Front Seven', 'K''Lavon Chaisson', 'klavonchaisson', 77, '2026-10-03'::date, 'nfl-wheel-front-seven-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Budda Baker', 'buddabaker', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Will Johnson', 'willjohnson', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Andrew Wingard', 'andrewwingard', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Garrett Williams', 'garrettwilliams', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Max Melton', 'maxmelton', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Secondary', 'Denzel Burke', 'denzelburke', 74, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'Jessie Bates III', 'jessiebatesiii', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'A.J. Terrell Jr.', 'ajterrelljr', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'Xavier Watts', 'xavierwatts', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'Mike Hughes', 'mikehughes', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'C.J. Henderson', 'cjhenderson', 73, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ATL', 'Secondary', 'Billy Bowman Jr.', 'billybowmanjr', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL', 'Secondary', 'Kyle Hamilton', 'kylehamilton', 99, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL', 'Secondary', 'Marlon Humphrey', 'marlonhumphrey', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL', 'Secondary', 'Nate Wiggins', 'natewiggins', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL', 'Secondary', 'Malaki Starks', 'malakistarks', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BAL', 'Secondary', 'Jaylinn Hawkins', 'jaylinnhawkins', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF', 'Secondary', 'Christian Benford', 'christianbenford', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF', 'Secondary', 'C.J. Gardner-Johnson', 'cjgardnerjohnson', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF', 'Secondary', 'Maxwell Hairston', 'maxwellhairston', 81, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF', 'Secondary', 'Cole Bishop', 'colebishop', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('BUF', 'Secondary', 'Dee Alford', 'deealford', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Jaycee Horn', 'jayceehorn', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Tre''von Moehrig', 'trevonmoehrig', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Lathan Ransom', 'lathanransom', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Will Lee III', 'willleeiii', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Nick Scott', 'nickscott', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CAR', 'Secondary', 'Akayleb Evans', 'akaylebevans', 74, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Jaylon Johnson', 'jaylonjohnson', 85, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Kyler Gordon', 'kylergordon', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Dillon Thieneman', 'dillonthieneman', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Tyrique Stevenson Sr.', 'tyriquestevensonsr', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Xavier Woods', 'xavierwoods', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CHI', 'Secondary', 'Malik Muhammad II', 'malikmuhammadii', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN', 'Secondary', 'Dax Hill', 'daxhill', 81, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN', 'Secondary', 'DJ Turner II', 'djturnerii', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN', 'Secondary', 'Jordan Battle', 'jordanbattle', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN', 'Secondary', 'Bryan Cook', 'bryancook', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CIN', 'Secondary', 'Tacario Davis', 'tacariodavis', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE', 'Secondary', 'Denzel Ward', 'denzelward', 94, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE', 'Secondary', 'Tyson Campbell', 'tysoncampbell', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE', 'Secondary', 'Grant Delpit', 'grantdelpit', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE', 'Secondary', 'Ronnie Hickman', 'ronniehickman', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('CLE', 'Secondary', 'Myles Harden', 'mylesharden', 73, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL', 'Secondary', 'DaRon Bland', 'daronbland', 85, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL', 'Secondary', 'Joey Porter Jr.', 'joeyporterjr', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL', 'Secondary', 'Caleb Downs', 'calebdowns', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL', 'Secondary', 'Malik Hooker', 'malikhooker', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DAL', 'Secondary', 'Markquese Bell', 'markquesebell', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN', 'Secondary', 'Pat Surtain II', 'patsurtainii', 96, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN', 'Secondary', 'Talanoa Hufanga', 'talanoahufanga', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN', 'Secondary', 'Brandon Jones', 'brandonjones', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN', 'Secondary', 'Riley Moss', 'rileymoss', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DEN', 'Secondary', 'Ja''Quan McMillian', 'jaquanmcmillian', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET', 'Secondary', 'Brian Branch', 'brianbranch', 94, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET', 'Secondary', 'Kerby Joseph', 'kerbyjoseph', 88, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET', 'Secondary', 'D.J. Reed', 'djreed', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET', 'Secondary', 'Roger McCreary', 'rogermccreary', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('DET', 'Secondary', 'Ennis Rakestraw Jr.', 'ennisrakestrawjr', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB', 'Secondary', 'Xavier McKinney', 'xaviermckinney', 88, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB', 'Secondary', 'Evan Williams', 'evanwilliams', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB', 'Secondary', 'Keisean Nixon', 'keiseannixon', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB', 'Secondary', 'Javon Bullard', 'javonbullard', 81, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('GB', 'Secondary', 'Brandon Cisse', 'brandoncisse', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU', 'Secondary', 'Derek Stingley Jr.', 'derekstingleyjr', 95, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU', 'Secondary', 'Jalen Pitre', 'jalenpitre', 94, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU', 'Secondary', 'Calen Bullock', 'calenbullock', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU', 'Secondary', 'Kamari Lassiter', 'kamarilassiter', 89, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU', 'Secondary', 'Reed Blankenship', 'reedblankenship', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND', 'Secondary', 'Sauce Gardner', 'saucegardner', 91, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND', 'Secondary', 'Charvarius Ward', 'charvariusward', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND', 'Secondary', 'Cam Bynum', 'cambynum', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND', 'Secondary', 'AJ Haulcy', 'ajhaulcy', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('IND', 'Secondary', 'Justin Walley', 'justinwalley', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX', 'Secondary', 'Travis Hunter', 'travishunter', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX', 'Secondary', 'Jourdan Lewis', 'jourdanlewis', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX', 'Secondary', 'Eric Murray', 'ericmurray', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX', 'Secondary', 'Antonio Johnson', 'antoniojohnson', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('JAX', 'Secondary', 'Montaric Brown', 'montaricbrown', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC', 'Secondary', 'L''Jarius Sneed', 'ljariussneed', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC', 'Secondary', 'Mansoor Delane', 'mansoordelane', 85, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC', 'Secondary', 'Chamarri Conner', 'chamarriconner', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC', 'Secondary', 'Nohl Williams', 'nohlwilliams', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC', 'Secondary', 'Alohi Gilman', 'alohigilman', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC', 'Secondary', 'Derwin James Jr.', 'derwinjamesjr', 89, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC', 'Secondary', 'Tarheeb Still', 'tarheebstill', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC', 'Secondary', 'Elijah Molden', 'elijahmolden', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC', 'Secondary', 'Cam Hart', 'camhart', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAC', 'Secondary', 'Tony Jefferson', 'tonyjefferson', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR', 'Secondary', 'Trent McDuffie', 'trentmcduffie', 98, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR', 'Secondary', 'Quentin Lake', 'quentinlake', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR', 'Secondary', 'Kam Curl', 'kamcurl', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR', 'Secondary', 'Jaylen Watson', 'jaylenwatson', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LAR', 'Secondary', 'Kamren Kinchens', 'kamrenkinchens', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV', 'Secondary', 'Taron Johnson', 'taronjohnson', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV', 'Secondary', 'Jeremy Chinn', 'jeremychinn', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV', 'Secondary', 'Eric Stokes', 'ericstokes', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV', 'Secondary', 'Hezekiah Masses', 'hezekiahmasses', 74, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('LV', 'Secondary', 'Treydan Stukes', 'treydanstukes', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA', 'Secondary', 'Chris Johnson', 'chrisjohnson', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA', 'Secondary', 'JuJu Brents', 'jujubrents', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA', 'Secondary', 'Dante Trader Jr.', 'dantetraderjr', 73, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA', 'Secondary', 'Michael Taaffe', 'michaeltaaffe', 74, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIA', 'Secondary', 'Jason Marshall Jr.', 'jasonmarshalljr', 74, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN', 'Secondary', 'Byron Murphy Jr.', 'byronmurphyjr', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN', 'Secondary', 'Joshua Metellus', 'joshuametellus', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN', 'Secondary', 'Harrison Smith', 'harrisonsmith', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN', 'Secondary', 'Isaiah Rodgers', 'isaiahrodgers', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN', 'Secondary', 'Jay Ward', 'jayward', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE', 'Secondary', 'Christian Gonzalez', 'christiangonzalez', 97, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE', 'Secondary', 'Carlton Davis III', 'carltondavisiii', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE', 'Secondary', 'Kevin Byard III', 'kevinbyardiii', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE', 'Secondary', 'Marcus Jones', 'marcusjones', 85, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NE', 'Secondary', 'Craig Woodson', 'craigwoodson', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO', 'Secondary', 'Justin Reid', 'justinreid', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO', 'Secondary', 'Kool-Aid McKinstry', 'koolaidmckinstry', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO', 'Secondary', 'Julian Blackmon', 'julianblackmon', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO', 'Secondary', 'Jonas Sanker', 'jonassanker', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NO', 'Secondary', 'Quincy Riley', 'quincyriley', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Paulson Adebo', 'paulsonadebo', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Deonte Banks', 'deontebanks', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Tyler Nubin', 'tylernubin', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Jevón Holland', 'jevonholland', 85, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Greg Newsome II', 'gregnewsomeii', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYG', 'Secondary', 'Dru Phillips', 'druphillips', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ', 'Secondary', 'Minkah Fitzpatrick', 'minkahfitzpatrick', 90, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ', 'Secondary', 'Azareye''h Thomas', 'azareyehthomas', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ', 'Secondary', 'Brandon Stephens', 'brandonstephens', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ', 'Secondary', 'Dane Belton', 'danebelton', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('NYJ', 'Secondary', 'Jarvis Brownlee Jr.', 'jarvisbrownleejr', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI', 'Secondary', 'Quinyon Mitchell', 'quinyonmitchell', 93, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI', 'Secondary', 'Cooper DeJean', 'cooperdejean', 92, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI', 'Secondary', 'Riq Woolen', 'riqwoolen', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI', 'Secondary', 'Andrew Mukuba', 'andrewmukuba', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PHI', 'Secondary', 'Marcus Epps', 'marcusepps', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT', 'Secondary', 'Jalen Ramsey', 'jalenramsey', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT', 'Secondary', 'Jamel Dean', 'jameldean', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT', 'Secondary', 'Asante Samuel Jr.', 'asantesamueljr', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT', 'Secondary', 'DeShon Elliott', 'deshonelliott', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('PIT', 'Secondary', 'Jaquan Brisker', 'jaquanbrisker', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Devon Witherspoon', 'devonwitherspoon', 97, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Julian Love', 'julianlove', 87, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Terrion Arnold', 'terrionarnold', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Nick Emmanwori', 'nickemmanwori', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Josh Jobe', 'joshjobe', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SEA', 'Secondary', 'Ty Okada', 'tyokada', 77, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Deommodore Lenoir', 'deommodorelenoir', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Renardo Green', 'renardogreen', 81, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Malik Mustapha', 'malikmustapha', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Ji''Ayir Brown', 'jiayirbrown', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Marques Sigle', 'marquessigle', 76, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('SF', 'Secondary', 'Upton Stout', 'uptonstout', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB', 'Secondary', 'Antoine Winfield Jr.', 'antoinewinfieldjr', 86, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB', 'Secondary', 'Zyon McCollum', 'zyonmccollum', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB', 'Secondary', 'Tykee Smith', 'tykeesmith', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB', 'Secondary', 'Jacob Parrish', 'jacobparrish', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TB', 'Secondary', 'Keionte Scott', 'keiontescott', 79, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN', 'Secondary', 'Amani Hooker', 'amanihooker', 84, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN', 'Secondary', 'Alontae Taylor', 'alontaetaylor', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN', 'Secondary', 'Kevin Winston Jr.', 'kevinwinstonjr', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN', 'Secondary', 'Cor''Dale Flott', 'cordaleflott', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('TEN', 'Secondary', 'Marcus Harris', 'marcusharris', 75, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Mike Sainristil', 'mikesainristil', 78, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Trey Amos', 'treyamos', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Amik Robertson', 'amikrobertson', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Rasul Douglas', 'rasuldouglas', 83, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Quan Martin', 'quanmartin', 80, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH', 'Secondary', 'Nick Cross', 'nickcross', 82, '2026-10-03'::date, 'nfl-wheel-secondary-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('ARI', 'Head Coach', 'Mike LaFleur', 'mikelafleur', 76, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('ATL', 'Head Coach', 'Kevin Stefanski', 'kevinstefanski', 84, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('BAL', 'Head Coach', 'Jesse Minter', 'jesseminter', 83, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('BUF', 'Head Coach', 'Joe Brady', 'joebrady', 84, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CAR', 'Head Coach', 'Dave Canales', 'davecanales', 79, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CHI', 'Head Coach', 'Ben Johnson', 'benjohnson', 92, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CIN', 'Head Coach', 'Zac Taylor', 'zactaylor', 79, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('CLE', 'Head Coach', 'Todd Monken', 'toddmonken', 80, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DAL', 'Head Coach', 'Brian Schottenheimer', 'brianschottenheimer', 81, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DEN', 'Head Coach', 'Sean Payton', 'seanpayton', 94, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('DET', 'Head Coach', 'Dan Campbell', 'dancampbell', 91, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('GB', 'Head Coach', 'Matt LaFleur', 'mattlafleur', 87, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('HOU', 'Head Coach', 'DeMeco Ryans', 'demecoryans', 88, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('IND', 'Head Coach', 'Shane Steichen', 'shanesteichen', 81, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('JAX', 'Head Coach', 'Liam Coen', 'liamcoen', 85, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('KC', 'Head Coach', 'Andy Reid', 'andyreid', 96, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LAC', 'Head Coach', 'Jim Harbaugh', 'jimharbaugh', 90, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LAR', 'Head Coach', 'Sean McVay', 'seanmcvay', 99, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('LV', 'Head Coach', 'Klint Kubiak', 'klintkubiak', 84, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('MIA', 'Head Coach', 'Jeff Hafley', 'jeffhafley', 77, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('MIN', 'Head Coach', 'Kevin O''Connell', 'kevinoconnell', 89, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NE', 'Head Coach', 'Mike Vrabel', 'mikevrabel', 93, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NO', 'Head Coach', 'Kellen Moore', 'kellenmoore', 82, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NYG', 'Head Coach', 'John Harbaugh', 'johnharbaugh', 88, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('NYJ', 'Head Coach', 'Aaron Glenn', 'aaronglenn', 74, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('PHI', 'Head Coach', 'Nick Sirianni', 'nicksirianni', 83, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('PIT', 'Head Coach', 'Mike McCarthy', 'mikemccarthy', 84, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('SEA', 'Head Coach', 'Mike Macdonald', 'mikemacdonald', 98, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('SF', 'Head Coach', 'Kyle Shanahan', 'kyleshanahan', 97, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('TB', 'Head Coach', 'Todd Bowles', 'toddbowles', 80, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('TEN', 'Head Coach', 'Robert Saleh', 'robertsaleh', 78, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json'),
  ('WSH', 'Head Coach', 'Dan Quinn', 'danquinn', 82, '2026-10-03'::date, 'nfl-wheel-head-coach-grades-2026-10-03-v1', 'data/generated/football/wheel-nfl-head-coach-grades-2026-10-03.json')
on conflict (team_code, grade_family, name_key, effective_date) do update
set display_name = excluded.display_name,
    grade = excluded.grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

alter table private.wheel_football_matches
  add column if not exists grading_runtime_version text,
  add column if not exists grading_cutoff_at timestamptz;

alter table private.wheel_football_picks
  add column if not exists grade_family text,
  add column if not exists selection_grade smallint,
  add column if not exists grade_effective_date date,
  add column if not exists grade_version text,
  add column if not exists grade_source_artifact text;

alter table private.wheel_football_picks
  drop constraint if exists wheel_football_pick_grade_family_valid,
  add constraint wheel_football_pick_grade_family_valid
    check (grade_family is null or grade_family in ('QB', 'RB', 'WR', 'TE', 'Front Seven', 'Secondary', 'Head Coach')),
  drop constraint if exists wheel_football_pick_selection_grade_valid,
  add constraint wheel_football_pick_selection_grade_valid
    check (selection_grade is null or selection_grade between 0 and 100),
  drop constraint if exists wheel_football_pick_grade_snapshot_complete,
  add constraint wheel_football_pick_grade_snapshot_complete check (
    (
      grade_family is null
      and selection_grade is null
      and grade_effective_date is null
      and grade_version is null
      and grade_source_artifact is null
    )
    or
    (
      grade_family is not null
      and selection_grade is not null
      and grade_effective_date is not null
      and grade_version is not null
      and grade_source_artifact is not null
    )
  );

create or replace function private.wheel_football_grade_name_key(p_value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select regexp_replace(
    translate(lower(trim(coalesce(p_value, ''))), 'ó', 'o'),
    '[^a-z0-9]',
    '',
    'g'
  );
$$;

create or replace function private.wheel_football_grade_family(
  p_position_abbreviation text,
  p_roster_slot text
)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when upper(trim(coalesce(p_position_abbreviation, ''))) = 'QB' then 'QB'
    when upper(trim(coalesce(p_position_abbreviation, ''))) = 'RB' then 'RB'
    when upper(trim(coalesce(p_position_abbreviation, ''))) = 'WR' then 'WR'
    when upper(trim(coalesce(p_position_abbreviation, ''))) = 'TE' then 'TE'
    when upper(trim(coalesce(p_position_abbreviation, ''))) in ('DE', 'DT', 'NT', 'DL', 'LB', 'ILB', 'OLB', 'EDGE') then 'Front Seven'
    when upper(trim(coalesce(p_position_abbreviation, ''))) in ('CB', 'S', 'FS', 'SS', 'DB') then 'Secondary'
    when upper(trim(coalesce(p_position_abbreviation, ''))) = 'HC' then 'Head Coach'
    else null
  end;
$$;

create or replace function private.wheel_football_grade_snapshot_json(
  p_team_code text,
  p_display_name text,
  p_position_abbreviation text,
  p_roster_slot text,
  p_grade_cutoff_at timestamptz
)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select jsonb_build_object(
    'family', grade.grade_family,
    'grade', grade.grade,
    'effectiveDate', grade.effective_date,
    'version', grade.grade_version,
    'sourceArtifact', grade.source_artifact
  )
  from private.wheel_football_nfl_grades grade
  where grade.team_code = upper(trim(coalesce(p_team_code, '')))
    and grade.grade_family = private.wheel_football_grade_family(p_position_abbreviation, p_roster_slot)
    and grade.name_key = private.wheel_football_grade_name_key(p_display_name)
    and grade.effective_date <= coalesce(p_grade_cutoff_at::date, current_date)
  order by grade.effective_date desc, grade.grade_version desc
  limit 1;
$;

-- Adopt only matches that are still active at deployment. Existing picks are frozen
-- against this locked grade version once; already-completed v1 games remain legacy.
-- The cutoff is frozen before backfill so future grade versions cannot change this match.
update private.wheel_football_matches match
set grading_cutoff_at = coalesce(match.grading_cutoff_at, now()),
    updated_at = now()
where match.completed_at is null
  and match.phase <> 'complete';

update private.wheel_football_picks pick
set grade_family = grade.grade_family,
    selection_grade = grade.grade,
    grade_effective_date = grade.effective_date,
    grade_version = grade.grade_version,
    grade_source_artifact = grade.source_artifact
from private.wheel_football_matches match,
     private.wheel_football_nfl_grades grade
where match.challenge_id = pick.challenge_id
  and match.completed_at is null
  and match.phase <> 'complete'
  and pick.selection_grade is null
  and grade.team_code = pick.team_code
  and grade.grade_family = private.wheel_football_grade_family(pick.position_abbreviation, pick.roster_slot)
  and grade.name_key = private.wheel_football_grade_name_key(pick.display_name)
  and grade.effective_date <= match.grading_cutoff_at::date;

do $
begin
  if exists (
    select 1
    from private.wheel_football_picks pick
    join private.wheel_football_matches match on match.challenge_id = pick.challenge_id
    where match.completed_at is null
      and match.phase <> 'complete'
      and pick.selection_grade is null
  ) then
    raise exception 'Cannot activate NFL Wheel grading: an active historical pick does not resolve to the locked grade authority';
  end if;
end;
$;

update private.wheel_football_matches match
set grading_runtime_version = 'nfl-wheel-grade-runtime-v1',
    updated_at = now()
where match.completed_at is null
  and match.phase <> 'complete'
  and match.grading_runtime_version is null;

create or replace function private.wheel_football_presentation_score(
  p_grade_total integer,
  p_pick_count integer default 7
)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_grade_total is null or p_pick_count is null or p_pick_count <= 0 then null
    else round(
      greatest(
        0::numeric,
        least(100::numeric, ((p_grade_total::numeric / p_pick_count::numeric) * 2) - 100)
      )
    )::integer
  end;
$$;

create or replace function private.wheel_football_grading_result_json(p_challenge_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
stable
as $$
declare
  v_challenge public.play_challenges%rowtype;
  v_match private.wheel_football_matches%rowtype;
  v_creator_count integer;
  v_creator_graded integer;
  v_creator_total integer;
  v_recipient_count integer;
  v_recipient_graded integer;
  v_recipient_total integer;
  v_winner_id uuid;
begin
  select challenge.*
    into v_challenge
  from public.play_challenges challenge
  where challenge.id = p_challenge_id;

  if not found then
    return null;
  end if;

  select match.*
    into v_match
  from private.wheel_football_matches match
  where match.challenge_id = p_challenge_id;

  if not found
    or v_match.grading_runtime_version is null
    or v_match.phase <> 'complete'
    or v_match.forfeited_at is not null then
    return null;
  end if;

  select count(*), count(pick.selection_grade), coalesce(sum(pick.selection_grade), 0)
    into v_creator_count, v_creator_graded, v_creator_total
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = v_challenge.creator_id;

  select count(*), count(pick.selection_grade), coalesce(sum(pick.selection_grade), 0)
    into v_recipient_count, v_recipient_graded, v_recipient_total
  from private.wheel_football_picks pick
  where pick.challenge_id = p_challenge_id
    and pick.profile_id = v_challenge.recipient_id;

  if v_creator_count <> 7
    or v_recipient_count <> 7
    or v_creator_graded <> 7
    or v_recipient_graded <> 7 then
    return null;
  end if;

  v_winner_id := case
    when v_creator_total > v_recipient_total then v_challenge.creator_id
    when v_recipient_total > v_creator_total then v_challenge.recipient_id
    else null
  end;

  return jsonb_build_object(
    'version', v_match.grading_runtime_version,
    'creator', jsonb_build_object(
      'profile_id', v_challenge.creator_id,
      'grade_total', v_creator_total,
      'raw_average', round(v_creator_total::numeric / 7::numeric, 2),
      'score', private.wheel_football_presentation_score(v_creator_total, 7)
    ),
    'recipient', jsonb_build_object(
      'profile_id', v_challenge.recipient_id,
      'grade_total', v_recipient_total,
      'raw_average', round(v_recipient_total::numeric / 7::numeric, 2),
      'score', private.wheel_football_presentation_score(v_recipient_total, 7)
    ),
    'winner_profile_id', v_winner_id,
    'tied', v_winner_id is null
  );
end;
$$;

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
          'headshot_url', pick.headshot_url,
          'grade_family', case when grading.result is null then null else pick.grade_family end,
          'grade', case when grading.result is null then null else pick.selection_grade end,
          'grade_effective_date', case when grading.result is null then null else pick.grade_effective_date end,
          'grade_version', case when grading.result is null then null else pick.grade_version end
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
          'headshot_url', pick.headshot_url,
          'grade_family', case when grading.result is null then null else pick.grade_family end,
          'grade', case when grading.result is null then null else pick.selection_grade end,
          'grade_effective_date', case when grading.result is null then null else pick.grade_effective_date end,
          'grade_version', case when grading.result is null then null else pick.grade_version end
        )
        order by pick.turn_number
      )
      from private.wheel_football_picks pick
      join private.wheel_football_teams team on team.code = pick.team_code
      where pick.challenge_id = challenge.id
        and pick.profile_id = challenge.recipient_id
    ), '[]'::jsonb),
    'grading_runtime_version', match.grading_runtime_version,
    'grading_result', grading.result,
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
  left join lateral (
    select private.wheel_football_grading_result_json(challenge.id) as result
  ) grading on true
  where challenge.id = p_challenge_id;
$$;

create or replace function private.create_wheel_football_challenge(
  p_recipient_id uuid,
  p_pool_scope text,
  p_division text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_creator_id uuid := auth.uid();
  v_creator_name text;
  v_scope text := upper(trim(coalesce(p_pool_scope, '')));
  v_division text;
  v_code text;
  v_attempt integer := 0;
  v_challenge_id uuid;
  v_created_at timestamptz;
  v_summary text;
begin
  if v_creator_id is null then
    raise exception 'sign in required';
  end if;

  if p_recipient_id is null or p_recipient_id = v_creator_id then
    raise exception 'choose another profile';
  end if;

  if not exists (select 1 from public.profiles where id = p_recipient_id) then
    raise exception 'profile not found';
  end if;

  if v_scope not in ('NFL', 'AFC', 'NFC', 'DIVISION') then
    raise exception 'invalid Wheel of Football pool';
  end if;

  if v_scope = 'DIVISION' then
    v_division := case upper(trim(coalesce(p_division, '')))
      when 'AFC EAST' then 'AFC East'
      when 'AFC NORTH' then 'AFC North'
      when 'AFC SOUTH' then 'AFC South'
      when 'AFC WEST' then 'AFC West'
      when 'NFC EAST' then 'NFC East'
      when 'NFC NORTH' then 'NFC North'
      when 'NFC SOUTH' then 'NFC South'
      when 'NFC WEST' then 'NFC West'
      else null
    end;
    if v_division is null then
      raise exception 'choose an NFL division';
    end if;
  else
    v_division := null;
  end if;

  select profile.display_name
    into v_creator_name
  from public.profiles profile
  where profile.id = v_creator_id;

  v_summary := 'Current NFL · ' || case
    when v_scope = 'NFL' then 'Full NFL'
    when v_scope = 'DIVISION' then v_division
    else v_scope
  end;

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
        'wheel-football',
        'football-wheel-v2-grades',
        'Wheel of Football',
        v_summary,
        v_creator_id,
        p_recipient_id,
        '/football/wheel?match=' || v_code,
        jsonb_build_object(
          'poolScope', v_scope,
          'division', v_division,
          'currentOnly', true,
          'gradingVersion', 'nfl-wheel-grade-runtime-v1',
          'rosterSlots', jsonb_build_array('QB', 'RB', 'WR', 'Flex', 'Front Seven', 'Secondary', 'Head Coach')
        ),
        jsonb_build_object('status', 'in-progress')
      )
      returning id, created_at into v_challenge_id, v_created_at;
      exit;
    exception when unique_violation then
      if v_attempt >= 5 then raise; end if;
    end;
  end loop;

  insert into private.wheel_football_matches (
    challenge_id,
    pool_scope,
    division,
    grading_runtime_version,
    grading_cutoff_at
  ) values (
    v_challenge_id,
    v_scope,
    v_division,
    'nfl-wheel-grade-runtime-v1',
    v_created_at
  );

  perform private.publish_notification_to_profile(
    p_recipient_id,
    'wheel-football:received:' || v_code || ':' || p_recipient_id::text,
    'play-challenges:received',
    'game_challenge_received',
    'You were challenged',
    v_creator_name || ' challenged you to Wheel of Football.',
    '/football/wheel?match=' || v_code,
    'PLAY',
    v_created_at
  );

  return v_code;
end;
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
  v_next_turn_count integer;
  v_next_profile uuid;
  v_actor_name text;
  v_creator_roster jsonb;
  v_recipient_roster jsonb;
  v_grade_snapshot jsonb;
  v_grade_family text;
  v_selection_grade integer;
  v_grade_effective_date date;
  v_grade_version text;
  v_grade_source_artifact text;
  v_grading_result jsonb;
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

  if v_match.grading_runtime_version is not null then
    v_grade_snapshot := private.wheel_football_grade_snapshot_json(
      v_match.pending_team_code,
      trim(p_display_name),
      v_abbreviation,
      v_slot,
      v_match.grading_cutoff_at
    );

    if v_grade_snapshot is null then
      raise exception 'No authoritative Wheel grade found for % (% / % / %)',
        trim(p_display_name), v_match.pending_team_code, v_abbreviation, v_slot;
    end if;

    v_grade_family := v_grade_snapshot ->> 'family';
    v_selection_grade := (v_grade_snapshot ->> 'grade')::integer;
    v_grade_effective_date := (v_grade_snapshot ->> 'effectiveDate')::date;
    v_grade_version := v_grade_snapshot ->> 'version';
    v_grade_source_artifact := v_grade_snapshot ->> 'sourceArtifact';
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
    grade_family,
    selection_grade,
    grade_effective_date,
    grade_version,
    grade_source_artifact
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
    v_grade_family,
    v_selection_grade,
    v_grade_effective_date,
    v_grade_version,
    v_grade_source_artifact
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

    select coalesce(jsonb_agg(
      jsonb_build_object(
        'turnNumber', pick.turn_number,
        'teamCode', pick.team_code,
        'rosterSlot', pick.roster_slot,
        'athleteId', pick.athlete_id,
        'displayName', pick.display_name,
        'position', pick.position_abbreviation,
        'gradeFamily', pick.grade_family,
        'grade', pick.selection_grade,
        'gradeEffectiveDate', pick.grade_effective_date,
        'gradeVersion', pick.grade_version
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
        'position', pick.position_abbreviation,
        'gradeFamily', pick.grade_family,
        'grade', pick.selection_grade,
        'gradeEffectiveDate', pick.grade_effective_date,
        'gradeVersion', pick.grade_version
      )
      order by pick.turn_number
    ), '[]'::jsonb)
      into v_recipient_roster
    from private.wheel_football_picks pick
    where pick.challenge_id = v_challenge.id
      and pick.profile_id = v_challenge.recipient_id;

    v_grading_result := private.wheel_football_grading_result_json(v_challenge.id);

    if v_match.grading_runtime_version is not null and v_grading_result is null then
      raise exception 'Wheel grading result could not be finalized from the frozen pick grades';
    end if;

    update public.play_challenges challenge
    set creator_result = jsonb_build_object(
          'complete', true,
          'roster', v_creator_roster,
          'grading', case when v_grading_result is null then null else v_grading_result -> 'creator' end,
          'winnerProfileId', case when v_grading_result is null then null else v_grading_result -> 'winner_profile_id' end,
          'tied', case when v_grading_result is null then null else v_grading_result -> 'tied' end
        ),
        responder_result = jsonb_build_object(
          'complete', true,
          'roster', v_recipient_roster,
          'grading', case when v_grading_result is null then null else v_grading_result -> 'recipient' end,
          'winnerProfileId', case when v_grading_result is null then null else v_grading_result -> 'winner_profile_id' end,
          'tied', case when v_grading_result is null then null else v_grading_result -> 'tied' end
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
      v_actor_name || ' made the final pick. Both Superteams are locked.',
      '/football/wheel?match=' || v_challenge.code,
      'VIEW SUPERTEAMS',
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

revoke all on function private.wheel_football_grade_name_key(text) from public, anon, authenticated;
revoke all on function private.wheel_football_grade_family(text, text) from public, anon, authenticated;
revoke all on function private.wheel_football_grade_snapshot_json(text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function private.wheel_football_presentation_score(integer, integer) from public, anon, authenticated;
revoke all on function private.wheel_football_grading_result_json(uuid) from public, anon, authenticated;

comment on table private.wheel_football_nfl_grades is
  'Server-only versioned NFL Wheel grade authority. Effective-dated rows are retained so a match can resolve the grade era frozen at creation.';
comment on column private.wheel_football_picks.selection_grade is
  'Frozen authoritative grade captured at selection time; never recomputed from the current master grade table.';
comment on function private.wheel_football_presentation_score(integer, integer) is
  'Reveal-only linear presentation curve: raw 75=>50, 80=>60, 85=>70, 90=>80, 95=>90, 100=>100. Raw grade totals determine the winner.';
