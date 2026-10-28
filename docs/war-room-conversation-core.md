# War Room Conversation Core

## Historical slice

PR 2 created the guarded conversation core: private RPC-only messages, a continuous 40-message feed, older-message paging, one-level replies, exact mentions, member-profile links, and soft deletion.

PR 3 owns launch visibility, unread state, invite presentation, Realtime signaling, and foreground refresh. The core remains the same single conversation with no weekly reset or archive.

## Locked conversation behavior

- One continuous conversation.
- Latest 40 messages load in oldest-to-newest reading order.
- Older messages use a stable timestamp-and-id cursor.
- Messages are limited to 500 characters.
- Replies are one level deep.
- Exact `@DISPLAY NAME` mentions are stored as profile relationships.
- Authors may soft-delete their own messages; admins may soft-delete any message.
- Deleted bodies are never returned.
- Supabase remains the cross-device source of truth.

## Ownership

- `IdentityProvider` is the only browser identity owner.
- `WarRoomProvider` is the only War Room state owner.
- `warRoomRepository.ts` is the only browser data and signal boundary.
- Conversation tables remain private and RPC-only.
- No browser-storage fallback or polling loop is allowed.
