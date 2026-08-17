-- Publish one member-wide rankings refresh announcement through the canonical
-- notification publisher and existing push-delivery trigger. Routine ranking
-- movement remains owned by What's New; this migration is a one-time campaign.

alter table private.notification_groups
  drop constraint if exists notification_groups_kind_valid;

alter table private.notification_groups
  add constraint notification_groups_kind_valid check (kind in (
    'war_room_mention',
    'war_room_reply',
    'war_room_invite_accepted',
    'game_challenge_received',
    'game_challenge_accepted',
    'game_opponent_finished',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready',
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
    'ranking_refresh_available',
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
  ));

alter table private.notification_groups
  drop constraint if exists notification_groups_category_valid;

alter table private.notification_groups
  add constraint notification_groups_category_valid check (
    category in ('social', 'picks', 'games', 'rankings', 'operations')
  );

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
    'auction_action_required',
    'auction_result_ready',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available'
  ) then
    return 'games';
  end if;

  if v_kind = 'ranking_refresh_available' then
    return 'rankings';
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
      'auction_action_required',
      'auction_result_ready',
      'picks_repick_required',
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'new_game_available',
      'ranking_refresh_available'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function private.publish_rankings_refresh_notification_once()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile record;
  v_published integer := 0;
begin
  -- The migration transaction is all-or-nothing. Once any canonical source for
  -- this campaign exists, the campaign is complete and later profiles are excluded.
  if exists (
    select 1
    from private.notification_events event
    where event.source_key = 'ranking-refresh:2026-08-16'
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
      'ranking-refresh:2026-08-16',
      'ranking-refresh:2026-08-16',
      'ranking_refresh_available',
      'Rankings refreshed through 8/16/26',
      'Islam, Dern, Dricus, Whittaker, Max and every current ranked fighter are now up to date. See what moved.',
      '/rankings',
      'VIEW RANKINGS',
      now()
    );
    v_published := v_published + 1;
  end loop;

  return v_published;
end;
$$;

revoke all on function private.publish_rankings_refresh_notification_once()
  from public, anon, authenticated;

grant execute on function private.publish_rankings_refresh_notification_once()
  to service_role;

select private.publish_rankings_refresh_notification_once();

comment on function private.publish_rankings_refresh_notification_once() is
  'Publishes the one-time 2026-08-16 rankings refresh announcement to existing profiles through the canonical notification publisher and push trigger.';

notify pgrst, 'reload schema';
