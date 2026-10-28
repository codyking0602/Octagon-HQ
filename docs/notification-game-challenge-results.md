# Game Challenge Result Notifications

## Scope

This slice connects the existing challenge-completion transition to the canonical notification system.

It adds one notification when the responding player finishes and the shared matchup result becomes available. Expiration reminders, notification preferences, and device push remain later work.

## Result-ready delivery

`public.complete_play_challenge(...)` remains the only canonical completion transition.

When the recipient successfully submits the result:

- the existing challenge row stores the responder result and completion timestamp;
- the creator receives `game_challenge_result_ready`;
- the title is **Challenge result is ready**;
- the action is **VIEW RESULT**;
- the notification links to the exact completed matchup.

The completion mutation and notification publication happen in the same database transaction.

## No overlapping completion messages

The current challenge model already contains the creator's completed result before the challenge is sent. When the recipient finishes, the final comparison is immediately available.

For that reason, completion publishes only **Challenge result is ready**. It does not also publish **Your opponent finished** for the same event. Sending both would create two messages for one action and violate the notification noise rule.

The `game_opponent_finished` kind remains available for a future game flow where an opponent can finish before the shared result itself is ready.

## Aggregation and idempotency

Completed challenges use one stable unread aggregation group.

- Multiple unread completed matchups appear as one counted row, such as **Challenge result is ready ×2**.
- The latest completed matchup owns the visible summary and deep link.
- Replaying `complete_play_challenge(...)` for an already completed challenge returns false and cannot increment the notification.
- After the aggregate is marked read, a later completed challenge reopens it with a fresh count of one through the existing notification owner.

## Deep-link rules

- Find the Leader uses `/play/find-leader?challenge=<code>`.
- All other current games use their canonical route with `?match=<code>`.
- Unknown future game IDs safely fall back to `/play`.

The notification only opens the existing completed matchup. It does not recalculate, replace, or mutate either player's result.

## Recipient behavior

The responding player is already inside the completion flow and receives the unlocked result directly from the canonical challenge owner. The app does not create a redundant result-ready notification for that same player.

## Ownership and privacy

- `complete_play_challenge(...)` remains the sole challenge-completion owner.
- `private.publish_notification_to_profile(...)` remains the sole notification aggregation and source-event owner.
- Browser roles cannot call the private publisher.
- The creator result remains hidden until the successful completion transition.
- No second notification center, provider, repository, subscription, polling loop, or local-storage fallback is added.
