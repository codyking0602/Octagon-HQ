# Football Ledger Stage 11 — Census and stat contracts

Baseline: 2026-08-27

## Purpose

Stage 11 establishes the product specification before more Football data is promoted or enriched. It answers three questions for every NFL and CFB pool:

1. How much source identity depth exists today?
2. How much of that depth is actually in the canonical A/B/C product universe and fact-ready?
3. What facts and honors should the ledger ultimately own so every Football game can use the same universe in different ways?

This is an audit/specification stage. It does **not** create a second factual provider or a game-specific roster. `footballSubjectRegistry.ts` remains the identity/query owner and `footballFactualStats.ts` remains the factual public owner.

## Permanent pool taxonomy

NFL and CFB use the exact same player-pool structure:

- QB
- RB
- WR
- TE
- OL
- DL / EDGE
- LB
- Secondary
- K / P

There is no generic player pool called `Defense`. DL/EDGE, LB, and Secondary are separate because their recognizable identities, useful statistics, awards, and game comparisons are materially different.

Both leagues also require non-player pools:

- team seasons
- franchises / programs
- head coaches
- eras / dynasties
- notable games

## What the census numbers mean

`Source raw assignable` is the number of unique identities that the **current normalized source and current position-inference rules** can place into that pool. It is not a claim that the source is a complete historical universe.

`Canonical A-C` is the actual product universe returned through the canonical subject/query path with projected source subjects and projected canonical recognition enabled.

`With any facts` means the canonical factual owner can currently return at least one objective fact for that subject. It does not mean the stat contract is complete.

The current recognizability generator contains 51,428 raw player identities overall. Its own generated projection has 1,455 NFL A-C player identities but only 159 CFB A-C player identities. The curated/canonical bridge raises the actual product pool to 1,508 NFL and 223 CFB player identities across the nine pools below.

### NFL player census

| Pool | Source raw assignable | A | B | C | Canonical A-C | With any facts | Avg. current fact count | Stage 11 read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| QB | 411 | 10 | 32 | 80 | 122 | 122 | 14.94 | Identity/fact depth strong; contract still needs honors/team-success parity. |
| RB | 1,169 | 4 | 30 | 139 | 173 | 173 | 14.85 | Identity/fact depth strong. |
| WR | 1,445 | 2 | 32 | 198 | 232 | 232 | 3.03 | Plenty of names, but factual menu is too thin. |
| TE | 745 | 0 | 5 | 66 | 71 | 68 | 2.87 | Identity depth acceptable; factual menu too thin and no Tier A. |
| OL | 1,471 | 0 | 0 | 0 | **0** | **0** | 0.00 | Missing product pool entirely. |
| DL / EDGE | 1,654 | 2 | 16 | 280 | 298 | 295 | 2.00 | Many identities, very shallow facts. |
| LB | 1,701 | 1 | 15 | 204 | 220 | 219 | 2.03 | Many identities, very shallow facts. |
| Secondary | 2,271 | 1 | 24 | 367 | 392 | 391 | 2.01 | Many identities, very shallow facts. |
| K / P | 0 under current normalized player import | 0 | 0 | 0 | **0** | **0** | 0.00 | Source/product gap; specialists are not represented as a usable pool. |

### CFB player census

| Pool | Source raw assignable | A | B | C | Canonical A-C | With any facts | Avg. current fact count | Stage 11 read |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| QB | 1,731 | 1 | 10 | 43 | **54** | **19** | 2.09 | Far too shallow; many obvious identities also lack facts. |
| RB | 1,755 | 1 | 11 | 47 | **59** | **40** | Far too shallow for CFB history. |
| WR | 5,612 | 0 | 4 | 38 | **42** | **34** | Far too shallow and zero Tier A. |
| TE | 280 | 0 | 1 | 8 | **9** | **5** | Critical gap; recognizable college TEs are largely absent. |
| OL | 115 | 0 | 0 | 0 | **0** | **0** | Missing product pool entirely. |
| DL / EDGE | 528 | 0 | 2 | 19 | **21** | **20** | Critical historical/recognition gap. |
| LB | 596 | 0 | 1 | 19 | **20** | **19** | Critical historical/recognition gap. |
| Secondary | 863 | 0 | 1 | 17 | **18** | **9** | Critical identity and factual gap. |
| K / P | 1,360 | 0 | 0 | 0 | **0** | **0** | Source identities exist but product projection ignores the pool. |

