-- NFL-only Week 7 QB current-ability batch (ATL, DET, JAX, LV, NYJ).
-- See data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json for five independent player sources and peer-calibrated rationales.
-- Append only: October 3 authority, existing Wheel picks, GM contracts/profiles and completed saves stay intact.
-- 5 preflighted identities; no team, name, contract, roster, or development mutation.
do $nfl_qb_batch_preflight$
declare
  candidate record;
begin
  for candidate in
    select * from (values
    ('ATL','michaelpenixjr','Michael Penix Jr.',78,83),
    ('DET','jaredgoff','Jared Goff',89,92),
    ('JAX','trevorlawrence','Trevor Lawrence',87,90),
    ('LV','kirkcousins','Kirk Cousins',80,85),
    ('NYJ','genosmith','Geno Smith',82,85)
    ) as expected(team_code,name_key,display_name,old_grade,new_grade)
  loop
    if (select count(*) from private.wheel_football_grade_authority g
      where g.team_code=candidate.team_code and g.position_group='QB'
        and g.name_key=candidate.name_key and g.display_name=candidate.display_name
        and g.hidden_grade=candidate.old_grade and g.effective_date=date '2026-10-03'
        and g.grade_version='nfl-wheel-qb-grades-2026-10-03-v1') <> 1 then
      raise exception 'NFL QB batch historical grading authority mismatch: %/%', candidate.team_code,candidate.name_key;
    end if;
    if exists (
      select 1 from private.wheel_football_grade_authority g
      where g.team_code=candidate.team_code and g.position_group='QB'
        and g.name_key=candidate.name_key and g.effective_date > date '2026-10-03'
    ) then
      raise exception 'NFL QB batch identity already has a newer grading authority: %/%',candidate.team_code,candidate.name_key;
    end if;
  end loop;
end $nfl_qb_batch_preflight$;

insert into private.wheel_football_grade_authority
  (team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
values
  ('ATL','QB','michaelpenixjr','Michael Penix Jr.',83,date '2026-10-27','nfl-wheel-qb-week7-current-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('DET','QB','jaredgoff','Jared Goff',92,date '2026-10-27','nfl-wheel-qb-week7-current-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('JAX','QB','trevorlawrence','Trevor Lawrence',90,date '2026-10-27','nfl-wheel-qb-week7-current-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('LV','QB','kirkcousins','Kirk Cousins',85,date '2026-10-27','nfl-wheel-qb-week7-current-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json'),
  ('NYJ','QB','genosmith','Geno Smith',85,date '2026-10-27','nfl-wheel-qb-week7-current-ability-2026-10-27-v1','data/curated/football/nfl/wheel-nfl-current-ability-revisions-2026-10-27.json');

do $nfl_qb_batch_postflight$
declare
  candidate record;
begin
  for candidate in
    select * from (values
    ('ATL','michaelpenixjr','Michael Penix Jr.',78,83),
    ('DET','jaredgoff','Jared Goff',89,92),
    ('JAX','trevorlawrence','Trevor Lawrence',87,90),
    ('LV','kirkcousins','Kirk Cousins',80,85),
    ('NYJ','genosmith','Geno Smith',82,85)
    ) as expected(team_code,name_key,display_name,old_grade,new_grade)
  loop
    if (select count(*) from private.wheel_football_grade_authority g
      where g.team_code=candidate.team_code and g.position_group='QB'
        and g.name_key=candidate.name_key and g.display_name=candidate.display_name
        and g.hidden_grade=candidate.new_grade and g.effective_date=date '2026-10-27'
        and g.grade_version='nfl-wheel-qb-week7-current-ability-2026-10-27-v1') <> 1
      or (select count(*) from private.wheel_football_grade_authority g
        where g.team_code=candidate.team_code and g.position_group='QB'
          and g.name_key=candidate.name_key and g.hidden_grade=candidate.old_grade
          and g.effective_date=date '2026-10-03') <> 1 then
      raise exception 'NFL QB batch current/historical version postflight mismatch: %/%',candidate.team_code,candidate.name_key;
    end if;
  end loop;
end $nfl_qb_batch_postflight$;
