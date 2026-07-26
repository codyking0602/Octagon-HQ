create or replace function public.list_member_cards()
returns table (
  display_name text,
  initials text,
  favorite_fighter_slug text,
  current_streak integer,
  picks_correct integer,
  picks_incorrect integer,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with history_ranked as (
    select
      history.profile_id,
      history.day,
      row_number() over (
        partition by history.profile_id
        order by history.day desc
      )::integer as descending_index,
      max(history.day) over (partition by history.profile_id) as latest_day
    from public.find_leader_history history
  ),
  current_streaks as (
    select
      ranked.profile_id,
      case
        when max(ranked.latest_day) >= ((now() at time zone 'America/Chicago')::date - 1)
          then count(*) filter (
            where ranked.day = ranked.latest_day - (ranked.descending_index - 1)
          )::integer
        else 0
      end as current_streak
    from history_ranked ranked
    group by ranked.profile_id
  ),
  current_season as (
    select coalesce(max(event.season), extract(year from now())::integer) as season
    from public.pick_events event
  ),
  pick_summaries as (
    select
      pick.profile_id,
      count(*) filter (
        where bout.winner_fighter_slug is not null
          and bout.winner_fighter_slug = pick.fighter_slug
      )::integer as correct,
      count(*) filter (
        where bout.winner_fighter_slug is not null
          and bout.winner_fighter_slug <> pick.fighter_slug
      )::integer as incorrect
    from public.profile_event_picks pick
    join public.pick_events event on event.event_id = pick.event_id
    join public.pick_bouts bout
      on bout.event_id = pick.event_id
     and bout.bout_id = pick.bout_id
    cross join current_season season
    where event.season = season.season
    group by pick.profile_id
  )
  select
    profile.display_name,
    profile.initials,
    preference.favorite_fighter_slug,
    coalesce(streak.current_streak, 0),
    coalesce(picks.correct, 0),
    coalesce(picks.incorrect, 0),
    profile.id = auth.uid()
  from public.profiles profile
  left join public.profile_preferences preference on preference.profile_id = profile.id
  left join current_streaks streak on streak.profile_id = profile.id
  left join pick_summaries picks on picks.profile_id = profile.id
  where auth.uid() is not null
  order by (profile.id = auth.uid()) desc, profile.display_name asc;
$$;

create or replace function public.get_member_profile(p_member_name text)
returns table (
  display_name text,
  initials text,
  favorite_fighter_slug text,
  current_streak integer,
  best_streak integer,
  perfect_runs integer,
  recorded_days integer,
  best_find_leader_score integer,
  picks_correct integer,
  picks_incorrect integer,
  picks_pending integer,
  picks_events_entered integer,
  is_current_user boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with requested_profile as (
    select profile.*
    from public.profiles profile
    where profile.normalized_name = upper(regexp_replace(trim(p_member_name), '\s+', ' ', 'g'))
      and auth.uid() is not null
    limit 1
  ),
  history_ranked as (
    select
      history.profile_id,
      history.day,
      row_number() over (
        partition by history.profile_id
        order by history.day desc
      )::integer as descending_index,
      max(history.day) over (partition by history.profile_id) as latest_day
    from public.find_leader_history history
    join requested_profile profile on profile.id = history.profile_id
  ),
  current_streak as (
    select
      ranked.profile_id,
      case
        when max(ranked.latest_day) >= ((now() at time zone 'America/Chicago')::date - 1)
          then count(*) filter (
            where ranked.day = ranked.latest_day - (ranked.descending_index - 1)
          )::integer
        else 0
      end as value
    from history_ranked ranked
    group by ranked.profile_id
  ),
  history_grouped as (
    select
      history.profile_id,
      history.day - row_number() over (
        partition by history.profile_id
        order by history.day asc
      )::integer as streak_group
    from public.find_leader_history history
    join requested_profile profile on profile.id = history.profile_id
  ),
  streak_lengths as (
    select grouped.profile_id, count(*)::integer as length
    from history_grouped grouped
    group by grouped.profile_id, grouped.streak_group
  ),
  best_streak as (
    select lengths.profile_id, max(lengths.length)::integer as value
    from streak_lengths lengths
    group by lengths.profile_id
  ),
  history_summary as (
    select
      history.profile_id,
      count(*) filter (where history.official_score = 10)::integer as perfect_runs,
      count(*)::integer as recorded_days,
      max(history.official_score)::integer as best_score
    from public.find_leader_history history
    join requested_profile profile on profile.id = history.profile_id
    group by history.profile_id
  ),
  current_season as (
    select coalesce(max(event.season), extract(year from now())::integer) as season
    from public.pick_events event
  ),
  pick_summary as (
    select
      pick.profile_id,
      count(*) filter (
        where bout.winner_fighter_slug is not null
          and bout.winner_fighter_slug = pick.fighter_slug
      )::integer as correct,
      count(*) filter (
        where bout.winner_fighter_slug is not null
          and bout.winner_fighter_slug <> pick.fighter_slug
      )::integer as incorrect,
      count(*) filter (where bout.winner_fighter_slug is null)::integer as pending,
      count(distinct pick.event_id)::integer as events_entered
    from public.profile_event_picks pick
    join requested_profile profile on profile.id = pick.profile_id
    join public.pick_events event on event.event_id = pick.event_id
    join public.pick_bouts bout
      on bout.event_id = pick.event_id
     and bout.bout_id = pick.bout_id
    cross join current_season season
    where event.season = season.season
    group by pick.profile_id
  )
  select
    profile.display_name,
    profile.initials,
    preference.favorite_fighter_slug,
    coalesce(current_run.value, 0),
    coalesce(best_run.value, 0),
    coalesce(history.perfect_runs, 0),
    coalesce(history.recorded_days, 0),
    coalesce(history.best_score, 0),
    coalesce(picks.correct, 0),
    coalesce(picks.incorrect, 0),
    coalesce(picks.pending, 0),
    coalesce(picks.events_entered, 0),
    profile.id = auth.uid()
  from requested_profile profile
  left join public.profile_preferences preference on preference.profile_id = profile.id
  left join current_streak current_run on current_run.profile_id = profile.id
  left join best_streak best_run on best_run.profile_id = profile.id
  left join history_summary history on history.profile_id = profile.id
  left join pick_summary picks on picks.profile_id = profile.id;
$$;

revoke all on function public.list_member_cards() from public, anon;
revoke all on function public.get_member_profile(text) from public, anon;
grant execute on function public.list_member_cards() to authenticated;
grant execute on function public.get_member_profile(text) to authenticated;
