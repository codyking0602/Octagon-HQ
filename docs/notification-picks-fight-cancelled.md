# Picks Fight-Cancelled Notifications

## Scope

This slice connects the existing owner-approved pre-lock cancellation transition to the canonical notification system.

When Cody approves a real cancellation, members who already saved a pick on that bout receive one informational **Fight cancelled** notification. No action is required because the existing Picks owner preserves the selection and excludes the cancelled bout from scoring.

## Member behavior

An affected member receives:

- kind: `picks_fight_cancelled`;
- title: **Fight cancelled**;
- summary: the cancelled matchup, confirmation that the saved pick remains preserved, and confirmation that the bout is excluded from scoring;
- route: `/picks`;
- action: **VIEW PICKS**.

Members without a saved pick on the cancelled bout receive nothing. The owner receives the same member-facing notification only when the owner also submitted a pick on that bout.

The private cancellation reason is not copied into member notifications.

## Aggregation and idempotency

Each approved cancellation action and affected profile form one immutable notification source event.

Multiple unread cancellations for the same event collapse into one counted row, such as **Fight cancelled ×2**. The latest cancelled matchup owns the visible summary.

Replaying an already-cancelled request returns the canonical bout without adding another audit action or notification. Restoring a bout does not create a cancellation notification.

## Ownership

- `approve_pick_bout_cancellation(...)` remains the only owner-approved cancellation and restoration transition.
- `pick_bouts.result_status` remains the canonical cancellation and scoring state.
- `pick_card_change_actions` remains the sole private card-change audit owner.
- Existing saved Picks determine recipients; no browser scan or separate recipient store is created.
- `private.publish_notification_to_profile(...)` remains the only aggregation, idempotency, unread-count, read-state, and Realtime owner.

The cancellation state change, mutable Underdog Lock cleanup, audit action, and notification delivery commit or roll back together.

## Noise and safety rules

- Monitoring suspicion alone cannot notify members or cancel a fight.
- A member is notified only after Cody approves the real cancellation.
- Members without a saved pick on that bout receive no notification.
- Restorations remain silent in this slice.
- The notification does not expose Cody's private cancellation reason.
- The notification does not delete, change, or resubmit the member's preserved pick.

No second inbox, provider, repository, scheduler, polling loop, or browser-storage fallback is added.

## Deferred work

Incomplete-Picks near-lock reminders, event-start timing, recap notifications, notification preferences, and device push remain separate focused slices.
