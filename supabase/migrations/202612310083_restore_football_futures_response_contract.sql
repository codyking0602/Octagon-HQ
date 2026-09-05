set search_path = public;

create or replace function public.get_football_futures(p_season int)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_lock_at timestamptz := public.football_futures_lock_at(p_season);
  v_locked boolean := now() >= v_lock_at;
  v_own_picks jsonb := null;
  v_group_picks jsonb := '[]'::jsonb;
begin
  if v_profile_id is null then
    raise exception 'Not authenticated';
  end if;

  select ffp.picks
    into v_own_picks
  from public.football_futures_picks ffp
  where ffp.profile_id = v_profile_id
    and ffp.season = p_season;

  if v_locked then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'profile_id', p.id,
          'display_name', p.display_name,
          'picks', ffp.picks
        )
        order by p.display_name asc
      ),
      '[]'::jsonb
    )
      into v_group_picks
    from public.football_futures_picks ffp
    join public.profiles p
      on p.id = ffp.profile_id
    where ffp.season = p_season
      and ffp.profile_id <> v_profile_id;
  end if;

  return jsonb_build_object(
    'season', p_season,
    'locked', v_locked,
    'lock_at', v_lock_at,
    'own_picks', v_own_picks,
    'group_picks', v_group_picks
  );
end;
$$;

grant execute on function public.get_football_futures(int) to authenticated;
