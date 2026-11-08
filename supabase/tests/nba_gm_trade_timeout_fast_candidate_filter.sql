-- Reproduce the Lakers / Paolo offseason discovery timeout without mutating
-- the saved game. Exercises both exact fair-lineup semantics and full trade
-- package search on a fresh local database.
begin;
set local statement_timeout='15000ms';
do $nba_trade_fast$
declare
 st jsonb;
 picks jsonb;
 outgoing jsonb;
 candidate text;
 fast boolean;
 exact boolean;
 y integer;
 start_clock timestamptz;
begin
 picks:=jsonb_build_array(
   jsonb_build_object('slot','PG','playerId','nba-gm-draft-krisdunn'),
   jsonb_build_object('slot','SG','playerId','nba-gm-draft-keonellis'),
   jsonb_build_object('slot','SF','playerId','nba-gm-draft-kevindurant'),
   jsonb_build_object('slot','PF','playerId','nba-gm-draft-paolobanchero'),
   jsonb_build_object('slot','C','playerId','nba-gm-draft-alperensengun'),
   jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-dariusacuff'),
   jsonb_build_object('slot','BIG','playerId','nba-gm-draft-herbjones')
 );
 st:=jsonb_build_object(
   'version','nba-gm-dev-v2','seed','nba-gm-fast-trade-regression',
   'phase','offseason','economyVersion',4,
   'simulationModelVersion',13,'lineupModelVersion',2,'rosterQualityVersion',1,
   'picks',picks,'yearOnePicks',picks,'tradeTeam','LAL',
   'shopPlayerId','nba-gm-draft-paolobanchero','tradesUsed',0,
   'caps','[175000000,175000000,175000000]'::jsonb,
   'releasedIds','[]'::jsonb,'displacedAssets','[]'::jsonb,
   'developmentModelVersion',2,'repriceModelVersion',2
 );
 for y in 2..3 loop
   fast:=private.nba_gm_v15_fair_lineup_exists(st,picks,y);
   exact:=not private.nba_gm_v14_unfair_bench(st,
     private.nba_gm_v14_season_lineup(st,y),y);
   if fast is distinct from exact then
     raise exception 'NBA V15 mismatched exact V14 year %: fast %, expected %',
       y,fast,exact;end if;
 end loop;
 -- This test must complete within the statement timeout. The previous
 -- implementation repeatedly called the exhaustive V13 optimizer
 -- for every possible trade-package combination.
 select id into candidate
 from private.nba_gm_dev_players
 where team_code='LAL' order by overall desc,id limit 1;
 if candidate is null then raise exception 'Lakers trade candidate missing';end if;
 start_clock:=clock_timestamp();
 outgoing:=private.nba_gm_v8_trade_offers(st,candidate);
 raise notice 'NBA V15 Lakers/Paolo offer scan: % offers; elapsed %ms',
   jsonb_array_length(outgoing),
   round(extract(epoch from clock_timestamp()-start_clock)*1000);
 if outgoing is null then raise exception 'NBA V15 target offer response was null';end if;
 if position('nba_gm_v8_trade_offers' in
    pg_get_functiondef('public.nba_gm_dev_legal_trade_targets()'::regprocedure))>0
   then raise exception 'NBA trade target list still invokes expensive offer search';end if;
end $nba_trade_fast$;
rollback;
