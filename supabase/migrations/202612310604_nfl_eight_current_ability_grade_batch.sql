-- NFL-only, independently sourced 2026 present-ability review as of Oct 25 (eight players).
-- Change reasons and official stats links: data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json
-- Append only: the Wheel grade resolver picks newest authority as of the game date.
-- Do NOT rewrite historical games, Oct 3/8 baseline artifacts or GM saved seasons.
do $preflight$
declare
  v_mismatch text;
begin
  with expected(team_code,position_group,name_key,display_name,old_grade,prior_date) as (
    values
    ('ATL','QB','michaelpenixjr','Michael Penix Jr.',78,date '2026-10-03'),
    ('CAR','QB','bryceyoung','Bryce Young',83,date '2026-10-08'),
    ('DAL','QB','dakprescott','Dak Prescott',92,date '2026-10-03'),
    ('SEA','QB','samdarnold','Sam Darnold',88,date '2026-10-03'),
    ('KC','RB','kennethwalker','Kenneth Walker',91,date '2026-10-08'),
    ('NYJ','RB','braelonallen','Braelon Allen',78,date '2026-10-03'),
    ('GB','WR','matthewgolden','Matthew Golden',81,date '2026-10-03'),
    ('GB','WR','christianwatson','Christian Watson',85,date '2026-10-03')
  )
  select string_agg(
    format('%s %s %s: expected %s at %s, found %s at %s',
      e.team_code,e.position_group,e.display_name,e.old_grade,e.prior_date,
      latest.hidden_grade,latest.effective_date), '; ')
    into v_mismatch
  from expected e
  left join lateral (
    select hidden_grade,effective_date
    from private.wheel_football_grade_authority a
    where a.team_code=e.team_code and a.position_group=e.position_group
      and a.name_key=e.name_key and a.effective_date<date '2026-10-27'
    order by a.effective_date desc limit 1
  ) latest on true
  where latest.hidden_grade is distinct from e.old_grade
     or latest.effective_date is distinct from e.prior_date;
  if v_mismatch is not null then
    raise exception 'NFL October 27 current-grade source baseline changed: %',v_mismatch;
  end if;
  if exists (
    with expected(team_code,position_group,name_key) as (
      values
      ('ATL','QB','michaelpenixjr'),
      ('CAR','QB','bryceyoung'),
      ('DAL','QB','dakprescott'),
      ('SEA','QB','samdarnold'),
      ('KC','RB','kennethwalker'),
      ('NYJ','RB','braelonallen'),
      ('GB','WR','matthewgolden'),
      ('GB','WR','christianwatson')
    )
    select 1 from private.wheel_football_grade_authority a
    join expected e using(team_code,position_group,name_key)
    where a.effective_date>=date '2026-10-27'
  ) then
    raise exception 'NFL October 27 grade version already exists or newer authority supersedes it';
  end if;
end $preflight$;

insert into private.wheel_football_grade_authority
(team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
values
  ('ATL','QB','michaelpenixjr','Michael Penix Jr.',84,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('CAR','QB','bryceyoung','Bryce Young',86,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('DAL','QB','dakprescott','Dak Prescott',88,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('SEA','QB','samdarnold','Sam Darnold',83,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('KC','RB','kennethwalker','Kenneth Walker',94,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('NYJ','RB','braelonallen','Braelon Allen',82,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('GB','WR','matthewgolden','Matthew Golden',85,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('GB','WR','christianwatson','Christian Watson',89,date '2026-10-27','nfl-wheel-current-ability-oct27-eight-player-batch-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json');

do $postflight$
declare
  v_matches integer;
begin
  with expected(team_code,position_group,name_key,display_name,new_grade,grade_date) as (
    values
    ('ATL','QB','michaelpenixjr','Michael Penix Jr.',84,date '2026-10-27'),
    ('CAR','QB','bryceyoung','Bryce Young',86,date '2026-10-27'),
    ('DAL','QB','dakprescott','Dak Prescott',88,date '2026-10-27'),
    ('SEA','QB','samdarnold','Sam Darnold',83,date '2026-10-27'),
    ('KC','RB','kennethwalker','Kenneth Walker',94,date '2026-10-27'),
    ('NYJ','RB','braelonallen','Braelon Allen',82,date '2026-10-27'),
    ('GB','WR','matthewgolden','Matthew Golden',85,date '2026-10-27'),
    ('GB','WR','christianwatson','Christian Watson',89,date '2026-10-27')
  )
  select count(*) into v_matches
  from private.wheel_football_grade_authority a
  join expected e
    on a.team_code=e.team_code and a.position_group=e.position_group
   and a.name_key=e.name_key and a.display_name=e.display_name
   and a.hidden_grade=e.new_grade and a.effective_date=e.grade_date
  where a.grade_version='nfl-wheel-current-ability-oct27-eight-player-batch-v1'
    and a.source_artifact='data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json';
  if v_matches<>8 then
    raise exception 'NFL October 27 eight-grade postflight: expected 8, got %', v_matches;
  end if;
end $postflight$;
