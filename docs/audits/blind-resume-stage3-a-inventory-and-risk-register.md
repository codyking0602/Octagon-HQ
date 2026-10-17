# Stage 3A — Blind Resume source inventory, contract baseline and editorial risk register

**Audit started:** October 17, 2026. **Base:** `a2fddeac85c5ed0f2e0428569070d17b3ffad618`. **Status:** Stage 3 IN PROGRESS, **not** editorial acceptance. Stage 2 Average Fan remains closed under its documented bounded acceptance.

## What is actually live

| Owner | Population / format | Progress at Stage 3A |
| --- | --- | --- |
| UFC | Generated pairs from the **ranked** UFC ranking model (not the broader Play-only pool); five rounds, eight résumé facts per pair, two/four/six/eight shown, V3 20/19/18/17 correct and 2/4/6/8 miss | Engine, data-owner and grading routes inventoried; individual factual pair/editorial decisions pending |
| NFL | 19 explicit matchups in seven families, with curated winners and per-matchup evidence order | 19 pending full source and fairness adjudication |
| CFB | 11 explicit matchups in four families, with curated winners and per-matchup evidence order | 11 pending full source and fairness adjudication |
| Football Daily | Three rounds, three reveal stages, two hard and one medium; +10/-4, +8/-1, +7/0 with 100-point normalization | Locked mechanism inventoried; planned new rotation intentionally still has **zero** Football Blind Resume days |
| UFC Daily | Five V3 rounds; difficulty tags assigned by sorting the five score gaps | Publication path inventoried; actual published/future-board editorial check pending |

**Football full authored matchup census:** 30 (19 NFL, 11 CFB); 23 authored `hard`, seven `medium`; 11 distinct families. These are editorial inputs, not 30 cleared matchups. The UFC bank is combinatorial, so a raw pair count is not an editorial quality signoff.

### Sources of truth inspected

- `src/features/play/blindResumeEngine.ts`: UFC gender-constrained pair selection, band requests, ranking-model winner, eight visible fields.
- `src/features/play/todaysChallengeRuntime.ts` and `src/features/play/blindResumeV3.ts`: shared UFC Daily/Casual V3 stat order, four reveal stages, stored card identity and scoring.
- `src/features/play/playFighterPool.ts`, `src/features/rankings/rankingModel.ts`: UFC fighter eligibility, calculated rank and stat provenance.
- `src/features/back-room/footballBlindResumeModel.ts`, `footballBlindResumeEvidence.ts`, `footballBlindResumePresentation.ts`, `src/features/play/footballDailyPublicationBlindResume.ts`: 30 authored verdicts, canonical factual evidence, anonymous presentation, Football Daily.
- `docs/daily-game-content-quality-rollout.md`: 13-stage quality constitution and future rotation boundary.

## Confirmed implementation behaviors to evaluate (not yet adjudicated defects)

1. **UFC difficulty labeling can be misleading:** `blindResumeDifficultyMap` unconditionally assigns one `nightmare`, one `tight`, and one `readable` label based on *relative within-card* score gaps. It does not validate absolute score gaps or the revealed fact difficulty. A card full of wide mismatches still calls its closest pairing `nightmare`. Review actual cards before changing this.
2. **UFC pairing-band fallback:** `createBlindResumeRounds` requests close/stretch/wildcard bands, but when no candidate fits, selects the nearest available opponent regardless of band; exported `band` continues to describe the requested band, not necessarily the achieved pair. We must measure frequency before deciding whether labels or selection need repair.
3. **UFC rounds-won metric has a missing-data concern:** `deriveVisibleStats` calculates `roundsWonPct` on *audited prime rounds only*, and maps **no audited prime rounds to 0%**. Blind Resume labels this simply `Rounds won`. Until the enrolled fighters' audited coverage is measured, it is not evidence of a fair apples-to-apples comparison. Avoid representing zero coverage as actual 0% performance.
4. **UFC model-scale clue:** `Apex rating` is a 55–99 conversion of the ranking-model apex score, not an externally recorded fight statistic. Audit whether this is clearly framed to players and whether it leaks the answer disproportionately.
5. **UFC revealed fact ordering:** eight dimensions are shuffled; only the pair `UFC title-fight wins` + `Top-5 wins` is disallowed together in the opening two. Audit weak/tied openings and whether facts become more discriminating after each reveal.
6. **Football verdicts:** the 30 selected winners are explicit editorial judgments, not an exact cross-era ranking model. The matchup set is 23/30 labeled `hard`; test actual first-stage and final-stage difficulty, and evaluate whether any winner remains reasonably debatable even with full evidence.
7. **Football unequal comparison windows:** college program-era matchups include windows of differing lengths. Compare per-year/peak context rather than silently treating cumulative titles and volume as equivalent.

## First independently anchored matchup: NFL QB season

`aaron-rodgers-2011` vs `patrick-mahomes-2022` (curated winner: Mahomes, difficulty: hard) has been selected as an **editorial-review target, not certified keep**. NFL season tables support Rodgers 2011 at 4,643 yards, 45 TD, 6 INT, 122.5 passer rating and Mahomes 2022 at 5,250 yards, 41 TD, 12 INT, 105.2 rating:

- https://www.nfl.com/players/aaron-rodgers/stats/
- https://www.nfl.com/players/patrick-mahomes/stats/career
- https://www.nfl.com/news/packers-rodgers-voted-ap-nfl-most-valuable-player-09000d5d8269e825

The raw efficiency case favors Rodgers while volume favors Mahomes; postseason and championship facts may support the authored winner. **This illustrates why the word “better” cannot be validated by volume alone.** Review all evidence rows and the intended criterion before approving the verdict.

## Concrete Stage 3 acceptance gate

- For all 30 Football matchup specs: explicit `keep / rewrite / retire / hold` decisions, checked winner, evidence facts, season affiliation/era, stat ordering, difficulty, first/final stage, and external source anchors for surviving quantitative claims.
- For UFC: census of ranking-eligible fighters and audited-round coverage; broad deterministic seed simulations; actual sample cards in user-visible order; per-fighter facts and answer-source checks, especially for selected published/future days; resolve synthetic/ambiguous clues and uninformative stages.
- Check cross-game semantic repeats and the preserved published Daily setup/result snapshots.
- Add focused tests for each remediation; do not infer editorial quality from green shape/size tests.
- Verify exact PR head, merge **only with owner authorization**, then verify production. This checkpoint does not change a bank, scoring formula, historical setup or rotation.

**Stage 3A disposition:** NFL 19 **pending**, CFB 11 **pending**, UFC generated matchups **pending**. No question/matchup has been declared accepted or retired by this baseline alone.
