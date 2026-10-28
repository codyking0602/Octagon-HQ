-- Confirm the final score server-side, rather than trusting the number in an API request.
-- This follows precisely the shipped NFL GM Team OVR ladder and 90/10 formula.
-- No historical records, sim outcomes, or Casual GM grading are altered.
create or replace function private.football_weekly_gm_verified_score(p_state jsonb)
returns numeric
language plpgsql immutable
set search_path = ''
as $$
declare
  v_seasons jsonb := p_state->'resolvedSeasons';
  v_row jsonb;
  v_year integer;
  v_grade numeric;
  v_raw numeric;
  v_weak numeric;
  v_wins integer;
  v_losses integer;
  v_finish text;
  v_resume integer;
  v_resume_total numeric := 0;
  v_ovr_total numeric := 0;
  v_ovr numeric;
  v_ranked_roster numeric;
  v_resume_score numeric;
  v_anchor_grades numeric[] := array[78,80,82,84,85,86,87,88,89,90,91,92,93,94,98];
  v_anchor_ovrs numeric[] := array[70,74,78,82,84,87,89,92,94,96,97,98,98,99,99];
begin
  if jsonb_typeof(v_seasons) is distinct from 'array'
    or jsonb_array_length(v_seasons) <> 3 then
    raise exception 'Weekly GM requires three verified season summaries';
  end if;
  for v_year in 1..3 loop
    v_row := v_seasons->(v_year - 1);
    if jsonb_typeof(v_row) is distinct from 'object'
      or v_row->>'year' is distinct from v_year::text
      or coalesce(v_row->>'teamGrade','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'rawTeamGrade','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'weakLinkPenalty','') !~ '^[0-9]+(\.[0-9]+)?$'
      or coalesce(v_row->>'wins','') !~ '^[0-9]+$'
      or coalesce(v_row->>'losses','') !~ '^[0-9]+$'
      then raise exception 'Invalid Weekly GM season summary for Year %', v_year;
    end if;
    v_grade := (v_row->>'teamGrade')::numeric;
    v_raw := (v_row->>'rawTeamGrade')::numeric;
    v_weak := (v_row->>'weakLinkPenalty')::numeric;
    v_wins := (v_row->>'wins')::integer;
    v_losses := (v_row->>'losses')::integer;
    if v_grade not between 65 and 105
      or v_raw not between 65 and 105
      or v_weak not between 0 and 0.8
      or v_grade <> round(v_raw - v_weak, 1)
      or v_wins + v_losses <> 17
      or v_wins > 17 or v_losses > 17 then
      raise exception 'Inconsistent Weekly GM season grading for Year %', v_year;
    end if;
    v_finish := v_row->>'finish';
    v_resume := case v_finish
      when 'Missed Playoffs' then 83
      when 'Wild Card' then 85
      when 'Divisional' then 88
      when 'Conference Championship' then 94
      when 'Super Bowl Loss' then 97
      when 'Champion' then 100
      else null end;
    if v_resume is null then raise exception 'Invalid Weekly GM postseason finish'; end if;
    -- footballGmTeamOverall(): clamp the raw grade, then interpolate the
    -- exact same approved OVR anchors used for Casual and Weekly.
    v_grade := greatest(78, least(98, v_grade));
    v_ovr := 99;
    for i in 2..15 loop
      if v_grade <= v_anchor_grades[i] then
        v_ovr := round(v_anchor_ovrs[i - 1]
          + (v_anchor_ovrs[i] - v_anchor_ovrs[i - 1])
            * (v_grade - v_anchor_grades[i - 1])
            / greatest(1, v_anchor_grades[i] - v_anchor_grades[i - 1]));
        exit;
      end if;
    end loop;
    v_ovr_total := v_ovr_total + v_ovr;
    v_resume_total := v_resume_total + v_resume;
  end loop;
  v_ranked_roster := round(v_ovr_total / 3, 1);
  v_resume_score := round(v_resume_total / 3, 1);
  return round(v_ranked_roster * 0.90 + v_resume_score * 0.10, 1);
