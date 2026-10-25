# Stage 3A — UFC Blind Resume inventory and quality risk register

**Audit started:** October 17, 2026. **Base:** `a2fddeac85c5ed0f2e0428569070d17b3ffad618`. **Scope: UFC ONLY.** Stage 3 is still IN PROGRESS and not editorially approved. Stage 2 Average Fan remains closed.

## Existing UFC game contract

- The five-round UFC Blind Resume V3 uses fighters drawn from the **ranked UFC model**, not every fighter in the broader Play-only pool.
- Each comparison presents eight résumé facts, revealed at 2, 4, 6, then 8. Correct choices score 20/19/18/17 points by stage; misses award 2/4/6/8 points. This audit does not authorize changing scoring.
- The canonical expected winner is the higher-ranked UFC fighter, a model result that may not be obvious from the eight displayed comparative facts.
- `src/features/play/blindResumeEngine.ts` owns pair generation, existing score-gap bands, the model winner and eight stat rows.
- `src/features/play/todaysChallengeRuntime.ts` and `src/features/play/blindResumeV3.ts` own Daily/Casual publication, reveal order, difficulty labels and stored card identities.
- `src/features/play/playFighterPool.ts` and `src/features/rankings/rankingModel.ts` own ranked eligibility, rankings and stat provenance.

## Confirmed risks

1. **Difficulty labels are only relative rank gaps.** Old `blindResumeDifficultyMap` unconditionally calls the smallest score-gap pair `nightmare`, the second `tight`, the largest `readable`, and the others `competitive`. This says nothing about the actual evidence users see.
2. **Pair-band fallback mislabels a requested gap.** When no fighter meets the requested close/stretch/wildcard gap, the old generator picks the nearest available opponent while retaining the original requested band.
3. **Missing-data round-won percentage.** The ranking owner averages *audited prime-fight rounds only*. A sample size of zero becomes `0%`, which can look like a measured failure. Secondary PR #1947 proposes an explicit audited denominator and `N/A` for missing values.
4. **Synthetic Apex score.** `Apex rating` is calculated from an internal ranking component and scaled to 55–99, not an official UFC record. It should not substitute for externally verifiable winner evidence.
5. **Random reveal ordering.** The old game shuffles eight facts and prevents only one redundant opening-title-count combination. Some actual openings present two reasons to select the fighter that the game will mark wrong.
6. **Expected-answer source is broader than the screen.** The higher-ranked fighter wins regardless of whether the visible evidence supports that verdict. Review this explicitly before deciding the comparative résumé is fair.

## UFC-specific acceptance criteria

- Use actual **completed UFC Daily picks** to identify high-miss comparisons and judge opening/full-reveal fairness. Note the few repeat players and selected reveal-stage bias.
- Hold specific model-ranked matchups if their presented facts are too contradictory to support an intelligible correct answer. Never use a minimum pair-count target to override fairness.
- For newly generated matches, require independently measurable, comparative résumé support, then order clues so later reveals genuinely strengthen the answer without making the first decision automatic.
- Simulate multiple deterministic five-round cards using the actual Daily owner and test duplicate prevention, gender integrity, deterministic seed ownership, label consistency, and historical version preservation.
- Verify each retained quantitative claim against external sources before claiming full historical-fact editorial approval. A passing schema/shape test is **not** a factual signoff.
- Preserve historical Daily publications, player submissions, scores, leaderboards, existing shared cards, and rotation. Merge/deploy only with explicit owner approval after exact-head green checks.

The production-error analysis and named HOLD candidates are in `docs/audits/blind-resume-stage3-production-miss-rates-20261017.md`. Proposed gameplay fixes are separate in PR #1949. **No Football game is within this audit.**
