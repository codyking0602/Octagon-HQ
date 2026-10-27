-- Current CFB Wheel grade authority: three independently verified school/position cases.
-- Mergott Duke: 2026 official starting LB, seven tackles vs Virginia Oct 23.
-- Lovelace Pitt: 2026 official starting outside LB, 2025 80 tackles and Butkus watch list.
-- Curry Texas Tech: official 2025 14-game starting STAR; retain 2026 curated Secondary.
-- Leave LSU CJ Jimcoily ungraded pending current defensive snap alignment confirmation.
-- Append grade versions only; historical scores, grade records and school identity unchanged.
create temporary table cfb_verified_roles_oct26 (
 team_code text not null,
 position_group text not null,
 display_name text not null,
 hidden_grade numeric(5,2) not null,
 primary key(team_code,position_group,display_name)
) on commit drop;
insert into cfb_verified_roles_oct26 values
 ('duke','Front Seven','Luke Mergott',86),
 ('pittsburgh','Front Seven','Braylan Lovelace',90),
 ('texas-tech','Secondary','John Curry',88);

do $preflight$
declare v_seen integer;
begin
 if (select count(*) from cfb_verified_roles_oct26) <> 3 then
  raise exception 'Expected precisely three CFB role-authority identities';
 end if;
 select count(*) into v_seen from cfb_verified_roles_oct26 p
 join private.wheel_football_grade_authority a
 on a.team_code=p.team_code
 and a.position_group=p.position_group
 and a.name_key=private.wheel_football_grade_name_key(p.display_name);
 if v_seen <> 0 then
  raise exception 'Previously graded CFB role identity detected: %; refuse duplicate',v_seen;
 end if;
 if exists (select 1 from private.wheel_football_grade_authority
  where lower(display_name) in ('luke mergott','braylan lovelace','john curry')) then
  raise exception 'A held CFB player already has published grade in another family';
 end if;
end $preflight$;

insert into private.wheel_football_grade_authority
(team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
select p.team_code,p.position_group,private.wheel_football_grade_name_key(p.display_name),
p.display_name,p.hidden_grade,date '2026-10-26',
'cfb-wheel-verified-three-roles-2026-10-26-v1',
'data/generated/football/cfb/wheel-football-current-priorities-2026.json'
from cfb_verified_roles_oct26 p;

do $postflight$
begin
 if (select count(*) from cfb_verified_roles_oct26 p
  join private.wheel_football_grade_authority a
    on a.team_code=p.team_code and a.position_group=p.position_group
    and a.name_key=private.wheel_football_grade_name_key(p.display_name)
    and a.hidden_grade=p.hidden_grade
    and a.grade_version='cfb-wheel-verified-three-roles-2026-10-26-v1') <> 3 then
   raise exception 'CFB verified grade postflight failed';
 end if;
 if exists (select 1 from private.wheel_football_grade_authority
  where lower(display_name)='cj jimcoily') then
   raise exception 'Held LSU role must remain ungraded';
 end if;
end $postflight$;
