# Weekly Wheel monitoring — certified scope after October 25, 2026 owner decision

This is read-only infrastructure. **Mandatory weekly rating-monitor certification covers NFL
(626 approved identities including 32 coaches), UFC (170 active fighter/division entries),
and NFL GM contracts (594 eligible players). CFB player/coach rating refreshes are excluded.**
Do not spend weekly source-collection or editorial regrading resources on approximately
1,277 CFB player/coach entries. In particular, the 13 missing CFB Wheel grades are not
NFL/UFC/GM release blockers, and draft PR #2143 is on hold.

Existing CFB Wheel grades, private grade authority, source versions, AP game rules,
eligibility, historical results, and historical snapshots must remain untouched.
This monitoring change does **not** supply missing CFB grades or alter gameplay.

## Authority and source boundaries

- NFL grades and approved identity population: current Wheel NFL audit files, live
  private grade authority for 32 NFL team codes, and the established GM TypeScript
  authority. ESPN NFL rosters are evidence, not permission to release/reassign a player.
- UFC: active private fighter rows, official UFC.com **All Rankings** (never Meta),
  and additional independent evidence for all unranked fighters.
- GM: current immutable dated contract snapshot and independently observed current
  source facts; a source query timestamp is **not** proof of provider freshness.
- CFB **AP Top 25 factual monitoring is independent**:
  `.github/workflows/monitor-wheel-cfb-ap-top25.yml` /
  `scripts/check-wheel-cfb-ap-top25.mjs`. Poll movements produce editorial receipts;
  they do not trigger CFB rating work or block NFL/UFC/GM checkpoint promotion.
  This AP workflow is currently manual-only, not a weekly grading job.

## Collection and checkpoint rules

The staged Wheel monitor performs read-only NFL roster and UFC ranking scans,
reports evidence classifications, and retains an *observation* even when owner
review/certification is pending. NFL performance and snap source monitors and the
isolated GM contract comparison are separate staged inputs and **are not yet**
promoted as a globally certified source bundle.

New read-only observations use schema 4 with NFL/UFC identities; legacy schema-3
observations containing CFB remain readable only as historical comparison evidence.
New source-certified checkpoints use schema 3 with `certifiedScope` indicating
NFL/UFC/GM. Legacy checkpoint records are never rewritten.

No CFB identity is counted as removed merely because it is out of the new
monitoring scope. NFL and UFC grade changes, population changes, GM contract
authority, and official published UFC rankings remain subject to owner-reviewed
change PRs. Empty or failed sources preserve last-good checkpoints.

## Certification still required before coordinated weekly activation

- Full NFL identity/coach source coverage, stable ESPN/source IDs, transactions,
  injury/playing-time evidence, and integration of conservative multiweek production.
- All UFC ranked/champion/unranked source checks, official rank reconciliation,
  fight results and meaningful changes.
- Current and independently fresh GM contract coverage, release/free-agent handling,
  role/development integrity and economy regressions.
- Reproducible source receipts and strict freshness, failure, reentry and atomic
  checkpoint promotion tests. A green workflow is not proof that these gates passed.
- Exact-head Validate V2 and staged real-source runs; keep the weekly cron
  disabled until a complete **NFL/UFC/GM** source-certified cycle exists.

Never restart the old oversized Wheel Grade Refresh task. Do not restore duplicate
CFB player-rating jobs. Keep source observations and rating recommendations
separate from automatic grade changes.
