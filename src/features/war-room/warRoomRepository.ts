import { z } from "zod";
import { getSupabaseClient } from "../../lib/supabase";
import type {
  WarRoomAccess,
  WarRoomCursor,
  WarRoomMember,
  WarRoomMessage,
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
  }),
]);

export interface WarRoomRepository {
  getAccess: () => Promise<WarRoomAccess>;
  loadSnapshot: (cursor?: WarRoomCursor | null) => Promise<WarRoomSnapshot>;
  postMessage: (
    body: string,
    parentMessageId: string | null,
    mentionedProfileIds: string[],
  ) => Promise<WarRoomMessage>;
  deleteMessage: (messageId: string) => Promise<WarRoomMessage>;
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

export function createWarRoomRepository(): WarRoomRepository | null {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  const client = supabase;

  return {
    async getAccess() {
      const data = await requireRpcSuccess(
        client.rpc("get_my_war_room_access", { p_invite_code: null }),
        "Octagon HQ could not verify War Room access.",
      );
      const row = accessRowSchema.parse(data);
      if (row.mode === "eligible") return row;
      if (row.mode === "locked") return row;
      return {
        mode: row.mode,
        eligible: row.eligible,
        inviteExpiresAt: row.invite_expires_at,
        inviteUsesRemaining: row.invite_uses_remaining,
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
  };
}
