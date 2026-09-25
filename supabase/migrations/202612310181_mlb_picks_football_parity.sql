-- MLB Playoffs Picks parity: series moneylines plus secure group-pick progress.
-- Keeps MLB private behind the existing season gate; other members' open picks stay hidden after public release.

alter table public.mlb_playoff_series
  add column if not exists team_a_moneyline integer,
  add column if not exists team_b_moneyline integer,
  add column if not exists odds_source text,
  add column if not exists odds_updated_at timestamptz;

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

  if v_bracket_locked or v_is_owner then
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
              or (series_row.starts_at is not null and now() >= series_row.starts_at)
              or series_row.status in ('active', 'complete')
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

revoke all on function public.get_mlb_playoffs_hub(integer) from public, anon;
grant execute on function public.get_mlb_playoffs_hub(integer) to authenticated;

comment on column public.mlb_playoff_series.team_a_moneyline is
  'Optional series moneyline for team A. Null until a trusted postseason line is available.';
comment on column public.mlb_playoff_series.team_b_moneyline is
  'Optional series moneyline for team B. Null until a trusted postseason line is available.';
comment on function public.get_mlb_playoffs_hub(integer) is
  'MLB postseason hub with bracket standings, series moneylines, and lock-aware group series-pick progress.';

notify pgrst, 'reload schema';
