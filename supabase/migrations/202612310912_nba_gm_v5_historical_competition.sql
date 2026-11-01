-- NBA GM V5 owner-only competition model: 150 REAL team-seasons and private 7-man impact.
-- Observed wins/net and playoff reaches: Basketball-Reference 2021-22 through 2025-26.
-- 2026 top player BPM anchors (Jokic, SGA, Wembanyama, Barnes, Edwards) ground
-- the piecewise OVR-to-impact scale; ratings-to-BPM is STILL an editorial
-- proxy, not a historical player-grade regression. No source claims otherwise.
-- Simulation applies ONLY when simulationModelVersion='5' and economyVersion='4'.
-- Existing saved V2/V3/V4 and all football games retain exact scoring.
create table if not exists private.nba_gm_v5_historical_teams (
 season_end integer not null,
 team_code text not null,
 wins integer not null,
 losses integer not null,
 offensive_rating numeric not null,
 defensive_rating numeric not null,
 net_rating numeric not null,
 finish text not null,
 playoff_depth integer not null,
 primary key(season_end,team_code)
);
-- Private table, no anon/authenticated schema exposure.
revoke all on private.nba_gm_v5_historical_teams from public,anon,authenticated;
insert into private.nba_gm_v5_historical_teams
(season_end,team_code,wins,losses,offensive_rating,defensive_rating,net_rating,finish,playoff_depth)
values
(2022,'BOS',51,31,114.54,106.93,7.61,'Finals',4),
(2022,'PHX',64,18,114.92,107.48,7.44,'Conference Semifinals',2),
(2022,'UTA',49,33,116.74,110.63,6.11,'First Round',1),
(2022,'GSW',53,29,112.54,106.91,5.63,'Champion',5),
(2022,'MEM',56,26,114.71,109.19,5.52,'Conference Semifinals',2),
(2022,'MIA',53,29,113.86,109.28,4.58,'Conference Finals',3),
(2022,'DAL',52,30,113,109.5,3.5,'Conference Finals',3),
(2022,'MIL',51,31,115.11,111.82,3.29,'Conference Semifinals',2),
(2022,'PHI',51,31,113.48,110.89,2.59,'Conference Semifinals',2),
(2022,'TOR',48,34,113.01,110.65,2.36,'First Round',1),
(2022,'MIN',46,36,114.34,111.81,2.53,'First Round',1),
(2022,'DEN',48,34,114.47,112.15,2.32,'First Round',1),
(2022,'CLE',44,38,111.87,109.77,2.1,'Missed Playoffs',0),
(2022,'ATL',43,39,116.51,114.93,1.58,'First Round',1),
(2022,'BKN',44,38,113.72,112.97,0.75,'First Round',1),
(2022,'CHA',43,39,114.27,113.76,0.51,'Missed Playoffs',0),
(2022,'NYK',37,45,110.52,110.59,-0.07,'Missed Playoffs',0),
(2022,'LAC',42,40,110.12,110.18,-0.06,'Missed Playoffs',0),
(2022,'SAS',34,48,112.37,112.34,0.03,'Missed Playoffs',0),
(2022,'CHI',46,36,113.26,113.74,-0.48,'First Round',1),
(2022,'NOP',36,46,112.08,113.05,-0.97,'First Round',1),
(2022,'LAL',33,49,110.41,113.41,-3,'Missed Playoffs',0),
(2022,'IND',25,57,112.67,116.16,-3.49,'Missed Playoffs',0),
(2022,'WAS',35,47,111.1,114.69,-3.59,'Missed Playoffs',0),
(2022,'SAC',30,52,109.9,115.44,-5.54,'Missed Playoffs',0),
(2022,'DET',23,59,106.11,113.77,-7.66,'Missed Playoffs',0),
(2022,'ORL',22,60,104.57,112.52,-7.95,'Missed Playoffs',0),
(2022,'OKC',24,58,104.59,112.72,-8.13,'Missed Playoffs',0),
(2022,'HOU',20,62,108.45,116.86,-8.41,'Missed Playoffs',0),
(2022,'POR',27,55,107.97,117.03,-9.06,'Missed Playoffs',0),
(2023,'BOS',57,25,118.2,111.54,6.66,'Conference Finals',3),
(2023,'CLE',51,31,116.17,110.62,5.55,'First Round',1),
(2023,'PHI',54,28,117.88,113.56,4.32,'Conference Semifinals',2),
(2023,'MEM',51,31,115.21,111.31,3.9,'First Round',1),
(2023,'MIL',58,24,115.5,112.02,3.48,'First Round',1),
(2023,'NYK',47,35,117.88,114.88,3,'Conference Semifinals',2),
(2023,'DEN',53,29,117.61,114.31,3.3,'Champion',5),
(2023,'SAC',48,34,119.41,116.93,2.48,'First Round',1),
(2023,'PHX',45,37,115.17,113.06,2.11,'Conference Semifinals',2),
(2023,'TOR',41,41,115.63,114.13,1.5,'Missed Playoffs',0),
(2023,'GSW',44,38,116.33,114.57,1.76,'Conference Semifinals',2),
(2023,'NOP',42,40,114.56,112.69,1.87,'Missed Playoffs',0),
(2023,'CHI',40,42,113.62,112.29,1.33,'Missed Playoffs',0),
(2023,'BKN',45,37,115.14,114.15,0.99,'First Round',1),
(2023,'OKC',40,42,115.24,114.22,1.02,'Missed Playoffs',0),
(2023,'LAL',43,39,114.68,114.12,0.56,'Conference Finals',3),
(2023,'ATL',41,41,116.72,116.43,0.29,'First Round',1),
(2023,'LAC',44,38,115.15,114.63,0.52,'First Round',1),
(2023,'DAL',38,44,116.89,116.82,0.07,'Missed Playoffs',0),
(2023,'MIN',42,40,113.81,113.8,0.01,'First Round',1),
(2023,'MIA',44,38,113.15,113.56,-0.41,'Finals',4),
(2023,'WAS',35,47,114.5,115.76,-1.26,'Missed Playoffs',0),
(2023,'UTA',37,45,115.85,116.87,-1.02,'Missed Playoffs',0),
(2023,'ORL',34,48,111.67,114.24,-2.57,'Missed Playoffs',0),
(2023,'IND',35,47,114.7,117.82,-3.12,'Missed Playoffs',0),
(2023,'POR',33,49,114.88,118.94,-4.06,'Missed Playoffs',0),
(2023,'CHA',27,55,109.26,115.49,-6.23,'Missed Playoffs',0),
(2023,'HOU',22,60,111.38,119.34,-7.96,'Missed Playoffs',0),
(2023,'DET',17,65,110.69,118.97,-8.28,'Missed Playoffs',0),
(2023,'SAS',22,60,110.44,120.23,-9.79,'Missed Playoffs',0),
(2024,'BOS',64,18,123.35,111.73,11.62,'Champion',5),
(2024,'OKC',57,25,119.51,112.28,7.23,'Conference Semifinals',2),
(2024,'MIN',56,26,115.77,109.15,6.62,'Conference Finals',3),
(2024,'DEN',57,25,118.56,113.16,5.4,'Conference Semifinals',2),
(2024,'NYK',50,32,118.28,113.4,4.88,'Conference Semifinals',2),
(2024,'NOP',49,33,117.44,112.86,4.58,'First Round',1),
(2024,'LAC',51,31,118.82,115.59,3.23,'First Round',1),
(2024,'PHX',49,33,117.86,114.79,3.07,'First Round',1),
(2024,'GSW',46,36,117.93,115.23,2.7,'Missed Playoffs',0),
(2024,'IND',47,35,121.05,118.08,2.97,'Conference Finals',3),
(2024,'PHI',47,35,116.93,113.93,3,'First Round',1),
(2024,'MIL',49,33,118.43,115.81,2.62,'First Round',1),
(2024,'SAC',46,36,116.92,115.25,1.67,'Missed Playoffs',0),
(2024,'DAL',50,32,117.66,115.57,2.09,'Finals',4),
(2024,'CLE',48,34,115.25,112.86,2.39,'Conference Semifinals',2),
(2024,'ORL',47,35,113.41,111.33,2.08,'First Round',1),
(2024,'HOU',41,41,114.63,113.51,1.12,'Missed Playoffs',0),
(2024,'MIA',46,36,114.06,112.42,1.64,'First Round',1),
(2024,'LAL',47,35,115.95,115.47,0.48,'First Round',1),
(2024,'CHI',39,43,114.92,116.54,-1.62,'Missed Playoffs',0),
(2024,'ATL',36,46,117.25,119.34,-2.09,'Missed Playoffs',0),
(2024,'BKN',32,50,113.2,116.17,-2.97,'Missed Playoffs',0),
(2024,'UTA',31,51,115.6,120.56,-4.96,'Missed Playoffs',0),
(2024,'SAS',22,60,110.17,116.45,-6.28,'Missed Playoffs',0),
(2024,'TOR',25,57,112.38,118.89,-6.51,'Missed Playoffs',0),
(2024,'MEM',27,55,107.29,114.41,-7.12,'Missed Playoffs',0),
(2024,'POR',21,61,108.4,117.59,-9.19,'Missed Playoffs',0),
(2024,'DET',14,68,109.76,118.79,-9.03,'Missed Playoffs',0),
(2024,'WAS',15,67,110.49,119.54,-9.05,'Missed Playoffs',0),
(2024,'CHA',21,61,109.39,119.93,-10.54,'Missed Playoffs',0),
(2025,'OKC',68,14,120.33,107.61,12.72,'Champion',5),
(2025,'CLE',64,18,121.88,112.34,9.54,'Conference Semifinals',2),
(2025,'BOS',61,21,120.83,111.32,9.51,'Conference Semifinals',2),
(2025,'MIN',49,33,116.72,111.53,5.19,'Conference Finals',3),
(2025,'LAC',50,32,115.2,110.43,4.77,'First Round',1),
(2025,'HOU',52,30,115.23,110.89,4.34,'First Round',1),
(2025,'MEM',48,34,117.83,113.11,4.72,'First Round',1),
(2025,'DEN',50,32,119.97,116.2,3.77,'Conference Semifinals',2),
(2025,'NYK',51,31,118.42,114.34,4.08,'Conference Finals',3),
(2025,'GSW',48,34,115.09,111.81,3.28,'Conference Semifinals',2),
(2025,'MIL',48,34,115.99,113.52,2.47,'First Round',1),
(2025,'DET',44,38,115.05,113.12,1.93,'First Round',1),
(2025,'IND',50,32,116.67,114.36,2.31,'Finals',4),
(2025,'LAL',50,32,115.92,114.7,1.22,'First Round',1),
(2025,'SAC',40,42,116.86,116.35,0.51,'Missed Playoffs',0),
(2025,'MIA',37,45,113.61,113.07,0.54,'First Round',1),
(2025,'ORL',41,41,109.46,109.54,-0.08,'First Round',1),
(2025,'DAL',39,43,114.9,116.05,-1.15,'Missed Playoffs',0),
(2025,'ATL',40,42,114.74,115.74,-1,'Missed Playoffs',0),
(2025,'CHI',39,43,114.28,115.77,-1.49,'Missed Playoffs',0),
(2025,'SAS',34,48,114.53,117.23,-2.7,'Missed Playoffs',0),
(2025,'POR',36,46,111.95,114.75,-2.8,'Missed Playoffs',0),
(2025,'PHX',36,46,116.26,119.3,-3.04,'Missed Playoffs',0),
(2025,'TOR',30,52,110.52,114.93,-4.41,'Missed Playoffs',0),
(2025,'PHI',24,58,111.91,118.33,-6.42,'Missed Playoffs',0),
(2025,'BKN',26,56,108.62,115.83,-7.21,'Missed Playoffs',0),
(2025,'UTA',17,65,111.24,120.61,-9.37,'Missed Playoffs',0),
(2025,'NOP',21,61,110.39,120.01,-9.62,'Missed Playoffs',0),
(2025,'CHA',19,63,107.37,116.65,-9.28,'Missed Playoffs',0),
(2025,'WAS',18,64,106.79,119.12,-12.33,'Missed Playoffs',0),
(2026,'OKC',64,18,118.94,107.89,11.05,'Conference Finals',3),
(2026,'SAS',62,20,119.68,111.41,8.27,'Finals',4),
(2026,'BOS',56,26,120.82,112.67,8.15,'First Round',1),
(2026,'DET',60,22,118.05,109.81,8.24,'Conference Semifinals',2),
(2026,'NYK',53,29,119.87,113.4,6.47,'Champion',5),
(2026,'HOU',52,30,118.69,113.3,5.39,'First Round',1),
(2026,'DEN',54,28,122.63,117.46,5.17,'First Round',1),
(2026,'CHA',44,38,119.5,114.47,5.03,'Missed Playoffs',0),
(2026,'CLE',52,30,119.26,115.2,4.06,'Conference Finals',3),
(2026,'MIN',49,33,116.76,113.68,3.08,'Conference Semifinals',2),
(2026,'TOR',46,36,115.83,113.25,2.58,'First Round',1),
(2026,'ATL',46,36,116.13,113.77,2.36,'First Round',1),
(2026,'MIA',43,39,116.71,114.54,2.17,'Missed Playoffs',0),
(2026,'PHX',45,37,115.51,114.09,1.42,'First Round',1),
(2026,'LAL',53,29,118.21,116.48,1.73,'Conference Semifinals',2),
(2026,'LAC',42,40,117.45,116.32,1.13,'Missed Playoffs',0),
(2026,'ORL',45,37,115.09,114.54,0.55,'First Round',1),
(2026,'POR',42,40,114.54,114.71,-0.17,'First Round',1),
(2026,'PHI',45,37,115.4,115.58,-0.18,'Conference Semifinals',2),
(2026,'GSW',37,45,115.05,115.6,-0.55,'Missed Playoffs',0),
(2026,'NOP',26,56,114.4,119.05,-4.65,'Missed Playoffs',0),
(2026,'CHI',31,51,113.01,118.16,-5.15,'Missed Playoffs',0),
(2026,'DAL',26,56,111.23,116.66,-5.43,'Missed Playoffs',0),
(2026,'MEM',25,57,113.05,118.95,-5.9,'Missed Playoffs',0),
(2026,'MIL',32,50,112.9,119.4,-6.5,'Missed Playoffs',0),
(2026,'IND',19,63,111.01,118.97,-7.96,'Missed Playoffs',0),
(2026,'UTA',22,60,114.18,122.39,-8.21,'Missed Playoffs',0),
(2026,'SAC',22,60,111.56,121.63,-10.07,'Missed Playoffs',0),
(2026,'BKN',20,62,108.84,119.11,-10.27,'Missed Playoffs',0),
(2026,'WAS',17,65,111,122.84,-11.84,'Missed Playoffs',0)
on conflict(season_end,team_code) do update set
 wins=excluded.wins,losses=excluded.losses,offensive_rating=excluded.offensive_rating,
 defensive_rating=excluded.defensive_rating,net_rating=excluded.net_rating,
 finish=excluded.finish,playoff_depth=excluded.playoff_depth;
