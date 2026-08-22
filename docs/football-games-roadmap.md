# Football Games Roadmap

Last approved: 2026-08-22

This document is the canonical product/content roadmap for the hidden Football universe inside The Back Room.

It does **not** replace the UFC Play roadmap in `docs/play-games-roadmap.md` and it does **not** replace the Football visual-asset contract in `docs/football-game-assets.md`.

The purpose of this document is to preserve the approved Football content philosophy, scoring methodology, game-depth targets, data ownership rules, and implementation sequence so future work does not drift back toward shallow all-star pools or ad-hoc ratings.

---

## 1. Product identity

Football lives inside The Back Room.

Current access pattern:

- Long-press the Octagon HQ logo while on Games.
- Enter The Back Room.
- Open Football.

Football is intentionally hidden from normal UFC navigation.

Football is a games universe first, not a general football news/stat product. NFL and college football belong together inside the same Football universe.

Visual identity remains separate from UFC:

- deep navy
- steel/silver
- cool gray
- white
- polished Cowboys-adjacent football feel
- no default UFC black/red treatment

The hub should feel like a polished game lobby, not a spreadsheet and not a stack of oversized cards.

Current visual ownership remains:

- `src/features/back-room/FootballSubjectVisual.tsx`
- `src/features/back-room/footballSubjectAssets.ts`
- `docs/football-game-assets.md`

Do not create a second Football media architecture. Player/coach headshots can be added later through the existing visual owner.

---

## 2. Core mechanic rule

Football games should generally reuse the **same mechanic and interaction model** as the corresponding mature UFC game, translated to football content.

Do not redesign a mechanic merely because the subject matter changed from UFC to football.

Examples:

- Football Blind Rank 5 should behave like UFC Blind Rank 5.
- Football Keep 4 / Cut 4 should behave like UFC Keep 4 / Cut 4.
- Football Blind Resume should preserve the staged-reveal decision flow.
- Football Wavelength should preserve one hidden 1–100 target and directional clue logic.
- Football Hit the Number should inherit the mature UFC four-format model and quality gating.
- Football Find the Leader should inherit the mature UFC competitive-leader/decoy philosophy.

The Football version should become equally deep on content without creating alternate engines where the shared mechanic can remain conceptually the same.

---

## 3. Current Football state

Current live Football games:

1. Blind Rank 5
2. Keep 4 / Cut 4
3. Wavelength
4. Blind Resume

Current canonical Football comparison owner:

- `src/features/back-room/footballRankFiveModel.ts`

Current six packs, 15 subjects each, 90 total subjects:

- NFL quarterbacks
- NFL running backs
- NFL head coaches
- college quarterbacks
- college programs
- college team seasons

The current content is heavily tilted toward elite/great subjects. The bottom of a current pack is usually only "low relative to stars," not genuinely average, below-average, or bad football content.

That is the single biggest maturity gap versus UFC Play.

Current replay limitations include:

- Blind Resume has only 18 fixed authored matchups.
- A five-round run therefore consumes a very large share of the catalog.
- Wavelength has only six categories and 54 authored clues.
- Blind Rank/Keep-Cut pools are shallow and star-heavy.

The next phase is therefore primarily a **content-maturity phase**, not a game-count phase.

---

## 4. The governing content principle

> **Facts determine factual games. Documented category-specific rubrics determine comparative games. Calibrated opinion determines subjective games. Never silently mix the three.**

Every Football content item must belong to one of those three classes.

### 4.1 Factual content

Examples:

- career passing yards
- season rushing touchdowns
- Super Bowl wins
- playoff starts
- conference titles
- sacks
- interceptions
- Heisman-season total touchdowns
- team scoring offense
- draft picks produced

These should come from one canonical factual-stat owner.

Factual data should power:

- Hit the Number
- Find the Leader
- factual rows inside Blind Resume where possible
- any future trivia/optimization mechanic that asks what objectively happened

Do not duplicate the same fact in multiple game-specific catalogs if it can be derived from the canonical factual owner.

### 4.2 Comparative content

Examples:

- better NFL quarterback career
- better running back career
- better coaching career
- greater college quarterback season
- greater college team season
- greater program since 2000
- greater dynasty/era

