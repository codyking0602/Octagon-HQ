-- Notification roadmap PR 2 of 3: member preferences and device-push readiness.
-- This migration adds no push subscription, provider, delivery worker, or second inbox.

create table if not exists private.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  picks_reminders boolean not null default true,
  daily_challenge_reminders boolean not null default true,
  game_challenge_activity boolean not null default true,
  war_room_activity boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table private.notification_preferences enable row level security;
revoke all on private.notification_preferences from public, anon, authenticated;

create or replace function private.notification_preference_key_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in ('picks_incomplete_near_lock', 'ufc_event_starting') then
    return 'picks_reminders';
  end if;

  if v_kind = 'daily_challenge_four_hours' then
    return 'daily_challenge_reminders';
  end if;

  if v_kind in (
    'game_challenge_received',
    'game_challenge_accepted',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'game_challenge_activity';
  end if;

  if v_kind in ('war_room_mention', 'war_room_reply', 'war_room_invite_accepted') then
    return 'war_room_activity';
  end if;

  -- Repicks, cancellations, recap/result corrections, account actions, and Cody-only
  -- operations are intentionally not optional.
  return null;
end;
$$;

create or replace function private.notification_preference_enabled(
  p_profile_id uuid,
  p_kind text
)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_key text := private.notification_preference_key_for_kind(p_kind);
  v_preferences private.notification_preferences;
begin
  if v_key is null then
    return true;
  end if;

  select preference.*
    into v_preferences
  from private.notification_preferences preference
  where preference.profile_id = p_profile_id;

  if not found then
    return true;
  end if;

  return case v_key
    when 'picks_reminders' then v_preferences.picks_reminders
    when 'daily_challenge_reminders' then v_preferences.daily_challenge_reminders
    when 'game_challenge_activity' then v_preferences.game_challenge_activity
    when 'war_room_activity' then v_preferences.war_room_activity
    else true
  end;
end;
$$;

create or replace function public.get_my_notification_preferences()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_preferences private.notification_preferences;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select preference.*
    into v_preferences
  from private.notification_preferences preference
  where preference.profile_id = v_profile_id;

  return jsonb_build_object(
    'picks_reminders', coalesce(v_preferences.picks_reminders, true),
    'daily_challenge_reminders', coalesce(v_preferences.daily_challenge_reminders, true),
    'game_challenge_activity', coalesce(v_preferences.game_challenge_activity, true),
    'war_room_activity', coalesce(v_preferences.war_room_activity, true),
    'critical_actions', true,
    'updated_at', v_preferences.updated_at
  );
end;
$$;

create or replace function public.set_my_notification_preferences(
  p_picks_reminders boolean,
  p_daily_challenge_reminders boolean,
  p_game_challenge_activity boolean,
  p_war_room_activity boolean
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_preferences private.notification_preferences;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if p_picks_reminders is null
    or p_daily_challenge_reminders is null
    or p_game_challenge_activity is null
    or p_war_room_activity is null
  then
    raise exception 'complete notification preferences are required';
  end if;

  insert into private.notification_preferences (
    profile_id,
    picks_reminders,
    daily_challenge_reminders,
    game_challenge_activity,
    war_room_activity,
    updated_at
  ) values (
    v_profile_id,
    p_picks_reminders,
    p_daily_challenge_reminders,
    p_game_challenge_activity,
    p_war_room_activity,
    now()
  )
  on conflict (profile_id) do update
    set picks_reminders = excluded.picks_reminders,
        daily_challenge_reminders = excluded.daily_challenge_reminders,
        game_challenge_activity = excluded.game_challenge_activity,
        war_room_activity = excluded.war_room_activity,
        updated_at = now()
  returning * into v_preferences;

  return jsonb_build_object(
    'picks_reminders', v_preferences.picks_reminders,
    'daily_challenge_reminders', v_preferences.daily_challenge_reminders,
    'game_challenge_activity', v_preferences.game_challenge_activity,
    'war_room_activity', v_preferences.war_room_activity,
    'critical_actions', true,
    'updated_at', v_preferences.updated_at
  );
end;
$$;

revoke all on function public.get_my_notification_preferences() from public, anon;
revoke all on function public.set_my_notification_preferences(boolean, boolean, boolean, boolean) from public, anon;
grant execute on function public.get_my_notification_preferences() to authenticated;
grant execute on function public.set_my_notification_preferences(boolean, boolean, boolean, boolean) to authenticated;

-- Keep the canonical publisher as the only aggregation/idempotency owner. Optional
-- preference suppression happens only for a new source event, after existing-source
-- idempotency and Cody-only operational enforcement have been preserved.
create or replace function private.publish_notification_to_profile(
  p_recipient_profile_id uuid,
  p_source_key text,
  p_aggregation_key text,
  p_kind text,
  p_title text,
  p_summary text,
  p_route text default null,
  p_action_label text default null,
  p_occurred_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_source_key text := trim(p_source_key);
  v_aggregation_key text := trim(p_aggregation_key);
  v_kind text := trim(p_kind);
  v_category text;
  v_priority text;
  v_event_id uuid;
  v_existing_group_id uuid;
  v_group private.notification_groups;
  v_owner_profile_id uuid;
begin
  if p_recipient_profile_id is null or not exists (
    select 1
    from public.profiles profile
    where profile.id = p_recipient_profile_id
  ) then
    raise exception 'Octagon HQ notification recipient was not found';
  end if;

  if char_length(v_source_key) < 3 or char_length(v_source_key) > 220 then
    raise exception 'notification source key is invalid';
  end if;

  if char_length(v_aggregation_key) < 3 or char_length(v_aggregation_key) > 180 then
    raise exception 'notification aggregation key is invalid';
  end if;

  v_category := private.notification_category_for_kind(v_kind);
  v_priority := private.notification_priority_for_kind(v_kind);

  if v_category = 'operations' then
    select owner.profile_id
      into v_owner_profile_id
    from private.notification_owner owner
    where owner.singleton = true;

    if v_owner_profile_id is null or p_recipient_profile_id <> v_owner_profile_id then
      raise exception 'operational notifications are restricted to the owner account';
    end if;
  end if;

  select event.group_id
    into v_existing_group_id
  from private.notification_events event
  where event.recipient_profile_id = p_recipient_profile_id
    and event.source_key = v_source_key;

  if found then
    select notification.*
      into v_group
    from private.notification_groups notification
    where notification.id = v_existing_group_id;

    if not found then
      raise exception 'notification source exists without its canonical group';
    end if;

    return jsonb_build_object(
      'id', v_group.id,
      'aggregate_count', v_group.aggregate_count,
      'created', false,
      'suppressed', false
    );
  end if;

  if not private.notification_preference_enabled(p_recipient_profile_id, v_kind) then
    return jsonb_build_object(
      'id', null,
      'aggregate_count', 0,
      'created', false,
      'suppressed', true
    );
  end if;

  insert into private.notification_events (
    recipient_profile_id,
    source_key,
    group_id,
    occurred_at
  )
  values (
    p_recipient_profile_id,
    v_source_key,
    null,
    coalesce(p_occurred_at, now())
  )
  on conflict (recipient_profile_id, source_key) do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select event.group_id
      into v_existing_group_id
    from private.notification_events event
    where event.recipient_profile_id = p_recipient_profile_id
      and event.source_key = v_source_key;

    select notification.*
      into v_group
    from private.notification_groups notification
    where notification.id = v_existing_group_id;

    if not found then
      raise exception 'notification source could not resolve its canonical group';
    end if;

    return jsonb_build_object(
      'id', v_group.id,
      'aggregate_count', v_group.aggregate_count,
      'created', false,
      'suppressed', false
    );
  end if;

  insert into private.notification_groups (
    recipient_profile_id,
    aggregation_key,
    kind,
    category,
    priority,
    title,
    summary,
    route,
    action_label,
    aggregate_count,
    latest_event_at,
    read_at
  )
  values (
    p_recipient_profile_id,
    v_aggregation_key,
    v_kind,
    v_category,
    v_priority,
    trim(p_title),
    trim(p_summary),
    nullif(trim(p_route), ''),
    nullif(trim(p_action_label), ''),
    1,
    coalesce(p_occurred_at, now()),
    null
  )
  on conflict (recipient_profile_id, aggregation_key) do update
    set kind = excluded.kind,
        category = excluded.category,
        priority = excluded.priority,
        title = excluded.title,
        summary = excluded.summary,
        route = excluded.route,
        action_label = excluded.action_label,
        aggregate_count = case
          when private.notification_groups.read_at is null
            then least(private.notification_groups.aggregate_count + 1, 9999)
          else 1
        end,
        latest_event_at = greatest(
          private.notification_groups.latest_event_at,
          excluded.latest_event_at
        ),
        read_at = null,
        updated_at = now()
  returning * into v_group;

  update private.notification_events event
  set group_id = v_group.id
  where event.id = v_event_id;

  return jsonb_build_object(
    'id', v_group.id,
    'aggregate_count', v_group.aggregate_count,
    'created', true,
    'suppressed', false
  );
end;
$$;
