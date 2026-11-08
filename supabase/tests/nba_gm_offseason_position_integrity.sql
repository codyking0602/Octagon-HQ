-- Versioned position integrity (read-only regression, transactionally rolled back by test runner).
do $test$
declare
 state jsonb;
 current_six jsonb;
 with_guard jsonb;
 without_guard jsonb;
 allowed jsonb;
 blocked jsonb;
begin
 current_six:=jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalenbrunson'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-milesmcbride'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-jaysontatum'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-jalenjohnson'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-bensheppard'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-ivicazubac')
 );
 state:=jsonb_build_object('seed','nba-gm-v14-position-regression',
   'version','nba-gm-dev-v2','economyVersion',4,
   'simulationModelVersion',13,'lineupModelVersion',2,'rosterQualityVersion',1,
   'phase','offseason','picks',current_six,
   'caps',jsonb_build_array(175000000,175000000,175000000),
   'releasedIds',jsonb_build_array('nba-gm-draft-kristapsporzingis'),
   'tradesUsed',3,'developmentModelVersion',2,'repriceModelVersion',2);
 blocked:=private.nba_gm_v2_assign(current_six,'nba-gm-draft-fredvanvleet');
 allowed:=private.nba_gm_v2_assign(current_six,'nba-gm-draft-clintcapela');
 if blocked is null or allowed is null then
   raise exception 'NBA V14 expected full legal positional assignments';end if;
 if private.nba_gm_v14_roster_ok(state,blocked) then
   raise exception 'NBA V14 permitted VanVleet to displace a star to backup big';end if;
 if not private.nba_gm_v14_roster_ok(state,allowed) then
   raise exception 'NBA V14 rejected an actual backup big';end if;
 if private.nba_gm_v14_unfair_bench(
   jsonb_set(state,'{picks}',blocked),
   private.nba_gm_v14_season_lineup(jsonb_set(state,'{picks}',blocked),3),3
 ) is distinct from true then
   raise exception 'NBA V14 failed to flag Year 3 star-bench conflict';end if;
 without_guard:=state-'rosterQualityVersion';
 if not private.nba_gm_v14_roster_ok(without_guard,blocked) then
   raise exception 'NBA V14 changed old franchise eligibility';end if;
 if position('nba_gm_v14_roster_ok' in
   pg_get_functiondef('private.nba_gm_v2_can_add(jsonb,text)'::regprocedure))=0
   or position('nba_gm_v14_roster_ok' in
   pg_get_functiondef('private.nba_gm_v8_trade_offers(jsonb,text)'::regprocedure))=0
   or position('rosterQualityVersion' in
   pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
 then raise exception 'NBA V14 server guard not wired into all candidate paths';end if;
end $test$;
