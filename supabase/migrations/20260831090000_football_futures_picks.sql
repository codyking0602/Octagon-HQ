create table if not exists public.football_futures_picks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season smallint not null,
  picks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, season),
  constraint football_futures_season_range check (season between 1993 and 2200)
);

alter table public.football_futures_picks enable row level security;
revoke all on table public.football_futures_picks from anon, authenticated;

create or replace function public.football_futures_current_season()
returns integer
language sql
immutable
set search_path = ''
as $$ select 2026 $$;

create or replace function public.football_futures_lock_at()
returns timestamptz
language sql
immutable
set search_path = ''
as $$ select '2026-09-04 23:59:00 America/New_York'::timestamptz $$;

create or replace function public.validate_football_futures(p_picks jsonb)
returns void
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_key text;
  v_limit integer;
  v_value jsonb;
begin
  if p_picks is null or jsonb_typeof(p_picks) <> 'object' then
    raise exception 'football_futures_invalid_payload';
  end if;

  for v_key, v_limit in
    select * from (values
      ('cfbPower4Champions', 4),
      ('cfbPlayoffTeams', 12),
      ('cfbSemifinalists', 4),
      ('nflDivisionChampions', 8),
      ('nflPlayoffTeams', 14),
      ('nflConferenceChampionshipTeams', 4)
    ) limits(key, max_count)
  loop
    v_value := coalesce(p_picks -> v_key, '[]'::jsonb);
    if jsonb_typeof(v_value) <> 'array' or jsonb_array_length(v_value) > v_limit then
      raise exception 'football_futures_invalid_%', v_key;
    end if;
    if (
      select count(*)
      from jsonb_array_elements_text(v_value)
      where trim(value) <> ''
    ) <> (
      select count(distinct lower(trim(value)))
      from jsonb_array_elements_text(v_value)
      where trim(value) <> ''
    ) then
      raise exception 'football_futures_duplicate_%', v_key;
    end if;
  end loop;

  if exists (
    select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'cfbSemifinalists', '[]'::jsonb)) child
    where trim(child.value) <> '' and not exists (
      select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'cfbPlayoffTeams', '[]'::jsonb)) parent
      where lower(trim(parent.value)) = lower(trim(child.value))
    )
  ) then raise exception 'football_futures_cfb_semifinalist_not_in_playoff'; end if;

  if nullif(trim(p_picks ->> 'cfbNationalChampion'), '') is not null and not exists (
    select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'cfbSemifinalists', '[]'::jsonb)) item
    where lower(trim(item.value)) = lower(trim(p_picks ->> 'cfbNationalChampion'))
  ) then raise exception 'football_futures_cfb_champion_not_semifinalist'; end if;

  if exists (
    select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'nflDivisionChampions', '[]'::jsonb)) child
    where trim(child.value) <> '' and not exists (
      select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'nflPlayoffTeams', '[]'::jsonb)) parent
      where lower(trim(parent.value)) = lower(trim(child.value))
    )
  ) then raise exception 'football_futures_division_champion_not_in_playoffs'; end if;

  if exists (
    select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'nflConferenceChampionshipTeams', '[]'::jsonb)) child
    where trim(child.value) <> '' and not exists (
      select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'nflPlayoffTeams', '[]'::jsonb)) parent
      where lower(trim(parent.value)) = lower(trim(child.value))
    )
  ) then raise exception 'football_futures_conference_team_not_in_playoffs'; end if;

  if nullif(trim(p_picks ->> 'nflSuperBowlChampion'), '') is not null and not exists (
    select 1 from jsonb_array_elements_text(coalesce(p_picks -> 'nflConferenceChampionshipTeams', '[]'::jsonb)) item
    where lower(trim(item.value)) = lower(trim(p_picks ->> 'nflSuperBowlChampion'))
  ) then raise exception 'football_futures_super_bowl_champion_not_conference_team'; end if;
end;
$$;

create or replace function public.get_football_futures()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_season integer := public.football_futures_current_season();
  v_lock_at timestamptz := public.football_futures_lock_at();
  v_own jsonb;
  v_group jsonb := '[]'::jsonb;
begin
  if v_profile_id is null then raise exception 'sign in required'; end if;

  select row.picks into v_own
  from public.football_futures_picks row
  where row.profile_id = v_profile_id and row.season = v_season;

  if now() >= v_lock_at then
    select coalesce(jsonb_agg(jsonb_build_object(
      'profile_id', row.profile_id,
      'display_name', coalesce(profile.display_name, 'Player'),
      'picks', row.picks
    ) order by coalesce(profile.display_name, 'Player')), '[]'::jsonb)
    into v_group
    from public.football_futures_picks row
    join public.profiles profile on profile.id = row.profile_id
    where row.season = v_season
      and row.profile_id <> v_profile_id
      and row.profile_id in (
        select distinct other_member.profile_id
        from public.pick_group_members my_member
        join public.pick_group_members other_member on other_member.group_id = my_member.group_id
        where my_member.profile_id = v_profile_id
      );
  end if;

  return jsonb_build_object(
    'season', v_season,
    'locked', now() >= v_lock_at,
    'lock_at', v_lock_at,
    'own_picks', v_own,
    'group_picks', v_group
  );
end;
$$;

create or replace function public.save_football_futures(p_picks jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_season integer := public.football_futures_current_season();
begin
  if v_profile_id is null then raise exception 'sign in required'; end if;
  if now() >= public.football_futures_lock_at() then raise exception 'football_futures_locked'; end if;

  perform public.validate_football_futures(p_picks);

  insert into public.football_futures_picks (profile_id, season, picks, created_at, updated_at)
  values (v_profile_id, v_season, p_picks, now(), now())
  on conflict (profile_id, season) do update
  set picks = excluded.picks, updated_at = now();

  return public.get_football_futures();
end;
$$;

revoke all on function public.football_futures_current_season() from public;
revoke all on function public.football_futures_lock_at() from public;
revoke all on function public.validate_football_futures(jsonb) from public;
revoke all on function public.get_football_futures() from public, anon;
revoke all on function public.save_football_futures(jsonb) from public, anon;
grant execute on function public.get_football_futures() to authenticated;
grant execute on function public.save_football_futures(jsonb) to authenticated;
