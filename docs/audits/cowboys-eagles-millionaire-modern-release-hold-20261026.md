# Cowboys–Eagles Millionaire — modern revision (RELEASE HOLD)

**Status: DRAFT / HOLD — not approved for release.** Editorial feedback on the published **October 26, 2026 Football Daily NFL Millionaire** edition: Q1–Q4 played well, but Q5–Q8 became pre-1980s historical specialist trivia. The new candidate deliberately keeps the first four questions identical and moves the second half into recognizable **2016–2023** Cowboys seasons and memorable NFL moments.

## Boundary and release control

- The canonical October 26 game, source bank, private proof, results, standings, published player sessions and scheduled game are **untouched**.
- The replacement pack resides **only** in `footballCowboysEaglesMillionaireHeldCandidate.ts`, which is **not imported** into the canonical Daily builder, runtime, publish path or schedule.
- This is a distinct isolated draft PR, not a change to the simultaneous six-month Millionaire draft PR #2139.
- **Do not merge or deploy.** A later owner-approved release must assign a future publication date and new content/version identity; review content overlaps and run the exact-head CI and canonical eight-question replay before wiring the pack into routing. **Never rewrite a previously published board** or reset historical attempts.
- This hold is a code/release hold, **not a claim that today's already-published Daily game was disabled in production**.

## Proposed eight-question player ladder

| Position | Topic | Answer | Editorial reason |
| --- | --- | --- | --- |
| Q1 | Cowboys home stadium | AT&T Stadium | Preserve published question unchanged |
| Q2 | NFL rushing leader | Emmitt Smith | Preserve published question unchanged |
| Q3 | Undrafted QB signed in 2003 | Tony Romo | Preserve published question unchanged |
| Q4 | Cowboys' early-1990s championship coach | Jimmy Johnson | Preserve published question unchanged |
| Q5 | NFL interception leader in 2021 | Trevon Diggs | Recognizable recent standout defensive season |
| Q6 | AP Offensive Rookie of the Year, 2016 | Dak Prescott | Famous Cowboys rookie quarterback story; Elliott as a fair rival |
| Q7 | Four extra-point misses in January 2023 wild-card win | Brett Maher | High-profile recent playoff moment rather than historical awards minutiae |
| Q8 | Three touchdowns and December 2018 OT winner **vs. Eagles** | Amari Cooper | Direct rivalry finish and memorable game-winning play |

Q1–Q4 remain exactly the published pack. The final Q8 retains the no-lifelines rule and no Stat Sheet. Four answer choices, valid answer mappings and 50/50 data are tested for every question.

## Fact sources checked

- Trevon Diggs' 11 interceptions in 2021: Dallas Cowboys official retrospective, https://www.dallascowboys.com/news/a-timeline-of-trevon-diggs-six-year-career-with-the-cowboys
- Dak Prescott's 2016 AP Offensive Rookie of the Year over Ezekiel Elliott: Dallas Cowboys announcement, https://www.dallascowboys.com/news/more-honors-dak-prescott-named-nfl-offensive-rookie-of-the-year-427331
- Brett Maher's four missed extra points in the January 2023 Tampa Bay playoff win: Dallas Cowboys recap, https://www.dallascowboys.com/news/maher-on-missed-xps-time-for-me-to-do-my-part
- Amari Cooper's three touchdowns, including overtime winner, on December 9, 2018 against Philadelphia: Philadelphia Eagles official recap, https://www.philadelphiaeagles.com/news/eagles-lose-heartbreaker-to-cowboys-29-23-in-overtime

## Outstanding before release

- Owner signoff on Q5–Q8 experiential difficulty and Q8 payoff.
- Cross-game overlap review against currently active NFL Bar Trivia, Sports Feud, Average Fan and other Daily questions, including upcoming Cowboys-themed games.
- Confirm a **future** Cowboys–Eagles thematic slot is appropriate; no automatic replacement of the existing Daily rotation or reuse of an earlier game's date.
- Exact PR head green checks plus canonical publication, private-grading and result regression tests; then a separately approved integration PR.

**Recommendation: Hold until the next appropriate rivalry edition.**
