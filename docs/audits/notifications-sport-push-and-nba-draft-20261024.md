# Octagon HQ — Notification quality audit and sport push draft
**Date:** October 24, 2026
**Source:** `main` at `70a33643c2063902722356a478d21b60326f8b48`
**Release status:** DRAFT ONLY — no production migrations, no live test deliveries, no main changes.

## Verified current implementation
- One canonical Supabase notification center, aggregation/idempotency publisher, private member snapshot, shared unread count and Realtime updates.
- A working separate per-device Web Push registration/delivery path; it only sends `push_candidate` events.
- Current profile push switch is not located under the bell: `NotificationCenterPage.tsx` sends the user to Profile via a prompt.
- Existing categories: social, picks, games, rankings and owner operations. Sport identity is presentation-time inference from route/kind; current client supports UFC, Football and MLB, not NBA.
- Category-level preference toggles were historically present but later forced on so the bell would not lose in-app events. Do not reactivate those legacy filters.
- Combined UFC/Football/MLB end-of-day notice can mention multiple sports. It must never send phone copy mentioning sports excluded by the recipient.
- NBA is scheduled for November 1, 2026; `NBA_OFFICIAL_GAMES_RELEASE_READY = false`, and the owner-prelaunch schedule remains private. Existing notification kind constraints and client models do not yet recognize NBA.
- Screenshot concern: unread bell showing `9+` followed by an empty inbox one minute later is **not reproduced or explained by this audit**; test separately for races, read/dismiss state, and account switching rather than assuming it is fixed by a visual change.

## Read-only database snapshot during audit
- 987 historical notification groups, 509 unread groups, 16 profiles with notification groups.
- 36 registered device subscriptions, 12 enabled at snapshot.
- 4,149 recorded sent Web Push deliveries and 29 expired; provider accepted a send is not proof the phone showed it.
- Of notifications updated in the previous 14 days: 283 push candidates and 51 in-app-only.
- No NBA-specific notification groups present.

## Draft product behavior
1. **One inbox for everyone.** All sports, universal account messages, read history and badge remain in-app. Sport selection does not suppress publishers or clear activity.
2. **Phone master switch in the bell.** On supported iOS it requests permission directly in the tap, without redirecting to Profile. Profile reuses the same control as a secondary entry.
3. **All sports / UFC / Football / MLB / NBA.** Compact individual sport pills with color/pressed states. The selections are private and follow the member across devices. They only affect phone pushes. The master switch is per-device.
4. **Defaults:** existing UFC, Football and MLB preferences stay enabled to preserve existing users. New NBA push is disabled by default, unless a user explicitly chooses NBA or All Sports.
5. **Backend enforcement:** the single delivery-claim function checks sport preferences before creating any per-device claim. If all sports relevant to an event are muted, no Web Push delivery is claimed. Universal account/social and owner-only operational alerts stay eligible.
6. **Combined Daily push:** when the in-app notification mentions multiple sports, send a phone-specific, redacted version listing only those enabled. The canonical in-app copy remains complete and unchanged.
7. **Inbox filter:** neutral All and colored UFC, Football, MLB, NBA views; neutral/universal items live in All. This is display-only.
8. **NBA scaffolding:** add four dormant event kinds for NBA launch, Daily open, Daily closing and results. Their timing/producers must only activate after the official NBA release gate is approved. Never alert all members from NBA owner previews.

## Delivery / content audit priorities
- **P0:** users should not get pushes from disabled sports; server enforcement, default migration, backend test, mixed-sport copy proof.
- **P0:** first-tap iOS enrollment from the bell, installed web-app eligibility, blocked permission state, recovery after failed registration.
- **P0:** NBA event kinds allowed in DB and client before launch; live NBA producer and schedule still explicitly gated.
- **P1:** audit every existing producer's route and kind against the `private.notification_push_sports_for_group` mapping. Bare Home routes and text-inferred sport announcements must eventually carry explicit sport metadata rather than relying on copy. Avoid adding an alternative scheduler or second inbox.
- **P1:** reproduce screenshot unread badge / empty inbox inconsistency and add a regression test if confirmed.
- **P1:** confirm deliver-only-once behavior after preference changes, read history, and user identity transitions.
- **P2:** tune push cadence/deduplication based on event windows; do not blanket-notify about unimportant news or new content.

## Draft validation
- Added a rollback-only SQL proof, `supabase/tests/notification_sport_push_and_nba_readiness.sql`, for profile defaults, auth isolation, UFC suppression, Football delivery, combined-sport redaction, NBA opt-in, social-event exemption, and idempotency.
- Added frontend contract tests for the bell switch, colors, filters, private RPCs, and the disabled NBA public release flag.
- No live push or bell event is sent by this draft. The proposed release's final acceptance should explicitly exercise a disposable opted-in device/profile on staging, confirm an actual phone alert AND matching in-app notification, then prove muted sports deliver **zero** phone alerts while remaining in the inbox.
- The exact PR head must pass typecheck, changed tests, full validation and backend rollback SQL before a merge. No deployment labels or merge are authorized by this draft.

## Open item before any live release
The NBA notification producers/schedules are **not** ready as of this draft; only the model, sport settings and delivery gating are prepared. Coordinate with the existing official NBA Daily release gate rather than inventing a separate NBA cron. Production push verification also requires a real opted-in installed device and is not implied by a database `sent` receipt.
