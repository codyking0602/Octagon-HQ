# The HQ Games Roadmap

**Status:** Sole canonical product and implementation roadmap for UFC + Football Games  
**Created:** September 3, 2026  
**Updated:** September 11, 2026  
**Scope:** Play landing pages, shared game presentation, UFC games, Football games, Today's Challenge, 20 Questions, Who Am I, Auction, Draft Room, game-source ownership, and Games release readiness.

> **Cross-chat rule:** Read this document before changing UFC Play, Football Play, any shared game mechanic, Today's Challenge, Auction, Draft Room, Blind Rank 5, Keep 4 / Cut 4, 20 Questions, Who Am I, or the data/ranking sources consumed by Games.
>
> **Ownership rule:** This file is the only active Games roadmap. Historical implementation notes may explain how a feature was built, but they do not override this file or current `main`.
>
> **Working rule:** One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

---

## 1. Current roadmap position

PRs 1 through 10 are complete. **Stage 11 — Today’s Challenge vNext is complete.**

Stage 11 preserved the one canonical Daily platform while:
- releasing Who Am I as a normal replayable UFC + Football game;
- unifying the compact UFC/Football Daily presentation;
- making Who Am I an official Daily family through the existing materializer, cross-device progress, immutable first-attempt persistence, server grader, leaderboard, history, streak, reminder, and standings owners;
- creating immutable future schedule versions beginning **September 12, 2026 Central**, the first day that was not already materialized when the cutover was approved.

Final future mixes:
- **UFC — `play-rotation-v7`, 24 slots:** Find the Leader ×5, Wavelength ×5, Blind Resume ×4, Hit the Number ×4, Who Am I ×4, Daily Double ×2.
- **Football — `football-daily-v4`, 20 slots:** Find the Leader ×5, Wavelength ×5, Hit the Number ×4, Who Am I ×4, Daily Double ×2.
- Daily Double remains the existing Blind Rank 5 → Keep 4 / Cut 4 experience.
- Football Blind Resume is removed from the future rotation only. Historical v1/v2/v3 days remain immutable and queryable.
- Historical UFC schedule versions through `play-rotation-v6` remain untouched.

20 Questions remains retired.

### NEXT

**Stage 12 — Draft Room foundation + Build a QB.**

Do not reopen Stage 11 mechanics unless a concrete defect or explicit product decision requires it.

---

## 2. Product model — LOCKED

The HQ is one app with sport context.

- Home is universal.
- Picks and Play are sport-specific.
- UFC and Football are the active sport contexts.
- UFC uses the UFC contextual treatment.
- Football uses the Football contextual treatment.
- Games should feel like one product across both sports.

Presentation/interaction parity does **not** require forcing unrelated routes, engines, repositories, or data models into one implementation. Share code only when it clarifies ownership and prevents drift.

Never create a second factual owner, comparison owner, route owner, challenge owner, Daily owner, scheduler, persistence path, or hidden fallback merely for cross-sport symmetry.

---

## 3. Normal Play libraries — LOCKED

### UFC Play

1. Find the Leader
2. Wavelength
3. Blind Resume
4. Hit the Number
5. Who Am I?
6. Auction

### Football Play

1. Find the Leader
2. Wavelength
3. Hit the Number
4. Who Am I?
5. Draft Room

The lists above remain the intended mature product. Stage 11 Slice 2 releases Who Am I as a normal public replayable game in both Play libraries. 20 Questions is retired and is not part of either mature Play library.

### Daily-only mechanics

- Football Blind Resume
- Blind Rank 5 + Keep 4 / Cut 4 as Daily Double mechanics

Blind Rank 5 and Keep 4 / Cut 4 are not deleted. Their engines, graders, historical results, hydration, and compatible deep links remain valid where required.

Football Blind Resume is also not deleted. Its three-round Daily implementation and historical results remain valid, but Stage 11 removes it from the future Football rotation beginning September 12, 2026.

### Better Than

Better Than may remain available as a direct challenge/profile utility where useful, but it is not a core All Games item and does not enter Today's Challenge.

---

## 4. Today's Challenge — LOCKED

Today's Challenge is the competitive daily layer, not a duplicate of All Games.

