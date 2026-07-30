-- Keep the canonical notification group as the single history owner while allowing members
-- to clear read rows without deleting source-idempotency evidence.

alter table private.notification_groups
  add column if not exists dismissed_at timestamptz;

create or replace function private.reset_notification_dismissal_on_reopen()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.read_at is null
    and (
      old.read_at is not null
      or new.latest_event_at > old.latest_event_at
    )
  then
    new.dismissed_at := null;
  end if;
  return new;
end;
$$;

revoke all on function private.reset_notification_dismissal_on_reopen()
  from public, anon, authenticated;

drop trigger if exists notification_group_reopen_clears_dismissal
  on private.notification_groups;
create trigger notification_group_reopen_clears_dismissal
before update of read_at, latest_event_at
on private.notification_groups
for each row
execute function private.reset_notification_dismissal_on_reopen();

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
      and notification.dismissed_at is null
      and (
        notification.read_at is null
        or notification.read_at >= now() - interval '30 days'
      )
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

create or replace function public.dismiss_read_notifications()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_dismissed_count integer := 0;
  v_unread_count integer := 0;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  update private.notification_groups notification
  set dismissed_at = now(),
      updated_at = now()
  where notification.recipient_profile_id = v_profile_id
    and notification.read_at is not null
    and notification.dismissed_at is null;

  get diagnostics v_dismissed_count = row_count;

  select count(*)::integer
    into v_unread_count
  from private.notification_groups notification
  where notification.recipient_profile_id = v_profile_id
    and notification.read_at is null;

  return jsonb_build_object(
    'unread_count', coalesce(v_unread_count, 0),
    'marked_count', v_dismissed_count
  );
end;
$$;

revoke all on function public.get_notification_snapshot(integer) from public, anon;
revoke all on function public.dismiss_read_notifications() from public, anon;
grant execute on function public.get_notification_snapshot(integer) to authenticated;
grant execute on function public.dismiss_read_notifications() to authenticated;

comment on column private.notification_groups.dismissed_at is
  'Member-controlled read-history dismissal. New activity on the canonical group clears this value.';
comment on function public.dismiss_read_notifications() is
  'Hides the signed-in member''s read notification groups without deleting source idempotency history.';

notify pgrst, 'reload schema';
