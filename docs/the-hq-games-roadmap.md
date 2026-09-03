# The HQ Games Roadmap

**Status:** Canonical product and implementation roadmap for UFC + Football Games  
**Created:** September 3, 2026  
**Baseline main:** `d0397b9f79ada499b30a6fcde39ca473c1adc610`  
**Scope:** Play landing pages, shared game presentation, UFC games, Football games, Today's Challenge, 20 Questions, Who Am I, Auction, Draft Room, game-source ownership, and release readiness.

> **Cross-chat rule:** Read this document before changing UFC Play, Football Play, any shared game mechanic, Today's Challenge, Auction, Draft Room, Blind Rank 5, Keep 4 / Cut 4, 20 Questions, Who Am I, or the data/ranking sources consumed by Games.
>
> **Conflict rule:** This document supersedes product direction in `docs/play-games-roadmap.md` and `docs/football-games-roadmap.md` wherever they conflict with this roadmap. Those older files remain useful historical/technical context, but this file is the current decision owner.
>
> **Working rule:** One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

---

## 1. Why this roadmap exists

The Games product has accumulated a lot of good work, but UFC and Football have evolved through separate passes. That created three kinds of drift:

1. the UFC and Football versions of the same game do not always look or behave like the same product;
2. Football data/ranking work has expanded faster than the Games layer has been rewired to consume the newest canonical sources;
3. older roadmaps still describe product decisions that are no longer approved, especially the hidden Back Room model, standalone Blind Rank / Keep-Cut positioning, and a deferred Football Draft Room.

The purpose of this roadmap is to finish Games as one coherent The HQ product without forcing UFC and Football to share an engine when that would make ownership worse.

The end state is:

- one recognizable Play product across UFC and Football;
- seven visible game experiences per sport;
- the same visual and interaction language across sport versions of the same game;
- game-specific data eligibility instead of waiting for every Football subject to be fully ranked/researched;
- no stale or duplicate factual/ranking source paths;
- Blind Rank 5 and Keep 4 / Cut 4 preserved for Today's Challenge, but removed from the normal All Games library;
- 20 Questions and Who Am I added as replayable games;
- Football receives a Football-native version of Auction called **Draft Room**;
- Today's Challenge remains competitive, versioned, deterministic, and cross-device;
- the exact production deployment SHA is verified before the roadmap is considered complete.

---

## 2. Product model — LOCKED

### 2.1 One app, two sport contexts

The HQ universal app roadmap remains authoritative for shell/navigation ownership:

- Home is universal.
- Picks and Play are sport-specific.
- UFC and Football are the active sport contexts.
- UFC uses the UFC contextual treatment.
- Football uses the Football contextual treatment.

Games should feel like the same product under either sport selector.

### 2.2 Same look does not require the same route or engine

The requirement is **presentation and interaction parity**, not forced code unification.

UFC and Football may keep separate routes, engines, repositories, or data adapters when their underlying ownership genuinely differs.

Do **not** merge code merely for symmetry if doing so would create:

- a second data owner;
- conditional spaghetti around two unrelated data models;
- duplicate fallback paths;
- ambiguous backend ownership;
- harder testing.

Use shared components/contracts when they create real ownership clarity. Keep separate implementations when that is cleaner.

The user-visible result should still be unmistakably one family of games.

---

## 3. Final visible game library — LOCKED

### UFC Play

1. Find the Leader
2. Wavelength
3. Blind Resume
4. Hit the Number
5. 20 Questions
6. Who Am I?
7. Auction

### Football Play

1. Find the Leader
2. Wavelength
3. Blind Resume
4. Hit the Number
5. 20 Questions
6. Who Am I?
7. Draft Room

### Removed from the normal All Games library

- Blind Rank 5
- Keep 4 / Cut 4

These are **not deleted**. They remain owned, scored game mechanics because the competitive Daily context is what makes them fun.

### Better Than

Better Than may remain available as a direct profile/challenge utility where its current challenge flow is useful, but it is not part of the seven-game All Games product and is not a Today's Challenge format.

---

## 4. Today's Challenge product role — LOCKED

Today's Challenge is the competitive daily layer, not a duplicate of the All Games library.

### Blind Rank + Keep/Cut

Blind Rank 5 and Keep 4 / Cut 4 remain together as the existing **Daily Double** concept:

- Part 1: Blind Rank 5
- Part 2: Keep 4 / Cut 4
- both parts must be completed;
- both component scores contribute equally to one official Daily score;
- the official result remains versioned and immutable after the first completed attempt.

They should not need visible standalone All Games cards to remain part of the Daily system.

