# Football Knowledge Ledger

Last reviewed: 2026-08-27

## Purpose

Football HQ needs one deep factual and identity authority that can support every Football game without rebuilding shallow game-specific pools.

`src/features/back-room/footballFactualStats.ts` remains the canonical public owner for objective Football facts. `src/features/back-room/footballSubjectRegistry.ts` remains the canonical identity/query owner. This initiative expands the data, projection, and game-evaluation layers behind those owners; it does not create a second runtime provider, fallback query path, or competing game-specific database.

The target is a queryable Football knowledge system covering NFL and CFB players, franchises/programs, individual seasons, coaches, eras/dynasties, games, championships, awards, and draft relationships.

## Product outcome

Football games should stop asking, “which names did this game hand-author?” They should ask the canonical Football universe for a large qualified pool.

The required flow for a migrated game is:

`canonical universe -> category query -> A/B/C recognizability -> required factual coverage -> game-specific evaluation/generation`

That direction is mandatory. The inverse is not a migration:

`legacy game roster -> filter through canonical eligibility`

A legacy game catalog may still provide a reviewed rating, editorial override, visual asset, or historical evidence packet for a matching canonical subject. It must not define who is allowed to exist in the candidate universe.

Examples:

- Find the Leader: query recognizable subjects with the requested fact and build the board from that deep result.
- Hit the Number: query subjects with the requested canonical quantitative fact, then solve the exact-target board from the qualified pool.
- Blind Resume: query recognizable subjects with enough canonical facts to construct a truthful resume; a hand-written resume packet is an optional enhancement, not membership.
- Blind Rank: query a deep comparable universe, then evaluate those subjects through one deterministic comparison authority; a pre-existing reviewed rating can calibrate a matching subject but cannot be the roster.
- Keep/Cut: use the same deep comparison universe/evaluation authority as Blind Rank, with Keep/Cut owning only its board and scoring rules.

The games own presentation, rules, randomization, and board construction. They do not own copied factual values or private candidate databases.

## Non-negotiable game-depth invariant

For every migrated factual/comparison Football game:

1. Candidate membership starts from `queryFootballSubjects(...)` or the canonical projection behind that query.
2. Casual gameplay defaults to recognizability tiers A-C; Tier D stays database-only unless a future hardcore/deep feature explicitly asks for it.
3. Required facts/evidence are checked after canonical membership, not by starting from a hand-authored game list.
4. Subjective comparison scores may be game-evaluation outputs, but their input subjects still come from the canonical universe.
5. Existing manual ratings/evidence may override or calibrate matching canonical subjects; they may not exclude otherwise qualified canonical subjects merely because no manual row exists.
6. Focused tests must prove that real gameplay can surface qualified subjects that were not in the pre-ledger legacy game catalog.
7. Depth tests must measure the actual playable pool after all gates, not the raw database size.

A PR that only filters a legacy roster through canonical eligibility does not satisfy this invariant.

## Canonical layers

### 1. Source layer

Pinned, reproducible external datasets are build-time inputs. No game should call a public sports API directly at runtime.

Every source adapter records provider/repository, exact pinned commit/release/asset identity, license, seasons/coverage, import schema version, and generated artifact counts/hashes.

A statistical source is evidence for **what happened**. It is not automatically the authority for **who is recognizable**. Stage 12 may combine multiple independent recognition sources without creating a second runtime factual owner.

### 2. Identity layer

One canonical identity graph connects the same football subject across seasons and contexts while preserving distinct NFL and CFB career identities when the product needs to reason about those careers separately.

Primary entity families are player, player-season, franchise, program, team-season, coach, era, game, award/championship, and draft relationships.

Existing canonical subject IDs and aliases are preserved. New source IDs are reconciliation keys, not replacement public IDs.

### 3. Fact layer

Objective records continue to flow through the existing Football factual owner.

Facts may include player season/career production, team-season record/scoring/postseason results, coach results and stops, program/franchise and era totals, awards/championships, draft facts, and explicit reproducible derived metrics.

