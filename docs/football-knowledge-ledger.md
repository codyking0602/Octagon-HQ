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

- Find the Leader: query recognizable CFB running backs with the requested rushing fact and build the board from that deep result.
- Hit the Number: query subjects with the requested canonical quantitative fact, then solve the exact-target board from the qualified pool.
- Blind Resume: query recognizable subjects with enough canonical facts to construct a truthful resume; a hand-written resume packet is an optional enhancement, not membership.
- Blind Rank: query a deep comparable universe, then evaluate those subjects through one deterministic comparison authority; a pre-existing reviewed rating can calibrate a matching subject but cannot be the roster.
- Keep/Cut: use the same deep comparison universe/evaluation authority as Blind Rank, with Keep/Cut owning only its board and scoring rules.

The games own presentation, rules, randomization, and board construction. They do not own copied factual values or private candidate databases.

## Non-negotiable game-depth invariant

For every migrated factual/comparison Football game:

1. Candidate membership starts from `queryFootballSubjects(...)` or the canonical projection behind that query.
2. Casual gameplay defaults to recognizability tiers A-C; Tier D stays database-only unless a future hardcore mode explicitly asks for it.
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

### 2. Identity layer

One canonical identity graph connects the same football subject across seasons and contexts.

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
- **C — Football-fan recognizable:** meaningful starters/contributors, notable draft picks, productive major-program players, memorable teams/seasons/coaches.
- **D — Database only:** valid factual entity, but not casual filler.

Recognizability is not a factual stat and must never change the underlying facts.

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

## Source strategy

### CFB

Historical source family: SportsDataverse `sportsdataverse/cfbfastR-data`.

Pinned baseline:

- repository: `sportsdataverse/cfbfastR-data`
- commit: `a0f29f9ec6c04952a720905017e74a7b089dc1eb`
- license: `CC BY 4.0`
- player-stat coverage: 2014-2025
- broader schedule/game data supports earlier team/game relationships

The existing 2025 CC0 NCAA corpus is source-stage infrastructure, not a standalone casual-game roster.

### NFL

Historical source family: nflverse.

Pinned baseline includes `nflverse/nflreadr` commit `d072c08492067b578f27e562b6cc9c9e3b8589c3` plus the immutable nflverse data identities recorded by the generated manifests. Historical player/team coverage begins in 1999.

NFL identity/roster/schedule/coach data reconciles player, team, season, coach, and draft relationships to stable canonical identities.

## Depth targets

These are product targets, not hard-coded permanent corpus counts.

- CFB recognizable game-eligible players: roughly 2,000-3,000+ across the historical window as source coverage expands, with more factual database-only identities behind them.
- NFL recognizable game-eligible players: roughly 1,500+ across the historical window.
- CFB programs: all major FBS programs plus historically/game-relevant additional programs.
- NFL franchises: complete stable franchise identities.
- Team seasons: deep historical coverage, not just champions.
- Coaches: broad head-coach coverage with recognizable A-C projection.
- Eras/dynasties: objective relationship-backed eras, not per-game duplicates.

Depth tests validate the **playable result after query + recognizability + fact/evaluation gates** by league/entity/era/position/metric. A large raw corpus does not count if the game still surfaces only a tiny manual list.

## Dynasty / era rule

An era is a relationship over objective seasons, not a free-floating opinion label. Its canonical record should carry the program/franchise identity, start/end seasons, season membership, coach when relevant, wins/losses, titles, and playoff/CFP/title-game results where applicable.

Games may call an era a “dynasty” only through an explicit eligibility/calibration rule. The underlying facts remain objective.

## Storage rule

Do not solve depth by shipping raw source corpora into the browser.

Preferred flow:

`pinned source -> deterministic importer -> normalized build artifact -> identity reconciliation -> recognizability projection -> compact game-ready projection -> canonical factual/query owner -> games`

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

The roadmap is now **12 stages**. Expanding from 11 is intentional: the initial plan understated the work needed to make comparison/resume games consume the deep universe rather than merely validate their legacy lists. Splitting the correction keeps one owner/one purpose/small diff.

Football Hit the Number was already moved to the canonical quantitative ledger in PR #661 before the later numbered consumer migrations. It is therefore tracked as a completed prerequisite rather than wasting a numbered stage repeating the same migration.

### PR 1 — Knowledge contract — COMPLETE

Established this roadmap and ownership contract.

### PR 2 — Canonical entity + recognizability schema — COMPLETE

Added A-D tiers, gameplay eligibility, source identity keys, stable subject kinds, and query filters while preserving public IDs/aliases.

### PR 3 — Historical CFB player-season source adapter — COMPLETE

Added pinned 2014-2025 cfbfastR ingestion, normalized historical player-season data, manifests, and source reconciliation.

### PR 4 — Historical NFL player/team source adapter — COMPLETE

Added pinned 1999-present nflverse historical player/team ingestion, normalized records, manifests, and reconciliation.

### PR 5 — Programs, franchises, team seasons, coaches, games, championships, eras — COMPLETE

Materialized the non-player relationship layer so players are not the only first-class entity family.

### PR 6 — Recognizability projection + depth audit — COMPLETE, DEPTH TARGETS REMAIN LIVING GUARDRAILS