do $cohort$
begin
 if (select count(*) from private.nba_gm_v5_historical_teams)<>150 or
    (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth>=1)<>80 or
    (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth>=2)<>40 or
    (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth>=3)<>20 or
    (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth>=4)<>10 or
    (select count(*) from private.nba_gm_v5_historical_teams where playoff_depth=5)<>5 or
    (select count(distinct season_end) from private.nba_gm_v5_historical_teams)<>5
 then raise exception 'NBA V5 historical 150-team source coverage failed';end if;
end;
$cohort$;


-- The 2023-24 and 2024-25 NBA real top-seven workloads (60 teams) average
-- 30.1-30.6 starter minutes and 24.1-24.5 bench minutes (minutes by
-- team-games sorted, cited in V5 audit). 0.63/0.50 of 48 estimates 30.2/24.
-- 7-player 5-start/2-bench game is not a full 12-player NBA roster. Each
-- starter represents 30.2 of 48 court minutes, bench player ~24.0; uncovered
-- share is modeled at replacement value (-2 BPM), not silently made elite.
create or replace function private.nba_gm_v5_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $v5$
declare
 v_pick jsonb;v_player private.nba_gm_dev_players%rowtype;
 v_slot text;v_grade numeric;v_base numeric;v_off_index numeric;v_def_index numeric;
 v_o numeric;v_d numeric;v_weight numeric;v_off numeric:=0;v_def numeric:=0;
 v_net numeric;v_fit numeric:=0;v_spacing integer:=0;
 v_creator_top numeric:=0;v_creator_second numeric:=0;v_creator numeric;
 v_front numeric:=0;v_perim_sum numeric:=0;v_perim_count integer:=0;
 v_count integer:=0;v_wins integer;v_noise integer;
 v_turnover integer:=coalesce(jsonb_array_length(p_state->'releasedIds'),0)
  +coalesce((p_state->>'tradesUsed')::integer,0);
 v_entry numeric;v_roll numeric;
 v_round integer;v_game integer;v_us integer;v_them integer;
 v_cutoff numeric;v_opp integer;v_opp_wins integer;v_opp_net numeric;
 v_game_edge numeric;v_game_win numeric;v_home numeric;
 v_finish text:='Missed Playoffs';
