# Codex Task — Automatic UFC Picks Monitoring

## Starting point

Repository: `codyking0602/Octagon-HQ`

Start from the exact selected branch snapshot:

`handoff/automatic-picks-monitoring`

That handoff branch is based on exact production `main`:

`fbf1ba2672296c7455c6d58c5a515fe988bf2236`

Before editing, verify the mounted checkout contains this task file and that its merge base is the exact production SHA above. Codex may work on its normal synthetic local `work` branch. Do not treat the local branch name, absence of a Git remote, or absence of GitHub CLI inside the sandbox as blockers.

Do not use or inherit the partially edited branch `agent/automatic-picks-monitoring`. It contains an abandoned chat-side implementation attempt and is not a valid starting point.

When implementation and validation are complete, use Codex Cloud’s normal **Create draft PR** action to open exactly one new draft pull request targeting `main`. Do not try to update an existing PR. Do not merge or deploy.

## Working standard

Use:

**One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.**

Keep the implementation narrow. Do not perform broad cleanup.

Do not create:

- duplicate providers;
- duplicate monitoring runners;
- parallel schedulers;
- browser-storage fallbacks;
- duplicate identity or authorization paths;
- duplicate card-update systems;
- polling loops owned by multiple modules;
- a second notification system;
- a new backend deployment workflow when the existing canonical workflow can support the resource.

Do not silently publish, apply, replace, edit, score, lock, complete, or otherwise mutate a UFC Picks card.

Do not run a real provider-backed monitoring request or consume The Odds API quota during implementation, tests, CI, deployment verification, or production proof. Use pure tests, mocks, deployment-info, authentication rejection, disabled-schedule verification, and other no-provider-call paths.

## Current production ownership

PR #83 and PR #87 are merged into production main.

Canonical manual execution owner:

- `supabase/functions/run-pick-monitoring/index.ts`

Supporting pure application logic:

- `src/features/picks-monitoring/manualMonitoringRunner.ts`
- `src/features/picks-monitoring/monitoringStorageModel.ts`
- existing The Odds API adapter/model files in `src/features/picks-monitoring/`

Canonical atomic storage owner:

- `public.record_pick_monitoring_run(jsonb)`

Existing monitoring storage:

- `public.pick_monitoring_runs`
- `public.pick_monitoring_findings`
- `public.pick_monitoring_odds_snapshots`

Existing deployment ownership:

- `.github/workflows/deploy-supabase.yml`
- `.github/workflows/verify-supabase-backend.yml`
- `scripts/verify-monitoring-function-deployment.mjs`
- `scripts/verify-sync-function-deployment.mjs`

Existing UFC source owner:

- `supabase/functions/sync-next-ufc-event/index.ts`

Existing event and lock ownership:

- staged event timestamps come from `pick_event_drafts.starts_at` and `pick_event_drafts.locks_at` through `get_pick_event_setup()`;
- current live event timestamps come from `pick_events.starts_at` and `pick_events.locks_at` through `get_current_pick_event()`;
- React does not own another event lifecycle.

The existing runner already:

- supports staged-only, current-only, and matching staged/current events;
- fails closed when staged and current identities conflict;
- calls `sync-next-ufc-event` in preview mode;
- filters provider data to the monitored UFC card and narrow event-time window;
- preserves effective card scope;
- builds stable finding keys;
- sanitizes provider errors;
- records evidence atomically;
- keeps The Odds API key server-side;
- does not mutate canonical Picks/card/publication state.

Do not recreate these responsibilities.

## Audit findings to verify before editing

The repository audit before this handoff found:

1. There is no canonical scheduled monitoring owner yet.
2. There is no canonical app notification/inbox owner for monitoring findings yet. Notifications remain roadmap work. This PR must not invent one.
3. The monitoring tables already allow `trigger_kind = 'scheduled'`, but `buildManualMonitoringPayload` currently emits `manual`.
4. The current Edge Function requires an authenticated owner and calls owner-only RPCs. A scheduled service invocation therefore needs a narrow server-side authorization path.
5. `sync-next-ufc-event` preview is also owner-authenticated. A scheduled execution must reuse that source owner without creating another scraper or apply path.
6. Provider quota evidence is already stored on each run (`provider_requests_remaining`, `provider_requests_used`, `provider_last_request_cost`).
7. The existing deployment workflow from PR #87 already conditionally deploys and exact-SHA verifies `run-pick-monitoring`.
8. Supabase scheduling infrastructure is not currently used by this repository.

