-- Add explicit official outcome state without rewriting existing Picks history.
alter table public.pick_events
  add column if not exists completed_at timestamptz;

update public.pick_events
set completed_at = coalesce(completed_at, updated_at, starts_at)
where status = 'complete'
  and completed_at is null;

alter table public.pick_events
  drop constraint if exists pick_event_completion_shape;

alter table public.pick_events
  add constraint pick_event_completion_shape check (
    (status = 'complete' and completed_at is not null)
    or (status in ('upcoming', 'locked') and completed_at is null)
  );

alter table public.pick_bouts
  add column if not exists result_status text;

alter table public.pick_bouts
  add column if not exists result_recorded_at timestamptz;

update public.pick_bouts bout
set result_status = case
      when bout.winner_fighter_slug = bout.red_fighter_slug then 'red_win'
      when bout.winner_fighter_slug = bout.blue_fighter_slug then 'blue_win'
      else 'pending'
    end,
    result_recorded_at = case
      when bout.winner_fighter_slug is not null
        then coalesce(event.completed_at, event.updated_at, event.starts_at)
      else null
    end
from public.pick_events event
where event.event_id = bout.event_id
  and bout.result_status is null;

alter table public.pick_bouts
  alter column result_status set default 'pending';

alter table public.pick_bouts
  alter column result_status set not null;

alter table public.pick_bouts
  drop constraint if exists pick_bout_result_status;

alter table public.pick_bouts
  add constraint pick_bout_result_status check (
    result_status in ('pending', 'red_win', 'blue_win', 'draw', 'no_contest', 'cancelled')
  );

alter table public.pick_bouts
  drop constraint if exists pick_bout_result_shape;

alter table public.pick_bouts
  add constraint pick_bout_result_shape check (
    (
      result_status = 'pending'
      and winner_fighter_slug is null
      and result_recorded_at is null
    )
    or (
      result_status = 'red_win'
      and winner_fighter_slug = red_fighter_slug
      and result_recorded_at is not null
    )
    or (
      result_status = 'blue_win'
      and winner_fighter_slug = blue_fighter_slug
      and result_recorded_at is not null
    )
    or (
      result_status in ('draw', 'no_contest', 'cancelled')
      and winner_fighter_slug is null
      and result_recorded_at is not null
    )
  );

-- One trusted mutation owner records or clears a bout's official outcome.
create or replace function public.record_official_pick_bout_result(
  p_event_id text,
  p_bout_id text,
  p_result_status text
)
returns public.pick_bouts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_bout_id text := lower(trim(p_bout_id));
  v_result_status text := lower(trim(p_result_status));
  v_event public.pick_events;
  v_bout public.pick_bouts;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required';
  end if;

  if v_result_status not in ('pending', 'red_win', 'blue_win', 'draw', 'no_contest', 'cancelled') then
    raise exception 'invalid official bout result';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = 'complete' then
    raise exception 'completed event results are immutable';
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before recording results';
  end if;

  select * into v_bout
  from public.pick_bouts
  where event_id = v_event_id
    and bout_id = v_bout_id
  for update;

  if not found then
    raise exception 'bout not found';
  end if;

  update public.pick_bouts
  set result_status = v_result_status,
      winner_fighter_slug = case v_result_status
        when 'red_win' then v_bout.red_fighter_slug
        when 'blue_win' then v_bout.blue_fighter_slug
        else null
      end,
      result_recorded_at = case
        when v_result_status = 'pending' then null
        else now()
      end
  where event_id = v_event_id
    and bout_id = v_bout_id
  returning * into v_bout;

  return v_bout;
end;
$$;

revoke all on function public.record_official_pick_bout_result(text, text, text)
  from public, anon, authenticated;
grant execute on function public.record_official_pick_bout_result(text, text, text)
  to service_role;

