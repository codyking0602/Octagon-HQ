-- One-week, operator-entered Football Picks odds fallback, 2026-10-27.
-- Lines are DraftKings spreads from the ESPN scoreboard, not The Odds API.
-- The exceptional provenance value is visibly distinct and publishing is
-- restricted to the 2026-10-27 Football slate. Standard weeks remain unchanged.

alter table public.pick_event_draft_bouts
  drop constraint pick_draft_football_spread_shape;
alter table public.pick_event_draft_bouts
  add constraint pick_draft_football_spread_shape check (
    (home_team_slug is null and away_team_slug is null
      and spread_home is null and spread_source is null and spread_updated_at is null)
    or
    (home_team_slug is not null and away_team_slug is not null
      and home_team_slug <> away_team_slug and (
      (spread_home is null and spread_source is null and spread_updated_at is null)
      or
      (spread_home is not null and spread_updated_at is not null
        and spread_source in ('the-odds-api', 'espn-draftkings-manual-2026-10-27'))
    ))
  );

alter table public.pick_bouts
  drop constraint pick_football_spread_shape;
alter table public.pick_bouts
  add constraint pick_football_spread_shape check (
    (home_team_slug is null and away_team_slug is null
      and frozen_spread_home is null and spread_source is null and spread_frozen_at is null)
    or
    (home_team_slug is not null and away_team_slug is not null
      and home_team_slug <> away_team_slug and frozen_spread_home is not null
      and spread_frozen_at is not null
      and spread_source in ('the-odds-api', 'espn-draftkings-manual-2026-10-27'))
  );

-- Both owner-review projections and the publication validator must accept
-- the exceptional source *only* for the named slate. Preserve the installed
-- functions' current bodies instead of reimplementing the Picks pipeline.
do $oct27_manual_spreads$
declare
  v_func text;
  v_needle text := 'bout.spread_source <> ''the-odds-api''';
  v_replacement text := '(bout.spread_source not in (''the-odds-api'', ''espn-draftkings-manual-2026-10-27'') or (bout.spread_source = ''espn-draftkings-manual-2026-10-27'' and v_draft.source_event_key <> ''football-slate:2026-10-27''))';
  v_count integer;
  v_target text;
  v_expected integer;
begin
  for v_target, v_expected in
    select * from (values
      ('public.get_pick_event_setup(text)', 2),
      ('private.publish_pick_event_draft_ufc_recap_core(uuid)', 1)
    ) as required(signature, match_count)
  loop
    select pg_get_functiondef(v_target::regprocedure) into v_func;
    v_count := (length(v_func) - length(replace(v_func, v_needle, ''))) / length(v_needle);
    if v_count <> v_expected then
      raise exception 'Manual ATS provenance guard: expected % matches in %, found %',
        v_expected, v_target, v_count;
    end if;
    execute replace(v_func, v_needle, v_replacement);
  end loop;
end
$oct27_manual_spreads$;