Verify these findings against the selected snapshot. If one is materially wrong, adapt narrowly and explain the correction in the PR body.

## Product objective

Implement the smallest production-safe automatic monitoring slice:

- one server-side scheduled owner;
- no browser dependency;
- the scheduler invokes the existing canonical monitoring execution path rather than recreating its logic;
- event-aware, quota-conscious due decisions based on canonical event and lock timestamps;
- quiet no-op when no event is monitorable or the event is not due;
- no provider request for a no-op;
- durable scheduled run evidence only when a provider-backed monitoring execution actually occurs;
- no automatic application or publication of source changes;
- manual Run Check remains available and behaviorally unchanged.

## Preferred architecture

Use one low-frequency Supabase-owned schedule, preferably hourly, as the only scheduler. The hourly trigger must not equal an hourly provider call.

The canonical backend must decide whether monitoring is due before calling either external UFC sources or The Odds API.

A reasonable default cadence, subject to repository-aware adjustment, is:

- more than 14 days before event/lock: every 24 hours;
- 7–14 days: every 12 hours;
- 2–7 days: every 6 hours;
- 12–48 hours: every 3 hours;
- inside 12 hours before lock/start: every hour;
- at or after the monitoring stop boundary: no further provider calls.

Use the canonical lock boundary when it provides the meaningful Picks deadline, while also considering `starts_at` so malformed or equal timestamps fail safely. Do not monitor indefinitely after the event begins. Completed events and stale past drafts must stop.

The exact cadence values are product defaults, not permission to add a complex scheduler. Keep the policy pure, explicit, and testable.

## Required design properties

### One execution owner

The scheduler must invoke the canonical monitoring owner once. Do not copy card comparison, source preview, provider parsing, finding generation, or atomic write logic into SQL or another function.

It is acceptable to extract a small shared orchestration function from `run-pick-monitoring/index.ts` if needed so manual and scheduled entry paths call the same execution owner. Do not rewrite the runner broadly.

### Narrow scheduled authorization

Manual execution must remain authenticated owner-only.

Scheduled execution must authenticate server-to-server using a secret that remains entirely backend-side. Prefer a dedicated random scheduling secret or an equivalent narrow service contract over exposing the service-role key in a cron request.

Do not create a second identity system. The scheduled path should be distinguishable from manual owner invocation and allowed only to request scheduled execution or source preview. It must not gain apply/publish authority.

If a service-only preview mode must be added to `sync-next-ufc-event`, make it preview-only and require the same narrow scheduler credential. It must never allow `apply`, staging, or publishing through that credential.

### Due-state and concurrency protection

Implement an atomic database-owned due/lease decision or equivalent durable guard so repeated hourly triggers cannot create duplicate simultaneous provider calls.

The guard must:

- resolve the single monitorable staged/current event safely;
- fail closed for conflicting staged/current identities;
- reject no event, invalid timestamps, completed/stale events, not-yet-due events, exhausted quota state, and an active lease;
- return the selected event identity and due context when acquired;
- set a short lease before external calls;
- support success/failure completion so a crashed invocation does not block monitoring forever;
- preserve append-only monitoring evidence;
- never mutate Picks event, bout, pick, result, lock, scoring, draft content, or publication state.

Keep this model small. A single private scheduler-state row/table or a narrow advisory-lock-plus-durable-next-due design is acceptable. Do not turn it into a general job framework.

### Quota protection

Use previously stored provider quota evidence to fail safe.

At minimum:

- if the most recent known `requests_remaining` is `0`, automatic execution must not make another provider call;
- low quota must not increase cadence;
- the implementation must leave room for owner/manual troubleshooting without leaking credentials;
- tests must prove the no-provider-call decision.