-- One transition owner moves an event forward. Completion is atomic and only
-- succeeds after every bout has a final decisive or excluded outcome.
create or replace function public.transition_pick_event(
  p_event_id text,
  p_target_status text
)
returns public.pick_events
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_id text := lower(trim(p_event_id));
  v_target_status text := lower(trim(p_target_status));
  v_event public.pick_events;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required';
  end if;

  if v_target_status not in ('locked', 'complete') then
    raise exception 'invalid event transition';
  end if;

  select * into v_event
  from public.pick_events
  where event_id = v_event_id
  for update;

  if not found then
    raise exception 'event not found';
  end if;

  if v_event.status = v_target_status then
    return v_event;
  end if;

  if v_event.status = 'complete' then
    raise exception 'completed event is immutable';
  end if;

  if now() < v_event.locks_at then
    raise exception 'event cannot advance before Picks lock';
  end if;

  if v_target_status = 'locked' then
    if v_event.status <> 'upcoming' then
      raise exception 'event cannot transition to locked';
    end if;

    update public.pick_events
    set status = 'locked',
        completed_at = null,
        updated_at = now()
    where event_id = v_event_id
    returning * into v_event;

    return v_event;
  end if;

  if v_event.status <> 'locked' then
    raise exception 'event must be locked before completion';
  end if;

  if not exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
  ) then
    raise exception 'event has no bouts';
  end if;

  if exists (
    select 1
    from public.pick_bouts bout
    where bout.event_id = v_event_id
      and bout.result_status = 'pending'
  ) then
    raise exception 'all bout results must be resolved before completion';
  end if;

  update public.pick_events
  set status = 'complete',
      completed_at = now(),
      updated_at = now()
  where event_id = v_event_id
  returning * into v_event;

  return v_event;
end;
$$;

revoke all on function public.transition_pick_event(text, text)
  from public, anon, authenticated;
grant execute on function public.transition_pick_event(text, text)
  to service_role;

-- Keep the public current-event contract compatible while exposing explicit
-- result state for future recap consumers.
create or replace function public.get_current_pick_event()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'event_id', event.event_id,
    'name', event.name,
    'subtitle', event.subtitle,
    'venue', event.venue,
    'location', event.location,
    'starts_at', event.starts_at,
    'locks_at', event.locks_at,
    'season', event.season,
    'status', case
      when event.status = 'complete' then 'complete'
      when now() >= event.locks_at then 'locked'
      else 'upcoming'
    end,
    'bouts', coalesce((
      select jsonb_agg(jsonb_build_object(
        'bout_id', bout.bout_id,
        'position', bout.position,
        'weight_class', bout.weight_class,
        'red_fighter_slug', bout.red_fighter_slug,
        'red_fighter_name', bout.red_fighter_name,
        'blue_fighter_slug', bout.blue_fighter_slug,
        'blue_fighter_name', bout.blue_fighter_name,
        'winner_fighter_slug', bout.winner_fighter_slug,
        'result_status', bout.result_status,
        'result_recorded_at', bout.result_recorded_at
      ) order by bout.position)
      from public.pick_bouts bout
      where bout.event_id = event.event_id
    ), '[]'::jsonb)
  )
  from public.pick_events event
  where event.status in ('upcoming', 'locked')
  order by event.starts_at asc
  limit 1;
$$;

revoke all on function public.get_current_pick_event() from public;
grant execute on function public.get_current_pick_event() to anon, authenticated;

