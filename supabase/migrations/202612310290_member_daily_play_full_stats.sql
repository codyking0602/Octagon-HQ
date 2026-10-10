-- Signed-in HQ members may compare another member's completed official Daily Play.
-- Same normalized scores and 365-result horizon as list_my_daily_challenge_history.
-- Never expose attempt evidence, draft progress, private setup, or today's scores
-- until the viewer has finished that same official Daily challenge.
create or replace function public.list_member_daily_challenge_history(
  p_member_name text,
  p_sport text
) returns jsonb
language plpgsql
stable security definer
set search_path = ''
as $$
declare
  v_viewer uuid := auth.uid();
  v_member uuid;
begin
  if v_viewer is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if nullif(trim(p_member_name), '') is null or length(p_member_name) > 120 then
    raise exception 'member name required';
  end if;

  select profile.id into v_member
  from public.profiles profile
  where profile.normalized_name = upper(regexp_replace(trim(p_member_name), '\s+', ' ', 'g'))
  limit 1;

  if v_member is null then
    raise exception 'member profile not found';
  end if;

  return coalesce((
    select jsonb_agg(
      jsonb_build_object(
        'day', history.central_day,
        'schedule_version', history.schedule_version,
        'game_type', history.game_type,
        'native_score', history.native_score,
        'normalized_score', history.normalized_score,
        'completed_at', history.completed_at,
        'content_version', history.content_version,
        'scoring_version', history.scoring_version,
        'public_result', history.public_result
      )
      order by history.central_day desc
    )
    from (
      select source.*
      from private.daily_challenge_history source
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = source.schedule_version
      where source.profile_id = v_member
        and schedule.sport = p_sport
        and source.central_day <= (now() at time zone 'America/Chicago')::date
        and (
          source.profile_id = v_viewer
          or source.central_day < (now() at time zone 'America/Chicago')::date
          or exists (
            select 1
            from private.daily_challenge_history viewer_result
            where viewer_result.profile_id = v_viewer
              and viewer_result.central_day = source.central_day
              and viewer_result.schedule_version = source.schedule_version
          )
        )
      order by source.central_day desc
      limit 365
    ) history
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.list_member_daily_challenge_history(text, text) from public, anon;
grant execute on function public.list_member_daily_challenge_history(text, text) to authenticated;
