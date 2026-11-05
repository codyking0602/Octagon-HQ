-- V12 experimental strong-roster benchmark on the real current 330-player pool.
-- Read-only, Year 1, same seven players, slot assignment and season seed.
-- Current 2026-27 teams are NOT 2022-26 historical player lineups, and
-- their top-seven contract totals can exceed the game's $175M hard cap.
begin;
set local statement_timeout='180s';
do $v12_competitive_cores$
declare
  v_team text;v_top jsonb;v_candidate jsonb;v_assigned jsonb;
  v_best jsonb;v_best_power numeric;v_power numeric;
  v_i integer;v_j integer;v_k integer;
  v_state jsonb;v11 jsonb;v12 jsonb;v_payroll numeric;
  n_legal integer:=0;n_cap integer:=0;n_60_11 integer:=0;n_60_12 integer:=0;
  total_w11 numeric:=0;total_w12 numeric:=0;
  cap_w11 numeric:=0;cap_w12 numeric:=0;
  v_owner jsonb:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalensuggs'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-reedsheppard'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-kawhileonard'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-jabarismith'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jaylontyson'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-dayronsharpe'));
begin
  if (select count(*) from private.nba_gm_dev_players)<>330
    or (select count(*) from private.nba_gm_v5_historical_teams)<>150 then
    raise exception 'Current/historical NBA GM pools drifted';
  end if;
  for v_team in select distinct team_code from private.nba_gm_dev_players
    order by team_code loop
    select jsonb_agg(jsonb_build_object('playerId',t.id)
                     order by t.overall desc,t.id)
      into v_top
      from (select id,overall from private.nba_gm_dev_players
        where team_code=v_team order by overall desc,id limit 9) t;
    if jsonb_array_length(v_top)<9 then continue;end if;
    v_best:=null;v_best_power:=-1;
    -- Search all 36 distinct seven-of-nine subsets; reuse authoritative
    -- existing legal PG/SG/SF/PF/C/GUARD/BIG assignment to score the five.
    for v_i in 0..8 loop
      for v_j in v_i+1..8 loop
        v_candidate:='[]'::jsonb;
        for v_k in 0..8 loop
          if v_k<>v_i and v_k<>v_j then
            v_candidate:=v_candidate||jsonb_build_array(v_top->v_k);
          end if;
        end loop;
        v_assigned:=private.nba_gm_v2_assign(v_candidate);
        if v_assigned is null then continue;end if;
        select coalesce(sum(case when e.value->>'slot' in ('GUARD','BIG')
                            then p.overall else p.overall*100 end),0)
          into v_power from jsonb_array_elements(v_assigned) e(value)
          join private.nba_gm_dev_players p on p.id=e.value->>'playerId';
        if v_power>v_best_power then v_best:=v_assigned;v_best_power:=v_power;end if;
      end loop;
    end loop;
    if v_best is null then continue;end if;

    select sum((p.salaries[1])::numeric)
      into v_payroll from jsonb_array_elements(v_best) e(value)
      join private.nba_gm_dev_players p on p.id=e.value->>'playerId';
    v_state:=jsonb_build_object(
      'economyVersion',4,'simulationModelVersion',12,
      'lineupModelVersion',2,'developmentModelVersion',2,
      'seed','nba-v12-team-core-'||v_team,'picks',v_best,
      'yearOnePicks',v_best,'releasedIds','[]'::jsonb,'tradesUsed',0,
      'caps','[175000000,175000000,175000000]'::jsonb);
    v11:=private.nba_gm_v11_season(
      jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
    v12:=private.nba_gm_v12_season(v_state,1);
    if (v11->>'wins')::integer+(v11->>'losses')::integer<>82
      or (v12->>'wins')::integer+(v12->>'losses')::integer<>82
      or (v12->>'teamOverall')::integer not between 70 and 99
      or (v12->>'titleOdds')::numeric not between 0 and 49.6
      then raise exception 'V12 team % output broken: V11 % V12 %',v_team,v11,v12;end if;
    n_legal:=n_legal+1;
    total_w11:=total_w11+(v11->>'wins')::numeric;
    total_w12:=total_w12+(v12->>'wins')::numeric;
    if (v11->>'wins')::integer>=60 then n_60_11:=n_60_11+1;end if;
    if (v12->>'wins')::integer>=60 then n_60_12:=n_60_12+1;end if;
    if v_payroll<=175000000 then
      n_cap:=n_cap+1;
      cap_w11:=cap_w11+(v11->>'wins')::numeric;
      cap_w12:=cap_w12+(v12->>'wins')::numeric;
    end if;
    raise notice 'V12 CORE % Y1 payroll $%M: V11 % OVR / % wins / %%% title -> V12 % OVR / % wins / %%% title',
      v_team,round(v_payroll/1000000,1),v11->>'teamOverall',v11->>'wins',v11->>'titleOdds',
      v12->>'teamOverall',v12->>'wins',v12->>'titleOdds';
  end loop;
  if n_legal<25 or n_cap<5 then
    raise exception 'Insufficient NBA team cores for V12 comparison: legal %, under cap %',
      n_legal,n_cap;end if;
  raise notice 'V12 TEAM SUMMARY: % legal top-nine cores, V11 mean % wins, V12 mean % wins, 60+ % vs %, % under $175M cap with mean wins V11 %, V12 %',
    n_legal,round(total_w11/n_legal,2),round(total_w12/n_legal,2),
    n_60_11,n_60_12,n_cap,round(cap_w11/n_cap,2),round(cap_w12/n_cap,2);

  v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',12,
    'lineupModelVersion',2,'developmentModelVersion',2,
    'seed','nba-gm-v12-owner-top-end-benchmark','picks',v_owner,
    'yearOnePicks',v_owner,'releasedIds','[]'::jsonb,'tradesUsed',0,
    'caps','[175000000,175000000,175000000]'::jsonb);
  v11:=private.nba_gm_v11_season(
    jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
  v12:=private.nba_gm_v12_season(v_state,1);
  raise notice 'V12 OWNER CONTENDER: V11 OVR % wins % title %%, V12 OVR % wins % title %%',
    v11->>'teamOverall',v11->>'wins',v11->>'titleOdds',
    v12->>'teamOverall',v12->>'wins',v12->>'titleOdds';
end;
$v12_competitive_cores$;
rollback;
