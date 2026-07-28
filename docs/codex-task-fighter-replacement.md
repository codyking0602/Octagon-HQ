# Codex Cloud Task — Approved Fighter-Replacement Handling

Repository: `codyking0602/Octagon-HQ`

Start point: exact production `main` commit `f4179d497c25e6515675eabec72871459768752f`

## Required Codex Cloud workflow

- Start from the exact production `main` commit above.
- Codex Cloud must create its own feature branch.
- Codex Cloud must create one new draft pull request targeting `main`.
- Do not update or depend on a branch created by ChatGPT.
- Do not create multiple PRs or correction branches unless genuinely unavoidable.
- Keep the PR draft, open, and unmerged.
- Put the exact final head SHA, test results, and any unresolved concern in the PR body or PR comments.
- Do not merge. Cody must explicitly approve the merge later.
- Use GitHub as the communication channel. Do not require Cody to relay implementation details between ChatGPT and Codex.

## Objective

Build one owner-approved, pre-lock fighter-replacement workflow for the live published Picks card while preserving the existing owners for Picks, Event Setup, Fight Night Control, scoring, monitoring, and completed-event history.

A fighter replacement must never silently transfer a user's old selection to the replacement fighter.

## Locked behavior

When one fighter in a published upcoming bout is replaced before canonical Picks lock:

1. The Fight Night owner must explicitly approve the replacement and provide a reason.
2. Preserve the original matchup, original fighter identities, affected user selections, and before/after state in private append-only audit evidence.
3. Update the canonical live bout to the replacement fighter without deleting and recreating unrelated event data.
4. Every affected pick on that bout becomes invalid and requires an active repick.
5. Do not silently map an old selection to the replacement fighter.
6. Clear any mutable Underdog Lock attached to that bout.
7. Leave all unaffected fights, picks, odds, order, event metadata, scoring, and user history untouched.
8. Keep group picks private before the canonical lock boundary.
9. Block new picks for the outdated matchup.
10. Show affected users a clear `REPICK REQUIRED` state and updated matchup.
11. Require the user to choose one of the current fighters before the bout counts as complete in Picks progress.
12. Prevent selecting the old fighter after replacement.
13. Block this pre-lock replacement pathway once the event is locked, started, completed, or past `locks_at`.
14. Restoration or a second replacement must remain auditable and must not resurrect an invalidated selection automatically.

## Canonical ownership to preserve

- `PicksProvider` remains the only player-facing Picks owner.
- `picksRepository` remains the only player browser Supabase owner.
- `pickControlRepository` remains the only browser owner for Fight Night operations.
- Existing Event Setup remains the staging/publish owner; do not create a second setup or publish path.
- Existing monitoring remains evidence-only for card changes; do not auto-apply fighter replacements from Monitoring Inbox.
- Existing scoring/result/completed-history projections remain authoritative.
- Reuse or extend the private `pick_card_change_actions` audit owner added by approved cancelled-fight handling when structurally appropriate; do not create a parallel audit system.
- No browser-storage fallback, duplicate provider, duplicate repository, duplicate polling loop, or direct browser table mutation.

## Data-integrity requirements

- Use one owner-authorized atomic backend mutation/RPC for replacement approval.
- Require the existing Fight Night owner boundary.
- Require a non-empty reason.
- Fail closed for event/bout identity mismatch, stale expected state, ambiguous fighter identity, invalid replacement, duplicate fighter, or lock boundary.
- Preserve original pick evidence privately before invalidation.
- Do not delete unrelated `profile_event_picks` rows.
- The active pick projection should represent the affected bout as unanswered until the user repicks.
- A cleared Underdog Lock must not be restored automatically after repick.
- Odds must not be copied to the replacement fighter. Clear or safely invalidate affected bout odds until the canonical odds monitor supplies a confident current matchup snapshot.
- Do not alter fighter identity globally; replacement is scoped to the specific published event bout.
- No destructive event re-publication.

## Owner UI

Extend the existing Fight Night Control owner surface rather than adding a new admin route.

The owner should be able to:

- choose the bout,
- choose which corner is being replaced,
- enter the replacement fighter's canonical name/slug using the existing fighter data conventions,
- enter a required reason,
- review a confirmation explaining that affected picks will require repick and any Underdog Lock will clear,
- approve the change.

The UI must clearly show when a bout has replacement history and which current matchup is live. Do not expose private user picks or audit details publicly.

## Player UI

For an affected user:

- the updated matchup is displayed,
- the fight card is visibly marked `REPICK REQUIRED`,
- the previous selection is not shown as an active current pick,
- concise copy explains that a fighter changed and the fight must be picked again,
- both current fighters are selectable before lock,
- Picks progress excludes the bout until repicked,
- any prior Underdog Lock on that fight is gone,
- unaffected picks remain exactly as they were.

For an unaffected user who had not selected the replaced fighter, still require repick if the matchup changed. Nobody's old choice should survive a changed matchup automatically.

## Scoring and recap behavior

- Only the user's new valid selection on the current matchup may score.
- The invalidated original selection must never score.
- Completed-event history should retain only the official current matchup in the normal recap projection while private audit evidence preserves the original matchup and invalidated selection.
- Do not change scoring formulas, result ownership, or Underdog Lock scoring rules.

## Explicitly out of scope

- Fight reorder handling.
- Full fight removal handling beyond the already merged cancellation path.
- Monitoring Inbox action buttons.
- Automatic replacement application.
- Post-lock or post-completion corrections.
- Broad Event Setup refactor.
- New fighter-profile creation or global fighter-data editing.
- Final multi-phase phone-test fixture; that comes after reorder/removal and audited post-lock corrections.

## Required tests

Add focused tests and run the full repository suite.

Cover at minimum:

- owner authorization,
- required reason,
- exact event/bout identity and stale-state rejection,
- pre-lock-only boundary,
- original matchup and pick audit preservation,
- invalidation of all affected current selections,
- no silent selection transfer,
- mutable Underdog Lock clearing,
- affected odds clearing/invalidation,
- unaffected fights and picks unchanged,
- group privacy before lock,
- player `REPICK REQUIRED` projection,
- Picks progress behavior,
- successful active repick on the current matchup,
- outdated fighter selection rejection,
- second replacement/restoration audit behavior,
- scoring excludes invalidated original selections,
- rollback-only SQL integration coverage where practical,
- typecheck,
- full tests,
- production build.

## Completion report in GitHub

In the draft PR, Codex Cloud must report:

- exact base SHA,
- exact final head SHA,
- changed-file list and ownership summary,
- focused tests run,
- full tests/typecheck/build results,
- migration/RPC name,
- any deployment requirement,
- exact manual phone-test scenario,
- confirmation that no real production fight was modified,
- confirmation that the PR remains draft and unmerged.

Working standard: **One owner. One purpose. Small diff. Focused test. Exact-head green. Then merge.**
