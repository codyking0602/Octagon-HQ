# Octagon HQ V2 — Current Handoff

_Last updated: 2026-07-28_

This is the authoritative cold-start handoff for continuing Octagon HQ V2. Read this file, `docs/product-blueprint.md`, `docs/RANKINGS-MIGRATION.md`, `docs/rankings-parity-contract.md`, `docs/intelligence-verdict-flow.md`, and `docs/octagon-verdict-export.md`, then inspect current `main` before editing.

## Repository and production

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Live app: `https://octagon.hq-app.workers.dev`
- `main` is the live source of truth.
- Resolve the current `main` HEAD from GitHub before every branch. Do not trust a copied SHA in a handoff document.
- The legacy V1 repository, `codyking0602/ufc-goat-rankings`, is reference-only.
- No V1 runtime dependency remains. The completed V1 history migration must never be rerun.

## Working standard

Use:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

For every production slice:

1. Start from current `main`.
2. Create one branch for one narrow purpose.
3. Open a draft PR.
4. Inspect and preserve the existing canonical owner.
5. Add focused tests.
6. Require the exact final PR head to pass typecheck, the full test suite, and the production build.
7. Deploy the exact PR head when live testing is required.
8. Phone-test user-facing changes.
9. Never merge without Cody explicitly approving that PR with the word `merge`.

Do not use old branches, temporary workflows, duplicate providers, local fallbacks, competing query paths, broad cleanup, or V1 runtime assumptions.

## Canonical application owners

- `src/main.tsx` — one application entry.
- `src/app/App.tsx` — one startup/readiness owner.
- `src/app/router.tsx` — one routing owner.
- `src/lib/supabase.ts` — one Supabase client.
- `src/features/identity/IdentityProvider.tsx` — identity/session owner.
- `src/features/challenges/ChallengeProvider.tsx` — challenge state owner.
- `src/features/play/FindLeaderHistoryProvider.tsx` — Find the Leader history owner.
- `src/features/profile/ProfilePreferencesProvider.tsx` — profile preferences owner.
- `src/features/picks/PicksProvider.tsx` — player-facing current event, selections, season summary, and completed history owner.
- `src/features/picks/picksRepository.ts` — only browser Supabase owner for player Picks.
- `src/features/picks-control/pickControlRepository.ts` — only browser Supabase owner for Fight Night results.
- `src/features/picks-setup/pickSetupRepository.ts` — only browser Supabase owner for staged Event Setup.
- `src/features/picks-monitoring/monitoringInboxRepository.ts` — only browser Supabase/Edge Function owner for the Monitoring Inbox.
- `src/features/members/memberProfilesRepository.ts` — authenticated member-facing profile projections.
- The ranking engine and calculated ranking model remain the only ranking-calculation owners.

Consumers use provider state and canonical repository functions. They must not independently resolve identity, duplicate Supabase queries, read a local fallback, publish competing readiness, or write official Picks state outside the existing owner.

## Current production product

The following are complete, merged, and live:

- React, TypeScript, and Vite V2 application.
- Branded startup, Home-first launches, route-level lazy loading, stale-chunk recovery, and route-error handling.
- Profile/PIN authentication with cross-device signed-in profiles.
- Complete 80-fighter UFC-only calculated ranking model.
- Men’s and Women’s boards, divisions, categories, search, and curated era filtering.
- Full calculated fighter profiles with local fighter assets and audited Signature Fight links.
- Intelligence / Octagon Verdict handoff, Compare handoff, and Ask Why handoff.
- Six Play games.
- Challenge Center with profile-backed challenges.
- Profile-backed Find the Leader history, streaks, favorite fighter, and open-challenge count.
- Your HQ with Daily streak, Current Picks record, Favorite fighter, Open challenges, and one next action.
- Authenticated Member Profiles directory and individual member pages.
- Historical V1 member, Picks, and Find the Leader continuity through canonical V2 owners.
- Profile-backed UFC Picks with cross-device selections.
- Public current UFC event and main-card Picks data.
- Database-enforced Picks lock and fighter validation.
- Underdog Lock with lock-time frozen odds and backend-owned scoring.
- Fight Night Control for official result entry and event completion.
- Fight-by-fight group-pick reveal after official resolution.
- Completed-event recaps with personal verdicts, group standings, event points, and season totals.
- Event Setup with server-side source staging, owner review, draft editing, and explicit atomic publication.
- Monitoring Inbox with durable runs, findings, evidence, review status, quota visibility, and manual checks.
- One quota-aware, server-owned automatic monitoring schedule.
- Automatic validated pre-lock sportsbook odds applied to the canonical live Picks card.
- Sportsbook source and odds freshness displayed in Picks.

