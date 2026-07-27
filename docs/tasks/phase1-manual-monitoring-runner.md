# Codex Task — Phase 1 Manual Monitoring Runner

## Operating context

Repository: `codyking0602/Octagon-HQ`

Production app: `https://octagon.hq-app.workers.dev`

Base branch: `main`

Exact base `main` SHA: `ec93d102d454e81e21d20a3b2792dbcf0c76d758`

Working branch: `agent/phase1-manual-monitoring-runner`

This branch and draft PR were created before implementation so GitHub can serve as the shared handoff between Codex and ChatGPT.

Before editing, confirm:

```bash
git rev-parse HEAD
git branch --show-current
git status --short --branch
```

Expected starting state:

- branch: `agent/phase1-manual-monitoring-runner`
- HEAD: the task-spec commit directly descended from `ec93d102d454e81e21d20a3b2792dbcf0c76d758`
- clean working tree

Do not switch to or continue a generic `work` branch.

Use the project standard:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Do not deploy or merge. Cody must explicitly approve deployment and must explicitly use the word `merge` for this PR.

## Read first

Before editing, read and inspect:

- `docs/HANDOFF.md`
- `docs/product-blueprint.md`
- the current Picks monitoring code under `src/features/picks-monitoring/`
- the current Event Setup and `sync-next-ufc-event` owners
- the current Picks repositories, projections, and lifecycle RPCs
- `supabase/migrations/202608070001_pick_monitoring_storage.sql`
- existing monitoring and Event Setup tests
- canonical deployment and verification workflows

Report the current canonical owners in the PR before or alongside the implementation. Do not guess ownership from filenames alone.

## Current merged foundation

### Slice 1 — odds-provider adapter

Existing code under `src/features/picks-monitoring/` already owns:

- the normalized odds model;
- The Odds API request and response adapter;
- DraftKings preference;
- FanDuel fallback only when DraftKings lacks a complete two-fighter snapshot;
- no mixing prices from different sportsbooks;
- normalized fighter and matchup identities;
- provider diagnostics and quota metadata;
- no browser runtime owner, scheduler, database write, or production mutation.

### Slice 2 — private monitoring storage

Merged migration:

`supabase/migrations/202608070001_pick_monitoring_storage.sql`

It already owns:

- `pick_monitoring_runs`;
- `pick_monitoring_findings`;
- `pick_monitoring_odds_snapshots`;
- service-role-only atomic writer `record_pick_monitoring_run(jsonb)`;
- immutable run, finding-evidence, and snapshot storage;
- review states `new`, `reviewed`, and `dismissed`;
- canonical event-lock capture;
- strict pre-lock odds eligibility using `fetched_at < observed_locks_at`.

The existing live card, staged draft, Picks, lock, result, scoring, and publication owners must remain unchanged.

## Objective

Implement **Phase 1, Slice 3: one manually triggered backend monitoring runner**.

The runner must connect the existing card-preview owner, Slice 1 odds adapter, and Slice 2 atomic storage owner into one real end-to-end monitoring execution.

A single run should:

1. Inspect the current canonical UFC event without publishing or mutating it.
2. Fetch current odds from The Odds API using the existing Slice 1 contract.
3. Compare source card information and normalized odds against the canonical current or staged Picks event.
4. Produce deterministic reviewable findings.
5. Persist the complete run, findings, diagnostics, quota information, and odds snapshots through `record_pick_monitoring_run(jsonb)`.
6. Return a compact typed summary suitable for a future owner-only monitoring inbox.

This must remain an explicitly invoked backend operation. Do not add scheduling yet.

## Canonical ownership

Before editing, identify the current owners for:

- UFC event source preview;
- staged Event Setup draft;
- active Picks event and bouts;
- fighter and matchup normalization;
- The Odds API adapter;
- monitoring payload construction;
- monitoring database recording;
- canonical event lock time.

Preserve those owners.