### Final daily-capable game families

The Daily owner should be capable of scheduling:

- Find the Leader
- Wavelength
- Blind Resume
- Hit the Number
- Daily Double: Blind Rank 5 + Keep 4 / Cut 4
- 20 Questions, after score-distribution testing proves it fair
- Who Am I?, after score-distribution testing proves it fair

Auction and Draft Room do not enter Today's Challenge.

Better Than does not enter Today's Challenge.

### Rotation weights

Do not lock final weights yet.

The old 40/15/25/10/10 UFC schedule was approved for an older five-format product. The final schedule must be recalibrated only after the two new games and Hit the Number have real simulation data.

The final schedule must still be:

- deterministic;
- versioned;
- Central-time day based;
- same exact setup for every player within one sport/day;
- no silent second scheduler or fallback path;
- no consecutive same-format days unless explicitly approved by the final schedule contract.

---

## 5. Visual parity contract — LOCKED

UFC and Football Games do not need identical art, but they should use the same product language.

### 5.1 Play landing pages

UFC Play and Football Play should use the same hierarchy:

1. sport/section context
2. Today's Challenge hero/status
3. All Games
4. game cards in the same common-game order
5. sport-native strategic challenge last: Auction / Draft Room
6. consistent Challenge/leaderboard/history treatment where relevant

The two landing pages should share:

- card proportions and density;
- typography hierarchy;
- section spacing;
- status-chip language;
- CTA treatment;
- completed/in-progress states;
- Daily hero structure;
- empty/loading/error presentation.

Differences are allowed for:

- UFC fighter photos versus Football marks/headshots;
- unavoidable subject-name lengths;
- sport theme accent;
- sport-native copy;
- mechanics that genuinely require different board geometry.

### 5.2 Game pages

Corresponding UFC/Football games should align on:

- back navigation treatment;
- game title/eyebrow placement;
- instructions/objective placement;
- score/status area;
- primary action position;
- replay/new-board control;
- challenge control where eligible;
- reveal/result hierarchy;
- All Games return action;
- mobile spacing and tap targets;
- loading/error/empty states.

### 5.3 Sport theming

Follow the universal app theme contract:

- UFC contextual accent = red
- Football contextual accent = navy `#1F4E79`
- team/program colors may take over where the team/program itself is the content subject

Do not create a second Football design system.

### 5.4 Code-sharing rule

Shared presentational primitives are encouraged where they remove visual drift.

Shared routes or shared game engines are **not** mandatory.

The test is not "is this one component?" The test is "can these two surfaces drift without a parity test failing?"

---

## 6. Canonical source contract — LOCKED

The biggest technical requirement of this roadmap is that every game consumes the right owner.

### 6.1 General rule

A game never invents a fact, ranking, rating, or subject universe merely because it needs more content.

Every playable subject must pass the eligibility contract for the mechanic being played.

Incomplete subjects are excluded from that mechanic until they have enough canonical evidence. They are not filled with guesses, stale hard-coded fallback values, or a second provider.

### 6.2 Football factual ownership

Objective Football facts must come through the existing canonical Football factual registry/facade and its approved generated evidence.

Factual games include:

- Find the Leader
- Hit the Number
- 20 Questions yes/no predicates
- Who Am I clue facts
- factual reveal rows inside Blind Resume
- objective Draft Room mode facts where applicable

Do not create game-specific copies of career yards, touchdowns, awards, titles, seasons, team records, etc. when the canonical factual owner can supply them.

### 6.3 Football comparison ownership

Comparative greatness judgments must come through the canonical Football comparison/ranking authority after PR 2 resolves the remaining ownership split.

This includes:

- Blind Resume winners
- Blind Rank 5 grading
- Keep 4 / Cut 4 grading
- Draft Room final collection/player grading where greatness/category ratings are used

The existing legacy reviewed Rank Five packs may remain calibration/evidence inputs where the canonical comparison owner intentionally consumes them. A game must not bypass the canonical comparison path and treat a legacy pack as an independent competing truth.

### 6.4 UFC factual ownership

Objective UFC facts continue through the established UFC factual/stat owners already used by mature Play games.

Do not duplicate UFC Stats facts into new 20 Questions or Who Am I catalogs when they can be derived from the existing owner.

### 6.5 UFC comparison ownership

Comparative UFC games continue to use the existing calculated ranking/category-rating owners and approved Play-only rating owner where applicable.

Do not manually enter GOAT ranks, OVRs, totals, or category scores for Games.

### 6.6 Subject identity

A real-world subject should have one stable identity per canonical universe.

Games may own mechanic-specific metadata such as:

