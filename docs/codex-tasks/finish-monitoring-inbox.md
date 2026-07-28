# Codex Task — Finish Owner-Only Picks Monitoring Inbox

## Repository and exact starting point

- Repository: `codyking0602/Octagon-HQ`
- Production branch: `main`
- Production base at task creation: `76d25c05c74088325f007d1855997f51889fb3a8`
- Start from the existing branch: `feature/monitoring-inbox`
- The branch already contains a partial implementation. Audit and finish it; do not restart or create a parallel implementation.
- When finished, use Codex **Create draft PR** to open exactly one new draft PR targeting `main`.
- Do not merge.
- Do not deploy unless the task below explicitly requires a safe verification action and no existing evidence can prove it.

## Working standard

Use:

> One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.

Preserve all current canonical owners. Do not add duplicate providers, schedulers, repositories, browser-storage fallbacks, polling loops, admin systems, notification systems, card-update systems, or deployment workflows.

## Three required outcomes

Complete all three in this order:

1. Verify the merged automatic monitoring scheduler is active in production.
2. Update `docs/HANDOFF.md` to the current production state and next action.
3. Finish the owner-only Monitoring Inbox as one clean production slice.

---

# 1. Verify the merged scheduler is active

The automatic monitoring implementation was merged in PR #90 as production commit:

`76d25c05c74088325f007d1855997f51889fb3a8`

Canonical deployment owner:

- `.github/workflows/deploy-supabase.yml`

Canonical runtime verification owner:

- `scripts/verify-monitoring-function-deployment.mjs`

The production deployment should configure:

- job name: `octagon-hq-pick-monitoring`
- schedule: `7 * * * *`
- function: `run-pick-monitoring`
- scheduler token configured
- active state: `true` on a `main` push deployment

Verification requirements:

- Inspect the post-merge `main` Supabase deployment run and exact job logs/summary using `gh` or the connected GitHub environment.
- Prove the deployment used exact SHA `76d25c05c74088325f007d1855997f51889fb3a8`.
- Prove the scheduler was configured active and the live health check passed.
- Confirm exactly one canonical scheduler job exists.
- Do not invoke a legitimate scheduled monitoring run.
- Do not make a real UFC source request or Odds API request.
- Do not consume Odds API quota.
- Do not mutate Picks, cards, drafts, locks, results, scoring, or publication data.
- If the existing production workflow evidence is unavailable or incomplete, use the existing safe scheduler-health verification path. Do not invent a second health system or expose secrets.
- Record the exact evidence in the draft PR body and in `docs/HANDOFF.md`.

If verification reveals the scheduler is not active or the deployment failed, fix only the narrow canonical deployment/scheduler owner, add focused tests, and preserve the no-provider-call boundary.

---

# 2. Update `docs/HANDOFF.md`

Update the authoritative handoff to reflect the current production state.

Required changes:

- Set the current production `main` SHA to `76d25c05c74088325f007d1855997f51889fb3a8`, unless `main` legitimately advances during this task; if it does, use the actual exact SHA and explain why.
- Add the automatic Picks monitoring implementation as complete and merged.
- Document the canonical owners:
  - `supabase/functions/run-pick-monitoring/index.ts`
  - `src/features/picks-monitoring/manualMonitoringRunner.ts`
  - `src/features/picks-monitoring/monitoringStorageModel.ts`
  - `public.record_pick_monitoring_run(jsonb)`
  - scheduler migrations `202608090001` and `202608090002`
  - `.github/workflows/deploy-supabase.yml`
  - `scripts/configure-monitoring-scheduler.mjs`
  - `scripts/verify-monitoring-function-deployment.mjs`
- State the verified production scheduler status and exact evidence.
- Explain that automatic monitoring records evidence/findings only and never silently changes the live card or Picks data.
- Add the Monitoring Inbox as the current draft phase, not as live/merged.
- Replace stale “next safe action” text with the correct next action after this draft PR.
- Preserve all existing architecture and product rules.

Do not broadly rewrite unrelated sections.

---

# 3. Finish the owner-only Monitoring Inbox

## Existing partial implementation

Audit the existing branch before editing. It currently includes or may include:

- `src/features/picks-monitoring/MonitoringInboxPage.tsx`
- `src/features/picks-monitoring/monitoringInboxModel.ts`
- `src/features/picks-monitoring/monitoringInboxRepository.ts`
- `src/styles/picks-monitoring.css`
- `supabase/migrations/202608100001_pick_monitoring_inbox.sql`
- route wiring in `src/app/router.tsx`
- stylesheet import in `src/main.tsx`

Do not assume this implementation is correct. Inspect every file and simplify or repair it as needed.

## Product objective

Build a compact, UFC/2K-style, owner-only operational inbox that makes the existing automatic monitoring ledger understandable and actionable without becoming a spreadsheet or a second automation owner.

The page should answer:

- What event is being monitored?
- Is the scheduler healthy and active?
- When was the last actual check?
- When is the next eligible check?
- How much provider quota remains?
- Were all fights matched to odds snapshots?
- What new findings need review?
- What has already been reviewed or dismissed?
- Can Cody manually run the existing check now?

## Locked ownership and safety