These should come from a single canonical Football comparison-rating owner, with **category-specific rating contracts**.

A rating is only meaningful inside the question it answers.

A `96` NFL QB career does not automatically mean the same thing as a `96` college program, team season, dynasty, coach, or defensive-player career.

Games may compare subjects only when their rating contract makes that comparison legitimate.

### 4.3 Subjective calibrated content

Examples:

- uniform quality
- stadium atmosphere
- fanbase insanity
- rivalry hatred
- "aura"
- coaching chaos
- media personality energy
- football weirdness

These belong primarily in Wavelength-style calibrated opinion.

They may use a documented 1–100 anchor rubric, but they should not be presented as objectively correct comparative answers in Blind Rank or Keep/Cut unless a future game explicitly defines them as opinion-based.

---

## 5. Canonical ownership model

Long-term Football should have two complementary data owners, not competing ones.

### A. Canonical Football comparison owner

Owns:

- subject identity for comparison-eligible content
- category eligibility
- category-specific rating
- component scores where appropriate
- methodology version
- evidence-review status

Consumed by:

- Blind Rank 5
- Keep 4 / Cut 4
- Blind Resume winner judgments
- possible future Draft Room grading

The existing `footballRankFiveModel.ts` is the current comparison owner and should evolve rather than be bypassed by a second ratings provider.

### B. Canonical Football factual-stat owner

Owns objective facts and derived metrics.

Consumed by:

- Hit the Number
- Find the Leader
- Blind Resume resume rows
- future objective Football games

This is not a competing rating owner because it answers a different question: **what happened**, not **how great was it**.

### C. Canonical subject identity

Long term, a subject should exist once and be reused.

Example:

`Tom Brady`

- subject identity: Tom Brady
- NFL QB career rating: one canonical value under one methodology version
- career factual record: one canonical fact record
- visual identity: one canonical Football visual record

Games consume those owners rather than hard-coding a Brady answer separately in each game.

Likewise:

`2005 Texas`

- one team-season identity
- one team-season comparison rating
- one factual season record
- one program visual identity

---

## 6. How comparative ratings are decided

The rating process must be reproducible and explainable. Ratings should not be permanent one-line opinions such as "Brady 100" with no methodology behind them.

Every comparison category requires:

1. an explicit question
2. a documented scoring rubric
3. component weights
4. anchor examples
5. era/context rules
6. evidence review
7. whole-pool calibration
8. pairwise sanity checks
9. a methodology version

### 6.1 Required rating workflow

#### Pass 1 — evidence

Collect the relevant factual resume for every subject in the category.

#### Pass 2 — rubric scoring

Apply the documented category rubric consistently.

#### Pass 3 — whole-pool calibration

Review the complete ordering and spacing.

The goal is not merely to get the order right. The score gaps should also mean something.

#### Pass 4 — anchor checking

Use stable anchors for the category.

General conceptual anchors:

- 100: benchmark / best reasonable subject for the contract
- 95+: historic inner-circle
- 90s: clearly elite / all-time level
- 80s: great
- 70s: good
- 60s: average-to-solid depending on category
- 50s: mediocre
- 35–49: clearly below-average
- below 35: genuinely bad for the comparison contract

Exact interpretation may vary by category and must be documented there.

#### Pass 5 — independent rerating

Perform a second rating pass without simply accepting the first-pass number.

Material disagreement should trigger focused review rather than averaging two guesses.

#### Pass 6 — pairwise sanity checks

Test the exact decisions the games will force.

If one player is rated above another, the question is:

> If these two appeared against each other in Blind Resume or if their relative ordering mattered in Blind Rank, can we defend this result under the documented contract?

If not, correct the rubric or rating.

### 6.2 Evidence stored with ratings

Internal rating records should eventually preserve enough explanation to answer "why?"

Illustrative structure:

- subject: Peyton Manning
- contract: NFL QB Career
- methodology: `nfl-qb-career-v1`
- peak: component score
- sustained elite play: component score
- production/efficiency: component score
- postseason: component score
- awards: component score
- longevity: component score
- final rating: calculated/calibrated result
- evidence reviewed: yes

