# NFL / CFB / UFC Bar Trivia — October 22, 2026 current-event refresh

**Draft only — do not merge before owner review.**

The active question supply on October 22 was NFL 1 / CFB 2 / UFC 4, despite a target of two live current-event slots per ten-question run. This PR adds seven independently sourced recent-event questions rather than padding to a quota:

| League | Story | Question identity | Official primary evidence |
| --- | --- | --- | --- |
| NFL | Previously winless Tennessee upset Indianapolis in Week 6 | `nfl-current-2026-w6-titans-colts-upset` | NFL.com Week 6 Sunday aftermath |
| NFL | Chiefs RB Kenneth Walker III drew MVP attention entering Week 7 | `nfl-current-2026-w7-walker-mvp-buzz` | NFL.com Week 7 MVP tracker, Oct 20 |
| CFB | Auburn's Oct 17 walk-off 27–24 upset of No. 1 Georgia | `cfb-current-2026-w7-auburn-georgia-upset` | NCAA.com Oct 17 Auburn recap |
| CFB | Florida beat No. 7 Texas 27–24 on Oct 17 | `cfb-current-2026-w7-florida-texas-upset` | NCAA.com Week 7 verified score |
| UFC | Mike Malott KO'd Joaquin Buckley with a knee at UFC Edmonton | `ufc-current-2026-10-17-malott-buckley` | UFC official event result / Scorecard |
| UFC | Jasmine Jasudavicius defeated Erin Blanchfield | `ufc-current-2026-10-17-jasudavicius-blanchfield` | UFC official event result |
| UFC | Brendan Allen submitted Christian Leroy Duncan in Round 5 | `ufc-current-2026-10-10-allen-duncan` | UFC Fight Night official result |

All authored dates are historical and were verified as of October 22. **No future UFC 333 results** are predicted or written. Each question has four answer choices, source URL, verification date, an inclusive eligibility window, and November 12 expiration.

This expands the October 22 eligible pool before #2028's retirements to NFL 3 / CFB 4 / UFC 7, and **after #2028's two UFC older-news retirements** to NFL 3 / CFB 4 / UFC 5. It does not solve future continuous editorial refresh by itself; it is not a live news API. The source-backed editorial pipeline should keep generating new candidate packages, with independent fact checking and cross-game semantic screening rather than blindly recycling evergreen material.

No gameplay/scoring changes or historical private setup backfills. This PR is independent of #2028 (curation) and #2030 (anti-repeat). Review all three together before merge.