The canonical Daily platform owns sport-scoped deterministic setup, private evidence, grading, persistence, immutable first completed attempts, cross-device progress, history, streaks, standings, leaderboards, reminders, and schedule resolution. Do not create a second Daily scheduler, schedule engine, repository, grader, leaderboard provider, or persistence path.

Official future Daily families after Stage 11 are:
- Find the Leader
- Wavelength
- UFC Blind Resume
- Hit the Number
- Who Am I
- Daily Double: Blind Rank 5 + Keep 4 / Cut 4

Football Blind Resume remains valid historical Daily content but is not part of `football-daily-v4`.

Who Am I uses the same canonical casual populations, clue authority, score ladder, and Recovery Board rules. Daily setup is deterministic, ignores casual recent-subject localStorage exclusions, restores progress cross-device, reveals the correct identity after completion, and is graded by the existing server-owned Daily grader chain.

Current future schedule identities begin September 12, 2026 Central:
- UFC `play-rotation-v7`: Find 5 / Wavelength 5 / Blind Resume 4 / Hit 4 / Who Am I 4 / Daily Double 2.
- Football `football-daily-v4`: Find 5 / Wavelength 5 / Hit 4 / Who Am I 4 / Daily Double 2.

Schedule versions are immutable. Never rewrite an already-materialized Daily day to force a new rotation.

Auction, Draft Room, and Better Than do not enter Today's Challenge.

---

## 5. Shared presentation contract — LOCKED

UFC and Football Games should use one recognizable product language:

- equivalent Play landing hierarchy;
- Today's Challenge hero/status first;
- All Games below;
- consistent card proportions, typography hierarchy, spacing, status language, CTA treatment, loading/error states, score placement, result hierarchy, replay behavior, and mobile tap targets;
- UFC contextual accent = red;
- Football contextual accent = navy `#1F4E79`;
- team/program colors may take over when that team/program is the subject.

Corresponding games may retain separate engines/routes when ownership genuinely differs. The goal is prevention of product drift, not code unification for its own sake.

---

## 6. Canonical source + eligibility contract — LOCKED

A game never invents a fact, ranking, rating, or subject universe merely because it needs more content.

### Football factual ownership

Objective Football facts come through the canonical Football factual registry/facade and approved generated evidence. This includes factual inputs for:

- Find the Leader
- Hit the Number
- Football Blind Resume reveal rows
- 20 Questions predicates
- Who Am I clues
- objective Draft Room facts where applicable

### Football comparison ownership

Comparative greatness judgments use the canonical Football comparison/ranking authority. Legacy reviewed packs may be calibration/evidence inputs only when the canonical owner intentionally consumes them; a game may not treat them as a competing truth.

Football Blind Resume is a deliberate exception to fake exact-ranking behavior: its current Daily matchup verdicts are curated/explicit because the product should not manufacture exact within-tier truth merely to force a winner.

### UFC factual/comparison ownership

Objective UFC facts continue through established UFC factual/stat owners. Comparative UFC Games continue through the calculated ranking/category owners and approved Play-only rating owner where applicable.

Do not manually enter GOAT ranks, OVRs, totals, or category scores for Games.

### Shared person identity knowledge ownership

Distinctive biographical/person-specific facts are reusable canonical **person knowledge**, not Who Am I-only trivia. Who Am I may consume that knowledge, but 20 Questions, trivia, candidate matching, profile/game surfaces, and future mechanics may reuse the same verified facts when appropriate.

Research must be **person-first and discovery-first**:

1. research the individual broadly using credible sources such as official league/team/college/Hall of Fame material, reputable interviews, retrospectives, and strong journalism;
2. discover what is actually distinctive about that person;
3. verify the claim and retain provenance;
4. only then normalize the discovered fact into the canonical knowledge model.

Do not predefine a long list of narrow schema fields and search the web merely to fill them. Categories such as walk-on background, prior position, unusual high-school sport, family connection, transfer path, nickname origin, draft-day story, iconic moment, or off-field identity are examples of discoveries, not mandatory slots.

Every researched identity fact must retain source provenance. Structural/resume facts and distinctive identity facts are separate quality dimensions. Related derivatives such as career window, start decade, end decade, decade count, midpoint decade, and duration band may all remain valid structured facts, but they do not count as separate distinctive identity concepts merely because they have separate fact IDs.

### Eligibility rule

Each mechanic declares what evidence it needs. If a subject does not have enough trustworthy canonical evidence for that mechanic, exclude it. Do not fill missing evidence with stale values, guesses, or a second provider.

