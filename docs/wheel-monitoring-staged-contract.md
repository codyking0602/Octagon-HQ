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

## Activated read-only operating policy (October 26, 2026)

The central `wheel-monitor.yml` factual scan is scheduled every Tuesday at
10:15 UTC. NFL coaching, NFL roster identities/team affiliations, UFC official
rankings and unranked profiles, and GM provider contract facts are checked
weekly. NFL production/snap performance evidence runs on alternate Tuesdays,
anchored to the week of October 26, 2026; a manual dispatch may request it
outside that cadence. Scheduled scans avoid redundant application CI and are
always read-only; code PRs still require exact-head CI before merging.

A completed scan **does not** mean that source data is certified. Reports carry
four independent results: `monitoringHealth.execution` (read-only run),
`sourceQuality` (source/evidence quality and provenance),
`reviewExceptions` (outstanding actionable findings and publication holds),
and `publication` (whether a complete certified snapshot can be promoted).
Existing top-level `review-blocked` and `source-certified` labels remain
for backward compatibility and refer strictly to publication readiness.
An ungraded observation may be retained even if the snapshot cannot promote.
Missing source credentials, malformed identity catalogs, provider collection
failures and malformed official rankings remain real collection failures.

Absence of qualifying NFL snap/performance evidence is **not** an ability
downgrade, a per-player certification task or a reason to stop future scans.
Keep current grades until strong sustained evidence indicates a meaningful
exception. Roster absence or name-only team matches are **not** verified
transactions. Reconcile ESPN player IDs across observations, consult official
club or league transaction records for releases/trades/signings, and record
uncertain cases without changing curated populations. Confirmed roster facts
remain distinct from editorial eligibility and ability changes. All owner
approvals for curated rosters, fighter records, ranks, GM contracts and economy
remain required.

Madden is an **optional independent NFL comparison**, not a live data source
or grading authority. No current verified ingester/licensed feed is established
by this monitoring workflow. Only with reliable sourced counterpart ratings:
difference under 7 = ordinarily no action, 7–9 = investigate with substantive
evidence, 10+ = high-priority explanation; never automatic recalibration.

UFC unranked athletes do not need to appear in the ranked table. UFC official
rank corrections, fighter retirement/inactivity and profile identity gaps are
separate factual exceptions; no automatic edits. GM contract differences are
reviewed for material gameplay impact; economy regression checks remain strict.
Draft owner-review PRs #2143, #2144, #2145, #2155 and #2167 must remain held,
as must independently isolated Millionaire PR #2139.

Promotion remains fail-closed: unresolved source/provenance integrity,
identities, ranking corrections, contracts, grades or economy issues block
certified snapshots and downstream writes, **not** the weekly read-only scan.
No owner-authority changes may be merged automatically.
