-- One MLB Postseason Championship:
-- 43 points from round-by-round series picks
-- 32 points from the one-time bracket
-- 25 points from ten featured Play challenges
-- 100 points total.

create table if not exists public.mlb_postseason_challenges (
  season smallint not null references public.mlb_playoff_seasons(season) on delete cascade,
  slot smallint not null,
  challenge_key text not null,
  created_at timestamptz not null default now(),
  primary key (season, slot),
  unique (season, challenge_key),
  constraint mlb_postseason_challenges_slot_check check (slot between 1 and 10),
  constraint mlb_postseason_challenges_key_check check (length(trim(challenge_key)) > 0)
);

create table if not exists public.mlb_postseason_challenge_results (
  season smallint not null,
  challenge_key text not null,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  raw_score numeric not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (season, challenge_key, profile_id),
  foreign key (season, challenge_key)
    references public.mlb_postseason_challenges(season, challenge_key)
    on update cascade
    on delete cascade
);

alter table public.mlb_postseason_challenges enable row level security;
alter table public.mlb_postseason_challenge_results enable row level security;

revoke all on table public.mlb_postseason_challenges from anon, authenticated;
revoke all on table public.mlb_postseason_challenge_results from anon, authenticated;

insert into public.mlb_postseason_challenges (season, slot, challenge_key)
select
  2026,
  slot,
  'mlb-2026-play-' || lpad(slot::text, 2, '0')
from generate_series(1, 10) as slot
on conflict do nothing;

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
      when 'championship_series' then 5
      when 'world_series' then 10
      else 0
    end
  ), 0)::integer
  from public.mlb_playoff_series series_row
  where series_row.season = p_season
    and series_row.winner_team_id is not null
    and p_picks ->> series_row.series_id = series_row.winner_team_id
$$;

create or replace function public.score_mlb_series_picks(
  p_season integer,
  p_profile_id uuid
)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(
    case series_row.round
      when 'wild_card' then 2
      when 'division_series' then 4
      when 'championship_series' then 5
      when 'world_series' then 9
      else 0
    end
  ), 0)::integer
  from public.mlb_playoff_round_picks pick
  join public.mlb_playoff_series series_row
    on series_row.series_id = pick.series_id
  where series_row.season = p_season
    and pick.profile_id = p_profile_id
    and series_row.winner_team_id is not null
    and pick.winner_team_id = series_row.winner_team_id
$$;

create or replace function public.score_mlb_postseason_play(
  p_season integer,
  p_profile_id uuid
)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  with ranked as (
    select
      result.challenge_key,
      result.profile_id,
      rank() over (
        partition by result.challenge_key
        order by result.raw_score desc
      )::integer as rank_start,
      count(*) over (
        partition by result.challenge_key, result.raw_score
      )::integer as tie_count
    from public.mlb_postseason_challenge_results result
    join public.mlb_postseason_challenges challenge
      on challenge.season = result.season
     and challenge.challenge_key = result.challenge_key
    where result.season = p_season
  ),
  awarded as (
    select
      ranked.challenge_key,
      ranked.profile_id,
      (
        select avg(
          case place
            when 1 then 2.5::numeric
            when 2 then 2.0::numeric
            when 3 then 1.5::numeric
            when 4 then 1.0::numeric
            when 5 then 0.5::numeric
            else 0::numeric
          end
        )
        from generate_series(
          ranked.rank_start,
          ranked.rank_start + ranked.tie_count - 1
        ) as place
      ) as points
    from ranked
  )
  select least(
    25::numeric,
    coalesce(sum(awarded.points) filter (where awarded.profile_id = p_profile_id), 0::numeric)
  )::numeric(6,2)
  from awarded
$$;

create or replace function public.get_mlb_postseason_championship(p_season integer)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_standings jsonb := '[]'::jsonb;
  v_own jsonb := null;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not public.mlb_playoffs_can_view(p_season) then
    raise exception 'mlb_playoffs_not_available';
  end if;

  with participants as (
    select bracket.profile_id
    from public.mlb_playoff_brackets bracket
    where bracket.season = p_season

    union

    select pick.profile_id
    from public.mlb_playoff_round_picks pick
    join public.mlb_playoff_series series_row
      on series_row.series_id = pick.series_id
    where series_row.season = p_season

    union

    select result.profile_id
    from public.mlb_postseason_challenge_results result
    where result.season = p_season

    union

    select v_profile_id
  ),
  scored as (
    select
      profile.id as profile_id,
      profile.display_name,
      public.score_mlb_series_picks(p_season, profile.id) as series_points,
      coalesce((
        select public.score_mlb_playoff_bracket(p_season, bracket.picks)
        from public.mlb_playoff_brackets bracket
        where bracket.season = p_season
          and bracket.profile_id = profile.id
      ), 0) as bracket_points,
      public.score_mlb_postseason_play(p_season, profile.id) as play_points
    from participants participant
    join public.profiles profile
      on profile.id = participant.profile_id
  ),
  totals as (
    select
      scored.*,
      (scored.series_points::numeric + scored.bracket_points::numeric + scored.play_points)::numeric(6,2) as total_points
    from scored
  ),
  ranked as (
    select
      totals.*,
      rank() over (order by totals.total_points desc)::integer as overall_rank,
      rank() over (order by totals.series_points desc)::integer as series_rank,
      rank() over (order by totals.bracket_points desc)::integer as bracket_rank,
      rank() over (order by totals.play_points desc)::integer as play_rank
    from totals
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'profile_id', ranked.profile_id,
      'display_name', ranked.display_name,
      'is_current_user', ranked.profile_id = v_profile_id,
      'overall_rank', ranked.overall_rank,
      'total_points', ranked.total_points,
      'series_points', ranked.series_points,
      'series_rank', ranked.series_rank,
      'bracket_points', ranked.bracket_points,
      'bracket_rank', ranked.bracket_rank,
      'play_points', ranked.play_points,
      'play_rank', ranked.play_rank
    )
    order by ranked.total_points desc, ranked.display_name asc
  ), '[]'::jsonb)
    into v_standings
  from ranked;

  select value
    into v_own
  from jsonb_array_elements(v_standings) as value
  where value ->> 'profile_id' = v_profile_id::text
  limit 1;

  return jsonb_build_object(
    'season', p_season,
    'total_max', 100,
    'series_max', 43,
    'bracket_max', 32,
    'play_max', 25,
    'own', v_own,
    'standings', v_standings
  );
end;
$$;

revoke all on function public.score_mlb_playoff_bracket(integer, jsonb) from public, anon, authenticated;
revoke all on function public.score_mlb_series_picks(integer, uuid) from public, anon, authenticated;
revoke all on function public.score_mlb_postseason_play(integer, uuid) from public, anon, authenticated;
revoke all on function public.get_mlb_postseason_championship(integer) from public, anon;

grant execute on function public.get_mlb_postseason_championship(integer) to authenticated;

comment on table public.mlb_postseason_challenges is
  'The ten spoiler-free scoring slots that feed the MLB Postseason Championship Play lane.';
comment on table public.mlb_postseason_challenge_results is
  'Canonical raw results for MLB postseason featured challenges; placement points are derived, never stored.';
comment on function public.get_mlb_postseason_championship(integer) is
  'Canonical 100-point MLB Postseason Championship: Series Picks 43, Bracket 32, Play 25.';

notify pgrst, 'reload schema';
