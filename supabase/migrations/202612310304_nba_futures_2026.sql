-- NBA 2026–27 Futures. Independent of Football/UFC/MLB, no existing tables altered.
-- Lines frozen to BetMGM published Oct 13 2026; 30 teams; exact same number for every entrant.
create table if not exists public.nba_futures_win_lines (
  season integer not null check (season = 2026),
  team_id text not null,
  team_name text not null,
  conference text not null check (conference in ('East','West')),
  win_total numeric(4,1) not null check (win_total > 0 and win_total < 82),
  source text not null,
  primary key (season,team_id)
);
alter table public.nba_futures_win_lines enable row level security;
revoke all on public.nba_futures_win_lines from public, anon, authenticated;

insert into public.nba_futures_win_lines(season,team_id,team_name,conference,win_total,source) values
(2026,'ATL','Atlanta Hawks','East',43.5,'BetMGM 2026-10-13'),
(2026,'BOS','Boston Celtics','East',51.5,'BetMGM 2026-10-13'),
(2026,'BKN','Brooklyn Nets','East',24.5,'BetMGM 2026-10-13'),
(2026,'CHA','Charlotte Hornets','East',39.5,'BetMGM 2026-10-13'),
(2026,'CHI','Chicago Bulls','East',29.5,'BetMGM 2026-10-13'),
(2026,'CLE','Cleveland Cavaliers','East',47.5,'BetMGM 2026-10-13'),
(2026,'DAL','Dallas Mavericks','West',34.5,'BetMGM 2026-10-13'),
(2026,'DEN','Denver Nuggets','West',49.5,'BetMGM 2026-10-13'),
(2026,'DET','Detroit Pistons','East',49.5,'BetMGM 2026-10-13'),
(2026,'GSW','Golden State Warriors','West',37.5,'BetMGM 2026-10-13'),
(2026,'HOU','Houston Rockets','West',48.5,'BetMGM 2026-10-13'),
(2026,'IND','Indiana Pacers','East',43.5,'BetMGM 2026-10-13'),
(2026,'LAC','Los Angeles Clippers','West',28.5,'BetMGM 2026-10-13'),
(2026,'LAL','Los Angeles Lakers','West',46.5,'BetMGM 2026-10-13'),
(2026,'MEM','Memphis Grizzlies','West',29.5,'BetMGM 2026-10-13'),
(2026,'MIA','Miami Heat','East',46.5,'BetMGM 2026-10-13'),
(2026,'MIL','Milwaukee Bucks','East',25.5,'BetMGM 2026-10-13'),
(2026,'MIN','Minnesota Timberwolves','West',48.5,'BetMGM 2026-10-13'),
(2026,'NOP','New Orleans Pelicans','West',28.5,'BetMGM 2026-10-13'),
(2026,'NYK','New York Knicks','East',52.5,'BetMGM 2026-10-13'),
(2026,'OKC','Oklahoma City Thunder','West',62.5,'BetMGM 2026-10-13'),
(2026,'ORL','Orlando Magic','East',43.5,'BetMGM 2026-10-13'),
(2026,'PHI','Philadelphia 76ers','East',50.5,'BetMGM 2026-10-13'),
(2026,'PHX','Phoenix Suns','West',40.5,'BetMGM 2026-10-13'),
(2026,'POR','Portland Trail Blazers','West',41.5,'BetMGM 2026-10-13'),
(2026,'SAC','Sacramento Kings','West',21.5,'BetMGM 2026-10-13'),
(2026,'SAS','San Antonio Spurs','West',59.5,'BetMGM 2026-10-13'),
(2026,'TOR','Toronto Raptors','East',46.5,'BetMGM 2026-10-13'),
(2026,'UTA','Utah Jazz','West',37.5,'BetMGM 2026-10-13'),
(2026,'WAS','Washington Wizards','East',34.5,'BetMGM 2026-10-13')
on conflict (season,team_id) do nothing;

