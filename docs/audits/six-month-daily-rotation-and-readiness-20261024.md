# Octagon HQ — Six-month Daily rotation and content readiness (staged, NOT a release)

**Audit baseline:** GitHub `main` `8b9f2aed26ea10f56c8863e0a0cd5ce6c6d85195`; read-only Octagon HQ production database queried October 24, 2026.  
**Prospective date range:** October 25, 2026–April 25, 2027, inclusive (183 calendar days).  
**Status:** Draft-only simulation on PR #2103. **Do not deploy or merge this preview as a canonical schedule.** Part 1 owns cadence changes, historical protections and activation, and still needs to provide its final schedule version and exact source seeds. UFC Higher or Lower is separately staged in PR #2101.

## A. Rotation report

### Locked per-28/30-slot weights

| Game | Football (28) | UFC (30) | NBA (28) |
| --- | ---: | ---: | ---: |
| Average Fan | 4 | 4 | 4 |
| Sports Feud | 4 | 4 | 4 |
| Millionaire | 4 | 4 | 4 |
| Who Am I | 3 | 3 | 3 |
| Find the Leader | 3 | 3 | 3 |
| Wavelength | 3 | 3 | 3 |
| Bar Trivia | 3 | 3 | 3 |
| Hit the Number | 2 | 2 | 2 |
| Higher or Lower | 2 | 2 | 2 |
| Blind Resume | 0 | 2 | 0 |
| **Sum** | **28** | **30** | **28** |

The existing production Football/UFC schedule is **27/29-slot**, with Average Fan **5x** and no Higher or Lower. Football Higher or Lower's published runtime foundation is already merged (#2100); certification and rotation activation are separate. UFC Higher or Lower is draft-only (#2101). The legacy name `higher_or_lower` in approved policy maps to the actual scheduled game type `higher_lower`.

### Actual production baseline versus staged preview

Read-only production SQL called `private.daily_challenge_schedule_for_day` and `private.daily_challenge_expected_game` on all dates. The active October 24 production setup yields **183 Football days, 183 UFC days and 81 NBA public dates** (NBA November 1–April 11). Across those dates there are **18 distinct same-game collision dates**: Football/UFC 4, Football/NBA 6, UFC/NBA 8. Published rows/attempts have **not** been changed.

The Part 1 cadence mask by itself reduces UFC to **92** alternate-day dates and prevents UFC/NBA simultaneous dates. With current legacy game cycles and only this mask, there are **8** Football/other-sport collisions. The staging proposal then retains NBA's existing approved 28-slot order (so the first 81 NBA game/day ordinals match today's implementation), distributes Football and UFC under exact approved weight cycles and urgency-based spacing, yielding **6** Football/other-sport collisions over the entire horizon. This is a proposed algorithm, **not a measured post-deployment result**.

**Part 1 gap:** The current NBA implementation ends April 11. An uninterrupted every-other-day NBA cadence to April 25 requires **seven additional NBA dates** (April 13, 15, 17, 19, 21, 23 and 25). There is currently no production-equivalent NBA date/ordinal publication implementation for these dates; they remain uncertified until Part 1 extends the season. Without that extension the current NBA count stays **81**, rather than the projected **88**. This is an explicit blocker, not a silent scheduling omission.

### Projected appearances

| Game | Football (183) | UFC (92) | NBA (88 prospective) |
| --- | ---: | ---: | ---: |
| Average Fan | 26 | 13 | 13 |
| Sports Feud | 26 | 12 | 13 |
| Millionaire | 26 | 12 | 13 |
| Who Am I | 19 | 9 | 9 |
| Find the Leader | 20 | 9 | 9 |
| Wavelength | 20 | 9 | 9 |
| Bar Trivia | 20 | 9 | 9 |
| Hit the Number | 13 | 6 | 6 |
| Higher or Lower | 13 | 6 | 7 |
| Blind Resume | — | 7 | — |
| **Total** | **183** | **92** | **88** |

For comparison, the expected number of a weight-*w* game over a horizon of *N* Daily dates is `N*w/(total cycle slots)`. The staging preview allocates the exact quota in every complete cycle and stays within one appearance of this expectation over partial cycles. Results are deterministic from dates and preview version, not job invocation order; no published rows are rewritten.

Six-month preview observed cross-sport overlaps on these six dates: UFC/Football **2026-12-16 Who Am I**, **2027-03-18 Sports Feud**, **2027-04-01 Sports Feud**; NBA/Football **2026-11-21 Sports Feud**, **2027-01-16 Sports Feud**, **2027-03-13 Sports Feud**. There are no NBA/UFC same-date slots under the approved opposite cadence. These are accepted as spacing/weight-preserving trade-offs, pending final Part 1 version.

