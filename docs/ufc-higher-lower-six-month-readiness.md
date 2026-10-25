# UFC Higher or Lower — staged six-month readiness audit

## Release contract

- **Status:** staged in draft PR #2101, NOT activated or published to the UFC Daily calendar.
- **Official weight:** UFC Higher or Lower **2x per 30-game cycle** (the approved Stage 1 future weighted plan in PR #1903); no weights or calendar schedules are changed in this PR.
- **Cadence assumption:** UFC official Daily runs once every 48 hours, opposite NBA. The 200-day reservation beginning November 2, 2026 contains **100 candidate UFC dates**, exceeding six calendar months. The finalized coordinated cross-sport rotation chooses the actual 2x slots separately. Roughly six or seven 10-question UFC Higher or Lower appearances (60–70 questions) would fall in six months at the approved weight; this is **not** a claim that those exact future dated appearances have been activated.
- **Repetition guarantee:** 100 reserved deterministic 10-question boards, 1,000 different unordered fighter pairs. The same pair cannot repeat in reverse or with another metric, even on non-Higher-or-Lower candidate dates. Each board contains 20 distinct fighters; any duplicate or exhausted board fails closed.
- **Difficulty:** exactly 3 approachable, 5 competitive, 2 tough comparisons per board, with hardcoded progressively tighter source-backed numerical gaps.
- **Stat coverage:** 6 factual UFC-only metrics; 10-question composition per board: 2 bout counts, 2 UFC win counts, 2 finish victories, 2 KO/TKO victories, 1 submission victory count, and 1 UFC title-fight victory count.
- **Category coverage per board:** 4 UFC career-volume comparisons, 5 finishing comparisons, 1 championship comparison. Across 100 boards this is 400 career, 500 finishes, 100 championship comparisons.
- **Privacy:** unfinished Official Daily questions omit the hidden numerical value, formatted value, answer and answer-bearing private ID. Grading and the immutable full board belong to the established Daily server, and completion uses the protected existing ten-answer `higher_lower` grader. Results reveal both values, including through other players' completed leaderboard results.
- **No changes:** existing UFC/NBA/Football Daily publication cadence, already-published boards, previous attempts, rotations, SQL graders, and Football/NBA Higher or Lower code.

## Factual source and exclusions

Source: the canonical UFC factual ledger, containing 82 ranked fighter records and 51 A-tier recognizable expansion fighter records. The expansion identifies pinned UFCStats fight-result evidence (Greco1899/scrape_ufc_stats commit `8e40eb945e1127bf0ef172ab211a34787948f312`, refreshed August 18, 2026); ranked records derive from the game's approved UFC ranking fight ledger.

All game numbers count **UFC fights only**, through August 18, 2026, with no assumption that UFC fight totals equal overall professional MMA totals. Results from later events are deliberately out of scope until an intentional audited content refresh. Eligible fighters must have at least eight documented UFC fights and four UFC wins, comparing men with men and women with women. Their last recorded competition years can differ by no more than thirteen years. Twelve roster subjects currently lacking shipped portrait assets are excluded from this photo-first experience, leaving **115 eligible photographed fighters**, including **101 men and 14 women**.

Finish wins count a win by KO/TKO or submission, not merely fights that ended by those methods. UFC title-fight victories exclude non-championship Ultimate Fighter tournament finals (Nate Diaz, Matt Serra, Yair Rodriguez checks), and losses/draws are never counted as victories.

**Omitted deliberately:** strike totals, strike accuracy, takedown success, championship defenses, and fight-time measurements. The current combined source does not guarantee consistent historical UFCStats coverage or direct, validated defenses/time provenance for every roster member. Guessing these fields would create unfair cross-era comparisons. A later expansion must prove those figures individually before adding them.

## Automated readiness gates

`src/features/play/ufcHigherLowerModel.test.ts` exercises every one of the 100 reserved official dates, 10 questions each. It asserts deterministic replay, zero exact/reversed matchup repetition, zero same-board fighter duplication, six-stat diversity, correct direction/values, 3/5/2 difficulty bands, source scope, fighter participation, and valid board generation. It separately checks Official Daily publication redaction, answer integrity, invalid-action rejection, resume and server scoring, and that the current weighted rotation remains inactive.

A source-derived independent simulation of the V2 canonical ledger, two V2 additions, UFC expansion, and actual portrait exclusions produced **100 valid ten-question boards; 1,000 distinct unordered fighter pairs; 115 participating fighters; and 8–19 appearances per fighter** across the entire 200-day reserve. The ten slot-specific eligible pair pools ranged from **854** to **1,484** possible comparisons after same-sex, era and difficulty filters. **Zero pair repeats, reversed repeats, or same-board fighter duplicates** were observed. Category distribution over all 100 boards: career 400, finishes 500, championship 100. Metric distribution: UFC bouts 200, UFC wins 200, KO/TKO wins 200, total finishes 200, submissions 100, title-fight wins 100. The source-derived simulator is also mirrored by the mandatory Vitest gate; its exact-PR-head CI result is the release authority. A **hypothetical** seven-board 2x/30 proxy sample (candidate positions 0, 15, 30, 45, 60, 75, 90) had **eight repeated individual fighter+stat combinations against different opponents**, though no repeated matchups. These are not identical two-fighter questions, but must be checked in the real selected calendar. The future coordinated calendar must repeat this audit using only its actual Higher or Lower appearance dates before activation; this PR alone does not certify a calendar that has not been published.

## Manual acceptance checks before going live

1. Mobile 320–430px and desktop: every portrait fully visible; no card overflow or hidden fighter names.
2. Ten-answer Casual flow: correct/miss feedback, numerical answer reveal, result review, and repeat with a genuinely new board.
3. Official Daily: server-owned setup and score, stale/invalid action protection, resume after refresh, completed review and other-player leaderboard drilldown.
4. Confirm current main/backend migrations at PR review and ensure exact-head CI is green.
5. The separate coordinated UFC/NBA/Football rotation rebuild activates its approved 2x slot schedule; do not silently change it here.
