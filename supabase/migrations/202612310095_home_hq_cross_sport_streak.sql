-- Home HQ owns one cross-sport Daily Challenge streak.
-- Completing either the UFC or Football official daily preserves the same calendar-day streak.
create or replace function public.get_my_hq_daily_challenge_streak()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile uuid := auth.uid();
  v_today date := private.daily_challenge_central_day(now());
  v_day date;
  v_previous date;
  v_expected date;
  v_run integer := 0;
  v_best integer := 0;
  v_current integer := 0;
begin
  if v_profile is null then
    raise exception 'sign in required';
  end if;

  for v_day in
    select distinct history.central_day
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport in ('ufc', 'football')
    order by history.central_day
  loop
    if v_previous is null or v_day = v_previous + 1 then
      v_run := v_run + 1;
    else
      v_run := 1;
    end if;
    v_best := greatest(v_best, v_run);
    v_previous := v_day;
  end loop;

  if exists (
    select 1
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport in ('ufc', 'football')
      and history.central_day = v_today
  ) then
    v_expected := v_today;
  else
    v_expected := v_today - 1;
  end if;

  for v_day in
    select distinct history.central_day
    from private.daily_challenge_history history
    join private.daily_challenge_schedule_versions schedule
      on schedule.version = history.schedule_version
    where history.profile_id = v_profile
      and schedule.sport in ('ufc', 'football')
      and history.central_day <= v_expected
    order by history.central_day desc
  loop
    exit when v_day <> v_expected;
    v_current := v_current + 1;
    v_expected := v_expected - 1;
  end loop;

  return jsonb_build_object(
    'current_streak', v_current,
    'best_streak', v_best
  );
end;
$$;

revoke all on function public.get_my_hq_daily_challenge_streak()
  from public, anon;
grant execute on function public.get_my_hq_daily_challenge_streak()
  to authenticated;

notify pgrst, 'reload schema';
