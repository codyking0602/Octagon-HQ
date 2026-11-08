-- NBA GM Year 2 / fairness / strength regression (read-only fixtures).
-- Run against the current complete 330-player bank and 150 historical teams.
begin;
set local statement_timeout='120s';
do $check$
declare
 v_saved jsonb;v_bench jsonb;v_optimal jsonb;
 v_year1 jsonb;v_old jsonb;v_new jsonb;
 v_action text;v_grade numeric;
begin
 v_bench:=jsonb_build_array(
   jsonb_build_object('slot','PG','playerId','nba-gm-draft-anthonyblack'),
   jsonb_build_object('slot','SG','playerId','nba-gm-draft-graysonallen'),
   jsonb_build_object('slot','SF','playerId','nba-gm-draft-tristandasilva'),
   jsonb_build_object('slot','PF','playerId','nba-gm-draft-jaysontatum'),
   jsonb_build_object('slot','C','playerId','nba-gm-draft-kristapsporzingis'),
   jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-keonellis'),
   jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija')
 );
 v_saved:=jsonb_build_object(
   'seed','nba-gm-fairness-case-1','version','nba-gm-dev-v2',
   'economyVersion',4,'simulationModelVersion',13,
   'developmentModelVersion',2,'lineupModelVersion',2,'rosterQualityVersion',1,
   'picks',v_bench,'releasedIds','[]'::jsonb,'tradesUsed',0);
 v_grade:=private.nba_gm_v3_grade(v_saved,'nba-gm-draft-deniavdija',3);
 if v_grade not between 85 and 87.99
   or v_grade-private.nba_gm_v3_grade(
     v_saved,'nba-gm-draft-tristandasilva',3)<8
 then raise exception 'NBA fairness fixture drifted: Deni grade %',v_grade;end if;
 if private.nba_gm_v14_unfair_bench(v_saved,v_bench,3) is distinct from true
 then raise exception 'Near-88 starter was wrongly allowed on the bench';end if;
 v_optimal:=private.nba_gm_v14_season_lineup(v_saved,3);
 if private.nba_gm_v14_unfair_bench(v_saved,v_optimal,3)
   or exists(select 1 from jsonb_array_elements(v_optimal) pick
      where pick->>'playerId'='nba-gm-draft-deniavdija'
        and pick->>'slot' in ('GUARD','BIG'))
 then raise exception 'Year 3 optimizer still benches a substantially better starter';end if;
 if not private.nba_gm_v14_roster_ok(v_saved,v_optimal)
 then raise exception 'Fair lineup rejected by candidate eligibility';end if;

 -- This balanced but one-star team used to rate 95 OVR in Year 1.
 -- It must be moderately, not catastrophically, adjusted on NEW games.
 v_year1:=jsonb_build_array(
   jsonb_build_object('slot','PG','playerId','nba-gm-draft-anthonyblack'),
   jsonb_build_object('slot','SG','playerId','nba-gm-draft-jalensuggs'),
   jsonb_build_object('slot','SF','playerId','nba-gm-draft-jaysontatum'),
   jsonb_build_object('slot','PF','playerId','nba-gm-draft-deniavdija'),
   jsonb_build_object('slot','C','playerId','nba-gm-draft-kristapsporzingis'),
   jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-keonellis'),
   jsonb_build_object('slot','BIG','playerId','nba-gm-draft-tristandasilva')
 );
 v_saved:=jsonb_build_object(
   'seed','nba-gm-calibrated-prototype','version','nba-gm-dev-v2',
   'economyVersion',4,'simulationModelVersion',13,
   'developmentModelVersion',2,'lineupModelVersion',2,'rosterQualityVersion',1,
   'picks',v_year1,'yearOnePicks',v_year1,
   'releasedIds','[]'::jsonb,'tradesUsed',0);
 v_old:=private.nba_gm_v13_season(v_saved,1);
 v_new:=private.nba_gm_v13_season(
   jsonb_set(v_saved,'{strengthCalibrationVersion}','1'::jsonb),1);
 if (v_old->>'teamOverall')::int-(v_new->>'teamOverall')::int not between 1 and 3
   or (v_old->>'wins')::int-(v_new->>'wins')::int not between 1 and 4
 then raise exception 'New roster-balance adjustment outside moderate target: % -> %',
  v_old,v_new;end if;
 if private.nba_gm_v2_season(v_saved,1) is distinct from v_old
 then raise exception 'Saved V13 simulation version changed without calibration opt-in';end if;
 if (select count(*) from private.nba_gm_v5_historical_teams)<>150
 then raise exception 'Historical five-year comparator population changed';end if;
 select pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure)
   into v_action;
 if position($tag$'strengthCalibrationVersion',1$tag$ in v_action)=0
   or position('private.nba_gm_v14_season_lineup(v_next,2)' in v_action)=0
   or position($tag$v_next->>'phase'='offseason'$tag$ in v_action)=0
 then raise exception 'Year 2 offseason dispatch/new-start calibration not installed';end if;
 if position('v_roster*.90+v_record*.03+v_playoff*.07' in
      pg_get_functiondef('private.nba_gm_v13_final_score(jsonb)'::regprocedure))=0
 then raise exception 'Existing GM 90/3/7 scoring policy changed';end if;
end $check$;
rollback;