- clue strength;
- reveal order;
- question wording;
- board archetype;
- category eligibility;
- repetition history.

They should not own duplicate copies of the underlying real-world identity/facts unless a historical snapshot/version boundary explicitly requires it.

---

## 7. Eligibility, not total-universe completeness — LOCKED

Games are not blocked until every recognizable Football player has a complete statistical/ranking record.

Each mechanic declares what it needs.

Examples:

### Find the Leader

A subject is eligible only if the selected objective metric has a trustworthy canonical value.

### Hit the Number

A subject is eligible only if the selected objective metric and all theme/slot predicates are trustworthy.

### Blind Resume

A matchup is eligible only when:

- both subjects have enough reveal evidence;
- the comparison contract legitimately compares them;
- the canonical comparison owner can defend the winner/tie handling.

### Blind Rank / Keep-Cut

A subject is eligible only when the selected comparison category has a canonical rating/tier under the correct contract.

### 20 Questions

A hidden subject is eligible only when the game has enough reliable boolean predicates to support a real 20-question investigation.

### Who Am I

A hidden subject is eligible only when the game can produce enough reliable clues across multiple strength bands without resorting to weak or ambiguous facts.

### Draft Room

A nomination is eligible only when the mode can score/grade it through the canonical Football owner for that mode.

The correct response to missing evidence is **exclude from that mechanic**, not "research the entire football universe before Games can ship."

---

## 8. Existing shared games — required rebuild standard

Every existing shared game gets one focused parity/source PR.

The goal is not to discard good mature work. It is to keep the mature mechanic while making UFC/Football presentation and source usage consistent.

### 8.1 Find the Leader

Keep:

- elimination mechanic;
- competitive ten-subject board;
- objective factual ownership;
- daily/replay/challenge identity where supported;
- full reveal after completion.

Required finish work:

- UFC/Football visual parity;
- source audit;
- Football questions must resolve through canonical factual owners only;
- consistent result/replay/challenge controls;
- consistent Daily presentation;
- competitive decoy quality and repetition simulation.

### 8.2 Wavelength

Keep:

- one hidden 1–100 value;
- four adaptive clues;
- deterministic/versioned item selection;
- calibrated subjective categories.

Required finish work:

- UFC/Football visual parity;
- same clue/guess/result interaction language;
- one documented calibration contract per catalog;
- no pseudo-objective claim where the value is opinion;
- full-scale distribution and repetition tests;
- private official Daily answers until reveal.

### 8.3 Blind Resume

Keep:

- hidden identities;
- staged evidence reveal;
- five decision rhythm unless a later narrow mechanic test proves a better count;
- objective factual reveal rows where possible;
- canonical comparison winner ownership.

Required finish work:

- UFC/Football visual parity;
- remove stale source paths that bypass the current comparison authority;
- Football season/career/team/program/coach semantics must use the correct contract rather than sharing a misleading category label;
- matchup eligibility must fail closed when evidence is insufficient;
- no manual second winner table.

### 8.4 Hit the Number

Keep:

- factual targets;
- replayable board generation;
- meaningful bust/middle/near-target outcomes;
- NFL/CFB breadth in Football;
- mature format depth where already supported.

Required finish work:

- UFC/Football visual parity;
- canonical factual source audit;
- consistent target/selection/result presentation;
- legal-board quality gating;
- no shallow technically-solvable boards that are not fun.

---

## 9. Blind Rank 5 + Keep 4 / Cut 4 — new product role

These mechanics remain real games internally, but their public product role changes.

### 9.1 Remove normal library placement

Remove their normal All Games cards in UFC and Football.

Do not delete the engines, graders, historical results, challenge hydration, or Daily support.

Old direct routes may remain internally routable when required for historical/deep-link compatibility, but they should not function as competing public game-library owners.

### 9.2 Daily Double remains

The Daily Double is the preferred home for these two mechanics.

It should preserve:

- exact versioned setup;
- Part 1 then Part 2 flow;
- no official completion until both parts finish;
- equal component weighting unless explicitly changed by a future scoring contract;
- one normalized official result;
- immutable first completed attempt;
- historical version stability.

### 9.3 Football parity

Football should receive the same Daily Double product role when its official Daily owner is ready.

The underlying Football grading must use the canonical Football comparison authority, not a stale direct legacy pack.

---

## 10. 20 Questions — LOCKED mechanic

20 Questions becomes a normal replayable game for both UFC and Football.

It may also enter Today's Challenge after score simulation proves a fair official contract.

### 10.1 Core loop