The current 2014-2025 CFB player source leaves **27,237 raw CFB identities without a trustworthy pool assignment under the current inference rules**. That is a direct reason not to let one stat feed determine recognizability.

### Non-player census

| League | Pool | Current source rows | Canonical A-C | Factual readiness |
| --- | --- | ---: | ---: | --- |
| NFL | Team seasons | 861 | 116 | Strongest NFL non-player factual pool; current stat menu is still too thin. |
| NFL | Franchises | 32 | **0 canonical product subjects** | Identity owner gap. |
| NFL | Head-coach stops / coaches | 246 source stops | 38 coaches | No NFL coach fact scope today; factual gap. |
| NFL | Eras / dynasties | 246 coach-stop rows available as era inputs | **0 canonical product eras** | Identity/relationship gap. |
| NFL | Games | 7,276 | **0 canonical product games** | Identity/query gap. |
| CFB | Team seasons | 7,468 | 142 | Strong current non-player pool; needs broader team-stat contract. |
| CFB | Programs | 769 | 106 | Identity depth exists; only a tiny subset currently owns reusable program facts. |
| CFB | Head-coach stops / coaches | 686 source stops | 20 coaches | Identity and factual coverage are shallow. |
| CFB | Eras / dynasties | 6 generated championship-era rows | 12 canonical eras | Small curated/product pool; needs objective era relationship expansion. |
| CFB | Games | 36,217 | **0 canonical product games** | Identity/query gap despite deep raw history. |

The non-player census is not “already good.” Team seasons are the healthiest families. Franchises/programs, coaches, eras, and games all require Stage 12 identity work and/or Stage 13 factual work.

## Root-cause finding: recognizability and statistics are different authorities

The current historical stat feeds are valuable factual inputs, but they are not sufficient recognizability authorities.

The current CFB feed is especially unsuitable as the sole A/B/C judge because:

- normalized player-stat coverage currently begins in 2014;
- many older recognizable players therefore cannot be discovered from it;
- the source does not carry enough award/cultural-significance context;
- current CFB position inference is incomplete, especially OL and defense;
- 27,237 current CFB raw identities cannot be assigned to one of the nine product pools confidently;
- a recognizable canonical identity can exist while its source-backed factual row is missing or unreconciled.

Permanent rule:

> **Recognition evidence decides who belongs. Factual/stat sources decide what is true about them. Neither may silently substitute for the other.**

Stage 12 will build recognizability from multiple independent evidence families. Appropriate evidence includes, without being limited to:

- NCAA consensus/unanimous All-America records and national award records;
- official conference first-team All-Conference and major conference Player of the Year records;
- National Football Foundation College Football Hall of Fame records;
- Heisman winner/finalist history;
- major position-award winner/finalist history: Davey O'Brien/Maxwell, Doak Walker, Biletnikoff, Mackey, Outland, Rimington, Lombardi, Butkus, Bednarik/Nagurski, Thorpe, Lou Groza, Ray Guy, and other legitimate national position awards;
- Pro Football Hall of Fame plus NFL AP/PFWA honors for NFL recognition;
- major championship/postseason participation and historically meaningful production;
- curated review for edge cases where structured sources cannot encode cultural recognizability cleanly.

Statistical production may support recognition, but no single production threshold or NFL crossover rule is allowed to be the sole reason a college identity exists in A/B/C.

Examples already exposed by this audit:

- Johnny Manziel is already a recognizable canonical CFB identity, but the current factual path does not provide the resume depth a game expects.
- Darren McFadden already has useful college factual data, proving that factual presence and recognition exposure can fail independently.
- Jermaine Gresham and Mark Andrews illustrate the missing CFB TE universe: national-level college tight ends must be discoverable because of their college careers, not because the NFL feed happens to reconcile them.

## Player stat contracts

These are **coverage concepts**, not a second metric database. Stage 13 will map them into canonical `FootballFactMetricId` values owned by `footballFactualStats.ts`.

### Common identity / relationship facts for every player pool

- canonical name and aliases
- NFL or CFB identity kept distinct when the same person has both careers
- position / pool
- franchise(s) or school/program(s)
- seasons / active range
- conference for CFB seasons when applicable
- draft year, round, pick, undrafted status when applicable
- championships / postseason relationships
- major individual honors

### QB

Core numerical facts:

- games and starts where reliable
- completions / attempts
- passing yards / passing TD / interceptions
- completion percentage
- yards per attempt
- passer rating for NFL; NCAA passer efficiency/rating for CFB
- passing yards per game
- TD-to-INT ratio
- rushing attempts / yards / YPC / rushing TD
- total TD where derivable from owned facts

