begin;

do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('select distinct on (challenge.sport)' in v_definition) = 0
    or position('challenge.sport in (''ufc'', ''football'')' in v_definition) = 0 then
    raise exception 'canonical reminder owner does not select one official daily per sport';
  end if;

  if position('daily-challenge-four-hours:'' || v_daily.sport || '':'' || v_central_day::text' in v_definition) = 0 then
    raise exception 'Daily reminder source identity can collide across sports';
  end if;

  if position('attempt.daily_challenge_id = v_daily.id' in v_definition) = 0
    or position('attempt.attempt_kind = ''official_first''' in v_definition) = 0 then
    raise exception 'Daily reminder completion suppression is not scoped to the official sport daily';
  end if;

  if position('when v_daily.sport = ''football'' then ''/back-room/football/today''' in v_definition) = 0
    or position('when v_daily.game_type = ''find_leader'' then ''/play/find-leader''' in v_definition) = 0 then
    raise exception 'Football or legacy UFC reminder route is not canonical';
  end if;
end;
$$;

rollback;
