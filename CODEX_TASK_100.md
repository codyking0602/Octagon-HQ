# Codex Task 100 — Owner-approved pre-lock live fight removal

## Execution contract

This task is intentionally self-contained. Do not fetch GitHub issue #100 and do not require a configured Git remote.

Repository: `codyking0602/Octagon-HQ`

Work only on branch:

`codex/issue-100-live-fight-removal`

This branch was created directly from exact production `main` commit:

`55bd59b133a45cf279118a96c7642f683ae29a1f`

Task-document commits were then added on top. Before editing, run:

```bash
git rev-parse HEAD
git merge-base HEAD 55bd59b133a45cf279118a96c7642f683ae29a1f
git status --short --branch
```

The exact production base commit `55bd59b133a45cf279118a96c7642f683ae29a1f` must exist in the local history and the `git merge-base` command above must return that same SHA. If it does not, stop and report both values. A Git remote is not required to implement or test the change locally.

Implement the full task below. Do not merge, deploy, or modify real production card/member data. Remove this `CODEX_TASK_100.md` file before the final PR head so it is not merged into `main`.

## Objective

Add one owner-approved, pre-lock workflow for moving a published UFC fight off the **pickable Picks card** without deleting the bout, pretending the fight was cancelled, or creating a competing Picks/scoring/audit owner.

Create one narrow draft PR targeting `main`. Do not merge.

## Product distinction

Removal is not cancellation.

- **Cancellation** means the fight itself was cancelled and continues using `pick_bouts.result_status = 'cancelled'`.
- **Removal** means the fight may still happen, but it is no longer part of this app's pickable/scored card.
- Do not overload `result_status`.
- Do not delete `pick_bouts`, submitted picks, odds, results, or audit history.

## Canonical state

Add the smallest explicit live-card inclusion state to `pick_bouts`:

`included_in_picks boolean not null default true`

Backfill every existing bout to `true` safely.

This field is the only canonical answer to whether a published bout currently counts as part of the pickable/scored Picks card. Official fight outcome remains owned by `result_status`.

## Owner-approved mutation

Add one atomic backend owner, preferably:

`approve_pick_bout_inclusion(...)`

It must support removal and restoration through an explicit requested inclusion state.

Requirements:

- service role or existing Fight Night Control owner only;
- trimmed reason of 3–500 characters;
- event exists, is `upcoming`, and is before both `locks_at` and `starts_at`;
- bout exists and is locked for update;
- only a `pending` bout may be removed or restored;
- expected current inclusion state is required as a stale-state guard;
- expected current red and blue fighter slugs are required so the action cannot apply after an unnoticed replacement;
- removing an already removed bout and restoring an already included bout must fail clearly rather than append fake audit history;
- removing the final included bout on an event must be rejected;
- no deletion or remapping of picks;
- no fighter, position, weight class, result, winner, odds, or odds-provenance mutation;
- return a deterministic result containing the event, bout, final inclusion state, and safe bout summary.

Use a migration logically after `202608140001_approved_live_fight_reorders.sql`, preferably:

`202608150001_approved_live_fight_removals.sql`

## Picks and Underdog Lock behavior

On removal:

- preserve every `profile_event_picks` row exactly;
- exclude the bout from required Picks progress and scoring;
- block new picks and pick changes for that bout;
- clear only mutable `profile_event_underdog_locks` rows tied to that bout;
- never change frozen lock evidence;
- block selecting a new Underdog Lock on that bout;
- do not create `REPICK REQUIRED`;
- do not clear stored odds or provenance, but do not present the removed bout as an active odds opportunity.

On pre-lock restoration:

- preserved existing picks become active again automatically because matchup identity never changed;
- users who never picked that bout must pick it for completion;
- do not silently restore a cleared Underdog Lock;
- monitoring may resume eligible odds updates through the existing owner.

## Scoring, completion, and history

Update every canonical calculation/projection that currently assumes every non-cancelled bout is included.

- Removed bouts must not count as wins, losses, missing picks, bonuses, or required picks.
- A removed pending bout must not block event completion.
- Official result entry should not be required for a removed bout.
- Completed recaps must retain the bout and preserved selections as historical evidence with an explicit verdict such as:
  - `REMOVED FROM PICKS`
  - `EXCLUDED FROM SCORING`
- Never label a removed bout as cancelled, draw, no contest, missing, incorrect, or unresolved.
- Preserve group-pick privacy until the existing canonical lock boundary; after that boundary, preserved selections may be shown under the existing reveal rules.

## Player Picks presentation

Keep the bout visible as a compact read-only historical card rather than silently disappearing.

For a removed bout:

- show the matchup and the viewer's preserved pick when one exists;
- show `REMOVED FROM PICKS · EXCLUDED FROM SCORING`;
- no fighter selection controls;
- no Underdog Lock control;
- no `REPICK REQUIRED`;
- do not count it in the completion denominator.

Restoration before lock returns the same bout to normal pickable behavior without recreating or transferring selections.

## Fight Night Control

Keep `pickControlRepository` as the only browser Supabase owner and Fight Night Control as the owner UI.

Expose safe projection fields only:

- `included_in_picks`;
- `can_remove_from_picks`;
- `can_restore_to_picks`;
- `has_removal_history`.

