-- Permanently feature standard Weekly NFL GM; never revert to an Auction on Tuesday.
-- Existing completed Auction and themed GM weeks remain immutable and browseable.
-- Keep the Tuesday-to-Tuesday official GM championship alive indefinitely.
-- The authenticated GM read/start RPCs call this idempotent private helper.
create or replace function private.ensure_current_football_weekly_gm(p_at timestamptz default now())
returns date
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_today date := (p_at at time zone 'America/Chicago')::date;
  v_week_start date;
begin
  -- Do not alter any original special-format championship or Nov 3 attempts.
  if v_today < date '2026-11-10' then return null; end if;
  v_week_start := date '2026-11-10' + ((v_today - date '2026-11-10') / 7) * 7;
  insert into private.football_weekly_gm_events (week_start, opens_at, closes_at, subject_key)
  values (
    v_week_start,
    v_week_start::timestamp at time zone 'America/Chicago',
    (v_week_start + 7)::timestamp at time zone 'America/Chicago',
    'nfl-gm-championship'
  )
  on conflict (week_start) do nothing;
  return v_week_start;
end;
$$;
revoke all on function private.ensure_current_football_weekly_gm(timestamptz) from public, anon, authenticated;

-- A new competition is materialized on the first authenticated read/start each week.
CREATE OR REPLACE FUNCTION public.get_my_football_weekly_gm()
 RETURNS jsonb
 LANGUAGE plpgsql
 VOLATILE SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.ensure_current_football_weekly_gm();
  select * into v_event from private.football_weekly_gm_events
  where subject_key = 'nfl-gm-championship' and opens_at <= now()
  order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not configured'; end if;
  return jsonb_build_object(
    'week_start', v_event.week_start,
    'opens_at', v_event.opens_at,
    'closes_at', v_event.closes_at,
    'status', case when now() < v_event.opens_at then 'upcoming'
               when now() >= v_event.closes_at then 'closed' else 'active' end,
    'attempts', coalesce((
      select jsonb_object_agg(attempt.scenario, jsonb_build_object(
        'seed',attempt.seed,'state',attempt.state,
        'starting_player_id',attempt.starting_player_id,
        'completed',attempt.completed_at is not null,'score',attempt.score
      ))
      from private.football_weekly_gm_attempts attempt
      where attempt.week_start=v_event.week_start and attempt.profile_id=v_profile
    ), '{}'::jsonb),
    'leaderboard', coalesce((
      select jsonb_agg(jsonb_build_object(
        'profile_id', ranked.profile_id, 'display_name',ranked.display_name,
        'elite_score',ranked.elite_score,'young_score',ranked.young_score,
        'total_score',ranked.total_score,'completed_runs',ranked.completed_runs,
        'rank',ranked.rank
      ) order by ranked.rank,ranked.display_name)
      from (
        select rank() over (order by scores.total_score desc)::integer as rank,
          scores.profile_id,profile.display_name,scores.elite_score,scores.young_score,
          scores.total_score,scores.completed_runs
        from (
          select attempt.profile_id,
            max(attempt.score) filter (where attempt.scenario='elite') as elite_score,
            max(attempt.score) filter (where attempt.scenario='young') as young_score,
            sum(attempt.score)::numeric as total_score,
            count(*)::integer as completed_runs
          from private.football_weekly_gm_attempts attempt
          where attempt.week_start=v_event.week_start and attempt.completed_at is not null
          group by attempt.profile_id
        ) scores
        join public.profiles profile on profile.id=scores.profile_id
        where not private.football_weekly_auction_is_reserved_test_profile(scores.profile_id)
      ) ranked
    ),'[]'::jsonb)
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.start_my_football_weekly_gm(p_scenario text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_profile uuid := auth.uid();
  v_event private.football_weekly_gm_events%rowtype;
  v_attempt private.football_weekly_gm_attempts%rowtype;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  perform private.ensure_current_football_weekly_gm();
  if p_scenario not in ('elite','young') or p_scenario is null then
    raise exception 'invalid Weekly GM scenario';
  end if;
  select * into v_event from private.football_weekly_gm_events
    where subject_key='nfl-gm-championship'
      and opens_at <= now() and closes_at > now()
    order by week_start desc limit 1;
  if not found then raise exception 'Weekly GM is not open'; end if;
  if v_event.week_start = date '2026-10-27' then
    raise exception 'Choose your featured receiver or running back before starting';
  end if;
  insert into private.football_weekly_gm_attempts (week_start,profile_id,scenario,seed)
  values (v_event.week_start,v_profile,p_scenario,
    'weekly-gm:'||v_event.week_start::text||':'||p_scenario||':'||gen_random_uuid()::text||':gmdev1')
  on conflict (week_start,profile_id,scenario) do nothing;
  select * into v_attempt from private.football_weekly_gm_attempts
    where week_start=v_event.week_start and profile_id=v_profile and scenario=p_scenario;
  return jsonb_build_object(
    'seed',v_attempt.seed,'state',v_attempt.state,
    'completed',v_attempt.completed_at is not null,'score',v_attempt.score
  );
end;
$function$;

-- Apply the Nov 3 standard empty-roster/seven-pick validation to every later week.
CREATE OR REPLACE FUNCTION public.save_my_football_weekly_gm(p_scenario text, p_seed text, p_state jsonb, p_completed boolean DEFAULT false, p_score numeric DEFAULT NULL::numeric)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  v_previous_spin := coalesce((v_attempt.state->>'spinIndex')::integer,
    case when v_attempt.week_start >= date '2026-11-03' then 0 else 1 end);
  if v_attempt.state is null and v_attempt.week_start < date '2026-10-27' and (
       v_spin <> 1 or p_state->>'phase'<>'draft'
       or jsonb_typeof(p_state->'roster')<>'array'
       or jsonb_array_length(p_state->'roster')<>1
       or p_state->'roster'->0->>'playerId' is distinct from
          case
            when v_attempt.week_start = date '2026-10-20'
              then case when p_scenario='elite' then 'DAL|QB|dakprescott' else 'ATL|QB|michaelpenix' end
            else case when p_scenario='elite' then 'BUF|QB|joshallen' else 'NYG|QB|jaxsondart' end
          end
     ) then raise exception 'Official draft must begin with the assigned quarterback'; end if;
  -- The selected franchise cornerstone is recorded on the private attempt.
  -- Do not accept an arbitrary starter or allow one to disappear from Year 1.
  if v_attempt.week_start = date '2026-10-27' then
    if v_attempt.starting_player_id is null
       or jsonb_typeof(p_state->'roster') is distinct from 'array' then
      raise exception 'Official franchise player is missing';
    end if;
    if not exists (
      select 1 from jsonb_array_elements(p_state->'roster') as item(value)
      where item.value->>'playerId' = v_attempt.starting_player_id
    ) then raise exception 'Official franchise cornerstone cannot be replaced in Year 1'; end if;
    if v_attempt.state is null and (
       v_spin <> 1 or p_state->>'phase' <> 'draft'
       or jsonb_array_length(p_state->'roster') <> 1
       or p_state->'roster'->0->>'playerId' is distinct from v_attempt.starting_player_id
       or p_state->'roster'->0->>'slot' is distinct from
          case when p_scenario = 'elite' then 'WR' else 'RB' end
       or p_state->'roster'->0->>'acquired' is distinct from 'draft'
    ) then raise exception 'Official draft must begin with your chosen player'; end if;
  end if;
  -- Standard GM from November 3 onward: seven independent wheel picks and no starter.
  -- Prevent historic special starters from leaking into any future standard week.
  if v_attempt.week_start >= date '2026-11-03' then
    if v_attempt.starting_player_id is not null
       or jsonb_typeof(p_state->'roster') is distinct from 'array'
       or jsonb_array_length(p_state->'roster') <> v_spin then
      raise exception 'Standard GM must draft all seven wheel picks';
    end if;
    if v_attempt.state is null and (
      v_spin <> 0 or p_state->>'phase' <> 'draft'
      or jsonb_array_length(p_state->'roster') <> 0
    ) then
      raise exception 'Standard Weekly GM must begin with an empty roster';
    end if;
  end if;
  if v_spin < v_previous_spin
     or v_spin < (case when v_attempt.week_start >= date '2026-11-03' then 0 else 1 end)
     or v_spin > 7 then raise exception 'Official wheel progress cannot rewind'; end if;
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
$function$;

-- An Auction bid must never be a prerequisite to Football Daily again.
CREATE OR REPLACE FUNCTION public.football_weekly_auction_daily_gate(p_profile_id uuid, p_at timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_week_start date;
  v_day integer;
  v_subject text;
  v_required boolean;
  v_field_locked boolean;
  v_capacity integer:=null;
  v_field_size integer:=null;
begin
  if p_profile_id is null then raise exception 'profile required'; end if;

  -- A standard GM featured week must not expose Auction or block Football Daily.
  if (p_at at time zone 'America/Chicago')::date >= date '2026-11-03' then
    return jsonb_build_object('required', false, 'available', false,
      'featured_challenge', 'nfl-gm',
      'week_start', date '2026-11-03' +
        (((p_at at time zone 'America/Chicago')::date - date '2026-11-03') / 7) * 7);
  end if;

  if ((p_at at time zone 'America/Chicago')::date >= date '2026-10-13'
      and (p_at at time zone 'America/Chicago')::date < date '2026-10-20')
     or ((p_at at time zone 'America/Chicago')::date >= date '2026-10-27'
      and (p_at at time zone 'America/Chicago')::date < date '2026-11-03') then
    return jsonb_build_object(
      'required',false,'available',false,
      'featured_challenge','nfl-gm',
      'week_start',case when (p_at at time zone 'America/Chicago')::date >= date '2026-10-27'
                         then date '2026-10-27'
                         else date '2026-10-13' end
    );
  end if;

  if (p_at at time zone 'America/Chicago')::date<date '2026-09-15' then
    return jsonb_build_object('required',false,'available',false);
  end if;

  perform private.maintain_football_weekly_auction(p_at);
  v_week_start:=private.football_weekly_auction_week_start(p_at);
  v_day:=private.football_weekly_auction_day_index(p_at,v_week_start);
  perform private.ensure_football_weekly_auction_participant(v_week_start,p_profile_id,p_at);

  select field_locked_at is not null,subject_key
  into v_field_locked,v_subject
  from private.football_weekly_auction_weeks
  where week_start=v_week_start;

  if v_subject='cfb-superteam' then
    v_capacity:=private.football_weekly_superteam_join_capacity(v_week_start,p_at);
    select count(*)::integer into v_field_size
    from private.football_weekly_auction_participants
    where week_start=v_week_start;
  end if;

  if not exists(
    select 1 from private.football_weekly_auction_participants
    where week_start=v_week_start and profile_id=p_profile_id
  ) then
    return jsonb_build_object(
      'required',false,'available',false,'field_locked',v_field_locked,
      'capacity_reached',coalesce(v_capacity is not null and v_field_size>=v_capacity,false),
      'week_start',v_week_start,'day_index',v_day,'eligible_week_start',v_week_start+7
    );
  end if;

  if v_subject='nfl-best-team-seasons-since-2000' and v_day>=7 then
    select not exists(
      select 1
      from private.football_weekly_nfl_team_season_wildcard_submissions
      where week_start=v_week_start and profile_id=p_profile_id
    ) into v_required;
  else
    select not exists(
      select 1 from private.football_weekly_auction_daily_entries
      where week_start=v_week_start and day_index=v_day and profile_id=p_profile_id
    ) into v_required;
  end if;

  return jsonb_build_object(
    'required',v_required,'available',true,'field_locked',v_field_locked,
    'week_start',v_week_start,'day_index',least(greatest(v_day,1),7)
  );
end;
$function$;

revoke all on function public.get_my_football_weekly_gm() from public, anon;
revoke all on function public.start_my_football_weekly_gm(text) from public, anon;
grant execute on function public.get_my_football_weekly_gm() to authenticated;
grant execute on function public.start_my_football_weekly_gm(text) to authenticated;
notify pgrst, 'reload schema';
