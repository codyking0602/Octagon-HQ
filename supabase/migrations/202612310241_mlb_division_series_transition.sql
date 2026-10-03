-- Advance the 2026 MLB postseason from Wild Card to the Division Series.
-- Records official Wild Card winners, publishes all four Division Series with
-- frozen series-winner prices, and grants a one-time short-notice pick window
-- through Sunday afternoon without falsifying the actual Game 1 start times.

alter table public.mlb_playoff_series
  add column if not exists picks_lock_at timestamptz;

do $$
declare
  v_updated integer;
begin
  update public.mlb_playoff_series
  set status = 'complete',
      winner_team_id = result.winner_team_id,
      series_score = result.series_score,
      updated_at = now()
  from (
    values
      ('nl-wc-1'::text, 'atl'::text, 'ATL 2–1 PHI'::text),
      ('al-wc-1'::text, 'cws'::text, 'CWS 2–0 HOU'::text),
      ('al-wc-2'::text, 'nyy'::text, 'NYY 2–0 BOS'::text),
      ('nl-wc-2'::text, 'sd'::text, 'SD 2–0 CHC'::text)
  ) as result(series_id, winner_team_id, series_score)
  where public.mlb_playoff_series.season = 2026
    and public.mlb_playoff_series.series_id = result.series_id;

  get diagnostics v_updated = row_count;
  if v_updated <> 4 then
    raise exception 'expected four completed 2026 Wild Card series, updated %', v_updated;
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
    picks_lock_at,
    status,
    winner_team_id,
    series_score,
    schedule,
    position,
    team_a_moneyline,
    team_b_moneyline,
    odds_source,
    odds_updated_at,
    updated_at
  )
  values
    (
      'al-ds-2',
      2026,
      'division_series',
      'AL',
      'ALDS · No. 2 seed',
      'cws',
      'Chicago White Sox',
      'cle',
      'Cleveland Guardians',
      timestamptz '2026-10-03 17:00:00+00',
      timestamptz '2026-10-04 19:45:00+00',
      'scheduled',
      null,
      null,
      jsonb_build_array(
        'G1 · Sat Oct 3 · 12:00 PM CT · TBS',
        'G2 · Mon Oct 5 · 4:00 PM CT · TBS',
        'G3 · Wed Oct 7 · 3:00 PM CT · TBS',
        'G4 · Thu Oct 8 · 4:00 PM CT · TBS · IF NEEDED',
        'G5 · Sat Oct 10 · 4:00 PM CT · TBS · IF NEEDED'
      ),
      5,
      120,
      -140,
      'DraftKings series winner · frozen Oct 2',
      timestamptz '2026-10-02 16:58:00+00',
      now()
    ),
    (
      'nl-ds-2',
      2026,
      'division_series',
      'NL',
      'NLDS · No. 2 seed',
      'atl',
      'Atlanta Braves',
      'lad',
      'Los Angeles Dodgers',
      timestamptz '2026-10-03 20:00:00+00',
      timestamptz '2026-10-04 19:45:00+00',
      'scheduled',
      null,
      null,
      jsonb_build_array(
        'G1 · Sat Oct 3 · 3:00 PM CT · FOX',
        'G2 · Sun Oct 4 · 7:00 PM CT · FS1',
        'G3 · Tue Oct 6 · 5:00 PM CT · FOX',
        'G4 · Wed Oct 7 · 5:00 PM CT · FOX · IF NEEDED',
        'G5 · Fri Oct 9 · 7:00 PM CT · FOX · IF NEEDED'
      ),
      6,
      175,
      -210,
      'DraftKings series winner · frozen Oct 2',
      timestamptz '2026-10-02 08:29:00+00',
      now()
    ),
    (
      'al-ds-1',
      2026,
      'division_series',
      'AL',
      'ALDS · No. 1 seed',
      'nyy',
      'New York Yankees',
      'tb',
      'Tampa Bay Rays',
      timestamptz '2026-10-03 22:30:00+00',
      timestamptz '2026-10-04 19:45:00+00',
      'scheduled',
      null,
      null,
      jsonb_build_array(
        'G1 · Sat Oct 3 · 5:30 PM CT · TBS',
        'G2 · Mon Oct 5 · 7:00 PM CT · TBS',
        'G3 · Wed Oct 7 · 7:00 PM CT · TBS',
        'G4 · Thu Oct 8 · 7:00 PM CT · TBS · IF NEEDED',
        'G5 · Sat Oct 10 · 7:00 PM CT · TBS · IF NEEDED'
      ),
      7,
      -120,
      100,
      'DraftKings series winner · frozen Oct 2',
      timestamptz '2026-10-02 16:59:00+00',
      now()
    ),
    (
      'nl-ds-1',
      2026,
      'division_series',
      'NL',
      'NLDS · No. 1 seed',
      'sd',
      'San Diego Padres',
      'mil',
      'Milwaukee Brewers',
      timestamptz '2026-10-04 00:30:00+00',
      timestamptz '2026-10-04 19:45:00+00',
      'scheduled',
      null,
      null,
      jsonb_build_array(
        'G1 · Sat Oct 3 · 7:30 PM CT · FOX',
        'G2 · Sun Oct 4 · 3:00 PM CT · FS1',
        'G3 · Tue Oct 6 · 8:30 PM CT · FOX',
        'G4 · Wed Oct 7 · 9:00 PM CT · FOX · IF NEEDED',
        'G5 · Fri Oct 9 · 3:30 PM CT · FOX · IF NEEDED'
      ),
      8,
      150,
      -180,
      'DraftKings series winner · frozen Oct 1',
      timestamptz '2026-10-01 18:53:00+00',
      now()
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
      picks_lock_at = excluded.picks_lock_at,
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

  update public.mlb_playoff_seasons
  set current_round = 'division_series',
      spotlight = jsonb_build_object(
        'series_id', 'nl-ds-2',
        'title', 'Braves vs. Dodgers',
        'round', 'NL DIVISION SERIES',
        'status', 'Division Series · Best of 5',
        'overview', 'Atlanta won the 2026 season series 5-1. Now the clubs meet for the sixth time in postseason play, with Los Angeles rested and Atlanta coming straight out of a three-game Wild Card Series.',
        'keys', jsonb_build_array(
          'Atlanta won the 2026 season series 5-1',
          'A rested Dodgers rotation meets an Atlanta staff coming off a three-game Wild Card series'
        ),
        'player_to_watch', 'Kyle Tucker',
        'player_context', 'Los Angeles Dodgers · right field',
        'stats', jsonb_build_array(
          'Braves won 2026 season series 5-1',
          'Sixth postseason meeting'
        )
      ),
      updated_at = now()
  where season = 2026
    and public_enabled = true
    and field_ready = true;

  get diagnostics v_updated = row_count;
  if v_updated <> 1 then
    raise exception 'expected one live 2026 MLB postseason season row, updated %', v_updated;
  end if;
end;
$$;

create or replace function public.get_mlb_playoffs_hub(p_season integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_season public.mlb_playoff_seasons;
  v_is_owner boolean := false;
  v_bracket_locked boolean := false;
  v_own_bracket jsonb;
  v_own_score integer := 0;
  v_brackets jsonb := '[]'::jsonb;
  v_series jsonb := '[]'::jsonb;
  v_round_picks jsonb := '[]'::jsonb;
  v_round_pick_entries jsonb := '[]'::jsonb;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_season
  from public.mlb_playoff_seasons
  where season = p_season;

  if not found then
    raise exception 'mlb_playoffs_season_not_found';
  end if;

  v_is_owner := public.is_pick_control_owner(v_profile_id);

  if not v_season.public_enabled and not v_is_owner then
    raise exception 'mlb_playoffs_not_available';
  end if;

  v_bracket_locked := v_season.bracket_lock_at is not null and now() >= v_season.bracket_lock_at;

  select bracket.picks
    into v_own_bracket
  from public.mlb_playoff_brackets bracket
  where bracket.profile_id = v_profile_id
    and bracket.season = p_season;

  if v_own_bracket is not null then
    v_own_score := public.score_mlb_playoff_bracket(p_season, v_own_bracket);
  end if;

  if v_bracket_locked then
    select coalesce(jsonb_agg(entry order by score desc, submitted_at asc), '[]'::jsonb)
      into v_brackets
    from (
      select
        bracket.submitted_at,
        public.score_mlb_playoff_bracket(p_season, bracket.picks) as score,
        jsonb_build_object(
          'profile_id', bracket.profile_id,
          'display_name', profile.display_name,
          'picks', bracket.picks,
          'score', public.score_mlb_playoff_bracket(p_season, bracket.picks),
          'is_current_user', bracket.profile_id = v_profile_id
        ) as entry
      from public.mlb_playoff_brackets bracket
      join public.profiles profile on profile.id = bracket.profile_id
      where bracket.season = p_season
    ) ranked;
  else
    select coalesce(jsonb_agg(entry), '[]'::jsonb)
      into v_brackets
    from (
      select jsonb_build_object(
        'profile_id', bracket.profile_id,
        'display_name', profile.display_name,
        'picks', bracket.picks,
        'score', public.score_mlb_playoff_bracket(p_season, bracket.picks),
        'is_current_user', true
      ) as entry
      from public.mlb_playoff_brackets bracket
      join public.profiles profile on profile.id = bracket.profile_id
      where bracket.season = p_season
        and bracket.profile_id = v_profile_id
    ) mine;
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'series_id', series_row.series_id,
      'round', series_row.round,
      'league', series_row.league,
      'label', series_row.label,
      'team_a_id', series_row.team_a_id,
      'team_a_name', series_row.team_a_name,
      'team_b_id', series_row.team_b_id,
      'team_b_name', series_row.team_b_name,
      'starts_at', series_row.starts_at,
      'picks_lock_at', series_row.picks_lock_at,
      'status', series_row.status,
      'winner_team_id', series_row.winner_team_id,
      'series_score', series_row.series_score,
      'schedule', series_row.schedule,
      'team_a_moneyline', series_row.team_a_moneyline,
      'team_b_moneyline', series_row.team_b_moneyline,
      'odds_source', series_row.odds_source,
      'odds_updated_at', series_row.odds_updated_at
    )
    order by series_row.position
  ), '[]'::jsonb)
    into v_series
  from public.mlb_playoff_series series_row
  where series_row.season = p_season;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'series_id', pick.series_id,
      'winner_team_id', pick.winner_team_id,
      'picked_at', pick.picked_at
    )
  ), '[]'::jsonb)
    into v_round_picks
  from public.mlb_playoff_round_picks pick
  join public.mlb_playoff_series series_row on series_row.series_id = pick.series_id
  where pick.profile_id = v_profile_id
    and series_row.season = p_season;

  select coalesce(jsonb_agg(row_payload order by is_current_user desc, display_name asc), '[]'::jsonb)
    into v_round_pick_entries
  from (
    with participants as (
      select bracket.profile_id
      from public.mlb_playoff_brackets bracket
      where bracket.season = p_season
      union
      select pick.profile_id
      from public.mlb_playoff_round_picks pick
      join public.mlb_playoff_series series_row on series_row.series_id = pick.series_id
      where series_row.season = p_season
      union
      select v_profile_id
    ),
    current_round_series as (
      select series_row.*
      from public.mlb_playoff_series series_row
      where series_row.season = p_season
        and series_row.round = v_season.current_round
    )
    select
      profile.display_name,
      profile.id = v_profile_id as is_current_user,
      jsonb_build_object(
        'profile_id', profile.id,
        'display_name', profile.display_name,
        'is_current_user', profile.id = v_profile_id,
        'completed', (
          select count(*)::integer
          from public.mlb_playoff_round_picks pick
          join current_round_series series_row on series_row.series_id = pick.series_id
          where pick.profile_id = profile.id
        ),
        'total', (
          select count(*)::integer
          from current_round_series
        ),
        'wins', (
          select count(*)::integer
          from public.mlb_playoff_round_picks pick
          join current_round_series series_row on series_row.series_id = pick.series_id
          where pick.profile_id = profile.id
            and series_row.winner_team_id is not null
            and pick.winner_team_id = series_row.winner_team_id
        ),
        'losses', (
          select count(*)::integer
          from public.mlb_playoff_round_picks pick
          join current_round_series series_row on series_row.series_id = pick.series_id
          where pick.profile_id = profile.id
            and series_row.winner_team_id is not null
            and pick.winner_team_id <> series_row.winner_team_id
        ),
        'picks', coalesce((
          select jsonb_object_agg(pick.series_id, pick.winner_team_id)
          from public.mlb_playoff_round_picks pick
          join current_round_series series_row on series_row.series_id = pick.series_id
          where pick.profile_id = profile.id
            and (
              profile.id = v_profile_id
              or v_is_owner
              or (
                coalesce(series_row.picks_lock_at, series_row.starts_at) is not null
                and now() >= coalesce(series_row.picks_lock_at, series_row.starts_at)
              )
              or series_row.status = 'complete'
              or series_row.winner_team_id is not null
            )
        ), '{}'::jsonb)
      ) as row_payload
    from participants participant
    join public.profiles profile on profile.id = participant.profile_id
  ) group_rows;

  return jsonb_build_object(
    'season', v_season.season,
    'public_enabled', v_season.public_enabled,
    'field_ready', v_season.field_ready,
    'current_round', v_season.current_round,
    'bracket_lock_at', v_season.bracket_lock_at,
    'bracket_locked', v_bracket_locked,
    'bracket_template', v_season.bracket_template,
    'own_bracket', v_own_bracket,
    'own_bracket_score', v_own_score,
    'brackets', v_brackets,
    'series', v_series,
    'own_round_picks', v_round_picks,
    'round_pick_entries', v_round_pick_entries,
    'spotlight', v_season.spotlight,
    'featured_challenge', v_season.featured_challenge
  );
