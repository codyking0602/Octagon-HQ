# The HQ Games Roadmap

**Status:** Sole canonical product and implementation roadmap for UFC + Football Games  
**Created:** September 3, 2026  
**Updated:** September 4, 2026  
**Scope:** Play landing pages, shared game presentation, UFC games, Football games, Today's Challenge, 20 Questions, Who Am I, Auction, Draft Room, game-source ownership, and Games release readiness.

> **Cross-chat rule:** Read this document before changing UFC Play, Football Play, any shared game mechanic, Today's Challenge, Auction, Draft Room, Blind Rank 5, Keep 4 / Cut 4, 20 Questions, Who Am I, or the data/ranking sources consumed by Games.
>
> **Ownership rule:** This file is the only active Games roadmap. Historical implementation notes may explain how a feature was built, but they do not override this file or current `main`.
>
> **Working rule:** One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

---

## 1. Current roadmap position

PRs 1 through 6 are complete on `main`.

Completed roadmap sequence:

1. **PR 1 — Canonical Games roadmap** — merged as #863.
2. **PR 2 — Game source authority + eligibility repair** — merged as #864.
3. **PR 3 — Play landing-page + shared presentation parity** — merged through #865 with focused repair #866.
4. **PR 4 — Find the Leader final parity/source pass** — merged as #870.
5. **PR 5 — Wavelength final parity/calibration pass** — merged as #873, with later presentation polish preserving the same mechanic/ownership.
6. **PR 6 — Blind Resume final parity/source pass** — completed through the September 4 Blind Resume rebuild and follow-up fixes (#878–#882). The approved Football product direction changed during this work: Football Blind Resume is now Daily-only rather than a normal replayable Play-library game.

### NEXT

**PR 7 — Hit the Number final parity/source pass.**

Do not restart Wavelength or treat it as an uncompleted roadmap item.

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
5. 20 Questions
6. Who Am I?
7. Auction

### Football Play

1. Find the Leader
2. Wavelength
3. Hit the Number
4. 20 Questions
5. Who Am I?
6. Draft Room

### Daily-only mechanics

- Football Blind Resume
- Blind Rank 5 + Keep 4 / Cut 4 as Daily Double mechanics

Blind Rank 5 and Keep 4 / Cut 4 are not deleted. Their engines, graders, historical results, hydration, and compatible deep links remain valid where required.

Football Blind Resume is also not deleted. Its approved current product role is the three-round Football Today's Challenge experience owned by the existing Daily platform.

### Better Than

Better Than may remain available as a direct challenge/profile utility where useful, but it is not a core All Games item and does not enter Today's Challenge.

---

## 4. Today's Challenge — LOCKED

Today's Challenge is the competitive daily layer, not a duplicate of All Games.

The canonical Daily platform owns sport-scoped deterministic setup, private evidence, grading, persistence, immutable first completed attempts, history, streaks, standings, leaderboards, reminders, and cross-device restoration.

Daily-capable families are:

- Find the Leader
- Wavelength
- UFC Blind Resume
- Football Blind Resume under its Football-specific three-round contract
- Hit the Number
- Daily Double: Blind Rank 5 + Keep 4 / Cut 4
- 20 Questions only after fairness/score-distribution proof
- Who Am I only after fairness/score-distribution proof

Auction, Draft Room, and Better Than do not enter Today's Challenge.

Final rotation weights are not locked until the new Games have real simulation data. Any schedule change must remain deterministic, versioned, Central-time based, sport-scoped, and owned by the existing Daily scheduler/runtime path.

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

### Hit the Number — NEXT

Keep:

- factual targets;
- replayable board generation;
- meaningful bust/middle/near-target outcomes;
- NFL/CFB breadth in Football;
- mature format depth where already supported.

PR 7 must:

- align UFC/Football presentation;
- verify every factual input routes through the correct canonical owner;
- preserve/finish mature format support;
- enforce legal, interesting generated boards rather than merely technically solvable boards;
- align result/replay/challenge behavior;
- add large deterministic board-quality/source tests.

Do not expand this PR into future-game work or unrelated Football ranking work.

### Blind Rank + Keep 4 / Cut 4

Normal Play-library discovery is removed. Preserve Daily Double behavior, engines, graders, history, hydration, and compatible deep links. PR 8 owns the remaining Daily-only role/grading/presentation cleanup across sports.

---

## 8. New game contracts — LOCKED

### 20 Questions

Normal replayable game for UFC and Football.

Core rules:

- one hidden eligible subject;
- up to 20 curated yes/no questions;
- deterministic predicates against canonical identity/factual data;
- guess identity at any time;
- wrong guesses carry a meaningful penalty;
- earlier correct identification scores better;
- no runtime LLM truth judgments.

Never show remaining candidate count, candidate lists, eliminated candidates, probability meters, or dynamic narrowing hints. The player does the narrowing mentally.

Football may support NFL and College Football universe selection where the predicate contract remains clear.

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
- clues derive from canonical identity/factual evidence.

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

### ▶ PR 7 — Hit the Number final parity/source pass
**NEXT.** Align presentation, prove canonical factual ownership, enforce strong legal boards, align result/replay/challenge behavior, and add deterministic quality tests.

### PR 8 — Blind Rank + Keep/Cut Daily-only role cleanup
Finish the Daily-only product role, canonical grading path, cross-sport Daily Double presentation, and historical/deep-link preservation.

### PR 9 — 20 Questions
Implement the replayable cross-sport mechanic, deterministic predicate bank, scoring, no-narrowing-assistance contract, and source/depth/repetition/UI proof. Daily-ready only; do not activate Daily rotation here.

### PR 10 — Who Am I?
Implement progressive clue bands, two-at-a-time reveal cadence, scoring, source derivation, giveaway/repetition tests, and UI proof. Daily-ready only; do not activate Daily rotation here.

### PR 11 — Today's Challenge vNext
Recalibrate the sport-scoped deterministic Daily product after new-game simulation data exists. Preserve one Daily owner, immutable first completion, cross-device persistence, versioning, and official 0–100 normalization. Do not add Auction, Draft Room, or Better Than.

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
- force UFC and Football onto one route/engine merely for symmetry;
- revive Blind Rank/Keep-Cut as normal library cards;
- revive Football Blind Resume as a competing standalone runtime without a new explicit product decision;
- expose candidate narrowing in 20 Questions;
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
- replayable 20 Questions and Who Am I in both sports;
- healthy UFC Auction;
- live Football Draft Room with approved builders/initial rooms;
- coherent sport-scoped Today's Challenge competition;
- no duplicate source/deployment/runtime ownership;
- exact final head green for typecheck, full tests, production build, and relevant backend proof;
- exact production deployment SHA verified.

Until then, continue from the **NEXT** marker above rather than inferring progress from an older roadmap or historical PR sequence.