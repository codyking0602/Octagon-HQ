-- Keep Picks deadline-change notices in the in-app inbox while excluding them
-- from the canonical device-push claim boundary.
create or replace function public.claim_notification_push_delivery(p_notification_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_notification private.notification_groups;
  v_subscription private.notification_push_subscriptions;
  v_delivery_id uuid;
  v_deliveries jsonb := '[]'::jsonb;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to claim push delivery';
  end if;

  select notification.* into v_notification
  from private.notification_groups notification
  where notification.id = p_notification_id;

  if not found
    or v_notification.priority <> 'push_candidate'
    or v_notification.read_at is not null
    or v_notification.aggregation_key like 'picks-deadline-changed:%'
  then
    return jsonb_build_object('notification', null, 'deliveries', '[]'::jsonb);
  end if;

  for v_subscription in
    select subscription.*
    from private.notification_push_subscriptions subscription
    where subscription.profile_id = v_notification.recipient_profile_id
      and subscription.enabled
    order by subscription.created_at, subscription.id
  loop
    v_delivery_id := null;
    insert into private.notification_push_deliveries (
      notification_id,
      subscription_id,
      notification_version,
      status,
      claimed_at
    ) values (
      v_notification.id,
      v_subscription.id,
      v_notification.latest_event_at,
      'claimed',
      now()
    )
    on conflict (notification_id, subscription_id, notification_version) do nothing
    returning id into v_delivery_id;

    if v_delivery_id is not null then
      v_deliveries := v_deliveries || jsonb_build_array(jsonb_build_object(
        'delivery_id', v_delivery_id,
        'subscription_id', v_subscription.id,
        'endpoint', v_subscription.endpoint,
        'p256dh', v_subscription.p256dh,
        'auth', v_subscription.auth_secret
      ));
    end if;
  end loop;

  return jsonb_build_object(
    'notification', jsonb_build_object(
      'id', v_notification.id,
      'title', v_notification.title,
      'summary', v_notification.summary,
      'route', coalesce(v_notification.route, '/notifications'),
      'category', v_notification.category,
      'kind', v_notification.kind,
      'aggregate_count', v_notification.aggregate_count,
      'latest_event_at', v_notification.latest_event_at
    ),
    'deliveries', v_deliveries
  );
end;
$$;

revoke all on function public.claim_notification_push_delivery(uuid) from public, anon, authenticated;
grant execute on function public.claim_notification_push_delivery(uuid) to service_role;

comment on function public.claim_notification_push_delivery(uuid) is
  'Claims device-push deliveries for eligible notification groups, excluding in-app-only Picks deadline-change notices.';

notify pgrst, 'reload schema';
