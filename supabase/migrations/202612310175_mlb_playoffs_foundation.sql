-- MLB Playoffs 2026: compact postseason-only foundation.
-- The season starts private and field-pending. Public visibility is an explicit later release action.

create table if not exists public.mlb_playoff_seasons (
  season smallint primary key,
  public_enabled boolean not null default false,
  field_ready boolean not null default false,
  current_round text not null default 'wild_card',
  bracket_lock_at timestamptz,
  bracket_template jsonb not null default '{"teams":[],"nodes":[]}'::jsonb,
  spotlight jsonb,
  featured_challenge jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mlb_playoff_seasons_round_check check (
    current_round in ('wild_card', 'division_series', 'championship_series', 'world_series')
  ),
  constraint mlb_playoff_seasons_template_object check (jsonb_typeof(bracket_template) = 'object')
);

create table if not exists public.mlb_playoff_series (
  series_id text primary key,
  season smallint not null references public.mlb_playoff_seasons(season) on delete cascade,
  round text not null,
  league text,
  label text not null,
  team_a_id text not null,
  team_a_name text not null,
  team_b_id text not null,
  team_b_name text not null,
  starts_at timestamptz,
  status text not null default 'scheduled',
  winner_team_id text,
  series_score text,
  schedule jsonb not null default '[]'::jsonb,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mlb_playoff_series_round_check check (
    round in ('wild_card', 'division_series', 'championship_series', 'world_series')
  ),
  constraint mlb_playoff_series_league_check check (league is null or league in ('AL', 'NL')),
  constraint mlb_playoff_series_status_check check (status in ('scheduled', 'active', 'complete')),
  constraint mlb_playoff_series_schedule_array check (jsonb_typeof(schedule) = 'array'),
  constraint mlb_playoff_series_winner_check check (
    winner_team_id is null or winner_team_id in (team_a_id, team_b_id)
  ),
  unique (season, position)
);

create table if not exists public.mlb_playoff_brackets (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  season smallint not null references public.mlb_playoff_seasons(season) on delete cascade,
  picks jsonb not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, season),
  constraint mlb_playoff_brackets_picks_object check (jsonb_typeof(picks) = 'object')
);

create table if not exists public.mlb_playoff_round_picks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  series_id text not null references public.mlb_playoff_series(series_id) on delete cascade,
  winner_team_id text not null,
  picked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, series_id)
);

alter table public.mlb_playoff_seasons enable row level security;
alter table public.mlb_playoff_series enable row level security;
alter table public.mlb_playoff_brackets enable row level security;
alter table public.mlb_playoff_round_picks enable row level security;

revoke all on table public.mlb_playoff_seasons from anon, authenticated;
revoke all on table public.mlb_playoff_series from anon, authenticated;
revoke all on table public.mlb_playoff_brackets from anon, authenticated;
revoke all on table public.mlb_playoff_round_picks from anon, authenticated;

insert into public.mlb_playoff_seasons (
  season,
  public_enabled,
  field_ready,
  current_round,
  bracket_lock_at,
  bracket_template,
  featured_challenge
)
values (
  2026,
  false,
  false,
  'wild_card',
  null,
  '{"teams":[],"nodes":[]}'::jsonb,
  jsonb_build_object(
    'id', '2026-october-legend-rivera',
    'title', 'October Legend',
    'kicker', 'WHO AM I',
    'description', 'Four clues. One postseason icon.',
    'route', '/mlb/challenge'
  )
)
on conflict (season) do nothing;

create or replace function public.mlb_playoffs_can_view(p_season integer)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.mlb_playoff_seasons season_row
    where season_row.season = p_season
      and (
        season_row.public_enabled
        or (
          auth.uid() is not null
          and public.is_pick_control_owner(auth.uid())
        )
      )
  )
$$;

create or replace function public.score_mlb_playoff_bracket(
  p_season integer,
  p_picks jsonb
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(
    case series_row.round
      when 'wild_card' then 1
      when 'division_series' then 2
      when 'championship_series' then 4
      when 'world_series' then 8
      else 0
    end
  ), 0)::integer
  from public.mlb_playoff_series series_row
  where series_row.season = p_season
    and series_row.winner_team_id is not null
    and p_picks ->> series_row.series_id = series_row.winner_team_id
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
      'schedule', series_row.schedule
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
    'spotlight', v_season.spotlight,
    'featured_challenge', v_season.featured_challenge
  );
