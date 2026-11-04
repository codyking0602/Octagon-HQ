-- Read-only regression: reserve big develops past center in Years 2/3.
-- Also prove draft/year 1, old V9 saves, and seeded simulator parity are intact.
begin;
set local statement_timeout='180s';
do $nba_developed_starters$
declare
  v_picks jsonb:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-tyjerome'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-aaronnesmith'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-kevindurant'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-cooperflagg'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-markwilliams'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-jrueholiday'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-noahclowney'));
  v_state jsonb;
  v_legacy jsonb;
  v_y2 jsonb;
  v_y3 jsonb;
  v_reverse jsonb;
  v_manual jsonb;
  v_year integer;
  v_actual jsonb;
begin
  v_state:=jsonb_build_object(
    'version','nba-gm-dev-v2','economyVersion',4,
    'simulationModelVersion',9,'developmentModelVersion',2,
    'lineupModelVersion',1,'seed','nba-gm-lineup-regression-101',
    'picks',v_picks,'yearOnePicks',v_picks,
    'releasedIds','[]'::jsonb,'tradesUsed',0);
  v_legacy:=v_state-'lineupModelVersion';

  if private.nba_gm_v2_assign(v_picks) is distinct from v_picks then
    raise exception 'Expected original valid drafted NBA seven';
  end if;
  if private.nba_gm_v3_grade(v_state,'nba-gm-draft-noahclowney',1)
     >=private.nba_gm_v3_grade(v_state,'nba-gm-draft-markwilliams',1) then
    raise exception 'Seed lost the original higher-rated starting center';
  end if;
  v_y2:=private.nba_gm_v10_season_lineup(v_state,2);
  v_y3:=private.nba_gm_v10_season_lineup(v_state,3);
  for v_year in 2..3 loop
    v_actual:=case v_year when 2 then v_y2 else v_y3 end;
    if private.nba_gm_v3_grade(v_state,'nba-gm-draft-noahclowney',v_year)
       <=private.nba_gm_v3_grade(v_state,'nba-gm-draft-markwilliams',v_year)
      or not(v_actual @> '[{"slot":"C","playerId":"nba-gm-draft-noahclowney"}]'::jsonb)
      or not(v_actual @> '[{"slot":"BIG","playerId":"nba-gm-draft-markwilliams"}]'::jsonb)
      or jsonb_array_length(v_actual)<>7 then
      raise exception 'Developed Clowney did not start over Williams in season %: %',
        v_year,v_actual;
    end if;
    v_manual:=jsonb_set(v_legacy,'{picks}',v_actual);
    if private.nba_gm_v2_season(v_state,v_year)
       is distinct from private.nba_gm_v9_season(v_manual,v_year) then
      raise exception 'Season % used saved bench slots instead of developed starting five',v_year;
    end if;
  end loop;
  select jsonb_agg(e.value order by e.ordinality desc)
    into v_reverse from jsonb_array_elements(v_picks) with ordinality e(value,ordinality);
  if private.nba_gm_v10_season_lineup(jsonb_set(v_state,'{picks}',v_reverse),2)
     is distinct from v_y2 then
    raise exception 'Season lineup depended on drafted array order';
  end if;
  if private.nba_gm_v2_season(v_state,1)
     is distinct from private.nba_gm_v2_season(v_legacy,1) then
    raise exception 'The new auto-lineup unexpectedly changed Year 1';
  end if;
  if private.nba_gm_v2_season(v_legacy,2)
     is distinct from private.nba_gm_v9_season(v_legacy,2) then
    raise exception 'Historical unversioned V9 result changed';
  end if;
  if (select count(*) from private.nba_gm_dev_players)<>330 then
    raise exception 'NBA GM catalog changed unexpectedly';
  end if;
end;
$nba_developed_starters$;
rollback;
