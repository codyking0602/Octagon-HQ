import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  WarRoomAccess,
  WarRoomCursor,
  WarRoomJoinResult,
  WarRoomMember,
  WarRoomMessage,
  WarRoomReadState,
  WarRoomRealtimeStatus,
  WarRoomSnapshot,
} from "./warRoomModel";

const memberRowSchema = z.object({
  id: z.string().uuid(),
  display_name: z.string().min(1),
  initials: z.string().min(1).max(2),
  avatar_photo_data: z.string().nullable().optional(),
});

const parentRowSchema = z.object({
  id: z.string().uuid(),
  body: z.string().nullable(),
  deleted: z.boolean(),
  author: memberRowSchema,
});

const messageRowSchema = z.object({
  id: z.string().uuid(),
  body: z.string().nullable(),
  deleted: z.boolean(),
  created_at: z.string(),
  author: memberRowSchema,
  parent: parentRowSchema.nullable(),
  mentions: z.array(memberRowSchema).optional().default([]),
  can_delete: z.boolean(),
});

const cursorRowSchema = z.object({
  created_at: z.string(),
  id: z.string().uuid(),
});

const snapshotRowSchema = z.object({
  role: z.enum(["member", "admin"]),
  messages: z.array(messageRowSchema).optional().default([]),
  members: z.array(memberRowSchema).optional().default([]),
  has_more: z.boolean(),
  next_cursor: cursorRowSchema.nullable(),
  unread_count: z.coerce.number().int().nonnegative(),
  latest_message_id: z.string().uuid().nullable(),
});

const accessRowSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("locked"), eligible: z.literal(false) }),
  z.object({
    mode: z.literal("invite"),
    eligible: z.literal(false),
    invite_expires_at: z.string(),
    invite_uses_remaining: z.coerce.number().int().nonnegative(),
  }),
  z.object({
    mode: z.literal("eligible"),
    eligible: z.literal(true),
    role: z.enum(["member", "admin"]),
    unread_count: z.coerce.number().int().nonnegative(),
  }),
]);

const joinRowSchema = z.object({
  mode: z.literal("eligible"),
  eligible: z.literal(true),
  role: z.enum(["member", "admin"]),
  unread_count: z.coerce.number().int().nonnegative(),
  joined: z.boolean(),
});

const readRowSchema = z.object({
  unread_count: z.coerce.number().int().nonnegative(),
  last_read_message_id: z.string().uuid().nullable(),
});

export interface WarRoomRepository {
  getAccess: (inviteCode?: string | null) => Promise<WarRoomAccess>;
  joinWithInvite: (inviteCode: string) => Promise<WarRoomJoinResult>;
  loadSnapshot: (cursor?: WarRoomCursor | null) => Promise<WarRoomSnapshot>;
  postMessage: (
    body: string,
    parentMessageId: string | null,
    mentionedProfileIds: string[],
  ) => Promise<WarRoomMessage>;
  deleteMessage: (messageId: string) => Promise<WarRoomMessage>;
  markRead: (messageId: string) => Promise<WarRoomReadState>;
  subscribe: (
    onChange: () => void,
    onStatus: (status: WarRoomRealtimeStatus) => void,
  ) => () => void;
}

function toMember(value: unknown): WarRoomMember {
  const row = memberRowSchema.parse(value);
  return {
    id: row.id,
    displayName: row.display_name,
    initials: row.initials,
    avatarPhotoData: row.avatar_photo_data ?? null,
  };
}

function toMessage(value: unknown): WarRoomMessage {
  const row = messageRowSchema.parse(value);
  return {
    id: row.id,
    body: row.body,
    deleted: row.deleted,
    createdAt: row.created_at,
    author: toMember(row.author),
    parent: row.parent ? {
      id: row.parent.id,
      body: row.parent.body,
      deleted: row.parent.deleted,
      author: toMember(row.parent.author),
    } : null,
    mentions: row.mentions.map(toMember),
    canDelete: row.can_delete,
  };
}

