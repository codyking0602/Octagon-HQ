# Notification delivery — full product and implementation audit (draft, 2026-10-24)

Base: `main` @ `70a33643c2063902722356a478d21b60326f8b48`.
Working branch: `draft/notification-sport-controls-nba-20261024`.
**This draft must not be merged, migrate the production database, or send production notifications without a separate go-live instruction.**

## Findings from repository and read-only production schema inspection

1. **One canonical inbox already exists.** `NotificationProvider`, `notificationRepository`,
   `private.notification_groups/events` and private Realtime own events, unread counts,
   aggregation, mark-read, and clear-read. Rebuilding inboxes would cause duplication.
2. **Enabling device push unnecessarily requires navigation to Profile.** `NotificationCenterPage`
   currently renders `OPEN PROFILE` rather than the existing switch. A notification-center
   embed can use the same iOS-safe permission and subscription methods.
3. **Push cannot be safely controlled by sport on the current backend.** The existing
   per-member optional category preferences were deliberately disabled (all true) to keep
   the bell complete, and device subscription status is one global per-device setting.
4. **A mixed-sport push can reveal an unwanted sport.** The October combined Daily producer
   emits one message naming UFC, Football and/or MLB. A server-side permission check
   must also trim the push payload to *selected* sports, while leaving the original
   in-app message and aggregated event unchanged.
5. **NBA is not ready to publish real notification events.** NBA routing, orange branding
   and Nov 1 Daily schedule are present; `NBA_OFFICIAL_GAMES_RELEASE_READY=false`.
   Current notification enums/constraints have no NBA-specific kinds or NBA Daily
   producer. Historical `new_game_available` notifications using
   `/?hq-reveal=basketball-2026` are basketball, despite generic kind metadata.
6. **The private delivery path is present.** The existing database-trigger-to-Edge-Function
   Web Push pipeline de-duplicates notification versions and device endpoints and does
   not require a second scheduler. The live project has registered push endpoints,
   but this audit made **no changes to live subscriptions, deliveries, or notifications**.
7. **Stale unread reminders create inbox noise.** The October 24 read-only live
   snapshot showed 987 total canonical notification groups, 509 unread; 474
   unread groups were already older than two days and 386 older than seven days.
   This spans users, not just one profile. The screenshot likewise shows a
   two-day-old "Today's MLB Challenge is live" alert. The current model lacks
   an explicit expiry/deadline field, so outdated time-sensitive copy continues
   to appear as actionable until read or cleared.
8. **The bell is a long list.** It already marks sports using context colors; filtering
   the visible inbox by all/UFC/Football/MLB/NBA makes scanning easier without
   affecting underlying unread totals.

## Proposed product behavior

- The bell becomes the **primary** location for a per-device **Phone notifications**
  switch, using the current permission workflow; Profile may retain the same control.
- Directly below it: an account-wide **All sports / UFC / Football / MLB / NBA**
  multi-selection. It applies to every enabled device using server-managed profile
  preferences, not local storage. UFC red, Football blue, MLB green, NBA orange.
- New accounts default to **no sport push alerts** until they select a sport;
  existing enabled subscriptions are seeded with UFC, Football and MLB enabled
  for backward compatibility. NBA defaults **off** for everybody.
  NBA can be selected explicitly before launch but preview games **must not** generate
  any public notification. The All sports button selects every sport, including NBA;
  tapping it again deselects all.
- Push muting does **not** hide any in-app notification, remove notification history,
  alter read state, disconnect a device, or silence neutral War Room messages.
  Cody-only operational monitoring stays critical and push-eligible, independent
  of optional entertainment sport choices.
- Unknown/ambiguous sport-bound push events fail **closed**. A publisher must give
  a recognized canonical sport route or explicitly declare its event scope.
- Combined Daily messages remain a single inbox event, but phone summaries list
  *only the member-selected, unfinished sports*. If none are selected, no push.
- For iPhone push, the installed Home Screen web app and OS permission are required.
  The permission prompt must begin directly from the user's switch tap.
