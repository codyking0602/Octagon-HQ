-- Stage 19: Best CFB Teams Draft Room.
-- Reuses the shared sealed-bid engine. Hidden grades and board calibration remain server-owned.
-- Current-conference buckets are a board mechanic only; historical subject cards do not rewrite conference history.

alter table private.auction_catalog_versions drop constraint auction_catalog_versions_game_id_check;
alter table private.auction_catalog_versions add constraint auction_catalog_versions_game_id_check
check (game_id in (
  'auction','draft-room','draft-room-trio','draft-room-longhorns','draft-room-longhorn-teams',
  'draft-room-cowboys','draft-room-cowboys-teams','draft-room-cfb-best-teams'
));

create or replace function private.auction_game_id_for_mode(p_mode_id text)
returns text language sql immutable set search_path = '' as $$
  select case when p_mode_id in (
    'build-qb','build-qb-cfb','trio-nfl','trio-cfb','longhorns-2005','longhorns-teams-2005',
    'cowboys-2007','cowboys-teams-2007','cfb-best-teams'
  ) then 'draft-room' else 'auction' end;
$$;

create or replace function private.auction_catalog_game_id_for_mode(p_mode_id text)
returns text language sql immutable set search_path = '' as $$
  select case
    when p_mode_id in ('trio-nfl','trio-cfb') then 'draft-room-trio'
    when p_mode_id = 'longhorns-2005' then 'draft-room-longhorns'
    when p_mode_id = 'longhorns-teams-2005' then 'draft-room-longhorn-teams'
    when p_mode_id = 'cowboys-2007' then 'draft-room-cowboys'
    when p_mode_id = 'cowboys-teams-2007' then 'draft-room-cowboys-teams'
    when p_mode_id = 'cfb-best-teams' then 'draft-room-cfb-best-teams'
    when p_mode_id in ('build-qb','build-qb-cfb') then 'draft-room'
    else 'auction' end;
$$;

revoke all on function private.auction_game_id_for_mode(text) from public, anon, authenticated;
revoke all on function private.auction_catalog_game_id_for_mode(text) from public, anon, authenticated;

insert into private.auction_catalog_versions(content_version,rarity_version,grading_version,is_preparation_version,game_id)
values (
  'football-draft-room-cfb-best-teams-2026-09-v1',
  'football-draft-room-cfb-best-teams-board-2026-09-v1',
  'football-draft-room-cfb-best-teams-grading-2026-09-v1',
  true,
  'draft-room-cfb-best-teams'
);

create table private.draft_room_cfb_best_teams_pool (
  season_reference text primary key,
  season_year integer not null check (season_year between 2000 and 2025),
  school text not null,
  conference_bucket text not null check (conference_bucket in ('SEC','Big Ten','Big 12','ACC','Notre Dame')),
  display_label text not null unique,
  hidden_grade numeric(5,2) not null check (hidden_grade between 80 and 100),
  unique(school,season_year)
);

