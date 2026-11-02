-- NBA GM V6: independent offense and defense with historical percentile
-- TEAM grades. Only NEW private owner franchises opt in.
-- Existing saved V2-V5 seasons, contracts and NFL play are unchanged.
-- 150 season-relative Basketball-Reference team efficiencies: 2022-2026.
create or replace function private.nba_gm_v6_season(p_state jsonb,p_year integer)
returns jsonb language plpgsql stable security definer set search_path='' as $v6$
declare
 v_pick jsonb;v_player private.nba_gm_dev_players%rowtype;
 v_slot text;v_grade numeric;v_off_index numeric;v_def_index numeric;
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
 v_below_off integer;v_below_def integer;v_off_grade integer;v_def_grade integer;
 v_finish text:='Missed Playoffs';
begin
 if p_state->>'economyVersion' is distinct from '4'
   or p_state->>'simulationModelVersion' is distinct from '6' then
   raise exception 'NBA GM V6 is only for opted-in owner franchises';end if;
 if p_year not between 1 and 3 or jsonb_array_length(coalesce(p_state->'picks','[]'::jsonb))<>7 then
   raise exception 'NBA V6 needs exactly seven players and a valid game year';end if;
 for v_pick in select value from jsonb_array_elements(p_state->'picks') loop
   v_slot:=v_pick->>'slot';
   select * into v_player from private.nba_gm_dev_players where id=v_pick->>'playerId';
   if not found or v_slot not in ('PG','SG','SF','PF','C','GUARD','BIG') then
     raise exception 'Unknown V6 roster slot or player';end if;
   v_grade:=private.nba_gm_v3_grade(p_state,v_player.id,p_year);
   -- No overall-to-defense or overall-to-offense boost. Only the annual
   -- development DIFFERENCE changes both side-specific six-skill indices.
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
   -- Independently graded side-specific impact; no overall baseline.
   -- Piecewise guards bound any single player's simulated effect.
   v_o:=greatest(-5.0,least(8.0,.45*(v_off_index-75)));
   v_d:=greatest(-4.0,least(6.5,.23*(v_def_index-74.5)));
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
 if v_count<>7 or v_perim_count<>3 then raise exception 'Incomplete V6 starting roles';end if;
 -- Small bounded complementarity; never an artificial +3 baseline per season.
 v_fit:=case when v_spacing>=3 then .35 when v_spacing<2 then -.65 else 0 end;
 if v_creator_top>=90 and v_creator_second>=80 then v_fit:=v_fit+.25;end if;
 if v_front>=90 and v_perim_sum/v_perim_count>=80 then v_fit:=v_fit+.30;end if;
 v_fit:=greatest(-1.0,least(1.0,v_fit));
 -- Real top-five-year defensive teams beat their league mean by about
 -- 7 pts/100; seven-player teams cannot stack unlimited defensive stops.
 v_def:=greatest(-9.0,least(6.25,v_def));
 -- Charge unrepresented 0.85 court-minute share at replacement level.
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
 v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v6:entry'),1,8))
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
     v_opp:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v6:opponent:'||v_round),1,8))
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
       v_roll:=(abs(('x'||substr(md5(p_state->>'seed'||':'||p_year||':v6:playoff:'||v_round||':'||v_game),1,8))
         ::bit(32)::int::bigint)%10000)::numeric/10000;
       if v_roll<v_game_win then v_us:=v_us+1; else v_them:=v_them+1;end if;
       exit when v_us=4 or v_them=4;
     end loop;
     exit when v_us<4;
     v_finish:=case v_round when 1 then 'Conference Semifinals'
       when 2 then 'Conference Finals' when 3 then 'Finals' else 'Champion' end;
   end loop;
 end if;
 -- Side-specific grades are percentile ranks against all 150 real
 -- 2022-2026 teams after centering each year to its own league mean.
 -- A higher grade means better offense OR better defense (60..99).
 select count(*) filter(where t.offensive_rating - base.avg_off <= v_off),
        count(*) filter(where base.avg_def - t.defensive_rating <= v_def)
 into v_below_off,v_below_def
 from private.nba_gm_v5_historical_teams t
 join (select season_end,avg(offensive_rating) avg_off,
              avg(defensive_rating) avg_def
       from private.nba_gm_v5_historical_teams group by season_end) base
   using(season_end);
 if (select count(*) from private.nba_gm_v5_historical_teams)<>150 then
   raise exception 'NBA GM V6 team grades need 150 historical seasons';
 end if;
 v_off_grade:=greatest(60,least(99,round(60+39*v_below_off::numeric/150)::integer));
 v_def_grade:=greatest(60,least(99,round(60+39*v_below_def::numeric/150)::integer));
 return jsonb_build_object('season',p_year,'wins',v_wins,'losses',82-v_wins,
   'offense',v_off_grade,'defense',v_def_grade,
   'positionalFit',round(27+v_fit*2,1),'finish',v_finish);
end;
$v6$;

revoke all on function private.nba_gm_v6_season(jsonb,integer) from public,anon,authenticated;

-- Fail closed if another migration advanced the exact V5 RPC signatures.
do $nba_v6_install$
declare v_definition text;v_old text;v_new text;
begin
 select pg_get_functiondef(p.oid) into v_definition
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='private' and p.proname='nba_gm_v2_season';
 v_old:=E'begin\n  if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''5'' then';
 v_new:=E'begin\n  if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''6'' then\n    return private.nba_gm_v6_season(p_state,p_year);\n  end if;\n  if p_state->>''economyVersion''=''4'' and p_state->>''simulationModelVersion''=''5'' then';
 if v_definition is null or position(v_old in v_definition)=0
    or position('nba_gm_v6_season' in v_definition)>0 then
   raise exception 'Unexpected NBA GM season router; refuse V6 install';
 end if;
 execute replace(v_definition,v_old,v_new);
 select pg_get_functiondef(p.oid) into v_definition
 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
 where n.nspname='public' and p.proname='nba_gm_dev_action';
 v_old:='''economyVersion'',4,''developmentModelVersion'',2,''simulationModelVersion'',5,''phase''';
 v_new:='''economyVersion'',4,''developmentModelVersion'',2,''simulationModelVersion'',6,''phase''';
 if v_definition is null or position(v_old in v_definition)=0
    or position('''simulationModelVersion'',6' in v_definition)>0 then
   raise exception 'Unexpected NBA GM owner start RPC; refuse V6 install';
 end if;
 execute replace(v_definition,v_old,v_new);
end;
$nba_v6_install$;
