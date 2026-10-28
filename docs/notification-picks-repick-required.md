# Picks Repick-Required Notifications

## Scope

This slice connects the existing owner-approved fighter-replacement transition to the canonical notification system.

When a replacement invalidates a member's saved pick, that member receives one actionable **Repick required** notification. This is delivery only: the existing Picks projection remains the source of truth for whether a repick is still required.

## Member behavior

An affected member receives:

- kind: `picks_repick_required`;
- title: **Repick required**;
- summary: the old matchup, the new matchup, and a reminder to make a new pick before lock;
- route: `/picks`;
- action: **REPICK**.

Members without a saved pick on that bout receive nothing. The replacement owner receives a member notification only when that owner's own saved pick was also invalidated.

## Aggregation and idempotency

Each approved replacement action and affected profile form one immutable source event. A rejected stale request cannot create a notification.

Unread repick requirements for the same member and event collapse into one row. If two different bouts or successive replacement actions require another pick, the bell may show **Repick required ×2** while the latest changed matchup owns the visible summary.

After the row is marked read, a later replacement reopens the existing group with a fresh count of one through the canonical notification owner.

## Ownership

- `approve_pick_fighter_replacement(...)` remains the only replacement transition.
- `pick_card_change_actions` remains the only card-change audit owner.
- The existing invalidated-picks evidence determines recipients; no browser scan or separate recipient list is created.
- The existing player Picks projection remains the repick-state owner.
- `private.publish_notification_to_profile(...)` remains the only aggregation, source-event, unread-count, read-state, and Realtime owner.

The replacement, audit row, pick invalidation, and notification delivery commit or roll back together.

## Noise and safety rules

- No notification is sent merely because monitoring suspects a replacement.
- Monitoring findings still require Cody's review and do not mutate the card.
- A notification is created only after the canonical owner approves a real replacement and an existing pick is actually invalidated.
- The notification never chooses a replacement fighter or submits a pick for the member.
- Rejected, stale, post-lock, duplicate-fighter, and otherwise invalid replacement attempts remain silent.

No second inbox, provider, repository, scheduler, polling loop, or browser-storage fallback is added.

## Deferred work

Fight-cancellation delivery, incomplete-Picks near-lock reminders, event-start timing, recap notifications, notification preferences, and device push remain separate focused slices.