Expected ownership direction:

- `sync-next-ufc-event` remains the sole UFC card-source owner.
- Existing fighter/matchup normalization remains authoritative.
- Slice 1 remains the only The Odds API parsing and sportsbook-selection owner.
- Slice 2’s `record_pick_monitoring_run(jsonb)` remains the only monitoring evidence writer.
- Existing Picks repositories and RPCs remain authoritative for active/staged event projections.
- The new runner orchestrates existing owners; it must not duplicate them.

Do not create another card parser, odds parser, Supabase client, identity path, event repository, lock owner, or monitoring storage path.

Do not overload `sync-next-ufc-event` with unrelated odds-storage responsibility merely to avoid adding a legitimate orchestration owner. If a new Edge Function is the cleanest single owner, create one narrowly named function and explain why.

## Manual trigger boundary

Add one secure backend entry point for a single monitoring execution.

The entry point must:

- require a trusted server-side caller;
- fail closed without required provider credentials;
- never expose The Odds API key to browser code;
- not be callable by ordinary authenticated profiles;
- not add a public browser route or general-purpose proxy;
- not create a polling loop, cron job, scheduler, webhook, or automatic retry loop.

The Odds API key must come only from a backend secret. It must never be accepted from the request body.

## Event selection

The run must resolve the one relevant Picks event deterministically through existing canonical owners.

It must:

- preserve the database-enforced one-active-event invariant;
- identify which canonical event the source and odds correspond to;
- fail closed when event identity is ambiguous or mismatched;
- capture canonical `locks_at` from the database;
- never trust a caller-supplied lock timestamp;
- store unmatched provider events or fights as findings rather than guessing.

Do not create, activate, rotate, complete, lock, stage, apply, or publish an event.

## Card comparison findings

Generate deterministic evidence for meaningful source-card differences such as:

- bout added;
- bout removed;
- fighter replaced;
- bout order or card-section change when materially relevant;
- event identity mismatch;
- unmatched source bout;
- malformed or incomplete source data.

Reuse existing Event Setup comparison logic where possible. Do not add a second card-diff implementation if one already exists.

Card findings must be evidence only. They must not modify the staged draft or live card.

## Odds comparison findings

For each confidently matched canonical bout:

- preserve the selected sportsbook and full provider provenance;
- preserve both normalized fighter prices;
- compare against currently stored canonical bout odds when available;
- create an odds-change finding when either fighter’s American price changed at all;
- retain exact before and after values;
- include matchup identity, canonical bout ID, sportsbook, provider timestamps, and fetch timestamp.

Do not introduce percentage thresholds, smoothing, consensus lines, movement history, or betting recommendations in this slice.

If the canonical bout has no stored odds, record the snapshot and create informational evidence such as `odds_available`; do not silently treat it as an applied update.

Use existing finding types when possible:

- `card_change`;
- `odds_change`;
- `unmatched_fight`;
- `provider_error`;
- `quota_warning`.

Add a new finding type only if the current model cannot represent an essential state cleanly. Any extension must be narrow, migration-safe, and justified.

Do not update live or staged bout odds.

## Finding contract

Finding keys must be deterministic enough to support future review and deduplication work, but do not build cross-run suppression or notification deduplication yet.

Each finding should include:

- deterministic finding key;
- finding type;
- severity;
- compact summary;
- detection timestamp;
- source and canonical identities when relevant;
- matchup identity and bout ID when available;
- before and after values when relevant;
- useful provider/source details without secrets.

## Run status

Use existing statuses:

- `completed`;
- `partial`;
- `failed`.

Expected semantics:

- `completed`: source and provider checks completed without blocking errors, even if legitimate changes were found;
- `partial`: useful evidence was recorded but coverage was incomplete or warnings prevented complete comparison;
- `failed`: no trustworthy monitoring result could be produced.

A detected card or odds change is not itself a failed run.

