-- NFL-only additional 2026 Week 7 QB/RB/WR current-ability calibration.
-- The five-QB #2207 migration 604 is authoritative; no repeated grade identities.
-- Source and individually supported rationales: data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json
-- Preserve historical Wheel picks and all 594 original NFL GM contracts/profiles/saves.
do $preflight$
declare mismatch text;
begin
  with expected(team_code,position_group,name_key,display_name,old_grade,new_grade,prior_date) as (
  values
    ('CAR','QB','bryceyoung','Bryce Young',83,86,date '2026-10-08'),
    ('DAL','QB','dakprescott','Dak Prescott',92,88,date '2026-10-03'),
    ('SEA','QB','samdarnold','Sam Darnold',88,83,date '2026-10-03'),
    ('KC','RB','kennethwalker','Kenneth Walker',91,94,date '2026-10-08'),
    ('NYJ','RB','braelonallen','Braelon Allen',78,82,date '2026-10-03'),
    ('GB','WR','matthewgolden','Matthew Golden',81,85,date '2026-10-03'),
    ('GB','WR','christianwatson','Christian Watson',85,89,date '2026-10-03')
)
  select string_agg(format('%s %s %s expected %s/%s, got %s/%s',e.team_code,e.position_group,e.display_name,e.old_grade,e.prior_date,latest.hidden_grade,latest.effective_date),'; ') into mismatch
  from expected e
  left join lateral (
    select hidden_grade,effective_date
    from private.wheel_football_grade_authority a
    where a.team_code=e.team_code and a.position_group=e.position_group and a.name_key=e.name_key
    order by a.effective_date desc limit 1
  ) latest on true
  where latest.hidden_grade is distinct from e.old_grade or latest.effective_date is distinct from e.prior_date;
  if mismatch is not null then
    raise exception 'NFL seven-player ability preflight changed baseline: %',mismatch;
  end if;
end $preflight$;

insert into private.wheel_football_grade_authority
(team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
values
  ('CAR','QB','bryceyoung','Bryce Young',86,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('DAL','QB','dakprescott','Dak Prescott',88,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('SEA','QB','samdarnold','Sam Darnold',83,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('KC','RB','kennethwalker','Kenneth Walker',94,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('NYJ','RB','braelonallen','Braelon Allen',82,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('GB','WR','matthewgolden','Matthew Golden',85,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json'),
  ('GB','WR','christianwatson','Christian Watson',89,date '2026-10-27','nfl-wheel-week7-seven-additional-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json');

do $postflight$
declare matched integer;
begin
  with expected(team_code,position_group,name_key,display_name,old_grade,new_grade,prior_date) as (
  values
    ('CAR','QB','bryceyoung','Bryce Young',83,86,date '2026-10-08'),
    ('DAL','QB','dakprescott','Dak Prescott',92,88,date '2026-10-03'),
    ('SEA','QB','samdarnold','Sam Darnold',88,83,date '2026-10-03'),
    ('KC','RB','kennethwalker','Kenneth Walker',91,94,date '2026-10-08'),
    ('NYJ','RB','braelonallen','Braelon Allen',78,82,date '2026-10-03'),
    ('GB','WR','matthewgolden','Matthew Golden',81,85,date '2026-10-03'),
    ('GB','WR','christianwatson','Christian Watson',85,89,date '2026-10-03')
)
  select count(*) into matched
  from private.wheel_football_grade_authority a join expected e
    on a.team_code=e.team_code and a.position_group=e.position_group
   and a.name_key=e.name_key and a.display_name=e.display_name and a.hidden_grade=e.new_grade
   and a.effective_date=date '2026-10-27'
  where a.grade_version='nfl-wheel-week7-seven-additional-ability-2026-10-27-v1' and a.source_artifact='data/curated/football/nfl/wheel-nfl-skill-and-qb-ability-revisions-2026-10-27.json';
  if matched<>7 then raise exception 'NFL seven-player grade postflight expected seven, found %',matched; end if;
end $postflight$;
