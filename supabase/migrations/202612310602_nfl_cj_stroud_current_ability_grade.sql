-- One current NFL ability revision, verified through October 25, 2026 Week 7.
-- C.J. Stroud 82 -> 88 (HOU QB); preserve original Oct 3 grade row.
-- Official 2026 seven-game baseline: 1,867 yards, 11 TD, 1 INT, 100.7 rating.
-- https://www.houstontexans.com/team/players-roster/c-j-stroud/logs/
-- Exact peer-calibration rationale is in data/curated/football/nfl/
-- wheel-nfl-current-ability-revisions-2026-10-26.json.
-- This migration never rewrites scored wheel_football_picks.
do $preflight$
begin
  if (select count(*) from private.wheel_football_grade_authority
    where team_code='HOU' and position_group='QB' and name_key='cjstroud'
      and display_name='C.J. Stroud'
      and hidden_grade=82 and effective_date=date '2026-10-03'
      and grade_version='nfl-wheel-qb-grades-2026-10-03-v1') <> 1 then
    raise exception 'C.J. Stroud historical HOU QB grading authority mismatch';
  end if;
  if exists (
    select 1 from private.wheel_football_grade_authority
    where team_code='HOU' and position_group='QB'
      and name_key='cjstroud' and effective_date>date '2026-10-03'
  ) then
    raise exception 'C.J. Stroud already received a newer grading version';
  end if;
end $preflight$;

insert into private.wheel_football_grade_authority
(team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
values (
'HOU','QB','cjstroud','C.J. Stroud',88,date '2026-10-26',
'nfl-wheel-stroud-current-ability-2026-10-26-v1',
'data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-26.json'
);

do $postflight$
begin
  if (select count(*) from private.wheel_football_grade_authority
    where team_code='HOU' and position_group='QB' and name_key='cjstroud'
      and hidden_grade=88 and effective_date=date '2026-10-26'
      and grade_version='nfl-wheel-stroud-current-ability-2026-10-26-v1') <> 1
  or (select count(*) from private.wheel_football_grade_authority
    where team_code='HOU' and position_group='QB' and name_key='cjstroud'
      and hidden_grade=82 and effective_date=date '2026-10-03') <> 1 then
    raise exception 'Stroud current grade and historical seed postflight mismatch';
  end if;
end $postflight$;