NFL honors/context:

- AP MVP / OPOY
- first-team All-Pro
- Pro Bowl
- Super Bowl titles/appearances and playoff success where attributable without fake individual credit

CFB honors/context:

- Heisman winner/finalist
- Davey O'Brien / Maxwell and other legitimate QB/player awards
- consensus/unanimous All-America
- **first-team All-Conference**
- conference Player of the Year
- team record, conference title, CFP/bowl/title result for the relevant season

### RB

Core numerical facts:

- games / starts where reliable
- carries, rushing yards, rushing TD
- yards per carry and rushing yards per game
- receptions, receiving yards, receiving TD
- scrimmage yards and scrimmage TD
- fumbles only where historical coverage is reliable and comparable

Honors/context:

- NFL: MVP/OPOY, All-Pro, Pro Bowl
- CFB: Heisman result, Doak Walker, All-America, **All-Conference**, conference POY
- championships/postseason relationships

### WR

Core numerical facts:

- games / starts where reliable
- receptions, receiving yards, receiving TD
- yards per reception
- receptions per game / yards per game
- targets/catch rate only for eras/sources where they are genuinely available and comparable

Honors/context:

- NFL: All-Pro, Pro Bowl, OPOY/MVP where applicable
- CFB: Biletnikoff, All-America, **All-Conference**, Heisman result when applicable
- championships/postseason relationships

### TE

Core numerical facts:

- same core receiving production/efficiency concepts as WR
- games / starts where reliable

Honors/context:

- NFL: All-Pro, Pro Bowl
- CFB: **Mackey winner/finalist**, All-America, **All-Conference**
- championships/postseason relationships

TE blocking grades are not a required historical fact unless a reproducible/licensed source with broad era coverage is adopted. Do not invent a blocking statistic simply to fill a resume row.

### OL

OL must exist as a real identity pool even though traditional box-score statistics are weak.

Core facts/context:

- position detail when known (OT/G/C)
- games / starts where reliable
- seasons and team/program relationships
- draft facts
- championships/postseason relationships

Honors are especially important:

- NFL: first-team All-Pro, Pro Bowl, major line-specific honors where legitimate
- CFB: consensus/unanimous All-America, **first-team All-Conference**, Outland, Rimington for centers, Lombardi when position-appropriate

Do not make proprietary pressure/sack-allowed grades a foundational requirement unless the project has a legitimate broad source/license.

### DL / EDGE

Core numerical facts:

- games / starts
- sacks
- tackles for loss
- tackles when broadly available
- QB hits/pressures only where source coverage is consistent
- forced fumbles / fumble recoveries
- interceptions / passes defended where applicable
- defensive TD

Honors/context:

- NFL: DPOY, All-Pro, Pro Bowl
- CFB: Bednarik/Nagurski/Lombardi/Outland where applicable, All-America, **All-Conference**, conference DPOY

### LB

Core numerical facts:

- games / starts
- total/solo tackles where reliable
- tackles for loss
- sacks
- interceptions / passes defended
- forced fumbles / recoveries
- defensive TD

Honors/context:

- NFL: DPOY, All-Pro, Pro Bowl
- CFB: Butkus plus Bednarik/Nagurski where applicable, All-America, **All-Conference**, conference DPOY

### Secondary

Core numerical facts:

- games / starts
- interceptions
- passes defended where reliable
- tackles
- sacks/TFL when meaningful
- forced fumbles / recoveries
- defensive TD
- interception-return production only when useful to a game

Honors/context:

- NFL: DPOY, All-Pro, Pro Bowl
- CFB: Thorpe plus Bednarik/Nagurski where applicable, All-America, **All-Conference**, conference DPOY

### K / P

Kicker:

- FG made / attempted / percentage
- XP made / attempted / percentage
- long FG
- 50+ yard makes when source coverage is comparable

Punter:

- punts
- gross yards / yards per punt
- net yards per punt where available
- inside-20 punts and touchbacks where available

Honors/context:

- NFL: All-Pro / Pro Bowl
- CFB: Lou Groza / Ray Guy, All-America, **All-Conference**

## Non-player stat contracts

### Team seasons — NFL and CFB

Core:

- W-L-T and win percentage
- points for / points against
- PPG / opponent PPG
- point differential / scoring margin
- total offense and offense per game where available
- total defense and defense per game where available
- **turnovers and turnover margin**
- postseason qualification/result
- championship result
- final ranking where meaningful/available

