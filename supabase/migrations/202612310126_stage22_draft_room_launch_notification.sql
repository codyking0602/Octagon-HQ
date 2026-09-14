-- Publish the one-time Football Draft Room launch through the existing
-- notification and Web Push owners. Source-event idempotency remains inside
-- private.publish_notification_to_profile(...).

create or replace function private.publish_draft_room_launch_notification_once()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_published integer := 0;
begin
  -- The migration transaction is all-or-nothing. Once any canonical launch
  -- source exists, the campaign is complete and later-created profiles stay
  -- outside it.
  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'new-game:football-draft-room'
  ) then
    return 0;
  end if;

  for v_profile in
    select profile.id
    from public.profiles profile
    order by profile.id
  loop
    perform private.publish_notification_to_profile(
      v_profile.id,
      'new-game:football-draft-room',
      'new-game:football-draft-room',
      'new_game_available',
      'NFL Draft Room is live',
      'Challenge another member in sealed-bid NFL and CFB formats.',
      '/football/draft-room',
      'PLAY NOW',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_draft_room_launch_notification_once()
  from public, anon, authenticated;

grant execute on function private.publish_draft_room_launch_notification_once()
  to service_role;

select private.publish_draft_room_launch_notification_once();

comment on function private.publish_draft_room_launch_notification_once() is
  'Publishes the one-time public Football Draft Room launch to profiles that exist when the campaign first runs, delegating in-app grouping and Web Push delivery to the canonical notification owner.';

notify pgrst, 'reload schema';
