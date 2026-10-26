-- Complete nine already-curated CFB Wheel player current-ability grades.
-- Source: data/curated/football/cfb/wheel-cfb-nine-new-current-ability-grades-2026-10-26.json
-- All nine are in their approved CFB school and position family; four ambiguous
-- role cases remain separate and are NOT changed here.
-- Append the first grade version only. Never rewrite historical grades/results.
create temporary table cfb_nine_grade_authority (
  team_code text not null,
  position_group text not null,
  display_name text not null,
  grade numeric(5,2) not null check (grade between 0 and 100),
  primary key (team_code,position_group,display_name)
) on commit drop;

insert into cfb_nine_grade_authority (team_code,position_group,display_name,grade) values
  ('georgia', 'Front Seven', 'Joseph Jonah-Ajonye', 82),
  ('missouri', 'Front Seven', 'Darris Smith', 81),
  ('oklahoma', 'Front Seven', 'Owen Heinecke', 87),
  ('ohio-state', 'Front Seven', 'Zion Grady', 81),
  ('penn-state', 'TE', 'Gabe Burkle', 84),
  ('arizona', 'Front Seven', 'Dominic Lolesio', 80),
  ('utah', 'Front Seven', 'Kash Dillon', 82),
  ('boston-college', 'Front Seven', 'Bodie Kahoun', 81),
  ('virginia', 'RB', 'Peyton Lewis', 80);

do $preflight$
declare v_existing integer;
begin
  if (select count(*) from cfb_nine_grade_authority) <> 9 then
    raise exception 'CFB nine-grade input identity census mismatch';
  end if;
  select count(*) into v_existing
  from cfb_nine_grade_authority desired
  join private.wheel_football_grade_authority existing
    on existing.team_code=desired.team_code
   and existing.position_group=desired.position_group
   and existing.name_key=private.wheel_football_grade_name_key(desired.display_name);
  if v_existing <> 0 then
    raise exception 'CFB grade authority already exists for % planned identities; refuse overwrite',v_existing;
  end if;
end;
$preflight$;

insert into private.wheel_football_grade_authority
 (team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
select desired.team_code, desired.position_group,
       private.wheel_football_grade_name_key(desired.display_name),
       desired.display_name, desired.grade, date '2026-10-26',
       'cfb-wheel-nine-missing-grade-additions-2026-10-26-v1',
       'data/curated/football/cfb/wheel-cfb-nine-new-current-ability-grades-2026-10-26.json'
from cfb_nine_grade_authority desired;

do $postflight$
declare v_count integer;
begin
  select count(*) into v_count
  from cfb_nine_grade_authority desired
  join private.wheel_football_grade_authority actual
    on actual.team_code=desired.team_code
   and actual.position_group=desired.position_group
   and actual.name_key=private.wheel_football_grade_name_key(desired.display_name)
   and actual.hidden_grade=desired.grade
   and actual.effective_date=date '2026-10-26'
   and actual.grade_version='cfb-wheel-nine-missing-grade-additions-2026-10-26-v1';
  if v_count <> 9 then
    raise exception 'CFB nine-grade postflight failed: % of 9 current ability records',v_count;
  end if;
end;
$postflight$;
