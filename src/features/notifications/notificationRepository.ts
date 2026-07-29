import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import {
  notificationCategories,
  notificationKinds,
  notificationPriorities,
  type NotificationItem,
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

export interface NotificationRepository {
  loadSnapshot: () => Promise<NotificationSnapshot>;
  markRead: (notificationId: string) => Promise<number>;
  markAllRead: () => Promise<number>;
  subscribe: (profileId: string, onChange: () => void) => () => void;
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
