# Football Ledger Stage 11 — Census and stat contracts

Baseline: 2026-08-27

## Purpose

Stage 11 establishes the Football HQ product specification before more identities are promoted or facts are enriched. It answers three questions for every NFL and CFB pool:

1. How much source identity depth exists today?
2. How much of that depth is actually in the canonical A/B/C product universe and fact-ready?
3. What facts and honors should the ledger ultimately own so every Football game can reuse one universe in different ways?

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

## Census definitions

`Source raw assignable` is the number of unique identities the **current normalized source and current position-inference rules** can place into that pool. It is not a claim that the source is historically complete.

`Canonical A-C` is the actual product universe returned through the canonical subject/query path with projected source subjects and projected canonical recognition enabled.

`With any facts` means the canonical factual owner can currently return at least one objective fact for the subject. It does not mean the Stage 11 stat contract is complete.

The current recognizability generator contains **51,428 raw player identities** overall. Its generated source projection promotes **1,455 NFL** player identities to A-C but only **159 CFB** identities. The canonical/curated bridge raises the actual product pool to **1,508 NFL** and **223 CFB** player identities across the nine permanent player pools below.

## Player census

### NFL

| Pool | Source raw assignable | A | B | C | Canonical A-C | With any facts | Avg. current facts | Audit result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| QB | 411 | 10 | 32 | 80 | 122 | 122 | 14.94 | Strongest current player pool. |
| RB | 1,169 | 4 | 30 | 139 | 173 | 173 | 14.85 | Strong current identity/fact depth. |
| WR | 1,445 | 2 | 32 | 198 | 232 | 232 | 3.03 | Names are deep; factual menu is too thin. |
| TE | 745 | 0 | 5 | 66 | 71 | 68 | 2.87 | Identity depth is useful; facts are thin and Tier A is empty. |
| OL | 1,471 | 0 | 0 | 0 | **0** | **0** | 0.00 | Product pool is missing entirely. |
| DL / EDGE | 1,654 | 2 | 16 | 280 | 298 | 295 | 2.00 | Many identities; facts are extremely shallow. |
| LB | 1,701 | 1 | 15 | 204 | 220 | 219 | 2.03 | Many identities; facts are extremely shallow. |
| Secondary | 2,271 | 1 | 24 | 367 | 392 | 391 | 2.01 | Many identities; facts are extremely shallow. |
| K / P | 0 under current normalized player import | 0 | 0 | 0 | **0** | **0** | 0.00 | Specialist product/source path is missing. |

### CFB

| Pool | Source raw assignable | A | B | C | Canonical A-C | With any facts | Avg. current facts | Audit result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| QB | 1,731 | 1 | 10 | 43 | **54** | **19** | 2.09 | Far too shallow; recognized identities also lack facts. |
| RB | 1,755 | 1 | 11 | 47 | **59** | **40** | 4.02 | Far too shallow for CFB history. |
| WR | 5,612 | 0 | 4 | 38 | **42** | **34** | 2.62 | Far too shallow and Tier A is empty. |
| TE | 280 | 0 | 1 | 8 | **9** | **5** | 1.67 | Critical missing historical/recognition pool. |
| OL | 115 | 0 | 0 | 0 | **0** | **0** | 0.00 | Product pool is missing entirely. |
| DL / EDGE | 528 | 0 | 2 | 19 | **21** | **20** | 1.90 | Critical recognition/history gap. |
| LB | 596 | 0 | 1 | 19 | **20** | **19** | 1.90 | Critical recognition/history gap. |
| Secondary | 863 | 0 | 1 | 17 | **18** | **9** | 1.22 | Critical identity and factual gap. |
| K / P | 1,360 | 0 | 0 | 0 | **0** | **0** | 0.00 | Source identities exist but product projection ignores specialists. |

The current 2014-2025 CFB player source leaves **27,237 raw CFB identities without a trustworthy pool assignment under the current inference rules**. That alone is enough to reject one stat feed as the sole recognizability authority.

## Non-player census

