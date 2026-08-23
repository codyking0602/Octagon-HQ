# Octagon HQ V2 — Current Handoff

_Last updated: 2026-08-23_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main` before editing.

## Repository and production

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Live app: `https://octagon.hq-app.workers.dev`
- `main` is the live source of truth.
- Resolve the current `main` HEAD from GitHub before every branch. Never trust a copied SHA in a handoff document.
- The legacy V1 repository, `codyking0602/ufc-goat-rankings`, is reference-only.
- The completed V1 history migration must never be rerun.
- V1 runtime URLs and dependencies must remain absent from production code. Treat any remaining runtime reference as a stabilization defect, not as a fallback.

## Working standard

Use:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

For every production slice:

1. Resolve current `main` before creating the branch.
2. Find and preserve the existing canonical owner.
3. Make one narrow change.
4. Do not add a fallback, duplicate provider, second query path, competing route owner, or duplicate initialization.
5. Add focused tests when runtime behavior changes.
6. Require the exact final head to pass typecheck, the full test suite, and the production build.
7. Require genuinely green backend verification when backend-owned files change.
8. Deploy the exact head when live testing is required.
9. Verify the exact live deployment SHA before calling the change live.

Do not use old branches, temporary deployment workflows, duplicate providers, local fallbacks, competing query paths, broad cleanup, or V1 runtime assumptions.

## Deployment ownership

GitHub Actions is the only deployment owner.

Canonical frontend deployment:

- `.github/workflows/deploy-cloudflare.yml`

Canonical backend deployment:

- `.github/workflows/deploy-supabase.yml`

Supporting verification/handoff workflows may call those canonical owners, but they do not become separate deployment owners.

Cloudflare Workers remains the V2 production host and rich-preview runtime. Cloudflare's native repository/Git deployment integration is not authoritative and must remain disabled so there is no second deployment path.

Never claim a change is live merely because it merged. Confirm the canonical workflow deployed the intended SHA and that the live deployment marker matches it.

## Current architecture

The application is React, TypeScript, and Vite.

Supabase owns authentication, profiles, database state, migrations, RPCs, Edge Functions, scheduled monitoring, Picks, challenges, notifications, push delivery, and cross-device persistence.

Cloudflare Workers owns production frontend delivery, SPA route handling, and server-side rich share previews.

Canonical application owners include:

- `src/main.tsx` — one application entry.
- `src/app/App.tsx` — one startup/readiness owner.
- `src/app/router.tsx` — one routing owner.
- `src/lib/supabase.ts` — one Supabase client.
- `src/features/identity/IdentityProvider.tsx` — identity/session owner.
- `src/features/challenges/ChallengeProvider.tsx` — challenge state owner.
- `src/features/profile/ProfilePreferencesProvider.tsx` — profile preferences owner.
- `src/features/picks/PicksProvider.tsx` — player-facing Picks owner.
- `src/features/picks/picksRepository.ts` — browser Supabase owner for player Picks.
- `src/features/picks-control/pickControlRepository.ts` — browser Supabase owner for Fight Night control.
- `src/features/picks-setup/pickSetupRepository.ts` — browser Supabase owner for staged Event Setup.
- `src/features/picks-monitoring/monitoringInboxRepository.ts` — browser Supabase/Edge Function owner for the Monitoring Inbox.
- `src/features/members/memberProfilesRepository.ts` — authenticated member-facing profile projections.
- The ranking engine and calculated ranking model remain the only ranking-calculation owners.

Consumers use provider state and canonical repository functions. They must not independently resolve identity, duplicate Supabase queries, publish competing readiness, or write official state outside the existing owner.

## Current production product

The following major product areas are merged and live:

