# The HQ — Current Handoff

_Last updated: 2026-09-04_

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
- Production app: `https://octagon.hq-app.workers.dev`
- `main` is the live source of truth.
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

The active product is The HQ with UFC and Football sport contexts.

### UFC normal Play library

- Find the Leader
- Wavelength
- Blind Resume
- Hit the Number
- Auction

20 Questions and Who Am I remain planned roadmap games and are not exposed as fake placeholders.

Blind Rank 5 and Keep 4 / Cut 4 are removed from normal library discovery but retained for Daily Double/history/deep-link compatibility.

### Football normal Play library

- Find the Leader
- Wavelength
- Hit the Number

Football Blind Resume is now **Daily-only**. The old standalone route redirects to the canonical Football Today owner rather than maintaining a second runtime.

20 Questions, Who Am I, and Draft Room remain planned roadmap games and are not exposed until implemented.

### Football Today's Challenge

Football Today's Challenge reuses the shared Daily Challenge platform.

Canonical route:

- `/back-room/football/today`

The platform remains sport-scoped through the shared Daily runtime/repository/backend owners. Do not create Football-specific attempt/history/standings/streak/leaderboard/notification/share persistence stacks.

Current Football Blind Resume contract:

- Daily-only;
- three rounds;
- three reveal stages;
- canonical Football factual evidence;
- curated explicit matchup verdicts instead of fake exact within-tier greatness rankings;
- +10/-4, +8/-1, +7/0 scoring ladder normalized to the official Daily 0–100 result;
- canonical team/program reveal media.

## Games roadmap status

`docs/the-hq-games-roadmap.md` is the sole active Games roadmap.

Completed:

- PR 1 — canonical Games roadmap (#863)
- PR 2 — source authority + eligibility (#864)
- PR 3 — Play landing/presentation parity (#865, repair #866)
- PR 4 — Find the Leader parity/source pass (#870)
- PR 5 — Wavelength parity/calibration (#873; complete)
- PR 6 — Blind Resume final pass, including the newer Football Daily-only direction (#878–#882)

### Next Games PR

**PR 7 — Hit the Number final parity/source pass.**

Do not restart Wavelength. Do not infer the next PR from an obsolete roadmap.

## Football canonical data ownership

Objective Football facts flow through the canonical Football factual registry/facade and approved generated evidence.

Comparative greatness flows through the canonical Football comparison/ranking authority where the mechanic legitimately requires it. Legacy reviewed packs may calibrate matching canonical identities but must not become a competing source owner.

Missing evidence excludes a subject from that mechanic. Do not create a second factual table, fallback rating catalog, or manual game-only truth layer.

## Picks monitoring operations

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

1. Remove any remaining V1 runtime URL/dependency.
2. Keep duplicate Cloudflare native Git deployment disabled.
3. Keep required backend verification genuinely green; repair failures at their canonical root.
4. Confirm production `main` and the live deployment SHA match.
5. Keep this handoff and the two canonical roadmaps current.
6. Prove exact-head frontend/backend release paths whenever changed scope requires them.

## Validation standard

Every production PR requires the exact final head to pass:

- `npm run typecheck`
- `npm test`
- `npm run build`

Relevant Supabase SQL tests, migration-order checks, backend verification, phone/browser proof, exact deployment verification, and temporary-proof cleanup must also pass when applicable.

## Next safe action

For Games work, continue with **The HQ Games PR 7: Hit the Number final parity/source pass** from current `main`.

For other product areas, read the canonical owner for that scope first and preserve the same one-owner release standard.