insert into private.draft_room_cfb_best_teams_pool(season_reference,season_year,school,conference_bucket,display_label,hidden_grade) values
  ('cfb-best-oklahoma-2000', 2000, 'Oklahoma', 'SEC', 'Oklahoma · 2000', 95.5),
  ('cfb-best-lsu-2003', 2003, 'LSU', 'SEC', 'LSU · 2003', 95.0),
  ('cfb-best-auburn-2004', 2004, 'Auburn', 'SEC', 'Auburn · 2004', 95.0),
  ('cfb-best-texas-2005', 2005, 'Texas', 'SEC', 'Texas · 2005', 98.5),
  ('cfb-best-florida-2006', 2006, 'Florida', 'SEC', 'Florida · 2006', 94.5),
  ('cfb-best-lsu-2007', 2007, 'LSU', 'SEC', 'LSU · 2007', 94.0),
  ('cfb-best-florida-2008', 2008, 'Florida', 'SEC', 'Florida · 2008', 97.5),
  ('cfb-best-oklahoma-2008', 2008, 'Oklahoma', 'SEC', 'Oklahoma · 2008', 94.0),
  ('cfb-best-alabama-2009', 2009, 'Alabama', 'SEC', 'Alabama · 2009', 97.0),
  ('cfb-best-auburn-2010', 2010, 'Auburn', 'SEC', 'Auburn · 2010', 95.5),
  ('cfb-best-alabama-2011', 2011, 'Alabama', 'SEC', 'Alabama · 2011', 97.5),
  ('cfb-best-lsu-2011', 2011, 'LSU', 'SEC', 'LSU · 2011', 96.0),
  ('cfb-best-alabama-2012', 2012, 'Alabama', 'SEC', 'Alabama · 2012', 96.5),
  ('cfb-best-texas-aandm-2012', 2012, 'Texas A&M', 'SEC', 'Texas A&M · 2012', 91.0),
  ('cfb-best-auburn-2013', 2013, 'Auburn', 'SEC', 'Auburn · 2013', 92.0),
  ('cfb-best-missouri-2013', 2013, 'Missouri', 'SEC', 'Missouri · 2013', 89.0),
  ('cfb-best-south-carolina-2013', 2013, 'South Carolina', 'SEC', 'South Carolina · 2013', 90.5),
  ('cfb-best-mississippi-state-2014', 2014, 'Mississippi State', 'SEC', 'Mississippi State · 2014', 88.5),
  ('cfb-best-alabama-2015', 2015, 'Alabama', 'SEC', 'Alabama · 2015', 95.5),
  ('cfb-best-alabama-2016', 2016, 'Alabama', 'SEC', 'Alabama · 2016', 96.0),
  ('cfb-best-georgia-2017', 2017, 'Georgia', 'SEC', 'Georgia · 2017', 94.0),
  ('cfb-best-arkansas-2011', 2011, 'Arkansas', 'SEC', 'Arkansas · 2011', 89.5),
  ('cfb-best-lsu-2019', 2019, 'LSU', 'SEC', 'LSU · 2019', 100.0),
  ('cfb-best-alabama-2020', 2020, 'Alabama', 'SEC', 'Alabama · 2020', 99.0),
  ('cfb-best-georgia-2021', 2021, 'Georgia', 'SEC', 'Georgia · 2021', 96.0),
  ('cfb-best-ole-miss-2023', 2023, 'Ole Miss', 'SEC', 'Ole Miss · 2023', 89.5),
  ('cfb-best-tennessee-2022', 2022, 'Tennessee', 'SEC', 'Tennessee · 2022', 91.5),
  ('cfb-best-georgia-2022', 2022, 'Georgia', 'SEC', 'Georgia · 2022', 98.5),
  ('cfb-best-georgia-2023', 2023, 'Georgia', 'SEC', 'Georgia · 2023', 94.0),
  ('cfb-best-texas-2023', 2023, 'Texas', 'SEC', 'Texas · 2023', 93.0),
  ('cfb-best-kentucky-2018', 2018, 'Kentucky', 'SEC', 'Kentucky · 2018', 86.0),
  ('cfb-best-vanderbilt-2025', 2025, 'Vanderbilt', 'SEC', 'Vanderbilt · 2025', 87.5),
  ('cfb-best-nebraska-2001', 2001, 'Nebraska', 'Big Ten', 'Nebraska · 2001', 91.0),
  ('cfb-best-ohio-state-2002', 2002, 'Ohio State', 'Big Ten', 'Ohio State · 2002', 94.5),
  ('cfb-best-usc-2003', 2003, 'USC', 'Big Ten', 'USC · 2003', 95.0),
  ('cfb-best-usc-2004', 2004, 'USC', 'Big Ten', 'USC · 2004', 98.5),
  ('cfb-best-usc-2005', 2005, 'USC', 'Big Ten', 'USC · 2005', 96.5),
  ('cfb-best-penn-state-2005', 2005, 'Penn State', 'Big Ten', 'Penn State · 2005', 91.5),
  ('cfb-best-ohio-state-2006', 2006, 'Ohio State', 'Big Ten', 'Ohio State · 2006', 93.5),
  ('cfb-best-usc-2008', 2008, 'USC', 'Big Ten', 'USC · 2008', 93.5),
  ('cfb-best-iowa-2009', 2009, 'Iowa', 'Big Ten', 'Iowa · 2009', 89.5),
  ('cfb-best-oregon-2010', 2010, 'Oregon', 'Big Ten', 'Oregon · 2010', 93.5),
  ('cfb-best-wisconsin-2010', 2010, 'Wisconsin', 'Big Ten', 'Wisconsin · 2010', 89.5),
  ('cfb-best-wisconsin-2011', 2011, 'Wisconsin', 'Big Ten', 'Wisconsin · 2011', 90.5),
  ('cfb-best-oregon-2012', 2012, 'Oregon', 'Big Ten', 'Oregon · 2012', 93.0),
  ('cfb-best-michigan-state-2013', 2013, 'Michigan State', 'Big Ten', 'Michigan State · 2013', 92.5),
  ('cfb-best-ohio-state-2014', 2014, 'Ohio State', 'Big Ten', 'Ohio State · 2014', 96.0),
  ('cfb-best-oregon-2014', 2014, 'Oregon', 'Big Ten', 'Oregon · 2014', 94.0),
  ('cfb-best-iowa-2015', 2015, 'Iowa', 'Big Ten', 'Iowa · 2015', 89.0),
  ('cfb-best-michigan-state-2015', 2015, 'Michigan State', 'Big Ten', 'Michigan State · 2015', 90.0),
  ('cfb-best-penn-state-2016', 2016, 'Penn State', 'Big Ten', 'Penn State · 2016', 90.5),
  ('cfb-best-washington-2016', 2016, 'Washington', 'Big Ten', 'Washington · 2016', 92.0),
  ('cfb-best-wisconsin-2017', 2017, 'Wisconsin', 'Big Ten', 'Wisconsin · 2017', 91.0),
  ('cfb-best-ohio-state-2019', 2019, 'Ohio State', 'Big Ten', 'Ohio State · 2019', 95.0),
  ('cfb-best-minnesota-2019', 2019, 'Minnesota', 'Big Ten', 'Minnesota · 2019', 88.5),
  ('cfb-best-ohio-state-2020', 2020, 'Ohio State', 'Big Ten', 'Ohio State · 2020', 92.5),
  ('cfb-best-michigan-2021', 2021, 'Michigan', 'Big Ten', 'Michigan · 2021', 90.5),
  ('cfb-best-michigan-2022', 2022, 'Michigan', 'Big Ten', 'Michigan · 2022', 92.0),
  ('cfb-best-michigan-2023', 2023, 'Michigan', 'Big Ten', 'Michigan · 2023', 97.5),
  ('cfb-best-washington-2023', 2023, 'Washington', 'Big Ten', 'Washington · 2023', 94.0),
  ('cfb-best-oregon-2024', 2024, 'Oregon', 'Big Ten', 'Oregon · 2024', 93.5),
  ('cfb-best-ohio-state-2024', 2024, 'Ohio State', 'Big Ten', 'Ohio State · 2024', 95.5),
  ('cfb-best-penn-state-2024', 2024, 'Penn State', 'Big Ten', 'Penn State · 2024', 92.0),
  ('cfb-best-indiana-2025', 2025, 'Indiana', 'Big Ten', 'Indiana · 2025', 98.5),
  ('cfb-best-colorado-2001', 2001, 'Colorado', 'Big 12', 'Colorado · 2001', 88.5),
  ('cfb-best-utah-2004', 2004, 'Utah', 'Big 12', 'Utah · 2004', 90.5),
  ('cfb-best-west-virginia-2005', 2005, 'West Virginia', 'Big 12', 'West Virginia · 2005', 90.5),
  ('cfb-best-kansas-2007', 2007, 'Kansas', 'Big 12', 'Kansas · 2007', 90.0),
  ('cfb-best-west-virginia-2007', 2007, 'West Virginia', 'Big 12', 'West Virginia · 2007', 91.0),
  ('cfb-best-utah-2008', 2008, 'Utah', 'Big 12', 'Utah · 2008', 92.5),
  ('cfb-best-texas-tech-2008', 2008, 'Texas Tech', 'Big 12', 'Texas Tech · 2008', 90.0),
  ('cfb-best-cincinnati-2009', 2009, 'Cincinnati', 'Big 12', 'Cincinnati · 2009', 89.0),
  ('cfb-best-tcu-2010', 2010, 'TCU', 'Big 12', 'TCU · 2010', 94.0),
  ('cfb-best-houston-2011', 2011, 'Houston', 'Big 12', 'Houston · 2011', 88.5),
  ('cfb-best-oklahoma-state-2011', 2011, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2011', 93.0),
  ('cfb-best-kansas-state-2012', 2012, 'Kansas State', 'Big 12', 'Kansas State · 2012', 89.5),
  ('cfb-best-baylor-2013', 2013, 'Baylor', 'Big 12', 'Baylor · 2013', 91.0),
  ('cfb-best-ucf-2013', 2013, 'UCF', 'Big 12', 'UCF · 2013', 89.0),
  ('cfb-best-arizona-2014', 2014, 'Arizona', 'Big 12', 'Arizona · 2014', 87.5),
  ('cfb-best-baylor-2014', 2014, 'Baylor', 'Big 12', 'Baylor · 2014', 90.5),
  ('cfb-best-tcu-2014', 2014, 'TCU', 'Big 12', 'TCU · 2014', 93.5),
  ('cfb-best-houston-2015', 2015, 'Houston', 'Big 12', 'Houston · 2015', 89.0),
  ('cfb-best-ucf-2017', 2017, 'UCF', 'Big 12', 'UCF · 2017', 91.5),
  ('cfb-best-byu-2020', 2020, 'BYU', 'Big 12', 'BYU · 2020', 89.5),
  ('cfb-best-iowa-state-2020', 2020, 'Iowa State', 'Big 12', 'Iowa State · 2020', 87.5),
  ('cfb-best-baylor-2021', 2021, 'Baylor', 'Big 12', 'Baylor · 2021', 90.0),
  ('cfb-best-cincinnati-2021', 2021, 'Cincinnati', 'Big 12', 'Cincinnati · 2021', 91.5),
  ('cfb-best-oklahoma-state-2021', 2021, 'Oklahoma State', 'Big 12', 'Oklahoma State · 2021', 90.5),
  ('cfb-best-kansas-state-2022', 2022, 'Kansas State', 'Big 12', 'Kansas State · 2022', 88.5),
  ('cfb-best-tcu-2022', 2022, 'TCU', 'Big 12', 'TCU · 2022', 91.5),
  ('cfb-best-arizona-2023', 2023, 'Arizona', 'Big 12', 'Arizona · 2023', 87.5),
  ('cfb-best-arizona-state-2024', 2024, 'Arizona State', 'Big 12', 'Arizona State · 2024', 89.0),
  ('cfb-best-byu-2024', 2024, 'BYU', 'Big 12', 'BYU · 2024', 88.5),
  ('cfb-best-iowa-state-2024', 2024, 'Iowa State', 'Big 12', 'Iowa State · 2024', 88.0),
  ('cfb-best-texas-tech-2025', 2025, 'Texas Tech', 'Big 12', 'Texas Tech · 2025', 91.0),
  ('cfb-best-byu-2025', 2025, 'BYU', 'Big 12', 'BYU · 2025', 88.5),
  ('cfb-best-miami-2000', 2000, 'Miami', 'ACC', 'Miami · 2000', 94.0),
  ('cfb-best-miami-2001', 2001, 'Miami', 'ACC', 'Miami · 2001', 100.0),
  ('cfb-best-miami-2002', 2002, 'Miami', 'ACC', 'Miami · 2002', 96.0),
  ('cfb-best-florida-state-2000', 2000, 'Florida State', 'ACC', 'Florida State · 2000', 92.5),
  ('cfb-best-nc-state-2002', 2002, 'NC State', 'ACC', 'NC State · 2002', 87.5),
  ('cfb-best-california-2004', 2004, 'California', 'ACC', 'California · 2004', 90.0),
  ('cfb-best-virginia-tech-2004', 2004, 'Virginia Tech', 'ACC', 'Virginia Tech · 2004', 89.5),
  ('cfb-best-virginia-tech-2005', 2005, 'Virginia Tech', 'ACC', 'Virginia Tech · 2005', 90.0),
  ('cfb-best-louisville-2006', 2006, 'Louisville', 'ACC', 'Louisville · 2006', 91.0),
  ('cfb-best-wake-forest-2006', 2006, 'Wake Forest', 'ACC', 'Wake Forest · 2006', 87.0),
  ('cfb-best-boston-college-2007', 2007, 'Boston College', 'ACC', 'Boston College · 2007', 87.5),
  ('cfb-best-virginia-tech-2007', 2007, 'Virginia Tech', 'ACC', 'Virginia Tech · 2007', 89.5),
  ('cfb-best-virginia-tech-2010', 2010, 'Virginia Tech', 'ACC', 'Virginia Tech · 2010', 89.5),
  ('cfb-best-stanford-2010', 2010, 'Stanford', 'ACC', 'Stanford · 2010', 92.0),
  ('cfb-best-stanford-2011', 2011, 'Stanford', 'ACC', 'Stanford · 2011', 90.0),
  ('cfb-best-florida-state-2012', 2012, 'Florida State', 'ACC', 'Florida State · 2012', 90.5),
  ('cfb-best-stanford-2012', 2012, 'Stanford', 'ACC', 'Stanford · 2012', 91.5),
  ('cfb-best-duke-2013', 2013, 'Duke', 'ACC', 'Duke · 2013', 86.5),
  ('cfb-best-florida-state-2013', 2013, 'Florida State', 'ACC', 'Florida State · 2013', 98.5),
  ('cfb-best-louisville-2013', 2013, 'Louisville', 'ACC', 'Louisville · 2013', 90.5),
  ('cfb-best-florida-state-2014', 2014, 'Florida State', 'ACC', 'Florida State · 2014', 91.5),
  ('cfb-best-georgia-tech-2014', 2014, 'Georgia Tech', 'ACC', 'Georgia Tech · 2014', 89.5),
  ('cfb-best-stanford-2015', 2015, 'Stanford', 'ACC', 'Stanford · 2015', 92.0),
  ('cfb-best-clemson-2015', 2015, 'Clemson', 'ACC', 'Clemson · 2015', 94.5),
  ('cfb-best-north-carolina-2015', 2015, 'North Carolina', 'ACC', 'North Carolina · 2015', 88.5),
  ('cfb-best-clemson-2016', 2016, 'Clemson', 'ACC', 'Clemson · 2016', 96.5),
  ('cfb-best-clemson-2018', 2018, 'Clemson', 'ACC', 'Clemson · 2018', 99.0),
  ('cfb-best-clemson-2019', 2019, 'Clemson', 'ACC', 'Clemson · 2019', 94.5),
  ('cfb-best-pitt-2021', 2021, 'Pitt', 'ACC', 'Pitt · 2021', 89.0),
  ('cfb-best-florida-state-2023', 2023, 'Florida State', 'ACC', 'Florida State · 2023', 92.0),
  ('cfb-best-smu-2024', 2024, 'SMU', 'ACC', 'SMU · 2024', 88.5),
  ('cfb-best-miami-2025', 2025, 'Miami', 'ACC', 'Miami · 2025', 93.0),
  ('cfb-best-notre-dame-2012', 2012, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2012', 92.5),
  ('cfb-best-notre-dame-2018', 2018, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2018', 91.5),
  ('cfb-best-notre-dame-2020', 2020, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2020', 90.0),
  ('cfb-best-notre-dame-2024', 2024, 'Notre Dame', 'Notre Dame', 'Notre Dame · 2024', 94.0);

create table private.draft_room_cfb_best_teams_board_shapes (
  shape text primary key check (shape in ('Wide','Balanced','TopHeavy','BottomHeavy','Compressed','Chaotic')),
  roll_start numeric(6,5) not null,
  roll_end numeric(6,5) not null,
  check (roll_start >= 0 and roll_start < roll_end and roll_end <= 1)
);

insert into private.draft_room_cfb_best_teams_board_shapes(shape,roll_start,roll_end) values
  ('Wide',0.00,0.14),
  ('Balanced',0.14,0.43),
  ('TopHeavy',0.43,0.56),
  ('BottomHeavy',0.56,0.69),
  ('Compressed',0.69,0.87),
  ('Chaotic',0.87,1.00);

create table private.draft_room_cfb_best_teams_board_variants (
  shape text not null references private.draft_room_cfb_best_teams_board_shapes(shape),
  variant integer not null check (variant between 1 and 4),
  target_percentiles numeric[] not null check (cardinality(target_percentiles)=8),
  primary key(shape,variant)
);

insert into private.draft_room_cfb_best_teams_board_variants(shape,variant,target_percentiles) values
  ('Wide', 1, array[1.00, 0.88, 0.74, 0.60, 0.44, 0.30, 0.16, 0.02]::numeric[]),
  ('Wide', 2, array[0.98, 0.84, 0.70, 0.56, 0.42, 0.28, 0.14, 0.04]::numeric[]),
  ('Wide', 3, array[0.96, 0.90, 0.72, 0.58, 0.40, 0.26, 0.12, 0.00]::numeric[]),
  ('Wide', 4, array[1.00, 0.82, 0.68, 0.54, 0.46, 0.32, 0.18, 0.06]::numeric[]),
  ('Balanced', 1, array[0.92, 0.82, 0.72, 0.62, 0.52, 0.42, 0.32, 0.22]::numeric[]),
  ('Balanced', 2, array[0.88, 0.78, 0.68, 0.58, 0.48, 0.38, 0.28, 0.18]::numeric[]),
  ('Balanced', 3, array[0.96, 0.84, 0.72, 0.60, 0.50, 0.40, 0.30, 0.20]::numeric[]),
  ('Balanced', 4, array[0.90, 0.80, 0.70, 0.60, 0.50, 0.40, 0.30, 0.24]::numeric[]),
  ('TopHeavy', 1, array[1.00, 0.96, 0.90, 0.84, 0.66, 0.52, 0.40, 0.28]::numeric[]),
  ('TopHeavy', 2, array[0.98, 0.92, 0.88, 0.80, 0.62, 0.50, 0.38, 0.26]::numeric[]),
  ('TopHeavy', 3, array[1.00, 0.94, 0.86, 0.78, 0.64, 0.54, 0.44, 0.32]::numeric[]),
  ('TopHeavy', 4, array[0.96, 0.90, 0.84, 0.76, 0.60, 0.48, 0.36, 0.24]::numeric[]),
  ('BottomHeavy', 1, array[0.80, 0.68, 0.58, 0.48, 0.38, 0.30, 0.22, 0.14]::numeric[]),
  ('BottomHeavy', 2, array[0.84, 0.70, 0.56, 0.46, 0.36, 0.28, 0.20, 0.12]::numeric[]),
  ('BottomHeavy', 3, array[0.76, 0.64, 0.54, 0.44, 0.34, 0.26, 0.18, 0.10]::numeric[]),
  ('BottomHeavy', 4, array[0.82, 0.66, 0.52, 0.42, 0.32, 0.24, 0.16, 0.08]::numeric[]),
  ('Compressed', 1, array[0.94, 0.90, 0.86, 0.82, 0.78, 0.74, 0.70, 0.66]::numeric[]),
  ('Compressed', 2, array[0.76, 0.72, 0.68, 0.64, 0.60, 0.56, 0.52, 0.48]::numeric[]),
  ('Compressed', 3, array[0.56, 0.52, 0.48, 0.44, 0.40, 0.36, 0.32, 0.28]::numeric[]),
  ('Compressed', 4, array[0.70, 0.66, 0.62, 0.58, 0.54, 0.50, 0.46, 0.42]::numeric[]),
  ('Chaotic', 1, array[1.00, 0.78, 0.92, 0.34, 0.62, 0.16, 0.48, 0.04]::numeric[]),
  ('Chaotic', 2, array[0.88, 0.24, 0.72, 0.98, 0.42, 0.10, 0.56, 0.30]::numeric[]),
  ('Chaotic', 3, array[0.66, 0.96, 0.20, 0.82, 0.06, 0.54, 0.38, 0.90]::numeric[]),
  ('Chaotic', 4, array[0.44, 0.84, 0.14, 1.00, 0.58, 0.28, 0.74, 0.02]::numeric[]);

create table private.draft_room_cfb_best_teams_board_entries (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position between 1 and 8),
  item_reference text not null,
  board_kind text not null check (board_kind in ('single','split')),
  conference_one text not null check (conference_one in ('SEC','Big Ten','Big 12','ACC')),
  conference_two text,
  notre_dame_wildcard boolean not null default false,
  board_shape text not null references private.draft_room_cfb_best_teams_board_shapes(shape),
  board_variant integer not null check (board_variant between 1 and 4),
  strength_slot integer not null check (strength_slot between 1 and 8),
  season_reference text not null references private.draft_room_cfb_best_teams_pool(season_reference),
  display_label text not null,
  primary key(auction_id,deck_position),
  unique(auction_id,item_reference),
  unique(auction_id,season_reference),
  unique(auction_id,strength_slot),
  check (
    (board_kind='single' and conference_two is null and not notre_dame_wildcard)
    or (board_kind='split' and conference_two is not null and conference_two<>conference_one)
  )
);

create or replace function private.protect_draft_room_cfb_best_teams_calibration()
returns trigger language plpgsql set search_path='' as $$
begin raise exception 'Best CFB Teams calibration records are immutable'; end;
$$;

create trigger draft_room_cfb_best_teams_pool_immutable before update or delete on private.draft_room_cfb_best_teams_pool
for each row execute function private.protect_draft_room_cfb_best_teams_calibration();
create trigger draft_room_cfb_best_teams_shapes_immutable before update or delete on private.draft_room_cfb_best_teams_board_shapes
for each row execute function private.protect_draft_room_cfb_best_teams_calibration();
create trigger draft_room_cfb_best_teams_variants_immutable before update or delete on private.draft_room_cfb_best_teams_board_variants
for each row execute function private.protect_draft_room_cfb_best_teams_calibration();

create or replace function private.protect_draft_room_cfb_best_teams_board_entry()
returns trigger language plpgsql set search_path='' as $$
begin
  if tg_op='DELETE' and not exists(select 1 from private.auction_games where id=old.auction_id) then return old; end if;
  raise exception 'Best CFB Teams board entries are immutable';
end;
$$;
create trigger draft_room_cfb_best_teams_board_entries_immutable before update or delete on private.draft_room_cfb_best_teams_board_entries
for each row execute function private.protect_draft_room_cfb_best_teams_board_entry();

revoke all on private.draft_room_cfb_best_teams_pool from public,anon,authenticated;
revoke all on private.draft_room_cfb_best_teams_board_shapes from public,anon,authenticated;
revoke all on private.draft_room_cfb_best_teams_board_variants from public,anon,authenticated;
revoke all on private.draft_room_cfb_best_teams_board_entries from public,anon,authenticated;
revoke all on function private.protect_draft_room_cfb_best_teams_calibration() from public,anon,authenticated;
revoke all on function private.protect_draft_room_cfb_best_teams_board_entry() from public,anon,authenticated;

create or replace function private.generate_draft_room_cfb_best_teams_deck(p_auction_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
  v_game private.auction_games;
  v_kind text;
  v_one text;
  v_two text;
  v_nd boolean := false;
  v_nd_replaces_one boolean := false;
  v_shape text;
  v_shape_roll double precision;
  v_variant integer;
  v_targets numeric[];
  v_slot integer;
  v_context text;
  v_target numeric;
  v_pick private.draft_room_cfb_best_teams_pool;
  v_refs text[] := array[]::text[];
  v_shuffled text[];
  v_position integer;
  v_board_token text;
  v_item_reference text;
begin
  select * into v_game from private.auction_games where id=p_auction_id for update;
  if v_game.id is null or v_game.mode_id<>'cfb-best-teams' then
    raise exception 'Best CFB Teams deck generation requires a matching room';
  end if;
  if exists(select 1 from private.auction_deck_entries where auction_id=p_auction_id)
    or exists(select 1 from private.draft_room_cfb_best_teams_board_entries where auction_id=p_auction_id)
  then raise exception 'Best CFB Teams deck is already fixed'; end if;

  v_kind := case when random()<0.60 then 'single' else 'split' end;
  select conference_bucket into v_one
  from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where conference_bucket<>'Notre Dame') c
  order by random(),conference_bucket limit 1;

  if v_kind='split' then
    select conference_bucket into v_two
    from (select distinct conference_bucket from private.draft_room_cfb_best_teams_pool where conference_bucket not in ('Notre Dame',v_one)) c
    order by random(),conference_bucket limit 1;
    v_nd := random()<0.40;
    v_nd_replaces_one := v_nd and random()<0.50;
  end if;

  v_shape_roll := random();
  select shape into v_shape from private.draft_room_cfb_best_teams_board_shapes
  where v_shape_roll >= roll_start and v_shape_roll < roll_end
  order by roll_start limit 1;
  if v_shape is null then raise exception 'Best CFB Teams board shape roll was uncovered: %', v_shape_roll; end if;
  v_variant := floor(random()*4)::integer+1;
  select target_percentiles into v_targets from private.draft_room_cfb_best_teams_board_variants
  where shape=v_shape and variant=v_variant;

  for v_slot in 1..8 loop
    if v_kind='single' then
      v_context := v_one;
    elsif v_nd and v_slot=8 then
      v_context := 'Notre Dame';
    elsif v_nd_replaces_one then
      v_context := case when v_slot<=3 then v_one else v_two end;
    else
      v_context := case when v_slot<=4 then v_one else v_two end;
    end if;
    v_target := v_targets[v_slot];

    with ranked as (
      select season.*, percent_rank() over(order by hidden_grade,season_reference) as pct
      from private.draft_room_cfb_best_teams_pool season
      where season.conference_bucket=v_context
        and not (season.season_reference=any(v_refs))
    )
    select season_reference,season_year,school,conference_bucket,display_label,hidden_grade
    into v_pick
    from ranked
    where abs(pct-v_target)<=0.14
    order by random(),season_reference
    limit 1;

    if v_pick.season_reference is null then
      with ranked as (
        select season.*, percent_rank() over(order by hidden_grade,season_reference) as pct
        from private.draft_room_cfb_best_teams_pool season
        where season.conference_bucket=v_context
          and not (season.season_reference=any(v_refs))
      )
      select season_reference,season_year,school,conference_bucket,display_label,hidden_grade
      into v_pick
      from ranked order by abs(pct-v_target),random(),season_reference limit 1;
    end if;

    if v_pick.season_reference is null then raise exception 'Best CFB Teams board underfilled %',v_context; end if;
    v_refs:=array_append(v_refs,v_pick.season_reference);
  end loop;

  select array_agg(x order by random()) into v_shuffled from unnest(v_refs) x;
  if array_length(v_shuffled,1)<>8 then raise exception 'Best CFB Teams board shuffle failed'; end if;

  v_board_token := v_kind || '__' || replace(v_one,' ','%20') || '__'
    || coalesce(replace(v_two,' ','%20'),'none') || '__' || case when v_nd then 'nd' else 'no' end;

  for v_position in 1..8 loop
    select * into v_pick from private.draft_room_cfb_best_teams_pool where season_reference=v_shuffled[v_position];
    v_item_reference := v_pick.season_reference || '--board--' || v_board_token;
    insert into private.draft_room_cfb_best_teams_board_entries(
      auction_id,deck_position,item_reference,board_kind,conference_one,conference_two,notre_dame_wildcard,
      board_shape,board_variant,strength_slot,season_reference,display_label
    ) values (
      p_auction_id,v_position,v_item_reference,v_kind,v_one,v_two,v_nd,
      v_shape,v_variant,array_position(v_refs,v_pick.season_reference),v_pick.season_reference,v_pick.display_label
    );
    insert into private.auction_deck_entries(auction_id,deck_position,private_item_reference)
    values(p_auction_id,v_position,v_item_reference);
  end loop;

  if (select count(*) from private.draft_room_cfb_best_teams_board_entries where auction_id=p_auction_id)<>8
    or (select count(distinct season_reference) from private.draft_room_cfb_best_teams_board_entries where auction_id=p_auction_id)<>8
  then raise exception 'Best CFB Teams board generation drifted from eight unique seasons'; end if;
end;
$$;
revoke all on function private.generate_draft_room_cfb_best_teams_deck(uuid) from public,anon,authenticated;

create or replace function private.grade_draft_room_cfb_best_teams(p_auction_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare
  v_game private.auction_games;
  v_a_count integer; v_b_count integer;
  v_a numeric(5,2); v_b numeric(5,2); v_winner uuid;
begin
  select * into v_game from private.auction_games where id=p_auction_id for update;
  if v_game.id is null or v_game.mode_id<>'cfb-best-teams'
    or v_game.grading_version<>'football-draft-room-cfb-best-teams-grading-2026-09-v1'
  then raise exception 'Best CFB Teams grading boundary is invalid'; end if;

  select count(*),round(avg(season.hidden_grade),2) into v_a_count,v_a
  from private.auction_awards award
  join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id
  join private.draft_room_cfb_best_teams_board_entries entry on entry.auction_id=award.auction_id and entry.item_reference=deck.private_item_reference
  join private.draft_room_cfb_best_teams_pool season on season.season_reference=entry.season_reference
  where award.auction_id=p_auction_id and award.awarded_to=v_game.challenger_id;

  select count(*),round(avg(season.hidden_grade),2) into v_b_count,v_b
  from private.auction_awards award
  join private.auction_deck_entries deck on deck.id=award.deck_entry_id and deck.auction_id=award.auction_id
  join private.draft_room_cfb_best_teams_board_entries entry on entry.auction_id=award.auction_id and entry.item_reference=deck.private_item_reference
  join private.draft_room_cfb_best_teams_pool season on season.season_reference=entry.season_reference
  where award.auction_id=p_auction_id and award.awarded_to=v_game.recipient_id;

  if v_a_count<>4 or v_b_count<>4 then raise exception 'Best CFB Teams grading requires four seasons per player'; end if;
  v_winner:=case when v_a>v_b then v_game.challenger_id when v_b>v_a then v_game.recipient_id else null end;
  update private.auction_games set lifecycle_state='completed',challenger_final_score=v_a,recipient_final_score=v_b,
    winner_profile_id=v_winner,revision=revision+1,updated_at=now() where id=p_auction_id;
  update public.play_challenges set completed_at=coalesce(completed_at,now()),
    creator_result=jsonb_build_object('overall_score',v_a),responder_result=jsonb_build_object('overall_score',v_b)
  where id=v_game.challenge_id;
end;
$$;
revoke all on function private.grade_draft_room_cfb_best_teams(uuid) from public,anon,authenticated;

alter table private.auction_games
  drop constraint auction_games_mode_valid,
  drop constraint auction_games_round_valid,
  drop constraint auction_games_selection_counts_valid,
  drop constraint auction_games_bankroll_ceiling;

alter table private.auction_games
  add constraint auction_games_mode_valid check (mode_id in (
    'ultimate-fighter','jon-jones-performances','conor-mcgregor-performances','charles-oliveira-performances',
    'fighter-performances','strikers','grapplers','knockout-artists','greatest-ufc-card','championship-performances',
    'finishes','dominant-performances','wars','rivalries','iconic-moments','nicknames',
    'build-qb','build-qb-cfb','trio-nfl','trio-cfb','longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams'
  )),
  add constraint auction_games_round_valid check (
    current_round>=1 and current_round<=case
      when mode_id in ('trio-nfl','trio-cfb') then 6
      when mode_id in ('longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams') then 8
      when content_version='football-draft-room-2026-09-v6' and mode_id in ('build-qb','build-qb-cfb') then 8
      when mode_id in ('ultimate-fighter','build-qb','build-qb-cfb') then 10
      when lifecycle_state in ('completed','cancelled','abandoned') then 8
      when content_version in ('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 6
      else 8 end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id in ('trio-nfl','trio-cfb') then 3
      when mode_id in ('longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams') then 4
      when content_version='football-draft-room-2026-09-v6' and mode_id in ('build-qb','build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter','build-qb','build-qb-cfb') then 5
      when lifecycle_state in ('completed','cancelled','abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 3 else 4 end
    and recipient_selection_count between 0 and case
      when mode_id in ('trio-nfl','trio-cfb') then 3
      when mode_id in ('longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams') then 4
      when content_version='football-draft-room-2026-09-v6' and mode_id in ('build-qb','build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter','build-qb','build-qb-cfb') then 5
      when lifecycle_state in ('completed','cancelled','abandoned') then 4
      when content_version in ('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 3 else 4 end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll<=case
      when mode_id in ('trio-nfl','trio-cfb') then 30
      when mode_id in ('longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams') then 40
      when content_version='football-draft-room-2026-09-v6' and mode_id in ('build-qb','build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter','build-qb','build-qb-cfb') then 50
      when lifecycle_state in ('completed','cancelled','abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 30 else 40 end
    and recipient_bankroll<=case
      when mode_id in ('trio-nfl','trio-cfb') then 30
      when mode_id in ('longhorns-2005','longhorns-teams-2005','cowboys-2007','cowboys-teams-2007','cfb-best-teams') then 40
      when content_version='football-draft-room-2026-09-v6' and mode_id in ('build-qb','build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter','build-qb','build-qb-cfb') then 50
      when lifecycle_state in ('completed','cancelled','abandoned') then 40
      when content_version in ('ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5','ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8') then 30 else 40 end
  );

do $wire$
declare v_definition text; v_next text;
begin
  v_definition:=pg_get_functiondef('private.generate_auction_deck(uuid,text,text,integer,double precision[])'::regprocedure);
  v_next:=replace(v_definition,E'begin\n  if p_mode_id = ''cowboys-teams-2007'' then',
    E'begin\n  if p_mode_id = ''cfb-best-teams'' then\n    if p_count <> 8 then raise exception ''Best CFB Teams deck must contain eight seasons''; end if;\n    if p_random_order is not null then raise exception ''Injected random order is unavailable for Best CFB Teams rooms''; end if;\n    perform private.generate_draft_room_cfb_best_teams_deck(p_auction_id);\n    return;\n  end if;\n\n  if p_mode_id = ''cowboys-teams-2007'' then');
  if v_next=v_definition then raise exception 'Best CFB Teams generator contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
  v_next:=replace(v_definition,
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cowboys_teams_board_entries cowboy_team on cowboy_team.auction_id = auction.id',
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cfb_best_teams_board_entries cfb_team on cfb_team.auction_id = auction.id\n    where auction.id = new.auction_id\n      and auction.mode_id = ''cfb-best-teams''\n      and cfb_team.item_reference = new.private_item_reference\n  ) then\n    return new;\n  end if;\n\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cowboys_teams_board_entries cowboy_team on cowboy_team.auction_id = auction.id');
  if v_next=v_definition then raise exception 'Best CFB Teams deck validation contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next:=replace(v_definition,
    E'''cowboys-teams-2007'') then 8',
    E'''cowboys-teams-2007'', ''cfb-best-teams'') then 8');
  if v_next=v_definition then raise exception 'Best CFB Teams private-row contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next:=replace(v_definition,
    E'''cowboys-teams-2007'') then 4',
    E'''cowboys-teams-2007'', ''cfb-best-teams'') then 4');
  if v_next=v_definition then raise exception 'Best CFB Teams bid contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next:=replace(v_definition,E'''cowboys-teams-2007'') then 4',E'''cowboys-teams-2007'', ''cfb-best-teams'') then 4');
  v_next:=replace(v_next,E'''cowboys-teams-2007'') then 8',E'''cowboys-teams-2007'', ''cfb-best-teams'') then 8');
  if v_next=v_definition then raise exception 'Best CFB Teams round resolution contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next:=replace(v_definition,E'  if v_game.mode_id = ''cowboys-teams-2007''',
    E'  if v_game.mode_id = ''cfb-best-teams''\n    and v_game.grading_version = ''football-draft-room-cfb-best-teams-grading-2026-09-v1''\n  then\n    perform private.grade_draft_room_cfb_best_teams(p_auction_id);\n    return;\n  end if;\n\n  if v_game.mode_id = ''cowboys-teams-2007''');
  if v_next=v_definition then raise exception 'Best CFB Teams grading contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next:=replace(v_definition,E'    ''cowboys-teams-2007''',E'    ''cowboys-teams-2007'',\n    ''cfb-best-teams''');
  v_next:=replace(v_next,E'''cowboys-teams-2007'') then 8',E'''cowboys-teams-2007'', ''cfb-best-teams'') then 8');
  v_next:=replace(v_next,E'''cowboys-teams-2007'') then 40',E'''cowboys-teams-2007'', ''cfb-best-teams'') then 40');
  if v_next=v_definition then raise exception 'Best CFB Teams preparation contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next:=replace(v_definition,E'''cowboys-teams-2007'')',E'''cowboys-teams-2007'', ''cfb-best-teams'')');
  v_next:=replace(v_next,E'    when v_game.mode_id = ''cowboys-teams-2007'' then ''Cowboys Teams Since 2007''',
    E'    when v_game.mode_id = ''cowboys-teams-2007'' then ''Cowboys Teams Since 2007''\n    when v_game.mode_id = ''cfb-best-teams'' then ''Best CFB Teams''');
  v_next:=replace(v_next,E'when v_game.mode_id = ''cowboys-teams-2007'' then v_creator_name || '' challenged you to Cowboys Teams Since 2007.''',
    E'when v_game.mode_id = ''cowboys-teams-2007'' then v_creator_name || '' challenged you to Cowboys Teams Since 2007.''\n    when v_game.mode_id = ''cfb-best-teams'' then v_creator_name || '' challenged you to Best CFB Teams.''');
  if v_next=v_definition then raise exception 'Best CFB Teams first-bid contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure);
  v_next:=replace(v_definition,E'''cowboys-teams-2007'')',E'''cowboys-teams-2007'', ''cfb-best-teams'')');
  if v_next=v_definition then raise exception 'Best CFB Teams submit contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure);
  v_next:=replace(v_definition,E'''cowboys-teams-2007'')',E'''cowboys-teams-2007'', ''cfb-best-teams'')');
  if v_next=v_definition then raise exception 'Best CFB Teams decline contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('public.cancel_auction(uuid,bigint)'::regprocedure);
  v_next:=replace(v_definition,E'''cowboys-teams-2007'')',E'''cowboys-teams-2007'', ''cfb-best-teams'')');
  if v_next=v_definition then raise exception 'Best CFB Teams cancel contract drifted'; end if; execute v_next;

  v_definition:=pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
  v_next:=replace(v_definition,
    E'      left join private.draft_room_cowboys_teams_board_entries cowboy_team\n        on cowboy_team.auction_id = auction.id\n        and cowboy_team.item_reference = deck.private_item_reference',
    E'      left join private.draft_room_cowboys_teams_board_entries cowboy_team\n        on cowboy_team.auction_id = auction.id\n        and cowboy_team.item_reference = deck.private_item_reference\n      left join private.draft_room_cfb_best_teams_board_entries cfb_team\n        on cfb_team.auction_id = auction.id\n        and cfb_team.item_reference = deck.private_item_reference');
  v_next:=replace(v_next,
    E'        left join private.draft_room_cowboys_teams_board_entries cowboy_team\n          on cowboy_team.auction_id = auction.id\n          and cowboy_team.item_reference = deck.private_item_reference',
    E'        left join private.draft_room_cowboys_teams_board_entries cowboy_team\n          on cowboy_team.auction_id = auction.id\n          and cowboy_team.item_reference = deck.private_item_reference\n        left join private.draft_room_cfb_best_teams_board_entries cfb_team\n          on cfb_team.auction_id = auction.id\n          and cfb_team.item_reference = deck.private_item_reference');
  v_next:=replace(v_next,
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name, cowboy_team.display_label)',
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name, cowboy_team.display_label, cfb_team.display_label)');
  v_next:=replace(v_next,
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null or cowboy_team.item_reference is not null',
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null or cowboy_team.item_reference is not null or cfb_team.item_reference is not null');
  if v_next=v_definition then raise exception 'Best CFB Teams participant projection contract drifted'; end if; execute v_next;
end;
$wire$;

do $assert$
begin
  if (select count(*) from private.draft_room_cfb_best_teams_pool)<>132 then raise exception 'Best CFB Teams population must be 132'; end if;
  if (select count(*) from private.draft_room_cfb_best_teams_pool where conference_bucket='Notre Dame')<>4 then raise exception 'Notre Dame wildcard pool must be four seasons'; end if;
  if exists(
    select 1 from (values ('SEC',32),('Big Ten',32),('Big 12',32),('ACC',32)) expected(bucket,n)
    where (select count(*) from private.draft_room_cfb_best_teams_pool p where p.conference_bucket=expected.bucket)<>expected.n
  ) then raise exception 'Best CFB Teams conference populations drifted'; end if;
  if not exists(select 1 from private.draft_room_cfb_best_teams_pool where school='LSU' and season_year=2019 and hidden_grade=100)
    or not exists(select 1 from private.draft_room_cfb_best_teams_pool where school='Miami' and season_year=2001 and hidden_grade=100)
    or not exists(select 1 from private.draft_room_cfb_best_teams_pool where school='Indiana' and season_year=2025 and hidden_grade=98.5)
  then raise exception 'Best CFB Teams locked top grades drifted'; end if;
  if (select count(*) from private.draft_room_cfb_best_teams_board_shapes)<>6
    or (select count(*) from private.draft_room_cfb_best_teams_board_variants)<>24
    or (select sum(roll_end-roll_start) from private.draft_room_cfb_best_teams_board_shapes)<>1
  then raise exception 'Best CFB Teams board calibration is incomplete'; end if;
end;
$assert$;
