# Wheel read-only monitoring — NFL/UFC/GM acceptance contract

The approved October 25, 2026 scope **excludes all weekly CFB player and
head-coach rating refreshes**. Preserve the existing 1,277 approved CFB
identities, grade infrastructure, historical versions and Wheel game behavior.
No new CFB grade is authorized; draft PR #2143 remains unmerged.

## Required populations

- NFL: 626 approved identities, including 32 coaches monitored through
  independent coaching sources, and 594 GM-eligible players.
- UFC: 170 active fighter/division entries, including independently verified
  unranked athletes, official rankings, and champion identities.
- NFL GM: all 594 eligible contracts, age, roles, term, current independent
  source freshness, grading-authority lineage, and economy simulation.

CFB AP Top 25 factual checks remain separate in the dedicated AP monitor.
They can produce independently reviewable ranking correction receipts, but
neither AP changes nor CFB missing grades are mandatory NFL/UFC/GM release gates.

## Stages and failure rules

1. Read current approved NFL and UFC identities; do not collect CFB player rosters
   or query CFB grades as a weekly rating-monitor prerequisite.
2. Compare source-backed facts, preserving source IDs, timestamps, conflicts and
   missing coverage, without treating absence as proof of release or decline.
3. In independent read-only stages, run NFL multiweek performance/snap/availability,
   current UFC result/identity checks, and GM source comparison.
4. Evaluate strong sustained changes selectively. Rank and roster movements are
   **factual**, not automatic overalls.
5. Never promote incomplete coverage, unfresh provider snapshots, unverified
   coaches/unranked UFC athletes, missing-source cases, or missing GM economy gates.
6. Observations are not certified checkpoints. Failed/partial runs preserve the
   last-good certified checkpoint and never rewrite ratings/contracts.

Weekly activation remains disabled until exact-head CI, live source checks,
recovery tests and complete reduced-scope certification pass. No owner-authority
changes may be merged automatically.
