# Wheel player monitoring — staged replacement (October 25, 2026)

## Authority, scope and safety

This is **read-only infrastructure**. It does not alter NFL/CFB/UFC overalls, current
Wheel grades, UFC ranking/category rows, CFB AP 25 rows, NFL GM authority,
historical grade files, contracts or completed games. Source changes create
actionable evidence; human-reviewed content PRs are the only publication path.

Canonical data authorities remain:
- NFL audited Wheel grade JSONs (QB/RB/WR/TE/Front Seven/Secondary/Head Coach)
  and `src/features/back-room/wheelFootballNflCurrentAuthority.ts`;
- CFB live `private.wheel_football_grade_authority`, including extra-team Boise
  audit. Flex is derived from RB/WR/TE, never its own rating;
- UFC live `private.wheel_ufc_fighters`; standard UFC.com **All Rankings**, not
  **All Meta Rankings**;
- GM existing canonical `scripts/refresh-wheel-nfl-gm-authority.mjs`, grade
  imports, immutable dated contracts and separate outlook adjustments.

`scripts/wheel-monitor/core.mjs` handles complete identity checks and
conservative classifications. `run.mjs` reads live private Wheel tables via
the **existing** GitHub `SUPABASE_ACCESS_TOKEN` management API secret; compares
canonical NFL grades and current ESPN NFL/CFB roster/ESPN AP information; parses
UFC standard rankings; and writes no game state. A failed source query, incomplete
roster, malformed poll, missing division or genuinely malformed rankings must fail closed.
Official UFC ties (such as two #12 contenders followed by #14) are valid
source facts. The collector preserves and reports them instead of fabricating
unique positions.
Never change a rating because of an absence, single week, or ranking shuffle.

## Checkpoints

`.github/workflows/wheel-monitor.yml` currently has only **manual** and
**one-off main push** triggers. The weekly cron is NOT enabled until the
live, end-to-end source and identity acceptance run passes. There is no second
scheduled poll workflow: `monitor-wheel-cfb-ap-top25.yml` is manual-only.

When the read-only workflow runs:
1. Restore the artifact from the last **schema-2 source-certified** run if available.
   Schema-1 artifacts incorrectly promoted review-held observations and cannot
   serve as trusted baselines.
2. Run deterministic tests, query current live identity authorities, fetch
   primary evidence and classify roster/AP/UFC changes.
3. Preserve a factual review report; maintain explicit source errors,
   timestamps, previous values, source URL and action classifications.
4. Promote a new snapshot artifact only after *all* certification gates pass.
   Report-only runs still give independent NFL/CFB/UFC observations even when
   another sport has a known grade gap; they produce no certified snapshot.
   On failure preserve the last good successful snapshot. No rating PR is
   created on an unchanged week or merely from a factual signal.

This intentionally leaves the old **Wheel Grade Refresh** ChatGPT task
disabled. It was oversized; re-enabling it would create competing ownership.

## First audit findings; not a ratings proposal

- October 12 and 19 AP CI runs failed because `check-wheel-cfb-ap-top25.mjs`
  throws exit 1 on **expected poll differences** against the October 4 locked
  snapshot; it did not distinguish changed source data from software error.
- The October 14 draft PR #1916 updates AP October 11/UFC October 10 factual
  sources but omits grading, GM and validation gates and is not merge-ready.
  Do not merge it into the new architecture without renewed fact-checking.
- October 25 live Supabase query still found the latest stored AP poll dated
  October 4 and UFC ranking date September 29, with 170 UFC fighter-division
  rows and one champion plus 15 contenders in each of eight divisions.
- NFL GM currently imports October 3 grade artifacts and October 5 contracts;
  detect current team/contract changes independent of ability before creating
  a fresh immutable snapshot. Preserve all historical versions.


## October 25 live collector correction

- Approved current identity counts are **626 NFL** and **1,277 CFB**, excluding
  derived Flex. The first collector mislabeled 1,362 historical/latest CFB
  authority rows as current. Active-only matching yields **1,264 CFB grades**,
  leaving the 13 specific binding gaps in issue #2130. Stale historical rows are
  reported separately, not treated as playable identities.
- The official UFC All Rankings currently contain authentic ties at rank #12
  in Welterweight and Heavyweight, where the next position is #14. Source
  shape validation must accept these with explicit tie evidence, never force
  the canonical game to misrepresent official positions.
- Current GM contracts are only internally population-validated. An independent
  provider refresh, economy test, head-coach source verification, headshot HTTP
  audit, unranked UFC identity confirmation and performance-evidence filtering
  must all pass before a baseline can be promoted.
- Browser Vitest must never discover the monitor's `node:test` fixtures:
  these live in `*.nodecheck.mjs` and run separately in GitHub Actions.
- Expected review blockers produce a `review-blocked` diagnostic report;
  a failed transport/SQL/execution stage writes `failed-not-promoted`.
  Neither is a source-certified checkpoint. The disabled old grading task and
  weekly replacement cron remain disabled.

## Not yet certified — prerequisites for the weekly cron

The full replacement must **not be declared operational** until:
- Read-only GitHub Actions job completes against live Supabase and all
  primary source endpoints; verify 100% active NFL/CFB/UFC identities, including
  coaches and unranked UFC fighters.
- Resolve unmatched source names, coach source authority and verified headshot
  URLs; validate live UFC source ties and official standings integrity.
- Add per-player snap/efficiency/result trends, with evidence windows and peer
  references; CFB can have shorter stabilizing windows than NFL.
- Verify NFL/GM contracts every week using the existing OTC/nflverse generator
  without publishing, maintain GM coverage exactness and economy regression;
  remove source gaps without hiding them as a successful cycle.
- Exercise real provider failures and interrupted-run recovery; ensure API rate
  limits and 19-minute timeout permit a full verified snapshot.
- After passing all gates, add exactly one weekly cron and optional Wednesday
  alternating editorial review cadence via a verified infrastructure PR,
  requiring exact-head green CI and production readback.
- Keep grading/population updates on **separate owner-approved** PRs.

The completed infrastructure can be merged independently after full exact-head
validation; enabling cron and claiming live monitoring are **separate acts**.
