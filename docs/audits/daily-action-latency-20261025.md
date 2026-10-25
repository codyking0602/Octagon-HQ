# Official Daily action-latency audit — 2026-10-25

## Scope and evidence

Source inspected at `main` f9ded560e2870a11afbda1b23181dbb5d0703476, across the official Daily React views, `useTodayChallengeRuntime`, repository transport, Edge runtime, persistence RPC, and server-side game engines. This is a **source-path audit**, not a claim of measured production percentiles; authenticated production gameplay cannot be replayed without changing someone's one-shot official attempt.

Applies to **UFC, Football, NBA**, and to the active games: Who Am I, Find the Leader, Hit the Number, Higher or Lower, Millionaire, Sports Feud, Bar Trivia, Average Fan, Wavelength, Blind Resume, Blind Rank, and Keep/Cut, where scheduled. NBA remains launch-gated under existing rollout rules.

## Structural latency causes confirmed

1. **Serial, server-authoritative per-action transport.** Daily selections, answers, hints, and intermediate choices submit individual `daily-challenge-runtime` requests. `useTodayChallengeRuntime` awaits each verified revision before draining the next queued action. This is essential for consistency, grading privacy, idempotency, and cross-device state, but means slow server actions accumulate during a session.
2. **Redundant read after each save.** UFC, Football, and NBA all called `get_daily_challenge_runtime_context` and `finalizePending` after *every* action—even when that action was unfinished and the `save_daily_challenge_runtime_progress` RPC had already returned its saved state and new revision.
3. **Oversized advance bundles.** A submitted Millionaire answer imported full publication/question-selection modules; Bar Trivia likewise imported the full authored question bank and seeded historical rotation. Those are necessary to *publish* boards, not to *grade a persisted choice*. Some other games still share larger general advance bundles; their first-request cold start remains an area for profiling.
4. **Per-game UI gating.** Some choices (such as Football role-progress Hit the Number) did not render until round-trip. PR #2107 corrects that board-specific problem. Millionaire already locks the chosen answer visually on tap but cannot reveal correct/incorrect without server confirmation.
5. **Transient compute-limit retries.** A request that hits Edge HTTP 546 can trigger bounded retries/backoff. That is a protective recovery path, not desirable normal gameplay latency. Lean per-game bundles reduce avoidable cold-load/CPU pressure.

## Changes in this PR

| Coverage | Change | Gameplay / privacy invariant |
|---|---|---|
| UFC + Football + NBA, **every unfinished Daily action** | Return the validated save RPC's durable revision/state rather than reading it again | Terminal actions still re-read and finalize; stale revisions, idempotent action IDs, persisted history and scoring remain enforced |
| UFC + Football + NBA Millionaire | Use a dedicated lean answer/lifeline engine that reads the already-published private run | Same grading and timing, no hidden answers in public setup; published daily question/run unchanged |
| UFC + Football + NBA Bar Trivia | Use a dedicated lean answer/wager engine without importing authored question bank/rotation during play | Same saved run, scoring, wager and reveal; no schedule/publication changes |
| Football Hit the Number | Previously merged PR #2107 immediately displays role-progress selections from safe persisted eligibility | Server still verifies and saves each pick; official lock/score remains canonical |
| All Daily games | Retain existing optimistic action queue and server reconciliation | Don't bypass verification or invent correct answers on the client |

## Remaining verification and performance acceptance

- Run the exact-head typecheck/build and all frontend/backend Daily regression suites, including the persisted legacy and fresh database proof. Deploy and verify both Cloudflare and the Supabase Edge runtime.
- For real user timing, compare **tap → visual acknowledgement**, **tap → saved revision**, and **tap → next question/results** across each scheduled sport/game on a warm and cold connection. Prior production baseline timings were not recorded in source; no fabricated before/after percentages.
- Any server-authoritative reveal still necessarily waits for the authenticated network response. The key win is reducing *unnecessary* round trips and avoiding heavy content imports on two especially slow games. Other large game bundles may merit dedicated slices if measured latency remains high. Do not claim zero-latency scoring, broad empirical certification, or instant offline official play.
- The backend must never optimistically mark an attempt complete or reveal private answers before grading. Date scope, leaderboards, streaks, schedules, and completed results must remain unchanged.
