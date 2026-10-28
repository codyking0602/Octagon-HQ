-- Bell notifications are always part of the in-app Octagon HQ experience.
-- Push delivery is the only member-controlled notification setting.

update private.notification_preferences
set picks_reminders = true,
    daily_challenge_reminders = true,
    game_challenge_activity = true,
    war_room_activity = true,
    updated_at = now()
where not picks_reminders
   or not daily_challenge_reminders
   or not game_challenge_activity
   or not war_room_activity;

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
begin
  -- The canonical publisher still validates the profile and notification kind.
  -- This compatibility helper now always allows the in-app bell event.
  return true;
end;
$$;

revoke all on function private.notification_preference_enabled(uuid, text)
  from public, anon, authenticated;

comment on function private.notification_preference_enabled(uuid, text) is
  'Compatibility helper: in-app bell notifications are always enabled; device push is controlled only by per-device subscriptions.';