Do not guess monthly reset behavior unless the provider response supplies a trustworthy reset signal already modeled by the app.

### Findings and notifications

Do not add app notifications in this PR. There is no canonical notification owner to reuse.

Keep meaningful findings durable in the existing monitoring ledger. Normal no-change checks should remain quiet at the product layer. Repeated schedules must not create duplicate open meaningful alerts/findings for the same unchanged condition.

The current table uniqueness is per run, so implement the smallest safe cross-run deduplication/reopen policy if needed. Preserve evidence history. Do not delete or rewrite prior runs/snapshots.

A good shape is to preserve every run and snapshot while ensuring the owner-facing unresolved finding concept is not duplicated indefinitely for the same stable finding key. Do not build the owner-facing UI in this PR.

### Deployment safety

Reuse PR #87’s canonical deployment workflow.

The trusted PR-head backend deployment used for verification must install/verify the scheduled infrastructure in a disabled state so no real provider call can occur before merge approval.

The normal approved `main` deployment may activate the canonical schedule after merge, but only through the existing deployment owner. Do not create another workflow.

Prefer a deployment-time enable/disable argument or a migration-created disabled schedule that the trusted main deployment explicitly activates. Ensure reruns are idempotent and do not create duplicate cron jobs.

No external dashboard setup should be required if repository/deployment-owned SQL and secrets can configure the schedule. If a genuinely unavoidable dashboard action exists, document it clearly in the PR body; do not invent one prematurely.

## Focused tests required

Add focused tests proving all of the following:

1. No event produces no source fetch and no provider call.
2. Invalid/no-bout event produces no provider call.
3. A not-yet-due event produces no provider call.
4. A due event invokes the canonical execution owner exactly once.
5. Event proximity changes the next eligible check according to the pure cadence policy.
6. Completed, locked-and-started, or stale past events stop monitoring.
7. Conflicting staged/current identities fail closed before external calls.
8. Exhausted quota prevents automatic provider calls.
9. An active lease prevents duplicate concurrent calls.
10. A failed run releases/expires safely and does not block forever.
11. Repeated scheduled checks do not create duplicate unresolved meaningful findings for unchanged evidence.
12. Scheduled payloads record `trigger_kind = 'scheduled'`; manual payloads remain `manual`.
13. Manual owner execution still works through the existing contract.
14. Scheduled authorization remains server-side and cannot be supplied by browser input.
15. Scheduled source preview is preview-only and cannot stage/apply/publish.
16. No direct writes or calls target card publication, Picks mutation, result entry, scoring, lock mutation, or draft editing.
17. The deployment workflow reuses the existing owner, installs the scheduler disabled for PR proof, verifies exact deployed source, and does not make a provider request.
18. Schedule installation/activation is idempotent and creates exactly one canonical job.

Static contract tests are useful, but prefer executable pure behavior tests for cadence, due/no-op, quota, and orchestration decisions.

## Validation required before creating the draft PR

Run and report:

- `npm run typecheck`
- focused monitoring/scheduler tests
- full `npm test`
- production `npm run build` using the repository’s expected safe test configuration if required
- `git diff --check`
- exact head SHA
- comparison against the selected handoff/base showing the intended narrow file set

Do not claim Supabase SQL integration tests ran unless a disposable local database actually executed them.

Do not run a real monitoring function invocation against The Odds API.

## Draft PR requirements

Create exactly one new draft PR targeting `main`.

Suggested title:

`Add quota-aware automatic Picks monitoring`

The PR body must include:

- objective;
- confirmed existing owners;
- selected scheduling architecture;
- cadence policy;
- authorization boundary;
- quota protection;
- finding deduplication approach;
- deployment activation boundary;
- exact base SHA and exact PR head;
- tests run and results;
- explicit statement that no real provider-backed monitoring run occurred and no quota was consumed;
- explicit statement that no card, Picks, result, lock, scoring, user, or publication data was mutated;
- any genuine external setup still required;
- reminder that the PR is draft, unmerged, and must not merge without Cody explicitly saying `merge PR #<number>`.

Do not apply deployment labels. Do not deploy. Do not merge.
