# Millionaire editorial triage and six-month release gate — October 25, 2026

**Status: NOT CERTIFIED — DO NOT TREAT THIS DOCUMENT AS APPROVAL TO PUBLISH AN EXPANDED BANK.**
This is a source-code inventory, a question-by-question *triage* worksheet, and a set of six directly checked corrections, **not** a completed independent 240-question factual audit. The separately checked questions and their sources appear in the CSV. Other questions remain **HOLD** until their answers, wrong choices, ladder placements, clues and source support are individually reviewed. The CSV has exactly 240 question rows.

## Source and identity
- Main snapshot initially inspected: `25d5a49c4e8acc4b411f047a6fb579d9865c4930`.
- Bank: `src/features/play/millionaireDailyQuestionBank.ts` (10 runs × 8 questions per league, 240 total).
- Selection: `src/features/play/millionaireDailyRuntime.ts` uses per-league appearance mod `MILLIONAIRE_DAILY_RUN_COUNT=10`.
- Themed Football overrides: `footballTeamThemeDailyPacks.ts`; **October 26 NFL** uses the existing Cowboys-themed override, not an ordinary bank run.
- New schedule from `dailyChallengeRotation.ts`: Football v22 starts Oct 27 (28-slot cycle, four Millionaire), UFC v22 starts Oct 29 (30-slot cycle, four Millionaire, one slot every 48 hours). October 25's UFC board is immutable.
- NBA editorial content and NBA publishing remain out of scope.

## 182-calendar-day demand: October 25, 2026 – April 24, 2027
| League | Total appearances | Ordinary bank appearances | Distinct ordinary runs available | Repeated run identities |
|---|---:|---:|---:|---:|
| NFL | 14 | 13 | 10 | 3 |
| CFB | 13 | 13 | 10 | 3 |
| UFC | 13 | 13 | 10 | 3 |

The unthemed run repetition instances are:
- **NFL**: 4 (2026-11-04, 2027-03-24); 5 (2026-11-18, 2027-04-07); 6 (2026-12-02, 2027-04-21)
- **CFB**: 4 (2026-10-31, 2027-03-20); 5 (2026-11-12, 2027-04-01); 6 (2026-11-28, 2027-04-17)
- **UFC**: 6 (2026-10-25, 2027-03-22); 7 (2026-11-06, 2027-04-03); 8 (2026-11-22, 2027-04-19)

**Reserve target, not achieved:** at least 15 independently verified ordinary NFL runs, 15 CFB runs, and 15 UFC runs (two-run reserve above ordinary demand); the currently available ten per league are insufficient.

## Initial 240-question dispositions
These labels record editorial triage, **not publication approval**. Every unverified candidate is held; flagged REWRITE candidates require source-backed replacement except six already changed on a future-only code path.
| League | HOLD | REWRITE | KEEP fully certified | RETIRE |
|---|---:|---:|---:|---:|
| NFL | 77 | 3 | 0 | 0 |
| CFB | 71 | 9 | 0 | 0 |
| UFC | 70 | 10 | 0 | 0 |

