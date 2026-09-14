-- Stage 20: NFL Divisions Draft.
-- Reuses the existing server-owned sealed-bid Draft Room architecture.
-- The server randomizes either one current NFL division or a split of two divisions.
-- Single-division boards contain two seasons from each of the four franchises.
-- Split boards contain one season from each franchise across both divisions.
-- Population: four strongest 1999-2025 seasons per current franchise.
-- Records/postseason facts come from the repository's pinned nflverse team-season
-- results corpus; hidden grades are manually calibrated and locked across the pool.

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
    'draft-room-cowboys',
    'draft-room-cowboys-teams',
    'draft-room-cfb-best-teams',
    'draft-room-nfl-divisions'
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
      'cowboys-2007',
      'cowboys-teams-2007',
      'cfb-best-teams',
      'nfl-divisions'
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
    when p_mode_id = 'cowboys-teams-2007' then 'draft-room-cowboys-teams'
    when p_mode_id = 'cfb-best-teams' then 'draft-room-cfb-best-teams'
    when p_mode_id = 'nfl-divisions' then 'draft-room-nfl-divisions'
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
  'football-draft-room-nfl-divisions-2026-09-v1',
  'football-draft-room-nfl-divisions-board-2026-09-v1',
  'football-draft-room-nfl-divisions-grading-2026-09-v1',
  true,
  'draft-room-nfl-divisions'
);

create table private.draft_room_nfl_divisions_pool (
  season_reference text primary key,
  season_year integer not null check (season_year between 1999 and 2025),
  team_code text not null,
  team_name text not null,
  division_label text not null check (division_label in (
    'AFC East','AFC North','AFC South','AFC West',
    'NFC East','NFC North','NFC South','NFC West'
  )),
  display_label text not null unique,
  hidden_grade numeric(5,2) not null check (hidden_grade between 78 and 100),
  unique (team_code, season_year)
);