**Measured preview interappearance spacing (calendar days):**

| Sport | Weight | Typical planned interval | Observed minimum / maximum |
| --- | ---: | --- | --- |
| Football | 4x | ~7 days | 4–10 |
| Football | 3x | ~9.3 days | 7–12 |
| Football | 2x | ~14 days | 8–20 |
| UFC | 4x | ~15 days | 8–22 |
| UFC | 3x | ~20 days | 14–26 |
| UFC | 2x | ~30 days | 20–34 |
| NBA | 4x | ~14 days | 6–18 |
| NBA | 3x | ~18.7 days | 18–20 |
| NBA | 2x | ~28 days | 24–32 |

Distances are from actual staged selected date arrays, not an assurance of production behavior. A 2x UFC title legitimately runs roughly every month, not every two weeks, because UFC publishes every other calendar day and has a 30-game weight cycle.

## B. Content readiness: full inventory gate

The table uses *actual staged appearances*, not authored bank records. **Unique six-month capacity and exact semantic repeat counts must be populated from passing production-generator CI output and complete editorial/source review before declaring Ready.** An authored bank size is not a certificate. Question demand is described by the production game unit; run-based totals must be extracted from the same versioned actual boards before activation.

| Sport | Game | Appearances | Questions / units required | Independently verified unique capacity | Status |
| --- | --- | ---: | --- | --- | --- |
| Football | Average Fan | 26 | 10 board + Final / appearance | Not certified here; prior editorial Stage 2 evidence exists | Requires manual factual review |
| Football | Sports Feud | 26 | 2 Main + 5 Fast Money / appearance | Existing rebuilt families; final generated demand to verify | Requires manual factual review |
| Football | Millionaire | 26 | 8 questions / appearance | Pending generated concept audit | Requires manual factual review |
| Football | Who Am I | 19 | 2 identity rounds / appearance | Pending actual clue/subject repeat audit | Requires manual factual review |
| Football | Find the Leader | 20 | 2 boards / appearance | Pending athlete-season/stat audit | Requires manual factual review |
| Football | Wavelength | 20 | 2 rounds / appearance | Pending selected-clue semantic audit | Requires manual factual review |
| Football | Bar Trivia | 20 | 10 questions / appearance | Separate NFL/CFB Bar Trivia audit in flight | Requires manual factual review |
| Football | Hit the Number | 13 | **26 boards** (2 / appearance) | Exact board uniqueness/solution audit added; pending CI | Requires manual factual review |
| Football | Higher or Lower | 13 | **130 comparisons** | Separate six-month pair/reversal certification outstanding | Requires manual factual review |
| UFC | Average Fan | 13 | 10 board + Final / appearance | Prior Stage 2 evidence, still requires regenerated proof | Requires manual factual review |
| UFC | Sports Feud | 12 | 2 Main + 5 Fast Money / appearance | Curated V2 bank has 48 Main +120 FM topics in #2081; final runtime evidence pending | Requires manual factual review |
| UFC | Millionaire | 12 | 8 questions / appearance | Pending generated concept audit | Requires manual factual review |
| UFC | Who Am I | 9 | 2 identity rounds / appearance | Pending generated clue/subject history | Requires manual factual review |
| UFC | Find the Leader | 9 | 2 boards / appearance | Pending fighter-stat audit | Requires manual factual review |
| UFC | Wavelength | 9 | 2 rounds / appearance | Pending generated semantic audit | Requires manual factual review |
| UFC | Bar Trivia | 9 | 10 questions / appearance | Pending generated editorial audit | Requires manual factual review |
| UFC | Hit the Number | 6 | **12 boards** (2 / appearance) | Noncompliant legacy 7-pick/12-choice config; needs repair | **Needs expansion** |
| UFC | Higher or Lower | 6 | **60 comparisons** | Separate implementation PR #2101 | **Blocked by separate implementation** |
| UFC | Blind Resume | 7 | Production-provided rounds / appearance | Pending generated matchup audit | Requires manual factual review |
| NBA | Average Fan | 13 | 10 board + Final / appearance | Seven final dates require Part 1 extension | Requires manual factual review |
| NBA | Sports Feud | 13 | 2 Main + 5 Fast Money / appearance | Seven final dates require Part 1 extension | Requires manual factual review |
| NBA | Millionaire | 13 | 8 questions / appearance | Seven final dates require Part 1 extension | Requires manual factual review |
| NBA | Who Am I | 9 | 2 identity rounds / appearance | 200-player population alone does not prove no repeat | Requires manual factual review |
| NBA | Find the Leader | 9 | Production-defined comparison boards | Candidate-year/stat source review pending | Requires manual factual review |
| NBA | Wavelength | 9 | Production-defined rounds | Clue concepts need six-month audit | Requires manual factual review |
| NBA | Bar Trivia | 9 | 10 questions / appearance | Existing 200 bank; unique concept audit pending | Requires manual factual review |
| NBA | Hit the Number | 6 | Production-defined boards | Actual lineup/stat repeat audit pending | Requires manual factual review |
| NBA | Higher or Lower | 7 | **70 comparisons** | Reversed pair/season pairing audit pending | Requires manual factual review |

