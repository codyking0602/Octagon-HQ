-- NBA GM V12: controlled six-skill sensitivity on a fixed, legal roster.
-- Every player edit is inside this transaction and fully rolled back.
-- Assert smooth shooting, role-specific passing, both defensive coverage
-- channels and offensive/defensive second-chance rebounding contribution.
begin;
set local statement_timeout='180s';
do $v12_skill_sensitivity$
declare
  v_picks jsonb:=jsonb_build_array(
    jsonb_build_object('slot','PG','playerId','nba-gm-draft-lukadoncic'),
    jsonb_build_object('slot','SG','playerId','nba-gm-draft-casonwallace'),
    jsonb_build_object('slot','SF','playerId','nba-gm-draft-jalenjohnson'),
    jsonb_build_object('slot','PF','playerId','nba-gm-draft-paolobanchero'),
    jsonb_build_object('slot','C','playerId','nba-gm-draft-kristapsporzingis'),
    jsonb_build_object('slot','GUARD','playerId','nba-gm-draft-stephencurry'),
    jsonb_build_object('slot','BIG','playerId','nba-gm-draft-markwilliams'));
  v_state jsonb;v_skill text;v_player_id text;v_new integer;
  v_orig jsonb;v_before jsonb;v_after jsonb;
  v_pre numeric;v_post numeric;v_difference numeric;
  v_reference_shoot numeric;v_after_shoot numeric;
  v_seen integer:=0;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330
     or (select count(*) from private.nba_gm_v5_historical_teams)<>150
     or private.nba_gm_v2_assign(v_picks) is null
    then raise exception 'V12 six-skill reference catalog or legal roster drifted';end if;

  v_state:=jsonb_build_object('economyVersion',4,'simulationModelVersion',12,
    'developmentModelVersion',2,'lineupModelVersion',2,
    'seed','v12-six-skill-fixed-roster','picks',v_picks,
    'yearOnePicks',v_picks,'releasedIds','[]'::jsonb,'tradesUsed',0);

  for v_skill,v_player_id,v_new in
    select s.skill,s.pid,s.new_value from (values
      ('scoring','nba-gm-draft-casonwallace',87),
      ('shooting','nba-gm-draft-casonwallace',80),
      ('playmaking','nba-gm-draft-kristapsporzingis',80),
      ('perimeterDefense','nba-gm-draft-casonwallace',70),
      ('interiorDefense','nba-gm-draft-kristapsporzingis',72),
      ('rebounding','nba-gm-draft-kristapsporzingis',59),
      ('shooting','nba-gm-draft-markwilliams',50)
    ) s(skill,pid,new_value)
  loop
    select skills into v_orig from private.nba_gm_dev_players
      where id=v_player_id;
    if v_orig is null then raise exception 'Unknown six-skill audit player %',v_player_id;end if;
    if (v_orig->>v_skill)::integer=v_new then
      raise exception 'Six-skill audit lost sensitivity interval for %',v_skill;end if;

    v_before:=private.nba_gm_v12_components(v_state,1,v_picks);
    v_pre:=.75*((v_before->>'off')::numeric+(v_before->>'def')::numeric)
      +(v_before->>'offFit')::numeric+(v_before->>'defFit')::numeric;
    update private.nba_gm_dev_players set
      skills=jsonb_set(v_orig,array[v_skill],to_jsonb(v_new))
      where id=v_player_id;
    v_after:=private.nba_gm_v12_components(v_state,1,v_picks);
    v_post:=.75*((v_after->>'off')::numeric+(v_after->>'def')::numeric)
      +(v_after->>'offFit')::numeric+(v_after->>'defFit')::numeric;
    v_difference:=v_post-v_pre;
    update private.nba_gm_dev_players set skills=v_orig where id=v_player_id;

    if v_skill in ('perimeterDefense','interiorDefense','rebounding') then
      if v_difference>=-.01 then
        raise exception '% reduced but did not worsen team net: %',
          v_skill,v_difference;end if;
    else
      if v_difference<=.01 then
        raise exception '% improved but did not improve team net: %',
          v_skill,v_difference;end if;
    end if;
    if v_skill='shooting' and v_player_id='nba-gm-draft-casonwallace'
        and (v_difference>=.30
          or abs((v_after->>'spacing')::numeric-(v_before->>'spacing')::numeric)>.05)
        then raise exception 'Shooting 79 to 80 has a discontinuity: %',v_difference;end if;
    if v_skill='shooting' and v_player_id='nba-gm-draft-markwilliams'
        and v_after->'spacing' is distinct from v_before->'spacing'
        then raise exception 'Bench shooting changed starter spacing';
    end if;
    v_seen:=v_seen+1;
    raise notice 'V12 SKILL SENSITIVITY % on % (old %, new %): delta team net % (wins-equivalent %)',
      v_skill,v_player_id,v_orig->>v_skill,v_new,
      round(v_difference,3),round(2.2684*v_difference,2);
  end loop;
  if v_seen<>7 then raise exception 'V12 must test all six skills plus bench shooting';end if;
end;
$v12_skill_sensitivity$;
rollback;
