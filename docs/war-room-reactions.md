# War Room Reactions and Disappearing Deletes

## Product behavior

War Room messages no longer leave a visible tombstone after deletion.

- A deleted message disappears completely from the conversation.
- A reply to a deleted top-level message remains as its own message.
- The deleted parent preview disappears from that reply.
- Deletion remains a server-enforced soft delete so audit and permission evidence are preserved privately.
- Regular members may delete only their own messages.
- War Room admins may delete any message.

## Reactions

Every visible message supports four reactions:

- Like `👍`
- Dislike `👎`
- Exclaim `❗`
- Laugh `😂`

The presentation follows an iMessage-style tapback pattern instead of showing four permanent buttons under every post.

- Existing reactions appear as compact tapback badges attached to the message.
- Selecting **REACT**, tapping an existing badge, pressing and holding the message, or opening its context menu reveals the four-choice floating picker.
- The picker closes after a successful selection, an outside tap, or Escape.
- Each active War Room member may toggle each reaction independently.
- Counts are canonical across profiles and devices.
- A selected reaction is visually distinct and may be toggled off by selecting it again.

Deleted messages cannot receive reactions and retain no reaction rows.

## Privacy and ownership

- Reaction rows live in `private.war_room_reactions`.
- Browser roles receive no direct table privileges.
- `public.toggle_war_room_reaction(...)` is the guarded mutation boundary.
- `public.get_war_room_message(...)` supports targeted Realtime reconciliation without creating a second feed owner.
- `WarRoomProvider` remains the single browser owner for messages, deletion, reaction state, unread state, and Realtime refresh.
- The existing private `war_room_changed` Broadcast signal carries only the affected message ID and operation metadata.
- Message bodies and reaction identities are never published through Broadcast.
- No polling loop or browser-storage fallback is added.

## Pagination and reconnect behavior

Deleted messages are excluded before pagination is calculated, so they do not consume visible message slots or leave gaps. The latest-message cursor also ignores deleted rows.

Realtime changes refresh the canonical snapshot and reconcile the affected message. This allows reactions and deletions on previously loaded messages to update without a direct table subscription.
