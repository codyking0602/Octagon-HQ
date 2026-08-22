# Football content simulation / replay audit

Status: PR10 audit baseline

Audit source: `src/features/back-room/footballContentSimulationAudit.test.ts`

This audit is intentionally cross-game. It does not introduce a second generator, data provider, replay owner, or scoring path. Each mode is exercised through its existing canonical Football owner and the results are enforced in the normal exact-head test suite.

## Audit scale

- Blind Rank 5: 384 generated boards per canonical comparison pack, 13 packs, 4,992 boards total.
- Keep 4 / Cut 4: 384 generated boards per canonical comparison pack, 13 packs, 4,992 boards total.
- Blind Resume: 1,200 five-round games.
- Wavelength: 2,000 four-clue rounds.
- Hit the Number: 1,000 generated plans.
- Find the Leader: 1,600 generated boards plus the complete definition-level competition audit.

The audit also exercises deterministic replay behavior, candidate uniqueness, pool coverage, category distribution, difficulty gates, and overexposure pressure where the underlying mode supports those concepts.

## Results

### Blind Rank 5

- Unique unordered board share: **96.81%**.
- A relative bottom-third subject appeared on **92.63%** of boards.
- Multiple relative bottom-third subjects appeared on **62.76%** of boards.
- High-third + low-third contrast appeared on **77.84%** of boards.
- Absolute `below-average` + `bad` slot share: **9.05%**.
- Absolute `good` + `average` slot share: **21.46%**.

The relative-pool measures are the correct cross-category difficulty check. Some Football comparison pools are intentionally concentrated at the high end, so forcing a universal absolute-band quota would distort category-specific ratings. Tier-aware exposure checks still guard against one subject dominating a sufficiently deep tier.

### Keep 4 / Cut 4

- Unique unordered board share: **96.47%**.
- Tight fourth/fifth cutoff (`<= 4` rating points): **100%**.
- Average fourth/fifth cutoff gap: **1.69** rating points.
- Absolute `below-average` + `bad` slot share: **7.15%**.
- Absolute `good` + `average` slot share: **24.59%**.

The defensive-career pool exposed why global per-subject ceilings are misleading: some rating bands are intentionally sparse, so a bridge subject can be structurally necessary for competitive boards. PR10 therefore uses tier-aware overexposure checks, matching the canonical generation maturity contract, rather than weakening the generator or inventing filler subjects.

### Blind Resume

- Canonical matchup catalog: **96**.
- Matchups consumed per game: **5.21%** of the catalog.
- Matchup coverage across the simulation: **100%**.
- Unique five-round game share: **100%**.
- Maximum matchup exposure versus average: **1.39×**.
- Maximum real-subject exposure versus average: **2.80×**.
- Categories seen: **13**.

Blind Resume has strong replay depth and low repeat pressure at its current catalog size.

### Wavelength

- Canonical clue catalog: **300**.
- Categories seen: **20 / 20**.
- Distinct clues seen: **281 / 300**.
- Distinct hidden targets seen: **76 / 76** possible values from 20 through 95.
- Low target share: **27.10%**.
- Middle target share: **37.85%**.
- High target share: **35.05%**.
- Largest category appearance share: **7.84%**.
- Consecutive hidden-target repeat rate: **1.60%**.
- Consecutive opening-category repeat rate: **5.85%**.

All four clues inside every audited round remained unique by both clue ID and category, and directional correction behavior remained valid.

### Hit the Number

- Subjects seen: **35 / 35**.
- Domains seen: **3 / 3**.
- Format/domain pairs seen: **12 / 12**.
- Unique plan share: **97.90%**.
- Average legal four-subject selections per plan: **50.42**.
- Every audited board retained a good under-target outcome, a middling outcome, and a meaningful bust outcome.

Observed format shares:

- Classic: **40.9%**.
- Themed Lineup: **26.6%**.
- One From Each: **17.6%**.
- Build the Team: **14.9%**.

Observed domain shares:

- CFB champion scoring: **34.7%**.
- NFL RB rushing: **31.5%**.
- NFL QB passing: **33.8%**.

The generator is balanced and high-replay at its current scope. Its broader long-term depth is still bounded by three objective domains and 35 stable subjects, but PR10 found no distribution or quality defect requiring a generator change.

### Find the Leader

- Questions seen: **82 / 82**.
- Metrics seen: **41 / 41**.
- Families seen: **8 / 8**.
- Domains seen: **3 / 3**.
- Immediate question repeats: **0**.
- Immediate metric repeats: **0**.
- Immediate family repeats: **0**.
- Maximum question exposure versus average: **2.10×**.
- Maximum metric exposure versus average: **1.85×**.
- Maximum family exposure versus average: **1.15×**.
- Unique unordered question + candidate-set share: **20.44%** across 1,600 boards.

Every question still passes the competition audit: at least four near contenders, no more than two farther wildcards, and a non-record-holder group leader whenever the metric pool supports one.

## Main finding

**Find the Leader is the shallowest remaining Football replay surface.**

The issue is not scheduling or decoy quality. Its rotation is healthy and it covers the full 82-question / 41-metric catalog without immediate question, metric, or family repeats. The replay ceiling comes from objective source depth: a ten-candidate board is usually being drawn from only about 10–12 comparable factual rows for that metric. Once those rows recur, the unordered candidate set has only a small number of honest combinations.

PR10 deliberately does **not** disguise that limitation by treating card-order permutations as new content or by adding a second factual provider. The honest future expansion is to broaden the existing canonical Football factual pools for Find the Leader metrics, then let the same generator produce more materially different boards.

## PR10 decision

No production gameplay generator required a forced tuning change from this audit. The initial failures were audit-model problems, not reasons to distort the product:

1. A global Keep/Cut subject ceiling ignored sparse category-specific rating bands. It was replaced with tier-aware exposure pressure consistent with the existing canonical maturity contract.
2. A 90% Find the Leader unordered-board uniqueness requirement was mathematically incompatible with ten-candidate boards backed by mostly 10–12-row objective pools. PR10 now records and guards the real replay baseline while explicitly identifying source-pool breadth as the next depth constraint.

The executable audit remains the release guardrail; this document records the measured baseline and the product conclusion.