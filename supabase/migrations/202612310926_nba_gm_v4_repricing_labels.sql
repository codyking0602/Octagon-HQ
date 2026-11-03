-- Restore the existing NBA GM scouting badges after V4 catalog replacement.
-- V4 uses a verified averaged salary window and a single post-Year-1 extension.
-- Repricing labels are seed-free probabilities; never reveal saved future rolls,
-- rewrite previous runs, change salary caps, or alter the scoring engine.

create or replace function private.nba_gm_v10_reprice_risk(p_state jsonb, p_id text)
returns text language plpgsql stable security definer set search_path='' as $$
declare
  v_player private.nba_gm_dev_players%rowtype;
  v_profile jsonb; v_odds jsonb;
  v_start numeric; v_forecast numeric;
  v_ceiling numeric; v_up numeric; v_delta numeric; v_new_grade numeric;
  v_mag numeric; v_market numeric; v_factor numeric; v_price numeric; v_over numeric;
  v_probability numeric; v_weight numeric; v_expected numeric:=0;
  v_large_probability numeric:=0; v_huge_probability numeric:=0;
  v_exposure_pct numeric;
  v_branch integer; v_mag_index integer; v_market_index integer;
begin
  -- Legacy fixtures retain the original V5 forecast and compatibility policy.
  if p_state->>'economyVersion' is distinct from '4'
     or p_state->>'developmentModelVersion' is distinct from '2'
     then return null; end if;
  if private.nba_gm_v4_contract(p_state,p_id)='3YR' then return 'LOCKED'; end if;

  select * into v_player from private.nba_gm_dev_players where id=p_id;
  if not found then raise exception 'Unknown NBA GM player'; end if;
  v_profile:=v_player.development_profile;
  if v_profile is null then return null; end if;
  select provisional_average_salary into v_start
    from private.nba_gm_contract_candidates_2026_27 where player_id=p_id;
  if v_start is null or v_start<=0 then return null; end if;

  -- 1YR contracts reprice exactly ONCE after Year 1; the $155M cap
  -- initially reserves a 6.5% extension forecast for both future years.
  v_forecast:=greatest(2500000,round(v_start*1.065/100000)*100000);
  v_odds:=private.nba_gm_v4_odds(p_state,p_id,1,v_player.overall);
  v_ceiling:=least(99,v_player.overall+(v_profile->>'careerHeadroom')::numeric);
  v_up:=least((v_profile->>'maxAnnualGain')::numeric,
              greatest(0,v_ceiling-v_player.overall));

  -- Forecast 4 authored outcomes x 3 magnitudes x 3 market samples.
  -- The actual game uses seeded draws; this forecast intentionally does not.
  for v_branch in 1..4 loop
    v_probability:=case v_branch
      when 1 then (v_odds->>'breakoutPct')::numeric
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
      v_delta:=greatest(-(v_profile->>'maxAnnualLoss')::numeric,
                        least(v_up,v_delta));
      v_new_grade:=round(greatest(58,least(v_ceiling,v_player.overall+v_delta)),2);

      for v_market_index in 1..3 loop
        v_market:=case v_market_index when 1 then -.75 when 2 then 0 else .75 end;
        v_factor:=greatest(.66,least(2,
          power(1.105::numeric,v_new_grade-v_player.overall)*1.065));
        v_factor:=greatest(.62,least(2,v_factor*
          (1+v_market*(v_profile->>'marketVariancePct')::numeric/100)));
        v_price:=greatest(2500000,round(v_start*v_factor/100000)*100000);
        v_over:=greatest(0,v_price-v_forecast);
        v_weight:=v_probability/9;
        v_expected:=v_expected+v_weight*v_over;
        if v_over>=greatest(1000000,v_start*.12) then
          v_large_probability:=v_large_probability+v_weight; end if;
        if v_over>=greatest(2400000,v_start*.15) then
          v_huge_probability:=v_huge_probability+v_weight; end if;
      end loop;
    end loop;
  end loop;

  -- NBA-specific unreserved cap-pressure cutoffs (not NFL dollar values).
  v_exposure_pct:=v_expected*100/155000000;
  if v_exposure_pct>=.8 or
     (v_exposure_pct>=.3 and v_huge_probability>=.17) then return 'HIGH'; end if;
  if v_exposure_pct>=.3 or v_large_probability>=.12 then return 'MEDIUM'; end if;
  return 'LOW';
end;
$$;
revoke all on function private.nba_gm_v10_reprice_risk(jsonb,text)
  from public,anon,authenticated;

-- Preserve the CURRENT V4 catalog's exact salary/contract shape and access
-- checks; restore only the risk property expected by the existing UI.
create or replace function public.nba_gm_dev_catalog()
returns jsonb language plpgsql stable security definer set search_path='' as $$
declare v_state jsonb;
begin
  if not (auth.uid() is not null) then raise exception 'NBA GM sign-in required'; end if;
  select r.state into v_state from private.football_gm_runs r
   where r.profile_id=auth.uid() and r.game_version='nba-gm-dev-v2'
   order by (r.completed_at is null) desc,r.updated_at desc limit 1;
  return coalesce((select jsonb_agg(jsonb_build_object(
    'id',p.id,'name',p.name,'teamCode',p.team_code,'positions',p.positions,
    'currentGrade',p.overall,'skills',p.skills,
    'ageAtStart',case when p.verified_birth_date is null then null else
      extract(year from age(date '2026-10-30',p.verified_birth_date))::integer end,
    'salaries',case when v_state->>'economyVersion'='4' or v_state->>'phase' in ('offseason','final') then
      jsonb_build_array(private.nba_gm_v3_salary(v_state,p.id,1),
        private.nba_gm_v3_salary(v_state,p.id,2),
        private.nba_gm_v3_salary(v_state,p.id,3))
      else to_jsonb(p.salaries) end,
    'gameContract',private.nba_gm_v3_contract_for_state(v_state,p.id),
    'repriceRisk',case when v_state->>'economyVersion'='4'
      then private.nba_gm_v10_reprice_risk(v_state,p.id)
      else private.nba_gm_v5_reprice_risk(v_state,p.id) end,
    'pricingKind',case when v_state->>'economyVersion'='4'
      then 'SIGNED_REAL_SALARY_WINDOW' else p.pricing_kind end,
    'eligibilityKind',p.eligibility_kind,
    'officialNbaPlayerId',p.official_nba_player_id,
    'officialRosterPosition',p.official_roster_position,
    'positionReview',p.position_review,'reviewFlags',p.review_flags
  ) order by p.overall desc,p.name) from private.nba_gm_dev_players p),'[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public,anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;