- The visual treatment remains charcoal, compact, mobile-first, with small team/sport
  color accents rather than colored card backgrounds. Read/mark/clear continue to work.

## Draft implementation

- UI: `NotificationPushSetting.tsx` is reusable by Bell/Profile;
  `NotificationCenterPage.tsx` hosts push controls and a separate inbox sport filter.
- Model: adds NBA sport identity and recognizes basketball launch reveal deep links.
- Repository/provider: add private get/set push-sports RPCs and cross-device profile state.
- Migration `202612310402_notification_sport_push_controls.sql`:
  stores private per-profile selection; enforces it in the **push enqueue trigger and
  service-only delivery claim**, including filtered summaries for combined Daily.
  Do not reuse `private.notification_preferences` to mute inbox events.
- Migration `202612310403_nba_notification_kind_preparation.sql` adds four
  dormant NBA canonical kinds and their category/priority mapping; it does
  not publish, schedule, or enable NBA previews.
- Tests: add TypeScript architecture contracts and isolated SQL eligibility assertions.

## Release gates (not yet satisfied)

1. Rebase against latest main **at the time of integration**; inspect concurrent NBA
   and notification PRs for changes to RPC or notification migrations.
2. Run TypeScript check, build, Vitest notification tests and the full existing test
   suite. Apply pending backend migrations to an **isolated test database** and run
   `supabase/tests/notification_push_sports.sql` plus existing notification SQL tests.
3. Check authorized profile isolation: an unauthenticated or other signed-in member
   cannot read/update another user's choices; private table grants remain revoked.
4. Verify UFC-only, Football-only, MLB-only, NBA-only, all-on, and all-off permutations
   for both a single-sport push and mixed Daily push. Verify no excluded sport is
   mentioned in mixed payload, and inbox history remains complete.
5. Verify iPhone installed-PWA permission, denied/blocked state, existing installed
   subscription repair, disabled-device vs enabled-other-device, and sign-out/sign-in.
6. On an **explicitly opted-in test profile and connected device**, publish exactly one
   deduplicated in-app-only test and one push-candidate test; confirm one bell row each,
   one delivered phone alert, correct deep link, correct badge and mark-read behavior,
   and no notification to other users. The screenshot device currently displays a
   disabled-push prompt, so actual delivery requires device activation first.
7. NBA release is a **separate** gate: NBA kinds and their classification are
   staged in the draft; still build official Daily/closing/recap and Picks/Futures
   producers, correct 48-hour cadence, no `nba_preview` recipients, deep links,
   aggregation and deduplication; verify `NBA_OFFICIAL_GAMES_RELEASE_READY` and
   backend authorization before enabling NBA public publishing. Do not treat a calendar
   date or colored NBA pill as proof that notifications are live.
8. Confirm exact PR head green before merge; apply canonical Supabase deploy workflow
   and verify production **only after** a separate "go live" request.

## Other audit risks to follow through

- Monitor current `new_game_available` generic routes: a home-root basketball reveal
  is recognized; any other unscoped sport launch should be given a canonical sport route.
- Mixed Daily push scope currently derives from the **server-authored summary** of
  `daily-closing-combined`; it is limited to this canonical event, but explicit
  per-event sport metadata is the better long-term contract for new multi-sport producers.
- A backend permission change cannot retract a phone notification already delivered.
  Always recheck at claim time, and never backfill muted events when a sport is re-enabled.
- Unread count and grouping are for all in-app events, including muted sports; the badge
  does **not** represent only selected push sports.
- Expiry should be addressed in a **separate, approved focused PR**: add optional
  producer-supplied `expires_at` to time-sensitive notifications; past-due
  reminders should no longer say "closes soon", show an obsolete CTA or display
  "NEW" as if timely. Keep history available and avoid deleting unread alerts
  without an explicit product decision. Validate UFC, Football, MLB, NBA
  expiration semantics by actual contest/lock time instead of a generic TTL.
- The launch-readiness and QA checks must be completed without sending any bulk
  notification to production members.

**Current disposition:** work prepared in draft only; no delivery test, production
deployment, or public NBA notification launch was performed.
