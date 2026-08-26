# Football Knowledge Ledger

Last reviewed: 2026-08-25

## Purpose

Football HQ needs one deep factual authority that can support every objective Football game without rebuilding shallow game-specific pools.

`src/features/back-room/footballFactualStats.ts` remains the canonical public owner for objective Football facts. This initiative expands the data and identity layers behind that owner; it does not create a second runtime provider, fallback query path, or competing game-specific database.

The target is a queryable Football knowledge system covering NFL and CFB players, teams/franchises, programs, individual seasons, coaches, eras/dynasties, games, championships, awards, and draft relationships.

## Product outcome

Football games should stop asking, “do we have 10 names for this category?” They should ask the canonical ledger for a large eligible pool.

Examples:

- Find the Leader: CFB running backs, 2005-2025, rushing yards, recognizable tiers A-C.
- Hit the Number: four CFB programs whose combined title/award/stat value can exactly hit a generated target.
- Blind Resume: coaches or players with objective career/season facts.
- Blind Rank: programs, franchises, players, coaches, team seasons, or eras ordered by a factual metric.
- Keep/Cut: recognizable comparable entities selected from the same canonical identity universe.

The games own presentation, rules, randomization, and board construction. They do not own copied factual values.

## Canonical layers

### 1. Source layer

Pinned, reproducible external datasets are build-time inputs. No game should call a public sports API directly at runtime.

Every source adapter must record:

- provider/repository
- exact pinned commit, release, or immutable asset identity
- source path/URL
- license
- seasons/coverage
- import schema version
- generated artifact hash and row/entity counts

### 2. Identity layer

One canonical identity graph connects the same football subject across seasons and contexts.

Primary entity families:

- `player`: one person identity spanning NFL/CFB when applicable
- `player-season`: one player in one season, optionally team/program scoped
- `franchise`: NFL franchise identity
- `program`: CFB program identity
- `team-season`: one franchise/program in one season
- `coach`: one coach identity
- `era`: an objective franchise/program/team era used for dynasty queries
- `game`: one historical NFL/CFB game
- `award/championship`: objective honor/event relationship
- `draft`: player -> school -> NFL franchise -> year/round/pick relationship

Existing canonical subject IDs and aliases must be preserved. New source IDs are reconciliation keys, not replacement public IDs.

### 3. Fact layer

Objective records continue to flow through the existing Football factual owner.

Facts may include:

- player season/career passing, rushing, receiving, defense, kicking, returns
- team-season record, scoring, point differential, postseason result, championship flags
- coach record, titles, postseason appearances, stops
- program/franchise historical totals and era totals
- awards/championships
- draft facts
- explicit reproducible derived metrics

No subjective “greatness,” aura, uniform, rivalry-hatred, or era-adjustment score belongs here.

### 4. Recognizability / eligibility layer

Data depth and game eligibility are separate concepts.

The factual warehouse may contain obscure players and seasons. Casual games should not automatically surface them.

Every game-queryable entity receives a recognizability tier:

- **A — Iconic:** household football names/teams/eras.
- **B — Very recognizable:** major stars, prominent award contenders, major coaches, championship teams, high-profile programs/franchises.
- **C — Football-fan recognizable:** meaningful starters/contributors, notable draft picks, productive major-program players, memorable teams/seasons/coaches.
- **D — Database only:** valid factual entity, but not casual filler.

Default casual Football games may use A-C. D requires an explicit specialized query or future hardcore mode.

Recognizability is not a factual stat and must never change the underlying facts.

### 5. Query / projection layer

Games query one canonical owner using filters such as:

- league: NFL / CFB
- entity kind
- season / decade / range
- position
- school/program
- conference
- franchise
- coach
- draft year/round/pick
- championships/awards
- metric availability
- minimum recognizability tier

Generated source corpora should not be imported wholesale into the initial React bundle. Build-time generation should create compact runtime projections/manifests for the entities and metrics the app can actually query.

## Source strategy

### CFB