function toSnapshot(value: unknown): WarRoomSnapshot {
  const row = snapshotRowSchema.parse(value);
  return {
    role: row.role,
    messages: row.messages.map(toMessage),
    members: row.members.map(toMember),
    hasMore: row.has_more,
    nextCursor: row.next_cursor ? {
      createdAt: row.next_cursor.created_at,
      id: row.next_cursor.id,
    } : null,
    unreadCount: row.unread_count,
    latestMessageId: row.latest_message_id,
  };
}

function toAccess(value: unknown): WarRoomAccess {
  const row = accessRowSchema.parse(value);
  if (row.mode === "locked") return row;
  if (row.mode === "eligible") {
    return {
      mode: row.mode,
      eligible: row.eligible,
      role: row.role,
      unreadCount: row.unread_count,
    };
  }
  return {
    mode: row.mode,
    eligible: row.eligible,
    inviteExpiresAt: row.invite_expires_at,
    inviteUsesRemaining: row.invite_uses_remaining,
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

function realtimeStatus(value: string): WarRoomRealtimeStatus | null {
  if (value === "SUBSCRIBED") return "connected";
  if (value === "CLOSED") return "disconnected";
  if (value === "CHANNEL_ERROR" || value === "TIMED_OUT") return "error";
  return null;
}

export function createWarRoomRepository(): WarRoomRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async getAccess(inviteCode = null) {
      const data = await requireRpcSuccess(
        client.rpc("get_my_war_room_access", { p_invite_code: inviteCode }),
        "Octagon HQ could not verify War Room access.",
      );
      return toAccess(data);
    },

    async joinWithInvite(inviteCode) {
      const data = await requireRpcSuccess(
        client.rpc("join_war_room_with_invite", { p_invite_code: inviteCode }),
        "Octagon HQ could not join the War Room.",
      );
      const row = joinRowSchema.parse(data);
      return {
        mode: row.mode,
        eligible: row.eligible,
        role: row.role,
        unreadCount: row.unread_count,
        joined: row.joined,
      };
    },

    async loadSnapshot(cursor = null) {
      const data = await requireRpcSuccess(
        client.rpc("get_war_room_snapshot", {
          p_before_created_at: cursor?.createdAt ?? null,
          p_before_id: cursor?.id ?? null,
          p_limit: 40,
        }),
        "Octagon HQ could not load the War Room.",
      );
      return toSnapshot(data);
    },

    async postMessage(body, parentMessageId, mentionedProfileIds) {
      const data = await requireRpcSuccess(
        client.rpc("post_war_room_message", {
          p_body: body,
          p_parent_message_id: parentMessageId,
          p_mentioned_profile_ids: mentionedProfileIds,
        }),
        "Octagon HQ could not post that War Room message.",
      );
      return toMessage(data);
    },

    async deleteMessage(messageId) {
      const data = await requireRpcSuccess(
        client.rpc("delete_war_room_message", { p_message_id: messageId }),
        "Octagon HQ could not delete that War Room message.",
      );
      return toMessage(data);
    },

    async markRead(messageId) {
      const data = await requireRpcSuccess(
        client.rpc("mark_war_room_read", { p_message_id: messageId }),
        "Octagon HQ could not update War Room read status.",
      );
      const row = readRowSchema.parse(data);
      return {
        unreadCount: row.unread_count,
        lastReadMessageId: row.last_read_message_id,
      };
    },

    subscribe(onChange, onStatus) {
      let active = true;
      let channel: ReturnType<typeof client.channel> | null = null;
      onStatus("connecting");

      void client.realtime.setAuth()
        .then(() => {
          if (!active) return;
          channel = client
            .channel("war-room:conversation", { config: { private: true } })
            .on("broadcast", { event: "war_room_changed" }, () => {
              if (active) onChange();
            })
            .subscribe((status) => {
              if (!active) return;
              const next = realtimeStatus(status);
              if (next) onStatus(next);
            });
        })
        .catch(() => {
          if (active) onStatus("error");
        });

      return () => {
        active = false;
        if (channel) void client.removeChannel(channel);
      };
    },
  };
}
