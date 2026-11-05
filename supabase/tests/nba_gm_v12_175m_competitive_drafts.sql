-- V12 matched competitive draftability pilot, same player/slot/seed in V11 & V12.
-- Game-authoritative average contract salary; $175M hard cap throughout.
-- This samples deterministic skill/OVR/salary strategies. It is NOT a
-- 240-wheel replay or a three-season persistence test.
begin;
set local statement_timeout='180s';
do $draft_benchmark$
declare
  v_k integer;v_idx integer;v_style integer;v_slot text;
  v_slots text[]:=array['PG','SG','SF','PF','C','GUARD','BIG'];
  v_id text;v_salary numeric;v_spent numeric;v_allow numeric;v_multiple numeric;
  v_selected text[];v_picks jsonb;v_state jsonb;v11 jsonb;v12 jsonb;
  n integer:=0;sum11 numeric:=0;sum12 numeric:=0;high11 integer:=0;high12 integer:=0;
  worst text:='';best text:='';delta numeric;worst_delta numeric:=999;best_delta numeric:=-999;
  v_avg11 numeric;v_avg12 numeric;
begin
 if (select count(*) from private.nba_gm_dev_players)<>330
    or (select count(*) from private.nba_gm_contract_candidates_2026_27)<>330
    then raise exception 'NBA GM 330-player or contract baseline drifted';end if;

 for v_k in 1..240 loop
   v_style:=(v_k-1)%3;
   v_picks:='[]'::jsonb;v_spent:=0;v_selected:=array[]::text[];
   for v_idx in 1..7 loop
     v_slot:=v_slots[v_idx];
     v_multiple:=case v_style when 0 then case when v_idx<=2 then 2.20 else 1.48 end
       when 1 then 1.55 else 1.90 end;
     v_allow:=least(175000000-v_spent-(7-v_idx)*2500000,
       (175000000-v_spent)/(8-v_idx)*v_multiple);
     select p.id,c.provisional_average_salary
       into v_id,v_salary
       from private.nba_gm_dev_players p
       join private.nba_gm_contract_candidates_2026_27 c on c.player_id=p.id
       where p.id<>all(v_selected)
         and (v_slot=any(p.positions)
           or (v_slot='GUARD' and p.positions && array['PG','SG'])
           or (v_slot='BIG' and p.positions && array['PF','C']))
         and c.provisional_average_salary<=v_allow
       order by
         (p.overall
         +case v_style when 0 then 0 when 1 then -.07
                      else -.20 end*c.provisional_average_salary/1000000
         +((abs(hashtext(p.id||':'||v_k::text||':'||v_idx::text))%1000)::numeric/1000)
           *(case v_style when 0 then 6 when 1 then 4 else 7 end)) desc,
         p.id
       limit 1;
     if v_id is null then exit;end if;
     v_selected:=array_append(v_selected,v_id);
     v_picks:=v_picks||jsonb_build_array(jsonb_build_object(
       'slot',v_slot,'playerId',v_id));
     v_spent:=v_spent+v_salary;
   end loop;
   if jsonb_array_length(v_picks)<>7 then continue;end if;
   if v_spent>175000000 or (select count(distinct s) from unnest(v_selected) s)<>7
      then raise exception 'Draft legality or cap failed at %',v_k;end if;
   v_state:=jsonb_build_object(
     'economyVersion',4,'simulationModelVersion',12,
     'developmentModelVersion',2,'lineupModelVersion',2,
     'seed','v12-competitive-'||v_k,'picks',v_picks,'yearOnePicks',v_picks,
     'releasedIds','[]'::jsonb,'tradesUsed',0,
     'caps','[175000000,175000000,175000000]'::jsonb);
   v11:=private.nba_gm_v11_season(
       jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
   v12:=private.nba_gm_v12_season(v_state,1);
   if (v11->>'wins')::integer+(v11->>'losses')::integer<>82
     or (v12->>'wins')::integer+(v12->>'losses')::integer<>82
     then raise exception 'Draft game season invalid for %',v_k;end if;
   n:=n+1;
   sum11:=sum11+(v11->>'wins')::integer;
   sum12:=sum12+(v12->>'wins')::integer;
   if (v11->>'wins')::integer>=60 then high11:=high11+1;end if;
   if (v12->>'wins')::integer>=60 then high12:=high12+1;end if;
   delta:=(v12->>'wins')::numeric-(v11->>'wins')::numeric;
   if delta<worst_delta then worst_delta:=delta;
     worst:='fixture '||v_k||' cost $'||round(v_spent/1000000,1)
       ||'M / V11 '||v11->>'wins'||' V12 '||v12->>'wins';end if;
   if delta>best_delta then best_delta:=delta;
     best:='fixture '||v_k||' cost $'||round(v_spent/1000000,1)
       ||'M / V11 '||v11->>'wins'||' V12 '||v12->>'wins';end if;
 end loop;
 if n<150 then raise exception 'Too few salary-legal V12 draft fixtures: %',n;end if;
 v_avg11:=round(sum11/n,2);
 v_avg12:=round(sum12/n,2);
 raise notice 'V12 $175M COMPETITIVE DRAFTS: % matched fixtures, V11 avg % wins, V12 avg % wins, 60+ counts % vs %, max downside %, max upside %',
   n,v_avg11,v_avg12,high11,high12,worst,best;
end;
$draft_benchmark$;
rollback;
