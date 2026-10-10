-- Read-only completed official Daily scores for member profile performance.
-- Align with list_my_daily_challenge_history: same season-neutral 365-row cap,
-- sport/schedule ownership, and official normalized scores. No private progress,
-- hidden clues or answer evidence is exposed.
create or replace function public.list_member_daily_challenge_history(
  p_member_name text,
  p_sport text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_member uuid;
begin
  if auth.uid() is null then
    raise exception 'sign in required';
  end if;
  if p_sport is null or p_sport not in ('ufc', 'football') then
    raise exception 'unsupported Daily Challenge sport %', coalesce(p_sport, '<null>');
  end if;
  if nullif(btrim(p_member_name), '') is null then
    raise exception 'member name required';
  end if;

  select profile.id into v_member
  from public.profiles profile
  where profile.normalized_name = upper(regexp_replace(btrim(p_member_name), '\s+', ' ', 'g'))
  limit 1;

  if v_member is null then
    return '[]'::jsonb;
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
        'public_result', '{}'::jsonb
      )
      order by history.central_day desc, history.completed_at desc
    )
    from (
      select source.central_day, source.schedule_version, source.game_type,
        source.native_score, source.normalized_score, source.completed_at
      from private.daily_challenge_history source
      join private.daily_challenge_schedule_versions schedule
        on schedule.version = source.schedule_version
      where source.profile_id = v_member
        and schedule.sport = p_sport
      order by source.central_day desc, source.completed_at desc
      limit 365
    ) history
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.list_member_daily_challenge_history(text, text)
  from public, anon;
grant execute on function public.list_member_daily_challenge_history(text, text)
  to authenticated;