## Picks ownership and scoring rules

- `PicksProvider` remains the only player-facing app owner.
- Browser code does not administer official event state directly.
- `record_official_pick_bout_result` remains the official bout-result mutation owner.
- `transition_pick_event` remains the event-status mutation owner.
- Completed events and official results are immutable under the current production rules.
- Correct submitted pick equals a win.
- Incorrect submitted pick equals a loss.
- Missing picks remain separate.
- Draws, no contests, cancelled bouts, and unresolved bouts are excluded.
- Group picks reveal per bout only after that bout receives an official resolved result.
- Underdog Lock scoring uses the frozen lock-time odds. Later sportsbook movement cannot change scoring.

## Event Setup

- `supabase/functions/sync-next-ufc-event` is the only official-source staging owner.
- Imported source data is staged privately; it never silently changes the live Picks card.
- Cody reviews event metadata, card scope, fight order, fighters, and weight classes before publishing.
- Source previews may replace only the staged draft after explicit review.
- Publishing is one explicit, confirmed, atomic backend action.
- Event Setup and Fight Night Control remain separate owner tools.

## Picks monitoring operations

Canonical owners:

- `supabase/functions/run-pick-monitoring/index.ts` — only manual and scheduled monitoring runner.
- `src/features/picks-monitoring/manualMonitoringRunner.ts` — shared comparison, event resolution, and evidence-payload builder.
- `src/features/picks-monitoring/monitoringStorageModel.ts` — durable evidence contract.
- `public.record_pick_monitoring_run(jsonb)` — existing atomic evidence writer.
- `public.record_pick_monitoring_run_and_apply_odds(jsonb)` — atomic evidence plus eligible live-odds application boundary.
- `public.record_scheduled_pick_monitoring_run(...)` — scheduled evidence, eligible odds, and cadence completion transaction.
- `pick_bouts.red_american_odds`, `blue_american_odds`, `odds_source`, and `odds_updated_at` — canonical player-facing odds storage.
- `.github/workflows/deploy-supabase.yml` — only deployment and scheduler-activation owner.

Operational rules:

- The database owns one `octagon-hq-pick-monitoring` cron job at minute 7 of each hour.
- Event-aware cadence skips provider calls until the monitored event is due and stops at the earliest Picks lock or event start.
- Every authenticated scheduled decision is durable evidence: due checks remain provider runs, while not-due, no-event, closed-boundary, and failure outcomes are recorded without pretending a provider was called.
- Scheduler wake health is infrastructure evidence only; the owner inbox reports the latest monitoring outcome separately.
- Completed or boundary-past events are excluded from monitoring selection and cannot mask the next eligible staged or published UFC event.
- The published current event is preferred when a matching staged draft also exists, so eligible odds bind to canonical live bouts.
- A staged draft is monitored only when no current published event exists.
- Conflicting staged and current identities fail closed.
- Valid, complete, confidently matched pre-lock odds may update the live Picks card automatically.
- Odds writes require the exact event, exact canonical bout, exact fighter orientation, complete prices, supported sportsbook, and an append-only recorded snapshot from the same run.
- Stale data, wrong cards, unmatched fights, partial responses, provider failures, conflicting same-time data, and post-lock movement preserve the last valid odds.
- Card changes are findings for owner review. Monitoring never silently publishes, replaces, removes, cancels, or reorders a live fight.
- Manual checks use the same server-owned runner and atomic storage boundary as scheduled checks.
- Exact-head PR backend deployments leave the scheduler inactive; the canonical `main` backend deployment is the only owner that enables it.

## Historical continuity

The controlled V1 migration is complete and must never be rerun.

Canonical imported group:

- Brock
- Cody
- Rhonda
- Shane
- Tony
- Tyler

Cody’s reconciled historical state at migration completion:

- Overall Picks record: **9-3**.
- UFC 329: **5-2**.
- UFC Oklahoma City: **4-1**.
- Missing historical picks: **0**.
- Find the Leader recorded days: **9**.
- Best streak: **7**.
- Perfect 10s: **4**.
- Best score: **10**.

No V1 PIN, PIN hash, session token, or authentication credential was migrated. Unclaimed historical profiles use the durable canonical claim flow.

## Ranking ownership