- React/TypeScript/Vite V2 application on Cloudflare Workers.
- Profile/PIN authentication with cross-device signed-in profiles.
- Complete UFC-only calculated ranking model with Men, Women, divisions, categories, search, era filtering, profiles, Compare, and Octagon Verdict handoff.
- Six mature UFC Play games with shared challenge/result ownership.
- Profile-backed challenges, Daily Challenge history/competition, Your HQ, member profiles, and Picks history.
- Profile-backed UFC Picks with database-enforced validation, frozen lock-time Underdog Lock odds, result entry, group reveal, completed-event recaps, and season totals.
- Event Setup with server-side source staging and explicit owner publication.
- Monitoring Inbox with durable evidence, manual checks, and the one canonical automatic monitoring scheduler.
- Automatic validated pre-lock sportsbook odds applied only through the canonical Picks monitoring path.
- ESPN live-state-aware Fight Night behavior so trusted provider attachment owns automatic fight-by-fight locking while schedule times remain estimates.
- Monitoring remains active through the existing live-event tail instead of disappearing when an old card deadline passes.

## Football Back Room

Football is intentionally separate from the UFC ranking product while reusing mature shared game/platform ownership where appropriate.

The Football Back Room currently has six live games:

1. Blind Rank 5
2. Keep 4 / Cut 4
3. Blind Resume
4. Wavelength
5. Hit the Number
6. Find the Leader

Canonical Football content ownership rules:

- `src/features/back-room/footballRankFiveModel.ts` owns the comparison packs and verdict ratings used by Blind Rank 5, Keep/Cut, and Blind Resume winner resolution.
- `src/features/back-room/footballFactualStats.ts` is the public factual-stat owner used by factual Football games and résumé rows.
- `src/features/back-room/footballComparisonGeneration.ts` owns the mature Blind Rank and Keep/Cut board-generation contracts.
- `src/features/play/lineupModel.ts` remains the shared replay/history identity owner for standalone game generation where used.
- Do not add a second Football rating catalog, factual provider, route owner, replay owner, or hidden fallback path.

The completed Football content maturity work includes broad NFL/CFB comparison depth, mature Blind Resume, a 27-category/540-clue Wavelength catalog, Hit the Number parity-plus, deeper/balanced Find the Leader, and large-scale replay/content audits.

## Football Today's Challenge

Football Today's Challenge uses the existing shared Daily Challenge platform rather than a Football-only persistence stack.

Canonical route:

- `/back-room/football/today`

Current deterministic Football daily schedule:

1. Find the Leader
2. Blind Resume
3. Wavelength
4. Daily Double — Blind Rank 5 + Keep 4 / Cut 4
5. Hit the Number

Current platform ownership:

- shared Play registry is sport-aware (`ufc | football`)
- shared `daily-challenge-runtime` owns private setup/actions/grading
- shared `todayChallengeRepository` owns browser persistence transport
- Daily Challenge records, history, streaks, standings, leaderboards, and competition are sport-scoped through the shared backend
- reminders/notifications are sport-scoped through the canonical notification dispatcher
- shared result links resolve through canonical destinations so Football daily shares return to `/back-room/football/today`

Do not create a Football-specific attempt table, history repository, standings repository, streak owner, leaderboard, notification path, share path, or second Daily Challenge runtime.

## Picks monitoring operations

Canonical owners include:

- `supabase/functions/run-pick-monitoring/index.ts` — manual and scheduled monitoring runner.
- `src/features/picks-monitoring/manualMonitoringRunner.ts` — shared comparison, event resolution, and evidence-payload builder.
- `src/features/picks-monitoring/monitoringStorageModel.ts` — durable evidence contract.
- `public.record_pick_monitoring_run(jsonb)` — atomic evidence writer.
- `public.record_pick_monitoring_run_and_apply_odds(jsonb)` — atomic evidence plus eligible live-odds application boundary.
- `public.record_scheduled_pick_monitoring_run(...)` — scheduled evidence, eligible odds, and cadence completion transaction.
- `pick_bouts.red_american_odds`, `blue_american_odds`, `odds_source`, and `odds_updated_at` — canonical player-facing odds storage.
- `.github/workflows/deploy-supabase.yml` — deployment and scheduler-activation owner.

Operational rules:

- The database owns exactly one canonical `octagon-hq-pick-monitoring` cron job on the current five-minute cadence (`*/5 * * * *`).
- ESPN-attached bouts remain open past schedule estimates until trusted live/final state locks them; unattached fights retain the legacy deadline safety path.
- Monitoring selection keeps a published or locked active card visible through the existing live-event tail so ESPN/result synchronization does not drop out at card start.
- Every authenticated scheduled decision is durable evidence; provider calls and non-call outcomes are not conflated.
- Valid, complete, confidently matched pre-lock odds may update the live Picks card automatically only through the canonical monitoring owner.
- Stale data, wrong cards, unmatched fights, partial responses, provider failures, conflicting data, and post-lock movement preserve the last valid odds.
- Card changes remain advisory until the owner approves a canonical mutation.
- Exact-head PR backend deployments leave the production scheduler under canonical `main` ownership.

## Ranking ownership

- `src/features/rankings/data/rankingInputs.ts` validates and reconciles the canonical ranking inputs.
- `src/features/rankings/engine/categoryCalculators.ts` owns pure category calculations.
- `src/features/rankings/engine/rankingEngine.ts` owns weighting, totals, tie breakers, ranks, and anchored OVR projection.
- `src/features/rankings/engine/eraWindow.ts` owns audited date-window behavior.
- `src/features/rankings/rankingModel.ts` is the app-facing calculated projection/profile lookup owner.

Main ranking rules:

- UFC-only unless explicitly changed.
- Do not score Pride, Strikeforce, WEC, ONE, Bellator, or regional accomplishments in the main ranking product.
- Do not manually enter ranks, OVRs, totals, or category scores.
- Do not recreate static ranking arrays.
- Jon Jones remains the 99 OVR benchmark unless the approved ranking philosophy changes.

## Octagon Verdict

V2 owns the Octagon Verdict export pipeline.

Canonical owners:

- `src/features/intelligence/octagonVerdictExport.ts`
- `scripts/export-octagon-verdict.mjs`
- `.github/workflows/export-octagon-verdict.yml`
- `docs/octagon-verdict-export.md`

Generated artifacts are outputs, not editable source data. Ranking/exporter changes can generate a new GitHub Actions artifact, but the Octagon Verdict Custom GPT knowledge file still requires manual replacement in the GPT editor.

Fighter-count validation must stay synchronized with the canonical ranking dataset; do not hard-code it permanently to a historical count.

## Historical continuity

The controlled V1 data migration is complete and must never be rerun. Historical continuity now flows only through V2 canonical owners.

No V1 PIN, PIN hash, session token, or authentication credential was migrated.

## Stabilization priority

Before broad new feature development, keep this order:

1. Remove any remaining V1 runtime URL or runtime dependency.
2. Keep the duplicate Cloudflare native Git/repository deployment integration disabled.
3. Keep required backend verification genuinely green; repair false negatives at their canonical root instead of dismissing them.
4. Confirm current production `main` and the live deployment SHA match.
5. Keep this handoff and related operational documentation current.
6. Prove the complete release path with exact-head frontend and backend deployments when the changed scope requires them.

Recent Football Daily Challenge work exercised both canonical deployment owners and exact live-SHA verification successfully. That does not remove the requirement to re-verify the exact SHA for every future release.

## Product style

- The app should feel like a polished UFC/2K-style product rather than a spreadsheet.
- Keep visible information clean, intuitive, mobile-first, and group-chat friendly.
- Avoid duplicate calls to action and oversized cards without dominant content.
- Do not expose implementation detail or hidden rating evidence unless the product explicitly needs it.

## Validation standard

Every production PR requires the exact final head to pass:

- `npm run typecheck`
- `npm test`
- `npm run build`

Relevant Supabase SQL tests, migration-order checks, backend verification, exact deployment verification, live WebKit proof, and temporary-proof cleanup must also pass when applicable.

Never describe a PR as deployed, verified, green, or merged without checking the exact final head and, when applicable, the exact live deployment SHA.

## Next safe action

1. Finish the stabilization checklist before starting broad new feature work.
2. Re-resolve current `main` before every new branch.
3. Preserve the existing canonical owner for the next product slice; do not revive old V1 or duplicate deployment/data paths.
4. Use Codex Cloud for multi-file runtime changes that need a real local test/build loop, but keep GitHub Actions as the only production deployment owner.
