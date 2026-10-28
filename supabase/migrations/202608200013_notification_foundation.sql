create table if not exists private.notification_owner (
  singleton boolean primary key default true,
  profile_id uuid not null unique references public.profiles(id) on delete restrict,
  updated_at timestamptz not null default now(),
  constraint notification_owner_singleton_true check (singleton)
);

create table if not exists private.notification_groups (
  id uuid primary key default extensions.gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  aggregation_key text not null,
  kind text not null,
  category text not null,
  priority text not null,
  title text not null,
  summary text not null,
  route text,
  action_label text,
  aggregate_count integer not null default 1,
  latest_event_at timestamptz not null default now(),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_groups_recipient_aggregation_unique unique (
    recipient_profile_id,
    aggregation_key
  ),
  constraint notification_groups_aggregation_key_length check (
    char_length(trim(aggregation_key)) between 3 and 180
  ),
  constraint notification_groups_kind_valid check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'ufc_event_starting',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  )),
  constraint notification_groups_category_valid check (
    category in ('social', 'picks', 'games', 'operations')
  ),
  constraint notification_groups_priority_valid check (
    priority in ('push_candidate', 'in_app')
  ),
  constraint notification_groups_title_length check (
    char_length(trim(title)) between 1 and 100
  ),
  constraint notification_groups_summary_length check (
    char_length(trim(summary)) between 1 and 280
  ),
  constraint notification_groups_route_valid check (
    route is null or route ~ '^/'
  ),
  constraint notification_groups_action_length check (
    action_label is null or char_length(trim(action_label)) between 1 and 40
  ),
  constraint notification_groups_count_positive check (
    aggregate_count between 1 and 9999
  )
);

create table if not exists private.notification_events (
  id uuid primary key default extensions.gen_random_uuid(),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  source_key text not null,
  group_id uuid references private.notification_groups(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint notification_events_recipient_source_unique unique (
    recipient_profile_id,
    source_key
  ),
  constraint notification_events_source_key_length check (
    char_length(trim(source_key)) between 3 and 220
  )
);

alter table private.notification_owner enable row level security;
alter table private.notification_groups enable row level security;
alter table private.notification_events enable row level security;

revoke all on private.notification_owner from public, anon, authenticated;
revoke all on private.notification_groups from public, anon, authenticated;
revoke all on private.notification_events from public, anon, authenticated;

create index if not exists notification_groups_recipient_feed_idx
  on private.notification_groups(
    recipient_profile_id,
    latest_event_at desc,
    id desc
  );

create index if not exists notification_groups_recipient_unread_idx
  on private.notification_groups(recipient_profile_id, read_at)
  where read_at is null;

create index if not exists notification_events_group_idx
  on private.notification_events(group_id);

insert into private.notification_owner(singleton, profile_id)
select true, profile.id
from public.profiles profile
where upper(trim(profile.display_name)) = 'CODY'
order by profile.id
limit 1
on conflict (singleton) do nothing;

create or replace function private.notification_category_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring'
  ) then
    return 'social';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'ufc_event_starting'
  ) then
    return 'picks';
  end if;

  if v_kind in (
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available'
  ) then
    return 'games';
  end if;

  if v_kind in (
    'card_change_detected',
    'fighter_replacement_detected',
    'fight_cancellation_detected',
    'fight_order_changed',
    'fight_moved_off_card',
    'published_card_mismatch',
    'event_draft_ready',
    'picks_card_missing',
    'odds_match_failed',
    'monitoring_repeatedly_failed',
    'provider_quota_low',
    'all_results_entered',
    'event_ready_to_complete',
    'post_lock_correction_review'
  ) then
    return 'operations';
  end if;

  raise exception 'unsupported notification kind: %', v_kind;
end;
$$;

create or replace function private.notification_priority_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if private.notification_category_for_kind(v_kind) = 'operations'
    or v_kind in (
      'war_room_mention',
      'war_room_reply',
      'game_challenge_received',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

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
      'created', false
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
      'created', false
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
    'created', true
  );
end;
$$;

