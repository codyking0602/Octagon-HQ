-- Competitive V11 vs V12 draft fixture audit.
-- 240 seeds x 3 explicit strategies = 720 deterministic, unique, salary-legal
-- seven-player rosters. NOT the production wheel; external anchors and salaries
-- are the production private 330-player catalog and verified signed averages.
-- Read-only; no user action calls, no franchise writes, no schema changes.
begin;
set local statement_timeout='300s';
do $v12_drafts$
declare
  v_seed integer;v_strategy integer;v_step integer;v_slot text;
  v_state jsonb;v_picks jsonb;v_chosen record;v_cap numeric;
  v11 jsonb;v12 jsonb;v_r11 numeric;v_r12 numeric;
  v_counters jsonb:='{}'::jsonb;
  v_count integer:=0;v_counter integer;v_s11 integer;v_s12 integer;
  v_sum11 numeric:=0;v_sum12 numeric:=0;v_sum_delta numeric:=0;
  v_sixty11 integer:=0;v_sixty12 integer:=0;
  v_cent11 integer:=0;v_cent12 integer:=0;
  v_delta_top numeric:=0;v_delta_bottom numeric:=0;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330
    or (select count(*) from private.nba_gm_contract_candidates_2026_27)<>330
    then raise exception 'Competitive fixture cohort source changed';end if;
  for v_seed in 1..240 loop
    for v_strategy in 1..3 loop
      v_picks:='[]'::jsonb;
      v_cap:=175000000;
      for v_step in 1..7 loop
        v_slot:=(array['PG','SG','SF','PF','C','GUARD','BIG'])[v_step];
        select p.id,coalesce(c.provisional_average_salary,p.salaries[1])::numeric as salary
          into v_chosen
        from private.nba_gm_dev_players p
        join private.nba_gm_contract_candidates_2026_27 c on c.player_id=p.id
        where (case when v_slot='GUARD' then p.positions && array['PG','SG']
                 when v_slot='BIG' then p.positions && array['PF','C']
                 else v_slot=any(p.positions) end)
          and coalesce(c.provisional_average_salary,p.salaries[1])::numeric
                <=v_cap-(7-v_step)*1800000
          and not exists(select 1 from jsonb_array_elements(v_picks) e(value)
                     where e.value->>'playerId'=p.id)
        order by
         -- Skill/talent-first (1), budget-aware (2), or skill-complementary
         -- preference (3). Hashed candidate perturbation simulates different
         -- wheel draw sequences WITHOUT nondeterministic random() seeds.
         (p.overall
          -coalesce(c.provisional_average_salary,p.salaries[1])::numeric
             /(case v_strategy when 1 then 8500000 when 2 then 4700000
                else 6500000 end)
          +(case v_strategy when 1 then 8 when 2 then 10 else 9 end)
            *((('x'||substr(md5(p.id||':'||v_seed||':'||v_step),1,8))
                ::bit(32)::bigint)::numeric/4294967295)
          +(case when v_strategy=3 and v_slot in ('SG','SF','PF')
              then .10*((p.skills->>'shooting')::numeric-75)
              when v_strategy=3 and v_slot in ('PG','C')
              then .08*((p.skills->>'playmaking')::numeric-75)
              else 0 end)) desc,p.id
        limit 1;
        if v_chosen.id is null then
          raise exception 'No legal V12 draft player at seed %, strategy %, slot %',
            v_seed,v_strategy,v_slot;
        end if;
        v_picks:=v_picks||jsonb_build_array(
          jsonb_build_object('slot',v_slot,'playerId',v_chosen.id));
        v_cap:=v_cap-v_chosen.salary;
      end loop;
      if jsonb_array_length(v_picks)<>7 or v_cap<0
        or (select count(distinct e.value->>'playerId')
             from jsonb_array_elements(v_picks) e(value))<>7 then
        raise exception 'Malformed salary-legal draft fixture % / %',v_seed,v_strategy;end if;

      v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',12,
        'developmentModelVersion',2,'lineupModelVersion',2,
        'seed','v12-competitive-'||v_seed||'-'||v_strategy,
        'phase','year1','picks',v_picks,'yearOnePicks',v_picks,
        'releasedIds','[]'::jsonb,'tradesUsed',0,
        'caps','[175000000,175000000,175000000]'::jsonb);
      v11:=private.nba_gm_v11_season(
        jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
      v12:=private.nba_gm_v12_season(v_state,1);
      v_count:=v_count+1;
      v_s11:=(v11->>'wins')::integer;v_s12:=(v12->>'wins')::integer;
      v_sum11:=v_sum11+v_s11;v_sum12:=v_sum12+v_s12;
      v_sum_delta:=v_sum_delta+v_s12-v_s11;
      if v_s11>=60 then v_sixty11:=v_sixty11+1;end if;
      if v_s12>=60 then v_sixty12:=v_sixty12+1;end if;
      if (v11->>'teamOverall')::integer>=90 then v_cent11:=v_cent11+1;end if;
      if (v12->>'teamOverall')::integer>=90 then v_cent12:=v_cent12+1;end if;
      if v_seed<=4 and v_strategy in (1,3) then
        raise notice 'V12 DRAFT seed % strat % available cap %M: V11 % OVR/% wins; V12 % OVR/% wins; picks %',
          v_seed,v_strategy,round(v_cap/1000000,1),
          v11->>'teamOverall',v_s11,v12->>'teamOverall',v_s12,v_picks;
      end if;
    end loop;
  end loop;
  raise notice 'V12 COMPETITIVE SUMMARY % $175M legal seven-player fixtures: V11 avg wins % vs V12 % (change %); 60+ V11 % vs V12 %; 90+OVR V11 % vs V12 %',
    v_count,round(v_sum11/v_count,2),round(v_sum12/v_count,2),
    round(v_sum_delta/v_count,2),v_sixty11,v_sixty12,
    v_cent11,v_cent12;
end;
$v12_drafts$;
rollback;
