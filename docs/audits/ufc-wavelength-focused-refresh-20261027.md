# UFC Wavelength — focused October 27, 2026 refresh

Scope: UFC Wavelength only. No Daily calendar, historical submission, backend database, Football, NBA, or shared scoring changes.

## Baseline and editorial decision

- Prior inventory: 501 stored IDs, 500 approved, 1 quarantined, 16 categories.
- Refreshed inventory: 521 stored IDs, 500 approved, 20 retired for historical lookup, 1 quarantined, 16 categories.
- Among the original 500 playable clues: 480 retained unchanged, 10 rewritten with narrower questions or corrected rating anchors, 10 replaced by different, more recognizable UFC moments.
- Refreshed active clue IDs: `wl-ufc-refresh-501` through `wl-ufc-refresh-520`.
- Retired IDs remain immutable in the historical catalog and are still resolvable by the Daily advance function. The seeded generator selects **approved** only. Existing persisted scores, submissions, and dates are not migrated or overwritten.
- Catalog version advanced to v3; v2 is retained as a historical version. Four-clue adaptive design, target policy, privacy, and scoring are unchanged.

| Former clue number | Editorial decision | Main reason |
| --- | --- | --- |
| 005 | Replace | Gaethje's MMA wrestling credentials should not be confused with his UFC offensive wrestling usage; spotlight his signature leg kicks |
| 051 | Rewrite | Specify availability versus contender wins as the metric |
| 054 | Rewrite | Distinguish Sonnen's genuine title-challenger credibility from a championship résumé with no title wins |
| 055 | Rewrite | Specify undisputed-title fight record, not BMF spectacle |
| 076 | Replace | Generic/obscure era label did not land for average fans |
| 093 | Replace | Vague coach-cam value replaced by a clear upset moment |
| 100 | Rewrite | 2024 UFC glove redesign was abandoned; question anchored to the discontinued design |
| 153 | Rewrite | Specify sound-bite clarity instead of an undefined speaking grade |
| 175 | Rewrite | Specify pre-fight trash-talk promotion, not total career fame |
| 223 | Replace | Cryptic judging variance question replaced by concrete referee safety action |
| 225 | Rewrite | Time-fix the unsuccessful 2024 glove design, rather than referencing unspecified 'current' gloves |
| 251 | Replace | Avoid blanket disparagement of heavyweights; add an exceptional women's championship-fight endurance anchor |
| 252 | Rewrite | Narrow the Chandler assessment to patience in chaotic UFC exchanges |
| 253 | Rewrite | Separate Ferguson's damage avoidance in later losses from his overall toughness |
| 338 | Replace | Obscure TUF 28 rewatch proposition replaced with Season 3 Ortiz–Shamrock rivalry |
| 379 | Replace | Redundant White House event crossover entry replaced with Brock Lesnar's UFC 200 return |
| 388 | Replace | Generic NFL celebrity crowd shot replaced with Holly Holm's boxing-to-UFC transition |
| 401 | Replace | Duplicate Drake-curse meme replaced with Holloway's UFC 300 final-seconds gesture |
| 477 | Rewrite | A 'forgettable' card should not receive an unqualified strong rewatch score |
| 489 | Replace | Turn an abstract altitude-as-atmosphere judgment into a concrete hometown walkout |

## Source verification for time-fixed facts

