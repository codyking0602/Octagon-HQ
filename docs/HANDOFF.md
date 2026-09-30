# The HQ — Current Handoff

_Last updated: 2026-09-30_

This is the cold-start operational handoff for `codyking0602/Octagon-HQ`. Current `main` is always the live source of truth; resolve it from GitHub before every branch rather than trusting a copied SHA in this file.

## Required reading by scope

Use the smallest set of canonical documents that owns the work:

- `docs/HANDOFF.md` — current architecture, deployment ownership, live product state, and next safe action.
- `docs/the-hq-universal-app-roadmap.md` — universal shell, Home, sport switching, branding, navigation, profile, notifications, onboarding, and sport theming.
- `docs/the-hq-games-roadmap.md` — **sole Games roadmap** for UFC + Football Play, Today's Challenge, Games source ownership, 20 Questions, Who Am I, Auction, and Draft Room.
- `docs/product-blueprint.md` — stable product/architecture principles.
- `docs/RANKINGS-MIGRATION.md` and `docs/rankings-parity-contract.md` — ranking migration/parity ownership.
- `docs/intelligence-verdict-flow.md` and `docs/octagon-verdict-export.md` — Octagon Verdict flow/export ownership.

Do not revive superseded roadmap files or use historical implementation notes as a competing current plan.

## Repository and production

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Canonical production app: `https://the.hq-app.workers.dev`
- Legacy compatibility URL: `https://octagon.hq-app.workers.dev` — redirect-only Worker; not the authoritative production host.
- `main` is the live source of truth.
- Resolve the current `main` HEAD from GitHub before every branch. Never trust a copied SHA in a handoff document.
- The legacy V1 repository is reference-only.
- The completed V1 history migration must never be rerun.
- Any remaining V1 runtime URL/dependency is a stabilization defect, not a fallback.

## Working standard

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

For every production slice:

1. Resolve current `main` before creating the branch.
2. Find and preserve the existing canonical owner.
3. Make one narrow change.
4. Do not add a fallback, duplicate provider, second query path, competing route owner, or duplicate initialization.
5. Add focused tests when behavior changes.
6. Require the exact final head to pass typecheck, the full test suite, and the production build.
7. Require relevant backend verification to be genuinely green.
8. Deploy only through the canonical GitHub Actions owner when live testing/release is needed.
9. Verify the exact live deployment SHA before calling a change live.

## Repository tool routing

Repository operations use the connected GitHub tools as the primary and canonical repository interface.

1. Resolve `main`, read files, inspect trees/branches/PRs/workflows, create branches/commits/PRs, and merge through the connected GitHub tools.
2. Do not clone the repository into a container or use shell Git as first-line repository access. Only use a local clone if Cody explicitly asks for local Git work or a task genuinely requires execution that the GitHub connector cannot perform.
3. Read known paths directly with GitHub file fetches. Use code search only to locate an unknown owner.
4. If two searches fail to locate an owner, stop changing search terms. Trace from the relevant registry/router/provider or inspect the owning directory/tree instead.
5. A failed repository tool call is a strategy-change trigger, not a retry-loop trigger. Change method and continue; do not repeat near-identical searches.
6. Do not use web search, File Library, or generic shell browsing as substitutes for GitHub repository access.
7. Before editing, load the GitHub write, PR, and workflow actions needed to complete the task through the same repository path.
8. Local execution may be used when needed for focused tests, typecheck, or builds, but it never becomes a competing source of truth; GitHub `main` and the exact branch SHA remain canonical.

## Deployment ownership

GitHub Actions is the only deployment owner.

Canonical frontend deployment:

- `.github/workflows/deploy-cloudflare.yml`

Canonical backend deployment:

- `.github/workflows/deploy-supabase.yml`

Cloudflare Workers remains the V2 production frontend and rich-preview runtime. Cloudflare's native repository/Git deployment integration is not authoritative and must remain disabled so there is no second deployment path.

Never claim a change is live merely because it merged.

## Current architecture

The application is React, TypeScript, and Vite.

Supabase owns authentication, profiles, database state, migrations, RPCs, Edge Functions, scheduled monitoring, Picks, challenges, notifications, push delivery, and cross-device persistence.

Cloudflare Workers owns production frontend delivery, SPA route handling, and server-side rich share previews.

Canonical application owners include:

