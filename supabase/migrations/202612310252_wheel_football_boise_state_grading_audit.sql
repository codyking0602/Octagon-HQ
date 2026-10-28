-- Wheel of Football: Boise State AP Top 25 grading audit.
-- Applies the same current-ability CFB grading methodology used by the locked
-- 68-school board. Evidence is frozen through 2026-09-26 for timing parity.
-- Legacy Boise rows that are no longer current shortlist options are retained
-- so in-flight or historical picks can still resolve a grade.

insert into private.wheel_football_grade_authority (
  team_code,
  position_group,
  name_key,
  display_name,
  hidden_grade,
  effective_date,
  grade_version,
  source_artifact
) values
  ('boise-state', 'QB', private.wheel_football_grade_name_key('Maddux Madsen'), 'Maddux Madsen', 88.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Dylan Riley'), 'Dylan Riley', 95.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Sire Gaines'), 'Sire Gaines', 88.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Rasean Jones'), 'Rasean Jones', 87.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Akeem Wright'), 'Akeem Wright', 84.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Ben Ford'), 'Ben Ford', 83.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Cam Bates'), 'Cam Bates', 82.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'TE', private.wheel_football_grade_name_key('Matt Wagner'), 'Matt Wagner', 84.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Jayden Virgin-Morgan'), 'Jayden Virgin-Morgan', 93.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Boen Phelps'), 'Boen Phelps', 88.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Max Stege'), 'Max Stege', 85.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Mikaio Edward'), 'Mikaio Edward', 83.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Logan Brantley'), 'Logan Brantley', 80.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Jaden Mickey'), 'Jaden Mickey', 88.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Travis Anderson'), 'Travis Anderson', 86.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('JeRico Washington Jr.'), 'JeRico Washington Jr.', 86.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Roman Tillmon'), 'Roman Tillmon', 84.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Sherrod Smith'), 'Sherrod Smith', 84.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Head Coach', private.wheel_football_grade_name_key('Spencer Danielson'), 'Spencer Danielson', 86.0, '2026-10-03', 'cfb-wheel-boise-state-grades-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;
