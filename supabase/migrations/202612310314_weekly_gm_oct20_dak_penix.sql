-- October 20–26, 2026 Weekly NFL GM: Dak Prescott vs Michael Penix Jr.
-- Only create the previously empty new event; never alter October 13 attempts,
-- standings, scores, or isolated owner preview.
do $gm_oct20_guard$
begin
  if exists (select 1 from private.football_weekly_gm_attempts
    where week_start=date '2026-10-20') then
    raise exception 'October 20 Weekly GM has already been played: refuse QB changes';
  end if;
end;
$gm_oct20_guard$;

insert into private.football_weekly_gm_events (week_start, opens_at, closes_at, subject_key)
values (
  date '2026-10-20',
  '2026-10-20 00:00:00 America/Chicago'::timestamptz,
  '2026-10-27 00:00:00 America/Chicago'::timestamptz,
  'nfl-gm-championship'
)
on conflict (week_start) do nothing;

-- Initial-assigned-QB enforcement now uses the attempt's historical event week.
-- All existing anti-reroll, completion, and server-score integrity checks remain.
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
          case
            when v_attempt.week_start=date '2026-10-20' and p_scenario='elite' then 'DAL|QB|dakprescott'
            when v_attempt.week_start=date '2026-10-20' and p_scenario='young' then 'ATL|QB|michaelpenix'
            when p_scenario='elite' then 'BUF|QB|joshallen'
            else 'NYG|QB|jaxsondart'
          end
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

-- Result drilldown must never return LAST week's score for a current-week row.
create or replace function public.get_football_weekly_gm_result(
  p_scenario text, p_profile_id uuid default null
)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_profile uuid := coalesce(p_profile_id,auth.uid());
  v_result jsonb;
begin
  if v_viewer is null then raise exception 'sign in required'; end if;
  if p_scenario not in ('elite','young') then
    raise exception 'invalid Weekly GM scenario';
  end if;
  select jsonb_build_object(
    'display_name',profile.display_name,'score',attempt.score,'state',attempt.state
  )
  into v_result
  from private.football_weekly_gm_attempts attempt
  join private.football_weekly_gm_events event on event.week_start=attempt.week_start
  join public.profiles profile on profile.id=attempt.profile_id
  where attempt.profile_id=v_profile and attempt.scenario=p_scenario
    and event.subject_key='nfl-gm-championship'
    and attempt.week_start=(
      select max(current_event.week_start) from private.football_weekly_gm_events current_event
      where current_event.subject_key='nfl-gm-championship'
    )
    and attempt.completed_at is not null
    and now()>=event.opens_at
  order by attempt.week_start desc limit 1;
  if v_result is null then raise exception 'This franchise result is not complete'; end if;
  return v_result;
end;
$$;

-- Grants on replaced functions remain as in the existing public API:
revoke all on function public.save_my_football_weekly_gm(text,text,jsonb,boolean,numeric) from public, anon;
revoke all on function public.get_football_weekly_gm_result(text,uuid) from public, anon;
grant execute on function public.save_my_football_weekly_gm(text,text,jsonb,boolean,numeric) to authenticated;
grant execute on function public.get_football_weekly_gm_result(text,uuid) to authenticated;
