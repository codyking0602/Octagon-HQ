-- Append-only owner-approved Oct 8 NFL Wheel HQ present-ability corrections (34 records).
-- Do not rewrite the 2026-10-03 historical grade snapshot or completed match picks.
-- Six owner approval PRs #1778-#1783; player-specific audit reasons remain in grade artifacts.
-- The resolver chooses the latest effective date <= current_date.
insert into private.wheel_football_grade_authority (
  team_code, position_group, name_key, display_name, hidden_grade,
  effective_date, grade_version, source_artifact
) values
  ('SF','QB','brockpurdy','Brock Purdy',90.0,'2026-10-08','nfl-wheel-qb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CAR','QB','bryceyoung','Bryce Young',83.0,'2026-10-08','nfl-wheel-qb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('DEN','QB','bonix','Bo Nix',82.0,'2026-10-08','nfl-wheel-qb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-qb-grades-2026-10-03.json'),
  ('CHI','RB','kylemonangai','Kyle Monangai',84.0,'2026-10-08','nfl-wheel-rb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('JAX','RB','chrisrodriguezjr','Chris Rodriguez Jr.',79.0,'2026-10-08','nfl-wheel-rb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('KC','RB','kennethwalker','Kenneth Walker',91.0,'2026-10-08','nfl-wheel-rb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('LV','RB','ashtonjeanty','Ashton Jeanty',81.0,'2026-10-08','nfl-wheel-rb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('SEA','RB','zachcharbonnet','Zach Charbonnet',85.0,'2026-10-08','nfl-wheel-rb-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-rb-grades-2026-10-03.json'),
  ('CAR','WR','xavierlegette','Xavier Legette',78.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI','WR','romeodunze','Rome Odunze',87.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('CHI','WR','kalifraymond','Kalif Raymond',79.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('IND','WR','alecpierce','Alec Pierce',85.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('KC','WR','xavierworthy','Xavier Worthy',83.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('LAC','WR','quentinjohnston','Quentin Johnston',82.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('NO','WR','chrisolave','Chris Olave',91.0,'2026-10-08','nfl-wheel-wr-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-wr-grades-2026-10-03.json'),
  ('DAL','TE','jakeferguson','Jake Ferguson',79.0,'2026-10-08','nfl-wheel-te-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('JAX','TE','brentonstrange','Brenton Strange',83.0,'2026-10-08','nfl-wheel-te-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-te-grades-2026-10-03.json'),
  ('CAR','Front Seven','jaelanphillips','Jaelan Phillips',88.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('KC','Front Seven','peterwoods','Peter Woods',78.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAC','Front Seven','tulituipulotu','Tuli Tuipulotu',88.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('LAR','Front Seven','bradenfiske','Braden Fiske',83.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('MIN','Front Seven','dallasturner','Dallas Turner',87.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NE','Front Seven','miltonwilliams','Milton Williams',88.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('NYG','Front Seven','kayvonthibodeaux','Kayvon Thibodeaux',79.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('PHI','Front Seven','jihaadcampbell','Jihaad Campbell',82.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('SF','Front Seven','mykelwilliams','Mykel Williams',80.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('TB','Front Seven','ruebenbainjr','Rueben Bain Jr.',79.0,'2026-10-08','nfl-wheel-front-seven-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-front-seven-grades-2026-10-03.json'),
  ('DAL','Secondary','calebdowns','Caleb Downs',81.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('HOU','Secondary','reedblankenship','Reed Blankenship',78.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('KC','Secondary','mansoordelane','Mansoor Delane',82.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','byronmurphyjr','Byron Murphy Jr.',82.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','joshuametellus','Joshua Metellus',81.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('MIN','Secondary','harrisonsmith','Harrison Smith',80.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json'),
  ('WSH','Secondary','amikrobertson','Amik Robertson',84.0,'2026-10-08','nfl-wheel-secondary-owner-approved-2026-10-08-v2','data/generated/football/wheel-nfl-secondary-grades-2026-10-03.json')
on conflict (team_code, position_group, name_key, effective_date)
do update set
  display_name = excluded.display_name,
  hidden_grade = excluded.hidden_grade,
  grade_version = excluded.grade_version,
  source_artifact = excluded.source_artifact;
