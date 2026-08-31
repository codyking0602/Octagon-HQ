-- Football Futures stay inside the canonical Picks/Supabase ownership path.
-- They are a separate 62-point season bonus: 30 CFB + 32 NFL.

create table if not exists public.football_futures_seasons (
  season smallint primary key,
  lock_at timestamptz not null,
  results jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint football_futures_season_range check (season between 1993 and 2200)
);

create table if not exists public.profile_football_futures (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season smallint not null references public.football_futures_seasons(season) on delete cascade,
  picks jsonb not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, season)
);

alter table public.football_futures_seasons enable row level security;
alter table public.profile_football_futures enable row level security;
revoke all on table public.football_futures_seasons from public, anon, authenticated;
revoke all on table public.profile_football_futures from public, anon, authenticated;

-- Friday, September 4 at 11:59 PM Eastern (EDT) for the 2026 season.
insert into public.football_futures_seasons(season, lock_at)
values (2026, '2026-09-05T03:59:00Z'::timestamptz)
on conflict (season) do update set lock_at = excluded.lock_at, updated_at = now();

create or replace function private.normalize_football_futures_picks(p_picks jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_acc text;
  v_big_ten text;
  v_big_12 text;
  v_sec text;
  v_cfb_playoff jsonb;
  v_cfb_heisman text;
  v_cfb_champion text;
  v_nfl_playoff jsonb;
  v_nfl_title_game jsonb;
  v_nfl_mvp text;
  v_super_bowl text;
  v_count integer;
begin
  if jsonb_typeof(coalesce(p_picks, '{}'::jsonb)) <> 'object' then
    raise exception 'football futures picks must be an object';
  end if;

  v_acc := public.slugify_pick_text(p_picks #>> '{cfb_power4_champions,acc}');
  v_big_ten := public.slugify_pick_text(p_picks #>> '{cfb_power4_champions,big_ten}');
  v_big_12 := public.slugify_pick_text(p_picks #>> '{cfb_power4_champions,big_12}');
  v_sec := public.slugify_pick_text(p_picks #>> '{cfb_power4_champions,sec}');
  if nullif(v_acc, '') is null or nullif(v_big_ten, '') is null
    or nullif(v_big_12, '') is null or nullif(v_sec, '') is null then
    raise exception 'pick all four Power 4 conference champions';
  end if;
  select count(distinct value) into v_count from unnest(array[v_acc, v_big_ten, v_big_12, v_sec]) value;
  if v_count <> 4 then raise exception 'Power 4 conference champion picks must be unique'; end if;

  if jsonb_typeof(coalesce(p_picks->'cfb_playoff_teams', 'null'::jsonb)) <> 'array'
    or jsonb_array_length(p_picks->'cfb_playoff_teams') <> 12 then
    raise exception 'pick exactly 12 CFP teams';
  end if;
  select jsonb_agg(public.slugify_pick_text(value) order by ordinality), count(distinct public.slugify_pick_text(value))
  into v_cfb_playoff, v_count
  from jsonb_array_elements_text(p_picks->'cfb_playoff_teams') with ordinality as team(value, ordinality);
  if v_count <> 12 or exists (
    select 1 from jsonb_array_elements_text(v_cfb_playoff) team(value) where nullif(value, '') is null
  ) then raise exception 'CFP team picks must be 12 unique teams'; end if;

  v_cfb_heisman := nullif(trim(p_picks->>'cfb_heisman'), '');
  v_cfb_champion := public.slugify_pick_text(p_picks->>'cfb_national_champion');
  if v_cfb_heisman is null then raise exception 'pick a Heisman winner'; end if;
  if nullif(v_cfb_champion, '') is null then raise exception 'pick a national champion'; end if;
  if not (v_cfb_playoff ? v_cfb_champion) then
    raise exception 'CFB national champion must be one of your 12 CFP teams';
  end if;

  if jsonb_typeof(coalesce(p_picks->'nfl_playoff_teams', 'null'::jsonb)) <> 'array'
    or jsonb_array_length(p_picks->'nfl_playoff_teams') <> 14 then
    raise exception 'pick exactly 14 NFL playoff teams';
  end if;
  select jsonb_agg(public.slugify_pick_text(value) order by ordinality), count(distinct public.slugify_pick_text(value))
  into v_nfl_playoff, v_count
  from jsonb_array_elements_text(p_picks->'nfl_playoff_teams') with ordinality as team(value, ordinality);
  if v_count <> 14 or exists (
    select 1 from jsonb_array_elements_text(v_nfl_playoff) team(value) where nullif(value, '') is null
  ) then raise exception 'NFL playoff picks must be 14 unique teams'; end if;

  if jsonb_typeof(coalesce(p_picks->'nfl_conference_championship_teams', 'null'::jsonb)) <> 'array'
    or jsonb_array_length(p_picks->'nfl_conference_championship_teams') <> 4 then
    raise exception 'pick exactly four NFL conference championship teams';
  end if;
  select jsonb_agg(public.slugify_pick_text(value) order by ordinality), count(distinct public.slugify_pick_text(value))
  into v_nfl_title_game, v_count
  from jsonb_array_elements_text(p_picks->'nfl_conference_championship_teams') with ordinality as team(value, ordinality);
  if v_count <> 4 or exists (
    select 1 from jsonb_array_elements_text(v_nfl_title_game) team(value) where nullif(value, '') is null
  ) then raise exception 'conference championship picks must be four unique teams'; end if;
  if exists (
    select 1 from jsonb_array_elements_text(v_nfl_title_game) team(value)
    where not (v_nfl_playoff ? value)
  ) then raise exception 'conference championship teams must be in your 14-team NFL playoff field'; end if;

  v_nfl_mvp := nullif(trim(p_picks->>'nfl_mvp'), '');
  v_super_bowl := public.slugify_pick_text(p_picks->>'nfl_super_bowl_champion');
  if v_nfl_mvp is null then raise exception 'pick an AP NFL MVP'; end if;
  if nullif(v_super_bowl, '') is null then raise exception 'pick a Super Bowl champion'; end if;
  if not (v_nfl_title_game ? v_super_bowl) then
    raise exception 'Super Bowl champion must be one of your four conference championship teams';
  end if;

  return jsonb_build_object(
    'cfb_power4_champions', jsonb_build_object('acc', v_acc, 'big_ten', v_big_ten, 'big_12', v_big_12, 'sec', v_sec),
    'cfb_playoff_teams', v_cfb_playoff,
    'cfb_heisman', v_cfb_heisman,
    'cfb_national_champion', v_cfb_champion,
    'nfl_playoff_teams', v_nfl_playoff,
    'nfl_conference_championship_teams', v_nfl_title_game,
    'nfl_mvp', v_nfl_mvp,
    'nfl_super_bowl_champion', v_super_bowl
  );
end;
$$;
revoke all on function private.normalize_football_futures_picks(jsonb) from public, anon, authenticated;

create or replace function private.normalize_football_futures_results(p_results jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_cfb jsonb := '{}'::jsonb;
  v_cfb_playoff jsonb := '[]'::jsonb;
  v_nfl_playoff jsonb := '[]'::jsonb;
  v_nfl_title_game jsonb := '[]'::jsonb;
  v_value text;
  v_count integer;
begin
  if jsonb_typeof(coalesce(p_results, '{}'::jsonb)) <> 'object' then
    raise exception 'football futures results must be an object';
  end if;

  v_cfb := jsonb_build_object(
    'acc', nullif(public.slugify_pick_text(p_results #>> '{cfb_power4_champions,acc}'), ''),
    'big_ten', nullif(public.slugify_pick_text(p_results #>> '{cfb_power4_champions,big_ten}'), ''),
    'big_12', nullif(public.slugify_pick_text(p_results #>> '{cfb_power4_champions,big_12}'), ''),
    'sec', nullif(public.slugify_pick_text(p_results #>> '{cfb_power4_champions,sec}'), '')
  );

  if jsonb_typeof(coalesce(p_results->'cfb_playoff_teams', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_results->'cfb_playoff_teams', '[]'::jsonb)) > 12 then
    raise exception 'CFP results may contain at most 12 teams';
  end if;
  select coalesce(jsonb_agg(public.slugify_pick_text(value) order by ordinality), '[]'::jsonb),
    count(distinct public.slugify_pick_text(value))
  into v_cfb_playoff, v_count
  from jsonb_array_elements_text(coalesce(p_results->'cfb_playoff_teams', '[]'::jsonb)) with ordinality as team(value, ordinality);
  if v_count <> jsonb_array_length(v_cfb_playoff) then raise exception 'CFP results must be unique'; end if;

  if jsonb_typeof(coalesce(p_results->'nfl_playoff_teams', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_results->'nfl_playoff_teams', '[]'::jsonb)) > 14 then
    raise exception 'NFL playoff results may contain at most 14 teams';
  end if;
  select coalesce(jsonb_agg(public.slugify_pick_text(value) order by ordinality), '[]'::jsonb),
    count(distinct public.slugify_pick_text(value))
  into v_nfl_playoff, v_count
  from jsonb_array_elements_text(coalesce(p_results->'nfl_playoff_teams', '[]'::jsonb)) with ordinality as team(value, ordinality);
  if v_count <> jsonb_array_length(v_nfl_playoff) then raise exception 'NFL playoff results must be unique'; end if;

  if jsonb_typeof(coalesce(p_results->'nfl_conference_championship_teams', '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_results->'nfl_conference_championship_teams', '[]'::jsonb)) > 4 then
    raise exception 'conference championship results may contain at most four teams';
  end if;
  select coalesce(jsonb_agg(public.slugify_pick_text(value) order by ordinality), '[]'::jsonb),
    count(distinct public.slugify_pick_text(value))
  into v_nfl_title_game, v_count
  from jsonb_array_elements_text(coalesce(p_results->'nfl_conference_championship_teams', '[]'::jsonb)) with ordinality as team(value, ordinality);
  if v_count <> jsonb_array_length(v_nfl_title_game) then raise exception 'conference championship results must be unique'; end if;

  return jsonb_build_object(
    'cfb_power4_champions', v_cfb,
    'cfb_playoff_teams', v_cfb_playoff,
    'cfb_heisman', nullif(trim(p_results->>'cfb_heisman'), ''),
    'cfb_national_champion', nullif(public.slugify_pick_text(p_results->>'cfb_national_champion'), ''),
    'nfl_playoff_teams', v_nfl_playoff,
    'nfl_conference_championship_teams', v_nfl_title_game,
    'nfl_mvp', nullif(trim(p_results->>'nfl_mvp'), ''),
    'nfl_super_bowl_champion', nullif(public.slugify_pick_text(p_results->>'nfl_super_bowl_champion'), '')
  );
end;
$$;
revoke all on function private.normalize_football_futures_results(jsonb) from public, anon, authenticated;

create or replace function public.football_futures_points_for(p_picks jsonb, p_results jsonb)
returns integer
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_points integer := 0;
  v_matches integer := 0;
  v_conference text;
begin
  if p_picks is null then return 0; end if;

  foreach v_conference in array array['acc','big_ten','big_12','sec'] loop
    if nullif(p_results #>> array['cfb_power4_champions', v_conference], '') is not null
      and p_picks #>> array['cfb_power4_champions', v_conference]
        = p_results #>> array['cfb_power4_champions', v_conference] then
      v_points := v_points + 2;
    end if;
  end loop;

  select count(*) into v_matches
  from (select distinct value from jsonb_array_elements_text(coalesce(p_picks->'cfb_playoff_teams', '[]'::jsonb))) picked
  join (select distinct value from jsonb_array_elements_text(coalesce(p_results->'cfb_playoff_teams', '[]'::jsonb))) actual using (value);
  v_points := v_points + v_matches;

  if nullif(trim(p_results->>'cfb_heisman'), '') is not null
    and lower(trim(p_picks->>'cfb_heisman')) = lower(trim(p_results->>'cfb_heisman')) then v_points := v_points + 3; end if;
  if nullif(p_results->>'cfb_national_champion', '') is not null
    and p_picks->>'cfb_national_champion' = p_results->>'cfb_national_champion' then v_points := v_points + 7; end if;

  select count(*) into v_matches
  from (select distinct value from jsonb_array_elements_text(coalesce(p_picks->'nfl_playoff_teams', '[]'::jsonb))) picked
  join (select distinct value from jsonb_array_elements_text(coalesce(p_results->'nfl_playoff_teams', '[]'::jsonb))) actual using (value);
  v_points := v_points + v_matches;

  select count(*) into v_matches
  from (select distinct value from jsonb_array_elements_text(coalesce(p_picks->'nfl_conference_championship_teams', '[]'::jsonb))) picked
  join (select distinct value from jsonb_array_elements_text(coalesce(p_results->'nfl_conference_championship_teams', '[]'::jsonb))) actual using (value);
  v_points := v_points + (v_matches * 2);

  if nullif(trim(p_results->>'nfl_mvp'), '') is not null
    and lower(trim(p_picks->>'nfl_mvp')) = lower(trim(p_results->>'nfl_mvp')) then v_points := v_points + 3; end if;
  if nullif(p_results->>'nfl_super_bowl_champion', '') is not null
    and p_picks->>'nfl_super_bowl_champion' = p_results->>'nfl_super_bowl_champion' then v_points := v_points + 7; end if;

  return v_points;
end;
$$;
revoke all on function public.football_futures_points_for(jsonb,jsonb) from public, anon, authenticated;

create or replace function public.football_futures_profile_points(p_profile_id uuid, p_season integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.football_futures_points_for(entry.picks, season.results), 0)
  from public.football_futures_seasons season
  left join public.profile_football_futures entry
    on entry.season = season.season and entry.profile_id = p_profile_id
  where season.season = p_season;
$$;
revoke all on function public.football_futures_profile_points(uuid,integer) from public, anon, authenticated;
grant execute on function public.football_futures_profile_points(uuid,integer) to service_role;

create or replace function public.get_football_futures_state(p_season integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_config public.football_futures_seasons;
  v_own jsonb;
  v_group jsonb := '[]'::jsonb;
  v_teams jsonb := '[]'::jsonb;
begin
  if v_profile_id is null or not exists (select 1 from public.profiles where id = v_profile_id) then
    raise exception 'sign in required';
  end if;
  select * into v_config from public.football_futures_seasons where season = p_season;
  if not found then raise exception 'football futures are not configured for this season'; end if;

  select entry.picks into v_own from public.profile_football_futures entry
  where entry.profile_id = v_profile_id and entry.season = p_season;

  if now() >= v_config.lock_at then
    select coalesce(jsonb_agg(jsonb_build_object(
      'display_name', profile.display_name,
      'is_current_user', profile.id = v_profile_id,
      'picks', entry.picks,
      'points', coalesce(public.football_futures_points_for(entry.picks, v_config.results), 0)
    ) order by profile.display_name), '[]'::jsonb)
    into v_group
    from public.profiles profile
    left join public.profile_football_futures entry
      on entry.profile_id = profile.id and entry.season = p_season;
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'slug', asset.team_slug,
    'name', asset.team_name,
    'league', asset.league,
    'logo_url', asset.logo_url
  ) order by asset.league, asset.team_name), '[]'::jsonb)
  into v_teams
  from public.football_team_assets asset;

  return jsonb_build_object(
    'season', p_season,
    'lock_at', v_config.lock_at,
    'is_locked', now() >= v_config.lock_at,
    'own_picks', v_own,
    'points', coalesce(public.football_futures_points_for(v_own, v_config.results), 0),
    'group_entries', v_group,
    'team_options', v_teams
  );
end;
$$;
revoke all on function public.get_football_futures_state(integer) from public, anon;
grant execute on function public.get_football_futures_state(integer) to authenticated;

create or replace function public.save_football_futures(p_season integer, p_picks jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_lock_at timestamptz;
  v_picks jsonb;
begin
  if v_profile_id is null or not exists (select 1 from public.profiles where id = v_profile_id) then
    raise exception 'sign in required';
  end if;
  select lock_at into v_lock_at from public.football_futures_seasons where season = p_season;
  if not found then raise exception 'football futures are not configured for this season'; end if;
  if now() >= v_lock_at then raise exception 'football futures are locked'; end if;

  v_picks := private.normalize_football_futures_picks(p_picks);
  insert into public.profile_football_futures(profile_id, season, picks, submitted_at, updated_at)
  values (v_profile_id, p_season, v_picks, now(), now())
  on conflict (profile_id, season) do update
  set picks = excluded.picks, updated_at = now();

  return public.get_football_futures_state(p_season);
end;
$$;
revoke all on function public.save_football_futures(integer,jsonb) from public, anon;
grant execute on function public.save_football_futures(integer,jsonb) to authenticated;

create or replace function public.set_football_futures_results(p_season integer, p_results jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_results jsonb;
begin
  if auth.role() is distinct from 'service_role' then raise exception 'service role required'; end if;
  if not exists (select 1 from public.football_futures_seasons where season = p_season) then
    raise exception 'football futures are not configured for this season';
  end if;
  v_results := private.normalize_football_futures_results(p_results);
  update public.football_futures_seasons set results = v_results, updated_at = now() where season = p_season;
  return v_results;
end;
$$;
revoke all on function public.set_football_futures_results(integer,jsonb) from public, anon, authenticated;
grant execute on function public.set_football_futures_results(integer,jsonb) to service_role;

-- Keep the existing Football season-history owner, then add Futures after the
-- automatic lowest-week drop. Futures are never eligible to become the drop week.
create or replace function public.get_my_pick_history(
  p_season integer default null,
  p_sport text default 'mma'
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_history jsonb;
  v_events jsonb;
  v_standings jsonb;
  v_summary jsonb;
  v_effective_season integer := coalesce(p_season, extract(year from now())::integer);
  v_my_futures integer := 0;
begin
  if p_sport not in ('mma','football') then raise exception 'unsupported Picks sport'; end if;
  v_history := private.get_my_pick_history_core(p_season,p_sport);
  select coalesce(jsonb_agg(
    item.value || jsonb_build_object(
      'watch_moments',case when p_sport = 'mma' then coalesce(event.watch_moments,'[]'::jsonb) else '[]'::jsonb end,
      'header_storage_path',event.header_storage_path,'header_natural_width',event.header_natural_width,
      'header_natural_height',event.header_natural_height
    ) order by item.ordinality
  ),'[]'::jsonb)
  into v_events
  from jsonb_array_elements(coalesce(v_history->'events','[]'::jsonb)) with ordinality as item(value,ordinality)
  left join public.pick_events event on event.event_id = item.value->>'event_id';
  v_history := jsonb_set(v_history,'{events}',v_events,true);

  if p_sport = 'football' and exists (
    select 1 from public.football_futures_seasons where season = v_effective_season
  ) then
    with standing as (
      select item.value,
        coalesce(public.football_futures_profile_points((item.value->>'profile_id')::uuid, v_effective_season),0) futures_points,
        coalesce((item.value->>'adjusted_points')::numeric, (item.value->>'total_points')::numeric, 0) weekly_adjusted,
        coalesce((item.value->>'total_points')::numeric,0) weekly_raw
      from jsonb_array_elements(coalesce(v_history->'season_standings','[]'::jsonb)) item(value)
    ), scored as (
      select *, weekly_adjusted + futures_points championship_points, weekly_raw + futures_points raw_with_futures
      from standing
    ), ranked as (
      select *, rank() over (order by championship_points desc)::integer new_rank from scored
    )
    select coalesce(jsonb_agg(
      value || jsonb_build_object(
        'rank', new_rank,
        'futures_points', futures_points,
        'total_points', raw_with_futures,
        'adjusted_points', championship_points
      ) order by new_rank, value->>'display_name'
    ), '[]'::jsonb)
    into v_standings from ranked;
    v_history := jsonb_set(v_history,'{season_standings}',v_standings,true);

    v_my_futures := coalesce(public.football_futures_profile_points(auth.uid(), v_effective_season),0);
    v_summary := coalesce(v_history->'summary','{}'::jsonb) || jsonb_build_object(
      'futures_points', v_my_futures,
      'total_points', coalesce((v_history #>> '{summary,total_points}')::numeric,0) + v_my_futures
    );
    v_history := jsonb_set(v_history,'{summary}',v_summary,true);
  end if;

  return v_history;
end;
$$;
revoke all on function public.get_my_pick_history(integer,text) from public, anon;
grant execute on function public.get_my_pick_history(integer,text) to authenticated, service_role;

notify pgrst, 'reload schema';
