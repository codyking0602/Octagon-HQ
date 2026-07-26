alter table public.profile_preferences
  add column if not exists avatar_photo_data text;

alter table public.profile_preferences
  drop constraint if exists profile_avatar_photo_data_valid;

alter table public.profile_preferences
  add constraint profile_avatar_photo_data_valid check (
    avatar_photo_data is null
    or (
      char_length(avatar_photo_data) <= 240000
      and avatar_photo_data ~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$'
    )
  );

-- Bring forward the existing V1 avatar when the legacy tables share this database.
do $$
begin
  if to_regclass('public.pick_group_members') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'pick_group_members'
        and column_name = 'profile_photo_data'
    )
  then
    execute $copy_avatar$
      insert into public.profile_preferences (profile_id, avatar_photo_data, updated_at)
      select
        profile.id,
        legacy.profile_photo_data,
        now()
      from public.profiles profile
      join public.pick_group_members legacy
        on upper(regexp_replace(trim(legacy.display_name), '\s+', ' ', 'g')) = profile.normalized_name
      where legacy.profile_photo_data is not null
        and char_length(legacy.profile_photo_data) <= 240000
        and legacy.profile_photo_data ~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$'
      on conflict (profile_id) do update
      set avatar_photo_data = coalesce(
            public.profile_preferences.avatar_photo_data,
            excluded.avatar_photo_data
          ),
          updated_at = case
            when public.profile_preferences.avatar_photo_data is null then now()
            else public.profile_preferences.updated_at
          end
    $copy_avatar$;
  end if;
end;
$$;

-- Find the Leader can legitimately be 0/10. Preserve those results in V2.
alter table public.find_leader_history
  drop constraint if exists find_leader_official_score_range;
alter table public.find_leader_history
  drop constraint if exists find_leader_best_score_range;

alter table public.find_leader_history
  add constraint find_leader_official_score_range check (official_score between 0 and 10);
alter table public.find_leader_history
  add constraint find_leader_best_score_range check (best_score between 0 and 10);

-- Bring forward V1 Find the Leader history when the legacy tables share this database.
do $$
begin
  if to_regclass('public.pick_group_members') is not null
    and to_regclass('public.play_daily_attempts') is not null
    and exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'play_daily_attempts'
        and column_name = 'challenge_day'
    )
  then
    execute $copy_history$
      insert into public.find_leader_history (
        profile_id,
        day,
        official_score,
        best_score,
        attempts,
        completed_at,
        updated_at
      )
      select
        profile.id,
        daily.challenge_day,
        greatest(0, least(10, max(daily.official_score)))::smallint,
        greatest(0, least(10, max(daily.best_score)))::smallint,
        greatest(1, max(daily.attempt_count))::integer,
        min(daily.first_completed_at),
        now()
      from public.play_daily_attempts daily
      join public.pick_group_members legacy on legacy.id = daily.member_id
      join public.profiles profile
        on upper(regexp_replace(trim(legacy.display_name), '\s+', ' ', 'g')) = profile.normalized_name
      where daily.game_type = 'find-leader'
      group by profile.id, daily.challenge_day
      on conflict (profile_id, day) do update
      set best_score = greatest(public.find_leader_history.best_score, excluded.best_score),
          attempts = greatest(public.find_leader_history.attempts, excluded.attempts),
          completed_at = least(public.find_leader_history.completed_at, excluded.completed_at),
          updated_at = now()
    $copy_history$;
  end if;
end;
$$;

create or replace function public.record_my_find_leader_attempt(
  p_day date,
  p_score integer,
  p_completed_at timestamptz default now()
)
returns public.find_leader_history
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_row public.find_leader_history;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if p_day is null or p_score < 0 or p_score > 10 then
    raise exception 'invalid Find the Leader result';
  end if;

  insert into public.find_leader_history (
    profile_id,
    day,
    official_score,
    best_score,
    attempts,
    completed_at,
    updated_at
  )
  values (
    v_profile_id,
    p_day,
    p_score,
    p_score,
    1,
    coalesce(p_completed_at, now()),
    now()
  )
  on conflict (profile_id, day) do update
  set best_score = greatest(public.find_leader_history.best_score, excluded.best_score),
      attempts = public.find_leader_history.attempts + 1,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.record_my_find_leader_attempt(date, integer, timestamptz) from public, anon;
grant execute on function public.record_my_find_leader_attempt(date, integer, timestamptz) to authenticated;

create or replace function public.set_my_avatar_photo(p_avatar_photo_data text)
returns public.profile_preferences
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_photo text := nullif(trim(p_avatar_photo_data), '');
  v_row public.profile_preferences;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if v_photo is not null and (
    char_length(v_photo) > 240000
    or v_photo !~ '^data:image/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$'
  ) then
    raise exception 'invalid profile photo';
  end if;

  insert into public.profile_preferences (profile_id, avatar_photo_data, updated_at)
  values (v_profile_id, v_photo, now())
  on conflict (profile_id) do update
  set avatar_photo_data = excluded.avatar_photo_data,
      updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.set_my_avatar_photo(text) from public, anon;
grant execute on function public.set_my_avatar_photo(text) to authenticated;

drop function if exists public.list_member_cards();
create function public.list_member_cards()
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

drop function if exists public.get_member_profile(text);
create function public.get_member_profile(p_member_name text)
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
          when count(*) filter (where bout.winner_fighter_slug is null) > 0
            then (count(*) filter (where bout.winner_fighter_slug is null))::text || ' pending'
          else
            (count(*) filter (
              where bout.winner_fighter_slug is not null
                and bout.winner_fighter_slug = pick.fighter_slug
            ))::text
            || '-'
            || (count(*) filter (
              where bout.winner_fighter_slug is not null
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
