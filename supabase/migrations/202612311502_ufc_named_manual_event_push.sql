-- Manual event announcements use the current, server-owned event identity.
-- Preserve the football branch, recipient preferences, owner check and push delivery.
create or replace function public.send_active_pick_event_push(
  p_event_id text,
  p_event_title text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_event public.pick_events;
  v_profile record;
  v_published integer := 0;
  v_target_type text;
  v_notification_type text;
  v_title text;
  v_body text;
  v_route text;
begin
  if not public.is_pick_control_owner(auth.uid()) then
    raise exception 'pick control owner required';
  end if;

  select event.* into v_event
  from public.pick_events event
  where event.event_id = p_event_id
    and event.status in ('upcoming', 'locked');

  if not found or v_event.name <> trim(p_event_title) then
    raise exception 'active pick event changed';
  end if;

  if coalesce(v_event.sport, 'mma') = 'football' then
    v_target_type := 'football-event:' || v_event.event_id;
    v_notification_type := 'football_picks_open';
    v_title := v_event.name || ' picks are open';
    v_body := 'This week''s Football Picks slate is published. Make your picks before kickoff.';
    v_route := '/football/picks';
  else
    v_target_type := 'ufc-event:' || v_event.event_id;
    v_notification_type := 'ufc_event_starting';
    v_title := v_event.name ||
      case when nullif(trim(v_event.subtitle), '') is null
        then ' picks are open'
        else ': ' || trim(v_event.subtitle) end;
    v_body := 'Published and ready for picks. Make yours before the deadline.';
    v_route := '/picks';
  end if;

  for v_profile in select profile.id from public.profiles profile order by profile.id
  loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'manual-event-push:' || v_event.event_id || ':' || extensions.gen_random_uuid()::text,
      v_target_type,
      v_notification_type,
      v_title,
      v_body,
      v_route,
      'MAKE PICKS',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$function$;

revoke all on function public.send_active_pick_event_push(text, text) from public, anon;
grant execute on function public.send_active_pick_event_push(text, text) to authenticated;
notify pgrst, 'reload schema';
