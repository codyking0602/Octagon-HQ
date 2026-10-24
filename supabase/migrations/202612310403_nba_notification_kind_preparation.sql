-- DRAFT: allow NBA's future push and in-app kinds; no producer, scheduler,
-- or notification publication is installed or activated by this migration.
-- NBA owner previews remain private and are never published as public push.

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
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'nba_launch_available',
    'nba_daily_four_hours',
    'nba_results_ready',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'mlb_round_available',
    'mlb_round_recap',
    'daily_challenge_four_hours',
    'daily_streak_at_risk',
    'daily_challenge_available',
    'achievement_unlocked',
    'new_game_available',
    'ranking_refresh_available',
    'fighter_watchlist_added',
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
    'new_game_available',
    'mlb_launch_available',
    'mlb_challenge_available',
    'mlb_challenge_four_hours',
    'nba_launch_available',
    'nba_daily_four_hours',
    'nba_results_ready'
  ) then
    return 'games';
  end if;

  if v_kind in ('ranking_refresh_available', 'fighter_watchlist_added') then
    return 'rankings';
  end if;

  if v_kind in (
    'picks_repick_required',
    'picks_fight_cancelled',
    'picks_incomplete_near_lock',
    'picks_recap_ready',
    'picks_season_result_changed',
    'picks_card_updated',
    'ufc_event_starting',
    'football_picks_open',
    'mlb_round_available',
    'mlb_round_recap'
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
      'picks_incomplete_near_lock',
      'picks_recap_ready',
      'ufc_event_starting',
      'football_picks_open',
      'new_game_available',
      'daily_challenge_four_hours',
      'mlb_launch_available',
      'mlb_challenge_available',
      'mlb_challenge_four_hours',
      'mlb_round_available',
      'nba_launch_available',
        'nba_daily_four_hours'
    )
  then
    return 'push_candidate';
  end if;

  return 'in_app';
end;
$$;

-- UFC repick/card-update records are in-app only. Old delivery rows are
-- historical: new claims are also suppressed by the sport-push selector.
update private.notification_groups
set priority = 'in_app'
where kind in ('picks_repick_required','picks_card_updated')
  and priority = 'push_candidate';

-- NBA has no "available" notification: one closing-only reminder every 48 hours.
-- Launch is push eligible only after explicit public release authorization.
-- NBA results stay in-app until editorial rules explicitly change.
notify pgrst, 'reload schema';
