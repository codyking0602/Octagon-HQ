# NBA Bar Trivia — 200-question expansion review (October 23, 2026)

## Release decision

**Content PR only. Do not merge into main or enable NBA official Daily publication before review.** Existing live NBA owner testing, question UI, scoring, portrait stage, and no-write safeguards are not changed by this PR.

## Bank and scheduling

| Round | Previously retained | New hand-authored | Now | Usage over 20 appearances |
|---|---:|---:|---:|---:|
| Round 1 — accessible | 34 | 26 | 60 | 3 × 20 |
| Round 2 — moderate | 34 | 26 | 60 | 3 × 20 |
| Round 3 — hard | 35 | 25 | 60 | 3 × 20 |
| Last Call | 16 | 4 | 20 | 1 × 20 |
| **TOTAL** | **119** | **81** | **200** | **200 / 20 ten-question boards** |

New content lives in the four dedicated `nbaBarTrivia*200.ts` modules and is composed into the existing NBA Daily bank. The NBA-only appearance cycle is expanded to **20**, and uses a fresh `v2-200` seed namespace; it does **not** share browser-local appearance tracking or create official Daily results. Cycles restart with new permutations after appearance 20. The existing Football/UFC/MLB Bar Trivia engine behavior is unchanged.

## Editorial intent

- **Easy** favors recognizable NBA identities, signature moves, historical fan culture, and distinctive players rather than year-by-year MVP, Finals MVP, and No. 1 draft picks already asked in Millionaire. Samples: *Linsanity* → Jeremy Lin; *White Chocolate* → Jason Williams; *Sombor Shuffle* → Nikola Jokić; the 1992 Dream Team's city → Barcelona.
- **Medium** focuses on teams and trade chains fans can connect, key coaches and classic teammates; not unguessable season-long statistical rankings. Samples: *Run TMC's third member* → Chris Mullin; *2012 Finals Thunder coach* → Scott Brooks; *2018 Kawhi trade return* → DeMar DeRozan.
- **Hard** requires game/series recognition but has contextual dates and teams plus four defensible options. Samples: *Klay's 11 threes in 2016 WCF G6*; *Stockton's 1997 West finals shot*; *2024 Timberwolves Game 7 comeback*.
- **Last Call** has unusually specific but historically meaningful anchors: NBA's first three-pointer (Chris Ford), first recorded quadruple-double (Nate Thurmond), Magic's 1980 Finals Game 6 co-star (Jamaal Wilkes), Luka's first 60-point/20-rebound triple-double.

**Editorial cuts:** an Ossie Schectman first-basket draft was dropped from Last Call because even informed fans would have little basis to distinguish the choices. An overly leading Boston parquet question was rephrased. A second 2012 Lakers-acquisition prompt was replaced by a different-era Charles Barkley trade anchor.

## Cross-game scope

Existing **NBA Average Fan** and **NBA Millionaire** banks were examined. They devote substantial space to draft picks, award-year answers, routine rules, and major 2010s playoff clutch shots. The new additions avoid exact question recycling from these categories. NBA Sports Feud open-ended prompts are also checked by test for identical normalized questions. NBA Find the Leader / Hit the Number / Higher or Lower are statistical comparison games, not this fact-and-four-choice format; Who Am I clues may reference the same real-life NBA figures but the new questions are not copied clue ladders.

**Tests** cover 200 unique identifiers and canonical prompts, 60/60/60/20 distribution, 4 distinct answer choices, correct-answer inclusion, official NBA source URL field, no answer text in the stem, no exact cross-game prompt reuse, and all 20 no-repeat shared Daily boards twice across separate deterministic cycles. Test results should be recorded from the exact PR head CI.

## Sources and remaining editorial checks

