create or replace function public.get_find_leader_daily_leaderboard(p_day date)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_entries jsonb;
  v_player_count integer;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if p_day is null then
    raise exception 'daily leaderboard day required';
  end if;

  if not exists (
    select 1
    from public.find_leader_history history
    where history.profile_id = v_profile_id
      and history.day = p_day
  ) then
    return jsonb_build_object(
      'unlocked', false,
      'player_count', 0,
      'entries', '[]'::jsonb
    );
  end if;

  with ranked as (
    select
      history.profile_id,
      profile.display_name,
      profile.initials,
      preference.avatar_photo_data,
      history.official_score::integer as official_score,
      rank() over (order by history.official_score desc)::integer as score_rank
    from public.find_leader_history history
    join public.profiles profile on profile.id = history.profile_id
    left join public.profile_preferences preference on preference.profile_id = history.profile_id
    where history.day = p_day
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'rank', ranked.score_rank,
          'display_name', ranked.display_name,
          'initials', ranked.initials,
          'avatar_photo_data', ranked.avatar_photo_data,
          'official_score', ranked.official_score,
          'is_current_user', ranked.profile_id = v_profile_id
        )
        order by ranked.score_rank, ranked.display_name
      ),
      '[]'::jsonb
    )
  into v_player_count, v_entries
  from ranked;

  return jsonb_build_object(
    'unlocked', true,
    'player_count', coalesce(v_player_count, 0),
    'entries', coalesce(v_entries, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_find_leader_daily_leaderboard(date) from public, anon;
grant execute on function public.get_find_leader_daily_leaderboard(date) to authenticated;
