# War Room Launch

## Product contract

War Room launches as Octagon HQ's private UFC group conversation.

Eligible-member primary navigation is locked as:

**Home → Rankings → Picks → Play → War Room**

Signed-out and unauthorized profiles receive no War Room tab, badge, Home card, disabled button, or placeholder route. A person with a correctly formed invite link may see the dedicated **Join with Invite** flow, but no conversation content is exposed before membership is granted.

## Launch ownership

`WarRoomProvider` is the single browser owner for:

- access eligibility;
- conditional navigation;
- unread counts and latest read position;
- feed state and paging;
- posting, replies, mentions, and deletion;
- invite checking and joining;
- private Realtime subscription status;
- focus, online, and visibility refreshes.

`warRoomRepository.ts` remains the only browser boundary. Message data still comes only from guarded RPCs.

## Realtime contract

The database emits a private `war_room_changed` Broadcast signal after message insert or soft-delete updates. The signal contains only change metadata. Active membership is checked through Realtime Authorization.

The client treats Broadcast as a refresh signal only and reloads the guarded snapshot RPC. It does not treat the WebSocket payload as a second feed, subscribe directly to private tables, or add a polling loop.

## Unread contract

- Existing eligible members start launch at the current conversation edge.
- New invitees join at the current conversation edge.
- A member's own posts do not count as unread.
- Read position only moves forward.
- The page marks through the latest message only while the document is visible and the member is at the conversation edge.
- Navigation caps the visible badge at `99+`.

## Invite contract

Invite links use:

`/war-room/join?invite=<RAW_INVITE_CODE>`

Signed-out visitors are asked to sign in or create a profile before the invite is verified. Valid signed-in invitees see a clear join action. Expired, consumed, revoked, malformed, and profile-blocked invites fail closed.
