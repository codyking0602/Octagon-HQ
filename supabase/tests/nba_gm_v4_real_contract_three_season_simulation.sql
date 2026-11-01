-- Private NBA GM V4 real salary-window regression: 1,200 seeded three-season
-- backend playthrough simulations (5 valid rosters x 80 seeds x 3 cap proposals).
-- Not a complete production draft/FA/trade auction emulator. All writes rollback.
begin;
set local statement_timeout='180s';
select set_config('request.jwt.claim.role','service_role',true);
do $nba_real_salary_balance$
declare
 v_strategy integer;v_seed integer;v_cap bigint;v_year integer;
 v_picks jsonb;v_state jsonb;v_result jsonb;v_results jsonb;
 v_spend bigint;v_bust boolean;v_complete integer:=0;v_caps_busted integer:=0;
 v_seasons integer:=0;v_final jsonb;v_elites integer;v_two_elite_complete integer:=0;
begin
 if not private.nba_gm_v4_salary_certified() then raise exception 'V4 sources not verified';end if;
 for v_cap in select x::bigint from unnest(array[155000000,165000000,175000000]) x loop
 for v_strategy in 1..5 loop
 v_picks:=case v_strategy
when 1 then jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalenbrunson'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-stephoncastle'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-deniavdija'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-nikolajokic'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ajaymitchell'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-lebronjames')
)
when 2 then jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalenbrunson'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-deniavdija'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-moussadiabate'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-stephoncastle'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-lebronjames')
)
when 3 then jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalenbrunson'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-konknueppel'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-deniavdija'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-krisdunn'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-jalenjohnson')
)
when 4 then jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-stephoncastle'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-anferneesimons'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-kentaviouscaldwellpope'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-lebronjames'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-kelelware'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-ajaymitchell'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-deniavdija')
)
when 5 then jsonb_build_array(
  jsonb_build_object('slot','PG','playerId','nba-gm-draft-derrickwhite'),
  jsonb_build_object('slot','SG','playerId','nba-gm-draft-stephoncastle'),
  jsonb_build_object('slot','SF','playerId','nba-gm-draft-cooperflagg'),
  jsonb_build_object('slot','PF','playerId','nba-gm-draft-peytonwatson'),
  jsonb_build_object('slot','C','playerId','nba-gm-draft-victorwembanyama'),
  jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-amenthompson'),
  jsonb_build_object('slot','BIG','playerId','nba-gm-draft-moussadiabate')
)
end;
 if jsonb_array_length(v_picks)<>7 or private.nba_gm_v2_assign(v_picks) is null then
   raise exception 'Invalid NBA real-contract simulation roster strategy %',v_strategy;end if;
 for v_seed in 1..80 loop
  v_state:=jsonb_build_object('economyVersion',4,'developmentModelVersion',2,
    'phase','offseason','seed','nba-gm-real-signed-'||v_cap||'-'||v_strategy||'-'||v_seed,
    'picks',v_picks,'yearOnePicks',v_picks,'releasedIds','[]'::jsonb,
    'tradesUsed',0,'caps',jsonb_build_array(v_cap,v_cap,v_cap));
  v_results:='[]'::jsonb;v_bust:=false;
  for v_year in 1..3 loop
    select coalesce(sum(private.nba_gm_v3_salary(v_state,pick->>'playerId',v_year)),0)
      into v_spend from jsonb_array_elements(v_picks) pick;
    if v_spend>v_cap then v_bust:=true;end if;
    v_result:=private.nba_gm_v2_season(v_state,v_year);
    if (v_result->>'wins')::integer not between 8 and 74
      or (v_result->>'wins')::integer+(v_result->>'losses')::integer<>82 then
      raise exception 'Invalid season outcome cap %, roster %, seed %, season %',v_cap,v_strategy,v_seed,v_year;end if;
    if v_seed in (1,80) and private.nba_gm_v2_season(v_state,v_year) is distinct from v_result then
      raise exception 'NBA V4 deterministic seed violation';end if;
    v_results:=v_results||jsonb_build_array(v_result);
    v_seasons:=v_seasons+1;
  end loop;
  if v_bust then
    v_caps_busted:=v_caps_busted+1;
  else
    v_final:=private.nba_gm_v3_final_score(jsonb_set(v_state,'{results}',v_results));
    if (v_final->>'score')::numeric not between 0 and 100 then
      raise exception 'Invalid V4 final score %',v_final;end if;
    v_complete:=v_complete+1;
    if v_strategy=1 then v_two_elite_complete:=v_two_elite_complete+1;end if;
  end if;
 end loop;
 end loop;
 end loop;
 if v_complete+v_caps_busted<>1200 or v_seasons<>3600 then
   raise exception 'Incomplete NBA GM server economic simulations %, %, %',v_complete,v_caps_busted,v_seasons;end if;
 if v_two_elite_complete=0 then
   raise exception 'No two-elite roster can survive the NBA GM real-contract economy';end if;
 raise notice 'NBA GM V4 1200 server 3-season states, % viable, % cap-constrained (before offseason fixes), % two-elite viable',
   v_complete,v_caps_busted,v_two_elite_complete;
end;
$nba_real_salary_balance$;
rollback;
