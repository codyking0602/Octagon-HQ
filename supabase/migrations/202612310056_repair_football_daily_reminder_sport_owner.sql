-- Preserve schedule_version as the canonical sport owner for official Daily Challenges.
-- The shared notification dispatcher must derive sport through that relationship instead of
-- reading a duplicate/nonexistent sport field from private.daily_challenges.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if regexp_count(v_definition, 'challenge\.sport') <> 4
    or regexp_count(v_definition, 'from private\.daily_challenges challenge') <> 1 then
    raise exception 'canonical notification dispatcher does not match the expected Football Daily reminder query';
  end if;

  v_definition := replace(
    v_definition,
    'challenge.sport',
    'schedule.sport'
  );

  v_definition := replace(
    v_definition,
    'from private.daily_challenges challenge',
    E'from private.daily_challenges challenge\n      join private.daily_challenge_schedule_versions schedule\n        on schedule.version = challenge.schedule_version'
  );

  execute v_definition;

  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('challenge.sport' in v_definition) > 0
    or position('select distinct on (schedule.sport)' in v_definition) = 0
    or position('join private.daily_challenge_schedule_versions schedule' in v_definition) = 0
    or position('on schedule.version = challenge.schedule_version' in v_definition) = 0
    or position('schedule.sport in (''ufc'', ''football'')' in v_definition) = 0 then
    raise exception 'Football Daily reminder sport ownership was not repaired';
  end if;
end;
$$;

notify pgrst, 'reload schema';