Historical player source authority: SportsDataverse ESPN CFB player box scores published in `sportsdataverse/sportsdataverse-data`.

Canonical source lock for PR 3:

- repository: `sportsdataverse/sportsdataverse-data`
- release ID: `334089407`
- release tag: `espn_cfb_player_box`
- license: `CC BY 4.0`
- coverage: 2004-2025 inclusive
- source lock: `scripts/football-cfb-historical-source-lock.json`
- every annual compressed source asset is pinned by GitHub asset ID and SHA-256 before import
- normalized output: 140,007 player-team seasons, 65,011 unique ESPN athlete IDs, 261 ESPN team IDs, 37 identity/stat columns across 22 seasons

The deterministic importer lives at `scripts/import-football-cfb-historical-player-seasons.mjs`. It aggregates ESPN game/category rows into player-team-season records while preserving athlete, team, season, and game-count identity plus passing, rushing, receiving, defense, kicking, punting, and return production.

The existing 2025 CC0 NCAA corpus from PR #679 remains useful source-stage infrastructure, but it is not the historical Football knowledge solution and must not be treated as the game pool.

### NFL

Historical source family: nflverse.

Pinned research baseline:

- repository/tooling: `nflverse/nflreadr`
- commit inspected: `d072c08492067b578f27e562b6cc9c9e3b8589c3`
- `load_player_stats` / `load_team_stats` expose season data from 1999 through the current available season from `nflverse/nflverse-data` release assets.

NFL ingestion should also use nflverse identity/roster/schedule data where needed so player, team, season, and draft relationships reconcile to one stable identity system.

Before a source becomes canonical, its exact data license and immutable release/source identity must be recorded in the generated manifest.

## Depth targets

These are product targets, not hard-coded permanent corpus counts.

- CFB recognizable game-eligible players: roughly 2,000-3,000+ across the historical window, with more factual database-only identities behind them.
- NFL recognizable game-eligible players: roughly 1,500+ across the historical window.
- CFB programs: all major FBS programs plus additional programs when historically/game relevant.
- NFL franchises: complete historical franchise set represented by stable canonical franchise identities.
- Team seasons: deep historical season coverage, not just champions.
- Coaches: broad head-coach coverage with a recognizable A-C projection.
- Eras/dynasties: generated/curated from objective season ranges and accomplishments, not duplicated per game.

Depth tests should validate minimum coverage by entity family, league, era, position, and metric—not one magic total row count.

## Dynasty / era rule

A dynasty is a relationship over objective seasons, not a free-floating opinion label.

An era record must have:

- canonical program/franchise/team identity
- start and end season
- coach when relevant
- season membership
- wins/losses
- conference/division titles when applicable
- national championships / Super Bowls when applicable
- playoff/CFP/title-game appearances when applicable

Games may call the era “a dynasty” only through an explicit eligibility/calibration rule. The underlying era facts remain objective.

## Storage rule

Do not solve depth by shipping hundreds of megabytes of raw CSV into the browser.

Preferred flow:

`pinned external source -> deterministic importer -> normalized build artifact -> identity reconciliation -> eligibility projection -> existing factual/query owner -> games`

Raw source files may remain external when they are immutable/pinned and reproducibly importable. Generated runtime artifacts must be compact, hashed, validated, and excluded from the initial JS bundle unless a consumer explicitly needs them.

## Release / ownership rules

For every PR in this initiative:

1. Resolve current `main` before branching.
2. Preserve `footballFactualStats.ts` / `footballSubjectRegistry.ts` as the canonical public factual/identity query ownership path unless a dedicated migration PR explicitly changes that ownership.
3. One narrow purpose per PR.
4. No runtime external sports API fallback.
5. No game-specific duplicate factual catalog.
6. Add focused coverage/depth/reconciliation tests.
7. Exact final head must pass typecheck, full tests, production build, and relevant backend verification.
8. Merge only the exact green head.
9. If live behavior changes, verify the production deployment marker matches the merged SHA.

