-- Final notification roadmap slice: real per-device Web Push delivery.
-- The existing notification publisher remains the sole source, aggregation, preference,
-- unread, and idempotency owner. This migration adds only device registration and
-- asynchronous delivery for rows already classified as push_candidate.

create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

create table if not exists private.notification_push_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_secret text not null,
  user_agent text,
  enabled boolean not null default true,
  failure_count integer not null default 0,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_push_endpoint_valid check (
    char_length(endpoint) between 20 and 2048 and endpoint ~ '^https://'
  ),
  constraint notification_push_p256dh_valid check (
    char_length(p256dh) between 40 and 200 and p256dh ~ '^[A-Za-z0-9_-]+$'
  ),
  constraint notification_push_auth_valid check (
    char_length(auth_secret) between 10 and 100 and auth_secret ~ '^[A-Za-z0-9_-]+$'
  ),
  constraint notification_push_user_agent_valid check (
    user_agent is null or char_length(user_agent) <= 500
  ),
  constraint notification_push_failure_count_valid check (
    failure_count between 0 and 100
  )
);

create table if not exists private.notification_push_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  notification_id uuid not null references private.notification_groups(id) on delete cascade,
  subscription_id uuid not null references private.notification_push_subscriptions(id) on delete cascade,
  notification_version timestamptz not null,
  status text not null default 'claimed',
  http_status integer,
  error_message text,
  claimed_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint notification_push_delivery_unique unique (
    notification_id,
    subscription_id,
    notification_version
  ),
  constraint notification_push_delivery_status_valid check (
    status in ('claimed', 'sent', 'failed', 'expired')
  ),
  constraint notification_push_delivery_http_status_valid check (
    http_status is null or http_status between 100 and 599
  ),
  constraint notification_push_delivery_error_valid check (
    error_message is null or char_length(error_message) <= 280
  )
);

alter table private.notification_push_subscriptions enable row level security;
alter table private.notification_push_deliveries enable row level security;
revoke all on private.notification_push_subscriptions from public, anon, authenticated;
revoke all on private.notification_push_deliveries from public, anon, authenticated;

create index if not exists notification_push_subscriptions_profile_idx
  on private.notification_push_subscriptions(profile_id, enabled);
create index if not exists notification_push_deliveries_notification_idx
  on private.notification_push_deliveries(notification_id, notification_version);