### Six independently supported future-only corrections
1. **NFL Run 1 Q6:** Stafford earned his first AP first-team All-Pro for 2025; the existing "never" premise is false. Rewrite to ask his first-selection year/season. NFL/AP primary [record](https://www.nfl.com/news/2025-all-pro-team-matthew-stafford-bijan-robinson-jaxon-smith-njigba-highlight-roster).
2. **CFB Run 10 Q1:** Indiana won the **2025 season** national title at the January 19, 2026 game. Clarify ambiguous championship-year phrasing. CFP [recap](https://collegefootballplayoff.com/sports/2026/1/27/NCG-recap).
3. **UFC Run 6 Q6:** Remove Andrade's surname from the clue; retain slam/second-round context, as recorded on UFC [fighter record](https://www.ufc.com/athlete/jessica-andrade).
4. **UFC Run 7 Q4:** Remove Pereira's surname from the clue; retain fifth-round stoppage and Madison Square Garden context, UFC [281 results](https://www.ufc.com/event/ufc-281).
5. **UFC Run 8 Q3:** Remove Serra's surname from the clue; retain Ultimate Fighter 4 and UFC 69 context, UFC [historical record](https://www.ufc.com/news/on-this-day-ufc-history-serra-shocks-world).
6. **UFC Run 10 Q7:** Remove Grasso's surname from the clue; retain fourth-round title-changing submission context, UFC [fighter record](https://www.ufc.com/athlete/valentina-shevchenko).

The fix applies only to future unpublished day identities (`day >= 2026-10-27`) and preserves old published setup evidence and results. Historical content remains unaltered.

### High-confidence intra-game semantic collisions requiring resolution
- **SEM-1**: `cfb-1-2` vs `cfb-3-4` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-2**: `cfb-3-5` vs `cfb-4-5` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-3**: `nfl-1-1` vs `nfl-10-1` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-4**: `ufc-3-3` vs `ufc-5-2` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-5**: `ufc-1-4` vs `ufc-8-2` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-6**: `ufc-4-4` vs `ufc-9-5` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-7**: `cfb-1-5` vs `cfb-2-5` (same or closely overlapping answer event/fact; full comparison required).
- **SEM-8**: `cfb-6-7` vs `cfb-7-8` (same or closely overlapping answer event/fact; full comparison required).

**Distinct-fact clarification:** UFC Run 1 Q6 and Run 5 Q6 both involve Dominick Cruz, but test two different championship bouts; UFC Run 8 Q3 and Q4 are different legs of the Serra–St-Pierre rivalry. They require *variety* review, not automatic semantic deduplication.

**UFC run-coherence defect:** Runs 7, 8 and 9 each revolve almost entirely around one named champion (Adesanya, GSP, Khabib). Rebuild each as a genuinely varied eight-question ladder rather than several consecutive prompts about the same career. Several other runs overuse title handoffs. NFL/CFB rely too heavily on MVPs, Heismans and championships. Q8 often defaults to arithmetic/comparison rather than memorable hard sports history.

**Cross-game audit remains open.** Bar Trivia, Average Fan and Sports Feud should be read from **current canonical active selection**, not raw retired archives, and mapped by fact identity. No "zero overlap" certification has been made. Repeated historic themes such as the Helmet Catch, Immaculate Reception, debut CFP champion, and UFC title upsets are first-pass collision candidates; confirm whether the other game's active question asks the *same fact*, not merely the same athlete.

## Required before merge as a six-month editorial release
- Independently source-check all surviving questions and all distractors, with review timestamps and decisive citations.
- Replace weak / false / ambiguous / excessively recycled questions; fill at least the above ordinary-run gaps plus a two-run reserve, keeping level difficulty and useful Q1–Q7 clues.
- Give every approved question a semantic fact key, cross-game active-content collision result, and evidence-backed signoff; record HOLD/RETIRE exclusions.
- Execute the **actual** Official Daily builder on every scheduled date (not merely the source-derived calendar calculation here), run the complete grading/lifeline/resume tests, and produce a machine-verifiable no-repeated-run certificate.
- Pass focused Millionaire regression tests, full Validate V2, and exact-head green CI. Then check Supabase and Cloudflare deployment and verify prior published results.

### Schedule-derived appearances (not executable gameplay certification)
| Day | League | Ordinal | Ordinary run | Override |
|---|---|---:|---:|---|
| 2026-10-25 | UFC | 5 | 6 | previously published |
| 2026-10-26 | NFL | 5 | — | existing Cowboys-themed board |
| 2026-10-31 | CFB | 6 | 4 |  |
| 2026-11-04 | NFL | 7 | 4 |  |
| 2026-11-06 | UFC | 6 | 7 |  |
| 2026-11-12 | CFB | 8 | 5 |  |
| 2026-11-18 | NFL | 9 | 5 |  |
| 2026-11-22 | UFC | 7 | 8 |  |
| 2026-11-28 | CFB | 10 | 6 |  |
| 2026-12-02 | NFL | 11 | 6 |  |
| 2026-12-04 | UFC | 8 | 9 |  |
| 2026-12-10 | CFB | 12 | 7 |  |
| 2026-12-16 | NFL | 13 | 7 |  |
| 2026-12-20 | UFC | 9 | 10 |  |
| 2026-12-26 | CFB | 14 | 8 |  |
| 2026-12-30 | NFL | 15 | 8 |  |
| 2027-01-05 | UFC | 10 | 1 |  |
| 2027-01-07 | CFB | 16 | 9 |  |
| 2027-01-13 | NFL | 17 | 9 |  |
| 2027-01-21 | UFC | 11 | 2 |  |
| 2027-01-23 | CFB | 18 | 10 |  |
| 2027-01-27 | NFL | 19 | 10 |  |
| 2027-02-02 | UFC | 12 | 3 |  |
| 2027-02-04 | CFB | 20 | 1 |  |
| 2027-02-10 | NFL | 21 | 1 |  |
| 2027-02-18 | UFC | 13 | 4 |  |
| 2027-02-20 | CFB | 22 | 2 |  |
| 2027-02-24 | NFL | 23 | 2 |  |
| 2027-03-04 | CFB | 24 | 3 |  |
| 2027-03-06 | UFC | 14 | 5 |  |
| 2027-03-10 | NFL | 25 | 3 |  |
| 2027-03-20 | CFB | 26 | 4 |  |
| 2027-03-22 | UFC | 15 | 6 |  |
| 2027-03-24 | NFL | 27 | 4 |  |
| 2027-04-01 | CFB | 28 | 5 |  |
| 2027-04-03 | UFC | 16 | 7 |  |
| 2027-04-07 | NFL | 29 | 5 |  |
| 2027-04-17 | CFB | 30 | 6 |  |
| 2027-04-19 | UFC | 17 | 8 |  |
| 2027-04-21 | NFL | 31 | 6 |  |
