-- Publish the one-time Auction launch through the existing notification and push owners.
-- Source-event idempotency remains inside private.publish_notification_to_profile(...).

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
      'new_game_available'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function private.publish_auction_launch_notification_once()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_published integer := 0;
begin
  -- The migration transaction is all-or-nothing. Once any canonical launch source
  -- exists, the campaign is complete and later-created profiles stay outside it.
  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'new-game:auction'
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
      'new-game:auction',
      'new-game:auction',
      'new_game_available',
      'Auction is live',
      'Build your collection through sealed bids and challenge another Octagon HQ member.',
      '/play/auction',
      'PLAY NOW',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_auction_launch_notification_once()
  from public, anon, authenticated;

grant execute on function private.publish_auction_launch_notification_once()
  to service_role;

select private.publish_auction_launch_notification_once();

comment on function private.publish_auction_launch_notification_once() is
  'Publishes the one-time Auction launch to the profiles that exist when the campaign first runs, delegating notification and push ownership to the canonical publisher and trigger.';

notify pgrst, 'reload schema';
