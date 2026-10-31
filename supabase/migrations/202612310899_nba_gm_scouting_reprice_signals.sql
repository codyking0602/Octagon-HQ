-- NBA GM Priority 2: additive, owner-only scouting forecast. V2 and untagged V3
-- saved games preserve their original salary and development machinery.
-- This is a pre-seed probability forecast, NOT the actual next-year result.
-- Fictional 7-player game cap; never treat these numbers as NBA contracts.
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
begin
  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  if private.nba_gm_v3_contract_for_state(p_state,p_id)='3YR' then return 'LOCKED'; end if;
  -- Legacy forecasts would be wrong under the new v4 probability model;
  -- callers must keep their original generic label, not backfill invented risk.
  if p_state->>'economyVersion' is distinct from '3'
    or p_state->>'developmentModelVersion' is distinct from '2'
    or p_state->>'phase'='final' then return null; end if;
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
  v_baseline:=v_player.salaries[v_year];
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
          round(v_player.salaries[1]*v_factor/100000)*100000);
        v_over:=greatest(0,v_price-v_baseline);
        v_weight:=v_probability/9;
        v_expected:=v_expected+v_weight*v_over;
        if v_over>=greatest(1000000,v_player.salaries[1]*.12) then
          v_large_probability:=v_large_probability+v_weight;end if;
        if v_over>=greatest(2400000,v_player.salaries[1]*.15) then
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

-- Reuse the current owner-authenticated catalog. Only ADD repriceRisk; all
-- existing fields and saved-run schemas remain exactly backward compatible.
create or replace function public.nba_gm_dev_catalog()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_state jsonb;
begin
  if not private.nba_gm_dev_owner() then raise exception 'NBA GM playtest access required'; end if;
  select r.state into v_state from private.football_gm_runs r
   where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   order by (r.completed_at is null) desc,r.updated_at desc limit 1;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'teamCode',p.team_code,'positions',p.positions,
    'currentGrade',p.overall,'skills',p.skills,
    'developmentOdds',case when v_state->>'developmentModelVersion'='2' and v_state->>'phase'<>'final' then
      private.nba_gm_v4_odds(v_state,p.id,case when v_state->>'phase'='offseason' then 2 else 1 end,
        case when v_state->>'phase'='offseason' then private.nba_gm_v4_grade(v_state,p.id,2) else p.overall end)
      else null end,
    'ageAtStart',case when p.verified_birth_date is null then null else
      extract(year from age(date '2026-10-30',p.verified_birth_date))::integer end,
    'salaries',case when v_state->>'phase' in ('offseason','final') then jsonb_build_array(private.nba_gm_v3_salary(v_state,p.id,1),private.nba_gm_v3_salary(v_state,p.id,2),private.nba_gm_v3_salary(v_state,p.id,3)) else to_jsonb(p.salaries) end,
    'gameContract',private.nba_gm_v3_contract_for_state(v_state,p.id),
    'repriceRisk',private.nba_gm_v5_reprice_risk(v_state,p.id),
    'pricingKind',p.pricing_kind,'eligibilityKind',p.eligibility_kind,
    'officialNbaPlayerId',p.official_nba_player_id,
    'officialRosterPosition',p.official_roster_position,
    'positionReview',p.position_review,'reviewFlags',p.review_flags
  ) order by p.overall desc,p.name) from private.nba_gm_dev_players p),'[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public,anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;
