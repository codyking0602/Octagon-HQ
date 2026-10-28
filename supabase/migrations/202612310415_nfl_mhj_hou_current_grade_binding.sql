-- Verified October 12, 2026, Arizona -> Houston Marvin Harrison Jr. trade.
-- https://www.houstontexans.com/news/houston-texans-transactions-10-12-2026
-- Preserve the October 3 ARI historical identity/grade; append the same ability at HOU.
-- No ability regrading, player replacement or historical result edit.
do $check$
declare v_origin_count integer;
begin
  select count(*) into v_origin_count
  from private.wheel_football_grade_authority
  where team_code='ARI' and position_group='WR'
    and name_key=private.wheel_football_grade_name_key('Marvin Harrison Jr.')
    and hidden_grade=85 and effective_date=date '2026-10-03';
  if v_origin_count <> 1 then
    raise exception 'Harrison transaction preflight expected one historical ARI grade 85, got %',v_origin_count;
  end if;
  if exists (
    select 1 from private.wheel_football_grade_authority
    where team_code='HOU' and position_group='WR'
      and name_key=private.wheel_football_grade_name_key('Marvin Harrison Jr.')
  ) then
    raise exception 'Harrison HOU authority already present; refusing duplicate';
  end if;
end
$check$;

insert into private.wheel_football_grade_authority
(team_code,position_group,name_key,display_name,hidden_grade,effective_date,grade_version,source_artifact)
select 'HOU',position_group,name_key,display_name,hidden_grade,date '2026-10-26',
       'nfl-wheel-mhj-hou-trade-2026-10-26-v1',
       'https://www.houstontexans.com/news/houston-texans-transactions-10-12-2026'
from private.wheel_football_grade_authority
where team_code='ARI' and position_group='WR'
  and name_key=private.wheel_football_grade_name_key('Marvin Harrison Jr.')
  and hidden_grade=85 and effective_date=date '2026-10-03';

do $verify$
begin
  if (select count(*) from private.wheel_football_grade_authority
      where team_code='HOU' and position_group='WR'
        and name_key=private.wheel_football_grade_name_key('Marvin Harrison Jr.')
        and hidden_grade=85 and grade_version='nfl-wheel-mhj-hou-trade-2026-10-26-v1') <> 1 then
    raise exception 'Harrison HOU grade append postflight failed';
  end if;
end
$verify$;
