-- Load the finalized 2026 MLB postseason field for owner-only review.
-- This intentionally keeps public_enabled=false; the public release is a later explicit PR.

do $$
declare
  v_bracket jsonb := $bracket$
{
  "teams": [
    {"id":"tb","name":"Tampa Bay Rays","abbreviation":"TB","seed":1,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/tb.png"},
    {"id":"cle","name":"Cleveland Guardians","abbreviation":"CLE","seed":2,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/cle.png"},
    {"id":"hou","name":"Houston Astros","abbreviation":"HOU","seed":3,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/hou.png"},
    {"id":"nyy","name":"New York Yankees","abbreviation":"NYY","seed":4,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/nyy.png"},
    {"id":"bos","name":"Boston Red Sox","abbreviation":"BOS","seed":5,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/bos.png"},
    {"id":"cws","name":"Chicago White Sox","abbreviation":"CWS","seed":6,"league":"AL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/cws.png"},
    {"id":"mil","name":"Milwaukee Brewers","abbreviation":"MIL","seed":1,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/mil.png"},
    {"id":"lad","name":"Los Angeles Dodgers","abbreviation":"LAD","seed":2,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/lad.png"},
    {"id":"atl","name":"Atlanta Braves","abbreviation":"ATL","seed":3,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/atl.png"},
    {"id":"sd","name":"San Diego Padres","abbreviation":"SD","seed":4,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/sd.png"},
    {"id":"chc","name":"Chicago Cubs","abbreviation":"CHC","seed":5,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/chc.png"},
    {"id":"phi","name":"Philadelphia Phillies","abbreviation":"PHI","seed":6,"league":"NL","logo_url":"https://a.espncdn.com/i/teamlogos/mlb/500/phi.png"}
  ],
  "nodes": [
    {"id":"al-wc-1","round":"wild_card","league":"AL","label":"AL Wild Card · 3 vs 6","points":1,"left":{"team_id":"hou","source_node_id":null},"right":{"team_id":"cws","source_node_id":null}},
    {"id":"al-wc-2","round":"wild_card","league":"AL","label":"AL Wild Card · 4 vs 5","points":1,"left":{"team_id":"nyy","source_node_id":null},"right":{"team_id":"bos","source_node_id":null}},
    {"id":"nl-wc-1","round":"wild_card","league":"NL","label":"NL Wild Card · 3 vs 6","points":1,"left":{"team_id":"atl","source_node_id":null},"right":{"team_id":"phi","source_node_id":null}},
    {"id":"nl-wc-2","round":"wild_card","league":"NL","label":"NL Wild Card · 4 vs 5","points":1,"left":{"team_id":"sd","source_node_id":null},"right":{"team_id":"chc","source_node_id":null}},
    {"id":"al-ds-1","round":"division_series","league":"AL","label":"ALDS · No. 1 seed","points":2,"left":{"team_id":"tb","source_node_id":null},"right":{"team_id":null,"source_node_id":"al-wc-2"}},
    {"id":"al-ds-2","round":"division_series","league":"AL","label":"ALDS · No. 2 seed","points":2,"left":{"team_id":"cle","source_node_id":null},"right":{"team_id":null,"source_node_id":"al-wc-1"}},
    {"id":"nl-ds-1","round":"division_series","league":"NL","label":"NLDS · No. 1 seed","points":2,"left":{"team_id":"mil","source_node_id":null},"right":{"team_id":null,"source_node_id":"nl-wc-2"}},
    {"id":"nl-ds-2","round":"division_series","league":"NL","label":"NLDS · No. 2 seed","points":2,"left":{"team_id":"lad","source_node_id":null},"right":{"team_id":null,"source_node_id":"nl-wc-1"}},
    {"id":"al-cs","round":"championship_series","league":"AL","label":"ALCS","points":5,"left":{"team_id":null,"source_node_id":"al-ds-1"},"right":{"team_id":null,"source_node_id":"al-ds-2"}},
    {"id":"nl-cs","round":"championship_series","league":"NL","label":"NLCS","points":5,"left":{"team_id":null,"source_node_id":"nl-ds-1"},"right":{"team_id":null,"source_node_id":"nl-ds-2"}},
    {"id":"ws","round":"world_series","league":null,"label":"WORLD SERIES","points":10,"left":{"team_id":null,"source_node_id":"al-cs"},"right":{"team_id":null,"source_node_id":"nl-cs"}}
  ]
}
$bracket$::jsonb;
begin
  update public.mlb_playoff_seasons
  set public_enabled = false,
      field_ready = true,
      current_round = 'wild_card',
      bracket_lock_at = timestamptz '2026-09-29 12:00:00-05',
      bracket_template = v_bracket,
      spotlight = jsonb_build_object(
        'series_id', 'al-wc-2',
        'title', 'Red Sox vs. Yankees',
        'round', 'AL WILD CARD',
        'status', 'Wild Card · Best of 3',
        'overview', 'A one-year Wild Card rematch between baseball''s most recognizable rivals, with New York holding home field and a 7-6 regular-season edge.',
        'keys', jsonb_build_array(
          'New York''s power vs. Boston''s pitching depth',
          'Late-inning leverage in a best-of-three'
        ),
        'player_to_watch', 'Ben Rice',
        'player_context', 'New York Yankees · middle-of-order power',
        'stats', jsonb_build_array(
          'Yankees won 2026 season series 7-6',
          '2025 Wild Card rematch'
        )
      ),
      updated_at = now()
  where season = 2026;

  if not found then
    raise exception '2026 MLB postseason season row is missing';
  end if;

  insert into public.mlb_playoff_series (
    series_id,
    season,
    round,
    league,
    label,
    team_a_id,
    team_a_name,
    team_b_id,
    team_b_name,
    starts_at,
    status,
    winner_team_id,
    series_score,
    schedule,
    position,
    team_a_moneyline,
    team_b_moneyline,
    odds_source,
    odds_updated_at
  )
  values
    (
      'nl-wc-1', 2026, 'wild_card', 'NL', 'NL Wild Card · 3 vs 6',
      'phi', 'Philadelphia Phillies', 'atl', 'Atlanta Braves',
      timestamptz '2026-09-29 13:00:00-05', 'scheduled', null, null,
      '["G1 · Tue Sep 29 · 1:00 PM CT · NBC","G2 · Wed Sep 30 · 1:00 PM CT · NBC","G3 · Thu Oct 1 · 1:00 PM CT · NBC · IF NEEDED"]'::jsonb,
      1, null, null, null, null
    ),
    (
      'al-wc-1', 2026, 'wild_card', 'AL', 'AL Wild Card · 3 vs 6',
      'cws', 'Chicago White Sox', 'hou', 'Houston Astros',
      timestamptz '2026-09-29 16:00:00-05', 'scheduled', null, null,
      '["G1 · Tue Sep 29 · 4:00 PM CT · Peacock","G2 · Wed Sep 30 · 4:00 PM CT · Peacock","G3 · Thu Oct 1 · 4:00 PM CT · Peacock · IF NEEDED"]'::jsonb,
      2, null, null, null, null
    ),
    (
      'al-wc-2', 2026, 'wild_card', 'AL', 'AL Wild Card · 4 vs 5',
      'bos', 'Boston Red Sox', 'nyy', 'New York Yankees',
      timestamptz '2026-09-29 19:00:00-05', 'scheduled', null, null,
      '["G1 · Tue Sep 29 · 7:00 PM CT · NBC","G2 · Wed Sep 30 · 7:00 PM CT · NBC","G3 · Thu Oct 1 · 7:00 PM CT · NBC · IF NEEDED"]'::jsonb,
      3, null, null, null, null
    ),
    (
      'nl-wc-2', 2026, 'wild_card', 'NL', 'NL Wild Card · 4 vs 5',
      'chc', 'Chicago Cubs', 'sd', 'San Diego Padres',
      timestamptz '2026-09-29 21:00:00-05', 'scheduled', null, null,
      '["G1 · Tue Sep 29 · 9:00 PM CT · Peacock","G2 · Wed Sep 30 · 9:00 PM CT · Peacock","G3 · Thu Oct 1 · 9:00 PM CT · Peacock · IF NEEDED"]'::jsonb,
      4, null, null, null, null
    )
  on conflict (series_id) do update
  set season = excluded.season,
      round = excluded.round,
      league = excluded.league,
      label = excluded.label,
      team_a_id = excluded.team_a_id,
      team_a_name = excluded.team_a_name,
      team_b_id = excluded.team_b_id,
      team_b_name = excluded.team_b_name,
      starts_at = excluded.starts_at,
      status = excluded.status,
      winner_team_id = excluded.winner_team_id,
      series_score = excluded.series_score,
      schedule = excluded.schedule,
      position = excluded.position,
      team_a_moneyline = excluded.team_a_moneyline,
      team_b_moneyline = excluded.team_b_moneyline,
      odds_source = excluded.odds_source,
      odds_updated_at = excluded.odds_updated_at,
      updated_at = now();
end;
$$;

notify pgrst, 'reload schema';
