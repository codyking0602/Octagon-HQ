-- Resolve Hit the Number rounded-score ties by exact distance and apply the
-- approved UFC weekly-title correction without deleting canonical history.

create table if not exists private.daily_challenge_title_adjustments (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null check (sport in ('ufc', 'football')),
  title_delta integer not null,
  reason text not null,
  created_at timestamptz not null default now(),
  primary key (profile_id, sport)
);

revoke all on table private.daily_challenge_title_adjustments
  from public, anon, authenticated;

insert into private.daily_challenge_title_adjustments (
  profile_id,
  sport,
  title_delta,
  reason
)
select
  profile.id,
  'ufc',
  -3,
  'Normalize Cody UFC weekly titles from four legacy-era titles to one retained title after the field expanded.'
from public.profiles profile
where lower(profile.normalized_name) = 'cody'
on conflict (profile_id, sport)
do update set
  title_delta = excluded.title_delta,
  reason = excluded.reason;

create or replace function private.daily_challenge_hit_number_distance(
  p_game_type text,
  p_public_result jsonb
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when p_game_type <> 'hit_the_number' then null
    when jsonb_typeof(p_public_result -> 'distance') = 'number'
      then (p_public_result ->> 'distance')::numeric
    when jsonb_typeof(p_public_result -> 'target') = 'number'
      and jsonb_typeof(p_public_result -> 'total') = 'number'
      then abs(
        (p_public_result ->> 'target')::numeric
        - (p_public_result ->> 'total')::numeric
      )
    else null
  end;
$$;

revoke all on function private.daily_challenge_hit_number_distance(text, jsonb)
  from public, anon, authenticated;

do $daily_standings_tiebreak$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_old_history constant text := $old$
      source.game_type,
      source.normalized_score,
      source.central_day - case when p_sport = 'football' then ((extract(isodow from source.central_day)::integer + 5) % 7) else (extract(isodow from source.central_day)::integer - 1) end as week_start
$old$;
  v_new_history constant text := $new$
      source.game_type,
      source.normalized_score,
      private.daily_challenge_hit_number_distance(
        source.game_type,
        source.public_result
      ) as hit_number_distance,
      source.central_day - case when p_sport = 'football' then ((extract(isodow from source.central_day)::integer + 5) % 7) else (extract(isodow from source.central_day)::integer - 1) end as week_start
$new$;
  v_old_winners constant text := $old$
  daily_winners as (
    select central_day, max(normalized_score) as winning_score
    from history
    group by central_day
  ),
$old$;
  v_new_winners constant text := $new$
  daily_top_scores as (
    select central_day, max(normalized_score) as winning_score
    from history
    group by central_day
  ),
  daily_winners as (
    select
      history.central_day,
      top_score.winning_score,
      min(history.hit_number_distance) filter (
        where history.game_type = 'hit_the_number'
          and history.normalized_score = top_score.winning_score
      ) as winning_hit_number_distance
    from history
    join daily_top_scores top_score using (central_day)
    group by history.central_day, top_score.winning_score
  ),
$new$;
  v_old_win_filter constant text := $old$
          where history.normalized_score = daily_winners.winning_score
$old$;
  v_new_win_filter constant text := $new$
          where history.normalized_score = daily_winners.winning_score
            and (
              history.game_type <> 'hit_the_number'
              or history.hit_number_distance = daily_winners.winning_hit_number_distance
            )
$new$;
  v_old_titles constant text := $old$
      (
        coalesce(titles.weekly_titles, 0)
        + case when p_sport = 'football' then coalesce((
          select sum(adjustment.weekly_titles_bonus)
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = profile.id
        ), 0) else 0 end
      )::integer as weekly_titles
$old$;
  v_new_titles constant text := $new$
      greatest(
        0,
        coalesce(titles.weekly_titles, 0)
        + case when p_sport = 'football' then coalesce((
          select sum(adjustment.weekly_titles_bonus)
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = profile.id
        ), 0) else 0 end
        + coalesce((
          select title_adjustment.title_delta
          from private.daily_challenge_title_adjustments title_adjustment
          where title_adjustment.profile_id = profile.id
            and title_adjustment.sport = p_sport
        ), 0)
      )::integer as weekly_titles
$new$;
begin
  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('private.daily_challenge_hit_number_distance' in v_definition) = 0 then
    if position(v_old_history in v_definition) = 0
      or position(v_old_winners in v_definition) = 0
      or position(v_old_win_filter in v_definition) = 0 then
      raise exception 'Daily standings winner-resolution shape changed unexpectedly';
    end if;

    v_definition := replace(v_definition, v_old_history, v_new_history);
    v_definition := replace(v_definition, v_old_winners, v_new_winners);
    v_definition := replace(v_definition, v_old_win_filter, v_new_win_filter);
  end if;

  if position('private.daily_challenge_title_adjustments' in v_definition) = 0 then
    if position(v_old_titles in v_definition) = 0 then
      raise exception 'Daily standings title projection shape changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old_titles, v_new_titles);
  end if;

  execute v_definition;

  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('private.daily_challenge_hit_number_distance' in v_definition) = 0
    or position('winning_hit_number_distance' in v_definition) = 0
    or position('private.daily_challenge_title_adjustments' in v_definition) = 0 then
    raise exception 'Daily standings tiebreak/title patch did not apply exactly';
  end if;
end
$daily_standings_tiebreak$;

do $daily_leaderboard_tiebreak$
declare
  v_signature constant regprocedure :=
    'public.get_daily_challenge_leaderboard(date,text,text)'::regprocedure;
  v_definition text;
  v_old_rank constant text := $old$
      rank() over (order by history.normalized_score desc)::integer as score_rank
$old$;
  v_new_rank constant text := $new$
      rank() over (
        order by
          history.normalized_score desc,
          case when history.game_type = 'hit_the_number'
            then private.daily_challenge_hit_number_distance(
              history.game_type,
              history.public_result
            )
            else null
          end asc nulls last
      )::integer as score_rank
$new$;
begin
  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('private.daily_challenge_hit_number_distance' in v_definition) = 0 then
    if position(v_old_rank in v_definition) = 0 then
      raise exception 'Daily leaderboard ranking shape changed unexpectedly';
    end if;
    v_definition := replace(v_definition, v_old_rank, v_new_rank);
    execute v_definition;
  end if;

  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('private.daily_challenge_hit_number_distance' in v_definition) = 0 then
    raise exception 'Daily leaderboard Hit the Number tiebreak patch did not apply exactly';
  end if;
end
$daily_leaderboard_tiebreak$;

do $daily_tiebreak_contract$
declare
  v_shane_rank integer;
  v_lib_rank integer;
begin
  with sample(display_name, game_type, normalized_score, public_result) as (
    values
      ('SHANE', 'hit_the_number', 98, '{"distance":710}'::jsonb),
      ('LIB', 'hit_the_number', 98, '{"distance":735}'::jsonb)
  ),
  ranked as (
    select
      display_name,
      rank() over (
        order by
          normalized_score desc,
          private.daily_challenge_hit_number_distance(game_type, public_result) asc nulls last
      )::integer as score_rank
    from sample
  )
  select
    max(score_rank) filter (where display_name = 'SHANE'),
    max(score_rank) filter (where display_name = 'LIB')
  into v_shane_rank, v_lib_rank
  from ranked;

  if v_shane_rank <> 1 or v_lib_rank <> 2 then
    raise exception 'Hit the Number exact-distance tiebreak contract failed: Shane %, Lib %',
      v_shane_rank, v_lib_rank;
  end if;
end
$daily_tiebreak_contract$;
