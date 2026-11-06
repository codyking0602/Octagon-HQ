-- V12 six-skill pilot: historical/legacy integrity and deterministic lineup composition.
-- On the release branch, new runs opt in to V12; legacy V11 replay stays valid.
begin;
set local statement_timeout='180s';
do $v12_pilot_test$
declare
 v_a jsonb:=jsonb_build_array(
   jsonb_build_object('slot','PG','playerId','nba-gm-draft-stephencurry'),
   jsonb_build_object('slot','SG','playerId','nba-gm-draft-devinbooker'),
   jsonb_build_object('slot','SF','playerId','nba-gm-draft-paulgeorge'),
   jsonb_build_object('slot','PF','playerId','nba-gm-draft-neemiasqueta'),
   jsonb_build_object('slot','C','playerId','nba-gm-draft-mitchellrobinson'),
   jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-casonwallace'),
   jsonb_build_object('slot','BIG','playerId','nba-gm-draft-markwilliams'));
 v_b jsonb:=jsonb_build_array(
   jsonb_build_object('slot','PG','playerId','nba-gm-draft-stephencurry'),
   jsonb_build_object('slot','SG','playerId','nba-gm-draft-devinbooker'),
   jsonb_build_object('slot','SF','playerId','nba-gm-draft-paulgeorge'),
   jsonb_build_object('slot','PF','playerId','nba-gm-draft-kristapsporzingis'),
   jsonb_build_object('slot','C','playerId','nba-gm-draft-rudygobert'),
   jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-casonwallace'),
   jsonb_build_object('slot','BIG','playerId','nba-gm-draft-markwilliams'));
 v_state jsonb;v_c_a jsonb;v_c_b jsonb;v_c_bench jsonb;
 v_old jsonb;v_new jsonb;v_team jsonb;v_results jsonb;
 v_score jsonb;v_year integer;v_rev jsonb;v_lineup jsonb;
begin
 if (select count(*) from private.nba_gm_dev_players)<>330
   or (select count(*) from private.nba_gm_v5_historical_teams)<>150
   then raise exception 'NBA player/historical reference pool changed';end if;
 if private.nba_gm_v2_assign(v_a) is null
   or private.nba_gm_v2_assign(v_b) is null
   then raise exception 'V12 fixture must remain position-legal';end if;
 v_state:=jsonb_build_object(
   'economyVersion',4,'simulationModelVersion',12,'developmentModelVersion',2,
   'lineupModelVersion',2,'repriceModelVersion',2,
   'seed','v12-six-skill-isolated-pilot','picks',v_a,
   'yearOnePicks',v_a,'releasedIds','[]'::jsonb,'tradesUsed',0,
   'caps','[175000000,175000000,175000000]'::jsonb);
 v_c_a:=private.nba_gm_v12_components(v_state,1,v_a);
 v_c_b:=private.nba_gm_v12_components(v_state,1,v_b);
 if (v_c_a->>'spacing')::numeric >= (v_c_b->>'spacing')::numeric-.65
   or (v_c_a->>'severeNonShooterLoad')::numeric
     <= (v_c_b->>'severeNonShooterLoad')::numeric+.50
   then raise exception 'Two non-shooting bigs did not hurt spacing more than one: % / %',
     v_c_a,v_c_b;end if;
 -- A different reserve big cannot suddenly change five-man spacing.
 v_c_bench:=private.nba_gm_v12_components(v_state,1,jsonb_set(
   v_b,'{6,playerId}','"nba-gm-draft-jarrettallen"'::jsonb));
 if v_c_b->'spacing' is distinct from v_c_bench->'spacing'
   or v_c_b->'severeNonShooterLoad'
      is distinct from v_c_bench->'severeNonShooterLoad'
   then raise exception 'Bench-only shooter polluted starting-five spacing';end if;

 v_old:=private.nba_gm_v11_season(
   jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1);
 if v_old is distinct from private.nba_gm_v2_season(
   jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb),1)
   then raise exception 'Existing V11 route changed';end if;
 v_results:='[]'::jsonb;
 for v_year in 1..3 loop
   v_new:=private.nba_gm_v2_season(v_state,v_year);
   if v_new is distinct from private.nba_gm_v12_season(v_state,v_year)
     or (v_new->>'wins')::integer+(v_new->>'losses')::integer<>82
     or (v_new->>'teamOverall')::integer not between 70 and 99
     or (v_new->>'offense')::integer not between 60 and 99
     or (v_new->>'defense')::integer not between 60 and 99
     or (v_new->>'titleOdds')::numeric not between 0 and 49.6
     then raise exception 'V12 Year % invalid: %',v_year,v_new;end if;
   v_lineup:=v_a;
   if v_year>1 then
     v_lineup:=private.nba_gm_v12_season_lineup(v_state,v_year);
   end if;
   if v_new->'seasonPicks' is distinct from v_lineup
     or jsonb_array_length(v_new->'seasonPicks')<>7
     then raise exception 'V12 Year % did not snapshot exact server season lineup',v_year;end if;
   v_results:=v_results||jsonb_build_array(v_new);
 end loop;
 v_lineup:=private.nba_gm_v12_season_lineup(v_state,2);
 select jsonb_agg(e.value order by e.ordinality desc) into v_rev
   from jsonb_array_elements(v_a) with ordinality e(value,ordinality);
 if v_lineup is distinct from private.nba_gm_v12_season_lineup(
   jsonb_set(v_state,'{picks}',v_rev),2)
   or (select count(*) from jsonb_array_elements(v_lineup) q(value)
       where q.value->>'slot' not in ('GUARD','BIG'))<>5
   or jsonb_array_length(v_lineup)<>7
   then raise exception 'V12 future lineup invalid or draft-order-sensitive: %',v_lineup;end if;
 v_state:=jsonb_set(v_state,'{results}',v_results);
 v_score:=private.nba_gm_v3_final_score(v_state);
 if v_score is distinct from private.nba_gm_v12_final_score(v_state)
   or v_score->'weights' is distinct from '[0.90,0.03,0.07]'::jsonb
   or v_score is distinct from private.nba_gm_v11_final_score(
     jsonb_set(v_state,'{simulationModelVersion}','11'::jsonb))
   then raise exception '90/3/7 final score drifted';end if;

 -- Post-release, new starts must use V13 without changing $175M and V11 saves.
 if position($needle$'simulationModelVersion',13,'lineupModelVersion',2$needle$
     in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
   or position('jsonb_build_array(175000000,175000000,175000000)'
     in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
   then raise exception 'V13 public release default or cap drifted';end if;
 raise notice 'V12 pilot: two limited big spacing %, one limited big spacing %, V11 % OVR, V12 % OVR',
   v_c_a->>'spacing',v_c_b->>'spacing',v_old->>'teamOverall',v_results->0->>'teamOverall';
end;
$v12_pilot_test$;
rollback;
