# War Room Admin and Mobile Polish

## Product decisions

- The War Room heading contains only **War Room**, connection status, and the admin-only access control.
- There is no Refresh button.
- There is no descriptive subtitle or private-conversation eyebrow.
- Realtime, focus, online, and visibility refresh remain owned by `WarRoomProvider`.
- The message feed grows naturally for short conversations and becomes scrollable only when needed.
- The composer begins as one compact line, grows to four lines, and uses a compact **POST** action.

## Access management

Active War Room admins receive **Manage Access** in the heading. The bottom sheet lists every Octagon HQ profile and allows access to be turned on or off.

- The browser calls guarded authenticated RPCs.
- Private membership tables remain inaccessible to browser roles.
- Regular members cannot load the roster or change access.
- An admin cannot remove their own access.
- Newly enabled and re-enabled profiles begin at the current conversation edge.
- A private per-profile Broadcast signal causes the affected client to re-check canonical access immediately.

## Message deletion

The existing server rule remains locked:

- regular members may delete only their own messages;
- War Room admins may delete any message;
- deletion is a soft delete and message text is no longer returned;
- the UI renders Delete only when the guarded snapshot returns `can_delete: true`.

## Ownership

`WarRoomProvider` remains the only browser owner for access, conversation state, unread state, Realtime refresh, access roster state, and admin access mutations. `warRoomRepository.ts` remains the only browser RPC and Realtime boundary.