-- Preserve the existing app-facing season summary while excluding draws,
-- no contests, and cancelled bouts from both wins and losses.
create or replace function public.get_my_pick_summary(p_season integer default null)
returns table (
  correct integer,
  incorrect integer,
  pending integer,
  events_entered integer
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    count(*) filter (
      where bout.result_status in ('red_win', 'blue_win')
        and bout.winner_fighter_slug = pick.fighter_slug
    )::integer as correct,
    count(*) filter (
      where bout.result_status in ('red_win', 'blue_win')
        and bout.winner_fighter_slug <> pick.fighter_slug
    )::integer as incorrect,
    count(*) filter (where bout.result_status = 'pending')::integer as pending,
    count(distinct pick.event_id)::integer as events_entered
  from public.profile_event_picks pick
  join public.pick_events event on event.event_id = pick.event_id
  join public.pick_bouts bout
    on bout.event_id = pick.event_id
   and bout.bout_id = pick.bout_id
  where pick.profile_id = auth.uid()
    and (p_season is null or event.season = p_season);
$$;

revoke all on function public.get_my_pick_summary(integer) from public, anon;
grant execute on function public.get_my_pick_summary(integer) to authenticated;

-- One authenticated recap projection owns completed-event and season records.
create or replace function public.get_my_pick_history(p_season integer default null)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with bout_rows as (
    select
      event.event_id,
      event.name,
      event.subtitle,
      event.venue,
      event.location,
      event.starts_at,
      event.season,
      event.completed_at,
      bout.bout_id,
      bout.position,
      bout.weight_class,
      bout.red_fighter_slug,
      bout.red_fighter_name,
      bout.blue_fighter_slug,
      bout.blue_fighter_name,
      bout.result_status,
      bout.winner_fighter_slug,
      pick.fighter_slug as picked_fighter_slug,
      case
        when bout.result_status in ('draw', 'no_contest', 'cancelled') then 'excluded'
        when bout.result_status = 'pending' then 'pending'
        when pick.fighter_slug is null then 'missing'
        when pick.fighter_slug = bout.winner_fighter_slug then 'correct'
        else 'incorrect'
      end as verdict
    from public.pick_events event
    join public.pick_bouts bout on bout.event_id = event.event_id
    left join public.profile_event_picks pick
      on pick.profile_id = auth.uid()
     and pick.event_id = bout.event_id
     and pick.bout_id = bout.bout_id
    where auth.uid() is not null
      and event.status = 'complete'
      and (p_season is null or event.season = p_season)
  ),
  grouped_events as (
    select
      event_id,
      name,
      subtitle,
      venue,
      location,
      starts_at,
      season,
      completed_at,
      count(*) filter (where verdict = 'correct')::integer as correct,
      count(*) filter (where verdict = 'incorrect')::integer as incorrect,
      count(*) filter (where verdict = 'missing')::integer as missing,
      count(*) filter (where verdict = 'excluded')::integer as excluded,
      jsonb_agg(
        jsonb_build_object(
          'bout_id', bout_id,
          'position', position,
          'weight_class', weight_class,
          'red_fighter_slug', red_fighter_slug,
          'red_fighter_name', red_fighter_name,
          'blue_fighter_slug', blue_fighter_slug,
          'blue_fighter_name', blue_fighter_name,
          'result_status', result_status,
          'winner_fighter_slug', winner_fighter_slug,
          'picked_fighter_slug', picked_fighter_slug,
          'verdict', verdict
        )
        order by position
      ) as bouts
    from bout_rows
    group by event_id, name, subtitle, venue, location, starts_at, season, completed_at
  ),
  season_summary as (
    select
      count(*) filter (where verdict = 'correct')::integer as correct,
      count(*) filter (where verdict = 'incorrect')::integer as incorrect,
      count(*) filter (where verdict = 'missing')::integer as missing,
      count(*) filter (where verdict = 'excluded')::integer as excluded,
      count(distinct event_id) filter (where picked_fighter_slug is not null)::integer as events_entered
    from bout_rows
  ),
  completed_events as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'event_id', event_id,
          'name', name,
          'subtitle', subtitle,
          'venue', venue,
          'location', location,
          'starts_at', starts_at,
          'season', season,
          'completed_at', completed_at,
          'record', jsonb_build_object(
            'correct', correct,
            'incorrect', incorrect,
            'missing', missing,
            'excluded', excluded
          ),
          'bouts', bouts
        )
        order by starts_at desc
      ),
      '[]'::jsonb
    ) as items
    from grouped_events
  )
  select jsonb_build_object(
    'season', p_season,
    'summary', jsonb_build_object(
      'correct', summary.correct,
      'incorrect', summary.incorrect,
      'missing', summary.missing,
      'excluded', summary.excluded,
      'events_entered', summary.events_entered
    ),
    'events', events.items
  )
  from season_summary summary
  cross join completed_events events;
$$;

revoke all on function public.get_my_pick_history(integer) from public, anon;
grant execute on function public.get_my_pick_history(integer) to authenticated;

