# UFC Wavelength — focused October 27, 2026 refresh

> **FINAL October 27 accessibility audit:** Reviewed all 605 previously approved UFC Wavelength clues. Kept **521 unchanged**, retired **84** for low recognizability, opaque references, weak question framing or duplication, and added **57** recognizable or self-contained alternatives. **578 active**, **113 retired** and **1 quarantined**; no preexisting active ratings changed. This supersedes the intermediate 605-active/67-retired figures below. The PR is Draft; main and production are unchanged.


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


## Final category-by-category audit ledger (reconciled)

The audit read every one of the 605 approved v5 prompts. **KEEP 521**, with original IDs, words and ratings identical; **RETIRE 84**, recorded below; and **ADD 57** new, self-contained questions. `v6` is the proposed catalog version; `v5` and earlier remain in the historical version list. Retired clues are excluded from new rounds but still resolve in old Daily games.

| Category | Existing clues retired for accessibility or duplicates |
| --- | ---: |
| BROADCAST & PRESENTATION | 1 |
| CHAMPIONSHIP | 1 |
| COACHES & CAMPS | 19 |
| CROSSOVER & CELEBRITY | 4 |
| EVENTS & FIGHTS | 15 |
| FIGHTER SKILL | 2 |
| LEGACY & HISTORY | 3 |
| MMA MEDIA | 2 |
| OFFICIATING & SYSTEMS | 6 |
| PERSONALITY & PROMOTION | 1 |
| TUF & REALITY | 17 |
| UFC CULTURE | 4 |
| UFC RESUME | 2 |
| VENUE & ATMOSPHERE | 7 |
| **Total** | **84** |