- `src/features/rankings/data/generated/canonical-ranking-inputs-842ba06e.json` — complete canonical facts and approved inputs for all 80 fighters; no frozen ranks, totals, category scores, or OVRs.
- `src/features/rankings/data/rankingInputs.ts` — strict validation and dataset reconciliation.
- `src/features/rankings/engine/categoryCalculators.ts` — pure category calculations.
- `src/features/rankings/engine/rankingEngine.ts` — weighting, totals, tie breakers, ranks, and anchored OVR projection.
- `src/features/rankings/engine/eraWindow.ts` — audited date-window behavior.
- `src/features/rankings/rankingModel.ts` — one app-facing calculated projection and profile lookup owner.
- `src/features/rankings/engine/__fixtures__/v1-production-output-842ba06e.json` — pinned parity oracle only; never runtime data.

Never recreate `src/features/rankings/rankingData.ts`, manually reorder fighters, or enter presentation-only ranks and OVRs. Change approved canonical facts or judgment inputs and let the engine recalculate.

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

## Current major phase — controlled live-card changes

Build this as separate narrow PRs. Do not combine every card-change case into one migration or giant owner screen.

### 1. Approved cancelled-fight handling

- An owner explicitly approves the cancellation.
- Preserve the original fight and every submitted pick.
- Mark the bout cancelled; do not delete it.
- Exclude the bout from scoring.
- Show the cancellation in the active card and completed recap.
- Record durable audit evidence for the approved action.

### 2. Fighter-replacement handling

- Preserve the old matchup and original selections in audit history.
- Mark prior selections invalid for the replacement matchup.
- Require affected members to make a new pick while the event remains eligible.
- Never silently transfer a pick to the replacement fighter.
- Keep the replacement owner-only and explicit.

### 3. Reorder and removal handling

- Reordering preserves picks and changes only canonical display order.
- Moving a fight off the pickable card preserves the fight and picks historically.
- Exclusion from scoring is explicit; no silent deletion.
- Monitoring findings remain advisory until Cody approves an action.

### 4. Audited post-lock corrections

- Do not add a broad V1-style `Reopen Event` action.
- Require owner authorization, a correction reason, and append-only audit history.
- Preserve before-and-after values.
- Recalculate affected event and season projections atomically when permitted.
- Never change frozen Underdog Lock odds.
- Never silently correct completed history.

### 5. Safe phone-test scenario

- Use a staged or dedicated safe test event; never experiment destructively on a real active card with member picks.
- Exercise cancellation, replacement, reorder/removal, and post-lock correction behavior.
- Verify the player card, affected selections, scoring exclusions, group reveal, recap, audit history, and cross-device refresh.
- Clean up temporary proof data through the canonical backend owner.

## Later roadmap

- Meaningful activity cards only for new fighters, ranking movement of at least three positions, new games, completed Picks recaps, and new Fighters to Watch entries.
- Archive temporary activity after seven days and remove it after fifteen days unless durable history owns it elsewhere.
- Lower Home refinement, compact onboarding reminders, permission-aware War Room, native sharing, deep links, PWA/installability review, and carefully owned notifications.
- Optional real event media/posters and selective Fight Spotlight content.

## Canonical deployment owners

- `.github/workflows/deploy-supabase.yml` — migrations, Edge Functions, scheduler state, and remote backend verification.
- `.github/workflows/verify-supabase-backend.yml` — independent backend credentials, migrations, functions, production CORS, scheduler health, scoring RPCs, and WebKit proof.
- `.github/workflows/deploy-cloudflare.yml` — production frontend build, Worker deployment, exact-SHA marker, and live-bundle verification.
- `.github/workflows/deploy-pr-head.yml` — trusted label-to-canonical-workflow handoff only.

Pushes to `main` trigger canonical production deploy workflows automatically. Feature PRs use `deploy-backend` and `deploy-frontend` labels only when exact-head live testing is required.

## Validation standard

Every production PR requires the exact final head to pass:

- `npm run typecheck`
- `npm test`
- `npm run build`

Relevant Supabase SQL tests, migration-order checks, backend verification, exact deployment verification, live WebKit proof, and temporary-proof cleanup must also pass when applicable. Never describe a PR as deployed, verified, green, or merged without checking the exact current head.

## Next safe action

1. Complete and merge the documentation/copy correction slice after exact-head validation.
2. Start approved cancelled-fight handling from the new current `main`.
3. Use Codex for each behavioral phase because those phases require coordinated migration, backend RPC, repository, UI, and focused test work.
4. Keep each PR draft and unmerged until Cody explicitly says `merge` for that PR.
