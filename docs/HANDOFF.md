# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-28_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main` before editing.

## Repository and production

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Current production `main` SHA: `76d25c05c74088325f007d1855997f51889fb3a8`
- Live app: `https://octagon.hq-app.workers.dev`
- `main` is the live source of truth.
- The legacy V1 repository, `codyking0602/ufc-goat-rankings`, is reference-only and must not be edited during V2 work.
- No V1 runtime dependency remains. The completed V1 migration must never be rerun.
- Always verify the current `main` SHA before creating a feature branch.

## Working standard

Use:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

For every production slice:

1. Start from current `main`.
2. Create one new branch for one narrow purpose.
3. Open a draft PR.
4. Inspect and preserve the existing canonical owner.
5. Add focused tests.
6. Require the exact PR head to pass typecheck, the full test suite, and the production build.
7. Deploy the exact PR head when live testing is required and explicitly approved.
8. Phone-test user-facing changes.
9. Never merge without Cody explicitly approving that PR with the word `merge`.

Do not use old branches, temporary workflows, duplicate providers, local fallbacks, competing query paths, or V1 runtime assumptions.

## Canonical application owners

- `src/main.tsx` — one application entry.
- `src/app/App.tsx` — one startup/readiness owner.
- `src/app/router.tsx` — one routing owner.
- `src/lib/supabase.ts` — one Supabase client.
- `src/features/identity/IdentityProvider.tsx` — identity/session owner.
- `src/features/challenges/ChallengeProvider.tsx` — challenge state owner.
- `src/features/play/FindLeaderHistoryProvider.tsx` — Find the Leader history owner.
- `src/features/profile/ProfilePreferencesProvider.tsx` — profile preferences owner.
- `src/features/picks/PicksProvider.tsx` — current Picks event, selections, and season-summary owner.
- `src/features/members/memberProfilesRepository.ts` — authenticated member-facing profile projections.
- The ranking engine and calculated ranking model remain the only ranking-calculation owners.

Consumers use provider state and canonical repository functions. They must not independently resolve identity, duplicate Supabase queries, read a local fallback, or publish competing readiness.

## Current production product

The following are complete, merged, and live:

- React, TypeScript, and Vite V2 application.
- Branded startup and route-level lazy loading.
- One startup/readiness owner, router owner, and Supabase client owner.
- Profile/PIN authentication with cross-device signed-in profiles.
- Complete 80-fighter UFC-only calculated ranking model.
- Men’s and Women’s boards.
- Divisions, Categories, search, and curated era filtering.
- Full calculated fighter profiles for all 80 fighters.
- Real local fighter photos and audited Signature Fight links.
- Intelligence / Octagon Verdict handoff.
- Compare and Ask Why handoffs into Intelligence.
- Six Play games.
- Challenge Center with profile-backed challenges.
- Profile-backed Find the Leader history and streaks.
- Profile-backed favorite fighter.
- Profile-backed open-challenge count.
- Profile-backed UFC Picks.
- Public current UFC event and six-fight main-card Picks data.
- Owner-only manual Picks monitoring with durable run and finding evidence.
- One quota-aware, server-owned Picks monitoring schedule with atomic claims and evidence recording.
- Cross-device pick selections.
- Database-enforced Picks lock and fighter validation.
- Picks season record on Your HQ.
- Home Next UFC Event / Picks card.
- Authenticated Member Profiles directory and individual member pages.
- Personal profile photos separate from Favorite Fighter.
- Historical V1 member continuity through the canonical V2 profile, Picks, and Find the Leader owners.
- Stale Vite chunk recovery.
- Branded route-error handling.
- Fresh SPA shells served with `Cache-Control: no-cache`.

The automatic monitoring implementation is merged, but the read-only production runtime check added in draft PR #91 found the canonical scheduler **inactive** on 2026-07-28. Do not describe automatic monitoring as currently running until the canonical `main` backend deployment re-enables it and the health check passes.

## Your HQ

Your HQ is profile-backed and currently contains:

- Daily streak.
- Current Picks record.
- Favorite fighter.
- Open challenges.
- One intelligent next action.

Home and the feature routes consume existing providers. Your HQ does not own a second profile, challenge, history, preference, or Picks query path.

## Member Profiles and historical continuity