-- Keep Member Profiles on the same scoring semantics.
create or replace function public.list_member_cards()
returns table (
  display_name text,
  initials text,
  avatar_photo_data text,
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
        where bout.result_status in ('red_win', 'blue_win')
          and bout.winner_fighter_slug = pick.fighter_slug
      )::integer as correct,
      count(*) filter (
        where bout.result_status in ('red_win', 'blue_win')
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
    preference.avatar_photo_data,
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
  avatar_photo_data text,
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
  recent_activity jsonb,
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
        where bout.result_status in ('red_win', 'blue_win')
          and bout.winner_fighter_slug = pick.fighter_slug
      )::integer as correct,
      count(*) filter (
        where bout.result_status in ('red_win', 'blue_win')
          and bout.winner_fighter_slug <> pick.fighter_slug
      )::integer as incorrect,
      count(*) filter (where bout.result_status = 'pending')::integer as pending,
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
  ),
  recent_activity as (
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'kind', activity.kind,
          'title', activity.title,
          'detail', activity.detail,
          'occurred_at', activity.occurred_at
        )
        order by activity.occurred_at desc
      ),
      '[]'::jsonb
    ) as items
    from (
      select
        'find-leader'::text as kind,
        'Find the Leader'::text as title,
        history.official_score::text || '/10' as detail,
        history.completed_at as occurred_at
      from public.find_leader_history history
      join requested_profile profile on profile.id = history.profile_id

      union all

      select
        'picks'::text as kind,
        event.name::text as title,
        case
          when count(*) filter (where bout.result_status = 'pending') > 0
            then (count(*) filter (where bout.result_status = 'pending'))::text || ' pending'
          else
            (count(*) filter (
              where bout.result_status in ('red_win', 'blue_win')
                and bout.winner_fighter_slug = pick.fighter_slug
            ))::text
            || '-'
            || (count(*) filter (
              where bout.result_status in ('red_win', 'blue_win')
                and bout.winner_fighter_slug <> pick.fighter_slug
            ))::text
            || ' Picks'
        end as detail,
        event.starts_at as occurred_at
      from public.profile_event_picks pick
      join requested_profile profile on profile.id = pick.profile_id
      join public.pick_events event on event.event_id = pick.event_id
      join public.pick_bouts bout
        on bout.event_id = pick.event_id
       and bout.bout_id = pick.bout_id
      group by event.event_id, event.name, event.starts_at
      order by occurred_at desc
      limit 5
    ) activity
  )
  select
    profile.display_name,
    profile.initials,
    preference.avatar_photo_data,
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
    recent.items,
    profile.id = auth.uid()
  from requested_profile profile
  left join public.profile_preferences preference on preference.profile_id = profile.id
  left join current_streak current_run on current_run.profile_id = profile.id
  left join best_streak best_run on best_run.profile_id = profile.id
  left join history_summary history on history.profile_id = profile.id
  left join pick_summary picks on picks.profile_id = profile.id
  cross join recent_activity recent;
$$;

revoke all on function public.list_member_cards() from public, anon;
revoke all on function public.get_member_profile(text) from public, anon;
grant execute on function public.list_member_cards() to authenticated;
grant execute on function public.get_member_profile(text) to authenticated;

-- Migration-level catalog assertions keep the production owner narrow.
do $$
begin
  if to_regprocedure('public.record_official_pick_bout_result(text,text,text)') is null then
    raise exception 'official bout result owner was not created';
  end if;

  if to_regprocedure('public.transition_pick_event(text,text)') is null then
    raise exception 'event transition owner was not created';
  end if;

  if to_regprocedure('public.get_my_pick_history(integer)') is null then
    raise exception 'completed-event projection was not created';
  end if;

  if has_function_privilege('anon', 'public.record_official_pick_bout_result(text,text,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.record_official_pick_bout_result(text,text,text)', 'EXECUTE')
    or has_function_privilege('anon', 'public.transition_pick_event(text,text)', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.transition_pick_event(text,text)', 'EXECUTE')
  then
    raise exception 'official Picks mutation owner is exposed to browser roles';
  end if;
end;
$$;