- `src/main.tsx` — one application entry.
- `src/app/App.tsx` — startup/readiness owner.
- `src/app/router.tsx` — routing owner.
- `src/lib/supabase.ts` — Supabase client.
- `src/features/identity/IdentityProvider.tsx` — identity/session owner.
- `src/features/challenges/ChallengeProvider.tsx` — challenge state owner.
- `src/features/profile/ProfilePreferencesProvider.tsx` — profile preferences owner.
- `src/features/picks/PicksProvider.tsx` / `picksRepository.ts` — player-facing Picks ownership.
- `src/features/picks-control/pickControlRepository.ts` — Fight Night control browser owner.
- `src/features/picks-setup/pickSetupRepository.ts` — staged Event Setup browser owner.
- `src/features/picks-monitoring/monitoringInboxRepository.ts` — Monitoring Inbox browser/Edge Function owner.
- `src/features/members/memberProfilesRepository.ts` — authenticated member profile projections.
- calculated ranking engine/model — sole ranking calculation ownership.

Consumers use canonical providers/repositories instead of independently resolving identity, duplicating Supabase queries, or writing official state outside the established owner.

## Current Games product

The active product is The HQ with UFC and Football sport contexts, plus the temporary 2026 MLB postseason experience.

### UFC normal Play library

- Find the Leader
- Wavelength
- Blind Resume
- Hit the Number
- Who Am I
- Auction

### Football normal Play library

- Find the Leader
- Wavelength
- Hit the Number
- Who Am I
- Draft Room

20 Questions is retired. Historical Daily Double, Football Blind Resume, and other retired/older Daily content remain valid for history/deep-link compatibility but are not part of the current future weighted Daily cycles. Average Fan, Millionaire, Sports Feud, and Bar Trivia are Daily families and are not part of the normal All Games libraries.

### Football Draft Room

Draft Room is public for authenticated members after the September 14, 2026 Stage 15 release. It remains outside Today's Challenge and continues to reuse the canonical Auction sealed-bid backend/challenge lifecycle.

Launch formats:

- NFL Build a QB
- CFB Build a QB
- NFL QB / RB / WR Trio
- CFB QB / RB / WR Trio
- Cowboys Since 2007
- Longhorns Since 2003
- Cowboys Teams Since 2007
- Longhorns Teams Since 2003
- Best CFB Teams
- NFL Divisions

Front Seven and Secondary are deferred post-launch and are not missing release scope.

## Football Today's Challenge

Football and UFC reuse the shared Daily Challenge platform; this section documents the shared current Daily state while preserving the historical heading used by validation contracts.

Canonical routes:

- UFC: `/play/today`
- Football: `/football/today`

The shared `daily-challenge-runtime` owns private setup/actions/grading, persistence, history, streaks, standings, leaderboards, competition, and reminders. Do not create sport-specific duplicate stacks.

Current weighted cycles begin **October 1, 2026** and are immutable once materialized:

- Football, 27 slots: Average Fan ×5, Millionaire ×4, Sports Feud ×4, Bar Trivia ×3, Find the Leader ×3, Wavelength ×3, Who Am I ×3, Hit the Number ×2.
- UFC, 29 slots: Average Fan ×5, Millionaire ×4, Sports Feud ×4, Bar Trivia ×3, Find the Leader ×3, Wavelength ×3, Who Am I ×3, Blind Resume ×2, Hit the Number ×2.

October 1 intentionally launches Average Fan in both sports. Football's first official Average Fan appearance is CFB; later Football Average Fan appearances alternate CFB/NFL from publication history.

## Games roadmap status

`docs/the-hq-games-roadmap.md` is the sole active Games roadmap.

The original 15-stage Games launch is complete. Post-launch work that is also complete includes Sports Feud, Millionaire, Bar Trivia, the CFB Superteam Weekly Auction, two-game Daily standardization, and the canonical Average Fan Daily launch for October 1, 2026.

Average Fan Casual/owner preview routes were intentionally closed after approval; the production game is Daily-only. Front Seven and Secondary remain optional post-launch Draft Room additions, not unfinished launch scope.

## Football canonical data ownership

Objective Football facts flow through the canonical Football factual registry/facade and approved generated evidence.

Comparative greatness flows through the canonical Football comparison/ranking authority where the mechanic legitimately requires it. Legacy reviewed packs may calibrate matching canonical identities but must not become a competing source owner.