Member Profiles are merged and live at `/members`, with individual profiles at `/members/:memberName`.

The completed controlled migration imported the canonical six-member group:

- Brock
- Cody
- Rhonda
- Shane
- Tony
- Tyler

The completed import added:

- 19 nonconflicting Find the Leader rows.
- Two completed historical Picks events.
- 12 resolved bouts.
- 48 submitted historical picks.

Cody’s reconciled historical results are:

- Overall Picks record: **9-3**.
- UFC 329: **5-2**.
- UFC Oklahoma City: **4-1**.
- Missing historical picks: **0**.
- Find the Leader recorded days: **9**.
- Best streak: **7**.
- Perfect 10s: **4**.
- Best score: **10**.

One July 25, 2026 Find the Leader conflict was intentionally resolved in favor of the existing V2 row: V1 contained official 8, best 8, two attempts; V2 contained official 4, best 4, one attempt. July 25, 2026 and later V2 Picks data was hash-verified unchanged.

Brock, Rhonda, Shane, Tony, and Tyler are historical profiles with no migrated PIN credential. Each person may use the normal Create Profile flow with the reserved name, choose a new PIN, and claim the existing profile and history. `public.claim_unclaimed_pin_profile(text, text)` and the existing `pin-auth` owner remain the durable claiming path.

No V1 PIN, PIN hash, session token, or authentication credential was migrated.

The migration is complete and must never be rerun. Forward migration `202607300005_retire_v1_history_import_rpcs.sql` retires the disposable `public.import_v1_history_atomic(jsonb)` and `public.import_v1_history_atomic_reconciled(jsonb)` entry points without changing imported rows or durable profile-claiming behavior. V1 is now reference-only.

## Ranking ownership

The disposable ten-fighter scaffold and hand-written ranking array are gone.

- `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json`
  - complete canonical facts and approved inputs for all 80 fighters;
  - no frozen ranks, totals, category scores, or OVRs.
- `src/features/rankings/data/rankingInputs.ts`
  - strict validation and dataset reconciliation.
- `src/features/rankings/engine/categoryCalculators.ts`
  - pure category calculations.
- `src/features/rankings/engine/rankingEngine.ts`
  - weighting, totals, tie breakers, ranks, and anchored OVR projection.
- `src/features/rankings/engine/eraWindow.ts`
  - audited date-window behavior.
- `src/features/rankings/rankingModel.ts`
  - one app-facing calculated projection and profile lookup owner.
- `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json`
  - pinned parity oracle only; never runtime data.

Never recreate `src/features/rankings/rankingData.ts`, manually reorder fighters, or enter presentation-only ranks and OVRs. Change approved canonical facts or judgment inputs and let the engine recalculate.

## Current men’s top ten

The calculated model currently produces:

1. Jon Jones
2. Georges St-Pierre
3. Anderson Silva
4. Demetrious Johnson
5. Islam Makhachev
6. Alexander Volkanovski
7. Khabib Nurmagomedov
8. Matt Hughes
9. Kamaru Usman
10. Max Holloway

## Intelligence and Octagon Verdict

Intelligence is a zero-cost handoff to the user’s Octagon Verdict GPT, not a second in-app ranking or comparison engine.

- The persistent question-mark control opens Intelligence.
- Fighter Compare opens Intelligence with the source fighter selected.
- Ask Why copies a question grounded in the current calculated rank.
- Direct UFC fight history is context only and never overrides the calculated model.
- Unauthorized users must not see a fake, disabled, or discoverable War Room destination.
- Primary navigation remains Home, Rankings, Play, and Picks until permission-aware War Room ownership is built.

## Fighter assets

- `public/assets/app-icon.png` owns the app icon.
- `public/assets/fighters/` owns one thumbnail and one profile WebP for each ranked fighter.
- `src/config/brand.ts` owns local asset paths.
- Tests reconcile the 80-fighter set to exactly 160 local fighter WebPs and reject external photo URLs.
- Preserve real source photographs. Only crop, resize, recenter, lightly sharpen, clean framing, and convert to WebP unless Cody explicitly requests an AI-generated edit.

## Canonical deployment owners

- `.github/workflows/deploy-supabase.yml`
  - owns Supabase migrations, Edge Function deployment, scheduler activation, and remote backend verification.
