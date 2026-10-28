-- Reveal other members' saved NBA Futures picks only after the explicit
-- server-controlled season lock, matching the existing Football Futures reveal.
-- Preserve every saved card (including unfinished drafts), current own picks,
-- frozen win totals, and the separate manual lock control.
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
      'complete',public.nba_futures_complete(p.picks),
      'picks',p.picks)
      order by coalesce(profile.display_name,'Player')),'[]'::jsonb) into v_entries
    from public.nba_futures_picks p join public.profiles profile on profile.id=p.profile_id
    where p.season=p_season and p.profile_id<>v_profile;
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

revoke all on function public.get_nba_futures(integer) from public, anon;
grant execute on function public.get_nba_futures(integer) to authenticated;
notify pgrst, 'reload schema';