---

## 7. Existing game contracts

### Find the Leader — COMPLETE

Keep:

- objective factual ownership;
- ten-subject competitive boards;
- elimination mechanic;
- full reveal after completion;
- canonical Daily/replay/challenge behavior where supported;
- competitive decoy and repetition testing.

Roadmap PR 4 is complete.

### Wavelength — COMPLETE

Keep:

- one hidden 1–100 value;
- four adaptive clues;
- full 1–100 target domain;
- deterministic/versioned selection;
- no repeated clue/category in a round when canonical alternatives exist;
- calibrated subjective catalog ownership;
- player-facing language that clearly treats values as HQ opinions rather than objective facts;
- official Daily hidden answers private until reveal;
- stored historical challenge setup authoritative across generator changes.

Roadmap PR 5 is complete. Wavelength is **not** the next roadmap PR.

### Blind Resume — COMPLETE FOR PR 6

#### UFC

Keep the normal replayable Play-library game, staged reveal, existing scoring contract, factual rows, challenge/replay behavior, and canonical comparison ownership.

#### Football

Current approved contract:

- Daily-only through Football Today's Challenge;
- legacy standalone route redirects to the canonical Football Today owner rather than maintaining a second runtime;
- exactly three rounds;
- exactly three reveal stages;
- no blank placeholder evidence rows;
- canonical Football facts own reveal evidence;
- curated explicit matchup verdicts rather than fake exact greatness ranks;
- Football scoring ladder: +10/-4, +8/-1, +7/0, normalized into the official Daily 0–100 result;
- canonical team/program media used on reveal;
- visible evidence avoids exact-year identity leakage where the presentation contract requires it.

Roadmap PR 6 is complete through #878–#882.

### Hit the Number — COMPLETE FOR PR 7

Keep:

- factual targets;
- replayable board generation;
- meaningful bust/middle/near-target outcomes;
- NFL/CFB breadth in Football;
- mature format depth where already supported.

PR 7 completed the final parity/source pass by:

- preserving the existing UFC factual ledger and Football factual registry as the sole factual owners;
- preserving the mature 40/25/20/15 Classic, Themed Lineup, One From Each, and Build the Team format mix in both sports;
- extending the existing UFC Random Pool quality gate across every mature format rather than only Themed Lineup;
- evaluating UFC constrained boards using only legal One From Each / Build the Team selections;
- requiring real choice plus near-target, middling, clearly bad, and meaningful bust outcomes on generated Random Pools;
- preserving the existing result, replay, challenge, route, and presentation owners rather than creating parallel paths;
- adding large deterministic cross-sport tests for board quality, source provenance, NFL/CFB breadth, format depth, replay stability, and result/challenge parity.

Roadmap PR 7 is complete in #885.

### Blind Rank + Keep 4 / Cut 4 — COMPLETE FOR PR 8

Keep:

- Blind Rank 5 + Keep 4 / Cut 4 as Daily Double mechanics only;
- the existing UFC and Football subject-generation owners;
- the existing Daily runtimes, scheduler/session/repository ownership, persistence, hydration, history, and immutable completed results;
- the existing persisted Daily Double content/scoring versions so historical results do not silently change;
- compatible replay, challenge, match, pack, and lineup deep links where an old shared setup still needs the standalone mechanic;
- normal All Games exclusion in both UFC and Football;
- one shared official Keep/Cut comparison formula with the existing 16 comparisons, one-point tolerance, and nearest-whole normalization;
- Football subject isolation to NFL/CFB data and UFC subject isolation to UFC data;
- cross-sport Daily Double result/status presentation that understands each sport's persisted result shape;
- UFC red context and Football navy `#1F4E79`, with team/program colors still allowed to own subject treatment.

Plain UFC Blind Rank/Keep-Cut entry points now resolve through the existing official Daily route unless the URL carries compatible historical/challenge intent. Plain Football Rank Five/Keep-Cut entry points now return to the existing Football Today owner under the same compatibility rule. Completed Daily-only results no longer offer a misleading normal casual-replay CTA.

Roadmap PR 8 is complete in #895. Blind Rank + Keep/Cut are **not** the next roadmap PR.

---

## 8. New game contracts — LOCKED

### 20 Questions — RETIRED