| League | Pool | Current source rows | Canonical A-C | With any facts | Avg. current facts | Audit result |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| NFL | Team seasons | 861 | 116 | 116 | 3.91 | Useful identities; stat menu needs expansion. |
| NFL | Franchises | 32 | **0 canonical product subjects** | — | — | Identity/query gap. |
| NFL | Head-coach stops / coaches | 246 source stops | 38 coaches | **2** | **0.21** | Product identities exist but factual coverage is effectively absent. |
| NFL | Eras / dynasties | 246 coach-stop rows available as inputs | **0 canonical product eras** | 0 | 0 | Identity/relationship gap. |
| NFL | Games | 7,276 | **0 canonical product games** | — | — | Identity/query gap. |
| CFB | Team seasons | 7,468 | 142 | 142 | **11.36** | Healthiest current CFB non-player pool. |
| CFB | Programs | 769 | 106 | **4** | **0.18** | Identity breadth exists; reusable facts almost do not. |
| CFB | Head-coach stops / coaches | 686 source stops | 20 coaches | **11** | **2.05** | Identity and fact depth are shallow. |
| CFB | Eras / dynasties | 6 generated championship-era rows | 12 canonical eras | **4** | **1.67** | Small curated pool; needs objective relationship expansion. |
| CFB | Games | 36,217 | **0 canonical product games** | — | — | Deep raw history but no canonical notable-game product pool. |

The non-player universe is **not already finished**. Team seasons are the healthiest families. Franchises/programs, coaches, eras, and notable games require Stage 12 identity work and/or Stage 13 factual work.

## Root cause: recognizability and statistics are different authorities

The current historical stat feeds are useful factual inputs, but they are not sufficient recognizability authorities.

The current CFB path is especially unsuitable as the sole A/B/C judge because:

- normalized player-stat coverage currently begins in 2014;
- many older recognizable players cannot be discovered from it;
- the source does not carry enough award/cultural-significance context;
- current CFB position inference is incomplete, especially OL and defense;
- 27,237 current CFB raw identities cannot be assigned confidently to one of the nine product pools;
- a recognizable canonical identity can exist while its source-backed factual row is missing or unreconciled.

Permanent rule:

> **Recognition evidence decides who belongs. Factual/stat sources decide what is true about them. Neither may silently substitute for the other.**

Stage 12 will combine multiple independent recognition evidence families while preserving one canonical identity/query owner. Appropriate evidence includes:

- NCAA consensus/unanimous All-America and national award records;
- official conference **first-team All-Conference** and major conference Player of the Year records;
- College Football Hall of Fame records;
- Heisman winner/finalist history;
- major position awards: Davey O'Brien/Maxwell, Doak Walker, Biletnikoff, Mackey, Outland, Rimington, Lombardi, Butkus, Bednarik/Nagurski, Thorpe, Lou Groza, Ray Guy, and other legitimate national position awards;
- Pro Football Hall of Fame plus major AP/PFWA NFL honors;
- championships/postseason prominence and historically meaningful production;
- curated review for edge cases structured sources cannot encode cleanly.

Statistical production may support recognition, but no single production threshold or NFL crossover rule is allowed to be the sole reason a college identity exists in A/B/C.

Examples already exposed:

- Johnny Manziel is already a recognizable canonical CFB identity but lacks the factual depth the games should expect.
- Darren McFadden already has useful college facts, proving factual presence and recognition exposure can fail independently.
- Jermaine Gresham and Mark Andrews illustrate the missing CFB TE universe: recognizable college tight ends must exist because of their college careers, not because an NFL feed happens to reconcile them.

## Player stat contracts

These are **coverage concepts**, not a second metric database. Stage 13 maps them into canonical facts/relationships owned by `footballFactualStats.ts`.

### Common player identity / relationship facts

Every player pool should support, where applicable:

- canonical name/aliases and separate NFL/CFB career identity;
- position/pool and detailed position when known;
- franchises or schools/programs;
- seasons/active range and CFB conference context;
- draft year/round/pick/undrafted status;
- championships/postseason relationships;
- major individual honors.

### QB

