-- Let a member who has already completed this Daily inspect another finisher through
-- the same canonical result presentation used for their own attempt. Keep the existing
-- generalized leaderboard RPC as the sole public owner and expose only persisted public
-- runtime state plus the already-public official attempt result.
create or replace function public.get_daily_challenge_leaderboard(
  p_day date,
  p_schedule_version text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_entries jsonb;
  v_count integer;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;
  if p_day is null or nullif(trim(p_schedule_version), '') is null then
    raise exception 'daily leaderboard identity required';
  end if;

  if not exists (
    select 1
    from private.daily_challenge_history history
    where history.profile_id = v_profile
      and history.central_day = p_day
      and history.schedule_version = p_schedule_version
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
      history.game_type,
      history.native_score,
      history.normalized_score,
      history.completed_at,
      history.public_result,
      coalesce(progress.revision, 0) as progress_revision,
      coalesce(progress.public_state, '{}'::jsonb) as public_state,
      rank() over (order by history.normalized_score desc)::integer as score_rank
    from private.daily_challenge_history history
    join public.profiles profile
      on profile.id = history.profile_id
    left join public.profile_preferences preference
      on preference.profile_id = history.profile_id
    left join private.daily_challenge_progress progress
      on progress.daily_challenge_id = history.daily_challenge_id
     and progress.profile_id = history.profile_id
    where history.central_day = p_day
      and history.schedule_version = p_schedule_version
  )
  select
    count(*)::integer,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'rank', ranked.score_rank,
          'profile_id', ranked.profile_id,
          'display_name', ranked.display_name,
          'initials', ranked.initials,
          'avatar_photo_data', ranked.avatar_photo_data,
          'game_type', ranked.game_type,
          'native_score', ranked.native_score,
          'normalized_score', ranked.normalized_score,
          'completed_at', ranked.completed_at,
          'public_result', ranked.public_result,
          'progress_revision', ranked.progress_revision,
          'public_state', ranked.public_state,
          'official_score', case
            when ranked.game_type = 'find_leader' then ranked.native_score
            else ranked.normalized_score
          end,
          'is_current_user', ranked.profile_id = v_profile
        )
        order by ranked.score_rank, ranked.display_name
      ),
      '[]'::jsonb
    )
  into v_count, v_entries
  from ranked;

  return jsonb_build_object(
    'unlocked', true,
    'player_count', coalesce(v_count, 0),
    'entries', coalesce(v_entries, '[]'::jsonb)
  );
end;
$$;

revoke all on function public.get_daily_challenge_leaderboard(date, text)
  from public, anon;
grant execute on function public.get_daily_challenge_leaderboard(date, text)
  to authenticated;