The app does not need to expose every component to players, but future maintainers must not be left with unexplained numbers.

---

## 7. Approved comparison-rating contracts

The exact weights can be refined when each category is implemented, but the following philosophy is approved and should guide those PRs.

### 7.1 NFL quarterback career

Question:

> How great was this player's NFL quarterback career?

Suggested rubric:

- Peak / best-season dominance — 25%
- Sustained elite play — 20%
- Career production + efficiency, era-adjusted — 20%
- Postseason performance / success — 15%
- MVP / All-Pro / major recognition — 10%
- Longevity / durability / sustained relevance — 10%

Rules:

- Championships matter but do not become the entire rating.
- Raw passing volume must be era-adjusted.
- Team success cannot erase individual-performance differences.
- A great playoff resume can meaningfully improve a rating without automatically overriding superior full-career performance.

### 7.2 Position-specific NFL careers

Do not force all positions through the quarterback rubric.

Examples:

#### Wide receiver career

Likely emphasis:

- peak receiving dominance
- era-adjusted production
- sustained elite seasons
- All-Pro/major recognition
- postseason performance
- positional records/standing

#### Running back career

Likely emphasis:

- peak rushing/scrimmage dominance
- era-adjusted efficiency and production
- sustained elite seasons
- All-Pro/MVP recognition
- postseason performance
- longevity/value above replacement for the era

#### Defensive-player career

Likely emphasis:

- peak dominance
- DPOY/All-Pro level
- sustained elite seasons
- era-adjusted measurable production where meaningful
- postseason impact
- positional impact and historical standing

A future cross-position "NFL Player Careers" pack would require its own explicit cross-position greatness contract. Do not simply mix position-specific ratings.

### 7.3 Individual player season

Question:

> How great was that player's specific season relative to what was possible in that era?

Suggested rubric:

- Individual dominance — 30%
- Production — 20%
- Efficiency — 15%
- Team accomplishment — 15%
- Championship/postseason performance — 10%
- Awards / consensus recognition — 5%
- Difficulty/context — 5%

Rules:

- Evaluate the selected season, not career reputation.
- Era-adjust modern counting-stat inflation.
- System/context matters but should not become an excuse to ignore dominant output.
- Championship performance can separate historically close seasons without automatically deciding every comparison.

### 7.4 Team season

Question:

> How great was this specific team in this specific season?

Suggested rubric:

- Dominance — 30%
- Quality of competition — 20%
- Championship accomplishment — 20%
- Peak performance / postseason — 15%
- Underlying team quality — 10%
- Weaknesses, close calls, or losses — 5%

Rules:

- Record alone does not determine the answer.
- Schedule strength and quality of opponents matter.
- One loss does not automatically make a team worse than every undefeated champion.
- Blowout dominance, efficiency, and peak form matter.

### 7.5 College program

The program contract must define a time horizon. The intended first broad contract is modern-era/since-2000 style, not an ambiguous all-time history comparison.

Question example:

> How great has this college football program been since 2000?

Suggested rubric:

- National championships — 25%
- Sustained top-level contention — 25%
- Win performance / conference success — 15%
- Peak seasons — 15%
- NFL/talent production — 10%
- Longevity and resilience across coaches/eras — 10%

Rules:

- A program rating measures sustained program achievement.
- A team-season rating measures one team.
- A dynasty rating measures one defined run.
- Do not use one rating interchangeably for all three.

### 7.6 Dynasty / program era

Question:

> How great was this defined program run?

Example subjects:

- Alabama 2009–2020
- USC 2001–2009
- Clemson 2015–2020
- Georgia 2017–2023

Likely criteria:

- championships
- championship/CFP appearances
- sustained dominance
- quality of peak teams
- conference control
- duration
- week-to-week consistency

A dynasty is a bounded run. It should not inherit the full-history program rating.

### 7.7 Coaching career

The exact NFL and CFB coaching contracts may differ.

Likely criteria:

- championship accomplishment
- sustained winning/contending
- peak teams
- longevity
- program/franchise building
- performance relative to inherited context
- innovation/strategic influence where defensible

