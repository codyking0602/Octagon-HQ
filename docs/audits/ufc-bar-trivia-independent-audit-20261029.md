# UFC Bar Trivia — independent quality audit and focused safeguards (2026-10-29)

**Decision B — focused improvements justified, NOT a football-scale rebuild.**
**Status: DRAFT ONLY.** No main, production Supabase, published setups, attempts, scores, scoring, or UI changes are authorized.

## Actual inventory and prior editorial treatment

The UFC v3 implementation already performs substantial work:
- 98 specifically retired legacy questions, 96 reviewed/reworked, 110 newly authored source-linked facts (65 easy/medium and 45 hard/Last Call); additional cross-sport editorial curation retired other UFC entries.
- Pre-follow-up source-of-truth inventory: **320 evergreen** (86 easy / 135 medium / 74 hard / 25 Last Call) plus **12 dated current-event** candidates. After the focused 14-question retirement: **306 evergreen** (80 easy / 129 medium / 74 hard / 23 Last Call), plus the same 12 dated current-event candidates. These counts account for the existing reviewed round overrides and easy calibration; dated current-event eligibility varies by day. Current-event eligibility varies by date.
- Strong surviving examples: Masvidal/Askren five-second KO, Holly Holm's Rousey upset, Khabib submitting McGregor, Nick Diaz's St-Pierre callout, Anderson Silva/Sonnen comeback, Griffin/Bonnar, Pete Williams over Coleman, Jones/Hamill DQ, and Scott Smith's Pete Sell comeback.
- Aging history is not inherently bad; UFC 1 Royce Gracie/Gerard Gordeau and Shonie Carter's spinning backfist are genuinely worthwhile Last Call material. Keep those.

**Why not C:** iconic finishes, title upsets and fighter stories now dominate an already large source bank; the existing v3 retirement/rewrite pipeline and fact families are real, not placeholders. Deleting/replacing hundreds again would sacrifice proven material merely to optimize bank size.

## Narrow exceptions worth correcting

- **14 additional explicitly reasoned retirements**, all enumerated in `ufcBarTriviaFocusedQuality20261029.ts`. They are mostly first-host-city, corporate ownership year, announcer job-title, old broadcaster, or underwhelming Last Call entries. The associated fights remain elsewhere in the bank.
- Correct `ufc-r2-first-womens-hof-fight`: the original v3 stem asked for a Hall-of-Fame **category** but the answer choices/answer were **fighter pairings**. Corrected stem asks which 2020 title fight became the first women's UFC Fight Wing induction in 2026. Confirmed against UFC's March 2026 announcement: https://www.ufc.com/news/ufc-248-fight-between-zhang-weili-and-joanna-jedrzejczyk-to-be-inducted-into-ufc-hall-fame
- Fix a verifiably unrelated source on `ufc-bt-v3-e-001`: Henry Cejudo's Olympic wrestling question erroneously cited a Pettis-Henderson WEC article. Replaced with https://www.ufc.com/news/ufc-signs-olympic-gold-winner-cejudo.
- No editorial claim that all surviving legacy generic-source links have received individual re-verification.
- Zero source-backed replacements added: the existing retained bank has enough good questions. A new question should not be manufactured to replace every retired weak one.

## 10-question board quality

- Existing UFC scoring rounds remain **3 / 3 / 3 / Last Call**, with wagers, double-round values, streaks and scoring normalization unchanged.
- Preserve Q4 as a welcoming easy question. Use a medium-content question for **Q7**, scored at the existing Round 3 value, matching Football's polished **4 easy / 3 medium / 2 hard / 1 Last Call** difficulty journey. UFC retains its own category/round names and visuals.
- The tight inventory category is Last Call (25 before this patch; 23 afterward). Do **not** purge recognizable old-school trivia solely because it is old. The 182-day production seed uses only 9 Last Calls, not 20.

## Actual published history vs deterministic replay

Read-only production Supabase reconciliation, 2026-10-29:
- Four **actually published** UFC Bar Trivia boards in `private.daily_challenges` + `private.daily_challenge_setups`: **2026-09-29, 2026-10-05, 2026-10-07, 2026-10-24** (40 question slots).
- On **Sep 29 and Oct 5**, the same two published IDs recurred after **six days**: `ufc-current-2026-09-19-joshua-van-pantoja` and `ufc-easy2-youngest-champ`. The previous 20-appearance deterministic V3 test could not have caught these because it reconstructed older games with today's bank.
- `ufcBarTriviaPublishedHistory20261029.ts` freezes these four sets of actual IDs (including retired/expired ones). Future selection suppresses their IDs and the known related fact families inside a 184-day window; the existing strict no-repeat selector is retained. Published evidence, snapshots and player progress are never updated.
- This is a **bounded cutover fixture**, not a live DB read on every game. If future editorial changes make generated old-day replay diverge from saved history, refresh the fixture before release. Currently only five explicit V3 fact-family groups are hand-mapped; potential *unrecognized* semantic overlaps are a residual editorial risk.

## Six-month schedule and coverage

Production schedule version read from Supabase: `ufc-daily-v22-higher-lower-oct29`; the repository's approved UFC 30-slot weighted cycle and 48-hour cadence start October 29.

182-day window **2026-10-29–2027-04-28**; nine scheduled UFC Bar Trivia boards:
**Nov 2, Nov 24, Dec 14, Jan 1, Jan 23, Feb 12, Mar 2, Mar 24, Apr 13**.

`ufcBarTriviaFocusedQuality20261029.test.ts` checks all nine setups at the exact production schedule seed, 90 unique IDs and mapped fact families, no overlap with real saved published IDs inside 184 days, 4/3/2/1 content progression, ten choices/board, Last Call sufficiency, and current-event active/expiry bounds. The pre-existing 20-appearance UFC V3 stress test remains in the suite. The current-event bank uses dated expiry; no permanent reliance on future news availability.

## Verification / release boundary

Tests to run at exact draft PR head: TypeScript typecheck, `ufcBarTriviaFocusedQuality20261029.test.ts`, `ufcBarTriviaV3Editorial.test.ts`, `barTriviaContent.test.ts`, `barTriviaEditorialCuration.test.ts`, shared engine/daily regression, and 182-day actual-production seed replay. For Go Live later, reconcile latest main, full ready-PR Validate V2, backend/migrations and production verification. Draft checks alone are not a release green light.

No score reset, October 29 reroll, main merge, deployment, live Supabase edit, or notifications.