20 Questions is retired as a product as of September 11, 2026 after the completed Who Am I rebuild established the preferred identity-game experience.

Preserve:

- the existing engine and deterministic predicate work where it remains useful as reusable infrastructure;
- canonical factual/source ownership and any source-backed research already produced;
- tests that protect reusable engine/data correctness when those modules remain in the repository.

Do not preserve live product ownership:

- no Play-library card;
- no owner-preview card;
- no live 20 Questions runtime route; legacy direct routes redirect to the corresponding Who Am I route;
- no Today's Challenge, challenge, streak, reminder, or history role;
- no future roadmap work unless Cody explicitly makes a new decision to revive the mechanic.

Do not delete factual or research assets merely to make the retirement look cleaner. Retirement means the product surface is gone while reusable work can remain dormant.

### Who Am I?

Normal replayable game for UFC and Football.

Preferred first contract:

- up to 10 clues;
- two clues revealed at a time;
- five guess windows;
- clue-strength bands from broad to near-giveaway;
- deterministic/randomized variation within the approved progression;
- earlier correct guesses score better;
- wrong guesses carry a meaningful penalty;
- clues derive from canonical factual and shared person-identity knowledge.

Knowledge quality rules:

- structural/resume depth remains useful, with the current enrichment target of at least 15 structured facts and a preference for 20+ where canonical evidence honestly supports it;
- structural count alone is not a sufficient quality gate;
- target roughly **5–10 genuinely distinctive, source-backed person-specific facts per identity where credible material exists**;
- do not manufacture filler merely to reach a personal-fact counter;
- broad individual research comes before schema normalization;
- related career/era derivatives must be deduplicated at clue-concept selection so a round cannot pretend five formulations of the same career window are five different revelations;
- every personal identity fact must be source-backed and reusable outside Who Am I.

The personal-identity pilot and subsequent NFL, CFB, and UFC enrichment are complete. Preserve the resulting canonical person-knowledge owners and provenance. Future Who Am I work should consume and quality-check that knowledge rather than restart broad identity research or create a second trivia store.

Who Am I is a normal **public replayable game and official Daily family** in UFC and Football after Stage 11. Replayable mode preserves anti-repeat behavior; Daily mode uses deterministic server-owned identity/clue setup, cross-device progress, immutable first completion, the canonical server grader, and the existing Daily competition path.

Do not use race/ethnicity/appearance classification as clue taxonomy. Physical measurements may be used only when canonical evidence is reliable and wording reflects normal measurement variance.

### UFC Auction

Auction remains the UFC sport-native strategic challenge. Preserve the existing canonical backend/repository owner unless a narrow reusable abstraction is proven during Draft Room work. Auction remains outside Today's Challenge.

### Football Draft Room

Draft Room is Football's Auction analogue and remains outside Today's Challenge.

Core strategic contract:

- two players;
- sealed bids;
- fixed bankroll;
- one nomination at a time;
- winner pays the charged amount;
- awarded assets fill a collection/build;
- final collections are graded through canonical Football owners;
- true ties supported;
- challenge/rematch/history use existing canonical challenge/backend patterns.

Launch priority is **Build a QB** first. Approved initial position-builder traits:

- QB: Arm, Accuracy, Processing, Mobility, Clutch
- RB: Vision, Power, Elusiveness, Speed, Receiving
- WR: Routes, Hands, Speed, YAC, Contested Catch
- DE/EDGE: Pass Rush, Power, Get-Off, Run Defense, Motor
- CB: Coverage, Ball Skills, Speed, Physicality, Technique
- Safety: Coverage, Range, Tackling, Ball Skills, Instincts
- LB: Run Defense, Coverage, Tackling, Blitzing, Instincts

Trait grades must derive from the canonical Football ranking/category owner or an explicitly approved canonical position-rating model. Never create a Draft Room-only manual ratings table.

After position builders are proven, initial themed rooms are:

- Cowboys Since 2000
- Longhorns Since 2000
- Best QB / RB / WR Trio
- Best Secondary

Do not inflate mode count merely to match UFC Auction.

---

## 9. Versioning, quality, and release rules

Generated content is output, not canonical truth.

Methodology/content changes that affect official or historical interpretation must rotate an explicit content/scoring/methodology version as appropriate. Previously completed official results do not silently change.

Large deterministic tests should measure, where applicable:

