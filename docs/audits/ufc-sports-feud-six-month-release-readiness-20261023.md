# UFC Sports Feud — six-month release readiness audit

**Editorial snapshot: October 23–24, 2026.** Source branch `content/ufc-feud-v2-batch5-20261023`, based on `main` when this build started. The production UFC question selector and all existing challenge scores, published packs and result drill-downs are unchanged.

## Bottom line: NOT READY TO GO LIVE

The production UFC Daily weighted cycle has **four Sports Feud slots every 29 calendar days** (verified against `src/features/play/dailyChallengeRotation.ts`). The future window **2026-10-24 inclusive to 2027-04-24 exclusive** has **24 Sports Feud appearances**. A genuinely no-repeat bank therefore needs at least **48 distinct Main question topics and 120 distinct Fast topics** for this specific six-month window, plus a safety buffer. The older 20-appearance guideline (40 Main + 100 Fast) is **not enough for this active six-month schedule**.

Current editorials remain below the minimum:

| Classification | Main | Fast | Total |
|---|---:|---:|---:|
| Authored as new question drafts (batches 1–7) | 34 | 115 | 149 |
| Good original 350-question families copied for possible use (not fully fact/answer QA certified) | 8 | 12 | 20 |
| Original families staged for rewrite, but **not fixed or verified** | 15 | 0 | 15 |
| **All raw staged candidates** | **57** | **127** | **184** |
| **New drafts advancing after first-pass editorial holds** | **23** | **72** | **95** |
| **Upper bound including the 20 legacy KEEP entries, before deduplication or signoff** | **31** | **84** | **115** |

The mechanical semantic grouping pass across the **95 new advancing rows** now finds only **21 distinct Main families and 66 distinct Fast families**. Even granting all eight Main and twelve Fast old KEEP entries as fully viable and unrelated to any new question (an unrealistically generous upper bound), the supply would be **at most 29 Main and 78 Fast independently different families**. That leaves **at least 19 Main and 42 Fast missing** for this window, in addition to all pending factual and alias certification. This family-level shortfall is more important than raw 57/127 staging.

The original UFC v1 bank contains **350 historic rows but only 70 question families repeated five ways**. Those 280 reformulations **cannot** fill the content gap. 54 new question drafts are held after initial editorial screening. At least **17 additional Main and 36 additional Fast valid answers/topics** are missing even if all 20 legacy KEEP entries survive, *before* semantic topic-group collapse. Because several advancing prompts share one conceptual recall task, the true shortfall is larger.

The six-month readiness gate `src/features/play/ufcSportsFeudV2EditorialReleaseGate.ts` documents candidate inventory, explicit editorial holds, semantic topic collisions, and derives actual UFC Feud appearances from the live schedule. The gate intentionally reports **not ready** while there are no fully approved, fact/alias-certified release entries. **Do not bypass the gate by counting raw rows or by repeating a named-athlete template with another name/country/year.**

## Added this build

- **Batch 5**: 22 new editorial prompts — seven Main and fifteen Fast, with one topic per prompt. Four separate source files and `ufcSportsFeudV2Batch5Editorial.ts` record holds and shared families.
- **Batch 6**: Eight Main plus sixteen Fast with stronger UFC sport-identity / audience-focus, including reclaimed belts, women champions, UFC trilogies, coaches, fouls, judging vocabulary and cage culture.
- **Batch 7**: Nineteen Fast candidates covering fighter-career transitions, UFC debut pressures, rematch motivations, management, fighter-family reactions, social-media interactions and press/fan activity. Eight are held pending overlap and fairness work.
- **Facts repaired**: A failed DWCS appearance cannot count as *earning a UFC contract via a win*; a 1987 NCAA Division I wrestling runner-up was removed from the national-champion answer set; Jessica Penne was removed from the undisputed UFC women's champions board; Jose Aldo was removed from UFC-only trilogy participants; the venue and person answer kinds were corrected to prevent surname-based false matches; the Jon Jones 2018 UFC title reclaim and Kayla Harrison 2025 bantamweight title are explicitly sourced.
- **Automated verification**: all ranked answers, true off-board extras and curated aliases tested against the production matching engine; separate negative tests for historically incorrect candidates; explicit 24-appearance six-month target and duplicate-family guard.

## Reasons not to activate the future-only selector yet

1. **The Main bank is not deep enough after editorial and factual filtering.** The staged count looks large only when unverified rewrite placeholders, held concepts and near-identical questions are included.
2. **Fast Money is worse after semantic deduplication.** Five different fighter nationalities still represent a single question pattern; assorted UFC event-number lists, famous named-opponent prompts and fight-week audience-object lists likewise require a shared cooldown family.
3. **The first-pass answer matrices are not a substitute for exhaustive defensible grading.** Open-ended prompts must accept legitimate equivalents and common fan terms without granting two different scored outcomes for the same synonym. Official UFC history and attribution are mandatory for factual Main questions.
4. **Production must preserve history**: version the future-only UFC selector rather than replacing v1 IDs or regrading published days; use an appearance ordinal, deterministic same-day shared pack and a 24-appearance cross-sport-safe no-repeat allocation. Do not switch Daily rotation in this PR; another chat may own that change.
5. **No fabricated survey ranks.** Scores use the existing editorial recognition ladder, not invented polling.

## Build and release policy

Draft PR #2067 remains open; this branch modifies **only new isolated editorial files, review tests and audit documentation**, not the production scheduler or game. A merge is permitted only after the real gap is filled and the exact PR head passes every required test. Even a green staging-only PR does not mean the six-month bank is live.

Owner requested "Get us to the 6 month bank. Go live". Release is blocked by the objective insufficiency above, not by missing authorization. Continuing authoring, fact-checking and rotation work is necessary; deploying the incomplete bank would break the user-approved quality standard.