insert into private.draft_room_nfl_divisions_pool (
  season_reference, season_year, team_code, team_name, division_label, display_label, hidden_grade
) values
  ('nfl-division-buf-2024', 2024, 'BUF', 'Buffalo Bills', 'AFC East', '2024 Buffalo Bills', 90.5),
  ('nfl-division-buf-2020', 2020, 'BUF', 'Buffalo Bills', 'AFC East', '2020 Buffalo Bills', 91.0),
  ('nfl-division-buf-2022', 2022, 'BUF', 'Buffalo Bills', 'AFC East', '2022 Buffalo Bills', 88.0),
  ('nfl-division-buf-2021', 2021, 'BUF', 'Buffalo Bills', 'AFC East', '2021 Buffalo Bills', 87.5),
  ('nfl-division-mia-2000', 2000, 'MIA', 'Miami Dolphins', 'AFC East', '2000 Miami Dolphins', 83.5),
  ('nfl-division-mia-2023', 2023, 'MIA', 'Miami Dolphins', 'AFC East', '2023 Miami Dolphins', 81.5),
  ('nfl-division-mia-2001', 2001, 'MIA', 'Miami Dolphins', 'AFC East', '2001 Miami Dolphins', 81.5),
  ('nfl-division-mia-2008', 2008, 'MIA', 'Miami Dolphins', 'AFC East', '2008 Miami Dolphins', 82.0),
  ('nfl-division-ne-2016', 2016, 'NE', 'New England Patriots', 'AFC East', '2016 New England Patriots', 100.0),
  ('nfl-division-ne-2004', 2004, 'NE', 'New England Patriots', 'AFC East', '2004 New England Patriots', 99.5),
  ('nfl-division-ne-2007', 2007, 'NE', 'New England Patriots', 'AFC East', '2007 New England Patriots', 99.0),
  ('nfl-division-ne-2003', 2003, 'NE', 'New England Patriots', 'AFC East', '2003 New England Patriots', 98.5),
  ('nfl-division-nyj-2010', 2010, 'NYJ', 'New York Jets', 'AFC East', '2010 New York Jets', 88.0),
  ('nfl-division-nyj-2009', 2009, 'NYJ', 'New York Jets', 'AFC East', '2009 New York Jets', 87.0),
  ('nfl-division-nyj-2004', 2004, 'NYJ', 'New York Jets', 'AFC East', '2004 New York Jets', 84.0),
  ('nfl-division-nyj-2015', 2015, 'NYJ', 'New York Jets', 'AFC East', '2015 New York Jets', 80.0),
  ('nfl-division-bal-2000', 2000, 'BAL', 'Baltimore Ravens', 'AFC North', '2000 Baltimore Ravens', 99.5),
  ('nfl-division-bal-2012', 2012, 'BAL', 'Baltimore Ravens', 'AFC North', '2012 Baltimore Ravens', 95.0),
  ('nfl-division-bal-2023', 2023, 'BAL', 'Baltimore Ravens', 'AFC North', '2023 Baltimore Ravens', 91.5),
  ('nfl-division-bal-2019', 2019, 'BAL', 'Baltimore Ravens', 'AFC North', '2019 Baltimore Ravens', 91.0),
  ('nfl-division-cin-2022', 2022, 'CIN', 'Cincinnati Bengals', 'AFC North', '2022 Cincinnati Bengals', 89.5),
  ('nfl-division-cin-2021', 2021, 'CIN', 'Cincinnati Bengals', 'AFC North', '2021 Cincinnati Bengals', 91.0),
  ('nfl-division-cin-2015', 2015, 'CIN', 'Cincinnati Bengals', 'AFC North', '2015 Cincinnati Bengals', 84.5),
  ('nfl-division-cin-2013', 2013, 'CIN', 'Cincinnati Bengals', 'AFC North', '2013 Cincinnati Bengals', 83.5),
  ('nfl-division-cle-2020', 2020, 'CLE', 'Cleveland Browns', 'AFC North', '2020 Cleveland Browns', 84.0),
  ('nfl-division-cle-2023', 2023, 'CLE', 'Cleveland Browns', 'AFC North', '2023 Cleveland Browns', 81.5),
  ('nfl-division-cle-2007', 2007, 'CLE', 'Cleveland Browns', 'AFC North', '2007 Cleveland Browns', 80.0),
  ('nfl-division-cle-2002', 2002, 'CLE', 'Cleveland Browns', 'AFC North', '2002 Cleveland Browns', 78.5),
  ('nfl-division-pit-2005', 2005, 'PIT', 'Pittsburgh Steelers', 'AFC North', '2005 Pittsburgh Steelers', 95.5),
  ('nfl-division-pit-2008', 2008, 'PIT', 'Pittsburgh Steelers', 'AFC North', '2008 Pittsburgh Steelers', 97.5),
  ('nfl-division-pit-2010', 2010, 'PIT', 'Pittsburgh Steelers', 'AFC North', '2010 Pittsburgh Steelers', 92.5),
  ('nfl-division-pit-2004', 2004, 'PIT', 'Pittsburgh Steelers', 'AFC North', '2004 Pittsburgh Steelers', 92.0),
  ('nfl-division-hou-2025', 2025, 'HOU', 'Houston Texans', 'AFC South', '2025 Houston Texans', 85.0),
  ('nfl-division-hou-2012', 2012, 'HOU', 'Houston Texans', 'AFC South', '2012 Houston Texans', 84.5),
  ('nfl-division-hou-2011', 2011, 'HOU', 'Houston Texans', 'AFC South', '2011 Houston Texans', 83.0),
  ('nfl-division-hou-2018', 2018, 'HOU', 'Houston Texans', 'AFC South', '2018 Houston Texans', 82.0),
  ('nfl-division-ind-2006', 2006, 'IND', 'Indianapolis Colts', 'AFC South', '2006 Indianapolis Colts', 96.5),
  ('nfl-division-ind-2009', 2009, 'IND', 'Indianapolis Colts', 'AFC South', '2009 Indianapolis Colts', 94.0),
  ('nfl-division-ind-2005', 2005, 'IND', 'Indianapolis Colts', 'AFC South', '2005 Indianapolis Colts', 90.5),
  ('nfl-division-ind-2003', 2003, 'IND', 'Indianapolis Colts', 'AFC South', '2003 Indianapolis Colts', 89.0),
  ('nfl-division-jax-1999', 1999, 'JAX', 'Jacksonville Jaguars', 'AFC South', '1999 Jacksonville Jaguars', 91.5),
  ('nfl-division-jax-2017', 2017, 'JAX', 'Jacksonville Jaguars', 'AFC South', '2017 Jacksonville Jaguars', 88.5),
  ('nfl-division-jax-2025', 2025, 'JAX', 'Jacksonville Jaguars', 'AFC South', '2025 Jacksonville Jaguars', 85.5),
  ('nfl-division-jax-2007', 2007, 'JAX', 'Jacksonville Jaguars', 'AFC South', '2007 Jacksonville Jaguars', 84.0),
  ('nfl-division-ten-1999', 1999, 'TEN', 'Tennessee Titans', 'AFC South', '1999 Tennessee Titans', 93.5),
  ('nfl-division-ten-2008', 2008, 'TEN', 'Tennessee Titans', 'AFC South', '2008 Tennessee Titans', 87.5),
  ('nfl-division-ten-2000', 2000, 'TEN', 'Tennessee Titans', 'AFC South', '2000 Tennessee Titans', 86.0),
  ('nfl-division-ten-2003', 2003, 'TEN', 'Tennessee Titans', 'AFC South', '2003 Tennessee Titans', 85.0),
  ('nfl-division-den-2015', 2015, 'DEN', 'Denver Broncos', 'AFC West', '2015 Denver Broncos', 97.5),
  ('nfl-division-den-2013', 2013, 'DEN', 'Denver Broncos', 'AFC West', '2013 Denver Broncos', 94.5),
  ('nfl-division-den-2005', 2005, 'DEN', 'Denver Broncos', 'AFC West', '2005 Denver Broncos', 89.5),
  ('nfl-division-den-2025', 2025, 'DEN', 'Denver Broncos', 'AFC West', '2025 Denver Broncos', 91.5),
  ('nfl-division-kc-2022', 2022, 'KC', 'Kansas City Chiefs', 'AFC West', '2022 Kansas City Chiefs', 98.5),
  ('nfl-division-kc-2019', 2019, 'KC', 'Kansas City Chiefs', 'AFC West', '2019 Kansas City Chiefs', 97.0),
  ('nfl-division-kc-2023', 2023, 'KC', 'Kansas City Chiefs', 'AFC West', '2023 Kansas City Chiefs', 96.5),
  ('nfl-division-kc-2020', 2020, 'KC', 'Kansas City Chiefs', 'AFC West', '2020 Kansas City Chiefs', 94.0),
  ('nfl-division-lac-2006', 2006, 'LAC', 'San Diego Chargers', 'AFC West', '2006 San Diego Chargers', 90.0),
  ('nfl-division-lac-2007', 2007, 'LAC', 'San Diego Chargers', 'AFC West', '2007 San Diego Chargers', 88.5),
  ('nfl-division-lac-2009', 2009, 'LAC', 'San Diego Chargers', 'AFC West', '2009 San Diego Chargers', 86.5),
  ('nfl-division-lac-2004', 2004, 'LAC', 'San Diego Chargers', 'AFC West', '2004 San Diego Chargers', 85.0),
  ('nfl-division-lv-2002', 2002, 'LV', 'Oakland Raiders', 'AFC West', '2002 Oakland Raiders', 92.0),
  ('nfl-division-lv-2000', 2000, 'LV', 'Oakland Raiders', 'AFC West', '2000 Oakland Raiders', 88.5),
  ('nfl-division-lv-2016', 2016, 'LV', 'Oakland Raiders', 'AFC West', '2016 Oakland Raiders', 82.5),
  ('nfl-division-lv-2001', 2001, 'LV', 'Oakland Raiders', 'AFC West', '2001 Oakland Raiders', 83.0),
  ('nfl-division-dal-2007', 2007, 'DAL', 'Dallas Cowboys', 'NFC East', '2007 Dallas Cowboys', 85.5),
  ('nfl-division-dal-2016', 2016, 'DAL', 'Dallas Cowboys', 'NFC East', '2016 Dallas Cowboys', 86.0),
  ('nfl-division-dal-2023', 2023, 'DAL', 'Dallas Cowboys', 'NFC East', '2023 Dallas Cowboys', 84.0),
  ('nfl-division-dal-2014', 2014, 'DAL', 'Dallas Cowboys', 'NFC East', '2014 Dallas Cowboys', 85.0),
  ('nfl-division-nyg-2007', 2007, 'NYG', 'New York Giants', 'NFC East', '2007 New York Giants', 96.0),
  ('nfl-division-nyg-2011', 2011, 'NYG', 'New York Giants', 'NFC East', '2011 New York Giants', 94.5),
  ('nfl-division-nyg-2000', 2000, 'NYG', 'New York Giants', 'NFC East', '2000 New York Giants', 91.5),
  ('nfl-division-nyg-2008', 2008, 'NYG', 'New York Giants', 'NFC East', '2008 New York Giants', 84.5),
  ('nfl-division-phi-2024', 2024, 'PHI', 'Philadelphia Eagles', 'NFC East', '2024 Philadelphia Eagles', 99.0),
  ('nfl-division-phi-2017', 2017, 'PHI', 'Philadelphia Eagles', 'NFC East', '2017 Philadelphia Eagles', 98.0),
  ('nfl-division-phi-2022', 2022, 'PHI', 'Philadelphia Eagles', 'NFC East', '2022 Philadelphia Eagles', 94.5),
  ('nfl-division-phi-2004', 2004, 'PHI', 'Philadelphia Eagles', 'NFC East', '2004 Philadelphia Eagles', 93.0),
  ('nfl-division-was-2024', 2024, 'WAS', 'Washington Commanders', 'NFC East', '2024 Washington Commanders', 89.0),
  ('nfl-division-was-1999', 1999, 'WAS', 'Washington Redskins', 'NFC East', '1999 Washington Redskins', 82.5),
  ('nfl-division-was-2005', 2005, 'WAS', 'Washington Redskins', 'NFC East', '2005 Washington Redskins', 82.5),
  ('nfl-division-was-2012', 2012, 'WAS', 'Washington Redskins', 'NFC East', '2012 Washington Redskins', 82.0),
  ('nfl-division-chi-2006', 2006, 'CHI', 'Chicago Bears', 'NFC North', '2006 Chicago Bears', 93.5),
  ('nfl-division-chi-2001', 2001, 'CHI', 'Chicago Bears', 'NFC North', '2001 Chicago Bears', 85.0),
  ('nfl-division-chi-2018', 2018, 'CHI', 'Chicago Bears', 'NFC North', '2018 Chicago Bears', 84.5),
  ('nfl-division-chi-2010', 2010, 'CHI', 'Chicago Bears', 'NFC North', '2010 Chicago Bears', 87.5),
  ('nfl-division-det-2024', 2024, 'DET', 'Detroit Lions', 'NFC North', '2024 Detroit Lions', 91.5),
  ('nfl-division-det-2023', 2023, 'DET', 'Detroit Lions', 'NFC North', '2023 Detroit Lions', 89.0),
  ('nfl-division-det-2014', 2014, 'DET', 'Detroit Lions', 'NFC North', '2014 Detroit Lions', 81.5),
  ('nfl-division-det-2011', 2011, 'DET', 'Detroit Lions', 'NFC North', '2011 Detroit Lions', 80.5),
  ('nfl-division-gb-2010', 2010, 'GB', 'Green Bay Packers', 'NFC North', '2010 Green Bay Packers', 96.0),
  ('nfl-division-gb-2020', 2020, 'GB', 'Green Bay Packers', 'NFC North', '2020 Green Bay Packers', 90.5),
  ('nfl-division-gb-2011', 2011, 'GB', 'Green Bay Packers', 'NFC North', '2011 Green Bay Packers', 91.5),
  ('nfl-division-gb-2007', 2007, 'GB', 'Green Bay Packers', 'NFC North', '2007 Green Bay Packers', 89.5),
  ('nfl-division-min-2009', 2009, 'MIN', 'Minnesota Vikings', 'NFC North', '2009 Minnesota Vikings', 89.0),
  ('nfl-division-min-2017', 2017, 'MIN', 'Minnesota Vikings', 'NFC North', '2017 Minnesota Vikings', 89.5),
  ('nfl-division-min-2024', 2024, 'MIN', 'Minnesota Vikings', 'NFC North', '2024 Minnesota Vikings', 85.0),
  ('nfl-division-min-2000', 2000, 'MIN', 'Minnesota Vikings', 'NFC North', '2000 Minnesota Vikings', 86.0),
  ('nfl-division-atl-2016', 2016, 'ATL', 'Atlanta Falcons', 'NFC South', '2016 Atlanta Falcons', 92.5),
  ('nfl-division-atl-2012', 2012, 'ATL', 'Atlanta Falcons', 'NFC South', '2012 Atlanta Falcons', 89.0),
  ('nfl-division-atl-2010', 2010, 'ATL', 'Atlanta Falcons', 'NFC South', '2010 Atlanta Falcons', 84.5),
  ('nfl-division-atl-2004', 2004, 'ATL', 'Atlanta Falcons', 'NFC South', '2004 Atlanta Falcons', 86.5),
  ('nfl-division-car-2015', 2015, 'CAR', 'Carolina Panthers', 'NFC South', '2015 Carolina Panthers', 96.5),
  ('nfl-division-car-2003', 2003, 'CAR', 'Carolina Panthers', 'NFC South', '2003 Carolina Panthers', 91.5),
  ('nfl-division-car-2005', 2005, 'CAR', 'Carolina Panthers', 'NFC South', '2005 Carolina Panthers', 87.5),
  ('nfl-division-car-2013', 2013, 'CAR', 'Carolina Panthers', 'NFC South', '2013 Carolina Panthers', 84.0),
  ('nfl-division-no-2009', 2009, 'NO', 'New Orleans Saints', 'NFC South', '2009 New Orleans Saints', 98.5),
  ('nfl-division-no-2018', 2018, 'NO', 'New Orleans Saints', 'NFC South', '2018 New Orleans Saints', 90.5),
  ('nfl-division-no-2011', 2011, 'NO', 'New Orleans Saints', 'NFC South', '2011 New Orleans Saints', 87.5),
  ('nfl-division-no-2020', 2020, 'NO', 'New Orleans Saints', 'NFC South', '2020 New Orleans Saints', 86.0),
  ('nfl-division-tb-2002', 2002, 'TB', 'Tampa Bay Buccaneers', 'NFC South', '2002 Tampa Bay Buccaneers', 98.5),
  ('nfl-division-tb-2020', 2020, 'TB', 'Tampa Bay Buccaneers', 'NFC South', '2020 Tampa Bay Buccaneers', 96.5),
  ('nfl-division-tb-2021', 2021, 'TB', 'Tampa Bay Buccaneers', 'NFC South', '2021 Tampa Bay Buccaneers', 86.0),
  ('nfl-division-tb-1999', 1999, 'TB', 'Tampa Bay Buccaneers', 'NFC South', '1999 Tampa Bay Buccaneers', 86.5),
  ('nfl-division-ari-2015', 2015, 'ARI', 'Arizona Cardinals', 'NFC West', '2015 Arizona Cardinals', 89.0),
  ('nfl-division-ari-2008', 2008, 'ARI', 'Arizona Cardinals', 'NFC West', '2008 Arizona Cardinals', 90.5),
  ('nfl-division-ari-2021', 2021, 'ARI', 'Arizona Cardinals', 'NFC West', '2021 Arizona Cardinals', 81.5),
  ('nfl-division-ari-2009', 2009, 'ARI', 'Arizona Cardinals', 'NFC West', '2009 Arizona Cardinals', 83.5),
  ('nfl-division-lar-1999', 1999, 'LAR', 'St. Louis Rams', 'NFC West', '1999 St. Louis Rams', 99.5),
  ('nfl-division-lar-2001', 2001, 'LAR', 'St. Louis Rams', 'NFC West', '2001 St. Louis Rams', 95.5),
  ('nfl-division-lar-2021', 2021, 'LAR', 'Los Angeles Rams', 'NFC West', '2021 Los Angeles Rams', 97.0),
  ('nfl-division-lar-2018', 2018, 'LAR', 'Los Angeles Rams', 'NFC West', '2018 Los Angeles Rams', 93.0),
  ('nfl-division-sea-2025', 2025, 'SEA', 'Seattle Seahawks', 'NFC West', '2025 Seattle Seahawks', 99.0),
  ('nfl-division-sea-2013', 2013, 'SEA', 'Seattle Seahawks', 'NFC West', '2013 Seattle Seahawks', 99.5),
  ('nfl-division-sea-2005', 2005, 'SEA', 'Seattle Seahawks', 'NFC West', '2005 Seattle Seahawks', 93.0),
  ('nfl-division-sea-2014', 2014, 'SEA', 'Seattle Seahawks', 'NFC West', '2014 Seattle Seahawks', 92.5),
  ('nfl-division-sf-2019', 2019, 'SF', 'San Francisco 49ers', 'NFC West', '2019 San Francisco 49ers', 93.5),
  ('nfl-division-sf-2023', 2023, 'SF', 'San Francisco 49ers', 'NFC West', '2023 San Francisco 49ers', 92.5),
  ('nfl-division-sf-2012', 2012, 'SF', 'San Francisco 49ers', 'NFC West', '2012 San Francisco 49ers', 91.0),
  ('nfl-division-sf-2011', 2011, 'SF', 'San Francisco 49ers', 'NFC West', '2011 San Francisco 49ers', 89.5);