Provider quota exhaustion or provider failure should be recorded with sanitized diagnostics and an appropriate partial/failed status without mutating anything.

## Security and secret handling

The Odds API key must:

- exist only as a backend secret;
- never appear in logs, diagnostics, findings, responses, source details, build artifacts, tests, or browser code;
- never be accepted from browser input;
- never be committed.

Sanitize provider errors before storage.

Do not log raw provider response headers when they may contain sensitive values.

Quota values such as requests remaining, requests used, and request cost may be stored when returned by the provider.

## Lock and Picks safety

This slice must not:

- update live odds;
- update staged odds;
- update card metadata;
- add, remove, or reorder bouts;
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

Odds snapshots fetched at or after the canonical lock must remain stored as audit evidence but remain ineligible for any future automatic application, using the existing Slice 2 rule.

## Response contract

Return a compact typed response containing at least:

- run ID;
- run status;
- canonical event ID;
- source event identity;
- start and completion timestamps;
- number of findings by type and severity;
- provider coverage summary;
- quota summary;
- number of stored odds snapshots.

Do not return the provider secret or unnecessary raw source payloads.

## Tests

Add focused tests for at least:

1. A clean matched event with complete DraftKings odds records a completed run and snapshots with no false changes.
2. FanDuel is used only when DraftKings lacks a complete snapshot.
3. A card difference creates a `card_change` finding without mutating the card or draft.
4. A matched odds difference creates an `odds_change` finding with exact before/after evidence.
5. A canonical bout with no current odds creates informational evidence and does not update the bout.
6. An unmatched provider fight creates an `unmatched_fight` finding rather than an inferred match.
7. Provider failure stores sanitized diagnostics and returns partial or failed appropriately.
8. Quota warning or exhaustion produces `quota_warning`.
9. A snapshot immediately before lock is eligible.
10. A snapshot exactly at or after lock is stored but not eligible.
11. Event identity mismatch fails closed.
12. The runner calls the existing atomic monitoring writer rather than direct table inserts.
13. Ordinary authenticated browser users cannot invoke the runner.
14. No card, pick, lock, result, scoring, or publication mutation is introduced.

Use sanitized fixtures. Do not make real provider calls in tests.

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

If the production build requires environment values, use the repository’s established safe local validation method. Do not commit placeholder credentials.

## GitHub reporting contract

Work only on `agent/phase1-manual-monitoring-runner`.

Commit and push the implementation to this branch.

Update the existing draft PR body with:

- exact base `main` SHA;
- exact final head SHA;
- objective and scope;
- canonical owner analysis;
- manual-trigger and security boundaries;
- event resolution behavior;
- finding behavior;
- lock and mutation safety;
- files changed;
- focused and full validation results;
- anything that could not be validated locally;
- explicit confirmation that nothing was deployed or merged.

Also leave a final PR comment beginning with:

`CODEX FINAL REPORT`

The comment must contain:

1. Exact base `main` SHA.
2. Exact final head SHA.
3. Root ownership decisions.
4. Files changed.
5. Monitoring execution flow.
6. Finding and run-status rules.
7. Security and secret-handling proof.
8. Focused test results.
9. Full typecheck, test, and build results.
10. Remaining limitations or decisions needed.
11. Confirmation that nothing was deployed, scheduled, published, mutated, or merged.

Do not create a second PR.

Do not add deployment labels.

Do not merge.

## Stop conditions

Stop before editing and report in the existing PR if:

- this is not the `codyking0602/Octagon-HQ` repository;
- the branch is not `agent/phase1-manual-monitoring-runner`;
- the branch does not descend from base `ec93d102d454e81e21d20a3b2792dbcf0c76d758`;
- the repository is missing the merged Slice 1 or Slice 2 foundation;
- ownership cannot be determined without introducing a duplicate runtime owner.

Otherwise, complete the task in this branch and communicate entirely through the existing GitHub PR.