Do not over-credit a coach solely because elite talent was present, but do not invent a context adjustment so large that actual accomplishment stops mattering.

---

## 8. Subjective Wavelength contracts

Subjective items should still be calibrated, just not misrepresented as objective facts.

General 1–100 opinion anchor:

- 100: virtually unimprovable / defining benchmark
- 90s: all-time iconic
- 80s: excellent
- 70s: very good
- 50s–60s: mixed/average range
- 30s–40s: weak
- teens–20s: bad
- near 0: notorious bottom-of-scale example

Examples suitable for this system:

- uniform quality
- stadium atmosphere
- fanbase insanity
- rivalry hatred
- gunslinger tendency
- system-QB perception
- coaching chaos
- offensive innovation
- defensive terror
- draft-bust level
- clutch reputation
- choke reputation
- program tradition
- franchise tradition
- football weirdness
- media/personality energy

For opinion categories, calibration matters more than pseudo-objective formulas.

---

## 9. Mature Football content universe target

The long-term comparison universe should be approximately **250–350 rated subjects/entries**, with overlap allowed where the same real-world subject legitimately appears under different contracts.

Target buckets are directional, not hard-coded fighter-count-style constants:

- NFL QB careers: 30–40
- NFL RB careers: 25–35
- NFL WR careers: 30–40
- NFL TE careers: 15–25
- NFL defensive careers: 30–40
- NFL coaches: 25–35
- NFL QB seasons: 25–35
- NFL RB/WR seasons combined: 30–40
- NFL team seasons: 30–40
- CFB QBs: 35–45
- CFB RB/skill seasons: 25–35
- CFB coaches: 25–35
- CFB programs/eras: 30–40
- CFB team seasons: 30–40

These are content-depth goals, not a permanent requirement that every category must stop at a specific count.

### 9.1 Recognizability philosophy

Depth must not mean obscurity for obscurity's sake.

The best low/bad content is usually **recognizable and flawed**.

Examples of useful lower-end NFL QB content can include famous disappointments, busts, flashes, or uneven careers rather than random forgotten backups.

The same idea applies to team seasons and programs: use recognizable weaker eras/seasons when the contract permits it.

The game should create tension because the subject is debatable, memorable, or deceptively flawed—not because the player has never heard of the name.

### 9.2 Distribution philosophy

The comparison universe needs genuine tier depth.

Do not build another all-star catalog in which the worst item is still an 80.

Target broad usage of:

- elite
- great
- good
- average
- below-average
- bad

The mature Football pools should eventually receive simulation tests similar in spirit to UFC Play so low/middle content actually appears and star subjects do not dominate every board.

---

## 10. Blind Rank 5 maturity target

Current Football Blind Rank is structurally sound but content-shallow.

Long-term target:

- approximately 12–16 useful packs
- deep enough pools to support strong variety
- real middle/low/bad content where legitimate
- UFC-like board archetype philosophy
- limited superstar overexposure
- high board uniqueness
- broad pool utilization

Potential packs:

- NFL QB careers
- NFL RB careers
- NFL WR careers
- NFL TE careers
- NFL defensive careers
- NFL head coaches
- NFL QB seasons
- NFL skill-player seasons
- NFL team seasons
- Super Bowl teams
- college QB careers/seasons
- college RB/skill seasons
- CFB coaches
- programs since 2000
- program eras/dynasties
- legendary CFB team seasons
- CFB offenses
- CFB defenses

Do not add packs merely to increase the visible count. Add them only when the underlying contract and pool are deep enough to produce good boards.

### Board-generation philosophy

Port the mature UFC approach conceptually:

- balanced boards sometimes
- top-heavy boards sometimes
- bottom-heavy boards sometimes
- middle-cluster boards often enough to force hard decisions
- chaos as the dominant broad-randomness shape

The game should regularly contain meaningful low-end decisions rather than five famous legends ordered by consensus.

---

## 11. Keep 4 / Cut 4 maturity target

Keep/Cut should continue sharing the canonical comparison ratings where the comparison question is the same.

Do not create a separate "Keep/Cut truth" dataset.