- The game selects one hidden eligible subject.
- The player may ask up to 20 yes/no questions.
- Questions come from a curated/versioned question bank.
- The player may guess the identity at any time.
- Wrong identity guesses carry a meaningful score penalty.
- Earlier correct identification scores better.
- The round ends on a correct guess, exhausted question limit, or approved terminal state.

### 10.2 No narrowing assistance

The game must **not** show:

- remaining candidate count;
- candidate list;
- eliminated candidates;
- probability meter;
- "you narrowed it to X" feedback;
- dynamic hints based on what the engine knows remains possible.

The player is responsible for narrowing the universe mentally.

The full question bank remains available throughout the round except that an already-asked exact question may be marked/disabled to prevent duplicate use.

### 10.3 Answer ownership

Answers are not runtime LLM judgments.

Every yes/no question maps to a deterministic predicate against canonical identity/factual data.

Examples:

Football:

- Did this player play quarterback?
- Did this player win an NFL MVP?
- Did this player play in the SEC?
- Was this player a first-round pick?
- Did this player win a national championship?

UFC:

- Was this fighter a UFC champion?
- Did this fighter compete at lightweight?
- Did this fighter fight for the UFC after 2020?
- Did this fighter win by UFC submission?

Questions that cannot be answered reliably from the canonical evidence do not belong in the bank.

### 10.4 Football modes

Football should support clear universe selection such as:

- NFL
- College Football
- Mixed Football, only if the question contract remains understandable

Do not create separate factual providers for those modes.

### 10.5 Scoring

The exact formula is implemented/tested in the 20 Questions PR, but must reward:

- fewer questions;
- correct early guesses;
- no/limited wrong identity guesses.

It must not reward access to hidden narrowing information because none is shown.

---

## 11. Who Am I? — LOCKED mechanic

Who Am I becomes a normal replayable game for both UFC and Football.

It may also enter Today's Challenge after score simulation proves a fair official contract.

### 11.1 Core loop

- Select one hidden eligible subject.
- Reveal clues progressively.
- The player may guess at each reveal boundary.
- Earlier correct guesses earn a better score.
- Wrong guesses apply a meaningful penalty.
- A failed round eventually reveals the answer and full clue set.

### 11.2 Reveal cadence

Preferred first implementation:

- up to 10 clues;
- reveal two clues at a time;
- five guess windows.

This may be tuned only if playtesting proves another cadence materially better.

### 11.3 Clue-strength bands

Do not randomize ten clues with no difficulty control.

Every clue belongs to a strength band such as:

- Broad
- Helpful
- Strong
- Near-giveaway

Each run chooses a deterministic/randomized combination within the approved strength progression so replay does not always use the exact same clues/order, but the game also does not accidentally reveal the answer immediately.

### 11.4 Source rule

Who Am I clues derive from canonical identity/factual evidence.

The game may own clue phrasing and clue-strength metadata, but not a competing factual truth database.

### 11.5 Clue safety/quality

Prefer objective sport facts such as:

- positions/divisions;
- teams/programs;
- championships/awards;
- opponents;
- jersey numbers where historically reliable;
- career thresholds;
- draft status;
- notable factual achievements.

Do not use race/ethnicity/appearance classification as a clue category.

Physical measurements such as height may be used only when the canonical source is reliable and copy makes normal measurement variance clear, e.g. "listed around 6'4\"" rather than claiming impossible precision.

---

## 12. UFC Auction — preserved flagship strategic game

Auction remains the UFC sport-native strategic challenge.

Keep its existing canonical backend/repository ownership unless the Draft Room implementation proves a narrow reusable abstraction can be extracted without creating a second owner.

Auction remains:

- visible in UFC All Games;
- head-to-head/direct challenge oriented;
- sealed-bid;
- bankroll constrained;
- server-owned/private where required;
- outside Today's Challenge.

The final parity audit should ensure its landing card, challenge entry, status language, and result hierarchy fit the same Play design system as the other games.

---

## 13. Football Draft Room — LOCKED direction

Football receives a sport-native version of Auction called **Draft Room**.

The player-facing name is Draft Room even if the backend safely reuses/extents generic Auction ownership underneath.

### 13.1 Core mechanic

Draft Room uses the same strategic idea as UFC Auction:

- two players;
- sealed bids;
- fixed starting bankroll;
- one nomination/item at a time;
- round winner pays the charged amount;
- awarded assets fill a collection/build;
- final collections are graded;
- higher final score wins, with true tie support;
- challenge/rematch/history use existing canonical challenge/backend patterns rather than a Football-only parallel system.

### 13.2 Launch priority

The most important Football mode is **Build a Football Player**.

