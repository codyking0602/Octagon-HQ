# Locked coordinated Daily cadence — October 24, 2026

Baseline main `8b9f2aed26ea10f56c8863e0a0cd5ce6c6d85195`; planned future-only cutover October 25 (Central). Simulation horizon **October 25, 2026–April 24, 2027 inclusive (182 Central dates)**. This file simulates the deterministic configured schedules, not unmaterialized database events. Live production was read-only inspected on October 24; UFC/Football Oct 24 published, no Oct 25+ UFC/Football or Nov 1+ NBA official boards observed at inspection. The migration fails closed if future publication has started before deployment.

## Root cause

The prior UFC schedule advances a 29-slot game cycle **every single calendar day**. NBA independently indexes its 28-slot cycle every two days beginning Nov 1, with no shared parity enforcement. Thus UFC/NBA coincident publication dates are possible, and the UFC's 29-slot ordering has adjacent Wavelength positions at the wrap boundary, followed by a **23-day** Wavelength absence; Sports Feud likewise has **23-day** gaps after clustered appearances. Football's 27-slot cycle has a **20-day** Wavelength gap. A separately gated Football Higher or Lower foundation (PR #2100) must not be placed in production until its content audit finishes.

## Locked contract

- Football: daily; deterministic 26-slot future cycle. Existing NFL/CFB rules, four prior Bar Trivia league appearances, and approved Cowboys Oct 26 Millionaire, Longhorns Nov 27 Feud, and Cowboys Dec 7 Bar Trivia are preserved.
- UFC: Oct 25/27/29/31, Nov 2/4/6, continuing on odd October / even November Central calendar dates. Each published board remains active on the intervening day. Future cycle has 28 game appearances (56 Central days).
- NBA: Nov 1/3/5/.../Apr 10 openings, with the April 10 board playable through April 11; 81 official regular-season publication dates, 28-slot cycle (56 Central days); owner-preview and public-launch gates remain separately closed until authorized.
- October 24 and earlier always resolve to the original immutable schedule versions. No prior attempt, streak, title or question board is rewritten. Unfinished Football/UFC Higher or Lower are absent from their active cycles; reserved Football 2x is a future activation gate, not a substitute game.
- Approved active weights: Football and UFC Average Fan **4×** (correcting legacy 5×), both Hit the Number **2×**; Football Higher or Lower **future 2×** (inactive), UFC Higher or Lower inactive; NBA unchanged at 4/4/4, 3/3/3/3, 2/2.

## Before/after summary

| Sport | Baseline dates | Locked dates | Baseline largest gap | Locked largest gap |
|---|---:|---:|---:|---:|
| FOOTBALL | 182 | 182 | 20 days | 15 days |
| UFC | 182 | 91 | 23 days | 28 days |
| NBA | 81 | 81 | 32 days | 28 days |

The largest post-cutover UFC and NBA gaps are **28 days for intentionally 2×-weighted games** (their ideal interval is 28 days on a 56-day cycle), not unexpected clustering. Across UFC and NBA, 3× games occupy 14–22-day intervals and 4× games occupy 10–18-day intervals. Football's 2× Hit the Number maintains its approved frequency and evenly distributed slots.

| Verification | Old configuration | New configuration |
|---|---:|---:|
| UFC/NBA same-date openings | 81 overlapping publication days before UFC and NBA alternation, including 8 same-game collisions | **0** overlapping publication dates |
| Cross-sport identical-game pairs | 18 | **0** |
| Projected empty required slots | 0 | **0** |
| Projected duplicate sport/date opening slots | 0 | **0** |
| Existing completed boards edited | 0 | **0** |

The baseline has 18 cross-sport identical-game pairs over six months; see the per-day CSV. The locked calendar has 0 by design; the full per-day comparison is in the accompanying CSV. NBA owner previews (Oct 23–31) are deliberately excluded from public official publication counts.

## Appearance-level audit

| Sport | Game | Weight / slots | Baseline appearances | Locked appearances | Baseline gap min–max | Locked gap min–max |
|---|---|---|---:|---:|---|---|
| football | average_fan | 4 / 26 | 34 | 28 | 2–10 | 5–7 |
| football | bar_trivia | 3 / 26 | 20 | 21 | 7–12 | 6–13 |
| football | find_leader | 3 / 26 | 20 | 21 | 2–18 | 8–9 |
| football | hit_the_number | 2 / 26 | 14 | 14 | 13–14 | 11–15 |
| football | millionaire | 4 / 26 | 28 | 28 | 3–16 | 5–8 |
| football | sports_feud | 4 / 26 | 27 | 28 | 4–12 | 2–8 |
| football | wavelength | 3 / 26 | 19 | 21 | 3–20 | 8–9 |
| football | who_am_i | 3 / 26 | 20 | 21 | 4–18 | 8–10 |
| ufc | average_fan | 4 / 28 | 31 | 13 | 2–11 | 12–16 |
| ufc | bar_trivia | 3 / 28 | 18 | 10 | 2–17 | 16–20 |
| ufc | blind_resume | 2 / 28 | 13 | 7 | 13–16 | 28–28 |
| ufc | find_leader | 3 / 28 | 19 | 10 | 4–18 | 18–20 |
| ufc | hit_the_number | 2 / 28 | 13 | 6 | 13–16 | 28–28 |
| ufc | millionaire | 4 / 28 | 25 | 13 | 4–15 | 12–16 |
| ufc | sports_feud | 4 / 28 | 24 | 13 | 2–23 | 12–16 |
| ufc | wavelength | 3 / 28 | 20 | 10 | 1–23 | 18–20 |
| ufc | who_am_i | 3 / 28 | 19 | 9 | 2–16 | 18–20 |
| nba | average_fan | 4 / 28 | 11 | 12 | 6–18 | 10–16 |
| nba | bar_trivia | 3 / 28 | 9 | 8 | 18–20 | 16–22 |
| nba | find_leader | 3 / 28 | 9 | 8 | 18–20 | 14–22 |
| nba | higher_lower | 2 / 28 | 6 | 6 | 24–32 | 28–28 |
| nba | hit_the_number | 2 / 28 | 6 | 6 | 24–32 | 28–28 |
| nba | millionaire | 4 / 28 | 11 | 12 | 6–18 | 12–16 |
| nba | sports_feud | 4 / 28 | 11 | 12 | 6–18 | 12–18 |
| nba | wavelength | 3 / 28 | 9 | 8 | 18–20 | 18–20 |
| nba | who_am_i | 3 / 28 | 9 | 9 | 18–20 | 16–20 |

## Infrastructure and safety

New immutable future schedule versions replace only the date resolver after the cutover. The canonical SQL active-day resolver serves 48-hour UFC/NBA boards; SQL submission and progress windows permit day-two continuation; 48-hour streak ordinals preserve the Oct 24→25 transition. A publication trigger refuses off-day or stale-version inserts and the existing unique schedule/day constraint and setup-evidence comparison preserve idempotency across retries. Combined reminders include UFC only on the last day of its 48-hour board. NBA notification dispatches follow the new canonical version. Existing service-only materialization, NBA public-release flags, and Football/UFC Daily-vs-Casual separation remain unchanged.

Automated proof: `src/features/play/lockedThreeSportDailyCadence.test.ts` and `supabase/tests/locked_three_sport_daily_cadence.sql`, plus existing rotation and NBA owner gate tests. Before merge, require actual exact PR-head CI and backend migration verification. This draft does not deploy or merge. The future schedule is **not live** until separately approved, and a deployment after future boards have been published must be re-planned instead of forcing this migration.

## Part 2

Verify actual generator/question-bank sufficiency against these precise projected appearance dates; remove semantic repetitions across game appearances (especially UFC Hit the Number and UFC Higher or Lower); certify Football Higher or Lower's 13+ distinct mixed NFL/CFB boards, complete and certify UFC Higher or Lower separately, then add their 2× weights only through an explicitly audited new future schedule version. No game scoring or appearance is altered in Part 1.
