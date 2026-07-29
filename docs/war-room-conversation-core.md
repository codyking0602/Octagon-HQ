# War Room Conversation Core

## Product boundary

PR 2 adds the real War Room conversation engine and a hidden review route for already eligible members.

The final eligible-member navigation order remains:

**Home → Rankings → Picks → Play → War Room**

War Room is still absent from primary navigation in this slice. Signed-out, unauthorized, invite-only, unconfigured, and errored profiles are redirected to Home without seeing a War Room page or placeholder.

## Conversation behavior

- One continuous conversation; no weekly reset or archive.
- Initial load returns the latest 40 messages in oldest-to-newest reading order.
- Older messages load through a stable timestamp-and-id cursor.
- Messages are limited to 500 characters.
- Replies are one level deep and retain a compact parent preview.
- Exact `@DISPLAY NAME` mentions are stored as profile relationships.
- Names, avatars, and mentions link to canonical Member Profiles.
- Authors may soft-delete their own messages; War Room admins may soft-delete any message.
- Deleted bodies and deleted parent previews are never returned to clients.
- Loading, empty, error, refresh, posting, deletion, and older-message states are explicit.
- Supabase is the cross-device source of truth.

## Ownership

- Existing `IdentityProvider` remains the only browser identity owner.
- `WarRoomProvider` is the single browser owner for access state, feed state, paging, posting, replies, mentions, and deletion.
- `warRoomRepository.ts` is the only browser boundary for War Room RPCs.
- Conversation and mention tables stay in the private schema.
- The browser receives no direct table grants and uses no browser-storage fallback.
- PR 2 adds no polling loop and no Realtime subscription. Those belong to PR 3 with unread ownership and launch navigation.

## Hidden review route

`/war-room` exists only to review the complete guarded conversation before launch.

- Eligible profiles may load it directly.
- Every other access state redirects to Home.
- No Home card, disabled button, fake page, invite placeholder, badge, or bottom-navigation item is added.

## Deferred to PR 3

- conditional primary navigation;
- Join with Invite route and presentation;
- unread counts and read position;
- Supabase Realtime signal handling;
- reconnect and foreground refresh ownership;
- launch review of the five-tab mobile arrangement.