create table if not exists public.nba_futures_picks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season integer not null check (season = 2026),
  picks jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id,season)
);
alter table public.nba_futures_picks enable row level security;
revoke all on public.nba_futures_picks from public, anon, authenticated;

create or replace function public.nba_futures_lock_at(p_season integer)
returns timestamptz language sql immutable set search_path = '' as $$
  select case when p_season = 2026 then timestamptz '2026-10-30 16:00:00+00' else null end
$$;

create or replace function public.validate_nba_futures(p_picks jsonb)
returns void language plpgsql stable security definer set search_path = ''
as $$
declare
  v_key text;
  v_max integer;
  v_each_max integer;
  v_list jsonb;
  v_item text;
  v_conf text;
  v_win_key text;
  v_win_value jsonb;
begin
  if p_picks is null or jsonb_typeof(p_picks) <> 'object' then
    raise exception 'nba_futures_invalid_payload';
  end if;
  if jsonb_typeof(coalesce(p_picks->'winTotals','{}'::jsonb)) <> 'object' then
    raise exception 'nba_futures_invalid_win_totals';
  end if;
  for v_win_key,v_win_value in
    select key,value from jsonb_each(coalesce(p_picks->'winTotals','{}'::jsonb))
  loop
    if v_win_value not in ('"over"'::jsonb,'"under"'::jsonb)
      or not exists (select 1 from public.nba_futures_win_lines where season=2026 and team_id=v_win_key)
    then raise exception 'nba_futures_invalid_win_pick'; end if;
  end loop;

  for v_key,v_max,v_each_max in
    select * from (values
      ('playoffTeams',16,8),('conferenceFinalists',4,2),
      ('finalsTeams',2,1),('oneSeeds',2,1)
    ) limits(key,max_count,conference_max)
  loop
    v_list:=coalesce(p_picks->v_key,'[]'::jsonb);
    if jsonb_typeof(v_list)<>'array' or jsonb_array_length(v_list)>v_max then
      raise exception 'nba_futures_invalid_%',v_key;
    end if;
    if (select count(*) from jsonb_array_elements_text(v_list)) <>
       (select count(distinct value) from jsonb_array_elements_text(v_list))
       or exists (select 1 from jsonb_array_elements_text(v_list) t
           where not exists (select 1 from public.nba_futures_win_lines
             where season=2026 and team_id=t.value)) then
      raise exception 'nba_futures_duplicate_or_unknown_%',v_key;
    end if;
    for v_conf in select unnest(array['East','West']) loop
      if (select count(*) from jsonb_array_elements_text(v_list) t
          join public.nba_futures_win_lines l on l.team_id=t.value and l.season=2026
          where l.conference=v_conf)>v_each_max then
        raise exception 'nba_futures_too_many_%_%',v_conf,v_key;
      end if;
    end loop;
  end loop;
  for v_key in select unnest(array['conferenceFinalists','finalsTeams','oneSeeds']) loop
    for v_item in select value from jsonb_array_elements_text(p_picks->v_key) loop
      if not (coalesce(p_picks->(case when v_key='conferenceFinalists' or v_key='oneSeeds'
             then 'playoffTeams' else 'conferenceFinalists' end),'[]'::jsonb) ? v_item) then
        raise exception 'nba_futures_parent_missing_%',v_key;
      end if;
    end loop;
  end loop;
  if length(trim(coalesce(p_picks->>'champion','')))>0 and not
       (coalesce(p_picks->'finalsTeams','[]'::jsonb) ? (p_picks->>'champion')) then
    raise exception 'nba_futures_champion_not_in_finals';
  end if;
  if length(trim(coalesce(p_picks->>'cupChampion','')))>0 and not exists (
      select 1 from public.nba_futures_win_lines
      where season=2026 and team_id=p_picks->>'cupChampion'
  ) then raise exception 'nba_futures_invalid_cup_champion'; end if;
  for v_key in select unnest(array['mvp','dpoy','roy','mip']) loop
    if jsonb_typeof(coalesce(p_picks->v_key,'""'::jsonb))<>'string'
      or length(coalesce(p_picks->>v_key,''))>120 then
      raise exception 'nba_futures_invalid_award_%',v_key;
    end if;
  end loop;