begin
 if p_state->>'economyVersion' is distinct from '4'
   or p_state->>'simulationModelVersion' is distinct from '5' then
   raise exception 'NBA GM V5 is only for opted-in owner franchises';end if;
 if p_year not between 1 and 3 or jsonb_array_length(coalesce(p_state->'picks','[]'::jsonb))<>7 then
   raise exception 'NBA V5 needs exactly seven players and a valid game year';end if;
 for v_pick in select value from jsonb_array_elements(p_state->'picks') loop
   v_slot:=v_pick->>'slot';
   select * into v_player from private.nba_gm_dev_players where id=v_pick->>'playerId';
   if not found or v_slot not in ('PG','SG','SF','PF','C','GUARD','BIG') then
     raise exception 'Unknown V5 roster slot or player';end if;
   v_grade:=private.nba_gm_v3_grade(p_state,v_player.id,p_year);
   -- Piecewise player impact (points/100) anchored to the 2025-26
   -- league BPM distribution, NOT fitted to invented 2022-25 grades.
   v_base:=case when v_grade>=95 then 6.5+(v_grade-95)*.875
     when v_grade>=90 then 3.5+(v_grade-90)*.60
     when v_grade>=85 then 1.3+(v_grade-85)*.44
     when v_grade>=80 then -.2+(v_grade-80)*.30
     when v_grade>=75 then -1.6+(v_grade-75)*.28
     else -3.2+(v_grade-70)*.32 end;
   v_off_index:=.40*(v_player.skills->>'scoring')::numeric
     +.30*(v_player.skills->>'shooting')::numeric
     +.30*(v_player.skills->>'playmaking')::numeric
     +(v_grade-v_player.overall);
   v_def_index:=case v_slot
     when 'PG' then .80*(v_player.skills->>'perimeterDefense')::numeric+.20*(v_player.skills->>'rebounding')::numeric
     when 'SG' then .85*(v_player.skills->>'perimeterDefense')::numeric+.15*(v_player.skills->>'rebounding')::numeric
     when 'SF' then .65*(v_player.skills->>'perimeterDefense')::numeric+.20*(v_player.skills->>'interiorDefense')::numeric+.15*(v_player.skills->>'rebounding')::numeric
     when 'PF' then .50*(v_player.skills->>'interiorDefense')::numeric+.25*(v_player.skills->>'perimeterDefense')::numeric+.25*(v_player.skills->>'rebounding')::numeric
     when 'C' then .70*(v_player.skills->>'interiorDefense')::numeric+.30*(v_player.skills->>'rebounding')::numeric
     when 'GUARD' then .80*(v_player.skills->>'perimeterDefense')::numeric+.20*(v_player.skills->>'rebounding')::numeric
     else .70*(v_player.skills->>'interiorDefense')::numeric+.30*(v_player.skills->>'rebounding')::numeric end
     +(v_grade-v_player.overall);
   -- Overall ability controls impact; specific six-skill divergences contribute
   -- at bounded rates so elite rim protection is not lost to raw scoring sums.
   v_o:=v_base*.62+greatest(-1.0,least(1.0,(v_off_index-80)*.05));
   v_d:=v_base*.38+greatest(-1.0,least(1.0,(v_def_index-80)*.045));
   v_weight:=case when v_slot in ('GUARD','BIG') then .50 else .63 end;
   v_off:=v_off+v_o*v_weight;
   v_def:=v_def+v_d*v_weight;
   if v_slot not in ('GUARD','BIG') then
     if (v_player.skills->>'shooting')::numeric>=80 then v_spacing:=v_spacing+1;end if;
     v_creator:=.65*(v_player.skills->>'scoring')::numeric
       +.35*(v_player.skills->>'playmaking')::numeric+(v_grade-v_player.overall);
     if v_creator>=v_creator_top then
       v_creator_second:=v_creator_top;v_creator_top:=v_creator;
     elsif v_creator>v_creator_second then v_creator_second:=v_creator;end if;
   end if;
   if v_slot='C' then v_front:=(v_player.skills->>'interiorDefense')::numeric+(v_grade-v_player.overall);end if;
   if v_slot in ('PG','SG','SF') then
     v_perim_sum:=v_perim_sum+(v_player.skills->>'perimeterDefense')::numeric+(v_grade-v_player.overall);
     v_perim_count:=v_perim_count+1;
   end if;
   v_count:=v_count+1;
 end loop;
 if v_count<>7 or v_perim_count<>3 then raise exception 'Incomplete V5 starting roles';end if;
 -- Small bounded complementarity; never an artificial +3 baseline per season.
 v_fit:=case when v_spacing>=3 then .35 when v_spacing<2 then -.65 else 0 end;
 if v_creator_top>=90 and v_creator_second>=80 then v_fit:=v_fit+.25;end if;
 if v_front>=90 and v_perim_sum/v_perim_count>=80 then v_fit:=v_fit+.30;end if;
 v_fit:=greatest(-1.0,least(1.0,v_fit));
 -- 0.85 unrepresented court-minute share times replacement BPM (-2.0).
 -- This is explicit, not seven starters magically playing every minute.
 v_net:=greatest(-13.0,least(14.0,v_off+v_def-1.70+v_fit
   -case when p_year=1 then 0 else greatest(0,v_turnover-2)*.30 end));
 -- 150/150 cohort walk-forward 2025-26 calibration:
 -- W=40.9983+2.2684*observed net (heldout RMSE=3.34 wins).
 -- Conservative seeded 3-win noise reflects actual season residuals.
 v_noise:=greatest(-3,least(3,
   (abs(('x'||substr(md5(p_state->>'seed'||':'||p_year),1,8))::bit(32)::int::bigint)%11)::integer-5));
 v_wins:=greatest(8,least(74,round(40.9983+2.2684*v_net+v_noise)::integer));
 -- Observed playoff eligibility from all 150 team-seasons (no playoffs
 -- invented for low-win teams): 0/31 below 30; 2/26 for 30-39;
 -- 11/24 for 40-44; 28/30 for 45-49; 41/41 for 50+.
 v_entry:=case when v_wins<30 then 0 when v_wins<40 then 2.0/26
   when v_wins<45 then 11.0/24 when v_wins<50 then 28.0/30 else 1 end;
 v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v5:entry'),1,8))
   ::bit(32)::int::bigint)%10000)::numeric/10000;
 if v_roll<v_entry then
   v_finish:='First Round';
   -- Each round samples a REAL 2022-26 team that reached that round.
   -- Stronger survivors become harder opponents. Each best-of-seven series
   -- runs actual 2-2-1-1-1 home/away games, not four independent coin flips.
   for v_round in 1..4 loop
     select count(*) into v_opp from private.nba_gm_v5_historical_teams
       where playoff_depth>=v_round;
     if v_opp=0 then raise exception 'NBA GM historical playoff pool missing';end if;
     v_opp:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v5:opponent:'||v_round),1,8))
       ::bit(32)::int::bigint)%v_opp)::integer;
     select wins,net_rating into v_opp_wins,v_opp_net
       from private.nba_gm_v5_historical_teams
       where playoff_depth>=v_round
       order by season_end,team_code offset v_opp limit 1;
     v_us:=0;v_them:=0;
     for v_game in 1..7 loop
       -- Standard NBA home series 2-2-1-1-1; higher-win seed has HCA.
       v_home:=case
         when (v_wins>=v_opp_wins and v_game in (1,2,5,7))
           or (v_wins<v_opp_wins and v_game in (3,4,6))
           then 2.5 else -2.5 end;
       -- Logistic per-game probability based on real efficiency contrast;
       -- 10.5 is a provisional typical-game spread, not an estimated 150
       -- player-skill coefficient. Preserve uncertainty honestly.
       v_game_edge:=v_net-v_opp_net+v_home;
       v_game_win:=1.0/(1.0+exp(-v_game_edge/10.5));
       v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v5:playoff:'||v_round||':'||v_game),1,8))
         ::bit(32)::int::bigint)%10000)::numeric/10000;
       if v_roll<v_game_win then v_us:=v_us+1; else v_them:=v_them+1;end if;
       exit when v_us=4 or v_them=4;
     end loop;
     exit when v_us<4;
     v_finish:=case v_round when 1 then 'Conference Semifinals'
       when 2 then 'Conference Finals' when 3 then 'Finals' else 'Champion' end;
   end loop;
 end if;
 return jsonb_build_object('season',p_year,'wins',v_wins,'losses',82-v_wins,
   'offense',round(78+v_off,1),'defense',round(78+v_def,1),
   'positionalFit',round(27+v_fit*2,1),'finish',v_finish);