Distinctive biographical/person-specific research must flow through one shared canonical person-knowledge owner with provenance so Who Am I and other games can reuse it. Structural/resume fact depth and distinctive identity depth are separate quality dimensions; multiple mathematical derivatives of the same career window do not count as multiple personal identity concepts.

Missing evidence excludes a subject from that mechanic. Do not create a second factual table, fallback rating catalog, manual game-only truth layer, or Who Am I-only personal trivia owner.

## Picks monitoring operations

Current player-facing behavior includes:

- Automatic validated pre-lock sportsbook odds applied only through the canonical Picks monitoring path.
- ESPN live-state-aware Fight Night behavior so trusted provider attachment owns automatic fight-by-fight locking while schedule times remain estimates.

Canonical owners include:

- `supabase/functions/run-pick-monitoring/index.ts`
- `src/features/picks-monitoring/manualMonitoringRunner.ts`
- `src/features/picks-monitoring/monitoringStorageModel.ts`
- canonical monitoring RPCs in Supabase
- `.github/workflows/deploy-supabase.yml`

The database owns exactly one canonical `octagon-hq-pick-monitoring` cron job on the current five-minute cadence (`*/5 * * * *`).

Trusted ESPN live/final state may own fight-by-fight lock progression where attached; schedule times remain estimates. Monitoring remains fail-closed: stale/wrong/unmatched/partial/provider-failure/post-lock evidence preserves the last valid state rather than inventing a fallback.

## Ranking ownership

- `src/features/rankings/data/rankingInputs.ts` — canonical ranking inputs.
- `src/features/rankings/engine/categoryCalculators.ts` — category calculations.
- `src/features/rankings/engine/rankingEngine.ts` — weighting, totals, tie breakers, ranks, anchored OVR projection.
- `src/features/rankings/engine/eraWindow.ts` — audited date windows.
- `src/features/rankings/rankingModel.ts` — app-facing calculated projection/profile lookup.

Main ranking rules:

- UFC-only unless explicitly changed.
- Do not score Pride, Strikeforce, WEC, ONE, Bellator, or regional accomplishments in the main rankings.
- Do not manually enter ranks, OVRs, totals, or category scores.
- Do not recreate static ranking arrays.
- Jon Jones remains the 99 OVR benchmark unless the approved ranking philosophy changes.

## Octagon Verdict

Canonical owners:

- `src/features/intelligence/octagonVerdictExport.ts`
- `scripts/export-octagon-verdict.mjs`
- `.github/workflows/export-octagon-verdict.yml`
- `docs/octagon-verdict-export.md`

Generated artifacts are outputs, not editable source data. Ranking/exporter changes may generate a new Actions artifact, but the Custom GPT knowledge file still requires manual replacement in the GPT editor.

Fighter-count validation must remain synchronized with the canonical ranking dataset rather than being permanently hard-coded to a historical count.

## Stabilization priority

Before broad unrelated expansion:

1. Finish the remaining UFC fighter asset-ingest background-cleanup hardening; PR #1533 is the one current open implementation item that is not stale/superseded.
2. Keep duplicate Cloudflare native Git deployment disabled.
3. Keep required backend verification genuinely green; repair failures at their canonical root.
4. Confirm production `main` and the live deployment SHA match for runtime changes.
5. Keep this handoff and the canonical roadmaps synchronized with current `main`.
6. Treat old open PRs/issues as cleanup debt; close them when their work is already merged or superseded rather than reviving stale branches.

## Validation standard

Every production PR requires the exact final head to pass:

- `npm run typecheck`
- `npm test`
- `npm run build`

Relevant Supabase SQL tests, migration-order checks, backend verification, phone/browser proof, exact deployment verification, and temporary-proof cleanup must also pass when applicable.

## Next safe action

For Games, work from the current weighted Daily cycles and current Play/Draft Room owners rather than older v4/v7 rotation notes. Treat Front Seven, Secondary, and additional Draft Room subjects as explicit future product decisions.

For UFC Picks operations, preserve the current Event Setup / monitoring / Fight Night ownership. Fighter replacement and live fight removal are already implemented on `main`; do not recreate those systems from old issues. The remaining known repo-level implementation cleanup is fighter asset-ingest hardening.

For Home/editorial operations, weekly Football Player Spotlight and CFB/NFL Game of the Week content still require normal weekly curation.
