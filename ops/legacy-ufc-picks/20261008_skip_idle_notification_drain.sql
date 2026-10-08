-- Legacy UFC Picks project ONLY: hdkjwezaswhisxupxydc.
-- This file is NOT part of Octagon HQ's production Supabase migrations.
-- Keep the existing every-minute cron and reminder queue intact; avoid
-- emitting an Edge Function HTTP request when every notification is sent.
-- Once a pending/sending/failed notification exists, normal delivery resumes
-- on the next one-minute tick without operator intervention.

create or replace function public.app_notification_tick()
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_config public.app_notification_config;
  v_queued integer := 0;
  v_request bigint;
begin
  v_queued := public.app_queue_picks_reminders();

  -- Notifications may be created by another writer between cron ticks.
  -- Never suppress a drain while any unfinished delivery exists.
  if not exists (
    select 1
    from public.app_notification_outbox
    where status <> 'sent'
  ) then
    return jsonb_build_object(
      'ok', true, 'queued', v_queued,
      'idle', true, 'request_id', null
    );
  end if;

  select * into v_config
  from public.app_notification_config
  where singleton
  limit 1;
  if not found then
    return jsonb_build_object(
      'ok', false, 'queued', v_queued,
      'error', 'Notification worker is not configured.'
    );
  end if;

  select net.http_post(
    url := v_config.edge_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', v_config.anon_key
    ),
    body := jsonb_build_object(
      'mode', 'drain',
      'internal_token', v_config.internal_token
    ),
    timeout_milliseconds := 15000
  ) into v_request;

  return jsonb_build_object(
    'ok', true, 'queued', v_queued, 'request_id', v_request
  );
end;
$function$;
