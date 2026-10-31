-- Priority 2 scouting forecast metadata. Additive JSON fields, no saved-run
-- schema or economy mutation. Keep seed and realized future salaries private.
-- Forecast parameters come from the SAME identity-bound profile consumed by
-- nba_gm_v4_grade/odds and nba_gm_v3_salary in migration 898.
-- Existing v2/v3 saved runs retain their original development/economy routes.
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
    'developmentForecast',case when p.development_profile is null then null else
      jsonb_build_object(
        'gradeAtCalibration',(p.development_profile->>'gradeAtCalibration')::numeric,
        'maxAnnualGain',(p.development_profile->>'maxAnnualGain')::numeric,
        'maxAnnualLoss',(p.development_profile->>'maxAnnualLoss')::numeric,
        'careerHeadroom',(p.development_profile->>'careerHeadroom')::numeric,
        'marketVariancePct',(p.development_profile->>'marketVariancePct')::numeric) end,
    'ageAtStart',case when p.verified_birth_date is null then null else
      extract(year from age(date '2026-10-30',p.verified_birth_date))::integer end,
    'salaries',case when v_state->>'phase' in ('offseason','final') then jsonb_build_array(private.nba_gm_v3_salary(v_state,p.id,1),private.nba_gm_v3_salary(v_state,p.id,2),private.nba_gm_v3_salary(v_state,p.id,3)) else to_jsonb(p.salaries) end,
    'gameContract',private.nba_gm_v3_contract_for_state(v_state,p.id),
    'pricingKind',p.pricing_kind,'eligibilityKind',p.eligibility_kind,
    'officialNbaPlayerId',p.official_nba_player_id,
    'officialRosterPosition',p.official_roster_position,
    'positionReview',p.position_review,'reviewFlags',p.review_flags
  ) order by p.overall desc,p.name) from private.nba_gm_dev_players p),'[]'::jsonb);
end;
$$;
revoke all on function public.nba_gm_dev_catalog() from public,anon;
grant execute on function public.nba_gm_dev_catalog() to authenticated;