No row is marked **Ready** solely on record counts. The existing semantic checker `dailyContentQualityPolicy.ts` detects exact text, shared editorial fact-key and some same-answer near duplicates; it cannot replace external factual attestation. Cross-sport collision detection applies only to dates actually published in both sports. Who Am I season/source identity, Sports Feud concept equivalence, Higher or Lower reversed pair identity and title attribution each need format-specific keys.

## C. Hit the Number deep audit

### Football

- Source: `footballHitTheNumberModel.ts`; official generator: `footballDailyPublicationHitNumber.ts`.
- Mandatory generator design: 4 picks → **12 choices**; 5 picks → **14 choices**; 6 picks → **16 choices**. No 7-pick fallback. The same curated canonical model is used by official and Casual gameplay.
- Staged horizon: **13 dates**, **26 separate boards**, with NFL and CFB represented across first/second Daily games.
- Every generated board must have distinct subject identities, exact sum of one valid solution, correct league/metric/source evidence, positive strategic choices, no duplicate full board and no excessive same-metric subject overlap.
- New test logs actual pick distribution, subjects and metric-catalog counts, unique fingerprints and near-board collisions from all 26 **real constructed** official boards; do not infer success until test evidence is green.
- Final verdict: **not yet certified** — await actual logged pick distribution, repeat/quality findings, source spot checks and final Part 1 production seed.

### UFC

- Source: `hitTheNumberEngine.ts` plus `hitTheNumberFormats.ts`, `hitTheNumberPoolQuality.ts` and `hitTheNumberDailyRuntime.ts`; factual fighter stats currently derive from canonical UFC fight records with supplemental metrics omitted when unsupported.
- Staged horizon: **6 dates**, **12 separate boards**. The new test regenerates the source plan using the actual official seed, confirms exact solution total and checks full and near-identical fighter lineups.
- **Confirmed source-contract defect:** existing UFC generator still permits **7 picks** (15% generation weight), caps all random-pool choices at **12** and can select uncapped open-roster boards. These cannot be described as satisfying 4/5/6-pick and 12/14/16-choice standards. Do not change Casual history or existing completed boards to repair future Daily inventory.
- No claim of six-month readiness until an isolated curated Daily generator selects 4/5/6, ensures meaningful 12/14/16 choice inventory where appropriate, verifies statistics against UFC-only source scopes, prevents repeated concepts and passes full projected dates on final Part 1 seeds.
- Final verdict: **Needs expansion / generation repair**. This draft performs diagnostic generation and preserves production as-is; it does not falsely activate or recertify the old UFC engine.

## Tests, reproducibility and boundaries

- `src/features/play/sixMonthRotationPreview.ts` — separate hypothetical selector; does not modify app/backend schedule.
- `src/features/play/sixMonthRotationPreview.test.ts` — future masks, weights, quota/spacing/collision deltas, determinism.
- `src/features/play/sixMonthHitNumberReadiness.test.ts` — every Football/UFC preview Hit the Number board generated by the actual current official runtime.
- `src/features/play/sixMonthContentReadiness.test.ts` — Football/UFC non-HTN and real NBA current-date server publications; captures failures and semantic-ID evidence. Historical publication history is **not** available to this standalone runner and cannot be silently assumed empty in certification.
- Draft PR: https://github.com/codyking0602/Octagon-HQ/pull/2103. Separate UFC implementation: https://github.com/codyking0602/Octagon-HQ/pull/2101.
- Production was inspected using **read-only aggregate SQL only**. No scoring, leaderboards, streaks, past rows, snapshots, schema, frontend or Casual modules were altered. No activation, merge, or deploy was performed.

**Release gate:** Before using any staging calendar in production, the Part 1 owner must land the authoritative cadence/migration with correct NBA coverage, then this PR must be rebased onto fresh main, exact production version/day seeds must replace preview seeds, generated history-sensitive boards must be checked against real published history, all capacity/semantic/factual issues must be resolved and exact-head backend/frontend CI must pass. Owner authorization is required before merging.
