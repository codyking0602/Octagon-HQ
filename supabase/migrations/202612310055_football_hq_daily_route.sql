-- Preserve the shared notification dispatcher as the only owner while moving the
-- Football Daily destination out of the retired Back Room route tree.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('/back-room/football/today' in v_definition) = 0 then
    raise exception 'canonical notification dispatcher is missing the expected Football Daily route';
  end if;

  v_definition := replace(
    v_definition,
    '/back-room/football/today',
    '/football/today'
  );

  execute v_definition;

  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('/football/today' in v_definition) = 0
    or position('/back-room/football/today' in v_definition) > 0 then
    raise exception 'Football Daily notification route was not canonicalized';
  end if;
end;
$$;

notify pgrst, 'reload schema';
