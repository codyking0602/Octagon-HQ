# NBA GM Phase 2 — private playable vertical slice

October 30, 2026. **Development only. Not released, approved for production, or public.**

## What runs

* Owner-only route: `/nba/gm-dev`, guarded by the same strict CODY control-owner check as historical NBA previews; never linked from the public NBA hub.
* Reuses Football GM's `private.football_gm_runs` and `private.football_gm_run_snapshots`. No new public GM accounts, match engine, or franchise storage table.
* 330 candidates and all 1,980 frozen basketball skill grades copied from the merged provisional JSON. The source board is **not bundled into public frontend JavaScript**. The 330-player development fixture lives in a private SQL table, readable only by gated, authenticated RPC.
* Every player is **position-provisional**. No position-review flag or unverified identity has been silently certified.
* Seven picks: PG, SG, SF, PF, C, Sixth Man, FLEX. Owner chooses an open slot, server draws an NBA team with an eligible affordable candidate, owner chooses one of that team's player cards. All spins, anti-duplicate checks and cap constraints are enforced server-side.
* Fixed **$192.5M each season, only as a DEVELOPMENT SCENARIO**, selected from the three preexisting unapproved calibration limits (185 / 192.5 / 200). No public budget decision has been made.
* Game fixture prices generated from frozen overalls by `roundTo100k(2.5M + 58M * (max(overall - 73, 0) / 26)^1.8)`; years 2–3 use 1.05x / 1.10x. **These are not NBA salaries, extensions, existing contract years, or actual guarantees.** Varying game prices deliberately introduces superstar-versus-depth tradeoffs; revisit before release.
* Candidate affordability checks all three years and reserves the least expensive *other* available player for each still-open slot. Final seven-player review checks duplicates, slot eligibility, and three-year cap before lock.
* Confirm runs a deterministic, server-resolved three-season/82-game basketball prototype model. It weights scoring, shooting, playmaking, perimeter and interior defense, rebounding, guarded positions, big-man duties, fit/weak links, and seed-derived variance. Overall ratings are not blended into the outcome formula.
* Sessions persist on the existing private Football GM run/snapshot architecture and can be resumed or restarted. Completed seasons cannot be drafted again.
* Layout follows compact Football GM hierarchy, with NBA logos and colors, all six skills visible, cap bars, obvious slot selections, and mobile wraps.

## How to playtest (only on an isolated development backend)

1. Apply migrations `202612310893` and `202612310894` to a **development Supabase database**, not production.
2. Use an authenticated CODY/TEST profile listed in `pick_control_owners`.
3. Run the development application and open `/nba/gm-dev`; start a franchise, draft seven positions, confirm and review seasons; reload midway to test resume.
4. Execute `supabase/tests/nba_gm_private_playtest.sql` in the development DB. It rolls back owner/outsider fixture accounts and exercises the entire RPC lifecycle.
5. Run `npx vitest run src/features/nba/nbaGmDevPrototype.test.ts src/features/nba/nbaGmFoundation.test.ts src/features/back-room/footballGmEngine.test.ts`, `npm run typecheck`, and `npm run build`. Confirm no public NBA GM hub button and no `PROVISIONAL` JSON bundle.

## Unresolved owner choices / release blockers

* Salary policy: approve a cap scenario or real sourced NBA salary economics; current fixture pricing is **not** a researched NBA contract bank.
* Player positions: validate canonical positional eligibility and the remaining unresolved official NBA IDs; continue to retain unverified labels for all candidate-position records.
* Team-wheel pacing: whether choice is slot-first, spin-first, or another mechanic; current prototype uses slot-first to prevent impossible drafts.
* Franchise rules: trades, free agency, development, salary increases, additional injuries/substitutions and roster changes are **not implemented**. Current three-year sim holds the same seven-player roster and game-price schedule.
* Basketball tuning: season win curves, postseason thresholding (currently a developmental win-band approximation), elite-specialist impact, team balance, and whether there should be a competitive opponent. A real bracket is **not yet implemented**.
* No migration has been deployed, no production runtime has been changed, and no public route/leaderboard has been enabled.

**Next:** Verify isolated development DB migration+integration tests and conduct owner playtesting; tune the economy and simulation; only then request separate merge/deploy/public-launch approval.
