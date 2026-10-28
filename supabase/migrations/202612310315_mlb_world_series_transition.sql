-- 2026 MLB World Series rollover. Official 2026 finals verified from MLB:
-- ALCS: Tampa Bay defeats Cleveland 4-2 on Oct 19.
-- NLCS: Milwaukee sweeps Los Angeles 4-0 on Oct 15.
-- Preserve every submitted bracket and round pick; their scores are derived
-- from these canonical series winners, never rewritten.
-- World Series series-winner lines: DraftKings Oct 19, MIL -155 / TB +135.
-- The odds are fixed here as one pre-Game-1 snapshot, not live repriced.

do $mlb_world_series$
declare
  v_changed integer;
  v_brackets integer;
  v_round_picks integer;
begin
  if (select count(*) from public.mlb_playoff_seasons
      where season = 2026 and public_enabled and field_ready
        and current_round in ('championship_series', 'world_series')) <> 1 then
    raise exception 'live 2026 MLB season is not ready for World Series rollover';
  end if;

  if (select count(*) from public.mlb_playoff_series
      where season = 2026 and round = 'championship_series') <> 2 then
    raise exception 'expected exactly two championship series';
  end if;

  if exists (
    select 1 from (values
      ('al-cs'::text, 'cle'::text, 'tb'::text, 'tb'::text),
      ('nl-cs'::text, 'lad'::text, 'mil'::text, 'mil'::text)
    ) as expected(series_id, team_a_id, team_b_id, winner_id)
    left join public.mlb_playoff_series s
      on s.series_id = expected.series_id and s.season = 2026
    where s.series_id is null
      or s.team_a_id <> expected.team_a_id
      or s.team_b_id <> expected.team_b_id
      or (s.winner_team_id is not null and s.winner_team_id <> expected.winner_id)
  ) then
    raise exception 'championship series identities or winners conflict with verified results';
  end if;

  select count(*) into v_brackets
    from public.mlb_playoff_brackets where season = 2026;
  select count(*) into v_round_picks
    from public.mlb_playoff_round_picks pick
    join public.mlb_playoff_series series_row on series_row.series_id = pick.series_id
    where series_row.season = 2026;

  update public.mlb_playoff_series as series_row
    set status = 'complete',
        winner_team_id = result.winner_id,
        series_score = result.final_score,
        updated_at = now()
    from (values
      ('al-cs'::text, 'tb'::text, 'TB 4–2 CLE'::text),
      ('nl-cs'::text, 'mil'::text, 'MIL 4–0 LAD'::text)
    ) as result(series_id, winner_id, final_score)
    where series_row.season = 2026
      and series_row.round = 'championship_series'
      and series_row.series_id = result.series_id;
  get diagnostics v_changed = row_count;
  if v_changed <> 2 then
    raise exception 'expected to settle two championship series, settled %', v_changed;
  end if;

  insert into public.mlb_playoff_series (
    series_id, season, round, league, label,
    team_a_id, team_a_name, team_b_id, team_b_name,
    starts_at, picks_lock_at, status, winner_team_id, series_score,
    schedule, position, team_a_moneyline, team_b_moneyline,
    odds_source, odds_updated_at, updated_at
  ) values (
    'ws', 2026, 'world_series', null, 'World Series · Best of 7',
    'tb', 'Tampa Bay Rays', 'mil', 'Milwaukee Brewers',
    timestamptz '2026-10-24 00:00:00+00',
    timestamptz '2026-10-24 00:00:00+00',
    'scheduled', null, null,
    jsonb_build_array(
      'G1 · Fri Oct 23 · 7:00 PM CT · FOX',
      'G2 · Sat Oct 24 · 7:00 PM CT · FOX',
      'G3 · Mon Oct 26 · 7:00 PM CT · FOX',
      'G4 · Tue Oct 27 · 7:00 PM CT · FOX',
      'G5 · Wed Oct 28 · 7:00 PM CT · FOX · IF NEEDED',
      'G6 · Fri Oct 30 · 7:00 PM CT · FOX · IF NEEDED',
      'G7 · Sat Oct 31 · 7:00 PM CT · FOX · IF NEEDED'
    ),
    11, 135, -155,
    'DraftKings World Series winner · quoted Oct 19 · frozen for WS',
    now(), now()
  )
  on conflict (series_id) do nothing;

  if (select count(*) from public.mlb_playoff_series
      where season = 2026 and series_id = 'ws'
        and round = 'world_series'
        and team_a_id = 'tb' and team_b_id = 'mil'
        and status = 'scheduled' and winner_team_id is null
        and starts_at = timestamptz '2026-10-24 00:00:00+00'
        and picks_lock_at = timestamptz '2026-10-24 00:00:00+00'
        and team_a_moneyline = 135 and team_b_moneyline = -155) <> 1 then
    raise exception 'World Series identities, freeze or official kickoff inconsistent';
  end if;

  update public.mlb_playoff_seasons
    set current_round = 'world_series',
        spotlight = jsonb_build_object(
          'series_id', 'ws',
          'title', 'Rays vs. Brewers',
          'round', 'WORLD SERIES',
          'status', 'World Series · Best of 7',
          'overview', 'Two clubs chasing their first World Series championship. Milwaukee comes in with an MLB-best 103 regular-season wins and home-field advantage; Tampa Bay advanced with a six-game ALCS win over Cleveland.',
          'keys', jsonb_build_array(
            'The Brewers earned home field with 103 wins to the Rays'' 98',
            'Both franchises are competing for their first World Series title',
            'Game 1 is Friday, October 23, in Milwaukee'
          ),
          'player_to_watch', 'Junior Caminero',
          'player_context', 'Tampa Bay Rays · third baseman · 42 regular-season home runs',
          'stats', jsonb_build_array(
            'Rays beat Cleveland 4–2 in the ALCS',
            'Brewers swept the Dodgers 4–0 in the NLCS',
            'Milwaukee won the 2026 season series against Tampa Bay 2–1'
          )
        ),
        updated_at = now()
    where season = 2026 and public_enabled and field_ready;
  get diagnostics v_changed = row_count;
  if v_changed <> 1 then
    raise exception 'expected to advance one live 2026 MLB season, changed %', v_changed;
  end if;

  if (select count(*) from public.mlb_playoff_brackets where season = 2026) <> v_brackets
     or (select count(*) from public.mlb_playoff_round_picks pick
          join public.mlb_playoff_series series_row on series_row.series_id = pick.series_id
          where series_row.season = 2026) <> v_round_picks then
    raise exception 'World Series rollover changed submitted bracket or series-pick count';
  end if;
end;
$mlb_world_series$;

-- Existing canonical bracket/round/season championship projections automatically
-- score ALCS and NLCS winners; WS picks open until real Game 1 starts.
-- Secure notification scheduler observes the rollover without direct dispatch.
notify pgrst, 'reload schema';
