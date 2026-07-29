import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  WhatsNewItem,
  WhatsNewSnapshot,
} from "./whatsNewModel";

const itemRowSchema = z.object({
  id: z.string().uuid(),
  source_key: z.string().min(1),
  kind: z.enum([
    "new_fighter",
    "ranking_movement",
    "new_game",
    "picks_event_completed",
    "new_recap",
    "fighters_to_watch",
    "new_challenge",
    "major_ranking_update",
    "achievement",
    "app_announcement",
    "redesign",
    "featured_content",
    "poll",
    "community_prompt",
    "temporary_notice",
    "weekly_summary",
    "monthly_summary",
    "rule_change",
  ]),
  category: z.enum([
    "rankings",
    "fighters",
    "picks",
    "games",
    "challenges",
    "community",
    "app",
  ]),
  origin: z.enum(["automatic", "manual"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  route: z.string().nullable(),
  action_label: z.string().nullable(),
  published_at: z.string(),
  lifecycle: z.enum(["active", "archive"]),
  is_read: z.boolean(),
});

const snapshotRowSchema = z.object({
  items: z.array(itemRowSchema).optional().default([]),
  unread_count: z.coerce.number().int().nonnegative(),
  latest_item_id: z.string().uuid().nullable(),
});

const readRowSchema = z.object({
  unread_count: z.coerce.number().int().nonnegative(),
  last_seen_item_id: z.string().uuid().nullable(),
});

export interface WhatsNewRepository {
  loadSnapshot: () => Promise<WhatsNewSnapshot>;
  markRead: (itemId: string) => Promise<number>;
  subscribe: (onChange: () => void) => () => void;
}

function toItem(value: unknown): WhatsNewItem {
  const row = itemRowSchema.parse(value);
  return {
    id: row.id,
    sourceKey: row.source_key,
    kind: row.kind,
    category: row.category,
    origin: row.origin,
    title: row.title,
    summary: row.summary,
    route: row.route,
    actionLabel: row.action_label,
    publishedAt: row.published_at,
    lifecycle: row.lifecycle,
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

export function createWhatsNewRepository(): WhatsNewRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async loadSnapshot() {
      const data = await requireRpcSuccess(
        client.rpc("get_whats_new_snapshot", { p_limit: 50 }),
        "Octagon HQ could not load What's New.",
      );
      const row = snapshotRowSchema.parse(data);
      return {
        items: row.items.map(toItem),
        unreadCount: row.unread_count,
        latestItemId: row.latest_item_id,
      };
    },

    async markRead(itemId) {
      const data = await requireRpcSuccess(
        client.rpc("mark_whats_new_read", { p_item_id: itemId }),
        "Octagon HQ could not update What's New.",
      );
      return readRowSchema.parse(data).unread_count;
    },

    subscribe(onChange) {
      let active = true;
      let channel: ReturnType<typeof client.channel> | null = null;

      void client.realtime.setAuth()
        .then(() => {
          if (!active) return;
          channel = client
            .channel("whats-new:feed", { config: { private: true } })
            .on("broadcast", { event: "whats_new_changed" }, () => {
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
