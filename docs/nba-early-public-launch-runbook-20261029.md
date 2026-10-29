# NBA 2026 early public launch — owner-go-live handoff

**State:** staged only; no merge, deploy, public gate activation, or notification send was authorized during preparation.

## Intent and timing
- Bring NBA Cup group picks and four NBA Casual games public with the launch.
- Launch official NBA Daily October 30, 2026 (America/Chicago), then every 48 hours opposite the locked UFC publication cycle, through April 11, 2027. All nine approved games rotate within this Daily cycle.
- Preserve owner-only prelaunch history in the `nba_preview` namespace; **never** migrate those attempts to official `nba` standings.
- NBA Futures remain locked with their existing saved member cards; do not reopen them.
- Use the exact existing team-logo/player sources and Cup artwork.
- The launch push goes out **only after verified go-live**, at execution time, using `ops/nba-public-early-launch-manual-push.sql`. It is not tied to Nov 1 and must never run from a migration.
- PIN members receive the launch event in-app; **device push still respects existing per-device NBA notification opt-ins**. No forced marketing opt-in.

## Ordered release (only after an explicit GO LIVE)
1. Resolve fresh `main` and all concurrent PRs. Refresh exact heads and verify green PR tests. Block if any other chat currently owns integration.
2. Verify against live Supabase that no public NBA Daily board has been published on/after Oct 30; verify schema migration order and that the new Cup RPC migration is not already applied.
3. Merge NBA Cup public PR (202612310887) and validate server-side authenticated/non-owner read, save, invalid-picks refusal, manual lock, and anon denial. Do not send announcement.
4. Merge NBA Games PR (202612310888), after rechecking the local clock and its Oct 30 initial slot. Validate frontend/Edge/Supabase release order. Ensure new public schedule appears and matches `average_fan` on Oct 30, second board Nov 1, 48-hour closing, and official submission/leaderboard drilldown on a non-owner test account. Confirm `nba_preview` history is still owner-only. Do not backfill historical scores.
5. Merge release-copy/notification PR. Verify production header, Game Room, Casual routes, Cup Picks, and the announcement deep link on iPhone. Verify all three sports' Daily slots: Football every day, UFC Oct 29/31, NBA Oct 30/Nov 1.
6. Only after ALL above succeed, execute `ops/nba-public-early-launch-manual-push.sql` **once** on production. Read the per-member created/already-notified counts; verify one in-app event and an opt-in device push. The script also enables the NBA Daily closing notification release gate.
7. Check production deployed SHA and live backend; report results and notification counts. A failure at any step blocks the announcement. No automatic rollback of user-visible notification is possible.

## Coordination and caveats
- If the owner says GO LIVE **after Oct 29**, re-evaluate the first official Daily slot before merging. Do not ship a scheduled board that began before the actual public release.
- The October 29 public launch can show Casual and Cup; official Daily starts October 30, preserving NBA/UFC alternate-day timing.
- The older `ops/nba-launch-2026-push.sql` is **not** the release command for this cutover. It was a pre-existing Nov 1 era draft; do not run both.
- `NBA_OFFICIAL_GAMES_RELEASE_READY` and the Edge gate open only via the Games PR; notification `private.notification_nba_release_gate` remains false until the final manual script.