## PR buildout

This sequence is intentionally ordered so source scale exists before games are migrated.

### PR 1 — Knowledge contract

**Purpose:** establish this file as the canonical roadmap and architecture contract.

No runtime behavior change.

### PR 2 — Canonical entity + recognizability schema

**Purpose:** extend the existing subject/query model so every entity family can carry stable source reconciliation and game eligibility metadata without duplicating identities.

Deliverables:

- recognizability tier A-D
- gameplay eligibility profiles
- source identity keys
- stable franchise/era/game-capable subject kinds as required
- query filters for recognizability and expanded entity families
- regression tests proving existing IDs/aliases still resolve

### PR 3 — Historical CFB player-season source adapter

**Purpose:** replace “2025-only bulk depth” as the long-term player source with reproducible multi-season CFB ingestion.

Deliverables:

- pinned SportsDataverse ESPN player-box source adapter
- 2004-2025 player-team-season ingestion
- normalized player-season schema
- identity reconciliation keys for player/team/season
- compact manifests and coverage report
- no automatic game eligibility for obscure source rows

### PR 4 — Historical NFL player/team source adapter

**Purpose:** create the matching nflverse ingestion path.

Deliverables:

- 1999-present player/team season ingestion
- stable nflverse identity reconciliation
- season/team/player normalized records
- compact manifests and coverage report

### PR 5 — Programs, franchises, team seasons, coaches, games, and era relationships

**Purpose:** make non-player pools first-class canonical data.

Deliverables:

- CFB program + team-season relationships
- NFL franchise + team-season relationships
- coach identity/stops/season relationships
- historical game relationships where source coverage is reliable
- objective era records that can support dynasty queries
- championships/postseason relationships

### PR 6 — Recognizability projection + depth audit

**Purpose:** turn deep source data into genuinely usable Football HQ pools without random obscure filler.

Deliverables:

- deterministic A-D recognizability projection inputs/rules
- explicit manual overrides only for genuine edge cases, not as the primary database
- target A-C player depth in the thousands across NFL + CFB
- A-C programs/franchises/seasons/coaches/eras pools
- coverage audit by league/entity/era/position/metric
- hard regression preventing a return to 10-20-name category pools

### PR 7 — Find the Leader migration

**Purpose:** make Find the Leader query the deep canonical projection for all Football entity/metric lanes.

Remove any remaining game-owned candidate/fact duplication covered by the ledger.

### PR 8 — Hit the Number migration

**Purpose:** make Hit the Number use the same authority for exact-solution boards across players and non-player entities.

Preserve its exact-solution invariant and existing canonical game ledger behavior.

### PR 9 — Blind Resume + Blind Rank migration

**Purpose:** move factual resumes/ranking pools to canonical player, coach, program, franchise, season, and era queries.

### PR 10 — Keep/Cut + remaining factual Football consumers

**Purpose:** migrate remaining objective candidate pools and remove obsolete duplicate Football factual data.

Wavelength/opinion content may use canonical identities for selection but remains the owner of subjective prompts/ratings.

### PR 11 — Legacy cleanup + release audit

**Purpose:** remove source-stage paths that are no longer authoritative, verify no game owns a duplicate factual truth, and prove production depth end-to-end.

Deliverables:

- legacy/duplicate provider audit
- static bundle-size audit
- game pool depth simulation
- deterministic board simulation across all migrated games
- production SHA verification

## Definition of done

This initiative is done when:

- Football has one canonical factual/identity authority.
- Historical NFL and CFB depth is reproducibly ingested.
- Players are only one entity family; programs, franchises, seasons, coaches, eras, games, awards/championships, and draft relationships are queryable too.
- Thousands of recognizable NFL/CFB players are actually eligible for appropriate games.
- Non-player pools are deep enough to avoid repetitive boards.
- Obscure source records can exist without becoming casual random filler.
- No Football game needs a hand-authored list merely to reach a minimum board size.
- All factual Football consumers use the same canonical query path.
