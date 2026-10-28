-- NFL October 28 owner-authorized first Madden editorial cycle: four players + three head coaches.
-- Historical grade authority and already-scored Wheel picks must remain immutable.
-- Source: data/curated/football/nfl/wheel-nfl-madden-editorial-revisions-2026-10-28.json
-- No contracts, development profiles, probabilities, identity rows, or existing results modified.
do $preflight$
declare v record; current_grade numeric; current_date_value date; old_count integer;
begin
  for v in select * from (values
    ('BUF','TE','daltonkincaid','Dalton Kincaid',91,88,'wheel-nfl-te-grades-2026-10-28.json'),
    ('PHI','TE','dallasgoedert','Dallas Goedert',82,84,'wheel-nfl-te-grades-2026-10-28.json'),
    ('ATL','Secondary','jessiebatesiii','Jessie Bates III',86,89,'wheel-nfl-secondary-grades-2026-10-28.json'),
    ('HOU','Secondary','jalenpitre','Jalen Pitre',94,91,'wheel-nfl-secondary-grades-2026-10-28.json'),
    ('CLE','Head Coach','toddmonken','Todd Monken',80,81,'wheel-nfl-head-coach-grades-2026-10-28.json'),
    ('LV','Head Coach','klintkubiak','Klint Kubiak',84,83,'wheel-nfl-head-coach-grades-2026-10-28.json'),
    ('NYG','Head Coach','johnharbaugh','John Harbaugh',88,89,'wheel-nfl-head-coach-grades-2026-10-28.json')
  ) as e(team_code,position_group,name_key,display_name,previous_grade,new_grade,source_file)
  loop
    select g.hidden_grade,g.effective_date into current_grade,current_date_value
      from private.wheel_football_grade_authority g
      where g.team_code=v.team_code and g.position_group=v.position_group
        and g.name_key=v.name_key and g.display_name=v.display_name
      order by g.effective_date desc limit 1;
    if current_grade is distinct from v.previous_grade or current_date_value is distinct from date '2026-10-03' then
      raise exception 'NFL editorial grade preflight mismatch: %/%/% expected % at Oct 3, observed % at %',
        v.team_code,v.position_group,v.display_name,v.previous_grade,current_grade,current_date_value;
    end if;
    select count(*) into old_count from private.wheel_football_grade_authority g
      where g.team_code=v.team_code and g.position_group=v.position_group
        and g.name_key=v.name_key and g.display_name=v.display_name
        and g.hidden_grade=v.previous_grade and g.effective_date=date '2026-10-03';
    if old_count<>1 then
      raise exception 'Missing immutable NFL editorial historical seed: %/%/%',v.team_code,v.position_group,v.name_key;
    end if;
  end loop;
end $preflight$;

insert into private.wheel_football_grade_authority
  (team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
values
  ('BUF','TE','daltonkincaid','Dalton Kincaid',88,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-te-grades-2026-10-28.json'),
  ('PHI','TE','dallasgoedert','Dallas Goedert',84,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-te-grades-2026-10-28.json'),
  ('ATL','Secondary','jessiebatesiii','Jessie Bates III',89,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-28.json'),
  ('HOU','Secondary','jalenpitre','Jalen Pitre',91,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-secondary-grades-2026-10-28.json'),
  ('CLE','Head Coach','toddmonken','Todd Monken',81,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-28.json'),
  ('LV','Head Coach','klintkubiak','Klint Kubiak',83,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-28.json'),
  ('NYG','Head Coach','johnharbaugh','John Harbaugh',89,date '2026-10-28','nfl-wheel-madden-editorial-2026-10-28-v1','data/generated/football/wheel-nfl-head-coach-grades-2026-10-28.json');

do $postflight$
declare v record; matching integer; preserved integer;
begin
  for v in select * from (values
    ('BUF','TE','daltonkincaid','Dalton Kincaid',91,88,'wheel-nfl-te-grades-2026-10-28.json'),
    ('PHI','TE','dallasgoedert','Dallas Goedert',82,84,'wheel-nfl-te-grades-2026-10-28.json'),
    ('ATL','Secondary','jessiebatesiii','Jessie Bates III',86,89,'wheel-nfl-secondary-grades-2026-10-28.json'),
    ('HOU','Secondary','jalenpitre','Jalen Pitre',94,91,'wheel-nfl-secondary-grades-2026-10-28.json'),
    ('CLE','Head Coach','toddmonken','Todd Monken',80,81,'wheel-nfl-head-coach-grades-2026-10-28.json'),
    ('LV','Head Coach','klintkubiak','Klint Kubiak',84,83,'wheel-nfl-head-coach-grades-2026-10-28.json'),
    ('NYG','Head Coach','johnharbaugh','John Harbaugh',88,89,'wheel-nfl-head-coach-grades-2026-10-28.json')
  ) as e(team_code,position_group,name_key,display_name,previous_grade,new_grade,source_file)
  loop
    select count(*) into matching from private.wheel_football_grade_authority g
      where g.team_code=v.team_code and g.position_group=v.position_group
        and g.name_key=v.name_key and g.display_name=v.display_name
        and g.hidden_grade=v.new_grade and g.effective_date=date '2026-10-28'
        and g.grade_version='nfl-wheel-madden-editorial-2026-10-28-v1'
        and g.source_artifact='data/generated/football/'||v.source_file;
    select count(*) into preserved from private.wheel_football_grade_authority g
      where g.team_code=v.team_code and g.position_group=v.position_group
        and g.name_key=v.name_key and g.hidden_grade=v.previous_grade
        and g.effective_date=date '2026-10-03';
    if matching<>1 or preserved<>1 then
      raise exception 'NFL editorial versioned-grade postflight mismatch %/%/%',v.team_code,v.position_group,v.name_key;
    end if;
  end loop;
end $postflight$;
