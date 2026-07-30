import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type { NotificationPushSubscriptionInput } from "./notificationDevicePush";
import {
  notificationCategories,
  notificationKinds,
  notificationPriorities,
  type NotificationItem,
  type NotificationPreferences,
  type NotificationSnapshot,
} from "./notificationModel";

const itemRowSchema = z.object({
  id: z.string().uuid(),
  aggregation_key: z.string().min(1),
  kind: z.enum(notificationKinds),
  category: z.enum(notificationCategories),
  priority: z.enum(notificationPriorities),
  title: z.string().min(1),
  summary: z.string().min(1),
  route: z.string().nullable(),
  action_label: z.string().nullable(),
  aggregate_count: z.coerce.number().int().positive(),
  latest_event_at: z.string(),
  is_read: z.boolean(),
});

const snapshotRowSchema = z.object({
  items: z.array(itemRowSchema).optional().default([]),
  unread_count: z.coerce.number().int().nonnegative(),
});

const readRowSchema = z.object({
  unread_count: z.coerce.number().int().nonnegative(),
  marked_count: z.coerce.number().int().nonnegative().optional().default(0),
});

const preferenceRowSchema = z.object({
  picks_reminders: z.boolean(),
  daily_challenge_reminders: z.boolean(),
  game_challenge_activity: z.boolean(),
  war_room_activity: z.boolean(),
  critical_actions: z.literal(true),
  updated_at: z.string().nullable(),
});

const pushStatusRowSchema = z.object({
  current_device_registered: z.boolean(),
  active_device_count: z.coerce.number().int().nonnegative(),
});

const pushConfigurationSchema = z.object({
  public_key: z.string().min(40),
  deployment_sha: z.string().min(1).optional(),
});

export interface NotificationPushStatusSnapshot {
  currentDeviceRegistered: boolean;
  activeDeviceCount: number;
}

export interface NotificationRepository {
  loadSnapshot: () => Promise<NotificationSnapshot>;
  markRead: (notificationId: string) => Promise<number>;
  markAllRead: () => Promise<number>;
  clearRead: () => Promise<number>;
  loadPreferences: () => Promise<NotificationPreferences>;
  savePreferences: (preferences: NotificationPreferences) => Promise<NotificationPreferences>;
  subscribe: (profileId: string, onChange: () => void) => () => void;
  loadPushConfiguration?: () => Promise<string>;
  loadPushStatus?: (endpoint: string | null) => Promise<NotificationPushStatusSnapshot>;
  registerPushSubscription?: (
    subscription: NotificationPushSubscriptionInput,
  ) => Promise<NotificationPushStatusSnapshot>;
  removePushSubscription?: (endpoint: string) => Promise<NotificationPushStatusSnapshot>;
}

function toItem(value: unknown): NotificationItem {
  const row = itemRowSchema.parse(value);
  return {
    id: row.id,
    aggregationKey: row.aggregation_key,
    kind: row.kind,
    category: row.category,
    priority: row.priority,
    title: row.title,
    summary: row.summary,
    route: row.route,
    actionLabel: row.action_label,
    aggregateCount: row.aggregate_count,
    latestEventAt: row.latest_event_at,
    isRead: row.is_read,
  };
}

function toPreferences(value: unknown): NotificationPreferences {
  const row = preferenceRowSchema.parse(value);
  return {
    picksReminders: row.picks_reminders,
    dailyChallengeReminders: row.daily_challenge_reminders,
    gameChallengeActivity: row.game_challenge_activity,
    warRoomActivity: row.war_room_activity,
    criticalActions: true,
    updatedAt: row.updated_at,
  };
}

function toPushStatus(value: unknown): NotificationPushStatusSnapshot {
  const row = pushStatusRowSchema.parse(value);
  return {
    currentDeviceRegistered: row.current_device_registered,
    activeDeviceCount: row.active_device_count,
  };
}

async function requireRpcSuccess<T>(
  request: PromiseLike<{ data: T; error: { message?: string } | null }>,
  fallback: string,
) {
  const { data, error } = await request;
  if (error) throw new Error(error.message || fallback);
  return data;
}

export function createNotificationRepository(): NotificationRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadSnapshot() {
      const data = await requireRpcSuccess(
        client.rpc("get_notification_snapshot", { p_limit: 50 }),
        "Octagon HQ could not load notifications.",
      );
      const row = snapshotRowSchema.parse(data);
      return {
        items: row.items.map(toItem),
        unreadCount: row.unread_count,
      };
    },

    async markRead(notificationId) {
      const data = await requireRpcSuccess(
        client.rpc("mark_notification_read", { p_notification_id: notificationId }),
        "Octagon HQ could not update that notification.",
      );
      return readRowSchema.parse(data).unread_count;
    },

    async markAllRead() {
      const data = await requireRpcSuccess(
        client.rpc("mark_all_notifications_read"),
        "Octagon HQ could not update notifications.",
      );
      return readRowSchema.parse(data).unread_count;
    },

    async clearRead() {
      const data = await requireRpcSuccess(
        client.rpc("dismiss_read_notifications"),
        "Octagon HQ could not clear read notifications.",
      );
      return readRowSchema.parse(data).unread_count;
    },

    async loadPreferences() {
      const data = await requireRpcSuccess(
        client.rpc("get_my_notification_preferences"),
        "Octagon HQ could not load notification preferences.",
      );
      return toPreferences(data);
    },

    async savePreferences(preferences) {
      const data = await requireRpcSuccess(
        client.rpc("set_my_notification_preferences", {
          p_picks_reminders: preferences.picksReminders,
          p_daily_challenge_reminders: preferences.dailyChallengeReminders,
          p_game_challenge_activity: preferences.gameChallengeActivity,
          p_war_room_activity: preferences.warRoomActivity,
        }),
        "Octagon HQ could not save notification preferences.",
      );
      return toPreferences(data);
    },

    async loadPushConfiguration() {
      const { data, error } = await client.functions.invoke("deliver-notification-push", {
        body: { mode: "configuration" },
      });
      if (error) throw new Error("Octagon HQ could not prepare device notifications.");
      return pushConfigurationSchema.parse(data).public_key;
    },

    async loadPushStatus(endpoint) {
      const data = await requireRpcSuccess(
        client.rpc("get_my_notification_push_status", { p_endpoint: endpoint }),
        "Octagon HQ could not check this device's notification connection.",
      );
      return toPushStatus(data);
    },

    async registerPushSubscription(subscription) {
      const data = await requireRpcSuccess(
        client.rpc("register_my_notification_push_subscription", {
          p_endpoint: subscription.endpoint,
          p_p256dh: subscription.p256dh,
          p_auth: subscription.auth,
          p_user_agent: subscription.userAgent,
        }),
        "Octagon HQ could not connect this device.",
      );
      return toPushStatus(data);
    },

    async removePushSubscription(endpoint) {
      const data = await requireRpcSuccess(
        client.rpc("remove_my_notification_push_subscription", { p_endpoint: endpoint }),
        "Octagon HQ could not disconnect this device.",
      );
      return toPushStatus(data);
    },

    subscribe(profileId, onChange) {
      let active = true;
      let channel: ReturnType<typeof client.channel> | null = null;

      void client.realtime.setAuth()
        .then(() => {
          if (!active) return;
          channel = client
            .channel(`notifications:${profileId}`, { config: { private: true } })
            .on("broadcast", { event: "notification_changed" }, () => {
              if (active) onChange();
            })
            .subscribe();
        })
        .catch(() => undefined);

      return () => {
        active = false;
        if (channel) void client.removeChannel(channel);
      };
    },
  };
}
