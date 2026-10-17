# Average Fan Stage 2AA — historical NFL franchise-name grading

Date: October 16, 2026. Parent main: `5c414d6762717c47af2f0bf3a2ab24377451fb0f`. Audit concerns **future generated NFL player/team short answers**, not historical published Daily snapshots.

## Independently sourced naming issue

The player-career registry represents each NFL franchise by its *current code/name*. For `average-fan:nfl:g3:<player>:team` questions, a player who played for Washington, Tennessee, Las Vegas/Oakland, Los Angeles/St. Louis, etc. could have an accurate historic-team response marked incorrect because only the modern label and optional nickname/city were accepted. That is unfair grading, not real quiz difficulty.

**Fix:** Derive accepted aliases only for the *same continuous historical franchise codes* on that player's canonical career list. Current canonical display answer remains unchanged, but former city/nickname combinations are accepted: Cardinals (St. Louis, Phoenix), Colts (Baltimore), Chargers (San Diego), Rams (St. Louis), Raiders (Oakland, Los Angeles), Patriots (Boston), Oilers/Titans (Houston and Tennessee Oilers), and Washington Football Team/Redskins/Commanders. Distinct Houston Texans vs Oilers, Baltimore Ravens vs Colts, and Cleveland Browns vs Ravens histories must NEVER be conflated.

Primary sources:
- [NFL: Rams relocated from St. Louis to Los Angeles](https://www.nfl.com/news/rams-to-relocate-to-l-a-chargers-first-option-to-join-0ap3000000621645)
- [NFL: 2022 Washington Commanders rename](https://www.nfl.com/news/washington-commanders-new-team-name)
- [NFL: Houston Oilers became Tennessee Titans, separate from Texans](https://www.nfl.com/news/houston-texans-owner-bob-mcnair-dies-at-age-81-0ap3000000991639)
- [NFL: Colts relocated from Baltimore to Indianapolis](https://www.nfl.com/news/no-more-naptown-super-bowl-boosts-indy-s-image-09000d5d826a35bc)

## Regression

- Fixture answers for all nine representative old-name/team pairs match via the actual Average Fan short-answer grader.
- Explicit negative checks prevent Oilers/Texans, Baltimore Colts/Ravens, and Browns/Ravens identity contamination.
- Every selected generated NFL player/team question is traced to the canonical player career, then all corresponding historic franchise names must grade correct.
- Existing nicknames, unique present-day city aliases, duplicate fact screens, bank caps, cross-game overlap, correctness validation and full scheduled simulations remain covered by the main suite.

No score changes to the previously published Daily questions, no result-history migration or new question-filler. Stage 2 cannot be marked closed solely on this repair: exact-head tests, production verification, revised selected-board editorial and remaining primary-source signoff still apply.
