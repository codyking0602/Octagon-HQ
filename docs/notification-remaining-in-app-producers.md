# Remaining In-App Notification Producers

## Three-PR finish plan

The remaining notification roadmap is consolidated into three pull requests:

1. **Remaining in-app producers** — this PR.
2. **Preferences and push readiness** — member controls, delivery eligibility, installability, and permission state.
3. **Device push delivery** — actual push registration and delivery through the same canonical notification events.

This replaces the earlier overly fragmented estimate. Optional low-value notification placeholders do not each receive their own PR.

## This PR

This slice connects the remaining worthwhile in-app actions to the existing unified notification center.

### Member Picks timing

- **Finish your Picks** is sent once to every claimed member who still has any missing included fight when lock is within four hours. A member with zero saved picks is included; starting the card is no longer required.
- **UFC event starts soon** is sent once when the event begins within one hour and that member has completed every included fight.
- A member cannot receive both messages for the same card state. Incomplete members get the actionable lock reminder; completed members may get the event-starting message.
- Unclaimed historical profiles still receive neither reminder.

### Daily Challenge

- Find the Leader remains the sole daily, streak-eligible, reminder-eligible game.
- One reminder is sent during the 8 PM Central hour when the claimed member has not completed that Central calendar day.
- The existing **Four hours remain** reminder is a push candidate, so members with push enabled can receive it on their phone while Octagon HQ is closed.
- There is no new-daily-game notification and no separate streak-at-risk message in this slice. One useful reminder is enough.
- Unclaimed historical profiles receive nothing.

### Completed-event corrections

- When Cody corrects an official result after the event is already complete, entrants receive **results changed** with a link to the updated recap.
- Non-entrants receive nothing.
- Cody's private correction reason is not exposed.
- The existing official correction function and immutable correction audit remain the owners. Correction and notification delivery commit or roll back together.

### Cody-only operations

This slice adds three non-overlapping owner actions:

- **Event draft ready for review** when an upcoming staged card has no matching published Picks event. This intentionally covers the missing-card action without creating a second alert.
- **Monitoring repeatedly failed** only after three recent consecutive failed monitoring runs. A one-off provider failure remains silent.
- **Event ready to complete** when every included result is final. There is no duplicate “all results entered” notification.

Existing card-change, fight-order, removed-fight, odds-match, and provider-quota alerts remain unchanged.

## Execution ownership

The existing `octagon-hq-pick-monitoring` hourly wake-up remains the only scheduler. After scheduler authentication, `run-pick-monitoring` invokes the service-only `dispatch_due_in_app_notifications(...)` database function before deciding whether an external monitoring call is due.

This matters because reminders can still be delivered on an hour when no provider call is needed. The database owns due-time decisions, recipient selection, source-key idempotency, and notification publication.

No second cron job, Edge Function, polling loop, browser timer, inbox, provider, or local-storage fallback is added.

## Noise decisions

The following defined placeholders remain intentionally unconnected:

- generic War Room message notifications;
- opponent-finished, because challenge-result-ready already covers the same moment;
- new Daily Challenge available;
- daily streak at risk;
- generic achievement notifications;
- generic new-game notifications;
- separate fighter-replacement or fight-cancellation detection alerts when the existing card-change review alert already carries the evidence;
- separate published-card-mismatch and missing-card rows when one staged-draft review action is enough;
- separate all-results-entered and event-ready-to-complete rows;
- post-lock correction review after Cody has already performed the correction.

These can be reconsidered later, but they are not required to finish the notification product.

## Safety and ownership

- `private.publish_notification_to_profile(...)` remains the sole aggregation, idempotency, read-state, unread-count, and Realtime owner.
- Canonical Picks rows determine card completion and event timing.
- `find_leader_history` determines daily completion.
- `pick_monitoring_runs` determines repeated failure evidence.
- `pick_event_drafts` and `pick_events` determine staged-versus-published state.
- `pick_result_corrections` remains the immutable correction audit.
- Operational notifications remain restricted to the configured Cody owner profile.
- Browser roles cannot execute the dispatcher or private publisher.
