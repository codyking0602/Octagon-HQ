export const notificationKinds = [
  "war_room_mention",
  "war_room_reply",
  "war_room_invite_accepted",
  "game_challenge_received",
  "game_challenge_accepted",
  "game_opponent_finished",
  "game_challenge_result_ready",
  "game_challenge_expiring",
  "picks_repick_required",
  "picks_fight_cancelled",
  "picks_incomplete_near_lock",
  "picks_recap_ready",
  "picks_season_result_changed",
  "ufc_event_starting",
  "daily_challenge_four_hours",
  "daily_streak_at_risk",
  "daily_challenge_available",
  "achievement_unlocked",
  "new_game_available",
  "card_change_detected",
  "fighter_replacement_detected",
  "fight_cancellation_detected",
  "fight_order_changed",
  "fight_moved_off_card",
  "published_card_mismatch",
  "event_draft_ready",
  "picks_card_missing",
  "odds_match_failed",
  "monitoring_repeatedly_failed",
  "provider_quota_low",
  "all_results_entered",
  "event_ready_to_complete",
  "post_lock_correction_review",
] as const;

export const notificationCategories = [
  "social",
  "picks",
  "games",
  "operations",
] as const;

export const notificationPriorities = ["push_candidate", "in_app"] as const;

export const notificationPreferenceKeys = [
  "picksReminders",
  "dailyChallengeReminders",
  "gameChallengeActivity",
  "warRoomActivity",
] as const;

export type NotificationKind = typeof notificationKinds[number];
export type NotificationCategory = typeof notificationCategories[number];
export type NotificationPriority = typeof notificationPriorities[number];
export type NotificationPreferenceKey = typeof notificationPreferenceKeys[number];
export type NotificationPermissionState = "unsupported" | "default" | "granted" | "denied";

export interface NotificationItem {
  id: string;
  aggregationKey: string;
  kind: NotificationKind;
  category: NotificationCategory;
  priority: NotificationPriority;
  title: string;
  summary: string;
  route: string | null;
  actionLabel: string | null;
  aggregateCount: number;
  latestEventAt: string;
  isRead: boolean;
}

export interface NotificationSnapshot {
  items: NotificationItem[];
  unreadCount: number;
}

export interface NotificationPreferences {
  picksReminders: boolean;
  dailyChallengeReminders: boolean;
  gameChallengeActivity: boolean;
  warRoomActivity: boolean;
  criticalActions: true;
  updatedAt: string | null;
}

export interface NotificationDeviceReadiness {
  status: "checking" | "ready" | "unsupported" | "error";
  secureContext: boolean;
  notificationsSupported: boolean;
  serviceWorkerSupported: boolean;
  pushSupported: boolean;
  serviceWorkerReady: boolean;
  installed: boolean;
  isIos: boolean;
  installPromptAvailable: boolean;
  permission: NotificationPermissionState;
}

export const defaultNotificationPreferences: NotificationPreferences = {
  picksReminders: true,
  dailyChallengeReminders: true,
  gameChallengeActivity: true,
  warRoomActivity: true,
  criticalActions: true,
  updatedAt: null,
};

export const initialNotificationDeviceReadiness: NotificationDeviceReadiness = {
  status: "checking",
  secureContext: false,
  notificationsSupported: false,
  serviceWorkerSupported: false,
  pushSupported: false,
  serviceWorkerReady: false,
  installed: false,
  isIos: false,
  installPromptAvailable: false,
  permission: "unsupported",
};

const categoryLabels: Record<NotificationCategory, string> = {
  social: "Social",
  picks: "Picks",
  games: "Games",
  operations: "Control",
};

const categoryMarks: Record<NotificationCategory, string> = {
  social: "@",
  picks: "✓",
  games: "★",
  operations: "!",
};

export function notificationCategoryLabel(category: NotificationCategory) {
  return categoryLabels[category];
}

export function notificationCategoryMark(category: NotificationCategory) {
  return categoryMarks[category];
}

export function formatNotificationAge(value: string, now = Date.now()) {
  const elapsed = Math.max(0, now - new Date(value).getTime());
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