Created deterministic A-D projection rules and A-C promoted pools. The projection is the eligibility source for later game migrations; raw source membership alone never implies casual eligibility.

### PR 7 — Find the Leader deep migration — COMPLETE

Find the Leader now starts from the deep A-C canonical projection, checks fact availability/quality, and builds gameplay from that result. PR #711 repaired replay validation so projected subjects remain valid through the shared replay path.

### PR 8 — Keep/Cut canonical identity bridge — COMPLETE BUT NOT DEPTH-COMPLETE

PR #710 correctly moved Keep/Cut identity/category validation onto the canonical registry, but it still started from the legacy `footballRankFivePacks` rated inventory and filtered that list. That was a useful compatibility bridge, not the intended final deep migration.

PR10 supersedes that legacy-list filtering with the shared deep comparison runtime.

### PR 9 — Deep comparison candidate + evaluation authority — COMPLETE — PR #717

Created one shared comparison authority that starts from canonical A-C category queries and evaluates qualified subjects independently of legacy roster membership.

Delivered:

- one shared comparison-category query contract across all 13 packs;
- canonical A-C/projected subjects as the candidate universe;
- deterministic fact-based comparison evaluation for qualified non-legacy subjects;
- reviewed legacy ratings retained only as calibration/override for matching canonical identities;
- focused proof that supported deep categories include qualified subjects outside the legacy rated inventory;
- no game UI, route, replay, challenge, or scoring-rule rewrite.

### PR 10 — Blind Rank + Keep/Cut deep migration — COMPLETE — PR #718

Blind Rank and Keep/Cut now consume PR9’s deep canonical comparison authority in actual gameplay instead of deriving membership from the reviewed Rank Five inventory.

Delivered:

- `footballRankFivePlayableModel.ts` projects the live Blind Rank pools from the deep canonical comparison authority while preserving reviewed ratings for matching calibrated identities;
- standalone Blind Rank random, replay, URL-share, and profile-challenge resolution all use the deep playable pool;
- Keep/Cut consumes the exact same deep evaluated pool and no longer owns a duplicate category map or `legacy items -> canonical filter` membership path;
- pack-context league presentation is preserved for multi-league canonical identities;
- official Football Today’s Challenge Blind Rank and Keep/Cut use the same deep runtime through the canonical daily backend source and bundle pipeline;
- focused tests require playable non-legacy canonical subjects to surface in both standalone and official-daily boards;
- existing board construction, scoring, replay semantics, challenge schema, routes, and presentation remain unchanged.

The reviewed `footballRankFiveModel.ts` catalog remains calibration/editorial input for matching identities and for PR11’s legacy Blind Resume evidence bridge. It is not the live candidate-membership authority. Obsolete duplicate legacy runtime helpers are deferred to PR12 cleanup after all consumers have migrated.

### PR 11 — Blind Resume deep factual generation + remaining factual consumers — NEXT

**Purpose:** make Blind Resume construct truthful eight-row resumes from the deep canonical factual universe and finish any remaining objective consumer migration.

Deliverables:

- candidate membership originates from canonical A-C queries;
- resume rows are generated from canonical facts/relationships with archetype-specific completeness rules;
- legacy hand-written evidence packets become optional reviewed enhancements for matching subjects, never the candidate roster;
- no fake zero/default for unknown facts;
- materially deep playable pools by supported pack, including NFL WR depth far beyond the former four-profile inventory;
- preserve Blind Resume rules, reveal flow, matchup logic, replay, and UI;
- Wavelength may continue to own subjective prompts/ratings while using canonical identities for subject selection.

### PR 12 — Legacy cleanup + end-to-end release audit

**Purpose:** prove the large database is actually reaching the games, remove obsolete ownership paths, and verify production end-to-end.

Deliverables:

- duplicate/provider/legacy-roster audit;
- assert Hit the Number and Find the Leader still use their deep canonical paths;
- assert Blind Rank, Keep/Cut, and Blind Resume candidate membership originates from canonical queries;
- per-game/per-category playable depth report after all gates;
- tests proving qualified non-legacy subjects can actually appear;
- deterministic large-sample board/exposure simulations;
- static/runtime bundle-size audit;
- remove obsolete duplicate factual/candidate data when no longer needed for calibration, compatibility, or editorial enhancement;
- exact-head typecheck/full-suite/production-build verification;
- exact production deployment SHA verification when live behavior changes.

## Definition of done

This initiative is done when:

- Football has one canonical factual/identity authority.
- Historical NFL and CFB depth is reproducibly ingested.
- Players, programs, franchises, seasons, coaches, eras, games, awards/championships, and draft relationships are queryable.
- Thousands of recognizable NFL/CFB players are available to appropriate queries as source coverage permits.
- Non-player pools are deep enough to avoid repetitive boards.
- Obscure source records can exist without becoming casual random filler.
- **No migrated game starts from a hand-authored roster and merely filters it through the ledger.**
- **No Football game needs a hand-authored per-subject row merely to make a qualified canonical subject playable.**
- Legacy ratings/evidence are calibration/enrichment only, never membership authority.
- All objective Football consumers use the same canonical query/factual path.
- Game-depth simulations prove that the large canonical database materially expands actual gameplay, not just storage.