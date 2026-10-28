-- One-time Football Daily transition from Monday-Sunday to Tuesday-Monday.
-- Preserve Troy's already-earned Sep 7-13 title and carry his Sep 14 daily win
-- into the first native Tuesday-start week (Sep 15-21). Normal cadence applies after.

create table if not exists private.football_daily_transition_adjustments (
  transition_key text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  carry_week_start date not null,
  weekly_wins_bonus integer not null default 0 check (weekly_wins_bonus >= 0),
  weekly_titles_bonus integer not null default 0 check (weekly_titles_bonus >= 0),
  note text not null,
  created_at timestamptz not null default now(),
  unique (profile_id, carry_week_start)
);

revoke all on private.football_daily_transition_adjustments
  from public, anon, authenticated;

insert into private.football_daily_transition_adjustments(
  transition_key,
  profile_id,
  carry_week_start,
  weekly_wins_bonus,
  weekly_titles_bonus,
  note
)
select
  'football-2026-tuesday-cadence-troy',
  profile.id,
  date '2026-09-15',
  1,
  1,
  'Preserve the Sep 7-13 Football weekly title and carry the Sep 14 Daily win into Sep 15-21.'
from public.profiles profile
where lower(profile.display_name) = 'troy'
on conflict (transition_key) do update
set
  profile_id = excluded.profile_id,
  carry_week_start = excluded.carry_week_start,
  weekly_wins_bonus = excluded.weekly_wins_bonus,
  weekly_titles_bonus = excluded.weekly_titles_bonus,
  note = excluded.note;

do $standings$
declare
  v_signature constant regprocedure := 'public.get_daily_challenge_standings(text)'::regprocedure;
  v_definition text;
  v_old_weekly_stats constant text := $old$
  weekly_stats as (
    select
      history.profile_id,
      history.week_start,
      count(*)::integer as played,
      (
        count(*) filter (
          where history.normalized_score = daily_winners.winning_score
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          where auction_result.profile_id = history.profile_id
            and auction_result.week_start = history.week_start
            and auction_result.is_winner
        ) else 0 end
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id, history.week_start
  ),
$old$;
  v_new_weekly_stats constant text := $new$
  weekly_stats_base as (
    select
      history.profile_id,
      history.week_start,
      count(*)::integer as played,
      (
        count(*) filter (
          where history.normalized_score = daily_winners.winning_score
        )
        + case when p_sport = 'football' then (
          select count(*)
          from private.football_weekly_auction_results auction_result
          where auction_result.profile_id = history.profile_id
            and auction_result.week_start = history.week_start
            and auction_result.is_winner
        ) else 0 end
      )::integer as wins,
      round(avg(history.normalized_score)::numeric, 1) as average_score
    from history
    join daily_winners using (central_day)
    group by history.profile_id, history.week_start
  ),
  weekly_keys as (
    select base.profile_id, base.week_start
    from weekly_stats_base base

    union

    select adjustment.profile_id, adjustment.carry_week_start
    from private.football_daily_transition_adjustments adjustment
    where p_sport = 'football'
  ),
  weekly_stats as (
    select
      key.profile_id,
      key.week_start,
      coalesce(base.played, 0)::integer as played,
      (
        coalesce(base.wins, 0)
        + case when p_sport = 'football'
          then coalesce(adjustment.weekly_wins_bonus, 0)
          else 0
        end
      )::integer as wins,
      coalesce(base.average_score, 0)::numeric as average_score
    from weekly_keys key
    left join weekly_stats_base base
      on base.profile_id = key.profile_id
     and base.week_start = key.week_start
    left join private.football_daily_transition_adjustments adjustment
      on p_sport = 'football'
     and adjustment.profile_id = key.profile_id
     and adjustment.carry_week_start = key.week_start
  ),
$new$;
  v_old_title_projection constant text :=
    'coalesce(titles.weekly_titles, 0)::integer as weekly_titles';
  v_new_title_projection constant text := $new$
      (
        coalesce(titles.weekly_titles, 0)
        + case when p_sport = 'football' then coalesce((
          select sum(adjustment.weekly_titles_bonus)
          from private.football_daily_transition_adjustments adjustment
          where adjustment.profile_id = profile.id
        ), 0) else 0 end
      )::integer as weekly_titles$new$;
begin
  select pg_get_functiondef(v_signature::oid)
  into v_definition;

  if position('v_football_championship_start date := date ''2026-09-08'';' in v_definition) = 0 then
    raise exception 'Football championship cutoff changed unexpectedly before transition carry';
  end if;
  v_definition := replace(
    v_definition,
    'v_football_championship_start date := date ''2026-09-08'';',
    'v_football_championship_start date := date ''2026-09-15'';'
  );

  if position(v_old_weekly_stats in v_definition) = 0 then
    raise exception 'Football weekly stats projection changed unexpectedly before transition carry';
  end if;
  v_definition := replace(v_definition, v_old_weekly_stats, v_new_weekly_stats);

  if position(v_old_title_projection in v_definition) = 0 then
    raise exception 'Football weekly title projection changed unexpectedly before transition carry';
  end if;
  v_definition := replace(v_definition, v_old_title_projection, v_new_title_projection);

  execute v_definition;
end
$standings$;

do $contract$
declare
  v_definition text;
begin
  select pg_get_functiondef('public.get_daily_challenge_standings(text)'::regprocedure::oid)
  into v_definition;

  if position('v_football_championship_start date := date ''2026-09-15''' in v_definition) = 0 then
    raise exception 'Football native Tuesday title era must begin Sep 15';
  end if;

  if position('private.football_daily_transition_adjustments' in v_definition) = 0 then
    raise exception 'Football transition adjustment is not wired into standings';
  end if;

  if exists (
    select 1 from public.profiles profile where lower(profile.display_name) = 'troy'
  ) and not exists (
    select 1
    from private.football_daily_transition_adjustments adjustment
    join public.profiles profile on profile.id = adjustment.profile_id
    where adjustment.transition_key = 'football-2026-tuesday-cadence-troy'
      and lower(profile.display_name) = 'troy'
      and adjustment.carry_week_start = date '2026-09-15'
      and adjustment.weekly_wins_bonus = 1
      and adjustment.weekly_titles_bonus = 1
  ) then
    raise exception 'Troy transition carry was not persisted correctly';
  end if;
end
$contract$;