Numerical: games/starts; completions/attempts; passing yards/TD/INT; completion %; YPA; NFL passer rating or NCAA passer efficiency; yards/game; TD:INT ratio; rushing attempts/yards/YPC/TD; total TD when derivable.

NFL honors/context: AP MVP/OPOY, first-team All-Pro, Pro Bowl, Super Bowl/postseason relationships.

CFB honors/context: Heisman winner/finalist, Davey O'Brien/Maxwell and legitimate QB awards, consensus/unanimous All-America, **first-team All-Conference**, conference POY, team record/conference title/bowl/CFP/title result.

### RB

Numerical: games/starts; carries; rushing yards/TD; YPC; rushing yards/game; receptions; receiving yards/TD; scrimmage yards/TD; fumbles only where historical coverage is reliable.

Honors: NFL MVP/OPOY, All-Pro, Pro Bowl; CFB Heisman result, Doak Walker, All-America, **All-Conference**, conference POY; postseason/championship relationships.

### WR

Numerical: games/starts; receptions; receiving yards/TD; yards/reception; receptions/game; yards/game. Targets/catch rate are optional only where era/source coverage is comparable.

Honors: NFL All-Pro, Pro Bowl, OPOY/MVP where applicable; CFB Biletnikoff, All-America, **All-Conference**, Heisman result where applicable; postseason/championship relationships.

### TE

Numerical: the same core receiving production/efficiency concepts as WR plus games/starts where reliable.

Honors: NFL All-Pro/Pro Bowl; CFB **Mackey winner/finalist**, All-America, **All-Conference**; postseason/championship relationships.

Blocking grades are not a required historical fact unless a legitimate reproducible source with broad era coverage is adopted. Do not invent a blocking statistic merely to fill a resume row.

### OL

OL must exist as a real identity pool even though traditional box scores are weak.

Core context: detailed position (OT/G/C), games/starts where reliable, seasons/team/program relationships, draft facts, postseason/championship relationships.

Honors are central: NFL first-team All-Pro/Pro Bowl; CFB consensus/unanimous All-America, **first-team All-Conference**, Outland, Rimington for centers, Lombardi when position-appropriate.

Do not make proprietary pressure/sack-allowed grades a foundational requirement without a legitimate broad source/license.

### DL / EDGE

Numerical: games/starts; sacks; TFL; tackles where broadly available; forced fumbles/recoveries; INT/pass defended where applicable; defensive TD. QB hits/pressures are optional only with consistent source coverage.

Honors: NFL DPOY/All-Pro/Pro Bowl; CFB Bednarik/Nagurski/Lombardi/Outland where applicable, All-America, **All-Conference**, conference DPOY.

### LB

Numerical: games/starts; total/solo tackles where reliable; TFL; sacks; INT/pass defended; forced fumbles/recoveries; defensive TD.

Honors: NFL DPOY/All-Pro/Pro Bowl; CFB Butkus plus Bednarik/Nagurski where applicable, All-America, **All-Conference**, conference DPOY.

### Secondary

Numerical: games/starts; INT; passes defended where reliable; tackles; sacks/TFL when meaningful; forced fumbles/recoveries; defensive TD; return production only when useful.

Honors: NFL DPOY/All-Pro/Pro Bowl; CFB Thorpe plus Bednarik/Nagurski where applicable, All-America, **All-Conference**, conference DPOY.

### K / P

Kicker: FG made/attempted/%, XP made/attempted/%, long FG, 50+ makes when comparable.

Punter: punts, gross yards/yards per punt, net yards per punt where available, inside-20 punts/touchbacks where available.

Honors: NFL All-Pro/Pro Bowl; CFB Lou Groza/Ray Guy, All-America, **All-Conference**.

## Non-player stat contracts

### Team seasons — NFL and CFB

Core:

- W-L-T and win percentage;
- points for/against and PPG/opponent PPG;
- point differential/scoring margin;
- total offense and offense/game where available;
- total defense and defense/game where available;
- **turnovers and turnover margin**;
- postseason qualification/result and championship result;
- final ranking where meaningful/available.

NFL adds division/conference finish, playoff wins, Super Bowl appearance/title. CFB adds conference finish/title, AP/Coaches/CFP ranking where applicable, bowl/CFP/title result.

