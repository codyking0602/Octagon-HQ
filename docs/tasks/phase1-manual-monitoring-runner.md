# Codex Task — Phase 1 Manual Monitoring Runner

## Codex Cloud operating model

Repository: `codyking0602/Octagon-HQ`

Production app: `https://octagon.hq-app.workers.dev`

Canonical production base:

`ec93d102d454e81e21d20a3b2792dbcf0c76d758`

Handoff branch selected in Codex Cloud:

`agent/phase1-manual-monitoring-runner`

Codex Cloud may mount the selected branch on an internal local branch named `work`. That is expected.

Do **not** stop merely because:

- `git branch --show-current` returns `work`;
- no `origin` remote is configured inside the sandbox;
- GitHub CLI is unavailable;
- the sandbox cannot directly update an existing pull request.

Instead, confirm the selected checkout contains this file, contains the merged Slice 1 and Slice 2 foundation, and descends from the canonical production base.

The starting checkout should include the task-spec commit and therefore be ahead of the production base by this documentation file. A synthetic local branch name does not change the source snapshot.

This task does **not** continue or update PR #82. PR #82 is only the superseded setup attempt.

Implement and validate the work inside the Codex task. At completion, use Codex Cloud's normal **Create PR** or **Create draft PR** action to open one new implementation PR targeting `main`. Do not attempt to append a fresh Codex task to an existing PR.

Use the project standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Do not deploy or merge. ChatGPT will review the new implementation PR and handle an exact-head deployment after review. Cody must explicitly use the word `merge` before merge.

## Read first

Before editing, inspect:

- `docs/HANDOFF.md`
- `docs/product-blueprint.md`
- `src/features/picks-monitoring/`
- the current Event Setup implementation
- the current `sync-next-ufc-event` Edge Function and shared owners
- the current Picks repositories, projections, and lifecycle RPCs
- `supabase/migrations/202608070001_pick_monitoring_storage.sql`
- existing monitoring, Event Setup, and Picks tests
- canonical backend deployment and verification workflows

Identify the actual canonical owners before editing. Do not infer ownership from filenames alone.

## Current merged foundation

### Slice 1 — Odds-provider adapter

The existing code under `src/features/picks-monitoring/` owns:

- normalized odds models;
- The Odds API request and response adapter;
- DraftKings preference;
- FanDuel fallback only when DraftKings lacks a complete two-fighter snapshot;
- the rule forbidding mixed prices from different sportsbooks;
- fighter and matchup normalization;
- provider diagnostics and quota metadata.

It currently has no scheduler, database writer, browser runtime owner, provider secret, or production mutation path.

### Slice 2 — Private monitoring storage

Migration:

`supabase/migrations/202608070001_pick_monitoring_storage.sql`

It owns:

- `pick_monitoring_runs`;
- `pick_monitoring_findings`;
- `pick_monitoring_odds_snapshots`;
- service-role-only atomic writer `record_pick_monitoring_run(jsonb)`;
- append-only run and snapshot evidence;
- immutable finding evidence except review fields;
- review states `new`, `reviewed`, and `dismissed`;
- canonical event-lock capture;
- strict snapshot eligibility using `fetched_at < observed_locks_at`.

The live card, staged draft, Picks, lock, result, scoring, and publication owners must remain unchanged.

## Objective

Implement **Phase 1, Slice 3: one secure, manually triggered backend monitoring runner**.

A single run must connect the existing UFC card-preview owner, Slice 1 odds adapter, and Slice 2 atomic storage writer.

The runner should:

1. Inspect the relevant canonical UFC event without publishing or mutating it.
2. Fetch current odds through the existing The Odds API adapter.
3. Compare source card information and normalized odds with the canonical current or staged Picks event.
4. Produce deterministic reviewable findings.
5. Persist the complete run, findings, sanitized diagnostics, quota information, and odds snapshots through `record_pick_monitoring_run(jsonb)`.
6. Return a compact typed summary suitable for a later owner-only monitoring inbox.