- `.github/workflows/verify-supabase-backend.yml`
  - owns independent PR/backend credential, migration, function, production-CORS, and read-only production scheduler verification.
- `.github/workflows/deploy-cloudflare.yml`
  - owns the production frontend build, Worker deployment, exact-SHA marker, and live-bundle verification.
- `.github/workflows/deploy-pr-head.yml`
  - owns only the trusted label-to-canonical-workflow handoff. It contains no checkout or deployment commands.

Pushes to `main` continue to trigger the canonical production deploy workflows automatically.

## Feature-branch deployment process

For an open same-repository PR targeting `main`:

- Apply `deploy-backend` to deploy the exact current PR head through `deploy-supabase.yml`.
- Apply `deploy-frontend` to deploy the exact current PR head through `deploy-cloudflare.yml`.
- The broker freezes the event head SHA, re-fetches the PR, and rejects closed PRs, moved heads, forks, non-`main` targets, or missing trigger labels.
- The canonical workflow re-fetches the PR and revalidates the frozen SHA before checking out code or using deployment credentials.
- Checkout uses the exact commit SHA with persisted GitHub credentials disabled.
- Production-target concurrency prevents overlapping backend or frontend deployments.
- The Cloudflare build writes `deployment.json`; the live verifier must read the same SHA from production in addition to preserving all existing bundle-marker checks.
- The Supabase workflow verifies the exact checkout, remote migrations, deployed function, live function contract, and production CORS.
- The trigger label is removed after success or failure so the same explicit action can be used again.
- The workflow never merges the PR.
- Deployment labels are created automatically by the broker when the workflow lands on `main`.

Cody should not need to open GitHub Actions for feature deployments. The assistant can apply the labels through the connected GitHub tools, inspect runs and logs, and report the exact deployed SHA. The connected GitHub tool currently does not expose workflow dispatch, so re-running the canonical `main` backend deployment may require one manual GitHub Actions action when no new `main` push exists.

## Security boundary

The label broker runs from the protected/default-branch workflow definition and never checks out PR code.

Secrets are available only to the existing canonical deployment workflows after:

1. the PR is confirmed open;
2. the PR targets `main`;
3. the head repository exactly matches `codyking0602/Octagon-HQ`; and
4. the current PR head still equals the frozen labeled-event SHA.

Fork PRs and moved heads are rejected before deployment. PR build commands do not receive Cloudflare or Supabase administrative credentials. Dependency lifecycle scripts are disabled during the Cloudflare deployment install.

## Product rules

- UFC-only unless Cody explicitly says otherwise.
- Fresh launches always open Home, never Picks.
- War Room remains completely undiscoverable to unauthorized users.
- No War Room card belongs on Home.
- Public copy says `Octagon HQ`.
- True black owns the canvas, safe areas, and navigation.
- Charcoal owns cards and controls.
- White owns primary information.
- Gray owns supporting information.
- UFC red is restrained emphasis.
- Home should be personalized and useful, not an endless dashboard.
- Avoid duplicate calls to action and oversized cards without dominant content.

## Remaining roadmap

### Picks lifecycle and completed-event recaps — next major phase

Split the work into small PRs and preserve `PicksProvider` as the app-facing owner.

1. Official result and event-completion owner.
   - One trusted backend owner records official bout outcomes.
   - One backend owner controls event status transitions.
   - Complete an event atomically only when eligible outcomes are resolved.
   - Expose derived event and season records through one canonical projection.
   - Do not build a giant admin dashboard.
2. Completed-event recap UI.
   - Show official outcomes and the active member’s correct, incorrect, missing, and excluded picks.
   - Show event record and compact group results.
   - Preserve the current upcoming-event picking experience.
3. Event rotation and next-event process.
   - Keep exactly one active event.
   - Retire completed events into durable history through one controlled process.
   - Browser code remains read-only for official event administration.

Completed-event scoring remains: correct submitted pick equals a win; incorrect submitted pick equals a loss; missing picks are separate; draws, no contests, cancelled bouts, and unresolved bouts are excluded.

### Activity automation

Create meaningful update cards only for:

- new fighters;
- ranking movement of at least three positions;
- new games;
- completed Picks event recaps;
- new Fighters to Watch entries.

