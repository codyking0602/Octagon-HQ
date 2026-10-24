# NBA Weekly Spotlights — Approved Editorial Standard

## Publication

The NBA HQ Player Spotlight and Team of the Week are autonomous weekly features.
Use verified **completed Monday–Sunday Central Time** results; publish each Tuesday
at 5 AM CT, retrying Wednesday–Friday if source verification or exact-head CI
cannot complete. Keep the last verified package active; do not fabricate a winner
or claim a run succeeded without green checks and verified deployment.

The first owner-approved, *interim* opening-week pair is Tyrese Maxey
(Philadelphia 76ers) and the Atlanta Hawks, based on the games completed through
October 23, 2026. The spotlight video specifically approved by the owner is
`https://www.youtube.com/watch?v=e8g1Fa8iYYM`. Replace the interim package
on the first verified weekly publication on Tuesday, October 27, 2026.

## Player Spotlight criteria

Choose from players with at least two completed games and verifiable box-score
production. Use these approximate editorial weightings in the canonical generator:

- Statistical production: **40%**, with position-aware points, assists and rebounds
- Shooting efficiency: **20%**, with shot volume to avoid misleading percentages
- Team success: **20%**
- Defensive contribution: **20%**, using steals and blocks with position awareness

Spotlight cards contain identity, verified numbers and a player-highlight link only. **No written summaries, ever.**
Reduce casual consecutive-week repetition without vetoing an exceptional repeat.

**Player video policy:** Only link a directly matched video from the official
[YouTube @NBA channel](https://www.youtube.com/@NBA), channel ID
`UCWJ2lWNubArHWmf3FIHbfcQ`. No ESPN, team, or fan channels. Prefer focused
1–5-minute player performance clips, allow clips of 25–480 seconds if needed,
and avoid full-game highlights, extended cuts, interviews, or press conferences.
RSS provides no duration, so verified durations from the YouTube Data API
take precedence when available. Never invent a video ID or misleadingly label
the general channel a specific verified highlight.

## Team of the Week criteria

Require at least two completed games. Score principally by winning record,
then average scoring margin, points allowed, and opponent strength. The
current automated team model weights these **45% / 25% / 15% / 15%**.
The Team card uses a logo, weekly record and weekly statistics only. No summary,
no highlight video and no chevron. The entire card links to that team's current
season on **Basketball Reference** (Sports Reference): the URL's year is the
NBA season **ending** year (2026–27 => `/teams/ATL/2027.html`).

## Integrity and release

Use actual ESPN completed results and player lines; do not invent statistics,
profile links, or videos. Match video player name and publication window,
require channel identity, and archive each weekly result. Submit autonomous
updates as PRs and merge only on green exact-head CI with unchanged main,
then verify production deployment.
