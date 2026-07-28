# Codex Correction Task — Finish PR #91 Monitoring Inbox

## Current state

Repository: `codyking0602/Octagon-HQ`

Existing draft PR: **#91**

PR branch: `codex/complete-finish-monitoring-inbox-task`

Current PR head before this correction task: `b354def7090baf999d16e99f4cc29df80452ae29`

Production `main` base: `76d25c05c74088325f007d1855997f51889fb3a8`

Prepared partial Inbox branch: `feature/monitoring-inbox`

Prepared partial Inbox head before Codex ran: `dbf4a3d433b2161c7a3012845ae2d8b5959d4884`

The previous Codex run did not complete the assigned scope. PR #91 currently contains only scheduler runtime verification and handoff changes. It does **not** contain the Monitoring Inbox route, page, repository, model, styles, owner-only projection/review RPC, focused Inbox tests, or owner-tool cross-links.

## Required outcome

Update the existing PR #91 branch in place. Do not create another PR.

Finish all three originally requested outcomes:

1. Prove the merged production scheduler is active using the canonical existing deployment/health verification path without making a real monitoring/provider call.
2. Correct `docs/HANDOFF.md` to reflect production and the Monitoring Inbox draft accurately.
3. Finish, test, and validate the owner-only Monitoring Inbox.

Use:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Do not deploy or merge. Do not create another PR.

---

## 1. Consolidate the prepared Inbox work into PR #91

Inspect and incorporate the intended files from `feature/monitoring-inbox` rather than restarting:

- `src/features/picks-monitoring/MonitoringInboxPage.tsx`
- `src/features/picks-monitoring/monitoringInboxModel.ts`
- `src/features/picks-monitoring/monitoringInboxRepository.ts`
- `src/styles/picks-monitoring.css`
- `supabase/migrations/202608100001_pick_monitoring_inbox.sql`
- route wiring in `src/app/router.tsx`
- stylesheet import in `src/main.tsx`

Audit every file. The prepared branch is partial, not automatically correct.

Also add compact owner-tool cross-links so all three operational pages link to each other:

- Monitoring Inbox
- Event Setup
- Fight Night Control

Do not add Monitoring Inbox to Home or global navigation.

---

## 2. Locked ownership and safety

Preserve these owners:

- `public.pick_control_owners`
- `public.is_pick_control_owner(auth.uid())`
- `run-pick-monitoring`
- `manualMonitoringRunner.ts`
- `monitoringStorageModel.ts`
- `record_pick_monitoring_run(jsonb)`
- the existing single cron scheduler
- existing deployment workflows

The Inbox may add only:

- one owner-only read projection RPC;
- one narrow owner-only finding review-status RPC;
- one browser repository for those RPCs and the existing manual monitoring function;
- one route/page and styling.

Do not add a second runner, provider adapter, scheduler, comparison engine, evidence writer, polling loop, notification system, card-update path, or browser table query.

The review RPC may change only:

- `review_status`;
- `reviewed_at`;
- `reviewed_by`.

Accept only `reviewed` and `dismissed`. Never allow reset to `new` in this slice.

Never expose scheduler tokens, provider keys, service-role keys, Vault values, raw cron commands, profile UUIDs, or direct table access.

Never mutate cards, drafts, odds, Picks, locks, results, scoring, event status, or publication state.

---

## 3. Audit and repair the prepared Inbox implementation

The page must answer compactly:

- what event is monitored;
- scheduler active/healthy state;
- last actual monitoring run;
- next eligible check;
- remaining provider quota;
- fight/snapshot coverage;
- unresolved findings;
- reviewed/dismissed history;
- manual Run Check action.

Important repairs to consider:

- Align the Inbox scheduler-health shape with PR #91's `command_configured` runtime proof so the page does not report healthy when the command is malformed.
- Distinguish the cron wake from the latest actual provider-backed monitoring run.
- Show coverage such as `6 OF 6 MATCHED`, not only raw snapshot count.
- Handle quota exhausted clearly and avoid an unsafe or misleading manual action.
- Ensure source-event identity logic matches the canonical monitoring runner.
- Ensure deterministic bounded ordering for runs and findings.
- Ensure direct URL access by a signed-in non-owner returns no operational data.
- Ensure manual Run Check calls only `run-pick-monitoring`, shows/uses its returned summary when available, and refreshes the Inbox after success.
- Keep the UI mobile-first and compact rather than a spreadsheet.

