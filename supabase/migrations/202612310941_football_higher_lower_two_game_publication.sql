-- November 5 Football Daily incident: the approved two-game Higher or Lower
-- publication was rejected because the server-owned setup publisher's scoring
-- allowlist omitted higher_lower. The private two-game grader already supports
-- Higher or Lower and was verified by the canonical migration/test suite.
--
-- Preserve every other schedule, scoring mode, publisher rule, and immutable
-- historical setup by changing ONLY that scoring allowlist entry.
-- Idempotent for production, where the exact emergency fix was applied first.
do $migration$
declare
  v_function_oid oid;
  v_definition text;
  v_old text := $old$(p_game_type in ('wavelength', 'find_leader', 'hit_the_number')$old$;
  v_new text := $new$(p_game_type in ('wavelength', 'find_leader', 'hit_the_number', 'higher_lower')$new$;
begin
  select p.oid into strict v_function_oid
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname = 'publish_daily_challenge_setup';

  v_definition := pg_get_functiondef(v_function_oid);
  if position(v_new in v_definition) = 0 then
    if position(v_old in v_definition) = 0 then
      raise exception 'Daily publisher changed; Higher or Lower scoring allowlist requires re-audit';
    end if;
    execute replace(v_definition, v_old, v_new);
  end if;

  select pg_get_functiondef(v_function_oid) into v_definition;
  if position(v_new in v_definition) = 0 then
    raise exception 'Football Higher or Lower two-game publication allowlist verification failed';
  end if;
end
$migration$;
