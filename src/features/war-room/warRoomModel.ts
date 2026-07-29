export type WarRoomAccessMode = "locked" | "invite" | "eligible";
export type WarRoomRole = "member" | "admin";

export interface WarRoomMember {
  id: string;
  displayName: string;
  initials: string;
  avatarPhotoData: string | null;
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
}

export type WarRoomAccess =
  | { mode: "locked"; eligible: false }
  | {
      mode: "invite";
      eligible: false;
      inviteExpiresAt: string;
      inviteUsesRemaining: number;
    }
  | { mode: "eligible"; eligible: true; role: WarRoomRole };

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

function mentionPattern(displayName: string) {
  const escaped = displayName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^A-Z0-9])@${escaped}(?=$|[^A-Z0-9])`, "i");
}

export function mentionedMemberIds(body: string, members: readonly WarRoomMember[]) {
  return members
    .filter((member) => mentionPattern(member.displayName).test(body))
    .map((member) => member.id);
}