Do not delay Draft Room waiting for a giant library of novelty auction modes.

Launch the engine with **Build a QB** first, prove the model, then expand positions and themed rooms.

### 13.3 Position builders

Approved position targets:

#### Build a QB

- Arm
- Accuracy
- Processing
- Mobility
- Clutch

#### Build a Running Back

- Vision
- Power
- Elusiveness
- Speed
- Receiving

#### Build a Wide Receiver

- Routes
- Hands
- Speed
- YAC
- Contested Catch

#### Build a DE / EDGE

- Pass Rush
- Power
- Get-Off
- Run Defense
- Motor

#### Build a Cornerback

- Coverage
- Ball Skills
- Speed
- Physicality
- Technique

#### Build a Safety

- Coverage
- Range
- Tackling
- Ball Skills
- Instincts

#### Build a Linebacker

- Run Defense
- Coverage
- Tackling
- Blitzing
- Instincts

These names are the approved first contracts but may be refined during the focused position-builder PR if the canonical ranking inputs support a clearer football term.

### 13.4 Trait-source rule

Do not manually type a second set of Draft Room player grades.

A trait score must derive from the canonical Football ranking/category inputs or an explicitly approved canonical position-rating model.

If a required trait does not exist canonically, add/derive it in the canonical ranking owner first rather than embedding a private Draft Room rating table.

### 13.5 Pool texture

Draft Room should not nominate only stars.

Every healthy mode needs recognizable texture across:

- superstars;
- stars;
- good starters;
- specialists;
- flawed/mid players;
- lower-end but recognizable players.

The bankroll game becomes fun when a player sometimes has to decide whether to overpay for an elite trait now or risk filling a later slot with a merely adequate player.

Simulation must measure superstar overexposure and middle/lower-tier appearance share.

### 13.6 Initial themed collection rooms

After position builders are proven, add a limited first group:

- Cowboys Since 2000
- Longhorns Since 2000
- Build the Best QB / RB / WR Trio
- Build the Best Secondary

Potential later backlog, not required for initial completion:

- Super Bowl teams/performances
- Best skill weapons
- Best offensive line
- Best front seven
- Cowboys offense/defense variants
- Longhorns offense/defense variants
- era-specific NFL/CFB rooms

Do not create a large category count merely to match UFC Auction's mode count.

---

## 14. Data/versioning rules for new games

### 14.1 Generated content is output, not truth

A generated clue/question/index may be materialized for performance, but its source identity and underlying facts remain traceable to the canonical owner.

### 14.2 Historical results remain stable

Changes to:

- ranking methodology;
- factual corrections;
- clue wording;
- question predicates;
- board generation;
- Daily scoring;
- Draft Room grading

must create a new content/methodology version where needed.

Previously completed official results do not silently change.

### 14.3 Fail closed

If a canonical source cannot answer a required question/clue/metric with sufficient confidence:

- exclude that subject/question from the eligible pool;
- surface a build/test failure when the expected depth drops below the approved floor;
- do not substitute an unreviewed fallback.

---

## 15. Quality and simulation standard

Do not approve random game generation by looking at five hand-picked examples.

Each mechanic should have deterministic large-sample tests appropriate to its generator.

Measure where applicable:

- board uniqueness;
- subject exposure;
- superstar share;
- middle/lower-tier share;
- NFL/CFB balance;
- category balance;
- repeated subject rate;
- repeated exact-board/matchup rate;
- stale source usage;
- missing-evidence exclusion;
- score distribution;
- Daily fairness;
- mobile layout parity;
- challenge hydration stability;
- historical-version stability.

Game-specific checks:

### Find the Leader

- leader/decoy competitiveness;
- objective metric source provenance;
- no impossible/ambiguous ties unless tie behavior is defined.

### Wavelength

- use of the full 1–100 scale;
- category repetition;
- clue direction quality;
- rating calibration consistency.

### Blind Resume

- matchup closeness distribution;
- evidence dimension completeness;
- winner-source provenance;
- no mixed-contract comparisons.

### Hit the Number

- solvable/legal boards;
- bust/middle/near-target variety;
- theme/slot eligibility correctness.

### Daily Double

- board archetype/cutoff difficulty;
- canonical grading source;
- component and combined score distribution.

### 20 Questions

- deterministic predicate truth;
- enough usable questions per subject;
- score distribution by question count/wrong guesses;
- no hidden candidate-narrowing UI.

### Who Am I

- clue strength progression;
- giveaway timing;
- repeated clue rate;
- enough clue variety per subject;
- score distribution by reveal window.

### Draft Room