end;
$$;

revoke all on function private.football_weekly_gm_verified_score(jsonb)
  from public, anon, authenticated;

create or replace function public.save_my_football_weekly_gm(
  p_scenario text, p_seed text, p_state jsonb,
  p_completed boolean default false, p_score numeric default null
)
returns boolean
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_attempt private.football_weekly_gm_attempts%rowtype;
  v_event private.football_weekly_gm_events%rowtype;
  v_spin integer;
  v_previous_spin integer;
  v_verified_score numeric;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') or p_scenario is null then raise exception 'invalid Weekly GM scenario'; end if;
  select * into v_attempt from private.football_weekly_gm_attempts
    where profile_id=v_profile and scenario=p_scenario and seed=p_seed
    for update;
  if not found then raise exception 'Official attempt not started or seed mismatch'; end if;
  select * into v_event from private.football_weekly_gm_events where week_start=v_attempt.week_start;
  if now() < v_event.opens_at or now() >= v_event.closes_at then raise exception 'Weekly GM entry window closed'; end if;
  if v_attempt.completed_at is not null then return true; end if;
  if p_state is null or jsonb_typeof(p_state)<>'object'
    or octet_length(p_state::text)>750000 then raise exception 'invalid GM state'; end if;
  if p_state->>'seed' is distinct from v_attempt.seed then raise exception 'GM seed mismatch'; end if;
  if p_state->>'version' <> 'football-gm-v11-seeded-development' then raise exception 'GM game version mismatch'; end if;
  if p_state->>'phase' not in ('draft','year1','offseason','years23','final') then raise exception 'Invalid GM phase'; end if;
  if (p_state->>'spinIndex') !~ '^[0-9]+$' then raise exception 'invalid spin count'; end if;
  v_spin := (p_state->>'spinIndex')::integer;
  v_previous_spin := coalesce((v_attempt.state->>'spinIndex')::integer,1);
  if v_attempt.state is null and (
       v_spin <> 1 or p_state->>'phase'<>'draft'
       or jsonb_typeof(p_state->'roster')<>'array'
       or jsonb_array_length(p_state->'roster')<>1
       or p_state->'roster'->0->>'playerId' is distinct from
          case when p_scenario='elite' then 'BUF|QB|joshallen' else 'NYG|QB|jaxsondart' end
     ) then raise exception 'Official draft must begin with the assigned quarterback'; end if;
  if v_spin < v_previous_spin or v_spin < 1 or v_spin > 7 then raise exception 'Official wheel progress cannot rewind'; end if;
  if p_completed then
    if p_state->>'phase'<>'final' or v_spin<>7
      or jsonb_typeof(p_state->'roster')<>'array'
      or jsonb_typeof(p_state->'finalRoster')<>'array'
      or jsonb_typeof(p_state->'resolvedSeasons')<>'array'
      or jsonb_array_length(p_state->'roster')<>7
      or jsonb_array_length(p_state->'finalRoster')<>7
      or jsonb_array_length(p_state->'resolvedSeasons')<>3
      or p_score is null or p_score<0 or p_score>100 then
      raise exception 'Incomplete official GM result';
    end if;
  elsif p_score is not null or p_state->>'phase'='final' then
    raise exception 'Official result must be finalized together';
  end if;
  if p_completed then
    -- The client may display a score, but only our own 90/10 calculation
    -- from the saved season payload is ever accepted for official ranking.
    v_verified_score := private.football_weekly_gm_verified_score(p_state);
    if round(p_score, 1) is distinct from v_verified_score then
      raise exception 'GM score failed server verification (expected %, received %)',
        v_verified_score, p_score;
    end if;
  end if;
  update private.football_weekly_gm_attempts
  set state=p_state, updated_at=now(),
      score=case when p_completed then v_verified_score else null end,
      completed_at=case when p_completed then now() else null end
  where week_start=v_attempt.week_start and profile_id=v_profile and scenario=p_scenario;
  return true;
end;
$$;
