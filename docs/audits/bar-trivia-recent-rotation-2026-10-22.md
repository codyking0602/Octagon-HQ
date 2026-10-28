# Bar Trivia Daily recency guard — staged separately for review

This change is independent from draft PR #2028's editorial exclusions and regrades. It adds a **future-only, deterministic** recent-history exclusion around the existing canonical Bar Trivia generator without modifying scoring, wager behavior, UI, or saved official Daily results.

## Why
The current Daily publisher seeds each run independently and passes no `recentQuestionIds` to `buildBarTriviaRun`. The latter already supports recently used IDs for evergreen selection and current-event eligibility, but production has not supplied them. Archived UFC Bar Trivia lineups on September 29 and October 5, 2026 repeated both `ufc-current-2026-09-19-joshua-van-pantoja` and `ufc-easy2-youngest-champ` (two out of ten repeated in just six days).

## Proposed implementation
- Start at September 29, 2026 and replay **scheduled** earlier Bar Trivia days using fixed seeds, the same NFL/CFB alternating calendar, and the same evergreen/current-event bank. Keep the prior **three** lineups per league (up to 30 IDs) for generation of the next board. UFC, NFL and CFB have separate histories.
- Pass these IDs to the generator's **existing** recent-question behavior. It excludes recent current events; when no fresh current-event question is eligible, evergreen material fills the slot. Old/rare current-event repeats are not forced.
- Preserve the separate intentional football theme-day override. Bump content version to `bar-trivia-daily-v2-recent-rotation` for newly published setups. Existing published v1 setups/results remain server-owned and unchanged.
- Add a **150-day** forward seeded proof ensuring each league's board has ten different IDs, deterministic replay, and no overlap with its prior three appearances. Also verify no past news is silently reused as December current events.

## Limits and merge gate
The deterministic replay uses current source content and the current schedule version. It cannot reconstruct changes to **old already-published** source versions, so it is not a substitute for actual database history where the schedule/content changed. The guarantee applies to future runs emitted by this version of the publisher, provided the schedule/content version stays consistent. The event bank also needs replenishment: at October 22 the original active pool was NFL 1 / CFB 2 / UFC 4, and #2028 proposes retiring two niche UFC entries.

**DO NOT MERGE** until owner reviews this approach and exact PR-head tests are green. No historical result backfills, production changes, or migration.