- [UFC: Holloway's gesture against Gaethje at UFC 300](https://www.ufc.com/news/max-holloway-career-highlights-ufc-308-topuria-vs-holloway-abu-dhabi).
- [UFC: Zhang Weili and Joanna Jędrzejczyk, five rounds at UFC 248](https://www.ufc.com/news/ufc-248-results-adesanya-romero-zhang-jedrzejczyk).
- [UFC: TUF Season 3, Ortiz–Shamrock rivalry](https://www.ufc.com/news/btn-top-ten-tuf-coaches).
- [UFC: Lesnar returns at UFC 200](https://www.ufc.com/news/brock-lesnar-announces-return-ufc-200).
- [UFC: Holly Holm's world boxing titles and Rousey upset](https://www.ufc.com/news/holly-holm-new-champion-world).
- [MMA Fighting: 2024 UFC gloves withdrawn in February 2025](https://www.mmafighting.com/2025/2/15/24366410/ufc-officially-abandons-new-glove-design-returns-to-old-gloves-for-all-events-moving-forward).
- [UFC: June 2026 Freedom 250 results](https://www.ufc.com/news/ufc-freedom-250-results-highlights-interviews) and [UFC: TUF 34 coaches](https://www.ufc.com/news/ultimate-fighter-returns-coaches-daniel-cormier-and-michael-bisping) were checked; those retained records were not needlessly rewritten.

## Six-month replay expectations

The canonical UFC 48-hour publication schedule between October 29, 2026 and April 24, 2027 contains **nine Wavelength publications** (18 playable games, four adaptive clues per game). There are 500 eligible active clues. Test coverage models each of those publication dates, exercises one entire two-game server-owned Daily and verifies the rounded mean, and confirms historical retired IDs still resolve in ongoing games. Other daily games and their published schedules are unchanged.

No numerical UFC opinion is claimed to be universally correct. The remaining calibration is still entertainment-oriented editorial judgment; only clearly problematic items were changed. Mobile clue typography and wrapping were inspected at the existing CSS contract, with no layout redesign.


## October 27 quality-first score distribution follow-up

Per owner direction, **no previously approved clue rating was lowered just to reshape the histogram**. Existing text and numerical scores are unchanged. Seven redundant or overly generic clues were retired (IDs preserved for published results), and 112 genuinely different UFC clue prompts were added across all 16 categories, primarily covering missing weak, average, and solid-but-not-elite examples. New entries also include a few genuinely excellent examples; ratings are not capped artificially.

| Active catalog | Before | After |
| --- | ---: | ---: |
| Approved clues | 500 | 605 |
| Below 40 | 66 | 90 |
| 40–79 | 198 | 268 |
| 80–100 | 236 (47.2%) | 247 (40.8%) |
| 90–100 | 118 | 121 |

Retired on qualitative grounds rather than score: `wl-personality-and-promotion-166`, `wl-crossover-and-celebrity-399`, `wl-crossover-and-celebrity-378`, `wl-events-and-fights-104`, `wl-ufc-culture-408`, `wl-venue-and-atmosphere-128`, `wl-venue-and-atmosphere-142`. Reasons: Jon Anik broadcast overlap; two redundant White House/presidential promotion questions; generic 'strong co-main' and 'great nicknames' abstractions; two overlapping Apex-atmosphere questions. All retired records keep their original ratings and texts for historical official games. New calibrated prompts have distinct IDs `wl-ufc-balance-521` through `wl-ufc-balance-632`. Catalog version advances to v4 while v3 and prior versions remain historical. No generator, targets, scoring or published results change.

This distribution describes editorial subject selection, not an arbitrary desired quota or an instruction to downgrade excellent achievements. Ratings remain subjective UFC-context judgments.


## Owner feedback — recognizable low-end examples

On October 27, the owner rejected the two newly added weak-card rewatch prompts as requiring niche fight/card knowledge, while approving the other eight showcased calibration examples. Accordingly, `wl-ufc-balance-553` (Namajunas–Esparza II's rewatch appeal, 6) and `wl-ufc-balance-555` (UFC 149 main-card entertainment, 14) are **retired without rewriting their IDs or ratings**. They remain readable for already-published sessions. New approved replacements, both easily recognizable and self-explanatory even to fans who do not remember specific undercards, are:

- `wl-ufc-balance-633` — The UFC 229 Khabib–McGregor post-fight brawl as sportsmanship — **5**. [UFC official event recap](https://www.ufc.com/news/khabib-smothers-mcgregor-defends-title-ufc-229-main-event?language_content_entity=en).
- `wl-ufc-balance-634` — The McGregor–Poirier III leg-injury stoppage as a satisfying trilogy ending — **12**. [UFC official results](https://www.ufc.com/news/ufc-264-poirier-vs-mcgregor-3-results-wonderboy-burns-highlights-interviews-winners).

**Active 605 clues remain unchanged in number and overall rating bands.** Total stored IDs 635: 605 approved, 29 retired, 1 quarantined. No changes to the other eight showcased clues, any approved legacy rating, gameplay, calendar, scoring, or previous submissions. Catalog v5 preserves v4 in the historical version list. The selection principle is *recognizable UFC situations before obscure card/trivia recall*.


## Full active-catalog accessibility audit — all 605 clues reviewed

Owner requested **every active clue** be checked after rejecting low-scored questions that forced players to remember obscure event details. Review considered all 605 active prompts existing at catalog v5, grouped across the 16 UFC-specific categories; each was judged for whether a typical UFC fan can identify the person or situation, understand exactly what is being rated from the wording, and reasonably compare it to rating anchors without remembering an obscure UFC number, TUF season, undercard result, or niche camp/referee/media reputation.

**Verdict:** 538/605 existing active prompts KEEP unchanged; 67 RETIRE with original IDs, wording, and ratings preserved for historical result resolution; 41 curated, self-explanatory replacement prompts added at IDs `wl-ufc-accessible-635` through `wl-ufc-accessible-675`. New active total **579**; stored total **676** (579 approved, 96 retired, 1 quarantined). The drop from 605 is intentional: no filler needed to maintain an arbitrary catalog size. No previously approved rating was mass-adjusted. Every existing status/published record remains addressable.

| Primary accessibility problem | Retired | Examples / decision |
| --- | ---: | --- |
| Fighter skill/resume/title familiarity without helpful context | 5 | Rothwell footwork, niche early UFC résumé labels, duplicate Garbrandt pocket-defence framing, Montaño title claim |
| UFC culture wording not grounded or requiring product trivia | 3 | Defunct 2024 gloves, vague scorecard meme, contradictory sponsorship-shorts grade |
| Opaque event numbers, forgettable cards, less-recognizable fight rewatch judgments | 11 | UFC 40/129/189/217, Cannonier–Strickland, Pereira–Błachowicz, UFC 279 without named fighters |
| UFC venue/event years with no recognizable headline | 7 | UFC 193/189/205/229 presented by number alone, generic South Korea/Sweden/Singapore crowd grade |
| Vague personality or specialist show presentation | 2 | Burns's nondescript pre-fight demeanor, Road to UFC polish |
| Lower-recognition referees or discontinued glove trivia | 6 | Five bare referee reputations, withdrawn 2024 glove claims |
| Opaque early history or specialist media | 4 | Broad first-in-Brazil and Canada milestones; two niche UFC media rankings |
| TUF season-number recall rather than named, comprehensible concepts | 17 | Seasons 5/14/20/24–27/29–34 and obscure season-specific rivalries without enough framing |
| Niche camp names without star/technical context | 8 | Factory X, Fortis, Fight Ready, Sayif Saud and other generic camp grades |
| Hypothetical celebrity references with no real subject | 4 | A nameless 'viral comedian,' 'major soccer star,' or weigh-in host; celebrity-shot duplicate |
| **Total** | **67** | Six-month cadence retains ample variety with 579 playable clues in 16 categories |

All 41 replacement clues have explicitly named UFC fighters/moments or self-contained game scenarios: McGregor bus incident; Silva–Weidman taunting; GSP and a 55,000-person Toronto event; McGregor–Mendes/Lawler–MacDonald on one card; UFC 217's three champions; named Chimaev/Diaz/Ferguson reshuffle; Jones–Gane quick submission; recognizable TUF contract/coaching/weight-cut formats; clear refereeing, training, presentation and crossover situations.

### Verification anchors for new event facts

- [UFC 129: Georges St-Pierre before 55,000+ fans in Toronto](https://www.ufc.com/news/georges-st-pierre-remembers-ufc-129-day-canada-ufc-fight-pass-read)
- [UFC 189: McGregor–Mendes and Lawler–MacDonald II on one card](https://www.ufc.com/event/ufc-189)
- [UFC 217: St-Pierre, Namajunas and Dillashaw title results](https://www.ufc.com/event/ufc-217)
- [UFC 279: Diaz–Ferguson headliner change and Chimaev weight problems](https://www.ufc.com/news/updates-ufc-279)

The 16 categories remain intact; smallest category still has 26 playable prompts. Player-only clues, major UFC fighters and familiar historic moments remain, as do recognizable TUF and broadcast concepts. All replay tests should continue to select approved prompts only, while resolving retired IDs in prior official Daily sessions. Catalog v6 adds v5 to the historical-version list. New content is editorial judgment, not a claim of statistically validated audience familiarity.