As the Football pools deepen, adopt mature board-shape logic similar to UFC:

- Knife Edge
- Messy Middle
- One Superstar
- Bottom Grind
- Classic Spread

Quality goals:

- fourth/fifth cutoff should frequently be difficult
- avoid too many obvious superstar boards
- avoid too many obvious bottom-four cuts
- preserve real tier variety
- use broad eligible-pool coverage
- keep repeated boards rare
- limit top-subject exposure

Blind Rank and Keep/Cut may consume the same rating owner while using different board-construction engines because they create different decisions.

---

## 12. Blind Resume maturity target

Blind Resume is one of the strongest mechanics and needs much more authored/derived depth.

Current catalog: 18 fixed matchups.

Target:

- minimum useful target: 80–100 matchups
- preferred mature target: 120+ if quality remains high

Potential subject types:

- player careers
- individual seasons
- NFL coaches
- CFB coaches
- NFL team seasons
- CFB team seasons
- programs
- dynasties/eras
- offensive units
- defensive units
- possibly draft classes if a clean comparison contract is defined

A five-round run should consume a small fraction of the available catalog, not roughly one-quarter.

### Resume-row ownership

Where possible, resume facts should derive from the canonical factual-stat owner.

Do not permanently hard-code duplicated career facts into every matchup.

The matchup may still own:

- which two subjects are compared
- reveal order
- which facts are appropriate to reveal at each stage
- any carefully authored context that is not a raw statistic

The underlying objective facts should remain canonical.

---

## 13. Wavelength maturity target

Current Football Wavelength:

- 6 categories
- 54 authored clues

Current categories:

- NFL Legacy
- Gunslinger
- QB Carry Job
- Offensive Chaos
- Fanbase Insanity
- Program Tradition

Long-term target:

- approximately 300–500 approved items
- approximately 16–20 categories
- full use of the 1–100 scale
- strong category variety
- deterministic generation
- recent-item/target repetition protection
- category repetition penalty
- adaptive clue direction
- explicit calibration rubric

Potential categories:

- NFL Legacy
- College Legacy
- Gunslinger
- QB Carry Job
- System QB
- Draft Bust
- Clutch
- Choke Artist
- Coaching Genius
- Coaching Chaos
- Offensive Innovation
- Defensive Terror
- Program Tradition
- NFL Franchise Tradition
- Fanbase Insanity
- Rivalry Hatred
- Uniform Aura
- Stadium Atmosphere
- Football Weirdness
- Media / Personalities

Do not let the catalog become another 80–100-heavy all-star scale. Good Wavelength requires meaningful examples across the entire range, including very low, middle, high, and elite anchors.

---

## 14. Hit the Number — approved addition

Football should add Hit the Number.

It should inherit the mature UFC structure rather than launching as a shallow single-mode sum game.

Approved formats:

1. Classic
2. Themed Lineup
3. One From Each
4. Build the Team

The Football factual-stat foundation must exist first.

### Example NFL objectives

Potential metrics include:

- career passing yards
- career passing touchdowns
- career rushing yards
- career rushing touchdowns
- career receptions
- career receiving yards
- career receiving touchdowns
- sacks
- interceptions
- Pro Bowls
- first-team All-Pros
- MVPs
- playoff wins
- Super Bowl starts/wins
- 1,000-yard seasons
- 10-sack seasons
- 100-catch seasons

Examples:

**Classic**

Pick five quarterbacks and hit the target career passing-yard total.

**Themed Lineup**

Choose only former No. 1 picks and hit a passing-touchdown target.

**One From Each**

Fill QB / RB / WR / TE / DEF and hit a Pro Bowl target.

**Build the Team**

Fill role-based slots with category eligibility and optimize toward the target.

### Example college objectives

Potential metrics include:

- season passing/rushing/receiving yards
- season total touchdowns
- career wins as starter
- Heisman-season production
- conference titles
- national titles
- bowl/CFP wins
- scoring offense
- scoring defense
- draft picks produced
- first-round picks produced

### Quality gating

Port the UFC principle of enumerating/legal-checking candidate boards and rejecting weak target pools.

The game must produce meaningful:

- bust outcomes
- middle outcomes
- near-target outcomes
- high-end outcomes

Do not accept a generated pool merely because the math technically works.

---

## 15. Find the Leader — approved addition

Football should add Find the Leader.

Long-term target:

- approximately 80–100 question definitions
- 40+ underlying metrics
- both NFL and CFB
- multiple metric families
- competitive candidate construction

Potential NFL metric families:

- passing
- rushing
- receiving
- scoring
- sacks
- interceptions
- awards
- All-Pro/Pro Bowl recognition
- playoff performance
- Super Bowl performance
- longevity
- durability
- comeback/game-winning-drive metrics
- season thresholds
- career starts
- team/franchise records where appropriate

Potential CFB metric families:

- career/season passing production
- career/season rushing production
- career/season receiving production
- total touchdowns
- quarterback/team wins
- Heisman/major awards
- conference titles
- national titles
- bowl wins
- CFP wins
- scoring offense/defense
- program draft production
- first-round draft production
- coaching wins/titles

### Candidate-board rule

Do not construct a question by showing the global record holder plus random decoys.

Use the mature UFC concept:

- select a plausible/competitive leader
- surround that subject with the closest contenders
- add secondary support choices from the next band
- add a small number of farther wildcards

The real overall record holder does not always need to appear.

The point is to create a real knowledge/elimination decision, not a trivia giveaway.

---

## 16. Draft Room — defer, but preserve the concept

Draft Room is **not currently required** to make Football complete.

The priority is making the translated UFC games deep first.

If built later, Draft Room should be a genuinely Football-native mechanic, not Auction-lite and not Keep/Cut with a new skin.

Best current concept:

### Blind sequential roster draft

Example required slots:

- QB
- RB
- WR
- DEF
- FLEX

Flow:

- each round presents options
- player selects one
- that choice locks
- future options remain unknown
- positional scarcity and future-value uncertainty create the tension

Example decision:

Take Peyton Manning early, then later discover Patrick Mahomes after the QB slot is already committed.

Potential final grading can use the canonical Football comparison ratings.

Distinct mechanic roles:

- Blind Rank: ordering judgment
- Keep/Cut: resource/cutoff pressure
- Wavelength: calibration
- Blind Resume: hidden-comparison inference
- Hit the Number: optimization/math
- Find the Leader: knowledge/elimination
- Draft Room: roster construction + future-value uncertainty

Only revisit Draft Room after the six core Football games are deep. If a prototype feels like Keep/Cut or Auction, do not ship it merely to increase game count.

---

## 17. Visual roadmap

Headshots are not a current priority.

The existing Football visual owner already supports later upgrades without changing architecture.

Current strategy remains acceptable:

- players/coaches: representative team marks where no portrait exists
- college QBs: program marks
- programs: program logos
- team seasons: program/team logo with year in copy
- Wavelength: intentionally text-forward where appropriate

Content depth and gameplay quality are more valuable than building a large headshot library at this stage.

---

## 18. Replay and simulation standards

Football should eventually receive automated quality audits similar in spirit to mature UFC Play.

Required areas to simulate:

- board uniqueness
- eligible-pool coverage
- superstar appearance share
- middle-tier appearance share
- low-tier appearance share
- multi-low boards where intended
- category balance
- repeated matchup rate
- repeated Wavelength item/category rate
- Find Leader decoy competitiveness
- Hit the Number target quality
- Keep/Cut cutoff-gap difficulty
- Blind Resume catalog consumption/repeat risk

Use thousands of generated games where appropriate rather than approving randomness by inspecting a few hand-picked examples.

The final content audit should answer:

- Are the same famous subjects appearing too often?
- Are genuinely difficult middle decisions common?
- Is the low end recognizable rather than obscure filler?
- Are boards mostly unique?
- Does each game expose a broad share of its canonical pool?
- Are NFL and CFB both represented enough?
- Are objective games actually objective?
- Are subjective categories calibrated instead of masquerading as fact?

---

## 19. Approved implementation sequence

The current approved sequence is approximately ten focused PRs.

Each PR should follow the repository standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

### PR1 — Football Content Contract + rating-band standard

