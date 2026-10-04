-- Boise State AP Top 25 Wheel grading audit v2.
-- Uses the same current-season-heavy, neighbor-calibrated CFB standard as the 68-school board.
-- Existing pick snapshots are immutable; these authority corrections apply to new picks.

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
  ('boise-state', 'QB', private.wheel_football_grade_name_key('Maddux Madsen'), 'Maddux Madsen', 88.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Dylan Riley'), 'Dylan Riley', 94.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'RB', private.wheel_football_grade_name_key('Sire Gaines'), 'Sire Gaines', 86.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Rasean Jones'), 'Rasean Jones', 87.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Cam Bates'), 'Cam Bates', 81.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'WR', private.wheel_football_grade_name_key('Ben Ford'), 'Ben Ford', 80.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'TE', private.wheel_football_grade_name_key('Matt Wagner'), 'Matt Wagner', 84.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Jayden Virgin-Morgan'), 'Jayden Virgin-Morgan', 91.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Jake Ripp'), 'Jake Ripp', 80.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Boen Phelps'), 'Boen Phelps', 84.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Sterling Lane II'), 'Sterling Lane II', 79.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Front Seven', private.wheel_football_grade_name_key('Logan Brantley'), 'Logan Brantley', 75.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Jaden Mickey'), 'Jaden Mickey', 85.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Demetrius Freeney Jr.'), 'Demetrius Freeney Jr.', 75.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('JeRico Washington Jr.'), 'JeRico Washington Jr.', 83.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Travis Anderson'), 'Travis Anderson', 78.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Secondary', private.wheel_football_grade_name_key('Derek Ganter Jr.'), 'Derek Ganter Jr.', 76.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json'),
  ('boise-state', 'Head Coach', private.wheel_football_grade_name_key('Spencer Danielson'), 'Spencer Danielson', 88.0, '2026-10-03', 'cfb-wheel-ap25-boise-2026-10-03-v2', 'data/curated/football/cfb/wheel-football-boise-state-grading-audit-2026-10-03.json')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

comment on table private.wheel_football_grade_authority is
  'Private NFL + audited CFB Wheel grading authority, including the fully audited Boise State AP Top 25 extension. Individual grades are never exposed to clients.';