- board uniqueness;
- subject exposure;
- superstar vs middle/lower-tier share;
- NFL/CFB balance;
- category balance;
- repeated subject/board/matchup rate;
- stale-source usage;
- missing-evidence exclusion;
- score distribution and Daily fairness;
- mobile layout parity;
- challenge hydration stability;
- historical-version stability.

Every roadmap PR requires the exact final head to pass:

- `npm run typecheck`
- full test suite
- production build
- relevant backend verification when backend-owned files change
- relevant phone/browser proof when UI behavior changes

GitHub Actions is the only deployment owner. Never call a change live merely because it merged; verify the exact live deployment SHA.

---

# 10. Implementation roadmap — 15 PRs total

If scope changes materially, update this file in the same decision so future chats do not drift.

### ✅ PR 1 — Canonical Games roadmap
Merged #863.

### ✅ PR 2 — Game source authority + eligibility repair
Merged #864.

### ✅ PR 3 — Play landing-page + shared presentation parity
Merged #865; focused repair #866.

### ✅ PR 4 — Find the Leader final parity/source pass
Merged #870.

### ✅ PR 5 — Wavelength final parity/calibration pass
Merged #873. Complete.

### ✅ PR 6 — Blind Resume final parity/source pass
Completed through #878–#882, including the newer locked Football Daily-only direction.

### ✅ PR 7 — Hit the Number final parity/source pass
Completed in #885. Canonical factual ownership is preserved, every UFC Random Pool format is quality-gated using legal selections, mature UFC/Football format depth is locked, and deterministic cross-sport source/quality/replay/challenge tests cover the final contract.

### ✅ PR 8 — Blind Rank + Keep/Cut Daily-only role cleanup
Completed in #895. Blind Rank 5 + Keep 4 / Cut 4 remain Daily Double-only in both sports; normal Play discovery and plain standalone entry are removed, compatible historical/challenge deep links remain valid, the existing Daily/hydration/history owners and persisted versions are preserved, Football uses the shared official Keep/Cut comparison scorer, and cross-sport presentation recognizes both persisted UFC and Football result shapes.

### ✅ PR 9 — 20 Questions prototype, later retired
The owner-only prototype work is preserved as reusable engine/data infrastructure, but 20 Questions was explicitly retired as a product on September 11, 2026. It has no live Play discovery, game runtime, or Daily/challenge role. Legacy direct routes redirect to Who Am I.

### ✅ PR 10 — Who Am I? owner-only rebuild
**COMPLETE.** The research/data/plumbing foundation, gameplay loop, simulation/quality tuning, clue polish, and persistent recent-subject rotation are complete through PR #1007. Stage 11 Slice 2 subsequently releases the completed game publicly while keeping Daily ownership off.

Completed rebuild slices:

1. lock NFL/CFB launch pools through canonical recognizability owners rather than a manual game roster;
2. establish one structured presentation-neutral identity fact model;
3. enrich NFL A-tier structural/resume depth while preserving canonical factual/registry owners;
4. establish the shared identity-knowledge foundation and prove it with the NFL A-tier research pilot;
5. complete NFL A-tier person-specific enrichment;
6. complete NFL B-tier person-specific enrichment;
7. complete CFB A-tier person-specific enrichment;
8. complete CFB B-tier person-specific enrichment;
9. complete UFC person-specific enrichment for the canonical 100-subject UFC population;
10. build the canonical clue assembler/reveal progression, then complete stage-aware football aggregation and résumé-depth follow-ups. Current audit: **100 UFC / 200 NFL / 200 CFB**, **0 football subjects below 10 candidate clues**, **0 below 12**, and **0 plumbing omissions**. Gameplay still reveals at most 10 clues.

Completed gameplay-finish slices:

11. **replay variation + repetition controls** — completed in #996; approved clue sequences now vary across replay contexts while same-context generation stays deterministic and progression/dedupe/stage correctness remain intact;
12. **endgame candidate/disguise choice + reduced-point recovery** — one final natural guess remains available after all 10 clues; after that miss or by voluntary choice, a five-name Recovery Board provides two reduced-point picks and excludes identities already proven wrong.

Completed final rebuild slice:

13. mature whole-game simulation/quality tuning, clue-signal polish, first-person grammar cleanup, and persisted recent-subject rotation across UFC/NFL/CFB. The final product decision retired 20 Questions rather than carrying two overlapping identity games.

