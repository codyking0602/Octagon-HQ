-- NBA GM Priority 2 backend regression. Run after additive migration 202612310899
-- against disposable/local DB; uses service role ONLY, changes no player data.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $nba_scouting$
declare
  p record;
  v_draft_a jsonb;v_draft_b jsonb;v_offseason jsonb;v_old jsonb;
  v_a text;v_b text;v_year3 text;
  v_low integer:=0;v_med integer:=0;v_high integer:=0;v_locked integer:=0;
  v_count integer:=0;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330
    then raise exception 'NBA GM player inventory is not 330'; end if;
  for p in select id,overall,development_profile from private.nba_gm_dev_players loop
    v_count:=v_count+1;
    v_draft_a:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
      'phase','draft','seed','nba-scouting-probe-a');
    v_draft_b:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
      'phase','draft','seed','nba-scouting-probe-b');
    v_offseason:=jsonb_build_object('economyVersion',3,'developmentModelVersion',2,
      'phase','offseason','seed','nba-scouting-probe-a');
    v_old:=jsonb_build_object('phase','offseason','seed','nba-scouting-probe-a');
    v_a:=private.nba_gm_v5_reprice_risk(v_draft_a,p.id);
    v_b:=private.nba_gm_v5_reprice_risk(v_draft_b,p.id);
    -- The pre-draft classification cannot peek at the actual seeded outcome.
    if v_a is distinct from v_b then
      raise exception 'Pre-draft salary scouting leaked future seed for %',p.id;
    end if;
    if private.nba_gm_v3_contract(p.id)='3YR' then
      v_locked:=v_locked+1;
      if v_a<>'LOCKED'
        or private.nba_gm_v3_salary(v_offseason,p.id,2)<>
          (select salaries[1] from private.nba_gm_dev_players where id=p.id)
        then raise exception '3YR reprice/lock mismatch %',p.id;end if;
    else
      case v_a
        when 'LOW' then v_low:=v_low+1;
        when 'MEDIUM' then v_med:=v_med+1;
        when 'HIGH' then v_high:=v_high+1;
        else raise exception 'Missing one-year risk for %',p.id;
      end case;
      if private.nba_gm_v5_reprice_risk(v_old,p.id) is not null then
        raise exception 'Legacy saved run received a new-risk forecast %',p.id;end if;
    end if;
    v_year3:=private.nba_gm_v5_reprice_risk(v_offseason,p.id);
    if v_year3 is distinct from 'LOCKED' and v_year3 not in ('LOW','MEDIUM','HIGH') then
      raise exception 'Season 3 forecast invalid %',p.id;end if;
    if private.nba_gm_v5_reprice_risk(v_offseason,p.id)
      is distinct from v_year3 then
      raise exception 'Non-deterministic offseason reprice classification %',p.id;end if;
    if private.nba_gm_v3_grade(v_old,p.id,3)<>p.overall then
      raise exception 'V2 saved grade mutated for %',p.id;end if;
  end loop;
  if v_count<>330 or v_locked<>94 or v_low<30 or v_med<30 or v_high<10
    or v_low+v_med+v_high<>236 then
    raise exception 'NBA GM risk distribution invalid: low %, med %, high %, locked %',
      v_low,v_med,v_high,v_locked;end if;
  raise notice 'NBA GM 330 verified: LOW %, MED %, HIGH %, LOCKED %',
    v_low,v_med,v_high,v_locked;
end;
$nba_scouting$;
rollback;
