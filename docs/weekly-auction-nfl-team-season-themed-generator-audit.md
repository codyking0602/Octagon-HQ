# Weekly Auction — NFL team-season themed board generator audit

## Scope

This calibrates the six normal auction days for **Best NFL Team-Seasons Since 2000** against the locked 200-team authority.

It is intentionally separate from the Day 7 Wildcard mechanics.

The generator is calibration-only on this branch. It does not change the live Weekly Auction runtime.

## Product rules

For the current five-player field:

- 6 normal auction days
- 4 team-seasons per day
- 24 normal cards per week
- exact team-season identity remains team + season year
- no team-season repeats within the same week
- season year remains part of every public card
- future themes remain server-owned and unrevealed
- theme eligibility does **not** force a hidden grade shape

The final point is deliberate. NFL does not inherit the CFB generator's Wide / Compressed / Top-Heavy / Trap shaping. A theme determines which team-seasons are eligible, then the board samples naturally from that eligible set.

## Theme catalog

The generator rotates through eight theme families:

| Family | Public examples | Eligibility |
| --- | --- | --- |
| Division Spotlight | AFC North Spotlight | one season from each of the division's four franchises |
| Season Spotlight | 2014 Season Spotlight | four distinct franchises from the same NFL season |
| Era Spotlight | 2000s Spotlight | four distinct franchises from the selected decade / era |
| Rivalry | Cowboys vs Eagles | two seasons from each rivalry franchise |
| Franchise History | Packers Through the Years | four seasons from one franchise |
| Great Teams That Fell Short | Great Teams That Fell Short | non-champions with either .750+ regular-season win rate, a conference-title-game appearance, or a Super Bowl appearance |
| Conference Clash | AFC vs NFC | two AFC and two NFC teams |
| Open Field | Open Field | unrestricted pool subject to weekly repetition guardrails |

Current rivalry catalog:

- Cowboys / Eagles
- Packers / Bears
- Ravens / Steelers
- Chiefs / Raiders
- Patriots / Jets
- 49ers / Rams
- Falcons / Saints
- Broncos / Chiefs
- Giants / Eagles
- Seahawks / 49ers
- Browns / Steelers
- Vikings / Packers

## Weekly theme selection

The schedule is not a fixed six-family checklist.

That matters because a fixed weekly mix would allow players to infer future theme families after enough days had been revealed.

Instead:

- the six theme definitions are generated server-side before the week;
- Division Spotlight and Open Field may each appear at most twice;
- every other family may appear at most once;
- the exact public theme label cannot repeat in the same week;
- the built days are shuffled after the restrictive themes have been satisfied;
- only the current day's public payload should be exposed to the client.

The public reveal helper intentionally strips hidden grade fields and does not return future days.

## Repetition guardrails

The generator builds the more restrictive themes first, then shuffles the visible day order.

Weekly limits:

- exact team-season: maximum 1
- ordinary franchise usage: maximum 3 cards/week
- featured Franchise History team: maximum 4 cards/week
- Division Spotlight: all four franchises must appear
- Rivalry: exactly two cards from each featured franchise
- Season Spotlight: four distinct franchises
- AFC vs NFC: exactly two teams from each conference

This allows intentional repetition when the theme calls for it without letting one franchise accidentally dominate an unrelated week.

## 30,000-week simulation

The locked 200-team pool generated:

- **30,000** simulated weeks
- **0** generation failures
- **0** invalid weeks
- **18,869** distinct family sequences
- **76** distinct public theme labels
- average card grade: **88.63**
- average within-day grade spread: **9.55**

Realized day-family share:

| Family | Share of normal days |
| --- | ---: |
| Division Spotlight | 18.9% |
| Open Field | 13.5% |
| Season Spotlight | 12.0% |
| Rivalry | 11.9% |
| Conference Clash | 11.4% |
| Great Teams That Fell Short | 11.4% |
| Era Spotlight | 11.3% |
| Franchise History | 9.6% |

Natural grade mix across generated normal cards:

| Hidden grade | Share |
| --- | ---: |
| below 85 | 22.5% |
| 85–89.5 | 34.8% |
| 90–94.5 | 32.8% |
| 95+ | 9.9% |

No grade-band quota produces those percentages. They are the result of theme eligibility plus the locked 200-team population.

## Synthetic sample weeks

These are calibration seeds, not production schedules.

### Sample A

1. AFC South Spotlight
2. AFC vs NFC
3. Cowboys vs Eagles
4. 2009 Season Spotlight
5. Great Teams That Fell Short
6. Chargers Through the Years

### Sample B

1. Panthers Through the Years
2. Great Teams That Fell Short
3. 2020s Spotlight
4. AFC vs NFC
5. AFC North Spotlight
6. 2011 Season Spotlight

### Sample C

1. Great Teams That Fell Short
2. 2000s Spotlight
3. Browns vs Steelers
4. Open Field
5. AFC vs NFC
6. 2014 Season Spotlight

The examples demonstrate the intended rhythm: the week feels themed without revealing a predictable future schedule, and the themes do not imply a predetermined hidden grade pattern.

## Implementation boundary

This PR supplies:

- the themed-board generator;
- the public one-day reveal contract;
- regression tests;
- the 30,000-week calibration artifact.

It does **not** wire the subject into the live Weekly Auction runtime, alter current CFB Superteam behavior, or change Day 7 Wildcard rules.
