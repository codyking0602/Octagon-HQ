# Game Challenge Delivery Notifications

## Scope

This slice connects the existing profile challenge delivery and open transitions to the canonical notification system.

It adds only:

- a notification when a member receives a direct game challenge;
- a notification when the recipient opens and accepts that challenge;
- aggregation and deep links through the existing notification owner.

Challenge completion, result-ready delivery, expiration reminders, notification preferences, and device push remain later focused slices.

## Received challenge

`public.create_play_challenge(...)` remains the only canonical profile-challenge creation transition.

After the shared challenge row is created, the recipient receives:

- kind: `game_challenge_received`;
- title: `You were challenged`;
- action: `VIEW CHALLENGE`;
- an exact route to the locked game and matchup code.

Multiple unread received challenges collapse into one counted notification such as **You were challenged ×2**. The latest challenge owns the visible summary and deep link. Replaying the same source event cannot increase the count.

## Accepted challenge

The existing `open_play_challenge(...)` transition is the app's acceptance moment. It runs when the recipient opens the locked matchup.

The creator receives:

- kind: `game_challenge_accepted`;
- title: `Your challenge was accepted`;
- action: `VIEW MATCHUP`;
- an exact route to the accepted matchup.

Repeated calls for the same opened challenge remain idempotent. Multiple unread acceptances collapse into one counted row with the latest matchup deep link.

## Deep-link rules

- Find the Leader uses `/play/find-leader?challenge=<code>`.
- All other current games use their canonical route with `?match=<code>`.
- Unknown future game IDs safely fall back to `/play`.

The notification does not create or alter game setup. The existing challenge row remains the source of truth for the frozen matchup.

## Ownership and privacy

- `create_play_challenge(...)` still owns challenge creation.
- `open_play_challenge(...)` still owns the opened/accepted transition.
- `private.publish_notification_to_profile(...)` remains the only notification aggregation and source-event owner.
- Browser roles cannot call the private publisher.
- Challenge creation and its notification occur in the same transaction.
- Opening a challenge and its acceptance notification occur in the same transaction.
- No second notification center, unread store, browser subscription, polling loop, or local-storage fallback is added.