Do not restart completed identity research merely to increase counts. New facts should be added only when a concrete quality gap is found during gameplay simulation and the existing canonical owner is extended.

### ▶ PR 11 — Today's Challenge vNext
**ACTIVE.** Preserve one sport-aware Daily owner, immutable first completion, cross-device persistence, versioning, and official 0–100 normalization. Do not add Auction, Draft Room, Better Than, or retired 20 Questions.

**Slice 1 — Daily eligibility + rotation audit: COMPLETE.** The canonical audit is `docs/todays-challenge-vnext-audit.md`. Current UFC and Football schedules remain unchanged; current scoring remains unchanged; Who Am I is approved for public replayable Play but not yet for competitive Daily.

**Slice 2 — public Who Am I release: COMPLETE in this focused release.** Remove owner-only preview gating without changing Who Am I gameplay. Keep `dailyEligible: false` and every Daily/challenge/streak/reminder surface off.

**Slice 3 — NEXT: Who Am I Daily readiness measurement.** Establish the minimum canonical evidence for real solve-window and recovery outcomes without creating a second game/runtime owner. Do not activate Daily until a later server-owned Daily contract and explicit rotation decision are complete.

### PR 12 — Draft Room foundation + Build a QB
Extend/reuse the canonical strategic challenge backend safely, launch Football Draft Room and Build a QB, prove canonical trait grading, bankroll/nomination behavior, challenge lifecycle, backend verification, and mobile presentation.

### PR 13 — Draft Room position builders
Add RB, WR, DE/EDGE, CB, Safety, and LB builders using canonical trait owners and one Draft Room lifecycle.

### PR 14 — Draft Room themed collection rooms
Add Cowboys Since 2000, Longhorns Since 2000, Best QB/RB/WR Trio, and Best Secondary. Keep later room ideas as backlog unless explicitly promoted.

### PR 15 — Full Games maturity audit + production release proof
Run cross-game simulations, source-provenance audit, landing/game parity review, mobile review, history/deep-link review, Daily fairness, challenge hydration, Draft Room lifecycle, and exact production release proof. Remove Football Games Early Access/Beta treatment only if all completion gates are green.

---

# 11. Explicit non-goals

Do not:

- wait for every Football subject to have complete rankings/stats before finishing Games;
- manually fill missing facts/ratings merely to increase game eligibility;
- create second factual/comparison/ranking owners;
- create a Who Am I-only personal trivia database when the fact belongs to shared person knowledge;
- predefine narrow personal-fact fields and then search the web merely to fill those slots;
- count multiple derived formulations of the same career/era information as multiple distinctive identity concepts;
- force UFC and Football onto one route/engine merely for symmetry;
- revive Blind Rank/Keep-Cut as normal library cards;
- revive Football Blind Resume as a competing standalone runtime without a new explicit product decision;
- revive retired 20 Questions without a new explicit product decision;
- expose candidate narrowing in any future reuse of the retired 20 Questions engine;
- let runtime AI decide yes/no truth;
- use unsupported trivia or race/ethnicity appearance taxonomy in Who Am I;
- create Draft Room-only manual trait grades;
- add Auction/Draft Room/Better Than to Today's Challenge;
- add a second Daily scheduler, history store, leaderboard owner, reminder owner, or score repository;
- call a roadmap step complete merely because code merged without exact-head validation and, when applicable, exact live-SHA verification.

---

# 12. Definition of Games roadmap completion

The roadmap is complete only when production has:

- one coherent UFC/Football Play design language;
- the approved normal Play libraries and Daily-only roles;
- mature/source-correct Find the Leader, Wavelength, Blind Resume, and Hit the Number contracts;
- mature Who Am I in both sports, with its public/Daily role explicitly decided during PR 11;
- shared source-backed person identity knowledge that is reusable across Games rather than trapped inside Who Am I;
- healthy UFC Auction;
- live Football Draft Room with approved builders/initial rooms;
- coherent sport-scoped Today's Challenge competition;
- no duplicate source/deployment/runtime ownership;
- exact final head green for typecheck, full tests, production build, and relevant backend proof;
- exact production deployment SHA verified.

Until then, continue from the **NEXT** marker above rather than inferring progress from an older roadmap or historical PR sequence.