create table private.draft_room_nfl_divisions_board_entries (
  auction_id uuid not null references private.auction_games(id) on delete cascade,
  deck_position integer not null check (deck_position between 1 and 8),
  item_reference text not null,
  board_kind text not null check (board_kind in ('single','split')),
  division_one text not null,
  division_two text,
  subject_reference text not null references private.draft_room_nfl_divisions_pool(season_reference),
  team_code text not null,
  season_year integer not null,
  display_label text not null,
  primary key (auction_id, deck_position),
  unique (auction_id, item_reference),
  unique (auction_id, subject_reference),
  check (
    (board_kind = 'single' and division_two is null)
    or (board_kind = 'split' and division_two is not null and division_two <> division_one)
  )
);

create or replace function private.protect_draft_room_nfl_divisions_calibration()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'NFL Divisions calibration records are immutable';
end;
$$;

create trigger draft_room_nfl_divisions_pool_immutable
before update or delete on private.draft_room_nfl_divisions_pool
for each row execute function private.protect_draft_room_nfl_divisions_calibration();

create or replace function private.protect_draft_room_nfl_divisions_board_entry()
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
  raise exception 'NFL Divisions board entries are immutable';
end;
$$;

create trigger draft_room_nfl_divisions_board_entries_immutable
before update or delete on private.draft_room_nfl_divisions_board_entries
for each row execute function private.protect_draft_room_nfl_divisions_board_entry();