New questions contain explanation and an NBA.com source link. Critical obscure and numerical claims are tied directly to relevant official NBA pages, including:
- [1974 first quadruple-double](https://www.nba.com/news/history-nba-legend-nate-thurmond)
- [1979 first three-point shot](https://www.nba.com/news/chris-ford-dies-at-74)
- [1980 Finals Game 6 supporting performance](https://www.nba.com/news/history-nba-legend-jamaal-wilkes)
- [1997 Stockton, 1995 Smits, 2016 Klay](https://www.nba.com/news/history-this-date-in-nba-may)
- [2019 Westbrook 20/20/20](https://www.nba.com/news/about-last-night-4-2-2019)
- [2024 Minnesota Game 7](https://www.nba.com/news/nuggets-timberwolves-takeaways-game-7-2024-nba-playoffs)
- [2022 Luka 60/21/10](https://www.nba.com/news/mavericks-star-luka-doncic-posts-historic-triple-double-in-historic-comeback)

**All 81 newly added questions now link to a specific NBA.com news article, NBA archive feature, or NBA team article** relevant to the question rather than a generic history home page. The content authors individually located and checked supporting NBA pages, including official retrospective reporting for the four new Last Call rows; structural tests enforce non-homepage URLs. The previously retained 119-question bank was not re-sourced by this PR and still contains its earlier generic source IDs. Subjective difficulty, distractor plausibility, and deeper semantic overlap require ongoing editorial judgment; automated checks are not substitutes for that review. Keep the PR unmerged until owner approval.

## Stage 2: difficulty, semantic uniqueness and current-event readiness — October 23, 2026

### Exact inventory
The locked **200 evergreen** questions still divide into **60 easy, 60 moderate, 60 hard and 20 Last Call**. No IDs or round quotas were added to solve editorial problems. The earlier 119 were rechecked alongside 81 new questions and **10 authored rows were replaced in place** (no padding and no changes to Football/UFC or visual/game flow).

### Editorial changes (replaced entire facts, not cosmetic rewordings)
| ID | Reason | Replacement fact |
|---|---|---|
| nba-bt-e-018 | Same goaltending definition in NBA Average Fan | Raptors' We The North campaign |
| nba-bt-200-e-13 | Same Kawhi 'The Klaw' nickname in Average Fan | Manu Ginóbili popularizing the Eurostep |
| nba-bt-h-001 | Same 1976 triple-overtime Finals Game 5 as Average Fan | Sam Cassell's decisive 1994 Finals Game 3 three |
| nba-bt-h-036 | Kobe's 81 points / Toronto shared with Average Fan | George Hill's missed 2018 Finals Game 1 free throw before J.R. Smith mistake |
| nba-bt-f-010 | Same 2005 Robert Horry Finals Game 5 in Average Fan | 1979 Finals MVP / future Boston guard Dennis Johnson |
| nba-bt-f-011 | Same Allan Houston 1999 first-round winner as Average Fan | Vinnie Johnson's 1990 Finals clincher |
| nba-bt-200-m-01 | Same 'Seven Seconds or Less' Phoenix team/coach prompt within bank | Larry Brown's 2001 Finals 76ers |
| nba-bt-200-h-01 | Obscure Dennis Johnson 1978 seven-block number without enough player recognition | Draymond Green's 32/15/9 in 2016 Finals Game 7 |
| nba-bt-200-h-18 | 'Which Bulls star made The Shrug?' too easy for Hard | Wilkins' 47 against Bird in legendary 1988 Game 7 |
| nba-bt-200-f-04 | Luka's 60-point triple-double too self-evident for Last Call | Patrick Ewing's surprising 30 blocks in 1994 Finals |

Other retained Hard questions require recognition of an opponent, coach or postseason detail, but the revised material prioritizes identifiable anchors over anonymous numeric gotchas. The more subjective difficulty decisions remain editorial judgments rather than inference from passing unit tests.

### NBA news ingestion contract
**Curated** current events are now authored in `src/features/nba/nbaBarTriviaCurrentEvents.ts` with a confirmed NBA.com source, `verifiedAt`, `activeFrom` and `expiresAt`. Initial batch: five independently sourced 2026-27 opening-week stories (LeBron in Philadelphia, Kawhi's Raptors return, Anthony Davis's Washington debut, Lillard's Portland return, Ty Jerome's 45-point Memphis opener), from [NBA.com Starting 5, October 22](https://www.nba.com/news/starting-5-october-22-2026).

- Date-bounded article facts must be already completed/verified, **never schedules, rumors, predictions, future milestones or partial live-score claims**.
- NBA uses the existing shared engine: **0–2 timely questions** per appearance when eligible, **no forced news** when the vetted pool is exhausted or expired. Date-specific questions expire after at most 21 days; the first batch expires November 6, 2026.
- `buildNbaBarTriviaDailyBoard(appearanceIndex, asOf)` accepts a publisher date and deterministically holds a 20-appearance cycle; recent IDs include both evergreen and timely questions, preventing question repeats during the whole cycle. Expiration and first-play date are enforced by the shared engine.
- **Ingestion requires an editorial update and deployment**, matching the existing manually authored Football/UFC current-event files. This is not an AI-driven unsupervised fetch or a promise that new news will appear automatically without content curation. The existing NBA owner-only preview uses this mechanism; official NBA Daily schedule/publisher must still be authorized and wired separately.
- An author should check the official recap, record the actual event time/result, choose a fair difficulty, add four credible choices and full explanation, and set a short active window. A second reviewer should inspect semantic duplicates against the NBA games before staging. If no strong question exists, ship none.
- Tests enforce explicit source verification windows, expiration, absence of forced filler, up to two news questions, all-evergreen 20-board fallbacks and no repeated IDs. Maintain editorial activity before each game week.

The number **200 means evergreen capacity**; the five expiring timely items are an optional supplemental pool, not five filler items counted toward the four-month guarantee.
