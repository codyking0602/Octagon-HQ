# Stage 3 — UFC Blind Resume actual player misses and difficulty calibration

**Checked:** October 17, 2026. **Source:** read-only aggregates from the connected Octagon HQ production Supabase project's `private.daily_challenge_attempts`, `private.daily_challenges`, `private.daily_challenge_setups`. **Stage 3 remains open.** This is an editorial measurement, **not** a gameplay release, new difficulty/scoring policy, or signoff.

## What real players are getting wrong

**UFC Blind Resume V3 (August 18–October 16, 2026):** 29 completed Daily attempts, five distinct players, 145 scored comparison picks, **53 wrong (36.6%)**. The five players contributed 11, 8, 5, 3 and 2 games respectively, so 145 choices are **not** 145 independent participants. Repeated choices and nonrandom reveal decisions limit statistical generalization.

### UFC reveals at the moment players locked

| Visible stats | Picks | Wrong | Wrong rate |
| --- | ---: | ---: | ---: |
| 2 / 8 | 58 | 25 | **43.1%** |
| 4 / 8 | 33 | 11 | **33.3%** |
| 6 / 8 | 28 | 7 | **25.0%** |
| 8 / 8 | 26 | 10 | **38.5%** |

Ten losses after eight revealed stats is a **priority qualitative-review signal**, not proof that revealing more causes more mistakes: late-reveal players and pairings are selected, not randomized. Some contestants held until full reveal and still selected the non-model winner.

### UFC published difficulty labels vs actual results

| Current label | Picks | Wrong | Wrong rate | Wrong even at full reveal |
| --- | ---: | ---: | ---: | ---: |
| Readable | 29 | 0 | **0.0%** | 0 / 5 |
| Tight | 29 | 11 | **37.9%** | 2 / 4 |
| Nightmare | 29 | 12 | **41.4%** | 1 / 5 |
| Competitive | 58 | 30 | **51.7%** | 7 / 12 |

This reverses the intended intuitive order for `competitive` vs `nightmare`. Code inspection explains the gap: `blindResumeDifficultyMap` gives mandatory relative labels based solely on each five-round card's *ranking-model score gaps*. It does **not** measure player-facing reveal difficulty. The 0/29 readable record also signals a possibly overly predictable easy lane, though sample size is limited. Do not redefine labels based on these rates alone without editorial evidence.

## Actual published pairs to review first

These numbers came from the **persisted official Daily setup and completed decisions**, not hypothetical local simulation.

1. **Oct 3: Tito Ortiz (A) vs Justin Gaethje (B).** Winner recorded: Gaethje, `competitive`, **4/4 picks wrong** (all selected Ortiz, all at 2 stats). First two visible clues: **UFC title-fight wins Ortiz 6 vs Gaethje 3; prime UFC record 11–3 vs 7–3**. Both directly favored the player the grading rejects. Later facts include top-five wins 4 vs 6 and model-derived Apex 84 vs 91, but none were visible to those four players. **Status: HOLD** until independent accuracy/verdict adjudication and opening-clue fairness check; do not silently change historic results.
2. **Sep 22: Matt Hughes (A) vs Alexander Volkanovski (B).** Winner recorded: Volkanovski, `competitive`, **5/5 wrong** (Hughes picked every time, including reveals at 2/4/6). Opening stats: **prime record Hughes 13–3 vs Volkanovski 9–3; finish rate 72.2% vs 33.3%**. Even later published evidence favors Hughes in title-fight wins (9–8), top-five wins (9–8), and audited rounds won (80% vs 75%). Model-derived Apex (86 vs 94) favors Volkanovski; this makes the final grade/description especially important to review. **Status: HOLD**; highest-priority rubric/evidence mismatch.
3. **Sep 14: Brock Lesnar vs Shogun Rua.** Winner recorded: Rua, `competitive`, **3/3 wrong**, including a player who revealed all 8. Lesnar led in several displayed items, including title-fight wins (3–1); check whether selected UFC-only prime facts misrepresent both careers, and whether the ranking winner is a fair matchup question. **Status: HOLD**.
4. **Sep 11: Conor McGregor vs Petr Yan.** Winner recorded: Yan, `nightmare`, **3/4 wrong**. Published first two: prime record **6–2 vs 6–4** and eras Superstar vs Apex; four-step evidence later shows a dramatic model-derived Apex gap **98 vs 85** favoring McGregor even though the winner is Yan. **Status: HOLD** pending full comparison criterion review.
5. **Oct 16: Jessica Andrade vs Ronda Rousey.** Winner recorded: Rousey, `tight`, **2/2 wrong** at 2 facts; published opening `Main UFC era` and `Top-5 wins` (Andrade 7 vs Rousey 4) arguably point away from the hidden winner. **Status: REVIEW**, smaller sample.

These are candidate holds for **future** publication; no currently published answer or achievement is changed by this audit. Wrong-answer frequency is evidence of player confusion, not independent proof that a historical verdict is wrong. Full independent source checks and calibration against the game's declared ranking rubric remain necessary.

## Stage 3 acceptance standard and decisions not yet authorized

- Review the matchup **as played**: opening two clues, four/six/full reveal, visibility, fighter recognizability, grade/verdict and alternative plausible answers.
- Assess when people miss because clues point the wrong way; a sufficiently delayed strong clue must make the answer defensible. Prefer *holding/retiring future ambiguous pairs* to padding a large playable pool. No quota to preserve.
- Separately measure **actual** misconception rate by difficulty label, reveal position, model score gap, fighter and pair, and across repeating days; avoid presenting a model score gap as empirical difficulty.
- Consider an explicit evidence-consistency gate on dynamically generated UFC pairs and a difficulty mix calibrated against independent selected-board human review; **no new target wrong-answer percentage has been owner-approved**.
- Preserve historical published setups, submissions, normalized scores, leaderboards and streaks. Gameplay/scoring changes would require separate review.
- After substantive editorial fixes, rerun production-equivalent deterministic future Daily boards and inspect rendered ladders; mark Stage 3 complete only with documented case-level dispositions and green exact-head CI.

## Reproducible read-only SQL (no identity output)

The following are simplified forms of the queries used to compute the aggregates; they intentionally emit no profile identifiers.

```sql
WITH picks AS (
 SELECT a.content_version, a.id AS attempt_id, a.profile_id,
        (r.answer->>'correct')::boolean AS correct,
        (r.answer->>'revealed_count')::int AS revealed_count,
        (s.private_setup_evidence->'rounds'->(r.ordinality::int - 1))->>'difficulty' AS difficulty
 FROM private.daily_challenge_attempts a
 JOIN private.daily_challenges c ON c.id=a.daily_challenge_id
 JOIN private.daily_challenge_setups s ON s.id=c.setup_id
 CROSS JOIN LATERAL jsonb_array_elements(a.public_result->'answers')
   WITH ORDINALITY AS r(answer, ordinality)
 WHERE c.game_type='blind_resume' AND a.content_version='blind-resume-v3'
)
SELECT difficulty, count(*) picks,
       count(*) FILTER (WHERE NOT correct) wrong_picks,
       round(100.0*count(*) FILTER (WHERE NOT correct)/nullif(count(*),0),1) wrong_pct
FROM picks GROUP BY difficulty ORDER BY difficulty;
```
