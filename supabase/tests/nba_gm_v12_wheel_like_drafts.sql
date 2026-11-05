-- V12 120 matched wheel-LIKE NBA GM drafts. Reproduce random-team-first
-- selection with deterministic team order and pick strongest legal member.
-- This does not use authenticated public RPC, but does preserve per-round
-- team restriction, exact seven-slot assignment, $175M cap and roster locks.
begin;
set local statement_timeout='180s';
do $v12_wheel_cohort$
declare
  k integer;round_no integer;style integer;v_team text;
  v_id text;v_salary numeric;v_spent numeric;
  v_picks jsonb;v_state jsonb;v11 jsonb;v12 jsonb;
  v_score numeric;v_seed text;v_win_delta integer;
  count_good integer:=0;count_failed integer:=0;
  wins11 numeric:=0;wins12 numeric:=0;
  ovr11 numeric:=0;ovr12 numeric:=0;
  n50_11 integer:=0;n50_12 integer:=0;n60_11 integer:=0;n60_12 integer:=0;
  min_delta integer:=999;max_delta integer:=-999;
  min_seed integer;max_seed integer;min_picks jsonb;max_picks jsonb;
  min_fit jsonb;max_fit jsonb;v_player_score numeric;
begin
 if (select count(*) from private.nba_gm_dev_players)<>330
   then raise exception 'V12 wheel cohort catalog drift';end if;
 for k in 1..120 loop
   style:=(k-1)%3;v_spent:=0;
   v_seed:='v12-wheel-skill-cohort-'||k;
   v_picks:='[]'::jsonb;
   v_state:=jsonb_build_object(
     'economyVersion',4,'simulationModelVersion',12,'lineupModelVersion',2,
     'developmentModelVersion',2,'phase','draft','seed',v_seed,
     'picks',v_picks,'yearOnePicks',v_picks,'releasedIds','[]'::jsonb,
     'tradesUsed',0,'caps','[175000000,175000000,175000000]'::jsonb);
   for round_no in 1..7 loop
     v_id:=null;v_salary:=null;
     -- One uniformly pseudo-random team at a time; skip only teams with no
     -- position-legal, budget-feasible player, as production spin does.
     for v_team in
       select t.team_code from
         (select distinct team_code from private.nba_gm_dev_players) t
       order by md5(t.team_code||':'||k::text||':'||round_no::text)
     loop
       select p.id,c.provisional_average_salary
       into v_id,v_salary
       from private.nba_gm_dev_players p
       join private.nba_gm_contract_candidates_2026_27 c on c.player_id=p.id
       where p.team_code=v_team
         and p.id not in (
           select q.value->>'playerId' from jsonb_array_elements(v_picks) q(value))
         and c.provisional_average_salary
           <=175000000-v_spent-(7-round_no)*2200000
         and private.nba_gm_v2_assign(v_picks,p.id) is not null
       order by
         (p.overall
          + case style when 0 then 0
             when 1 then -.12*c.provisional_average_salary/1000000
             else .03*(p.skills->>'shooting')::numeric
                +.02*(p.skills->>'perimeterDefense')::numeric end) desc,
         p.id
       limit 1;
       exit when v_id is not null;
     end loop;
     if v_id is null then exit;end if;
     v_picks:=private.nba_gm_v2_assign(v_picks,v_id);
     v_spent:=v_spent+v_salary;
   end loop;
   if jsonb_array_length(v_picks)<>7 or v_spent>175000000 then
     count_failed:=count_failed+1;continue;end if;
   v_state:=jsonb_set(jsonb_set(v_state,'{picks}',v_picks),
     '{yearOnePicks}',v_picks);
   -- Validate against runtime salary, not just snapshot contract average.
   select coalesce(sum(private.nba_gm_v3_salary(v_state,p.value->>'playerId',1)),0)
     into v_score from jsonb_array_elements(v_picks) p(value);
   if v_score>175000000 then count_failed:=count_failed+1;continue;end if;
   v11:=private.nba_gm_v11_season(
     jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
   v12:=private.nba_gm_v12_season(v_state,1);
   count_good:=count_good+1;
   wins11:=wins11+(v11->>'wins')::integer;
   wins12:=wins12+(v12->>'wins')::integer;
   ovr11:=ovr11+(v11->>'teamOverall')::integer;
   ovr12:=ovr12+(v12->>'teamOverall')::integer;
   if (v11->>'wins')::integer>=50 then n50_11:=n50_11+1;end if;
   if (v12->>'wins')::integer>=50 then n50_12:=n50_12+1;end if;
   if (v11->>'wins')::integer>=60 then n60_11:=n60_11+1;end if;
   if (v12->>'wins')::integer>=60 then n60_12:=n60_12+1;end if;
   v_win_delta:=(v12->>'wins')::integer-(v11->>'wins')::integer;
   if v_win_delta<min_delta then
     min_delta:=v_win_delta;min_seed:=k;min_picks:=v_picks;
     min_fit:=private.nba_gm_v12_components(v_state,1,v_picks);
   end if;
   if v_win_delta>max_delta then
     max_delta:=v_win_delta;max_seed:=k;max_picks:=v_picks;
     max_fit:=private.nba_gm_v12_components(v_state,1,v_picks);
   end if;
 end loop;
 if count_good<90 then
   raise exception 'Too few viable V12 wheel-like drafts: successful %, failed %',
     count_good,count_failed;end if;
 raise notice 'V12 WHEEL-LIKE: % legal $175M seven-player draft pairs; % failed; V11 avg wins % / OVR %, V12 avg wins % / OVR %; 50-win % vs %, 60-win % vs %; min/max win delta %/%',
   count_good,count_failed,
   round(wins11/count_good,2),round(ovr11/count_good,2),
   round(wins12/count_good,2),round(ovr12/count_good,2),
   n50_11,n50_12,n60_11,n60_12,min_delta,max_delta;
 raise notice 'V12 WORST COMPOSITION seed % delta % / skill components % / starter lineup %',
   min_seed,min_delta,min_fit,
   (select jsonb_agg(jsonb_build_object('slot',e.value->>'slot',
     'name',p.name,'shooting',p.skills->>'shooting','scoring',p.skills->>'scoring',
     'playmaking',p.skills->>'playmaking','interiorD',p.skills->>'interiorDefense'))
     from jsonb_array_elements(min_picks) e(value)
     join private.nba_gm_dev_players p on p.id=e.value->>'playerId');
 raise notice 'V12 BEST COMPOSITION seed % delta % / skill components % / starter lineup %',
   max_seed,max_delta,max_fit,
   (select jsonb_agg(jsonb_build_object('slot',e.value->>'slot',
     'name',p.name,'shooting',p.skills->>'shooting','scoring',p.skills->>'scoring',
     'playmaking',p.skills->>'playmaking','interiorD',p.skills->>'interiorDefense'))
     from jsonb_array_elements(max_picks) e(value)
     join private.nba_gm_dev_players p on p.id=e.value->>'playerId');
end;
$v12_wheel_cohort$;
rollback;