end;
$$;

create or replace function public.save_mlb_series_pick(
  p_series_id text,
  p_winner_team_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_series public.mlb_playoff_series;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_series
  from public.mlb_playoff_series
  where series_id = p_series_id;

  if not found then
    raise exception 'mlb_playoffs_series_not_found';
  end if;

  if not public.mlb_playoffs_can_view(v_series.season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  if coalesce(v_series.picks_lock_at, v_series.starts_at) is null
    or now() >= coalesce(v_series.picks_lock_at, v_series.starts_at)
    or v_series.winner_team_id is not null
    or v_series.status = 'complete'
  then
    raise exception 'mlb_playoffs_series_locked';
  end if;

  if p_winner_team_id not in (v_series.team_a_id, v_series.team_b_id) then
    raise exception 'mlb_playoffs_invalid_series_pick';
  end if;

  insert into public.mlb_playoff_round_picks (
    profile_id,
    series_id,
    winner_team_id,
    picked_at,
    updated_at
  )
  values (v_profile_id, p_series_id, p_winner_team_id, now(), now())
  on conflict (profile_id, series_id) do update
  set winner_team_id = excluded.winner_team_id,
      updated_at = now();

  return public.get_mlb_playoffs_hub(v_series.season);
end;
$$;

revoke all on function public.get_mlb_playoffs_hub(integer) from public, anon;
grant execute on function public.get_mlb_playoffs_hub(integer) to authenticated;
revoke all on function public.save_mlb_series_pick(text, text) from public, anon;
grant execute on function public.save_mlb_series_pick(text, text) to authenticated;

comment on column public.mlb_playoff_series.picks_lock_at is
  'Optional explicit series-pick lock. Falls back to starts_at when null; used for short-notice postseason grace windows.';

do $$
begin
  if (
    select count(*)
    from public.mlb_playoff_series
    where season = 2026
      and round = 'division_series'
  ) <> 4 then
    raise exception '2026 Division Series transition did not publish four series';
  end if;

  if not exists (
    select 1
    from public.mlb_playoff_seasons
    where season = 2026
      and current_round = 'division_series'
      and spotlight ->> 'series_id' = 'nl-ds-2'
  ) then
    raise exception '2026 Division Series transition did not advance the live season';
  end if;
end;
$$;

-- The canonical notification scheduler observes the completed Wild Card rows and
-- newly published Division Series after deployment. Do not bypass the dispatcher's
-- service-role guard from migration context.

notify pgrst, 'reload schema';