Purpose:

- establish this roadmap as the contract
- formalize rating-category methodology and evidence/versioning expectations
- lock factual vs comparative vs subjective ownership boundaries
- add/adjust tests only where necessary to protect the contract

Do not expand hundreds of subjects before the contract exists.

### PR2 — NFL rating depth I

Purpose:

- deepen NFL comparison pools
- add genuine middle/low/bad recognizable content

Likely focus:

- QBs
- RBs
- WRs
- coaches

Do not merely add more stars.

### PR3 — NFL/CFB rating depth II

Purpose:

- add broader comparison contracts/pools

Likely focus:

- NFL team seasons
- QB seasons
- defensive careers
- CFB coaches
- programs/eras
- CFB team seasons
- additional position/season groups

### PR4 — Blind Rank + Keep/Cut generation maturity

Purpose:

- port mature board-shape philosophy to the deeper Football pools
- add simulation tests for difficulty, tier use, repetition, and subject exposure

### PR5 — Football factual-stat foundation

Purpose:

- create one canonical verified factual owner
- define source/evidence expectations
- support future objective games without duplicate fact catalogs

### PR6 — Blind Resume expansion

Purpose:

- expand toward 80–100+ quality matchups
- broaden subject types
- derive objective resume facts from the factual owner where possible
- preserve staged reveal and one-choice-per-round mechanic

### PR7 — Wavelength expansion/calibration

Purpose:

- expand toward 300–500 items / 16–20 categories
- enforce scale distribution and repetition controls
- preserve one universal hidden 1–100 target

### PR8 — Hit the Number

Purpose:

- add all four mature formats
- use the factual owner
- add pool-quality gating
- support meaningful NFL and CFB objectives

### PR9 — Find the Leader

Purpose:

- add deep NFL + CFB question catalog
- target 80–100 questions / 40+ metrics
- use competitive leader/decoy construction
- add family/repetition controls

### PR10 — Football content simulation / replay audit

Purpose:

- run large-scale generated-game audits across all Football modes
- tune content distribution and overexposure
- verify replay depth and difficulty
- identify any remaining shallow category before broader expansion

After PR10, reassess:

- whether headshots materially improve the product
- whether Draft Room is still distinct enough to deserve implementation
- whether another Football-native mechanic is stronger than Draft Room

---

## 20. What not to do

Do not:

- permanently hard-code the current 90-subject count
- expand by adding only more famous elite players
- create a second Football rating provider
- create separate rating truths for Blind Rank and Keep/Cut
- hard-code duplicate factual rows into every game when one factual owner can supply them
- mix career ratings with season ratings without an explicit cross-type contract
- treat uniforms, atmosphere, or "aura" as objective comparative truth
- create NFL-only and CFB-only architectures when the same Football owner can support both
- add headshot infrastructure outside the existing Football visual owner
- build Draft Room simply to increase the number of visible games
- turn Wavelength into opposing archetype scales; it remains one universal hidden 1–100 number
- reduce Blind Resume to careers only; seasons, teams, programs, coaches, eras, and other valid comparison subjects are encouraged
- make low-end content obscure just to manufacture low ratings

---

## 21. Definition of mature Football

Football should be considered content-mature when:

- Blind Rank and Keep/Cut regularly produce hard, varied boards across genuine tiers.
- The comparison universe is deep enough that star repetition is not noticeable.
- Blind Resume has enough quality matchups that a normal run reveals only a small fraction of the catalog.
- Wavelength spans hundreds of calibrated items and makes meaningful use of the full 1–100 scale.
- Hit the Number supports all four formats with objective NFL/CFB data and strong generated-pool quality.
- Find the Leader has broad metric depth and competitive candidate boards rather than obvious record-holder trivia.
- Ratings are explainable through versioned category rubrics and evidence.
- Objective facts come from one canonical factual owner.
- Subjective categories are clearly treated as calibrated opinion.
- Large simulation audits prove variety, difficulty, and broad subject exposure.

The goal is not merely for Football to have the same number of games as UFC.

The goal is for Football to have the **same depth standard** as mature UFC Play while preserving a distinct Football identity.
