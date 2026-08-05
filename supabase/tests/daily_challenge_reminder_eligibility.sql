begin;

set local role service_role;

-- The canonical dispatcher must use the materialized daily and immutable official-first
-- attempt owner, never the retired Find the Leader-only completion table.
do $$
declare
  v_definition text;
begin
  select pg_get_functiondef(
    'public.dispatch_due_in_app_notifications(timestamptz)'::regprocedure
  ) into v_definition;

  if position('private.daily_challenges' in v_definition) = 0 then
    raise exception 'daily reminder does not resolve the canonical materialized challenge';
  end if;
  if position('private.daily_challenge_attempts' in v_definition) = 0
    or position('official_first' in v_definition) = 0 then
    raise exception 'daily reminder does not use immutable official-first attempt eligibility';
  end if;
  if position('public.find_leader_history' in v_definition) > 0 then
    raise exception 'daily reminder still depends on the legacy Find the Leader table';
  end if;

  if position('/play/find-leader' in v_definition) = 0
    or position('/play/blind-resume?mode=daily' in v_definition) = 0
    or position('/play/wavelength?mode=daily' in v_definition) = 0
    or position('/play/blind-rank?mode=daily' in v_definition) = 0
    or position('/play/keep-cut?mode=daily' in v_definition) = 0 then
    raise exception 'daily reminder does not route every eligible official game';
  end if;

  if position('daily-challenge-four-hours:' in v_definition) = 0 then
    raise exception 'daily reminder changed its canonical deduplication identity';
  end if;
end;
$$;

rollback;