| Removed from future rotation (historical ID retained) | Category | Original rating | Original wording |
| --- | --- | ---: | --- |
| wl-ufc-culture-099 | UFC CULTURE | 67 | Old-school gladiator intro nostalgia |
| wl-events-and-fights-101 | EVENTS & FIGHTS | 18 | A forgettable Apex prelim card's rewatch value |
| wl-events-and-fights-105 | EVENTS & FIGHTS | 91 | UFC 100's historical importance |
| wl-events-and-fights-106 | EVENTS & FIGHTS | 88 | UFC 205's historical importance |
| wl-events-and-fights-107 | EVENTS & FIGHTS | 92 | UFC 229's event atmosphere |
| wl-events-and-fights-108 | EVENTS & FIGHTS | 90 | UFC 300's card depth |
| wl-venue-and-atmosphere-145 | VENUE & ATMOSPHERE | 91 | UFC 229 weigh-in atmosphere |
| wl-venue-and-atmosphere-146 | VENUE & ATMOSPHERE | 90 | UFC 205 MSG atmosphere |
| wl-venue-and-atmosphere-147 | VENUE & ATMOSPHERE | 92 | UFC 193 Melbourne scale |
| wl-venue-and-atmosphere-148 | VENUE & ATMOSPHERE | 93 | UFC 189 Las Vegas atmosphere |
| wl-broadcast-and-presentation-200 | BROADCAST & PRESENTATION | 56 | Road to UFC presentation |
| wl-mma-media-307 | MMA MEDIA | 74 | Morning Kombat's UFC analysis value |
| wl-mma-media-311 | MMA MEDIA | 79 | Luke Thomas's technical UFC analysis |
| wl-tuf-and-reality-327 | TUF & REALITY | 88 | The Ultimate Fighter Season 5's entertainment legacy |
| wl-tuf-and-reality-329 | TUF & REALITY | 74 | The Ultimate Fighter Season 14's coach-drama value |
| wl-tuf-and-reality-332 | TUF & REALITY | 83 | The Ultimate Fighter Season 20's strawweight-title stakes |
| wl-tuf-and-reality-334 | TUF & REALITY | 76 | The Ultimate Fighter Season 24's flyweight-champion concept |
| wl-tuf-and-reality-335 | TUF & REALITY | 68 | The Ultimate Fighter Season 25's Redemption concept |
| wl-tuf-and-reality-336 | TUF & REALITY | 65 | The Ultimate Fighter Season 26's title-tournament stakes |
| wl-tuf-and-reality-337 | TUF & REALITY | 54 | The Ultimate Fighter Season 27's undefeated-prospect hook |
| wl-tuf-and-reality-339 | TUF & REALITY | 52 | The Ultimate Fighter Season 29's Ortega-Volkanovski coach dynamic |
| wl-tuf-and-reality-340 | TUF & REALITY | 49 | The Ultimate Fighter Season 30's Peña-Nunes coach dynamic |
| wl-tuf-and-reality-342 | TUF & REALITY | 55 | The Ultimate Fighter Season 32's Grasso-Shevchenko coach pairing |
| wl-tuf-and-reality-343 | TUF & REALITY | 66 | The Ultimate Fighter Season 33's Cormier-Sonnen coach pairing |
| wl-tuf-and-reality-344 | TUF & REALITY | 70 | The Ultimate Fighter Season 34's Cormier-Bisping coach pairing |
| wl-coaches-and-camps-351 | COACHES & CAMPS | 90 | Trevor Wittman's between-round corner advice |
| wl-coaches-and-camps-352 | COACHES & CAMPS | 88 | Eugene Bareman's tactical UFC coaching |
| wl-coaches-and-camps-353 | COACHES & CAMPS | 86 | Mike Brown's UFC game planning at American Top Team |
| wl-coaches-and-camps-354 | COACHES & CAMPS | 91 | Javier Mendez's UFC championship coaching |
| wl-coaches-and-camps-355 | COACHES & CAMPS | 92 | Firas Zahabi's prime UFC game planning |
| wl-coaches-and-camps-356 | COACHES & CAMPS | 84 | Eric Nicksick's corner presence in major UFC fights |
| wl-coaches-and-camps-357 | COACHES & CAMPS | 79 | Sayif Saud's UFC corner work |
| wl-coaches-and-camps-358 | COACHES & CAMPS | 82 | Henri Hooft's UFC striking coaching |
| wl-coaches-and-camps-359 | COACHES & CAMPS | 80 | Jason Parillo's UFC corner work |
| wl-coaches-and-camps-360 | COACHES & CAMPS | 78 | Xtreme Couture as a modern UFC camp |
| wl-coaches-and-camps-361 | COACHES & CAMPS | 91 | American Top Team's UFC talent depth |
| wl-coaches-and-camps-362 | COACHES & CAMPS | 90 | AKA's wrestling culture in UFC title fights |
| wl-coaches-and-camps-363 | COACHES & CAMPS | 88 | City Kickboxing's title-era UFC development |
| wl-coaches-and-camps-364 | COACHES & CAMPS | 93 | Jackson-Wink's peak UFC influence |
| wl-coaches-and-camps-365 | COACHES & CAMPS | 78 | Team Alpha Male's UFC talent development |
| wl-coaches-and-camps-366 | COACHES & CAMPS | 84 | Chute Boxe Diego Lima's UFC resurgence work |
| wl-coaches-and-camps-367 | COACHES & CAMPS | 72 | Factory X as a UFC development camp |
| wl-coaches-and-camps-368 | COACHES & CAMPS | 70 | Fortis MMA as a UFC development camp |
| wl-coaches-and-camps-369 | COACHES & CAMPS | 74 | Fight Ready's UFC game-planning reputation |
| wl-officiating-and-systems-442 | OFFICIATING & SYSTEMS | 76 | Keith Peterson's UFC refereeing reputation |
| wl-officiating-and-systems-443 | OFFICIATING & SYSTEMS | 72 | Dan Miragliotta's UFC refereeing reputation |
| wl-officiating-and-systems-444 | OFFICIATING & SYSTEMS | 70 | Chris Tognoni's UFC refereeing reputation |
| wl-officiating-and-systems-445 | OFFICIATING & SYSTEMS | 75 | Mark Smith's UFC refereeing reputation |
| wl-officiating-and-systems-446 | OFFICIATING & SYSTEMS | 73 | Mike Beltran's UFC refereeing reputation |
| wl-legacy-and-history-475 | LEGACY & HISTORY | 91 | UFC 100 as a milestone in company history |
| wl-events-and-fights-476 | EVENTS & FIGHTS | 90 | UFC 40's event-level historical impact |
| wl-events-and-fights-479 | EVENTS & FIGHTS | 91 | UFC 129's event scale |
| wl-events-and-fights-480 | EVENTS & FIGHTS | 94 | UFC 189's overall entertainment value |
| wl-events-and-fights-481 | EVENTS & FIGHTS | 95 | UFC 217's title-change drama |
| wl-fighter-skill-492 | FIGHTER SKILL | 56 | Ben Rothwell's footwork as a UFC heavyweight weapon |
| wl-championship-496 | CHAMPIONSHIP | 42 | Nicco Montaño's UFC championship résumé |
| wl-ufc-refresh-505 | UFC CULTURE | 26 | Sponsor-covered fight shorts as a classic UFC look |
| wl-ufc-refresh-507 | UFC CULTURE | 35 | The UFC's discontinued 2024 glove design as a visual upgrade |
| wl-ufc-refresh-511 | OFFICIATING & SYSTEMS | 24 | The discontinued 2024 UFC glove design's eye-poke prevention |
| wl-ufc-refresh-519 | EVENTS & FIGHTS | 29 | A forgettable numbered UFC card's rewatch appeal |
| wl-ufc-balance-521 | FIGHTER SKILL | 38 | Cody Garbrandt's defense in extended pocket exchanges |
| wl-ufc-balance-534 | UFC RESUME | 24 | Kron Gracie's UFC-only résumé |
| wl-ufc-balance-535 | UFC RESUME | 41 | Mickey Gall's UFC-only résumé |
| wl-ufc-balance-551 | UFC CULTURE | 56 | Memes built around a single unusual UFC scorecard graphic |
| wl-ufc-balance-552 | EVENTS & FIGHTS | 29 | Adesanya vs Cannonier's pay-per-view entertainment value |
| wl-ufc-balance-554 | EVENTS & FIGHTS | 86 | Poirier vs Hooker's five-round action quality |
| wl-ufc-balance-556 | EVENTS & FIGHTS | 74 | UFC 279's last-minute main-card reshuffle as drama |
| wl-ufc-balance-557 | EVENTS & FIGHTS | 43 | Cannonier vs Strickland's action-fight rewatch appeal |
| wl-ufc-balance-558 | EVENTS & FIGHTS | 59 | Pereira vs Błachowicz at UFC 291 as a technical rewatch |
| wl-ufc-balance-560 | VENUE & ATMOSPHERE | 70 | Singapore as a UFC Fight Night setting |
| wl-ufc-balance-561 | VENUE & ATMOSPHERE | 68 | South Korea as a UFC Fight Night atmosphere |
| wl-ufc-balance-562 | VENUE & ATMOSPHERE | 72 | Sweden as a UFC Fight Night crowd atmosphere |
| wl-ufc-balance-568 | PERSONALITY & PROMOTION | 58 | Gilbert Burns's demeanor in pre-fight interviews |
| wl-ufc-balance-584 | LEGACY & HISTORY | 78 | The UFC's early expansion into Canada through major live events |
| wl-ufc-balance-585 | LEGACY & HISTORY | 73 | The UFC's first events in Brazil as an international milestone |
| wl-ufc-balance-618 | TUF & REALITY | 79 | The Ultimate Fighter Season 6's Hughes-Serra rivalry |
| wl-ufc-balance-619 | TUF & REALITY | 77 | The Ultimate Fighter Season 7's Jackson-Griffin coaching rivalry |
| wl-ufc-balance-620 | TUF & REALITY | 55 | The Ultimate Fighter Season 8's Junie Browning house drama |
| wl-ufc-balance-621 | TUF & REALITY | 82 | The Ultimate Fighter Season 12's St-Pierre-Koscheck coach pairing |
| wl-ufc-balance-622 | TUF & REALITY | 47 | The Ultimate Fighter Season 16's Nelson-Carwin rivalry |
| wl-ufc-balance-628 | CROSSOVER & CELEBRITY | 57 | A celebrity hosting a UFC ceremonial weigh-in |
| wl-ufc-balance-629 | CROSSOVER & CELEBRITY | 53 | A viral comedian interviewing UFC fighters after a Fight Night |
| wl-ufc-balance-630 | CROSSOVER & CELEBRITY | 63 | A major soccer star watching a UFC pay-per-view cage-side |
| wl-ufc-balance-632 | CROSSOVER & CELEBRITY | 23 | Celebrity crowd shots interrupting live UFC fight analysis |

