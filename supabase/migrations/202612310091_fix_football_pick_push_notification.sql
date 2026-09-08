-- Keep manual Picks announcements on the existing notification publisher and push-delivery trigger.
-- Football introduced a sport-specific kind in the canonical sender, so register that kind everywhere
-- the notification model validates, categorizes, prioritizes, and applies member preferences.

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
    'football_picks_open',
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
    'ufc_event_starting',
    'football_picks_open'
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
      'ufc_event_starting',
      'football_picks_open',
      'new_game_available',
      'daily_challenge_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

create or replace function private.notification_preference_key_for_kind(p_kind text)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_kind text := trim(p_kind);
begin
  if v_kind in ('picks_incomplete_near_lock', 'ufc_event_starting', 'football_picks_open') then
    return 'picks_reminders';
  end if;

  if v_kind = 'daily_challenge_four_hours' then
    return 'daily_challenge_reminders';
  end if;

  if v_kind in (
    'game_challenge_received',
    'game_challenge_accepted',
    'game_challenge_result_ready',
    'game_challenge_expiring',
    'auction_action_required',
    'auction_result_ready'
  ) then
    return 'game_challenge_activity';
  end if;

  if v_kind in ('war_room_mention', 'war_room_reply', 'war_room_invite_accepted') then
    return 'war_room_activity';
  end if;

  return null;
end;
$$;

do $$
begin
  if private.notification_category_for_kind('football_picks_open') <> 'picks' then
    raise exception 'football Picks push category registration failed';
  end if;

  if private.notification_priority_for_kind('football_picks_open') <> 'push_candidate' then
    raise exception 'football Picks push priority registration failed';
  end if;

  if private.notification_preference_key_for_kind('football_picks_open') <> 'picks_reminders' then
    raise exception 'football Picks push preference registration failed';
  end if;

  if private.notification_priority_for_kind('ufc_event_starting') <> 'push_candidate' then
    raise exception 'manual UFC Picks push priority regressed';
  end if;
end;
$$;

notify pgrst, 'reload schema';
