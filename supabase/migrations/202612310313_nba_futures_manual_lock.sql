-- NBA 2026-27 Futures: retain the published October 20 advisory deadline,
-- but close entries only by an explicit, server-owned manual action.
-- No timed closure may prevent existing participants from finishing drafts.
create table if not exists public.nba_futures_lock_control (
  season integer primary key check (season = 2026),
  manually_locked boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.nba_futures_lock_control enable row level security;
revoke all on public.nba_futures_lock_control from public, anon, authenticated;
insert into public.nba_futures_lock_control(season, manually_locked)
values (2026, false)
on conflict (season) do nothing;

-- Accessible to trusted get/save RPCs only. Public clients cannot flip the flag.
create or replace function public.nba_futures_is_locked(p_season integer)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce(
    (select manually_locked from public.nba_futures_lock_control where season = p_season),
    false
  )
$$;
revoke all on function public.nba_futures_is_locked(integer) from public, anon, authenticated;

-- Keep public.nba_futures_lock_at(2026) unchanged: it is the displayed
-- scheduled deadline, NOT a permission check.
create or replace function public.get_nba_futures(p_season integer)
returns jsonb language plpgsql stable security definer set search_path = ''
as $$
declare
  v_profile uuid:=auth.uid();
  v_own jsonb;
  v_locked boolean;
  v_entries jsonb;
  v_count integer;
begin
  if v_profile is null then raise exception 'sign in required'; end if;
  if not public.nba_futures_owner_preview_allowed(v_profile) then
    raise exception 'nba_futures_preview_owner_only';
  end if;
  if p_season <> 2026 or p_season is null then raise exception 'nba_futures_invalid_season'; end if;
  v_locked:=public.nba_futures_is_locked(p_season);
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
  else
    v_entries:='[]'::jsonb;
  end if;
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
  if not public.nba_futures_owner_preview_allowed(v_profile) then
    raise exception 'nba_futures_preview_owner_only';
  end if;
  if p_season <> 2026 or p_season is null then raise exception 'nba_futures_invalid_season'; end if;
  if public.nba_futures_is_locked(p_season) then raise exception 'nba_futures_locked'; end if;
  perform public.validate_nba_futures(p_picks);
  insert into public.nba_futures_picks(profile_id,season,picks)
  values(v_profile,p_season,p_picks)
  on conflict(profile_id,season) do update set picks=excluded.picks,updated_at=now();
  return public.get_nba_futures(p_season);
end;
$$;
revoke all on function public.get_nba_futures(integer) from public, anon;
revoke all on function public.save_nba_futures(integer,jsonb) from public, anon;
grant execute on function public.get_nba_futures(integer) to authenticated;
grant execute on function public.save_nba_futures(integer,jsonb) to authenticated;
notify pgrst,'reload schema';