All 16 categories still hold at least 26 playable clues, the target scale 1–100 remains dense (within three points of every possible target), and the 48-hour UFC Daily calendar and two-round scoring are unchanged. Current 80+ distribution: **253/578 (43.8%)**, arising from topic selection rather than forced rating reductions. Additional quality changes retire the bare-number UFC 100/205/229/300 event prompts, replacing them with named Lesnar/McGregor/Khabib/Holloway moments; named-coach prompts now include champions to provide context; a duplicated gladiator-intro clue is retired. New content fact anchors: [UFC 189 card](https://www.ufc.com/event/ufc-189), [UFC 217 results](https://www.ufc.com/event/ufc-217), [UFC 129 Toronto crowd](https://www.ufc.com/news/georges-st-pierre-remembers-ufc-129-day-canada-ufc-fight-pass-read), [UFC 279 reshuffle](https://www.ufc.com/news/updates-ufc-279), and [UFC City Kickboxing coaching history](https://www.ufc.com/news/inside-mind-city-kickboxing-eugene-bareman-adesanya-kara-france-ulberg-ufc-259).

This is an editorial accessibility review, not a blinded fan-survey guarantee that every individual player knows every fighter. The maintained rule is that the clue must be self-explanatory or tied to a recognizable career/event anchor, and must not require a player to recall a numbered event's undisclosed details.
