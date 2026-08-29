# Football Ledger — Games + NFL Eras Recognition Repair

Date: 2026-08-28

Status: recognition repair before Stage 13.6 factual exhaustion.

## Why this repair exists

The Stage 13.5 durable census exposed three recognition pools whose shapes were not credible as final historical universes:

- NFL notable games: 26 A-C subjects, with only 2 Tier A, 0 Tier B, and 24 Tier C;
- NFL eras/dynasties: 12 A-C subjects, with no Tier C depth;
- CFB notable games: 25 A-C subjects, almost entirely modern.

The NFL game issue was architectural as well as editorial: the generated production projection promoted two hand-picked Super Bowls to A and treated the remaining recent Super Bowls as C, so it was not an independent historical-game census.

This repair does **not** change the canonical identity/query owner. `footballSubjectRegistry.ts` remains the identity/query owner and `footballRecognizabilityProjection.ts` remains the recognizability projection owner.

## Reviewed recognition evidence

### NFL notable games

Independent census: NFL 100 Greatest Games.

- NFL and the Associated Press selected the NFL 100 lists with an 80-person blue-ribbon panel chosen by AP and NFL Media.
- The reviewed source universe contains 100 historical games rather than only recent production-feed games.
- A-C survivors are persisted as recognizability evidence; the source-list rank is retained only as provenance and is **never** a Football HQ greatness/ranking score.
- A post-2019 refresh extends recognition review through the 2025 NFL season.

Primary reference:

- https://www.nfl.com/100/originals/100-greatest/

### CFB notable games

Independent census: ESPN CFB150 Greatest Games.

- ESPN's 150-person panel selected 150 games from 202 finalists identified by ESPN Stats & Information.
- The panel included media, administrators, former players and coaches.
- A-C survivors are persisted as recognition evidence; ESPN ordering is provenance only and is never a Football HQ greatness/ranking score.
- A post-2019 refresh extends recognition review through the 2025 CFB season.

Primary references:

- https://www.espn.com/college-football/story/_/page/CFB150games/the-150-greatest-games-college-football-150-year-history
- https://www.espn.com/college-football/story/_/id/27582331/espn-cfb150-blue-ribbon-panel-150-voters

### NFL eras / dynasties

The repair expands beyond the modern 12-row seed using NFL historical dynasty retrospectives plus reviewed coherent championship/contender windows.

NFL.com explicitly identifies major dynasty windows including the 1960-67 Packers, 1972-79 Steelers, long Landry Cowboys run, 1981-98 49ers and 1990s Cowboys, with later title/contender eras reviewed on the same identity principles.

Primary reference:

- https://www.nfl.com/news/dallas-cowboys-green-bay-packers-among-top-nfl-dynasties-0ap2000000339226

## Ownership change

`src/features/back-room/footballHistoricalPoolRecognitionEvidence.ts` is a subordinate reviewed-evidence input. It does not become a runtime query owner.

`footballRecognizabilityProjection.ts` now:

1. keeps generated production records as the source for projected franchises;
2. stops using generated production-game tiers as A-C membership authority;
3. reconciles the reviewed NFL/CFB game and NFL era evidence into the existing canonical projection;
4. applies the existing historical tier policy after review;
5. deduplicates the older reviewed game/era seed IDs when the deeper census owns the same identity.

The historical policy remains unchanged:

- NFL pre-1970: A only by default;
- NFL 1970-1999: A/B;
- NFL 2000-present: A/B/C;
- CFB pre-1980: A only by default;
- CFB 1980-2004: A/B;
- CFB 2005-present: A/B/C.

## What this repair does not claim

Recognition does not prove factual readiness.

Many newly admitted historical games and eras will initially be partial or identity-only because the existing factual feeds were never built around this deeper historical recognition census. That is expected and must remain visible in the ledger audit.

The next gate is **Stage 13.6 — Factual Exhaustion Audit & Repair**:

- every missing required fact receives a real source-by-source research attempt;
- a gap may remain only when the reasonable authoritative/credible sources have been exhausted and the fact is documented as unavailable or unreliable;
- no estimates, inferred stand-ins or fake zeros;
- zero uninvestigated factual gaps before factual closeout;
- no ranking-model implementation/calibration should advance on a pool whose remaining missing facts are material or unexplained.

Stage 14 architecture may exist as design documentation, but ranking implementation/calibration remains gated on Stage 13.6.