No subjective greatness, aura, uniform, rivalry-hatred, or era-adjustment opinion belongs in the factual layer.

### 4. Recognizability / eligibility layer

Data depth and game eligibility are separate concepts.

- **A — Iconic:** household football names/teams/eras.
- **B — Very recognizable:** major stars, prominent award contenders, major coaches, championship teams, high-profile programs/franchises.
- **C — Football-fan recognizable:** players/teams/coaches a real football fan can reasonably know because of meaningful prominence, honors, production, draft/history, or memorable context.
- **D — Database only:** valid factual entity, but not casual filler.

Recognizability is not a factual stat and must never change the underlying facts.

Tier assignment must not be determined solely by one statistical feed, a production threshold, or NFL crossover. Recognition evidence and factual-stat evidence are separate authorities feeding the same canonical identity.

### 5. Query / runtime projection layer

Games query one canonical owner using filters such as league, entity kind, season/decade/range, position, school/program, conference, franchise, coach, draft facts, championships/awards, metric availability, and recognizability.

Generated source corpora are not imported wholesale into the initial React bundle. Build-time generation creates compact runtime projections/manifests for the entities and metrics the app actually needs.

### 6. Comparison evaluation layer

Blind Rank and Keep/Cut require a deterministic “how good is this subject?” evaluation that objective leader/target games do not.

That evaluation must be separate from candidate membership:

- canonical query owns the subject universe;
- canonical facts/relationships provide objective inputs;
- one shared comparison evaluator converts sufficient inputs into a stable comparable score;
- reviewed legacy ratings may calibrate/override a matching canonical identity;
- absence from a legacy rating table is never, by itself, grounds for exclusion.

The evaluator is not a second factual database. It is a deterministic consumer of canonical facts plus explicit reviewed calibration.

## Permanent pool taxonomy

NFL and CFB use the **same player-pool structure**:

- QB
- RB
- WR
- TE
- OL
- DL / EDGE
- LB
- Secondary
- K / P

There is no generic player pool called `Defense`. DL/EDGE, LB, and Secondary are separate because their recognizable identities, factual menus, awards, and game comparisons differ materially.

Both leagues also require:

- team seasons;
- franchises / programs;
- head coaches;
- eras / dynasties;
- notable games.

The detailed Stage 11 census and stat/honor contracts live in `docs/football-ledger-stage11-census-and-stat-contracts.md`.

## Source strategy

### CFB

The current large normalized statistical source family is SportsDataverse `sportsdataverse/cfbfastR-data`.

Pinned baseline:

- repository: `sportsdataverse/cfbfastR-data`
- commit: `a0f29f9ec6c04952a720905017e74a7b089dc1eb`
- license: `CC BY 4.0`
- normalized player-stat coverage currently used by the app: 2014-2025
- broader schedule/game data supports earlier team/game relationships

This source remains valuable factual infrastructure, but Stage 11 proved it is not sufficient as the sole recognizability authority. Stage 12 must use multiple independent recognition evidence families such as All-America/All-Conference records, Hall of Fame records, Heisman/major positional awards, and other legitimate historical prominence evidence.

The existing 2025 CC0 NCAA corpus is source-stage infrastructure, not a standalone casual-game roster.

### NFL

The current large normalized statistical source family is nflverse.

Pinned baseline includes `nflverse/nflreadr` commit `d072c08492067b578f27e562b6cc9c9e3b8589c3` plus the immutable nflverse data identities recorded by the generated manifests. Historical normalized player/team coverage currently begins in 1999.

NFL identity/roster/schedule/coach data reconciles player, team, season, coach, and draft relationships to stable canonical identities. As with CFB, statistical production is not by itself the permanent recognizability authority.

## Depth policy

There is **no arbitrary A-C quota** for either league.

The prior rough “2,000-3,000 CFB / 1,500 NFL” targets were useful warning signals that the source projection was thin, but Stage 11 showed they are the wrong definition of success. A quota can encourage Tier C filler while still missing obvious football identities.

The permanent depth standard is pool-by-pool completeness:

1. build the best defensible recognizable A/B/C universe for each permanent player and non-player pool;
2. cross-check that universe against multiple recognition evidence families;
3. review obvious omissions and false promotions;
4. measure factual readiness against the Stage 11 stat contract;
5. stop promoting when the recognizable universe is covered rather than when a round number is reached.

Tier C is the main variety layer. Tier D may remain extremely large and is not a Stage 13 enrichment priority unless a specific deep/hardcore feature needs those facts.

Depth tests validate the **playable result after query + recognizability + fact/evaluation gates** by league/entity/era/position/metric. A large raw corpus does not count if a game still surfaces only a tiny manual list.

## Dynasty / era rule

An era is a relationship over objective seasons, not a free-floating opinion label. Its canonical record should carry the program/franchise identity, start/end seasons, season membership, coach when relevant, wins/losses, titles, and playoff/CFP/title-game results where applicable.

Games may call an era a “dynasty” only through an explicit eligibility/calibration rule. The underlying facts remain objective.

## Storage rule

Do not solve depth by shipping raw source corpora into the browser.

Preferred flow:

`pinned sources -> deterministic importers -> normalized build artifacts -> identity reconciliation -> recognizability projection -> compact game-ready projection -> canonical factual/query owner -> games`

Raw source files may remain external when immutable/pinned and reproducibly importable. Generated runtime artifacts must be compact, hashed, validated, and excluded from the initial JS bundle unless a consumer explicitly needs them.

## Release / ownership rules

For every PR in this initiative:

1. Resolve current `main` before branching.
2. Preserve `footballFactualStats.ts` / `footballSubjectRegistry.ts` as the canonical factual/identity ownership path unless a dedicated migration explicitly changes ownership.
3. One narrow purpose per PR.
4. No runtime external sports API fallback.
5. No game-specific duplicate factual catalog or candidate roster.
6. Add focused coverage/depth/reconciliation tests.
7. Exact final head must pass typecheck, full tests, production build, and relevant backend verification.
8. Merge only the exact green head.
9. If live behavior changes, verify the production deployment marker matches the merged SHA.

## Execution history and corrected roadmap

The roadmap is now **15 stages**. Stages 11-15 deliberately correct the earlier order of operations: the project must first define the complete product universe and its factual contract, then repair recognizability, then hydrate facts, and only then finish game migration/cleanup. This prevents one game’s failing simulation from driving ad-hoc data decisions.

Football Hit the Number was already moved to the canonical quantitative ledger in PR #661 before the later numbered consumer migrations. It is tracked as a completed prerequisite rather than wasting a numbered stage repeating the same migration.

### Stage 1 — Knowledge contract — COMPLETE

Established this roadmap and ownership contract.

### Stage 2 — Canonical entity + recognizability schema — COMPLETE

Added A-D tiers, gameplay eligibility, source identity keys, stable subject kinds, and query filters while preserving public IDs/aliases.

### Stage 3 — Historical CFB player-season source adapter — COMPLETE

Added pinned 2014-2025 cfbfastR ingestion, normalized historical player-season data, manifests, and source reconciliation.

### Stage 4 — Historical NFL player/team source adapter — COMPLETE

Added pinned 1999-present nflverse historical player/team ingestion, normalized records, manifests, and reconciliation.

### Stage 5 — Programs, franchises, team seasons, coaches, games, championships, eras — COMPLETE

Materialized the non-player relationship source layer so players are not the only first-class entity family.

### Stage 6 — Recognizability projection + depth audit — COMPLETE, SUPERSEDED AS THE FINAL RECOGNITION STANDARD BY STAGE 12

Created deterministic A-D projection rules and A-C promoted pools. Stage 11 later proved that a production/stat-source-driven projection is not sufficient as the final recognition authority, especially for historical CFB, OL, specialists, and culturally recognizable subjects. Stage 12 replaces the recognition methodology while preserving one canonical query owner.

### Stage 7 — Find the Leader deep migration — COMPLETE