end;
$v5$;
revoke all on function private.nba_gm_v5_season(jsonb,integer) from public,anon,authenticated;

-- Patch only the current audited body of the existing RPC; don't fork the
-- auction/draft backend, change old JSON snapshots, or alter Football GM.
do $nba_v5_install$
declare v_definition text; v_old text; v_new text;
begin
 select pg_get_functiondef(p.oid) into v_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='nba_gm_v2_season';
 v_old:=E'begin\n  select\n    sum(';
 v_new:=E'begin\n  if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''5'' then\n    return private.nba_gm_v5_season(p_state,p_year);\n  end if;\n  select\n    sum(';
 if v_definition is null or position(v_old in v_definition)=0
   or position('simulationModelVersion' in v_definition)>0 then
   raise exception 'Unexpected NBA GM season function body; refuse unsafe V5 install';end if;
 execute replace(v_definition,v_old,v_new);

 select pg_get_functiondef(p.oid) into v_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='nba_gm_dev_action';
 v_old:='''economyVersion'',4,''developmentModelVersion'',2,''phase''';
 v_new:='''economyVersion'',4,''developmentModelVersion'',2,''simulationModelVersion'',5,''phase''';
 if v_definition is null or position(v_old in v_definition)=0
    or position('simulationModelVersion' in v_definition)>0 then
   raise exception 'Unexpected NBA owner-only start RPC; refuse unsafe V5 activation';end if;
 execute replace(v_definition,v_old,v_new);
end;
$nba_v5_install$;
