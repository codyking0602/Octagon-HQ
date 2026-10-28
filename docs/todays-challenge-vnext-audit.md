# Today’s Challenge vNext — Stage 11 Final Audit

**Status:** Complete
**Date:** September 11, 2026  
**Future schedule cutover:** September 12, 2026 Central
**Canonical production host:** `https://the.hq-app.workers.dev`

## Final state

Stage 11 keeps one canonical Daily platform for UFC and Football. No alternate scheduler, schedule engine, grader, persistence path, leaderboard provider, repository, or route owner was introduced.

Canonical ownership remains:
- `private.daily_challenge_schedule_versions` — immutable sport-scoped schedules;
- `private.daily_challenge_setups` — immutable setup/private evidence;
- `private.daily_challenges` — published sport/day identity;
- `private.daily_challenge_progress` — cross-device progress;
- `private.daily_challenge_attempts` — immutable official-first result;
- `private.grade_daily_challenge(...)` — sole server grading entry point;
- `supabase/functions/daily-challenge-runtime/index.ts` — materialization/progress orchestration;
- `src/features/play/todayChallengeRepository.ts` — shared browser repository.

## Who Am I

Who Am I is replayable and Daily-capable in both sports.

Daily mode is deterministic, ignores casual recent-subject exclusions, restores progress cross-device, preserves immutable first completion, uses backend grading, reveals the correct identity after completion, and reuses the existing leaderboard/history/standings/streak/reminder system.

Scoring remains:
- clue 2 / 4 / 6 / 8 / 10 solve: **100 / 95 / 90 / 80 / 70**
- wrong natural guess: **−10**
- Recovery first choice: **45**
- Recovery second choice: **30**
- miss both Recovery choices: **0**

## Safe future cutover

Production was inspected read-only before Slice 5. Both sports were materialized only through **September 11, 2026**, so **September 12, 2026** is the first safe future Central boundary.

### UFC — `play-rotation-v7`
24 slots: Find the Leader ×5, Wavelength ×5, Blind Resume ×4, Hit the Number ×4, Who Am I ×4, Daily Double ×2.

### Football — `football-daily-v4`
20 slots: Find the Leader ×5, Wavelength ×5, Hit the Number ×4, Who Am I ×4, Daily Double ×2.

Daily Double remains the existing Blind Rank 5 → Keep 4 / Cut 4 experience.

Football Blind Resume has no future v4 slots. Historical Football Blind Resume days on v1/v2/v3 remain intact and queryable. Historical UFC schedule versions remain untouched.

## Standings

The existing `public.get_daily_challenge_standings(text)` projection now includes Who Am I per-game averages. The existing browser repository and standings component consume it; no parallel query was added.

## Release contract

Completion requires the exact final head to pass typecheck, production build, all 8 test shards, phone-layout verification, aggregate Validate V2, and required backend verifiers. The exact head must be deployed through canonical GitHub Actions with migration `202612310093` present remotely and no pending linked migration. After merge, frontend/backend workflows and the live deployment marker must match the exact merge SHA.

## Next roadmap item

**Stage 12 — Draft Room foundation + Build a QB.**