Find the Leader starts from the deep A-C canonical projection, checks fact availability/quality, and builds gameplay from that result. PR #711 repaired replay validation so projected subjects remain valid through the shared replay path.

### Stage 8 — Keep/Cut canonical identity bridge — COMPLETE BUT SUPERSEDED BY STAGE 10 FOR LIVE DEPTH

PR #710 moved Keep/Cut identity/category validation onto the canonical registry but still began from the legacy rated inventory. Stage 10 replaced that membership path with the shared deep comparison runtime.

### Stage 9 — Deep comparison candidate + evaluation authority — COMPLETE — PR #717

Created one shared comparison authority that starts from canonical A-C category queries and evaluates qualified subjects independently of legacy roster membership.

Delivered:

- one shared comparison-category query contract across all 13 packs;
- canonical A-C/projected subjects as the candidate universe;
- deterministic fact-based comparison evaluation for qualified non-legacy subjects;
- reviewed legacy ratings retained only as calibration/override for matching canonical identities;
- focused proof that supported deep categories include qualified subjects outside the legacy rated inventory;
- no game UI, route, replay, challenge, or scoring-rule rewrite.

### Stage 10 — Blind Rank + Keep/Cut deep migration — COMPLETE — PR #718

Blind Rank and Keep/Cut consume Stage 9’s deep canonical comparison authority in actual gameplay instead of deriving membership from the reviewed Rank Five inventory.

Delivered:

- `footballRankFivePlayableModel.ts` projects live Blind Rank pools from the deep canonical comparison authority while preserving reviewed ratings for matching calibrated identities;
- standalone Blind Rank random, replay, URL-share, and profile-challenge resolution use the deep playable pool;
- Keep/Cut consumes the same deep evaluated pool and no longer owns a duplicate category map or `legacy items -> canonical filter` membership path;
- pack-context league presentation is preserved for multi-league canonical identities;
- official Football Today’s Challenge Blind Rank and Keep/Cut use the same deep runtime through the canonical daily backend source/bundle pipeline;
- focused tests require playable non-legacy canonical subjects in standalone and official-daily boards;
- existing board construction, scoring, replay semantics, challenge schema, routes, and presentation remain unchanged.

The reviewed `footballRankFiveModel.ts` catalog remains calibration/editorial input for matching identities. It is not the live candidate-membership authority.

### Stage 11 — Full Ledger Census + Stat Contracts — COMPLETE — PR #720

**Purpose:** establish the complete NFL/CFB product taxonomy, measure the actual current A/B/C and factual coverage of every pool, and define the factual/honor contract before further content promotion.

Delivered:

- identical NFL and CFB player pool taxonomy: QB, RB, WR, TE, OL, DL/EDGE, LB, Secondary, K/P;
- non-player census for team seasons, franchises/programs, head coaches, eras/dynasties, and notable games;
- exact current source-depth, canonical A/B/C, and fact-readiness census;
- explicit proof of current holes rather than hiding them behind raw corpus counts;
- permanent separation rule: recognition evidence decides who belongs; factual/stat sources decide what is true;
- game-useful stat/honor contracts for every pool, including CFB first-team All-Conference, All-America, Heisman/position awards, and NFL All-Pro/Pro Bowl/major awards;
- team contracts prioritize intuitive football facts such as turnover margin, scoring, record, offense/defense, and postseason results; SRS/SOS remain optional secondary analytical facts;
- no arbitrary A-C quota and no requirement to enrich the full Tier D archive;
- durable audit contract/tests and `docs/football-ledger-stage11-census-and-stat-contracts.md`.

Stage 11 deliberately did **not** bulk-promote identities or bulk-fill missing stats. Those are owned by Stages 12 and 13.

### Stage 12 — Recognizability Universe — NEXT

**Purpose:** make the A/B/C universe genuinely complete enough for Football HQ across every NFL and CFB pool.

Deliverables:

