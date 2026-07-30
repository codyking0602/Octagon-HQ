# Cody-Only Picks Monitoring Notifications

## Scope

This slice connects meaningful findings from the existing Picks monitoring ledger to the canonical notification system.

It does not create a second monitoring runner, scheduler, inbox, notification provider, or review state. The existing `run-pick-monitoring` function still performs checks, and `record_pick_monitoring_run(...)` still owns atomic evidence storage.

## Notification behavior

A newly inserted reviewable monitoring finding can create one owner-only notification:

- generic card changes → **Card change detected**;
- exact order changes → **Fight order changed**;
- a fight removed from the monitored source card → **Fight moved off monitored card**;
- matchup-specific odds/provider matching failures → **Odds match failed**;
- low or exhausted provider quota → **Odds provider quota is low** or **Odds provider quota exhausted**.

Every notification deep-links to `/picks/monitoring` with the action **REVIEW**.

The notification only surfaces the durable finding. It never stages, publishes, removes, reorders, replaces, cancels, restores, or otherwise applies a card change automatically.

## Noise rules

The following remain evidence-only and do not create notifications:

- ordinary American-odds movement;
- odds becoming available for the first time;
- informational monitoring findings;
- a single event-level provider error without a matchup-specific review action.

A global **Monitoring repeatedly failed** alert is intentionally deferred until the existing monitoring history proves an actual repeated-failure condition. This slice does not label one failure as repeated.

## Aggregation

The canonical notification owner aggregates unread findings by event and alert kind.

Examples:

- several generic card findings for the same event appear as **Card change detected ×3**;
- matchup-specific odds failures for the same event appear as **Odds match failed ×2**;
- order changes and removed fights remain their own clear rows.

Each finding uses its immutable `finding_id` as the source key, so replaying or rereading the same evidence cannot increase the count.

## Owner isolation

Operational notification kinds are restricted by the existing `private.notification_owner` singleton. Only Cody's configured owner profile receives them. Other member profiles cannot read them, and browser roles cannot invoke the private trigger publisher.

If the owner profile is temporarily unconfigured, monitoring evidence still records successfully; the notification side effect does not block the canonical monitoring ledger.

## Ownership preserved

- `run-pick-monitoring` remains the only manual and scheduled execution owner.
- `record_pick_monitoring_run(...)` remains the evidence writer.
- `public.pick_monitoring_findings` remains the reviewable source of truth.
- `private.publish_notification_to_profile(...)` remains the only aggregation, idempotency, read-state, unread-count, and Realtime owner.
- `/picks/monitoring` remains the review destination.
- No local-storage fallback, browser polling loop, duplicate scheduler, or automatic card mutation is added.
