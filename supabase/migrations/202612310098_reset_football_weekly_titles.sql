-- Reset only Football Daily Challenge weekly titles at the start of the
-- 2026-09-07 through 2026-09-13 competition week.
--
-- Preserve all Daily Challenge history, wins, averages, streaks, and the UFC
-- championship era. The active Football week remains ineligible until Monday
-- rollover, so the first Football title in this new era is awarded after this week.

do $football_title_reset$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_existing_declaration constant text := $old_decl$
  v_ufc_championship_start date := date '2026-08-10';
$old_decl$;
  v_reset_declaration constant text := $new_decl$
  v_ufc_championship_start date := date '2026-08-10';
  v_football_championship_start date := date '2026-09-07';
$new_decl$;
  v_existing_filter constant text := $old_filter$
          and week_start < v_week_start
          and (p_sport <> 'ufc' or week_start >= v_ufc_championship_start)
$old_filter$;
  v_reset_filter constant text := $new_filter$
          and week_start < v_week_start
          and (
            (p_sport = 'ufc' and week_start >= v_ufc_championship_start)
            or (p_sport = 'football' and week_start >= v_football_championship_start)
          )
$new_filter$;
begin
  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('v_football_championship_start date := date ''2026-09-07''' in v_definition) > 0 then
    if position(v_reset_filter in v_definition) = 0 then
      raise exception 'Football title reset declaration exists without the expected sport-scoped title filter';
    end if;
    return;
  end if;

  if position(v_existing_declaration in v_definition) = 0 then
    raise exception 'canonical Daily standings championship declaration changed unexpectedly';
  end if;

  if position(v_existing_filter in v_definition) = 0 then
    raise exception 'canonical Daily standings title filter changed unexpectedly';
  end if;

  v_definition := replace(v_definition, v_existing_declaration, v_reset_declaration);
  v_definition := replace(v_definition, v_existing_filter, v_reset_filter);
  execute v_definition;
end
$football_title_reset$;