- use multiple independent recognition evidence families rather than one stat feed as gospel;
- incorporate legitimate historical signals such as Hall of Fame, consensus/unanimous All-America, first-team All-Conference, Heisman/major position awards, major NFL honors, championships/postseason prominence, and historically meaningful production;
- audit obvious omissions and false promotions pool-by-pool;
- preserve distinct NFL and CFB career recognition for the same person;
- promote all legitimately recognizable A/B/C identities automatically through the canonical identity/query owner;
- keep D as the deep/archive layer without weakening C to hit an arbitrary count;
- add durable pool-by-pool coverage/omission tests.

### Stage 13 — Factual Universe

**Purpose:** hydrate the Stage 11 factual/honor contract for the completed Stage 12 A/B/C universe through the existing factual owner.

Deliverables:

- map Stage 11 concepts into canonical fact metric/relationship types rather than a second stat database;
- fill meaningful production, efficiency, honors, team-success, draft, and relationship coverage for A-C subjects;
- prioritize intuitive/useful facts and source completeness over math-for-math’s-sake derived rows;
- add OL/specialist/defensive/honor facts that the current ledger lacks;
- add team turnover/offense/defense/postseason dimensions where sourceable;
- no fake zero/default for unknown facts;
- no broad D enrichment unless a specific deep feature requires it;
- durable factual-coverage matrix by league/pool/metric family.

### Stage 14 — Game Integration

**Purpose:** make every objective Football game consume the completed recognizable/factual universe in a way that keeps each game distinct.

Deliverables:

- finish Blind Resume’s truthful canonical eight-row generation and migrate it off hand-authored membership;
- re-audit Blind Rank, Keep/Cut, Hit the Number, and Find the Leader against the completed universe;
- Wavelength remains subjective-owned while using canonical subject identity;
- each game takes a different useful slice of the same ledger rather than presenting the same shallow stats with different labels;
- reviewed Rank Five ratings and reviewed resume packets remain optional calibration/enrichment for matching canonical subjects, never membership;
- deterministic large simulations prove depth, variety, board quality, and no material subject/category overexposure;
- structure the same identity/fact owners so future Football Draft/Auction and 20 Questions can plug in without a new factual database.

### Stage 15 — Cleanup + Final Release Audit

**Purpose:** remove superseded ownership paths and prove the complete Football Knowledge Ledger reaches production cleanly.

Deliverables:

- remove duplicate factual providers, legacy authoritative rosters, alternate query paths/fallbacks, and dead Blind Resume membership machinery;
- preserve legitimate reviewed calibration/editorial evidence that still enhances matching canonical subjects;
- assert every objective Football game uses canonical membership/facts and no old inventory silently remains authoritative;
- static/runtime bundle audit so the D/archive universe does not unnecessarily bloat gameplay;
- deterministic release simulations and depth/coverage guardrails;
- one identity/query owner and one factual public owner;
- exact final head passes typecheck, full tests, production build, and relevant backend verification;
- merge exact green head and verify canonical GitHub Actions deployment/live SHA when runtime behavior changes.

## Definition of done

This initiative is done when:

- Football has one canonical factual/identity authority.
- Historical NFL and CFB depth is reproducibly ingested from appropriate factual and recognition sources.
- Both leagues use the same nine player-pool taxonomy plus deep non-player pools.
- Players, programs, franchises, seasons, coaches, eras, games, awards/championships, and draft relationships are queryable.
- The recognizable A/B/C universe is complete enough pool-by-pool without arbitrary quota filler.
- A-C factual readiness satisfies the agreed Stage 11 contracts at a level appropriate to each position/entity family.
- Non-player pools are deep enough to avoid repetitive boards.
- Obscure source records can exist without becoming casual random filler.
- **No migrated game starts from a hand-authored roster and merely filters it through the ledger.**
- **No Football game needs a hand-authored per-subject row merely to make a qualified canonical subject playable.**
- Legacy ratings/evidence are calibration/enrichment only, never membership authority.
- All objective Football consumers use the same canonical query/factual path.
- Game-depth simulations prove that the canonical database materially expands actual gameplay, not just storage.
- Future Football Draft/Auction and 20 Questions can reuse the same owners rather than requiring a new data universe.
