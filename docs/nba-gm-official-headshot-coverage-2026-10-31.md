# NBA GM — official headshot identity recovery (October 31, 2026)

**Scope:** PRIVATE NBA GM visual presentation only. No player talent, salary, team, contract, development, or persisted-run mutation.

## Full 330-player coverage

- Existing, explicitly stored `official_nba_player_id` values in private catalog: **232 / 330**.
- Previously missing: **98 / 330**.
- **88** recover exact numeric NBA player IDs from the pinned, previously researched `docs/nba-gm-2025-26-nba-api-301-player-stat-evidence-2026-10-29.json` source, matched by the audited editorial player identity.
- **10** additional IDs were verified against individual NBA.com player-profile pages:

| NBA GM identity | NBA player ID | Official evidence |
| --- | --- | --- |
| Kyrie Irving | 202681 | https://www.nba.com/player/202681/kyrie-irving |
| Cameron Boozer | 1643409 | https://www.nba.com/player/1643409/cameron-boozer |
| Bruce Thornton | 1643570 | https://www.nba.com/player/1643570/bruce-thornton |
| Baba Miller | 1642394 | https://www.nba.com/player/1642394/baba-miller |
| Meleek Thomas | 1643509 | https://www.nba.com/player/1643509 |
| Brayden Burries | 1643415 | https://www.nba.com/player/1643415/brayden-burries/profile |
| Nate Ament | 1643417 | https://www.nba.com/player/1643417 |
| Allen Graves | 1643512 | https://www.nba.com/player/1643512/allen-graves |
| Keaton Wagler | 1643413 | https://www.nba.com/player/1643413 |
| Darius Acuff Jr. | 1643411 | https://www.nba.com/player/1643411/darius-acuff-jr |

The overlay in `src/features/nba/nbaGmOfficialHeadshots.ts` uses **editorial player IDs** (not current NBA team affiliation), preserving identity through team moves. The game's existing 232 IDs take precedence. Automated coverage asserts exactly 330 unique, numeric player IDs across all 30 teams. The existing NBA CDN image URL is still subject to loading; any genuine CDN failure displays the team-mark fallback rather than a fabricated portrait.

## Visual parity

- Reuse Football GM's compact roster, position-first team picker and cap-meter structure.
- Keep all six basketball-specific letter-grade skills visible.
- Fix landscape NBA headshot stretching and crop with fixed-size, contain-fit portraits.
- Never layer team abbreviations under transparent team SVGs; show initials only if the logo fails.

**Release:** Draft PR only, separate from Priority 2 scouting/repricing, until exact-head CI, responsive/mobile visual verification and coordinated integration pass.