create or replace function public.get_my_notification_push_status(p_endpoint text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_endpoint text := nullif(trim(p_endpoint), '');
  v_active_count integer := 0;
  v_current_registered boolean := false;
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  select count(*)::integer
    into v_active_count
  from private.notification_push_subscriptions subscription
  where subscription.profile_id = v_profile_id
    and subscription.enabled;

  if v_endpoint is not null then
    select exists (
      select 1
      from private.notification_push_subscriptions subscription
      where subscription.profile_id = v_profile_id
        and subscription.endpoint = v_endpoint
        and subscription.enabled
    ) into v_current_registered;
  end if;

  return jsonb_build_object(
    'current_device_registered', v_current_registered,
    'active_device_count', v_active_count
  );
end;
$$;

create or replace function public.register_my_notification_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth text,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_endpoint text := trim(p_endpoint);
  v_p256dh text := trim(p_p256dh);
  v_auth text := trim(p_auth);
  v_user_agent text := nullif(left(trim(coalesce(p_user_agent, '')), 500), '');
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  if char_length(v_endpoint) not between 20 and 2048 or v_endpoint !~ '^https://' then
    raise exception 'valid push endpoint required';
  end if;
  if char_length(v_p256dh) not between 40 and 200 or v_p256dh !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'valid push encryption key required';
  end if;
  if char_length(v_auth) not between 10 and 100 or v_auth !~ '^[A-Za-z0-9_-]+$' then
    raise exception 'valid push authentication secret required';
  end if;

  insert into private.notification_push_subscriptions (
    profile_id,
    endpoint,
    p256dh,
    auth_secret,
    user_agent,
    enabled,
    failure_count,
    last_failure_at,
    updated_at
  ) values (
    v_profile_id,
    v_endpoint,
    v_p256dh,
    v_auth,
    v_user_agent,
    true,
    0,
    null,
    now()
  )
  on conflict (endpoint) do update
    set profile_id = excluded.profile_id,
        p256dh = excluded.p256dh,
        auth_secret = excluded.auth_secret,
        user_agent = excluded.user_agent,
        enabled = true,
        failure_count = 0,
        last_failure_at = null,
        updated_at = now();

  return public.get_my_notification_push_status(v_endpoint);
end;
$$;

create or replace function public.remove_my_notification_push_subscription(p_endpoint text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid := auth.uid();
  v_endpoint text := trim(p_endpoint);
begin
  if v_profile_id is null then
    raise exception 'sign in required';
  end if;

  delete from private.notification_push_subscriptions subscription
  where subscription.profile_id = v_profile_id
    and subscription.endpoint = v_endpoint;

  return public.get_my_notification_push_status(null);
end;
$$;

-- VAPID keys are generated by the trusted delivery Edge Function on first use and
-- retained in Supabase Vault. The public key is safe to return to signed-in browsers;
-- the private key remains service-role only.
create or replace function public.get_notification_push_configuration()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_public_key text;
  v_private_key text;
  v_subject text;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to read push configuration';
  end if;

  select secret.decrypted_secret into v_public_key
  from vault.decrypted_secrets secret
  where secret.name = 'octagon_web_push_public_key';

  select secret.decrypted_secret into v_private_key
  from vault.decrypted_secrets secret
  where secret.name = 'octagon_web_push_private_key';

  select secret.decrypted_secret into v_subject
  from vault.decrypted_secrets secret
  where secret.name = 'octagon_web_push_subject';

  return jsonb_build_object(
    'configured', v_public_key is not null and v_private_key is not null and v_subject is not null,
    'public_key', v_public_key,
    'private_key', v_private_key,
    'subject', v_subject
  );
end;
$$;

create or replace function public.configure_notification_push(
  p_public_key text,
  p_private_key text,
  p_subject text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to configure push delivery';
  end if;

  if char_length(trim(p_public_key)) not between 40 and 200
    or trim(p_public_key) !~ '^[A-Za-z0-9_-]+$'
    or char_length(trim(p_private_key)) not between 20 and 200
    or trim(p_private_key) !~ '^[A-Za-z0-9_-]+$'
    or trim(p_subject) !~ '^(mailto:|https://)'
  then
    raise exception 'valid VAPID configuration required';
  end if;

  if not exists (select 1 from vault.secrets where name = 'octagon_web_push_public_key') then
    perform vault.create_secret(trim(p_public_key), 'octagon_web_push_public_key', 'Octagon HQ Web Push public VAPID key.');
  end if;
  if not exists (select 1 from vault.secrets where name = 'octagon_web_push_private_key') then
    perform vault.create_secret(trim(p_private_key), 'octagon_web_push_private_key', 'Octagon HQ private VAPID key.');
  end if;
  if not exists (select 1 from vault.secrets where name = 'octagon_web_push_subject') then
    perform vault.create_secret(trim(p_subject), 'octagon_web_push_subject', 'Octagon HQ Web Push VAPID subject.');
  end if;

  return public.get_notification_push_configuration();
end;
$$;

-- The database-only delivery credential authenticates the trigger invocation without
-- exposing the service role key or a push secret to browser code.
do $$
begin
  if not exists (
    select 1 from vault.secrets where name = 'octagon_notification_push_delivery_token'
  ) then
    perform vault.create_secret(
      replace(extensions.gen_random_uuid()::text, '-', '') || replace(extensions.gen_random_uuid()::text, '-', ''),
      'octagon_notification_push_delivery_token',
      'Database-only credential for Octagon HQ notification push delivery.'
    );
  end if;
end;
$$;

create or replace function public.authorize_notification_push_delivery(p_token text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to authorize push delivery';
  end if;

  return exists (
    select 1
    from vault.decrypted_secrets secret
    where secret.name = 'octagon_notification_push_delivery_token'
      and char_length(coalesce(p_token, '')) >= 32
      and secret.decrypted_secret = p_token
  );
end;
$$;

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

create or replace function public.record_notification_push_delivery(
  p_delivery_id uuid,
  p_success boolean,
  p_http_status integer default null,
  p_error_message text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_delivery private.notification_push_deliveries;
  v_expired boolean := coalesce(p_http_status in (404, 410), false);
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'service role required to record push delivery';
  end if;

  select delivery.* into v_delivery
  from private.notification_push_deliveries delivery
  where delivery.id = p_delivery_id
  for update;

  if not found then
    raise exception 'push delivery claim was not found';
  end if;

  update private.notification_push_deliveries delivery
  set status = case
        when p_success then 'sent'
        when v_expired then 'expired'
        else 'failed'
      end,
      http_status = p_http_status,
      error_message = nullif(left(trim(coalesce(p_error_message, '')), 280), ''),
      completed_at = now()
  where delivery.id = p_delivery_id;

  if p_success then
    update private.notification_push_subscriptions subscription
    set failure_count = 0,
        last_success_at = now(),
        last_failure_at = null,
        updated_at = now()
    where subscription.id = v_delivery.subscription_id;
  else
    update private.notification_push_subscriptions subscription
    set failure_count = least(subscription.failure_count + 1, 100),
        last_failure_at = now(),
        enabled = case
          when v_expired or subscription.failure_count + 1 >= 5 then false
          else subscription.enabled
        end,
        updated_at = now()
    where subscription.id = v_delivery.subscription_id;
  end if;

  return jsonb_build_object(
    'delivery_id', p_delivery_id,
    'status', case when p_success then 'sent' when v_expired then 'expired' else 'failed' end
  );
end;
$$;

create or replace function private.enqueue_notification_push_delivery()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.priority <> 'push_candidate' or new.read_at is not null then
    return null;
  end if;

  if tg_op = 'UPDATE' then
    if new.latest_event_at is not distinct from old.latest_event_at
      and new.aggregate_count is not distinct from old.aggregate_count
    then
      return null;
    end if;
  end if;

  if not exists (
    select 1
    from private.notification_push_subscriptions subscription
    where subscription.profile_id = new.recipient_profile_id
      and subscription.enabled
  ) then
    return null;
  end if;

  perform net.http_post(
    url := 'https://rvbspcjvebgwqzssayts.supabase.co/functions/v1/deliver-notification-push',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-octagon-push-token', (
        select secret.decrypted_secret
        from vault.decrypted_secrets secret
        where secret.name = 'octagon_notification_push_delivery_token'
      )
    ),
    body := jsonb_build_object(
      'mode', 'deliver',
      'notification_id', new.id
    ),
    timeout_milliseconds := 10000
  );

  return null;
end;
$$;

revoke all on function public.get_my_notification_push_status(text) from public, anon;
revoke all on function public.register_my_notification_push_subscription(text, text, text, text) from public, anon;
revoke all on function public.remove_my_notification_push_subscription(text) from public, anon;
revoke all on function public.get_notification_push_configuration() from public, anon, authenticated;
revoke all on function public.configure_notification_push(text, text, text) from public, anon, authenticated;
revoke all on function public.authorize_notification_push_delivery(text) from public, anon, authenticated;
revoke all on function public.claim_notification_push_delivery(uuid) from public, anon, authenticated;
revoke all on function public.record_notification_push_delivery(uuid, boolean, integer, text) from public, anon, authenticated;
revoke all on function private.enqueue_notification_push_delivery() from public, anon, authenticated;

grant execute on function public.get_my_notification_push_status(text) to authenticated;
grant execute on function public.register_my_notification_push_subscription(text, text, text, text) to authenticated;
grant execute on function public.remove_my_notification_push_subscription(text) to authenticated;
grant execute on function public.get_notification_push_configuration() to service_role;
grant execute on function public.configure_notification_push(text, text, text) to service_role;
grant execute on function public.authorize_notification_push_delivery(text) to service_role;
grant execute on function public.claim_notification_push_delivery(uuid) to service_role;
grant execute on function public.record_notification_push_delivery(uuid, boolean, integer, text) to service_role;

drop trigger if exists notification_groups_push_delivery on private.notification_groups;
create trigger notification_groups_push_delivery
after insert or update on private.notification_groups
for each row execute function private.enqueue_notification_push_delivery();

comment on table private.notification_push_subscriptions is 'Private per-device Web Push subscriptions tied to one Octagon HQ profile.';
comment on table private.notification_push_deliveries is 'Idempotent delivery claims for each notification version and registered device.';
comment on function private.enqueue_notification_push_delivery() is 'Asynchronously invokes the single push-delivery Edge Function only for new unread push-candidate notification versions.';

notify pgrst, 'reload schema';
