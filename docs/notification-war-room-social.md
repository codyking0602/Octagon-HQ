# War Room Social Notifications

## Scope

This slice connects the existing War Room message transition to the canonical notification system created in PR #129.

It adds only:

- War Room mention notifications;
- direct reply notifications;
- aggregation through the existing notification owner;
- duplicate suppression when a reply also mentions the parent author.

It does not create another inbox, unread store, browser subscription, local-storage path, or polling loop.

## Notification behavior

A top-level War Room mention publishes:

- kind: `war_room_mention`;
- title: `You were mentioned`;
- route: `/war-room`;
- aggregation key: `war-room:mentions`.

Unread mention events collapse into one row, such as **You were mentioned ×2**. The latest actor remains in the summary. Replayed source events remain idempotent through the canonical notification event owner.

A direct reply publishes:

- kind: `war_room_reply`;
- title: `Someone replied to your message`;
- route: `/war-room`;
- aggregation key: `war-room:replies`.

Unread reply events likewise collapse into one row.

## Noise rules

- The message author never receives a notification for mentioning themselves.
- Replying to your own message does not create a reply notification.
- When a reply also explicitly mentions the parent author, the parent author receives only the reply notification, not a second mention notification.
- Mention relationships are still stored on the message even when the duplicate notification is suppressed.
- Revoked War Room members do not receive reply notifications they cannot open.

## Ownership

`public.post_war_room_message(...)` remains the only canonical message-post transition. It delegates to `private.publish_notification_to_profile(...)` inside the same database transaction.

- War Room remains the source of truth for the posted message, reply target, and resolved mentions.
- The notification foundation remains the source of truth for aggregation, source-event idempotency, read state, unread count, and Realtime delivery.
- Browser roles cannot call the private notification publisher.
- A posting failure rolls back both the message and any related notification work.