This is an explicitly invoked backend operation. Do not add scheduling.

## Canonical ownership

Before editing, identify the current owners for:

- UFC source preview;
- staged Event Setup draft;
- active Picks event and bouts;
- fighter and matchup normalization;
- The Odds API parsing and sportsbook selection;
- monitoring payload construction;
- monitoring database recording;
- canonical `locks_at`.

Preserve those owners.

Expected direction:

- `sync-next-ufc-event` remains the sole UFC card-source owner.
- Existing fighter and matchup normalization remains authoritative.
- Slice 1 remains the only The Odds API parsing and sportsbook-selection owner.
- `record_pick_monitoring_run(jsonb)` remains the only monitoring evidence writer.
- Existing Picks repositories and RPCs remain authoritative for active and staged event projections.
- The new runner is an orchestration owner only.

Do not create another card parser, odds parser, Supabase client, identity path, event repository, lock owner, or storage writer.

Do not overload `sync-next-ufc-event` with unrelated odds-storage responsibility merely to avoid a legitimate orchestration owner. A narrowly named new Edge Function is acceptable when it is the cleanest single owner. Explain that decision in the PR.

## Manual trigger and security boundary

Add one secure backend entry point for one monitoring execution.

It must:

- require a trusted server-side caller;
- reject ordinary authenticated profiles;
- fail closed without required provider credentials;
- obtain The Odds API key only from backend secrets;
- never accept the provider key in a request body;
- never expose the key to browser code;
- not add a public browser route or general-purpose proxy;
- not create a scheduler, cron job, polling loop, webhook, background retry loop, or automatic invocation.

Sanitize provider errors before logging, returning, or storing them.

Never include secrets in:

- logs;
- diagnostics;
- findings;
- responses;
- source details;
- test fixtures;
- build artifacts;
- committed files.

Quota metadata such as requests remaining, requests used, and request cost may be stored when provided.

## Event resolution

Resolve one relevant canonical Picks event through existing owners.

The runner must:

- preserve the database-enforced one-active-event invariant;
- identify which canonical event the source and provider event represent;
- fail closed when event identity is ambiguous or mismatched;
- use canonical database `locks_at`;
- never trust a caller-supplied lock timestamp;
- store unmatched provider events or fights as evidence rather than guessing.

Do not create, stage, activate, rotate, lock, complete, apply, or publish an event.

## Card comparison findings

Generate deterministic evidence for meaningful source-card differences, including where applicable:

- bout added;
- bout removed;
- fighter replaced;
- meaningful bout-order or card-section change;
- event identity mismatch;
- unmatched source bout;
- malformed or incomplete source data.

Reuse existing Event Setup comparison logic where possible. Do not introduce a competing card-diff implementation.

Card findings are evidence only. They must not alter the staged draft or live card.

## Odds comparison findings

For each confidently matched canonical bout:

- preserve provider, source event, sportsbook, and timestamp provenance;
- preserve both normalized fighter prices;
- compare with canonical stored bout odds when available;
- create an `odds_change` finding when either fighter's American price changed at all;
- retain exact before and after values;
- include matchup identity and canonical bout ID.

Do not add percentage thresholds, smoothing, consensus lines, movement histories, wagering advice, or automatic application.

When a canonical bout has no stored odds:

- record the snapshot;
- create informational evidence such as `odds_available` if a narrow finding-type extension is necessary;
- do not update the bout.

Use existing finding types when possible:

- `card_change`;
- `odds_change`;
- `unmatched_fight`;
- `provider_error`;
- `quota_warning`.

Add a new type only when essential, narrow, migration-safe, and justified.

## Finding contract

Each finding should contain:

- deterministic finding key;
- finding type;
- severity;
- compact summary;
- detection timestamp;
- source and canonical identities when relevant;
- matchup identity and bout ID when available;
- exact before and after values when relevant;
- useful source/provider details without secrets.

