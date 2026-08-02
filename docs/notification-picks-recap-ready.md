# Picks Recap-Ready Notifications

## Scope

This slice connects the canonical Picks event-completion transition to the unified notification system.

When an event is completed and its recap becomes available, every member who entered that event receives one personal **recap is ready** notification. The existing global What's New recap item remains intact; What's New announces the completed event to the app, while the bell delivers the personal action to participating members.

## Member behavior

An event entrant receives:

- kind: `picks_recap_ready`;
- title: `<event name> recap is ready`;
- summary: confirmation that final standings and the member's full Picks recap are available;
- route: `/picks?event=<event-id>&view=recap`;
- action: **VIEW RECAP**.

The exact event route is permanent. It resolves through the existing `PicksSeasonHub` archive owner, opens the Events view, and opens the generated full recap for that archived event. A later active Picks card does not replace or remove the completed recap.

A profile counts as an entrant when it has at least one saved pick for the completed event. Profiles that did not enter receive no personal notification.

## Existing notification repair

Migration `202608240001_picks_recap_destination_repair.sql` updates already-published recap notifications and What's New items from the generic `/picks` route to their exact archived event destination. For an aggregated unread notification, the newest immutable recap source owns both the visible copy and destination.

The notification UI also translates an already-cached generic recap route to `/picks?view=recap`. That compatibility route resolves only to the newest archived event and does not create a second recap or navigation owner.

## Aggregation and idempotency

Each completed event and entrant form one immutable notification source event.

Multiple unread event recaps collapse into one row, such as **Recap is ready ×2**, while the newest completed event owns the visible title, summary, and destination. After that row is read, a later completed event reopens it with a fresh count of one through the canonical notification owner.

Replaying the already-completed transition returns the canonical event and cannot add another notification or another What's New item.

## Ownership

- `transition_pick_event(...)` remains the only Picks lifecycle owner.
- The event's canonical `completed_at` timestamp owns both recap publication times.
- `private.upsert_whats_new_item(...)` remains the global What's New storage and idempotency owner.
- Existing `profile_event_picks` rows determine personal recipients; no new entrant store or browser scan is created.
- `private.publish_notification_to_profile(...)` remains the only notification aggregation, source-event, unread-count, read-state, and Realtime owner.
- `PicksSeasonHub` and `LatestEventRecap` remain the only archive and full-recap presentation owners.

Event completion, the global What's New recap item, and all personal entrant notifications commit or roll back together.

## Noise and safety rules

- Locking an event does not publish a recap notification.
- A profile without a saved pick on the event receives nothing.
- One member receives one source event per completed event, regardless of how many fights they picked.
- Completion and recap availability are the same moment, so there is no separate “event completed” notification.
- The notification does not recalculate scoring or create a second recap projection.

No second inbox, provider, repository, scheduler, polling loop, lifecycle transition, or browser-storage fallback is added.
No second recap projection or navigation owner is added.

## Deferred work

Must-watch moments remain a separate recap-content change. Incomplete-Picks near-lock reminders, event-start timing, season-result corrections, notification preferences, and device push remain owned by their existing focused slices.