- Reuse `public.pick_control_owners` and `public.is_pick_control_owner(auth.uid())` as the sole owner authorization boundary.
- Create one owner-only read projection RPC for the inbox.
- Create one narrow owner-only review-status mutation RPC if needed.
- Findings may change only `review_status`, `reviewed_at`, and `reviewed_by`, consistent with the existing immutable-evidence trigger.
- Reuse the existing `run-pick-monitoring` function for manual Run Check.
- Do not create another runner, provider adapter, scheduler, comparison engine, evidence writer, or polling loop.
- Do not give the browser direct table access.
- Do not expose scheduler tokens, provider keys, service-role keys, profile UUIDs, or raw secret values.
- Do not automatically apply findings.
- Do not mutate live cards, staged drafts, fighter replacements, cancellations, odds, picks, locks, results, scoring, event status, or publication state.
- Do not add notifications in this phase.
- Do not make the page visible in normal player navigation.
- Direct URL access by a non-owner must reveal no operational data.

## Recommended route and entry points

Use one owner-only route:

`/picks/monitoring`

Add compact links between the three owner tools:

- Monitoring Inbox
- Event Setup
- Fight Night Control

Do not add Monitoring Inbox to the global bottom navigation or Home.

## Recommended UI shape

Keep it compact and mobile-first.

### Header

- eyebrow: `PRIVATE OWNER TOOL`
- title: `Monitoring Inbox`
- short explanation that checks create reviewable evidence and never change the live card automatically
- links to Event Setup, Fight Night Control, and Player Picks

### Monitoring health card

Show a small set of high-value values, not a giant dashboard:

- scheduler: active/inactive
- monitored event
- last actual run
- next eligible check
- remaining quota
- coverage, such as `6 OF 6 MATCHED`

Use clear operational copy for states such as:

- `AUTOMATIC MONITORING ACTIVE`
- `WAITING FOR NEXT ELIGIBLE CHECK`
- `PICKS LOCKED — MONITORING STOPPED`
- `NO MONITORABLE EVENT`
- `QUOTA EXHAUSTED`

### Run Check action

- One manual `RUN CHECK NOW` button.
- It must call the existing owner-authenticated monitoring function.
- Show the returned run summary.
- Refresh the inbox after success.
- Disable while running.
- Do not automatically apply findings.

### Findings

Separate:

- `NEEDS REVIEW`: unresolved `new` findings
- `REVIEWED HISTORY`: reviewed or dismissed findings

Each finding should show only useful app-facing information:

- severity
- type
- summary
- detected time
- matchup/bout context when available
- concise before/after values when meaningful

Actions:

- `MARK REVIEWED`
- `DISMISS`

Do not add delete or edit-evidence actions.

### Empty and denied states

- Signed out: owner sign-in prompt.
- Signed-in non-owner: understandable access denial with no leaked monitoring details.
- No findings: explain that the latest check found nothing requiring review.
- No prior run: explain that monitoring is ready and waiting for the first eligible check.

## Data projection requirements

The owner-only projection should return only app-facing fields needed by the page. It may include:

- scheduler health and canonical name/schedule/active state
- schedule-state event identity and timing fields
- latest monitoring run summary
- latest quota fields
- snapshot coverage counts
- unresolved and recent reviewed/dismissed findings

Do not return raw scheduler token values or full secret records.

Use deterministic ordering and bounded history. Do not load the entire ledger forever.

## Review mutation requirements

- Require authenticated Fight Night owner.
- Accept only `reviewed` or `dismissed`.
- Lock and update exactly one finding.
- Do not allow changing a reviewed/dismissed finding back to `new` in this slice.
- Set `reviewed_at = now()` and `reviewed_by = auth.uid()`.
- Preserve all immutable evidence fields.
- Return a narrow success result or the updated app-facing finding.

## Required tests

Add focused tests covering at least:

### SQL / migration contract

- owner-only projection uses `is_pick_control_owner(auth.uid())`
- browser roles have no direct table access
- projection does not expose scheduler token or secrets
- review RPC accepts only `reviewed`/`dismissed`
- review RPC updates only the three permitted review fields
- non-owner denied
- deterministic bounded history
- migration ends with PostgREST schema reload

### Repository/model

- valid projection mapping
- null/no-run/no-event states
- finding mapping and ordering
- malformed payload rejection
- manual Run Check invokes only `run-pick-monitoring`
- review action invokes only the canonical review RPC

### Page

- signed-out prompt
- non-owner denial with no data leak
- health summary rendering
- unresolved and reviewed sections
- empty states
- manual Run Check refresh
- review and dismiss actions
- actions disabled while busy
- owner links present

### Architecture

- route exists once
- stylesheet imported once
- no global-navigation or Home entry
- no duplicate monitoring runner/provider/scheduler
- no browser polling loop
- no direct ledger table query

## Validation

Run and require all of the following on the exact final head:

- `npm run typecheck`
- focused monitoring-inbox tests
- full `npm test`
- `npm run build`
- `git diff --check`
- Supabase migration ordering/dry-run checks available in the repository

Report the exact final head SHA.

## Draft PR requirements

Use Codex **Create draft PR** and open exactly one new draft PR targeting `main`.

Suggested title:

`Add owner-only Picks Monitoring Inbox`

PR body must include:

- exact base SHA
- exact head SHA
- production scheduler verification evidence
- canonical owners preserved
- SQL projection/review authorization boundary
- manual Run Check reuse
- UI summary
- tests and validation results
- explicit statement that no real provider call was made during tests/verification unless unavoidable and explicitly documented
- explicit statement that no card, Picks, draft, odds, lock, result, scoring, event status, or publication data was mutated
- any live deployment required for phone testing, if not yet performed
- draft/open/unmerged reminder

Do not apply deployment labels.
Do not merge.