- nomination diversity;
- tier/quality distribution;
- bankroll pressure;
- category completion legality;
- deterministic final grading;
- rematch/challenge lifecycle integrity.

---

# 16. Implementation roadmap — 15 PRs total

The complete roadmap is **15 focused PRs including this documentation PR**.

After PR 1 merges, **14 implementation PRs remain**.

Every PR must:

1. resolve current `main` before creating the branch;
2. preserve the current canonical owner unless the PR explicitly replaces it;
3. make one narrow product change;
4. add focused tests;
5. require the exact final head to pass typecheck, the full test suite, and the production build;
6. require relevant backend verification to be genuinely green;
7. deploy through the canonical GitHub Actions deployment owner when live testing is needed;
8. verify the exact live SHA before claiming production completion.

If a planned PR becomes too large, split it rather than expanding its purpose. If the PR count changes, update this roadmap in the same planning decision so future chats do not drift.

---

## PR 1 — Canonical Games roadmap

**Purpose:** Establish this file as the current product/implementation decision owner.

Scope:

- add `docs/the-hq-games-roadmap.md`;
- document current decisions;
- establish the 15-PR sequence;
- no runtime changes.

Exit:

- roadmap is on `main`;
- future chats have one authoritative Games planning file.

---

## PR 2 — Game source authority + eligibility repair

**Purpose:** Make the data/ranking path trustworthy before touching individual games.

Scope:

- audit every current UFC/Football game against its canonical factual/comparison owner;
- resolve the known Football comparison-owner split so games do not directly consume stale legacy packs as competing truth;
- define one explicit eligibility contract per mechanic;
- add source-provenance/eligibility tests;
- preserve current output where it is already correct;
- no visual redesign yet;
- no broad data expansion merely to reach 100% universe coverage.

Key proof:

- factual games cannot read comparative/manual ratings as factual truth;
- comparative games cannot bypass the canonical rating authority;
- incomplete subjects fail closed and are excluded;
- no new duplicate provider is introduced.

---

## PR 3 — Play landing-page + shared presentation parity

**Purpose:** Make UFC Play and Football Play visibly one product before game-by-game rewrites.

Scope:

- align UFC/Football Play landing hierarchy;
- establish shared presentation primitives/contracts where useful;
- align Daily hero, All Games section, game cards, statuses, CTA language, spacing, loading/error states;
- apply UFC red / Football navy contextual theming;
- update visible game catalog direction so Blind Rank/Keep-Cut are prepared for removal and new games have reserved product slots only when implemented;
- do not force route/engine unification.

Key proof:

- parity tests prevent easy visual/product drift;
- phone review shows equivalent hierarchy in UFC and Football.

---

## PR 4 — Find the Leader final parity/source pass

**Purpose:** Finish Find the Leader as one mature UFC/Football game family.

Scope:

- align presentation and controls;
- verify canonical factual sources;
- preserve mature board-generation behavior;
- align result/replay/challenge/Daily treatment;
- add cross-sport parity and source tests;
- tune only proven quality gaps.

Do not add unrelated Football ranking work.

---

## PR 5 — Wavelength final parity/calibration pass

**Purpose:** Finish Wavelength across both sports.

Scope:

- align interaction/presentation;
- validate catalog ownership/versioning;
- preserve one hidden 1–100 target and adaptive clue flow;
- verify scale distribution/repetition controls;
- keep official Daily answers private until reveal;
- add cross-sport parity and calibration tests.

---

## PR 6 — Blind Resume final parity/source pass

**Purpose:** Finish the strongest hidden-comparison mechanic on the correct ranking/factual sources.

Scope:

- align UFC/Football presentation;
- remove stale direct comparison-owner paths;
- make Football contract semantics explicit for career/season/team/program/coach comparisons;
- derive factual reveal rows from canonical facts where possible;
- enforce matchup eligibility;
- preserve staged reveal and challenge/replay behavior;
- add winner-provenance and contract tests.

---

## PR 7 — Hit the Number final parity/source pass

**Purpose:** Finish Hit the Number as a deep objective game in both sports.

Scope:

- align presentation;
- verify canonical factual sources;
- preserve/finish mature format support;
- enforce legal/interesting generated boards;
- align result/replay/challenge behavior;
- add large deterministic board-quality tests.

---

## PR 8 — Blind Rank + Keep/Cut Daily-only role cleanup

**Purpose:** Move these mechanics to the product role Cody actually enjoys.

Scope:

- remove Blind Rank 5 and Keep 4 / Cut 4 from normal UFC and Football All Games listings;
- preserve engines, graders, historical hydration, and compatible deep links;
- preserve UFC Daily Double behavior;
- make Football Daily Double use the same product contract when its Daily projection is available;
- ensure canonical comparison owners grade both sports;
- align Daily Double presentation across sports;
- do not delete historical data.