end;
$$;

create or replace function public.save_mlb_playoff_bracket(
  p_season integer,
  p_picks jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_season public.mlb_playoff_seasons;
  v_node jsonb;
  v_node_id text;
  v_pick text;
  v_left_team text;
  v_right_team text;
  v_node_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select * into v_season
  from public.mlb_playoff_seasons
  where season = p_season
  for update;

  if not found then
    raise exception 'mlb_playoffs_season_not_found';
  end if;

  if not v_season.public_enabled and not public.is_pick_control_owner(v_profile_id) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  if not v_season.field_ready then
    raise exception 'mlb_playoffs_field_not_ready';
  end if;

  if v_season.bracket_lock_at is null or now() >= v_season.bracket_lock_at then
    raise exception 'mlb_playoffs_bracket_locked';
  end if;

  if p_picks is null or jsonb_typeof(p_picks) <> 'object' then
    raise exception 'mlb_playoffs_invalid_bracket';
  end if;

  for v_node in
    select value from jsonb_array_elements(coalesce(v_season.bracket_template -> 'nodes', '[]'::jsonb))
  loop
    v_node_count := v_node_count + 1;
    v_node_id := v_node ->> 'id';
    v_pick := nullif(trim(p_picks ->> v_node_id), '');

    if v_pick is null then
      raise exception 'mlb_playoffs_incomplete_bracket';
    end if;

    if not exists (
      select 1
      from jsonb_array_elements(coalesce(v_season.bracket_template -> 'teams', '[]'::jsonb)) team
      where team ->> 'id' = v_pick
    ) then
      raise exception 'mlb_playoffs_unknown_team';
    end if;

    v_left_team := coalesce(
      nullif(v_node #>> '{left,team_id}', ''),
      nullif(p_picks ->> (v_node #>> '{left,source_node_id}'), '')
    );
    v_right_team := coalesce(
      nullif(v_node #>> '{right,team_id}', ''),
      nullif(p_picks ->> (v_node #>> '{right,source_node_id}'), '')
    );

    if v_left_team is null or v_right_team is null then
      raise exception 'mlb_playoffs_invalid_bracket_path';
    end if;

    if v_pick not in (v_left_team, v_right_team) then
      raise exception 'mlb_playoffs_invalid_bracket_path';
    end if;
  end loop;

  if v_node_count = 0 then
    raise exception 'mlb_playoffs_field_not_ready';
  end if;

  insert into public.mlb_playoff_brackets (
    profile_id,
    season,
    picks,
    submitted_at,
    updated_at
  )
  values (v_profile_id, p_season, p_picks, now(), now())
  on conflict (profile_id, season) do update
  set picks = excluded.picks,
      updated_at = now();

  return public.get_mlb_playoffs_hub(p_season);
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

  if v_series.starts_at is null
    or now() >= v_series.starts_at
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

revoke all on function public.mlb_playoffs_can_view(integer) from public, anon, authenticated;
revoke all on function public.score_mlb_playoff_bracket(integer, jsonb) from public, anon, authenticated;
revoke all on function public.get_mlb_playoffs_hub(integer) from public, anon;
revoke all on function public.save_mlb_playoff_bracket(integer, jsonb) from public, anon;
revoke all on function public.save_mlb_series_pick(text, text) from public, anon;

grant execute on function public.get_mlb_playoffs_hub(integer) to authenticated;
grant execute on function public.save_mlb_playoff_bracket(integer, jsonb) to authenticated;
grant execute on function public.save_mlb_series_pick(text, text) to authenticated;

comment on table public.mlb_playoff_seasons is
  'Temporary postseason-only MLB Playoffs configuration. Public launch requires explicit public_enabled release.';
comment on function public.get_mlb_playoffs_hub(integer) is
  'Owner-first MLB postseason projection; regular users cannot read a private season.';

notify pgrst, 'reload schema';
