-- NBA Average Fan's first public run (2026-11-15) advances and saves its
-- complete final state, but official submission was rejected at grading:
-- the existing terminal-state whitelist omitted 'nba'.
-- Extend only that whitelist. Keep proofs, scoring, saves and all other
-- restrictions unchanged; do not rewrite existing player attempts.
do $patch$
declare
  v_signature constant regprocedure := 'private.grade_average_fan_daily(jsonb,jsonb)'::regprocedure;
  v_definition text;
  v_old constant text := 'or v_sport not in (''ufc'', ''nfl'', ''cfb'')';
  v_new constant text := 'or v_sport not in (''ufc'', ''nfl'', ''cfb'', ''nba'')';
begin
  select pg_get_functiondef(v_signature::oid) into strict v_definition;
  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Average Fan grader changed; refuse unreviewed NBA whitelist patch';
    end if;
    execute replace(v_definition, v_old, v_new);
  end if;

  select pg_get_functiondef(v_signature::oid) into strict v_definition;
  if position(v_new in v_definition) = 0 or position(v_old in v_definition) > 0 then
    raise exception 'NBA Average Fan grader whitelist patch did not apply exactly';
  end if;
end
$patch$;

notify pgrst, 'reload schema';