Move temporary updates to archive after seven days and remove them after fifteen days unless they represent durable history owned elsewhere.

### Lower Home experience — later

Final intended Home order:

1. Your HQ.
2. Next UFC Event / Picks.
3. Compact daily Play or active-challenge status.
4. Compact Ranking Spotlight.
5. Shane’s Fighters to Watch — collapsed by default.
6. Member Profiles — collapsed by default.

Ranking Spotlight should evolve the existing Top of the Board area rather than creating redundant ranking cards.

Shane’s Fighters to Watch is structured Intelligence/editorial content, never a screenshot of notes or messages.

Member Profiles should remain a compact preview on Home; the full directory belongs at `/members`.

### Onboarding and profile completion

Use compact contextual reminders for:

- completing a Top 10;
- adding a profile photo;
- choosing a favorite fighter;
- other meaningful profile details.

Do not build a mandatory multi-screen onboarding wall.

### Permission-aware War Room — later

- Completely hidden for signed-out and unauthorized users.
- No disabled War Room button or fake destination.
- Eligible signed-in profiles may see it in the appropriate navigation.
- Invite-only users receive a clear `Join with invite` state.
- Mentions and notifications come only after permission ownership is proven.

### Sharing, installability, and cutover

Later work includes consistent native sharing, clean deep links, PWA/installability review, carefully owned notifications, and final V2 cutover decisions.

## Validation standard

Every production PR requires the exact final head to pass:

- `npm run typecheck`;
- `npm test`;
- `npm run build`.

Relevant Supabase SQL tests, migration-order checks, backend verification, deployment, and export workflows must also be green when applicable. Never describe a PR as deployed, verified, green, or merged without checking the exact current head.

## Picks monitoring operations

Canonical owners:

- `supabase/functions/run-pick-monitoring/index.ts` — the only manual and scheduled execution owner.
- `src/features/picks-monitoring/manualMonitoringRunner.ts` — the shared comparison and payload builder.
- `src/features/picks-monitoring/monitoringStorageModel.ts` — the app-independent evidence payload contract.
- `public.record_pick_monitoring_run(jsonb)` and `public.record_scheduled_pick_monitoring_run(...)` — the only durable evidence writers.
- migrations `202608090001`, `202608090002`, and draft runtime-verification migration `202608090003` — scheduler installation, claim hardening, and non-secret health proof.
- `.github/workflows/deploy-supabase.yml` — the only deployment and activation owner.
- `scripts/configure-monitoring-scheduler.mjs` — the deployment-owned scheduler state setter.
- `scripts/verify-monitoring-function-deployment.mjs` and `scripts/verify-production-monitoring-scheduler.mjs` — exact-deployment and read-only production health checks.

Operational rules:

- The database owns one `octagon-hq-pick-monitoring` cron job at minute 7 of each hour.
- Event-aware cadence reduces provider calls when the event is farther away and stops at the earliest Picks lock or event start.
- Scheduled runs use a database-only Vault credential, an atomic short lease, and the existing monitoring evidence writer.
- Automatic monitoring records evidence and findings only. It never publishes or changes a card, draft, odds, picks, locks, results, scoring, event status, or publication state.
- Exact-head PR backend deployments leave the scheduler inactive. The canonical `main` backend deployment is the only owner that enables it.
- The read-only production check in PR #91 reached the canonical health RPC without invoking the runner or provider and failed because the scheduler was not active. No Odds API quota was consumed.

Draft PR #91 adds the owner-only Monitoring Inbox at `/picks/monitoring`. It reuses the existing owner allowlist, monitoring runner, ledger, and review-only evidence fields. It is not merged or live until its exact backend and frontend are deployed and tested.

## Next safe action

1. Re-run the canonical **Deploy Supabase Backend** workflow on `main` so production SHA `76d25c05c74088325f007d1855997f51889fb3a8` re-enables the scheduler.
2. Re-run PR #91’s read-only backend verification and require the production scheduler step to pass without a provider call.
3. Keep PR #91 draft and unmerged while its exact head remains green.
4. When live phone testing is approved, deploy the exact PR #91 backend and frontend through the trusted labels, verify the Inbox on iPhone, and then restore the canonical `main` scheduler state if the PR deployment leaves it inactive.
5. Never merge PR #91 until Cody explicitly says `merge PR #91`.
