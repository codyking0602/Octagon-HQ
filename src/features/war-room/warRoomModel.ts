export type WarRoomAccessMode = "locked" | "invite" | "eligible";
export type WarRoomRole = "member" | "admin";
export type WarRoomRealtimeStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

export interface WarRoomMember {
  id: string;
  displayName: string;
  initials: string;
  avatarPhotoData: string | null;
}

export interface WarRoomAccessProfile extends WarRoomMember {
  hasAccess: boolean;
  role: WarRoomRole | null;
}

export interface WarRoomParentPreview {
  id: string;
  body: string | null;
  deleted: boolean;
  author: WarRoomMember;
}

export interface WarRoomMessage {
  id: string;
  body: string | null;
  deleted: boolean;
  createdAt: string;
  author: WarRoomMember;
  parent: WarRoomParentPreview | null;
  mentions: WarRoomMember[];
  canDelete: boolean;
}

export interface WarRoomCursor {
  createdAt: string;
  id: string;
}

export interface WarRoomSnapshot {
  role: WarRoomRole;
  messages: WarRoomMessage[];
  members: WarRoomMember[];
  hasMore: boolean;
  nextCursor: WarRoomCursor | null;
  unreadCount: number;
  latestMessageId: string | null;
}

export type WarRoomAccess =
  | { mode: "locked"; eligible: false }
  | {
      mode: "invite";
      eligible: false;
      inviteExpiresAt: string;
      inviteUsesRemaining: number;
    }
  | {
      mode: "eligible";
      eligible: true;
      role: WarRoomRole;
      unreadCount: number;
    };

export interface WarRoomJoinResult {
  mode: "eligible";
  eligible: true;
  role: WarRoomRole;
  unreadCount: number;
  joined: boolean;
}

export interface WarRoomReadState {
  unreadCount: number;
  lastReadMessageId: string | null;
}

export function mergeWarRoomMessages(
  current: readonly WarRoomMessage[],
  incoming: readonly WarRoomMessage[],
) {
  const byId = new Map<string, WarRoomMessage>();
  [...current, ...incoming].forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((left, right) => (
    left.createdAt.localeCompare(right.createdAt) || left.id.localeCompare(right.id)
  ));
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function mentionedMemberIds(body: string, members: readonly WarRoomMember[]) {
  if (!members.length) return [];
  const byName = new Map(members.map((member) => [member.displayName.toUpperCase(), member]));
  const names = [...byName.keys()].sort((left, right) => right.length - left.length);
  const expression = new RegExp(
    `(^|[^A-Z0-9])@(${names.map(escapeRegExp).join("|")})(?=$|[^A-Z0-9])`,
    "gi",
  );
  const mentioned = new Set<string>();
  let match: RegExpExecArray | null;
  while ((match = expression.exec(body))) {
    const member = byName.get((match[2] ?? "").toUpperCase());
    if (member) mentioned.add(member.id);
  }
  return members.filter((member) => mentioned.has(member.id)).map((member) => member.id);
}