Key proof:

- they disappear from normal library discovery;
- Daily Double remains fully playable/gradeable;
- old results still render.

---

## PR 9 — 20 Questions

**Purpose:** Launch the first new replayable game across UFC and Football.

Scope:

- implement one 20-question mechanic contract;
- support UFC and Football sport adapters/sources;
- curated deterministic yes/no predicate bank;
- guess-anytime flow;
- wrong-guess penalty and score contract;
- no candidate count/list/elimination assistance;
- Football NFL/CFB universe selection where appropriate;
- replay/challenge capability only where the existing challenge architecture cleanly supports it;
- add source-truth, question-depth, scoring, repetition, and UI tests.

Daily integration is not activated here; the score is only made Daily-ready.

---

## PR 10 — Who Am I?

**Purpose:** Launch progressive identity clues across UFC and Football.

Scope:

- implement up to 10 clues, two-at-a-time reveal cadence;
- clue strength bands;
- canonical factual/identity source derivation;
- randomized/deterministic variation within difficulty progression;
- guess-anytime-at-boundary flow;
- wrong-guess penalty and score contract;
- no race/ethnicity/appearance classification clues;
- add clue-depth, giveaway-timing, source-provenance, scoring, repetition, and UI tests.

Daily integration is not activated here; the score is only made Daily-ready.

---

## PR 11 — Today's Challenge vNext

**Purpose:** Make the Daily product reflect the finished game lineup instead of the old five-format roadmap.

Scope:

- keep one canonical sport-scoped Daily scheduler/projection owner;
- preserve immutable first completed attempt;
- preserve cross-device Supabase ownership;
- preserve official 0–100 normalization and native result display where useful;
- include Find the Leader, Wavelength, Blind Resume, Hit the Number, and Daily Double;
- admit 20 Questions and Who Am I only if their simulation data meets the fairness floor;
- recalibrate deterministic rotation weights from real score/replay data;
- prevent consecutive same-format days if retained by final contract;
- align UFC/Football Daily hero, standings, history, streak, reminder, and result presentation;
- do not add Auction, Draft Room, or Better Than.

This PR owns schedule/competition integration, not game-engine redesign.

---

## PR 12 — Draft Room foundation + Build a QB

**Purpose:** Launch the Football-native strategic game without waiting for a giant mode catalog.

Scope:

- audit current Auction backend/repository for safe extension;
- reuse/genericize existing canonical challenge/backend ownership where appropriate rather than creating a second sealed-bid system;
- add Football-facing Draft Room route/surface;
- preserve sealed bids, bankroll, round resolution, collection comparison, final score, tie, rematch, challenge lifecycle;
- launch **Build a QB** with five approved traits;
- derive trait grading from canonical Football ranking/category owners;
- create a deep recognizable nomination pool with deliberate middle/lower texture;
- add backend verification, challenge-lifecycle tests, scoring proofs, nomination-distribution tests, and mobile review.

---

## PR 13 — Draft Room position builders

**Purpose:** Expand the strongest Draft Room mechanic after Build a QB proves the architecture.

Scope:

Add:

- Build a Running Back
- Build a Wide Receiver
- Build a DE / EDGE
- Build a Cornerback
- Build a Safety
- Build a Linebacker

For each:

- five explicit trait slots;
- canonical trait source;
- legal completion rules;
- recognizable broad-quality nomination pool;
- deterministic grading;
- no private duplicate manual rating table.

Keep this PR to position builders only.

---

## PR 14 — Draft Room themed collection rooms

**Purpose:** Add a small number of Football-native collection modes after player builders are mature.

Initial scope:

- Cowboys Since 2000
- Longhorns Since 2000
- Best QB / RB / WR Trio
- Best Secondary

Requirements:

- each mode has a clear collection/scoring contract;
- nominees include real middle/lower choices, not only legends;
- facts/ratings come from canonical owners;
- challenge lifecycle remains the same Draft Room owner;
- no large mode-count expansion for vanity.

Later Super Bowl/era/unit rooms remain backlog unless Cody explicitly promotes them.

---

## PR 15 — Full Games maturity audit + production release proof

**Purpose:** Prove the complete Games product instead of assuming all prior merges compose correctly.

Scope:

- large deterministic simulations across every replayable game and Daily format;
- source-provenance audit showing every game reads the intended owner;
- UFC/Football landing-page parity audit;
- game-page parity audit;
- phone/mobile interaction review;
- old deep-link/history compatibility review;
- Daily score-distribution/rotation review;
- challenge hydration/rematch audit;
- Draft Room bankroll/nomination/scoring audit;
- verify Blind Rank/Keep-Cut are Daily-only in normal discovery;
- verify 20 Questions exposes no narrowing assistance;
- verify Who Am I clue progression does not routinely give away answers too early;
- remove the Football Games Early Access/Beta treatment only if all completion gates are green;
- require exact-head typecheck, full test suite, production build, and genuine backend verification;
- deploy through canonical GitHub Actions owners;
- verify the exact production deployment SHA matches the intended commit.

This PR should be tuning/proof only. Any material engine defect discovered here gets its own focused repair PR rather than being buried in the release proof.

---

# 17. Dependency map

The intended order is deliberate.

- PR 2 must precede all source-sensitive game work.
- PR 3 establishes the visual contract before individual parity PRs.
- PRs 4–8 finish existing mechanics before adding new Games.
- PRs 9–10 launch the new replayable games before Daily rotation is recalibrated.
- PR 11 finalizes the Daily product before the independent Draft Room expansion.
- PR 12 proves one Football sealed-bid/player-builder mode before PR 13 multiplies position contracts.
- PR 14 adds themed collection rooms only after the Draft Room architecture is proven.
- PR 15 is the final composition/release proof.

Draft Room PRs may proceed after PR 3 in parallel only if current main stays green and no shared owner is being modified concurrently. Default to the documented sequence to reduce merge drift.

---

# 18. Explicit non-goals

Do not:

- wait for every Football player to have complete rankings/stats before finishing Games;
- manually fill missing ratings merely to increase game eligibility;
- create a second Football factual provider;
- create a second Football comparison provider;
- create a second UFC ranking truth for Games;
- force UFC and Football onto one route/engine merely for symmetry;
- allow UFC and Football versions of the same game to visually drift;
- keep Blind Rank/Keep-Cut in All Games just because routes already exist;
- delete Blind Rank/Keep-Cut engines/history when removing library cards;
- show candidate counts/lists in 20 Questions;
- let runtime AI decide yes/no truth in 20 Questions;
- generate Who Am I clues from unsupported trivia;
- use race/ethnicity as Who Am I clue taxonomy;
- create Draft Room-only manual player trait grades;
- build 14 Football Draft Room modes simply because UFC Auction has many modes;
- add Auction/Draft Room to Today's Challenge;
- add Better Than to Today's Challenge;
- add a second Daily scheduler, history store, leaderboard owner, reminder owner, or score repository;
- claim the roadmap is complete because code merged without verifying the live deployment SHA.

---

# 19. Definition of the full Games experience

This roadmap is complete only when all of the following are true in production:

### Product

- UFC Play and Football Play visibly feel like the same The HQ product.
- Both All Games libraries expose the approved seven-game lineup.
- Blind Rank 5 and Keep 4 / Cut 4 are absent from normal library discovery and remain healthy inside Daily Double.
- Better Than is not treated as one of the seven core games.

### Existing games

- Find the Leader is mature and source-correct in both sports.
- Wavelength is mature, calibrated, and source/version-correct in both sports.
- Blind Resume is source-correct and contract-correct in both sports.
- Hit the Number is source-correct and generates strong objective boards in both sports.

### New games

- 20 Questions is replayable in both sports and provides no candidate-narrowing assistance.
- Who Am I is replayable in both sports with controlled clue difficulty and source-backed facts.

### Daily

- UFC and Football each have a coherent Today's Challenge product.
- Daily Double remains a valid format.
- official first attempts are immutable and cross-device;
- schedules/results are versioned;
- leaderboards/streaks/history/reminders work through canonical owners;
- only statistically fair new games enter the rotation.

### Strategic multiplayer

- UFC Auction remains healthy.
- Football Draft Room is live.
- Build a QB is proven.
- the six additional approved position builders are live.
- the four initial themed Football rooms are live.
- nomination pools contain recognizable middle/lower content as well as stars.

### Architecture

- every game can identify its canonical source owner;
- no fallback/duplicate factual or comparison provider exists;
- missing evidence excludes subjects instead of inventing values;
- historical game results remain stable under future methodology/content versions.

### Release

- exact final head passes typecheck;
- exact final head passes the full test suite;
- exact final head passes the production build;
- relevant backend verification is genuinely green;
- canonical GitHub Actions workflows own deployment;
- the exact live production SHA matches the intended release commit.

At that point Football Games should no longer need an Early Access/Beta disclaimer, and future Games work can return to normal incremental feature/content expansion instead of foundational repair.