-- Deterministic NBA GM wheel-like V11 vs V12 comparison.
-- A fresh team is randomly (hash) selected at each of seven pick rounds,
-- *from teams with an eligible affordable player for that slot*; select best
-- eligible candidate from that team under one of three explicit strategies.
-- Distinct, position-legal and signed-average-salary capped $175M.
-- This is a wheel-access proxy, not a replay of actual 240 live wheel runs.
begin;
set local statement_timeout='300s';
do $v12_wheel$
declare
  k integer;strategy integer;idx integer;slot text;team text;
  pid text;price numeric;cap_rem numeric;picks jsonb;
  state jsonb;old_result jsonb;new_result jsonb;
  total integer:=0;
  n1 integer:=0;n2 integer:=0;n3 integer:=0;
  w1 numeric:=0;w2 numeric:=0;w3 numeric:=0;
  ww1 numeric:=0;ww2 numeric:=0;ww3 numeric:=0;
  high11 integer:=0;high12 integer:=0;ovr11 integer:=0;ovr12 integer:=0;
  paid numeric:=0;cnt integer:=0;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330 or
    (select count(*) from private.nba_gm_contract_candidates_2026_27)<>330 then
      raise exception 'Missing NBA 330-player and salary evidence';
  end if;
  for k in 1..240 loop
    for strategy in 1..3 loop
      picks:='[]'::jsonb;cap_rem:=175000000;
      for idx in 1..7 loop
        slot:=(array['PG','SG','SF','PF','C','GUARD','BIG'])[idx];
        select q.team_code into team from (
          select distinct p.team_code from private.nba_gm_dev_players p
          join private.nba_gm_contract_candidates_2026_27 c on c.player_id=p.id
          where
            (case when slot='GUARD' then p.positions && array['PG','SG']
             when slot='BIG' then p.positions && array['PF','C']
             else slot=any(p.positions) end)
            and c.provisional_average_salary <=cap_rem-(7-idx)*1800000
            and not exists(select 1 from jsonb_array_elements(picks) e(value)
              where e.value->>'playerId'=p.id)
        ) q
        order by md5('wheel-v12:'||k::text||':'||strategy::text||':'||idx::text||':'||q.team_code) limit 1;
        if team is null then raise exception 'Wheel candidate dead at % % %',k,strategy,idx;end if;
        select p.id,c.provisional_average_salary
          into pid,price
        from private.nba_gm_dev_players p
        join private.nba_gm_contract_candidates_2026_27 c on c.player_id=p.id
        where p.team_code=team
          and (case when slot='GUARD' then p.positions && array['PG','SG']
             when slot='BIG' then p.positions && array['PF','C']
             else slot=any(p.positions) end)
          and c.provisional_average_salary <=cap_rem-(7-idx)*1800000
          and not exists(select 1 from jsonb_array_elements(picks) e(value)
              where e.value->>'playerId'=p.id)
        order by
          (p.overall
            -case strategy when 1 then 0 when 2 then c.provisional_average_salary/5000000
               else c.provisional_average_salary/7500000 end
            +case when strategy=3
              then .05*((p.skills->>'shooting')::numeric-75)
                   +.03*((p.skills->>'perimeterDefense')::numeric-75)
              else 0 end
            +(abs(hashtext('player-v12:'||p.id||':'||k::text||':'||idx::text))%1000)::numeric/1000)
            desc,p.id
        limit 1;
        if pid is null then raise exception 'Player selection dead at % % %',k,strategy,idx;end if;
        picks:=picks||jsonb_build_array(jsonb_build_object('slot',slot,'playerId',pid));
        cap_rem:=cap_rem-price;
      end loop;
      if cap_rem<0
       or jsonb_array_length(picks)<>7
       or (select count(distinct e.value->>'playerId') from jsonb_array_elements(picks) e(value))<>7
       then raise exception 'Wheel fixture cap/legal invalid at % %',k,strategy;end if;

      state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',12,
        'developmentModelVersion',2,'lineupModelVersion',2,
        'seed','v12-wheelish-'||k::text||':'||strategy::text,
        'picks',picks,'yearOnePicks',picks,'releasedIds','[]'::jsonb,
        'tradesUsed',0,'caps','[175000000,175000000,175000000]'::jsonb);
      old_result:=private.nba_gm_v11_season(jsonb_set(state,'{simulationModelVersion}','11'::jsonb),1);
      new_result:=private.nba_gm_v12_season(state,1);
      total:=total+1;
      paid:=paid+(175000000-cap_rem);
      if strategy=1 then
        n1:=n1+1;w1:=w1+(old_result->>'wins')::numeric;ww1:=ww1+(new_result->>'wins')::numeric;
      elsif strategy=2 then
        n2:=n2+1;w2:=w2+(old_result->>'wins')::numeric;ww2:=ww2+(new_result->>'wins')::numeric;
      else
        n3:=n3+1;w3:=w3+(old_result->>'wins')::numeric;ww3:=ww3+(new_result->>'wins')::numeric;
      end if;
      if (old_result->>'wins')::integer>=60 then high11:=high11+1;end if;
      if (new_result->>'wins')::integer>=60 then high12:=high12+1;end if;
      if (old_result->>'teamOverall')::integer>=90 then ovr11:=ovr11+1;end if;
      if (new_result->>'teamOverall')::integer>=90 then ovr12:=ovr12+1;end if;
      if k<=2 and strategy=1 then
        raise notice 'V12 WHEEL SAMPLE % avg payroll $%M: V11 % OVR/% wins vs V12 % OVR/% wins',
          k,round((175000000-cap_rem)/1000000,1),
          old_result->>'teamOverall',old_result->>'wins',
          new_result->>'teamOverall',new_result->>'wins';
      end if;
    end loop;
  end loop;
  raise notice 'V12 WHEEL-LIKE (NOT ACTUAL WHEEL) % $175M legal matched: avg cap spend $%M; strategy 1 V11 % V12 % wins; strategy 2 V11 % V12 % wins; strategy 3 V11 % V12 % wins; 60+ V11 % V12 %; 90+ OVR V11 % V12 %',
   total,round(paid/total/1000000,1),round(w1/n1,2),round(ww1/n1,2),
   round(w2/n2,2),round(ww2/n2,2),
   round(w3/n3,2),round(ww3/n3,2),high11,high12,ovr11,ovr12;
end;
$v12_wheel$;
rollback;
