-- Private, rollback-only P3 SQL. Five rosters x 200 seeds x 3 years: 3,000 actual server seasons.
begin;
set local statement_timeout='180s';
select set_config('request.jwt.claim.role','service_role',true);
do $nba_balance$
declare v_strategy integer;v_seed integer;v_year integer;
 v_picks jsonb;v_state jsonb;v_old jsonb;v_result jsonb;v_repeat jsonb;
 v_wins integer;v_before integer;v_star_total integer:=0;v_bargain_total integer:=0;v_games integer:=0;
begin
 for v_strategy in 1..5 loop
  v_picks:=case v_strategy
 when 1 then jsonb_build_array(
jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
jsonb_build_object('slot','SG','playerId','nba-gm-draft-anthonyedwards'),
jsonb_build_object('slot','SF','playerId','nba-gm-draft-ggjackson'),
jsonb_build_object('slot','PF','playerId','nba-gm-draft-michaelporter'),
jsonb_build_object('slot','C','playerId','nba-gm-draft-wendellcarter'),
jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ryanrollins'),
jsonb_build_object('slot','BIG','playerId','nba-gm-draft-adembona')
)
when 2 then jsonb_build_array(
jsonb_build_object('slot','PG','playerId','nba-gm-draft-shaigilgeousalexander'),
jsonb_build_object('slot','SG','playerId','nba-gm-draft-anthonyedwards'),
jsonb_build_object('slot','SF','playerId','nba-gm-draft-ggjackson'),
jsonb_build_object('slot','PF','playerId','nba-gm-draft-michaelporter'),
jsonb_build_object('slot','C','playerId','nba-gm-draft-wendellcarter'),
jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ryanrollins'),
jsonb_build_object('slot','BIG','playerId','nba-gm-draft-adembona')
)
when 3 then jsonb_build_array(
jsonb_build_object('slot','PG','playerId','nba-gm-draft-jrueholiday'),
jsonb_build_object('slot','SG','playerId','nba-gm-draft-derrickwhite'),
jsonb_build_object('slot','SF','playerId','nba-gm-draft-herbjones'),
jsonb_build_object('slot','PF','playerId','nba-gm-draft-jarenjackson'),
jsonb_build_object('slot','C','playerId','nba-gm-draft-mylesturner'),
jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jalensuggs'),
jsonb_build_object('slot','BIG','playerId','nba-gm-draft-isaiahhartenstein')
)
when 4 then jsonb_build_array(
jsonb_build_object('slot','PG','playerId','nba-gm-draft-dariusgarland'),
jsonb_build_object('slot','SG','playerId','nba-gm-draft-desmondbane'),
jsonb_build_object('slot','SF','playerId','nba-gm-draft-oganunoby'),
jsonb_build_object('slot','PF','playerId','nba-gm-draft-michaelporter'),
jsonb_build_object('slot','C','playerId','nba-gm-draft-wendellcarter'),
jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ryanrollins'),
jsonb_build_object('slot','BIG','playerId','nba-gm-draft-adembona')
)
when 5 then jsonb_build_array(
jsonb_build_object('slot','PG','playerId','nba-gm-draft-trejones'),
jsonb_build_object('slot','SG','playerId','nba-gm-draft-isaiahjoe'),
jsonb_build_object('slot','SF','playerId','nba-gm-draft-ggjackson'),
jsonb_build_object('slot','PF','playerId','nba-gm-draft-leonardmiller'),
jsonb_build_object('slot','C','playerId','nba-gm-draft-adembona'),
jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ryanrollins'),
jsonb_build_object('slot','BIG','playerId','nba-gm-draft-jocklandale')
)
  end;
  if jsonb_array_length(v_picks)<>7 or
    (select count(distinct pick->>'playerId') from jsonb_array_elements(v_picks) pick)<>7
    then raise exception 'Illegal priority 3 roster %',v_strategy;end if;
  for v_seed in 1..200 loop
   v_state:=jsonb_build_object(
    'economyVersion',3,'developmentModelVersion',2,'phase','offseason',
    'seed','nba-gm-p3-sim-'||v_strategy||'-'||v_seed,
    'picks',v_picks,'yearOnePicks',v_picks,
    'releasedIds',jsonb_build_array(),'tradesUsed',0,
    'caps',jsonb_build_array(155000000,155000000,155000000));
   for v_year in 1..3 loop
    v_result:=private.nba_gm_v2_season(v_state,v_year);
    v_wins:=(v_result->>'wins')::integer;
    if v_wins<8 or v_wins>74 or v_wins+(v_result->>'losses')::integer<>82
      then raise exception 'Broken 82-game season: strategy %, seed %, year %',v_strategy,v_seed,v_year;end if;
    if v_result->>'finish' not in ('Missed Playoffs','First Round','Conference Semifinals','Conference Finals','Finals','Champion')
      then raise exception 'Invalid postseason result %',v_result;end if;
    if v_seed in (1,200) then
      v_repeat:=private.nba_gm_v2_season(v_state,v_year);
      if v_repeat is distinct from v_result then raise exception 'Non-deterministic season';end if;
    end if;
    if v_year=1 then
      v_old:=private.nba_gm_v2_season(v_state-'developmentModelVersion',1);
      v_before:=(v_old->>'wins')::integer;
      if v_wins<v_before or v_wins>v_before+18
        then raise exception 'Calibration outside bounds: % vs %',v_wins,v_before;end if;
    end if;
    if v_strategy in (1,2) then v_star_total:=v_star_total+v_wins;
    elsif v_strategy=5 then v_bargain_total:=v_bargain_total+v_wins;end if;
    v_games:=v_games+1;
   end loop;
  end loop;
 end loop;
 if v_games<>3000 then raise exception 'Incomplete simulation %',v_games;end if;
 if v_star_total/2.0<=v_bargain_total+300
   then raise exception 'Star roster has insufficient edge';end if;
 raise notice 'P3 % server seasons, star total %, bargain total %',v_games,v_star_total,v_bargain_total;
end;
$nba_balance$;
rollback;
