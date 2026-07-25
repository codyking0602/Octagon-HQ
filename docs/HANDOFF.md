# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-25_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main` before editing.

## Repository and production

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Live app: `https://octagon.hq-app.workers.dev`
- `main` is the live source of truth.
- The legacy V1 repository, `codyking0602/ufc-goat-rankings`, is reference-only and must not be edited during V2 work.
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
7. Deploy the exact PR head when live testing is required.
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
- The ranking engine and calculated ranking model remain the only ranking-calculation owners.

Consumers use provider state and canonical repository functions. They must not independently resolve identity, duplicate Supabase queries, read a local fallback, or publish competing readiness.

## Current production product

The following are complete and merged:

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
- Cross-device pick selections.
- Database-enforced Picks lock and fighter validation.
- Picks season record on Your HQ.
- Home Next UFC Event / Picks card.
- Stale Vite chunk recovery.
- Branded route-error handling.
- Fresh SPA shells served with `Cache-Control: no-cache`.

## Your HQ

Your HQ is profile-backed and currently contains:

- Daily streak.
- Current Picks record.
- Favorite fighter.
- Open challenges.
- One intelligent next action.

Home and the feature routes consume existing providers. Your HQ does not own a second profile, challenge, history, preference, or Picks query path.

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
  - owns Supabase migrations, Edge Function deployment, and remote backend verification.
- `.github/workflows/verify-supabase-backend.yml`
  - owns independent PR/backend credential, migration, function, and production-CORS verification.
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

Cody should not need to open GitHub Actions for feature deployments. The assistant can apply the labels through the connected GitHub tools, inspect runs and logs, and report the exact deployed SHA.

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

### Lower Home experience

Final intended Home order:

1. Your HQ.
2. Next UFC Event / Picks.
3. Compact daily Play or active-challenge status.
4. Compact Ranking Spotlight.
5. Shane’s Fighters to Watch — collapsed by default.
6. Member Profiles — collapsed by default.

Ranking Spotlight should evolve the existing Top of the Board area rather than creating redundant ranking cards.

Shane’s Fighters to Watch is structured Intelligence/editorial content, never a screenshot of notes or messages.

Member Profiles should remain a compact preview on Home; the full directory belongs on its own screen.

### Picks lifecycle and recaps

- Record official bout winners through one canonical backend owner.
- Recalculate profile Picks records from canonical results.
- Show completed-event recaps and correct/incorrect picks.
- Preserve event history.
- Add and retire future events through one defined backend process.
- Do not scrape or guess results in the browser.

### Activity automation

Create meaningful update cards only for:

- new fighters;
- ranking movement of at least three positions;
- new games;
- completed Picks event recaps;
- new Fighters to Watch entries.

Move temporary updates to archive after seven days and remove them after fifteen days unless they represent durable history owned elsewhere.

### Onboarding and profile completion

Use compact contextual reminders for:

- completing a Top 10;
- adding a profile photo;
- choosing a favorite fighter;
- other meaningful profile details.

Do not build a mandatory multi-screen onboarding wall.

### Permission-aware War Room

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

Relevant deployment and export workflows must also be green. Never describe a PR as deployed, verified, green, or merged without checking the exact current head.

## Next safe action

Finish and merge the deployment-automation PR first. Do not begin another product feature before that PR is explicitly approved and merged.

After deployment automation is active and proven, begin the lower Home experience on a new branch and separate draft PR.
