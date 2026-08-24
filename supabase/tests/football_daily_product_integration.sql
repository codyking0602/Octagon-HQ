begin;

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('select distinct on (schedule.sport)' in v_definition) = 0
    or position('join private.daily_challenge_schedule_versions schedule' in v_definition) = 0
    or position('on schedule.version = challenge.schedule_version' in v_definition) = 0
    or position('schedule.sport in (''ufc'', ''football'')' in v_definition) = 0
    or position('challenge.sport' in v_definition) > 0 then
    raise exception 'canonical reminder owner does not derive one official daily per sport from the schedule owner';
  end if;

  if position('daily-challenge-four-hours:'' || v_daily.sport || '':'' || v_central_day::text' in v_definition) = 0 then
    raise exception 'Daily reminder source identity can collide across sports';
  end if;

  if position('attempt.daily_challenge_id = v_daily.id' in v_definition) = 0
    or position('attempt.attempt_kind = ''official_first''' in v_definition) = 0 then
    raise exception 'Daily reminder completion suppression is not scoped to the official sport daily';
  end if;

  if position('when v_daily.sport = ''football'' then ''/football/today''' in v_definition) = 0
    or position('when v_daily.game_type = ''find_leader'' then ''/play/find-leader''' in v_definition) = 0 then
    raise exception 'Football or legacy UFC reminder route is not canonical';
  end if;

  perform set_config('request.jwt.claim.role', 'service_role', true);
  perform public.dispatch_due_in_app_notifications(timestamptz '2026-08-23 20:15:00-05');
end;
$$;

rollback;
