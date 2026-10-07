-- Current college-football ability; independent of NIL/market value.
-- New grade effective-date rows do not mutate October 3 history or frozen prior picks.
insert into private.wheel_football_grade_authority
  (team_code, position_group, name_key, display_name, hidden_grade, effective_date, grade_version, source_artifact)
values
  ('alabama', 'QB', private.wheel_football_grade_name_key('Keelon Russell'), 'Keelon Russell', 93.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('missouri', 'QB', private.wheel_football_grade_name_key('Austin Simmons'), 'Austin Simmons', 91.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('pittsburgh', 'QB', private.wheel_football_grade_name_key('Holden Geriner'), 'Holden Geriner', 79.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('tennessee', 'QB', private.wheel_football_grade_name_key('George MacIntyre'), 'George MacIntyre', 79.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('tennessee', 'RB', private.wheel_football_grade_name_key('DeSean Bishop'), 'DeSean Bishop', 92.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('indiana', 'RB', private.wheel_football_grade_name_key('Turbo Richard'), 'Turbo Richard', 93.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas', 'Front Seven', private.wheel_football_grade_name_key('Justin Cryer'), 'Justin Cryer', 85.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas', 'Front Seven', private.wheel_football_grade_name_key('Hero Kanu'), 'Hero Kanu', 86.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('alabama', 'Front Seven', private.wheel_football_grade_name_key('Devan Thompkins'), 'Devan Thompkins', 87.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('missouri', 'Front Seven', private.wheel_football_grade_name_key('Nicholas Rodriguez'), 'Nicholas Rodriguez', 90.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('alabama', 'Front Seven', private.wheel_football_grade_name_key('Luke Metz'), 'Luke Metz', 87.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas-tech', 'Secondary', private.wheel_football_grade_name_key('Brice Pollock'), 'Brice Pollock', 91.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('smu', 'Secondary', private.wheel_football_grade_name_key('Jarvis Lee'), 'Jarvis Lee', 86.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('notre-dame', 'Secondary', private.wheel_football_grade_name_key('Luke Talich'), 'Luke Talich', 86.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas', 'Secondary', private.wheel_football_grade_name_key('Jelani McDonald'), 'Jelani McDonald', 90.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas', 'Secondary', private.wheel_football_grade_name_key('Graceson Littleton'), 'Graceson Littleton', 89.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json'),
  ('texas-tech', 'Secondary', private.wheel_football_grade_name_key('Malik Esquerra'), 'Malik Esquerra', 83.0, '2026-10-07', 'cfb-wheel-current-ability-recalibration-2026-10-07-v2', 'data/curated/football/cfb/wheel-football-grade-recalibration-2026-10-07.json')
on conflict (team_code, position_group, name_key, effective_date) do update
set display_name = excluded.display_name,
    hidden_grade = excluded.hidden_grade,
    grade_version = excluded.grade_version,
    source_artifact = excluded.source_artifact;

-- Add a new AP snapshot; preserve the 2026-09-27 entries.
insert into private.wheel_football_ap_top_25
  (season, poll_date, rank, team_code, source_url)
values
  (2026, '2026-10-04', 1, 'texas', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 2, 'georgia', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 3, 'notre-dame', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 4, 'miami', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 5, 'ohio-state', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 6, 'alabama', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 7, 'indiana', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 8, 'byu', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 9, 'ole-miss', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 10, 'lsu', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 11, 'texas-tech', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 12, 'utah', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 13, 'oregon', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 14, 'missouri', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 15, 'tennessee', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 16, 'florida', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 17, 'mississippi-state', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 18, 'oklahoma-state', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 19, 'usc', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 20, 'iowa', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 21, 'ucla', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 22, 'houston', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 23, 'boise-state', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 24, 'smu', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c'),
  (2026, '2026-10-04', 25, 'pittsburgh', 'https://apnews.com/article/7db03c4123afa589863a8b53f4db520c')
on conflict (season, poll_date, rank) do update
set team_code = excluded.team_code,
    source_url = excluded.source_url;
