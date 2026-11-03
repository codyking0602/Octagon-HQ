-- Restore parity-quality NBA GM repricing labels on the signed-salary V4 economy.
-- Earlier V3 signals were authored against synthetic V3 prices and deliberately
-- declined to label V4. The frontend has LOW/MED/HIGH/LOCKED support but the
-- current catalog omitted the source signal entirely.
-- This migration changes only deterministic scouting output, not salaries,
-- game outcomes, graded scores, or saved run states.
--
-- Forecaster: same 36 unseeded V4 odds/grade/market scenarios as the existing
-- V3 estimator, but using the 330 independently verified V4 salary averages.
-- Compare each hypothetical Year-2 extension with the existing 6.5% reserved
-- Year-2 salary, and retain the calibrated NBA $155M cap thresholds.
-- V4 1YR deals are locked after their one permitted post-Year-1 reprice.
create or replace function private.nba_gm_v5_reprice_risk(p_state jsonb,p_id text)
returns text language plpgsql stable security definer set search_path='' as $$
declare
  v_player private.nba_gm_dev_players%rowtype;
  v_profile jsonb;v_odds jsonb;
  v_year integer;v_step integer;v_branch integer;v_mag_index integer;v_market_index integer;
  v_grade numeric;v_ceiling numeric;v_up numeric;v_delta numeric;v_new_grade numeric;
  v_mag numeric;v_market numeric;v_factor numeric;v_price numeric;v_over numeric;
  v_weight numeric;v_probability numeric;v_expected numeric:=0;
  v_large_probability numeric:=0;v_huge_probability numeric:=0;v_cap_exposure_pct numeric;
  v_baseline numeric;
  v_economy4 boolean;v_salary_start numeric;