SRS and SOS may remain legitimate source-backed analytical facts, but they are **secondary/back-end dimensions**, not default visible game stats. Intuitive football facts such as turnover margin, scoring, record, offense/defense, and postseason results take priority in game-facing contracts.

### Franchises / programs

Use explicit time windows when facts are not all-time. Core: W-L-T/win %, championships, playoff/CFP/title-game appearances/wins, division/conference titles, major award winners, Hall of Fame/consensus All-America counts where appropriate, and program draft production when useful.

Never label a `since 2000` total as an all-time fact.

### Head coaches

Core: seasons/games coached; W-L-T/win %; postseason/bowl/playoff W-L; championships; conference/division titles; CFP/Super Bowl/title-game appearances; Coach of the Year honors where sourceable.

Coach facts belong to the coach identity; individual coach stops are relationships to the franchise/program and season window.

### Eras / dynasties

An era is objective first; `dynasty` is a product/evaluation label. Core: organization, start/end seasons and season membership, primary coach(es), W-L-T/win %, titles, conference/division titles, playoff/CFP/Super Bowl/title-game appearances. Dominance measures may be derived only from owned team-season facts.

### Notable games

Notable games need a canonical identity pool for future history/20 Questions gameplay. Core: date/season, teams/programs, final score/margin, venue/neutral-site where available, postseason/bowl/playoff/championship relationship, entering rankings where sourceable, overtime, rivalry identity when explicitly modeled, and comeback/upset markers only when deterministically supported.

Raw schedule membership does not make a game Tier C. Stage 12 supplies recognizable-game evidence.

## Game-use contract

The ledger must be broad enough that different games use **different slices**, not the same shallow stat list with different labels.

- **Blind Resume:** many independent intuitive dimensions across production, efficiency, honors, relationships, and team success; no fake zero/default rows.
- **Hit the Number:** quantitative totals/rates with exact-solvable boards.
- **Find the Leader:** broad comparable numerical metrics, including categories not useful in Blind Resume.
- **Blind Rank / Keep-Cut:** canonical identities plus sufficient facts for the shared evaluation authority; reviewed ratings remain calibration only.
- **Future Draft/Auction:** positional depth, peak production, honors, team success, draft context, and enough variety for balanced roster building.
- **Future 20 Questions:** identity/relationship graph matters as much as statistics—school/franchise, position, era, awards, draft, championships, coaches/teammates, and notable games become clues.

## Stage 11 conclusions

1. The old “NFL player depth + CFB teams/dynasties” shape is unacceptable.
2. NFL and CFB permanently share the same nine player-pool taxonomy.
3. CFB player depth is materially incomplete; TE, OL, DL/EDGE, LB, Secondary, and K/P are the starkest holes, while QB/RB/WR also need major expansion.
4. NFL is not finished either: OL/K-P are absent and WR/TE/defensive facts are far thinner than QB/RB facts.
5. Team seasons are healthier than other non-player pools; organizations, coaches, eras, and notable games remain incomplete.
6. A giant Tier D/raw corpus does not count as product depth.
7. Tier D remains the archive/deep layer; Stage 13 enrichment priority is A-C unless a feature explicitly needs D.
8. Recognizability must be multi-source and independent from factual-stat ingestion.
9. **First-team All-Conference** is a required CFB recognition/factual concept alongside All-America and national/position awards.
10. Stage 12 fixes the A/B/C universe before Stage 13 fills the factual contracts.

## Next ownership

- **Stage 12 — Recognizability Universe:** complete/repair A-B-C membership using multi-source recognition evidence across every pool.
- **Stage 13 — Factual Universe:** hydrate these stat/honor contracts for A-C subjects through the existing factual owner.
- **Stage 14 — Game Integration:** finish Blind Resume and re-audit all objective Football games; make the same owners ready for Draft/Auction and 20 Questions.
- **Stage 15 — Cleanup + final release audit:** remove obsolete providers/rosters/fallbacks, prove simulations/bundle health, and verify exact release/deployment ownership.
