-- Full 330-player NBA GM v2 development distribution, version isolation and economy QA.
-- Read-only deterministic test; use fresh local database migrations before release.
begin;
select set_config('request.jwt.claim.role','service_role',true);
do $qa$
declare
  p record;v_state jsonb;v_legacy jsonb;v_v2 jsonb;v_o jsonb;
  v_g2 numeric;v_g3 numeric;v_n numeric;v_original numeric;
  v_r integer;v_up integer:=0;v_down integer:=0;v_count integer:=0;v_salary bigint;
begin
  if (select count(*) from private.nba_gm_dev_players)<>330 or
    (select count(*) from private.nba_gm_dev_players where development_profile->>'id'=id)<>330
    then raise exception '330 individual NBA GM development profiles required'; end if;
  for p in select id,overall,development_profile d from private.nba_gm_dev_players loop
    v_count:=v_count+1;
    if (p.d->>'breakoutPct')::numeric+(p.d->>'improvePct')::numeric+
      (p.d->>'steadyPct')::numeric+(p.d->>'declinePct')::numeric<>100
      then raise exception 'Invalid odds for %',p.id; end if;
    v_state:=jsonb_build_object('seed','nba-gm-profile-qa-stable','economyVersion',3,'developmentModelVersion',2,'phase','offseason');
    v_o:=private.nba_gm_v4_odds(v_state,p.id,1,p.overall);
    if (v_o->>'breakoutPct')::numeric<>(p.d->>'breakoutPct')::numeric or
      (v_o->>'declinePct')::numeric<>(p.d->>'declinePct')::numeric
      then raise exception 'Year 2 odds drift from authoritative profile %',p.id; end if;
    for v_r in 1..4 loop
      v_state:=jsonb_build_object('seed','nba-gm-profile-qa-'||v_r,'economyVersion',3,'developmentModelVersion',2,'phase','offseason');
      v_g2:=private.nba_gm_v3_grade(v_state,p.id,2);
      v_g3:=private.nba_gm_v3_grade(v_state,p.id,3);
      if v_g2 is distinct from private.nba_gm_v3_grade(v_state,p.id,2)
        or v_g3 is distinct from private.nba_gm_v3_grade(v_state,p.id,3)
        then raise exception 'Nondeterministic grade for %',p.id; end if;
      if v_g2>least(99,p.overall+(p.d->>'careerHeadroom')::numeric) or
        v_g3>least(99,p.overall+(p.d->>'careerHeadroom')::numeric) or
        v_g2-p.overall>(p.d->>'maxAnnualGain')::numeric+.01 or
        p.overall-v_g2>(p.d->>'maxAnnualLoss')::numeric+.01 or
        v_g3-v_g2>(p.d->>'maxAnnualGain')::numeric+.01 or
        v_g2-v_g3>(p.d->>'maxAnnualLoss')::numeric+.01
        then raise exception 'Development gain/loss/ceiling violation for %',p.id; end if;
      if v_g2>p.overall+.4 then v_up:=v_up+1; end if;
      if v_g2<p.overall-.4 then v_down:=v_down+1; end if;
      select private.nba_gm_v3_contract(p.id) into v_n;
      if private.nba_gm_v3_contract(p.id)='3YR' then
        v_salary:=private.nba_gm_v3_salary(v_state,p.id,3);
        if v_salary<>(select salaries[1] from private.nba_gm_dev_players where id=p.id)
          then raise exception '3YR price not locked for %',p.id; end if;
      end if;
    end loop;
    v_legacy:=jsonb_build_object('seed','nba-gm-profile-qa-stable','economyVersion',3,'phase','offseason');
    v_v2:=jsonb_build_object('seed','nba-gm-profile-qa-stable','phase','offseason');
    if private.nba_gm_v3_grade(v_v2,p.id,3)<>p.overall
      then raise exception 'V2 saved games were regraded for %',p.id; end if;
    if private.nba_gm_v3_grade(v_legacy,p.id,2) is distinct from private.nba_gm_v3_grade(v_legacy,p.id,2)
      then raise exception 'Legacy V3 behavior unstable for %',p.id; end if;
  end loop;
  if v_count<>330 or v_up<30 or v_down<30
    then raise exception 'Implausible four-seed NBA GM distribution: % players, % gain rolls, % decline rolls',v_count,v_up,v_down; end if;
end;$qa$;
rollback;
