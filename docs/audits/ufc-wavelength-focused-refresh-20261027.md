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