begin
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  if private.nba_gm_v3_contract_for_state(p_state,p_id)='3YR' then return 'LOCKED'; end if;
  -- Legacy forecasts would be wrong under the new v4 probability model;
  -- callers must keep their original generic label, not backfill invented risk.
  if coalesce(p_state->>'economyVersion','') not in ('3','4')
    or p_state->>'developmentModelVersion' is distinct from '2'
    or p_state->>'phase'='final' then return null; end if;
  v_economy4:=p_state->>'economyVersion'='4';
  -- V4 1YR terms extend once after Season 1; the salary is then fixed.
  if v_economy4 and p_state->>'phase'='offseason' then return 'LOCKED'; end if;
  v_profile:=v_player.development_profile;
  if v_profile is null then return null; end if;
  v_year:=case when p_state->>'phase'='offseason' then 3 else 2 end;
  v_step:=v_year-1;
  -- In draft/year1 never read the already-seeded future grade. In offseason,
  -- year-two development has ALREADY been revealed to the owner.
  v_grade:=case when v_year=3 then private.nba_gm_v4_grade(p_state,p_id,2)
    else v_player.overall end;
  v_odds:=private.nba_gm_v4_odds(p_state,p_id,v_step,v_grade);
  v_ceiling:=least(99,v_player.overall+(v_profile->>'careerHeadroom')::numeric);
  v_up:=least((v_profile->>'maxAnnualGain')::numeric,greatest(0,v_ceiling-v_grade));
  if v_economy4 then
    -- V4 operates on verified 2026-27 averaged salary windows, not the
    -- retired synthetic V3 salary fixture. No seeded extension price is read.
    select c.provisional_average_salary into v_salary_start
      from private.nba_gm_contract_candidates_2026_27 c
      where c.player_id=p_id and c.independently_verified and c.salary_schedule_verified;
  else
    v_salary_start:=v_player.salaries[1];
  end if;
  if v_salary_start is null or v_salary_start<=0 then return null; end if;
  -- A V4 one-year salary reserves 6.5% in both future seasons before the
  -- actual post-Season-1 repricing. Risk means additional CAP exposure
  -- beyond that existing reserve, not a promise of player improvement.
  v_baseline:=case when v_economy4
    then greatest(2500000,round(v_salary_start*1.065/100000)*100000)
    else v_player.salaries[v_year] end;
  -- Deterministic, seed-free probability-weighted forecast: 4 authoritative
  -- outcomes x 3 conditional magnitudes x 3 market samples, 36 scenarios.
  -- Exact v4 delta branches and v3 salary multipliers, including $2.5M floor,
  -- $100K rounding, annual market inflation and profile market variance.
  for v_branch in 1..4 loop
    v_probability:=case v_branch when 1 then (v_odds->>'breakoutPct')::numeric
      when 2 then (v_odds->>'improvePct')::numeric
      when 3 then (v_odds->>'steadyPct')::numeric
      else (v_odds->>'declinePct')::numeric end/100;
    for v_mag_index in 1..3 loop
      v_mag:=case v_mag_index when 1 then .15 when 2 then .5 else .85 end;
      v_delta:=case v_branch
        when 1 then v_up*(.55+.45*v_mag)
        when 2 then least(v_up*.62,.3+v_mag*least(2.4,v_up*.55))
        when 3 then (v_mag-.5)*least(1.2,v_up*.35)
        else -(.35+v_mag*greatest(0,(v_profile->>'maxAnnualLoss')::numeric-.35))
      end;
      v_delta:=greatest(-(v_profile->>'maxAnnualLoss')::numeric,least(v_up,v_delta));
      v_new_grade:=round(greatest(58,least(v_ceiling,v_grade+v_delta)),2);
      for v_market_index in 1..3 loop
        v_market:=case v_market_index when 1 then -.75 when 2 then 0 else .75 end;
        v_factor:=greatest(.66,least(2,power(1.105::numeric,v_new_grade-v_player.overall)
          *(case when v_year=2 then 1.065 else 1.12 end)));
        v_factor:=greatest(.62,least(2,v_factor
          *(1+v_market*(v_profile->>'marketVariancePct')::numeric/100)));
        v_price:=greatest(2500000,
          round(v_salary_start*v_factor/100000)*100000);
        v_over:=greatest(0,v_price-v_baseline);
        v_weight:=v_probability/9;
        v_expected:=v_expected+v_weight*v_over;
        if v_over>=greatest(1000000,v_salary_start*.12) then
          v_large_probability:=v_large_probability+v_weight;end if;
        if v_over>=greatest(2400000,v_salary_start*.15) then
          v_huge_probability:=v_huge_probability+v_weight;end if;
      end loop;
    end loop;
  end loop;
  -- Compare positive unbudgeted salary pressure with the NBA's fictional
  -- $155M cap. Football GM's NFL dollar cutoffs are not reused.
  v_cap_exposure_pct:=v_expected*100/155000000;
  if v_cap_exposure_pct>=.8 or
    (v_cap_exposure_pct>=.3 and v_huge_probability>=.17) then return 'HIGH'; end if;
  if v_cap_exposure_pct>=.3 or v_large_probability>=.12 then return 'MEDIUM';end if;
  return 'LOW';
end;
$$;
revoke all on function private.nba_gm_v5_reprice_risk(jsonb,text) from public,anon,authenticated;


-- Preserve all existing fields, salary source routing, access checks,
-- grants and 330-player ordering of the *current* live catalog definition.
-- Fail closed rather than overwrite another chat's concurrent RPC changes.
do $nba_gm_v4_catalog_risk$
declare v_def text; v_old text; v_new text;
begin
  select pg_get_functiondef('public.nba_gm_dev_catalog()'::regprocedure) into v_def;
  if v_def is null then raise exception 'NBA GM catalog unavailable'; end if;
  if position('''repriceRisk''' in v_def)>0 then
    raise exception 'NBA GM catalog already has repricing: inspect before reapplying';
  end if;
  v_old:='''gameContract'',private.nba_gm_v3_contract_for_state(v_state,p.id),';
  if position(v_old in v_def)=0 then
    raise exception 'NBA GM catalog contract binding drifted: refuse to patch';
  end if;
  v_new:=v_old||chr(10)||'    ''repriceRisk'',private.nba_gm_v5_reprice_risk(v_state,p.id),';
  execute replace(v_def,v_old,v_new);
end;
$nba_gm_v4_catalog_risk$;