revoke all on private.draft_room_nfl_divisions_pool from public, anon, authenticated;
revoke all on private.draft_room_nfl_divisions_board_entries from public, anon, authenticated;
revoke all on function private.protect_draft_room_nfl_divisions_calibration() from public, anon, authenticated;
revoke all on function private.protect_draft_room_nfl_divisions_board_entry() from public, anon, authenticated;

create or replace function private.generate_draft_room_nfl_divisions_deck(p_auction_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_game private.auction_games;
  v_board_kind text;
  v_division_one text;
  v_division_two text;
  v_board_slug text;
  v_team text;
  v_pick private.draft_room_nfl_divisions_pool;
  v_refs text[] := array[]::text[];
  v_shuffled text[];
  v_position integer;
  v_pick_count integer;
  v_item_reference text;
begin
  select auction.* into v_game
  from private.auction_games auction
  where auction.id = p_auction_id
  for update;

  if v_game.id is null or v_game.mode_id <> 'nfl-divisions' then
    raise exception 'NFL Divisions deck generation requires a matching Draft Room game';
  end if;

  if exists (
    select 1 from private.auction_deck_entries deck where deck.auction_id = p_auction_id
  ) or exists (
    select 1 from private.draft_room_nfl_divisions_board_entries entry where entry.auction_id = p_auction_id
  ) then
    raise exception 'NFL Divisions deck is already fixed';
  end if;

  v_board_kind := case when random() < 0.50 then 'single' else 'split' end;

  select division_label into v_division_one
  from (
    select distinct division_label
    from private.draft_room_nfl_divisions_pool
  ) divisions
  order by random(), division_label
  limit 1;

  if v_board_kind = 'split' then
    select division_label into v_division_two
    from (
      select distinct division_label
      from private.draft_room_nfl_divisions_pool
      where division_label <> v_division_one
    ) divisions
    order by random(), division_label
    limit 1;
  end if;

  if v_division_one is null or (v_board_kind = 'split' and v_division_two is null) then
    raise exception 'NFL Divisions board context could not be randomized';
  end if;

  if v_board_kind = 'single' then
    for v_team in
      select team_code
      from private.draft_room_nfl_divisions_pool
      where division_label = v_division_one
      group by team_code
      order by team_code
    loop
      for v_pick_count in 1..2 loop
        select season.* into v_pick
        from private.draft_room_nfl_divisions_pool season
        where season.division_label = v_division_one
          and season.team_code = v_team
          and not (season.season_reference = any(v_refs))
        order by random(), season.season_reference
        limit 1;

        if v_pick.season_reference is null then
          raise exception 'NFL Divisions single board underfilled franchise %', v_team;
        end if;
        v_refs := array_append(v_refs, v_pick.season_reference);
      end loop;
    end loop;
  else
    for v_team in
      select team_code
      from private.draft_room_nfl_divisions_pool
      where division_label in (v_division_one, v_division_two)
      group by team_code
      order by team_code
    loop
      select season.* into v_pick
      from private.draft_room_nfl_divisions_pool season
      where season.division_label in (v_division_one, v_division_two)
        and season.team_code = v_team
      order by random(), season.season_reference
      limit 1;

      if v_pick.season_reference is null then
        raise exception 'NFL Divisions split board underfilled franchise %', v_team;
      end if;
      v_refs := array_append(v_refs, v_pick.season_reference);
    end loop;
  end if;

  if array_length(v_refs, 1) <> 8 then
    raise exception 'NFL Divisions board must select exactly eight team-seasons';
  end if;

  select array_agg(reference order by random())
  into v_shuffled
  from unnest(v_refs) reference;

  v_board_slug := replace(lower(v_division_one), ' ', '-');
  if v_board_kind = 'split' then
    v_board_slug := v_board_slug || '-vs-' || replace(lower(v_division_two), ' ', '-');
  end if;

  for v_position in 1..8 loop
    select season.* into v_pick
    from private.draft_room_nfl_divisions_pool season
    where season.season_reference = v_shuffled[v_position];

    v_item_reference := v_pick.season_reference || '--board--' || v_board_slug;

    insert into private.draft_room_nfl_divisions_board_entries (
      auction_id,
      deck_position,
      item_reference,
      board_kind,
      division_one,
      division_two,
      subject_reference,
      team_code,
      season_year,
      display_label
    ) values (
      p_auction_id,
      v_position,
      v_item_reference,
      v_board_kind,
      v_division_one,
      v_division_two,
      v_pick.season_reference,
      v_pick.team_code,
      v_pick.season_year,
      v_pick.display_label
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

  if (select count(*) from private.draft_room_nfl_divisions_board_entries where auction_id = p_auction_id) <> 8
    or (select count(distinct subject_reference) from private.draft_room_nfl_divisions_board_entries where auction_id = p_auction_id) <> 8
  then
    raise exception 'NFL Divisions board generation drifted from the eight-season contract';
  end if;

  if v_board_kind = 'single' then
    if (select count(distinct division_label) from private.draft_room_nfl_divisions_pool pool
        join private.draft_room_nfl_divisions_board_entries entry on entry.subject_reference = pool.season_reference
        where entry.auction_id = p_auction_id) <> 1
      or exists (
        select 1
        from private.draft_room_nfl_divisions_board_entries entry
        where entry.auction_id = p_auction_id
        group by entry.team_code
        having count(*) <> 2
      )
    then
      raise exception 'NFL Divisions single board must contain two seasons per franchise in one division';
    end if;
  else
    if (select count(distinct pool.division_label)
        from private.draft_room_nfl_divisions_pool pool
        join private.draft_room_nfl_divisions_board_entries entry on entry.subject_reference = pool.season_reference
        where entry.auction_id = p_auction_id) <> 2
      or exists (
        select 1
        from private.draft_room_nfl_divisions_board_entries entry
        where entry.auction_id = p_auction_id
        group by entry.team_code
        having count(*) <> 1
      )
    then
      raise exception 'NFL Divisions split board must contain one season per franchise across two divisions';
    end if;
  end if;
end;
$$;

revoke all on function private.generate_draft_room_nfl_divisions_deck(uuid) from public, anon, authenticated;

create or replace function private.grade_draft_room_nfl_divisions(p_auction_id uuid)
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
    or v_game.mode_id <> 'nfl-divisions'
    or v_game.grading_version <> 'football-draft-room-nfl-divisions-grading-2026-09-v1'
  then
    raise exception 'NFL Divisions grading boundary is invalid';
  end if;

  select count(*), round(avg(season.hidden_grade), 2)
  into v_challenger_count, v_challenger_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_nfl_divisions_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_nfl_divisions_pool season
    on season.season_reference = entry.subject_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.challenger_id;

  select count(*), round(avg(season.hidden_grade), 2)
  into v_recipient_count, v_recipient_score
  from private.auction_awards award
  join private.auction_deck_entries deck
    on deck.id = award.deck_entry_id and deck.auction_id = award.auction_id
  join private.draft_room_nfl_divisions_board_entries entry
    on entry.auction_id = award.auction_id and entry.item_reference = deck.private_item_reference
  join private.draft_room_nfl_divisions_pool season
    on season.season_reference = entry.subject_reference
  where award.auction_id = p_auction_id
    and award.awarded_to = v_game.recipient_id;

  if v_challenger_count <> 4
    or v_recipient_count <> 4
    or v_challenger_score not between 0 and 100
    or v_recipient_score not between 0 and 100
  then
    raise exception 'NFL Divisions grading inputs are incomplete or invalid';
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

revoke all on function private.grade_draft_room_nfl_divisions(uuid) from public, anon, authenticated;

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
    'cowboys-2007',
    'cowboys-teams-2007',
    'cfb-best-teams',
    'nfl-divisions'
  )),
  add constraint auction_games_round_valid check (
    current_round >= 1
    and current_round <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 6
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007', 'cowboys-teams-2007', 'cfb-best-teams', 'nfl-divisions') then 8
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 8
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 10
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 8
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 6
      else 8
    end
  ),
  add constraint auction_games_selection_counts_valid check (
    challenger_selection_count between 0 and case
      when mode_id in ('trio-nfl', 'trio-cfb') then 3
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007', 'cowboys-teams-2007', 'cfb-best-teams', 'nfl-divisions') then 4
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
    and recipient_selection_count between 0 and case
      when mode_id in ('trio-nfl', 'trio-cfb') then 3
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007', 'cowboys-teams-2007', 'cfb-best-teams', 'nfl-divisions') then 4
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 4
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 5
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 4
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 3
      else 4
    end
  ),
  add constraint auction_games_bankroll_ceiling check (
    challenger_bankroll <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 30
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007', 'cowboys-teams-2007', 'cfb-best-teams', 'nfl-divisions') then 40
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
      ) then 30
      else 40
    end
    and recipient_bankroll <= case
      when mode_id in ('trio-nfl', 'trio-cfb') then 30
      when mode_id in ('longhorns-2005', 'longhorns-teams-2005', 'cowboys-2007', 'cowboys-teams-2007', 'cfb-best-teams', 'nfl-divisions') then 40
      when content_version = 'football-draft-room-2026-09-v6' and mode_id in ('build-qb', 'build-qb-cfb') then 40
      when mode_id in ('ultimate-fighter', 'build-qb', 'build-qb-cfb') then 50
      when lifecycle_state in ('completed', 'cancelled', 'abandoned') then 40
      when content_version in (
        'ufc-auction-2026-08-v3','ufc-auction-2026-08-v4','ufc-auction-2026-08-v5',
        'ufc-auction-2026-08-v6','ufc-auction-2026-08-v7','ufc-auction-2026-08-v8'
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
    E'begin\n  if p_mode_id = ''cfb-best-teams'' then',
    E'begin\n  if p_mode_id = ''nfl-divisions'' then\n    if p_count <> 8 then raise exception ''NFL Divisions deck must contain eight team-seasons''; end if;\n    if p_random_order is not null then raise exception ''Injected Auction random order is unavailable for NFL Divisions rooms''; end if;\n    perform private.generate_draft_room_nfl_divisions_deck(p_auction_id);\n    return;\n  end if;\n\n  if p_mode_id = ''cfb-best-teams'' then'
  );
  if v_next = v_definition then raise exception 'NFL Divisions generator contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_catalog_deck_entry()'::regprocedure);
  v_next := replace(
    v_definition,
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cfb_best_teams_board_entries cfb_team on cfb_team.auction_id = auction.id',
    E'begin\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_nfl_divisions_board_entries nfl_division on nfl_division.auction_id = auction.id\n    where auction.id = new.auction_id\n      and auction.mode_id = ''nfl-divisions''\n      and nfl_division.item_reference = new.private_item_reference\n  ) then\n    return new;\n  end if;\n\n  if exists (\n    select 1\n    from private.auction_games auction\n    join private.draft_room_cfb_best_teams_board_entries cfb_team on cfb_team.auction_id = auction.id'
  );
  if v_next = v_definition then raise exception 'NFL Divisions deck validation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_private_row()'::regprocedure);
  v_next := replace(
    v_definition,
    E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8',
    E'when v_auction.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 8'
  );
  if v_next = v_definition then raise exception 'NFL Divisions private-row round contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.validate_auction_bid(private.auction_games,uuid,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 4',
    E'when p_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 4'
  );
  if v_next = v_definition then raise exception 'NFL Divisions bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.resolve_auction_round(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 4',
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 4'
  );
  v_next := replace(
    v_next,
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8',
    E'when v_game.mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 8'
  );
  if v_next = v_definition then raise exception 'NFL Divisions round-resolution contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.grade_auction(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'  if v_game.mode_id = ''cfb-best-teams''',
    E'  if v_game.mode_id = ''nfl-divisions''\n    and v_game.grading_version = ''football-draft-room-nfl-divisions-grading-2026-09-v1''\n  then\n    perform private.grade_draft_room_nfl_divisions(p_auction_id);\n    return;\n  end if;\n\n  if v_game.mode_id = ''cfb-best-teams'''
  );
  if v_next = v_definition then raise exception 'NFL Divisions grading contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.prepare_auction(uuid,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'    ''cowboys-teams-2007'',\n    ''cfb-best-teams''',
    E'    ''cowboys-teams-2007'',\n    ''cfb-best-teams'',\n    ''nfl-divisions'''
  );
  v_next := replace(
    v_next,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'')'
  );
  v_next := replace(
    v_next,
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 8',
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 8'
  );
  v_next := replace(
    v_next,
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'') then 40',
    E'when p_mode_id in (''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'') then 40'
  );
  if v_next = v_definition then raise exception 'NFL Divisions preparation contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.send_auction_first_bid(uuid,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'')'
  );
  v_next := replace(
    v_next,
    E'    when v_game.mode_id = ''cowboys-2007'' then ''Cowboys Since 2007''',
    E'    when v_game.mode_id = ''cfb-best-teams'' then ''Best CFB Teams''',
    E'    when v_game.mode_id = ''cfb-best-teams'' then ''Best CFB Teams''\n    when v_game.mode_id = ''nfl-divisions'' then ''NFL Divisions'''
  );
  v_next := replace(
    v_next,
    E'when v_game.mode_id = ''cowboys-2007'' then v_creator_name || '' challenged you to Cowboys Since 2007.''',
    E'when v_game.mode_id = ''cfb-best-teams'' then v_creator_name || '' challenged you to Best CFB Teams.''',
    E'when v_game.mode_id = ''cfb-best-teams'' then v_creator_name || '' challenged you to Best CFB Teams.''\n    when v_game.mode_id = ''nfl-divisions'' then v_creator_name || '' challenged you to NFL Divisions.'''
  );
  if v_next = v_definition then raise exception 'NFL Divisions first-bid notification contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.submit_auction_bid(uuid,integer,bigint,numeric,text)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'')'
  );
  if v_next = v_definition then raise exception 'NFL Divisions submit-bid contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('private.sync_auction_challenge_decline()'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'')'
  );
  if v_next = v_definition then raise exception 'NFL Divisions decline-sync contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.cancel_auction(uuid,bigint)'::regprocedure);
  v_next := replace(
    v_definition,
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'')',
    E'(''build-qb'', ''build-qb-cfb'', ''trio-nfl'', ''trio-cfb'', ''longhorns-2005'', ''longhorns-teams-2005'', ''cowboys-2007'', ''nfl-divisions'')'
  );
  if v_next = v_definition then raise exception 'NFL Divisions cancellation routing contract drifted'; end if;
  execute v_next;

  v_definition := pg_get_functiondef('public.get_auction_participant_state(uuid)'::regprocedure);
  v_next := replace(
    v_definition,
    E'      left join private.draft_room_cfb_best_teams_board_entries cfb_team\n        on cfb_team.auction_id = auction.id\n        and cfb_team.item_reference = deck.private_item_reference',
    E'      left join private.draft_room_cfb_best_teams_board_entries cfb_team\n        on cfb_team.auction_id = auction.id\n        and cfb_team.item_reference = deck.private_item_reference\n      left join private.draft_room_nfl_divisions_board_entries nfl_division\n        on nfl_division.auction_id = auction.id\n        and nfl_division.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    E'        left join private.draft_room_cfb_best_teams_board_entries cfb_team\n          on cfb_team.auction_id = auction.id\n          and cfb_team.item_reference = deck.private_item_reference',
    E'        left join private.draft_room_cfb_best_teams_board_entries cfb_team\n          on cfb_team.auction_id = auction.id\n          and cfb_team.item_reference = deck.private_item_reference\n        left join private.draft_room_nfl_divisions_board_entries nfl_division\n          on nfl_division.auction_id = auction.id\n          and nfl_division.item_reference = deck.private_item_reference'
  );
  v_next := replace(
    v_next,
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name)',
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name, cowboy_team.display_label, cfb_team.display_label)',
    'coalesce(catalog.display_label, trio.display_label, longhorn.display_name, longhorn_team.display_label, cowboy.display_name, cowboy_team.display_label, cfb_team.display_label, nfl_division.display_label)'
  );
  v_next := replace(
    v_next,
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null',
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null or cowboy_team.item_reference is not null or cfb_team.item_reference is not null',
    'catalog.item_reference is not null or trio.item_reference is not null or longhorn.item_reference is not null or longhorn_team.item_reference is not null or cowboy.item_reference is not null or cowboy_team.item_reference is not null or cfb_team.item_reference is not null or nfl_division.item_reference is not null'
  );
  if v_next = v_definition then raise exception 'NFL Divisions participant projection contract drifted'; end if;
  execute v_next;
end;
$$;

do $$
begin
  if (select count(*) from private.draft_room_nfl_divisions_pool) <> 128 then
    raise exception 'NFL Divisions pool must contain exactly 128 team-seasons';
  end if;

  if (select count(distinct team_code) from private.draft_room_nfl_divisions_pool) <> 32
    or exists (
      select 1
      from private.draft_room_nfl_divisions_pool
      group by team_code
      having count(*) <> 4
    )
  then
    raise exception 'NFL Divisions pool must contain four seasons for each of 32 franchises';
  end if;

  if (select count(distinct division_label) from private.draft_room_nfl_divisions_pool) <> 8
    or exists (
      select 1
      from private.draft_room_nfl_divisions_pool
      group by division_label
      having count(*) <> 16
    )
  then
    raise exception 'NFL Divisions pool must contain sixteen team-seasons per division';
  end if;
end;
$$;