---

## 4. Scheduler verification

PR #91 added:

- `202608090003_verify_pick_monitoring_scheduler_runtime.sql`;
- `command_configured` checks in scheduler configuration/deployment verification;
- extra deployment migration checks.

Audit those changes. Preserve them only if they are valid, migration-safe, and do not expose secrets.

Required production proof:

- exact production backend SHA corresponds to merged `main` commit `76d25c05c74088325f007d1855997f51889fb3a8` unless `main` legitimately advances;
- exactly one `octagon-hq-pick-monitoring` job exists;
- schedule is `7 * * * *`;
- active is `true` in production;
- token is configured;
- function target/command shape is correct;
- no legitimate scheduled run is invoked;
- no UFC source or Odds API request is made;
- no provider quota is consumed;
- no Picks/card data is mutated.

Use the existing canonical health/deployment verification path. Do not create a second health system.

The current PR backend check is expected to fail until the exact PR backend is deployed because it compares deployed function SHA to the PR head. Do not mislabel that as a product defect. Do not deploy unless necessary and explicitly safe. A PR-head backend deployment must leave the scheduler inactive; if used, restore/verify production activation only through the canonical `main` owner.

---

## 5. Handoff correction

Update `docs/HANDOFF.md` narrowly.

Required content:

- current production `main` SHA;
- automatic monitoring complete and merged;
- canonical monitoring owners and migrations `202608090001`, `202608090002`, and `202608090003` if retained;
- exact scheduler verification evidence and limitations;
- automatic monitoring records evidence only and never silently updates Picks/card data;
- Monitoring Inbox is the current draft PR phase, not already live;
- replace the stale cleanup-migration “Next safe action” with the actual next action for PR #91;
- do not claim the Inbox is deployed, live, or merged.

---

## 6. Required tests

Add focused tests covering at least:

### SQL / migration contract

- owner-only projection uses `is_pick_control_owner(auth.uid())`;
- no browser table grants;
- no token/secret/raw-command exposure;
- deterministic bounded history;
- canonical scheduler health fields;
- review RPC accepts only `reviewed`/`dismissed`;
- review RPC changes only permitted fields;
- non-owner denial;
- PostgREST reload.

### Repository/model

- valid projection mapping;
- null event/run/schedule states;
- malformed payload rejection;
- finding mapping;
- manual Run Check invokes only `run-pick-monitoring`;
- finding review invokes only `review_pick_monitoring_finding`.

### Page

- signed-out state;
- non-owner denial with no data leak;
- active and unhealthy scheduler states;
- monitored event, last run, next eligible check, quota, and coverage;
- empty/no-run/no-finding states;
- unresolved and reviewed sections;
- manual run refresh;
- mark reviewed and dismiss;
- actions disabled while busy;
- all owner-tool links.

### Architecture

- route exactly once;
- stylesheet import exactly once;
- no Home/global-nav entry;
- no direct monitoring-table browser query;
- no polling loop;
- no duplicate runner/provider/scheduler.

---

## 7. Validation

On the exact final PR #91 head, require:

- `npm run typecheck`;
- focused Monitoring Inbox tests;
- `npm test`;
- `npm run build` using the repository's expected environment contract;
- `git diff --check`;
- migration-order/dry-run checks available locally;
- exact-head GitHub validation.

Do not dismiss full-suite failures as baseline without proving the same failure on exact `main`. The prior claim about unrelated baseline failures is not sufficient because GitHub's exact PR-head `Validate V2` workflow passed.

Update the existing PR #91 title to:

`Add owner-only Picks Monitoring Inbox`

Update its body with:

- exact base and head SHAs;
- scheduler production verification evidence;
- complete Inbox scope;
- owners preserved;
- tests and exact-head results;
- explicit no-provider-call/no-quota-use statement for verification;
- explicit no Picks/card mutation statement;
- draft/open/unmerged state.

Do not create another PR. Do not apply deployment labels. Do not merge.