League-specific:

- NFL: division/conference finish, playoff wins, Super Bowl appearance/title
- CFB: conference finish/title, AP/Coaches/CFP ranking where applicable, bowl/CFP/title result

SRS and SOS may remain legitimate source-backed analytical facts, but they are **secondary/back-end dimensions**, not default visible game stats. Intuitive football facts such as turnover margin, scoring, record, offense/defense, and postseason results take priority in game-facing contracts.

### Franchises / programs

Use explicit time windows when facts are not all-time.

Core:

- W-L-T / win percentage
- championships
- playoff/CFP/title-game appearances and wins
- division/conference titles
- major award winners
- Hall of Fame / consensus All-America counts where appropriate
- draft production for programs when useful

Do not label a `since 2000` total as an all-time franchise/program fact.

### Head coaches

Core:

- seasons / games coached
- W-L-T / win percentage
- postseason/bowl/playoff W-L
- championships
- conference/division titles
- CFP/Super Bowl/title-game appearances
- Coach of the Year honors where sourceable

Coach facts belong to the coach identity, while individual coach stops remain relationships to the program/franchise and season window.

### Eras / dynasties

An era is objective first; `dynasty` is a product/evaluation label.

Core:

- program/franchise
- start/end seasons and season membership
- primary coach(es)
- W-L-T / win percentage
- titles
- conference/division titles
- playoff/CFP/Super Bowl/title-game appearances
- average scoring margin or other derived dominance measures only from owned team-season facts

### Notable games

Notable games need a canonical identity pool for future 20 Questions and other history games.

Core:

- date / season
- teams/programs
- final score / margin
- venue / neutral-site flag where available
- postseason/bowl/playoff/championship relationship
- rankings entering the game where sourceable
- overtime
- rivalry identity where explicitly modeled
- comeback/upset markers only when deterministically supported by source facts

Raw schedule membership does not make a game Tier C. Stage 12 must supply recognizability evidence for memorable games.

## Game-use contract

The ledger should be broad enough that different games use **different slices**, not the same shallow stat list with different labels.

- **Blind Resume:** needs many independent, intuitive dimensions across production, efficiency, honors, relationships, and team success; no fake zero/default rows.
- **Hit the Number:** primarily quantitative totals/rates with exact solvable boards.
- **Find the Leader:** broad comparable numerical metrics, including categories that are not useful in Blind Resume.
- **Blind Rank / Keep-Cut:** canonical identities plus sufficient facts for the shared evaluation authority; reviewed ratings remain calibration only.
- **Future Draft/Auction:** identity depth, positional grouping, peak production, honors, team success, draft context, and enough variety to build balanced rosters.
- **Future 20 Questions:** identity/relationship graph is as important as statistics—school/franchise, position, era, awards, draft, championships, teammates/coaches, and notable games all become useful clues.

## Stage 11 conclusions

1. The old “NFL skill players + CFB teams/dynasties” shape is not acceptable.
2. NFL and CFB permanently share the same nine player-pool taxonomy.
3. CFB skill/defensive depth is materially incomplete; TE, OL, DL/EDGE, LB, Secondary, and K/P are the most obvious holes.
4. NFL is not finished either: OL/K-P are absent and WR/TE/defensive facts are much thinner than QB/RB facts.
5. Team seasons are healthier than other non-player pools; franchises/programs, coaches, eras, and games still need work.
6. A giant Tier D/raw corpus does not count as product depth.
7. Tier D remains the deep/archive layer; Stage 13 enrichment priority is A-C unless a specific feature explicitly needs D facts.
8. Recognizability must be multi-source and independent from factual-stat ingestion.
9. First-team All-Conference honors are a required CFB recognition/factual concept, alongside All-America and national/position awards.
10. Stage 12 must fix the A/B/C universe before Stage 13 fills the factual contracts.

## Next ownership

- **Stage 12 — Recognizability Universe:** complete/repair A-B-C membership using multi-source recognition evidence across every pool.
- **Stage 13 — Factual Universe:** hydrate the agreed stat/honor contracts for A-C subjects through the existing factual owner.
- **Stage 14 — Game Integration:** finish Blind Resume and re-audit all objective Football games against the completed ledger; prepare the same owners for Draft/Auction and 20 Questions.
- **Stage 15 — Cleanup + final release audit:** remove obsolete providers/rosters/fallbacks, prove simulations/bundle health, and verify exact production deployment ownership/SHA.