create or replace function public.publish_notification(
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
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  return private.publish_notification_to_profile(
    p_recipient_profile_id,
    p_source_key,
    p_aggregation_key,
    p_kind,
    p_title,
    p_summary,
    p_route,
    p_action_label,
    p_occurred_at
  );
end;
$$;

create or replace function public.publish_owner_notification(
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
  v_owner_profile_id uuid;
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if private.notification_category_for_kind(p_kind) <> 'operations' then
    raise exception 'owner notification publisher accepts operational alerts only';
  end if;

  select owner.profile_id
    into v_owner_profile_id
  from private.notification_owner owner
  where owner.singleton = true;

  if v_owner_profile_id is null then
    raise exception 'notification owner is not configured';
  end if;

  return private.publish_notification_to_profile(
    v_owner_profile_id,
    p_source_key,
    p_aggregation_key,
    p_kind,
    p_title,
    p_summary,
    p_route,
    p_action_label,
    p_occurred_at
  );
end;
$$;

create or replace function public.set_notification_owner(p_profile_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() <> 'service_role' then
    raise exception 'not allowed';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = p_profile_id
  ) then
    raise exception 'Octagon HQ profile was not found';
  end if;

  insert into private.notification_owner(singleton, profile_id, updated_at)
  values (true, p_profile_id, now())
  on conflict (singleton) do update
    set profile_id = excluded.profile_id,
        updated_at = now();

  return jsonb_build_object('profile_id', p_profile_id);
end;
$$;

create or replace function public.get_notification_snapshot(p_limit integer default 50)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
  v_items jsonb := '[]'::jsonb;
  v_unread_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if not exists (
    select 1 from public.profiles profile where profile.id = v_profile_id
  ) then
    raise exception 'Octagon HQ profile required';
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', visible.id,
      'aggregation_key', visible.aggregation_key,
      'kind', visible.kind,
      'category', visible.category,
      'priority', visible.priority,
      'title', visible.title,
      'summary', visible.summary,
      'route', visible.route,
      'action_label', visible.action_label,
      'aggregate_count', visible.aggregate_count,
      'latest_event_at', visible.latest_event_at,
      'is_read', visible.read_at is not null
    )
    order by visible.latest_event_at desc, visible.id desc
  ), '[]'::jsonb)
    into v_items
  from (
    select notification.*
    from private.notification_groups notification
    where notification.recipient_profile_id = v_profile_id
    order by notification.latest_event_at desc, notification.id desc
    limit v_limit
  ) visible;

  select count(*)::integer
    into v_unread_count
  from private.notification_groups notification
  where notification.recipient_profile_id = v_profile_id
    and notification.read_at is null;

  return jsonb_build_object(
    'items', v_items,
    'unread_count', coalesce(v_unread_count, 0)
  );
end;
$$;

create or replace function public.mark_notification_read(p_notification_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_unread_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  update private.notification_groups notification
  set read_at = coalesce(notification.read_at, now()),
      updated_at = now()
  where notification.id = p_notification_id
    and notification.recipient_profile_id = v_profile_id;

  if not found then
    raise exception 'notification was not found';
  end if;

  select count(*)::integer
    into v_unread_count
  from private.notification_groups notification
  where notification.recipient_profile_id = v_profile_id
    and notification.read_at is null;

  return jsonb_build_object(
    'unread_count', coalesce(v_unread_count, 0),
    'marked_count', 1
  );
end;
$$;

create or replace function public.mark_all_notifications_read()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_marked_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  update private.notification_groups notification
  set read_at = now(),
      updated_at = now()
  where notification.recipient_profile_id = v_profile_id
    and notification.read_at is null;

  get diagnostics v_marked_count = row_count;

  return jsonb_build_object(
    'unread_count', 0,
    'marked_count', v_marked_count
  );
end;
$$;

revoke all on function private.notification_category_for_kind(text) from public, anon, authenticated;
revoke all on function private.notification_priority_for_kind(text) from public, anon, authenticated;
revoke all on function private.publish_notification_to_profile(uuid, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;

revoke all on function public.publish_notification(uuid, text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.publish_owner_notification(text, text, text, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.set_notification_owner(uuid) from public, anon, authenticated;
revoke all on function public.get_notification_snapshot(integer) from public, anon;
revoke all on function public.mark_notification_read(uuid) from public, anon;
revoke all on function public.mark_all_notifications_read() from public, anon;

grant execute on function public.publish_notification(uuid, text, text, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.publish_owner_notification(text, text, text, text, text, text, text, timestamptz) to service_role;
grant execute on function public.set_notification_owner(uuid) to service_role;
grant execute on function public.get_notification_snapshot(integer) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;

drop policy if exists notification_profile_receives_broadcast on realtime.messages;
create policy notification_profile_receives_broadcast
on realtime.messages
for select
to authenticated
using (
  realtime.topic() = 'notifications:' || auth.uid()::text
  and extension = 'broadcast'
);

create or replace function private.broadcast_notification_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification_id uuid := coalesce(new.id, old.id);
  v_recipient_profile_id uuid := coalesce(
    new.recipient_profile_id,
    old.recipient_profile_id
  );
begin
  perform realtime.send(
    jsonb_build_object(
      'notification_id', v_notification_id,
      'operation', lower(tg_op)
    ),
    'notification_changed',
    'notifications:' || v_recipient_profile_id::text,
    true
  );
  return null;
end;
$$;

revoke all on function private.broadcast_notification_change() from public, anon, authenticated;

drop trigger if exists notification_groups_broadcast on private.notification_groups;
create trigger notification_groups_broadcast
after insert or update or delete on private.notification_groups
for each row execute function private.broadcast_notification_change();

comment on table private.notification_groups is 'One flat, profile-targeted Octagon HQ notification list with cross-device read state.';
comment on table private.notification_events is 'Idempotent source events used to aggregate repeated unread notifications without duplicate rows.';
comment on table private.notification_owner is 'The single owner profile eligible for operational Octagon HQ notifications.';
comment on function public.publish_notification(uuid, text, text, text, text, text, text, text, timestamptz) is 'Service-only notification publisher. Repeated unread events sharing an aggregation key collapse into one counted row.';
comment on function public.publish_owner_notification(text, text, text, text, text, text, text, timestamptz) is 'Service-only publisher for Cody-only operational review alerts.';
