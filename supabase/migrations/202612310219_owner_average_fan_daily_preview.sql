-- Owner-only, non-persistent preview support for a future Average Fan Daily.
-- The edge runtime uses these service-only wrappers to resolve the canonical schedule
-- and run the same canonical scoring gate without creating Daily progress or attempts.

create or replace function public.get_owner_average_fan_daily_preview_descriptor(
  p_profile_id uuid,
  p_day date,
  p_sport text
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_schedule_version text;
  v_expected_game text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview is not authorized';
  end if;
  if p_day is null then
    raise exception 'owner Daily preview day is required';
  end if;
  if p_sport not in ('ufc', 'football') then
    raise exception 'owner Daily preview sport must be UFC or Football';
  end if;

  v_schedule_version := private.daily_challenge_schedule_for_day(p_day, p_sport);
  if v_schedule_version is null then
    raise exception 'no Daily schedule is active for % %', p_sport, p_day;
  end if;

  v_expected_game := private.daily_challenge_expected_game(v_schedule_version, p_day);

  return jsonb_build_object(
    'central_day', p_day,
    'sport', p_sport,
    'schedule_version', v_schedule_version,
    'expected_game', v_expected_game
  );
end;
$$;

revoke all on function public.get_owner_average_fan_daily_preview_descriptor(uuid, date, text)
  from public, anon, authenticated;
grant execute on function public.get_owner_average_fan_daily_preview_descriptor(uuid, date, text)
  to service_role;

create or replace function public.grade_owner_average_fan_daily_preview(
  p_profile_id uuid,
  p_scoring_version text,
  p_submission jsonb,
  p_grading_evidence jsonb
)
returns table (
  native_score integer,
  normalized_score integer,
  public_result jsonb,
  grading_snapshot jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required for owner Daily preview grading';
  end if;
  if p_profile_id is null
    or not public.is_pick_control_owner(p_profile_id) then
    raise exception 'owner Daily preview grading is not authorized';
  end if;

  return query
  select grade.native_score, grade.normalized_score, grade.public_result, grade.grading_snapshot
  from private.grade_daily_challenge_pre_combo(
    'average_fan',
    p_scoring_version,
    p_submission,
    p_grading_evidence
  ) grade;
end;
$$;

revoke all on function public.grade_owner_average_fan_daily_preview(uuid, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.grade_owner_average_fan_daily_preview(uuid, text, jsonb, jsonb)
  to service_role;

notify pgrst, 'reload schema';