end;
$$;

create or replace function public.nba_futures_complete(p_picks jsonb)
returns boolean language sql stable security definer set search_path = ''
as $$
  select p_picks is not null
    and (select count(*) from jsonb_object_keys(coalesce(p_picks->'winTotals','{}'::jsonb)))=30
    and jsonb_array_length(coalesce(p_picks->'playoffTeams','[]'::jsonb))=16
    and jsonb_array_length(coalesce(p_picks->'conferenceFinalists','[]'::jsonb))=4
    and jsonb_array_length(coalesce(p_picks->'finalsTeams','[]'::jsonb))=2
    and jsonb_array_length(coalesce(p_picks->'oneSeeds','[]'::jsonb))=2
    and length(trim(coalesce(p_picks->>'champion','')))>0
    and length(trim(coalesce(p_picks->>'cupChampion','')))>0
    and length(trim(coalesce(p_picks->>'mvp','')))>0
    and length(trim(coalesce(p_picks->>'dpoy','')))>0
    and length(trim(coalesce(p_picks->>'roy','')))>0
    and length(trim(coalesce(p_picks->>'mip','')))>0;
$$;

create or replace function public.get_nba_futures(p_season integer)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare v_profile uuid:=auth.uid(); v_own jsonb; v_locked boolean; v_entries jsonb; v_count integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_season <> 2026 or p_season is null then raise exception 'nba_futures_invalid_season'; end if;
  v_locked:=now()>=public.nba_futures_lock_at(p_season);
  select picks into v_own from public.nba_futures_picks
    where profile_id=v_profile and season=p_season;
  select count(*) into v_count from public.nba_futures_picks where season=p_season;
  if v_locked then
    select coalesce(jsonb_agg(jsonb_build_object('profile_id',p.profile_id,
      'display_name',coalesce(profile.display_name,'Player'),
      'complete',public.nba_futures_complete(p.picks))
      order by coalesce(profile.display_name,'Player')),'[]'::jsonb) into v_entries
    from public.nba_futures_picks p join public.profiles profile on profile.id=p.profile_id
    where p.season=p_season;
  else v_entries:='[]'::jsonb; end if;
  return jsonb_build_object('season',p_season,'locked',v_locked,
    'lock_at',public.nba_futures_lock_at(p_season),
    'own',v_own,'participants',v_count,'entries',v_entries,
    'lines',(select coalesce(jsonb_agg(jsonb_build_object('id',team_id,'name',team_name,
      'conference',conference,'line',win_total) order by team_name),'[]'::jsonb)
      from public.nba_futures_win_lines where season=p_season));
end;
$$;

create or replace function public.save_nba_futures(p_season integer,p_picks jsonb)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_profile uuid:=auth.uid();
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if p_season <> 2026 or p_season is null then raise exception 'nba_futures_invalid_season'; end if;
  if now()>=public.nba_futures_lock_at(p_season) then raise exception 'nba_futures_locked'; end if;
  perform public.validate_nba_futures(p_picks);
  insert into public.nba_futures_picks(profile_id,season,picks) values(v_profile,p_season,p_picks)
  on conflict(profile_id,season) do update set picks=excluded.picks,updated_at=now();
  return public.get_nba_futures(p_season);
end;
$$;
revoke all on function public.nba_futures_lock_at(integer) from public;
revoke all on function public.validate_nba_futures(jsonb) from public,anon,authenticated;
revoke all on function public.nba_futures_complete(jsonb) from public,anon,authenticated;
revoke all on function public.get_nba_futures(integer) from public,anon;
revoke all on function public.save_nba_futures(integer,jsonb) from public,anon;
grant execute on function public.get_nba_futures(integer) to authenticated;
grant execute on function public.save_nba_futures(integer,jsonb) to authenticated;
notify pgrst,'reload schema';
