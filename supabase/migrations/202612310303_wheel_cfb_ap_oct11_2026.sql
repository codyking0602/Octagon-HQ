-- Wednesday 2026-10-14: store the AP poll published 2026-10-11.
-- Preserve older poll snapshots and in-flight match records.
-- All entrants are in the audited 68-school base except Boise State,
-- whose extra-team grading audit was completed in migration 252.
do $wheel_ap_oct11_preflight$
declare
  v_missing text;
begin
  with incoming(team_code) as (
    values ('georgia'), ('notre-dame'), ('miami'), ('ohio-state'), ('indiana'), ('alabama'), ('texas'), ('byu'), ('ole-miss'), ('texas-tech'), ('utah'), ('ucla'), ('missouri'), ('tennessee'), ('kentucky'), ('mississippi-state'), ('iowa'), ('oklahoma-state'), ('usc'), ('houston'), ('wake-forest'), ('lsu'), ('boise-state'), ('smu'), ('northwestern')
  )
  select string_agg(incoming.team_code, ', ' order by incoming.team_code)
  into v_missing
  from incoming
  left join private.wheel_football_teams team on team.code = incoming.team_code
  where team.code is null;
  if v_missing is not null then
    raise exception 'October 11 AP poll references unknown team(s): %', v_missing;
  end if;
end;
$wheel_ap_oct11_preflight$;

insert into private.wheel_football_ap_top_25 (season, poll_date, rank, team_code, source_url)
values
  (2026, date '2026-10-11', 1, 'georgia', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 2, 'notre-dame', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 3, 'miami', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 4, 'ohio-state', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 5, 'indiana', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 6, 'alabama', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 7, 'texas', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 8, 'byu', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 9, 'ole-miss', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 10, 'texas-tech', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 11, 'utah', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 12, 'ucla', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 13, 'missouri', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 14, 'tennessee', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 15, 'kentucky', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 16, 'mississippi-state', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 17, 'iowa', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 18, 'oklahoma-state', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 19, 'usc', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 20, 'houston', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 21, 'wake-forest', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 22, 'lsu', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 23, 'boise-state', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 24, 'smu', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21'),
  (2026, date '2026-10-11', 25, 'northwestern', 'https://apnews.com/article/f1cb200a8e2cd56902253c89e6255d21')
on conflict (season, poll_date, rank) do update
set team_code = excluded.team_code, source_url = excluded.source_url;

do $wheel_ap_oct11_postflight$
declare
  v_count integer;
  v_unique integer;
begin
  select count(*), count(distinct team_code) into v_count, v_unique
  from private.wheel_football_ap_top_25
  where season = 2026 and poll_date = date '2026-10-11';
  if v_count <> 25 or v_unique <> 25 then
    raise exception 'October 11 AP poll must have exactly 25 unique teams; got % rows / % schools', v_count, v_unique;
  end if;
  if not exists (
    select 1 from private.wheel_football_ap_top_25
    where season = 2026 and poll_date = date '2026-10-11'
      and rank = 23 and team_code = 'boise-state'
  ) then
    raise exception 'Boise State must remain #23 in October 11 AP poll';
  end if;
end;
$wheel_ap_oct11_postflight$;
