-- The owner chooses when to announce a published card. This action delegates all
-- creation, preference, aggregation, and delivery behavior to the canonical publisher.

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
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'ufc_event_starting',
      'new_game_available',
      'daily_challenge_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function public.send_active_pick_event_push(
  p_event_id text,
  p_event_title text
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event public.pick_events;
  v_profile record;
  v_published integer := 0;
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

  for v_profile in select profile.id from public.profiles profile order by profile.id
  loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'manual-event-push:' || v_event.event_id || ':' || extensions.gen_random_uuid()::text,
      'ufc-event:' || v_event.event_id,
      'ufc_event_starting',
      v_event.name || ' picks are open',
      'The active UFC card is published. Make your picks before the deadline.',
      '/picks',
      'MAKE PICKS',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function public.send_active_pick_event_push(text, text) from public, anon;
grant execute on function public.send_active_pick_event_push(text, text) to authenticated;

comment on function public.send_active_pick_event_push(text, text) is
  'Owner-only manual active-card action that delegates notification creation to the canonical private publisher and its push-delivery trigger.';

notify pgrst, 'reload schema';
