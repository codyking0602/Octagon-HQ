-- V13 matched historical-competition and owner-roster regression.
-- All 150 real team-seasons remain the opponent reference. Fixed rosters and
-- seeds compare V12 and V13 without changing V12 scoring or saved versions.
begin;
set local statement_timeout='240s';
do $v13_calibration$
declare
  v_name text; v_picks jsonb; v_state jsonb;
  v_12c jsonb;v_13c jsonb;v_12 jsonb;v_13 jsonb;
  v_results jsonb; v_year integer;v_score jsonb;
  v_first12 jsonb;v_first13 jsonb;
  v_delta numeric;v_overall_delta integer;v_sum numeric:=0;
  v_count integer:=0;v_improved integer:=0;v_max numeric:=0;
begin
  if (select count(*) from private.nba_gm_v5_historical_teams)<>150
    or (select count(*) from private.nba_gm_dev_players)<>330
    then raise exception 'V13 real-five-year opponents or player population drifted';end if;
  if position($needle$'simulationModelVersion',13,'lineupModelVersion',2$needle$
      in pg_get_functiondef('public.nba_gm_dev_action(text,text,text)'::regprocedure))=0
    then raise exception 'V13 new-franchise default missing';end if;
  if position('return private.nba_gm_v12_season' in
      pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure))=0
    or position('nba_gm_v13_season' in
      pg_get_functiondef('private.nba_gm_v2_season(jsonb,integer)'::regprocedure))=0
    then raise exception 'V12 replay or V13 season dispatch missing';end if;
  for v_name,v_picks in
    select r.name,r.picks from (values
      ('luka-two-elite-wings',
       jsonb_build_array(
         jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
         jsonb_build_object('slot','SG','playerId','nba-gm-draft-klaythompson'),
         jsonb_build_object('slot','SF','playerId','nba-gm-draft-kevindurant'),
         jsonb_build_object('slot','PF','playerId','nba-gm-draft-kawhileonard'),
         jsonb_build_object('slot','C','playerId','nba-gm-draft-moussadiabate'),
         jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-bogdanbogdanovic'),
         jsonb_build_object('slot','BIG','playerId','nba-gm-draft-yvesmissi'))),
      ('paolo-development-roster',
       jsonb_build_array(
         jsonb_build_object('slot','PG','playerId','nba-gm-draft-camspencer'),
         jsonb_build_object('slot','SG','playerId','nba-gm-draft-keyontegeorge'),
         jsonb_build_object('slot','SF','playerId','nba-gm-draft-paolobanchero'),
         jsonb_build_object('slot','PF','playerId','nba-gm-draft-jalenjohnson'),
         jsonb_build_object('slot','C','playerId','nba-gm-draft-kristapsporzingis'),
         jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-maxchristie'),
         jsonb_build_object('slot','BIG','playerId','nba-gm-draft-isaiahstewart'))),
      ('balanced-high-end',
       jsonb_build_array(
         jsonb_build_object('slot','PG','playerId','nba-gm-draft-jalensuggs'),
         jsonb_build_object('slot','SG','playerId','nba-gm-draft-reedsheppard'),
         jsonb_build_object('slot','SF','playerId','nba-gm-draft-kawhileonard'),
         jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
         jsonb_build_object('slot','C','playerId','nba-gm-draft-jabarismith'),
         jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jaylontyson'),
         jsonb_build_object('slot','BIG','playerId','nba-gm-draft-dayronsharpe')))
    ) r(name,picks)
  loop
    if private.nba_gm_v2_assign(v_picks) is null
      then raise exception 'V13 % saved-roster fixture is no longer position legal',v_name;end if;
    v_state:=jsonb_build_object(
      'version','nba-gm-dev-v2','economyVersion',4,
      'simulationModelVersion',13,'developmentModelVersion',2,
      'lineupModelVersion',2,'repriceModelVersion',2,
      'seed','v13-matched-'||v_name,'phase','year1',
      'picks',v_picks,'yearOnePicks',v_picks,
      'releasedIds','[]'::jsonb,'tradesUsed',0,
      'caps','[175000000,175000000,175000000]'::jsonb);
    v_12c:=private.nba_gm_v12_components(v_state,1,v_picks);
    v_13c:=private.nba_gm_v13_components(v_state,1,v_picks);
    if v_12c->'def' is distinct from v_13c->'def'
      or v_12c->'defFit' is distinct from v_13c->'defFit'
      or v_12c->'offFit' is distinct from v_13c->'offFit'
      or v_12c->'spacing' is distinct from v_13c->'spacing'
      or v_12c->'severeNonShooterLoad' is distinct from v_13c->'severeNonShooterLoad'
      then raise exception 'V13 altered V12 defense, spacing or fit in %',v_name;end if;
    v_delta:=(v_13c->>'off')::numeric-(v_12c->>'off')::numeric;
    if v_name='luka-two-elite-wings' and v_delta<=.2
      then raise exception 'V13 did not correct Luka elite offense: %',v_delta;end if;
    if v_delta>5 or v_delta<-.75
      then raise exception 'V13 offense swings too far in %: %',v_name,v_delta;end if;
    v_results:='[]'::jsonb;
    for v_year in 1..3 loop
      v_12:=private.nba_gm_v12_season(jsonb_set(v_state,
        '{simulationModelVersion}','12'::jsonb),v_year);
      v_13:=private.nba_gm_v13_season(v_state,v_year);
      if v_13 is distinct from private.nba_gm_v2_season(v_state,v_year)
        or v_12 is distinct from private.nba_gm_v2_season(
          jsonb_set(v_state,'{simulationModelVersion}','12'::jsonb),v_year)
        or (v_13->>'wins')::integer+(v_13->>'losses')::integer<>82
        or (v_13->>'titleOdds')::numeric not between 0 and 49.6
        or (v_13->>'teamOverall')::integer not between 70 and 99
        then raise exception 'V13/V12 exact version routing or output failed % Y%',v_name,v_year;end if;
      v_results:=v_results||jsonb_build_array(v_13);
      if v_year=1 then v_first12:=v_12;v_first13:=v_13;end if;
      if v_year=1 then
        v_overall_delta:=(v_13->>'teamOverall')::integer-(v_12->>'teamOverall')::integer;
        if v_overall_delta>7 or v_overall_delta<(-3) then
          raise exception 'Unrealistic V13 season OVR delta %: %',v_name,v_overall_delta;end if;
      end if;
    end loop;
    v_score:=private.nba_gm_v13_final_score(jsonb_set(v_state,'{results}',v_results));
    if v_score is distinct from private.nba_gm_v3_final_score(
      jsonb_set(v_state,'{results}',v_results))
      or v_score->'weights' is distinct from '[0.9,0.03,0.07]'::jsonb
      then raise exception 'V13 90/3/7 final score dispatch failed for %',v_name;end if;
    raise notice 'V13 matched % offense delta % / Y1 OVR delta % / Y1 wins V12 % V13 % / title odds V12 % V13 % / final score %',
      v_name,round(v_delta,2),v_overall_delta,v_first12->>'wins',v_first13->>'wins',
      v_first12->>'titleOdds',v_first13->>'titleOdds',v_score->>'score';
  end loop;
  -- Same 150 historical opponents for 30 present-day team cores.
  -- These are calibration fixtures, not claims that 2026 rosters are past champions.
  for v_name in select distinct team_code from private.nba_gm_dev_players order by 1 loop
    select jsonb_agg(jsonb_build_object('playerId',q.id) order by q.overall desc,q.id)
      into v_picks from (select id,overall from private.nba_gm_dev_players
      where team_code=v_name order by overall desc,id limit 7) q;
    v_picks:=private.nba_gm_v2_assign(v_picks);
    if v_picks is null then continue;end if;
    v_state:=jsonb_build_object(
      'economyVersion',4,'simulationModelVersion',13,'lineupModelVersion',2,
      'developmentModelVersion',2,'seed','v13-history-'||v_name,
      'picks',v_picks,'yearOnePicks',v_picks,
      'releasedIds','[]'::jsonb,'tradesUsed',0);
    v_12:=private.nba_gm_v12_season(jsonb_set(v_state,
      '{simulationModelVersion}','12'::jsonb),1);
    v_13:=private.nba_gm_v13_season(v_state,1);
    v_delta:=(v_13->>'wins')::numeric-(v_12->>'wins')::numeric;
    v_count:=v_count+1;v_sum:=v_sum+v_delta;v_max:=greatest(v_max,abs(v_delta));
    if v_delta>0 then v_improved:=v_improved+1;end if;
    if (v_13->>'titleOdds')::numeric not between 0 and 49.6
       or (v_13->>'wins')::integer>75
       then raise exception 'V13 historical comparison out of bounds for %',v_name;end if;
  end loop;
  if v_count<10 or v_sum/v_count>5 or v_max>13
    then raise exception 'V13 historical cohort failed: n %, avg wins delta %, max %',
      v_count,case when v_count>0 then v_sum/v_count else null end,v_max;end if;
  raise notice 'V13 real-150-opponent check: % position-legal current cores, avg win delta %, improved %, max absolute win delta %',
    v_count,round(v_sum/v_count,2),v_improved,v_max;
end;
$v13_calibration$;
rollback;