Keys should support future deduplication, but do not implement cross-run suppression or notification deduplication in this slice.

## Run status

Use existing statuses:

- `completed`;
- `partial`;
- `failed`.

Semantics:

- `completed`: source and provider checks completed without blocking errors, even when legitimate differences were found;
- `partial`: useful evidence was recorded but coverage was incomplete or warnings prevented full comparison;
- `failed`: no trustworthy monitoring result could be produced.

Detected card or odds changes do not make the run fail.

Provider failure or quota exhaustion must produce sanitized diagnostics and an appropriate partial or failed status without mutation.

## Lock and Picks safety

This slice must not:

- update live odds;
- update staged odds;
- update card metadata;
- add, remove, or reorder canonical bouts;
- publish a card;
- apply Event Setup changes;
- rotate events;
- lock or complete an event;
- record official results;
- modify submitted picks;
- modify Underdog Locks;
- modify scoring;
- expose group picks;
- create a second active event.

Snapshots fetched at or after canonical lock remain stored as audit evidence but must remain ineligible for future application under the existing Slice 2 rule.

## Response contract

Return a compact typed response with at least:

- run ID;
- run status;
- canonical event ID;
- source event identity;
- start and completion timestamps;
- findings grouped by type and severity;
- provider coverage summary;
- quota summary;
- number of stored odds snapshots.

Do not return provider secrets or unnecessary raw provider/source payloads.

## Required focused tests

Cover at least:

1. Clean matched event with complete DraftKings odds records a completed run and snapshots with no false changes.
2. FanDuel is used only when DraftKings lacks a complete snapshot.
3. Card difference creates `card_change` evidence without card or draft mutation.
4. Matched odds difference creates `odds_change` with exact before/after evidence.
5. Canonical bout with no current odds records informational evidence without updating the bout.
6. Unmatched provider fight creates `unmatched_fight` rather than an inferred match.
7. Provider failure stores sanitized diagnostics and returns partial or failed appropriately.
8. Quota warning or exhaustion creates `quota_warning`.
9. Snapshot immediately before lock is eligible.
10. Snapshot exactly at or after lock is stored but ineligible.
11. Event identity mismatch fails closed.
12. Runner uses the atomic monitoring writer rather than direct table inserts.
13. Ordinary authenticated users cannot invoke the runner.
14. No card, pick, lock, result, scoring, or publication mutation is introduced.

Use sanitized fixtures. Do not call the real provider in tests.

Do not weaken existing tests or verifier assertions.

## Validation

Run and record:

```bash
git diff --check
npm run typecheck
npm test
npm run build
```

Also run focused monitoring, Event Setup, and Picks contract tests before the full suite.

Use the repository's established safe local build values when required. Do not commit placeholder production credentials.

## Completion report

At task completion, provide a final report containing:

1. Starting checkout SHA.
2. Final Codex commit SHA.
3. Root ownership decisions.
4. Files changed.
5. Monitoring execution flow.
6. Finding and run-status rules.
7. Security and secret-handling proof.
8. Focused test results.
9. Full typecheck, test, and build results.
10. Remaining limitations or decisions.
11. Confirmation that nothing was deployed, scheduled, published, mutated, or merged.

Then use Codex Cloud's **Create draft PR** action to open one new implementation PR targeting `main`.

The new PR body should include the same report and state:

- exact base `main` SHA;
- exact final implementation head SHA;
- no deployment performed;
- no merge performed.

Do not add deployment labels. Do not merge.

## Stop conditions

Stop before editing only if:

- the checkout is not from `codyking0602/Octagon-HQ`;
- this task file is missing;
- the checkout does not descend from `ec93d102d454e81e21d20a3b2792dbcf0c76d758`;
- the merged Slice 1 or Slice 2 foundation is missing;
- ownership cannot be determined without introducing a duplicate runtime owner.

A local branch named `work`, a missing Git remote, or unavailable GitHub CLI is **not** a stop condition in Codex Cloud.