Do not expose private reasons, evidence, or approver details.

UI behavior:

- clearly separate `REMOVE FROM PICKS` from `CANCEL FIGHT`;
- clearly separate `RESTORE TO PICKS` from cancellation restoration;
- require a reason;
- show an explicit confirmation explaining that picks are preserved, the fight is excluded from progress/scoring, and any mutable Underdog Lock is cleared;
- reload canonical control state after success;
- stale-state errors must require reload rather than retrying an outdated action.

Action gating:

- a removed bout cannot be cancelled or fighter-replaced while excluded;
- cancellation restoration and removal restoration remain separate actions;
- existing reorder ownership remains unchanged and continues to preserve the full stored card and bout positions.

## Audit ledger

Keep `pick_card_change_actions` as the sole private audit owner.

Add bout-level action types, preferably:

- `remove_bout_from_picks`;
- `restore_bout_to_picks`.

Update `pick_card_change_action_type` and `pick_card_change_action_subject` so both require a non-null `bout_id`; `reorder_card` remains the only event-level null-bout action.

Append exactly one action per successful remove/restore. Evidence must include:

- full before and after bout state;
- fighter names/slugs and position;
- prior/final inclusion state;
- exact preserved pick rows or an auditable ordered snapshot plus count;
- mutable Underdog Locks cleared by removal;
- reason, approver, and timestamp through the existing ledger columns.

The ledger remains unreadable to normal browser users.

## Monitoring and odds safety

Monitoring remains evidence/advisory for card changes.

- Never auto-remove or auto-restore a bout.
- Automatic odds application must skip `included_in_picks = false` bouts.
- Active-card comparison should use the canonical included set so an intentionally removed fight is not treated as actively pickable.
- Restoring the bout may resume the existing eligible odds path.
- Do not add another provider, runner, scheduler, polling loop, or odds writer.

## Ownership boundaries

Preserve all existing owners:

- `PicksProvider` — only player-facing Picks owner;
- `picksRepository` — only player browser Supabase owner;
- `pickControlRepository` — only Fight Night browser owner;
- Fight Night Control — owner UI;
- Event Setup — staging/publication owner;
- `pick_card_change_actions` — only card-change audit ledger;
- `record_official_pick_bout_result` — official result owner;
- `transition_pick_event` — event lifecycle owner;
- existing scoring and completed-history projections — calculation/history owners;
- monitoring — evidence and eligible odds only, never card membership mutation.

Do not add local-storage fallbacks, direct table writes from the browser, parallel RPC owners, broad cleanup, or unrelated refactors.

## Required executable SQL coverage

Add a rollback-only Supabase integration test proving at least:

1. non-owner rejection;
2. reason requirement;
3. stale inclusion and stale fighter-identity rejection;
4. unknown event/bout rejection;
5. locked, past-lock, started, completed, resolved, and cancelled rejection;
6. unchanged remove/restore rejection;
7. final-included-bout removal rejection;
8. exact bout-row preservation except `included_in_picks`;
9. exact preservation of all submitted pick rows;
10. exact preservation of all unaffected bouts, picks, locks, odds, order, results, and metadata;
11. clearing only affected mutable Underdog Locks;
12. no `REPICK REQUIRED` from removal;
13. new pick and new lock rejection while removed;
14. progress denominator excludes removed bouts;
15. removed pending bout does not block event completion;
16. scoring and season totals exclude removed bouts;
17. completed recap retains the bout with removal-specific excluded presentation;
18. pre-lock restoration reactivates preserved picks but not cleared locks;
19. automatic odds application skips removed bouts;
20. Player Picks and Fight Night Control agree on inclusion state;
21. group-pick privacy remains intact before lock;
22. exactly one private audit per successful action;
23. a remove → restore → remove sequence appends independent immutable audits;
24. audit subject constraints and event/bout foreign-key integrity.

Also add focused TypeScript/unit/static contract tests for model mapping, repository RPC arguments, UI gating, confirmation copy, progress/scoring behavior, recap presentation, and ownership boundaries.

## Safe deployment and phone test

After exact-head typecheck, full tests, build, migration validation, and review:

1. Deploy backend and frontend from the same exact PR head through the trusted labels.
2. Use a controlled test event/bout, never a real active card with member data.
3. Save a test pick and mutable Underdog Lock on the target bout plus an unaffected pick on another bout.
4. Remove the target from Picks with a reason.
5. Confirm the bout remains visible but read-only and excluded.
6. Confirm the preserved pick still displays, progress adjusts, and the mutable lock is gone.
7. Confirm the unaffected bout is unchanged.
8. Confirm new picks/locks are blocked on the removed bout.
9. Restore it and confirm the preserved pick becomes active without restoring the lock.
10. Remove it again and confirm a second independent audit.
11. Verify completion/scoring/recap behavior in the controlled scenario.
12. Clean up through the canonical test cleanup path.

## Deliverable

One narrow draft PR implementing only owner-approved pre-lock live fight removal/restoration. Include exact base and head SHAs, changed files, ownership proof, executable test results, deployment status, and safe phone-test instructions in the PR body.

Do not merge and do not modify real production card or member pick data.
