# NBA GM — approved concept and isolated foundation (October 29, 2026)

Status: **Development only. No public NBA GM, no production migrations, no route, no published roster, no salary-budget decision.**

## Owner-approved product direction

- One NBA GM game in the existing Octagon HQ product language, not an NFL skinned clone.
- Wheel draws from **30 current NBA franchises**, with the server owning each result and permitted roster selection.
- **Seven distinct roster slots:** PG, SG, SF, PF, C, Sixth Man, FLEX. Starting-position eligibility is player-specific; Sixth Man/FLEX accept appropriately rostered basketball players without creating fake positional eligibility.
- **Three-season franchise:** build the roster, manage salary, play Year 1, handle offseason trades/retention/free agency and development, then play Years 2 and 3.
- **82 regular-season games** per simulated year, followed by a basketball-appropriate postseason. League strength, opponents, playoff qualification, and series results require basketball-specific calibration.
- Real **2026–27 roster and compensation evidence** for the initial population, not inferred contracts or made-up ratings. Future-year game salaries must be clearly distinguished from actual guaranteed commitments.
- Basketball decisions should reward role balance (creation, playmaking, spacing, perimeter and interior defense, rebounding), but chemistry must not arbitrarily outweigh elite ability.
- Eventual **Weekly** competitive layer plus unlimited Casual. Do not attach to NBA Daily or rewrite another sport's Weekly schedule.
- Owner-only interactive playtest before any public release.

## Implementation reuse: inspect before every integration

Current main as inspected on October 29: the short Football GM has a seven-slot roster, team wheel, per-player salary windows, development profiles, trades/free agency, Year-1 and Years-2/3 simulation, a game-result experience and an established two-player challenge RPC. NFL GM Long is a distinct nine-slot mode and must not be mistaken for the shared canonical short-mode lifecycle.

Use the following existing components as design and integration references:

- src/features/back-room/footballGmEngine.ts — roster selection, cap and wheel semantics.
- src/features/back-room/footballGmStrategy.ts — multi-year payroll and franchise decisions.
- src/features/back-room/footballGmScouting.ts and wheelFootballGmEconomy.ts — player-specific outlook and salary displays, not NBA data owners.
- src/features/back-room/FootballGmModePage.tsx and FootballGmFinalExperience.tsx — proven compact interaction and result patterns.
- src/features/play/footballGmMatchRepository.ts — established multiplayer lifecycle and server ownership; NBA must get sport-appropriate validated persistence, not a duplicate generic challenge engine.

Keep the authoritative game identity and server validation distinct by sport. Do **not** alter NFL ratings, contracts, development profiles, saves, migrations or public match results.

## First isolated development slice

src/features/nba/nbaGmFoundation.ts contains only pure, unshipped model contracts and validation. Its companion tests use **synthetic fixture identities**, not real or research-approved NBA data. It defines:

- 30 canonical teams; the seven roster slots; six basketball skill dimensions; a three-year horizon.
- Proposed **$185M / $192.5M / $200M** budget **simulation scenarios**, not a selected game cap or the official NBA salary cap.
- Player data schema for stable identity, audited grade, position eligibility, three game salary values, player-level ability grades and explicit source links.
- Catalog source/quality rejection, duplicate/slot safety, all-three-year salary checks, team-scoped preview eligibility and raw trait summaries. Raw traits are **not** chemistry or final-result scores.

This slice must remain unreferenced by public routes while research and grading are incomplete.

## Research requirements before a playable build

1. Assemble approximately **300–360 current NBA players**, across all 30 teams and across stars, starters, rookies, rotation players, specialists, and affordable depth. Require stable identity IDs and manually reconcile trades, two-way/departed-player status and 2026–27 affiliation.
2. Verify contract sources by player and season. Separate guaranteed salary, team/player options, incentives, rookie-scale years, and projected Year-2/Year-3 **game** costs. Review salary budget scenarios with automated roster-building simulations; never pretend the NBA has one simplistic cap rule.
3. Audit current basketball ability and six traits against multiple sources: official NBA stats and verified performance data, play-type/role context, credible scouting evidence and peer comparisons. Distinguish demonstrated skill from reputation, popularity or a single volatile week. Audit scale distribution and lower-tier players as carefully as stars.
4. Make development chances individually meaningful. Elite veterans generally stable; prospects have informed upside and risk; older players face age-related decline without arbitrary collapse. Record rationale and confidence.
5. Before committing public scoring, use simulated rotation pools to compare stars-and-scrubs, balanced two-way teams, stacked offensive lineups, young/upside squads and salary-efficient specialists. Require the grading to produce sensible playoff results without overwhelming raw talent with chemistry. Validate budget completion, affordability and the 30-team wheel.
6. Implement one owner-only, server-safe vertical slice by adapting the **existing** GM lifecycle and presentation. Keep actual production game routes untouched. Then develop seasons, postseasons, offseason strategy, persistence, challenges, and Weekly publication in separate focused PRs with exact-head verification.

## Launch gates

- No synthetic player ratings, invented contracts, unaudited NBA development odds or stub opponents in public gameplay.
- No unreviewed fallback that silently replaces missing player data.
- All wheel outcomes, contract commitments, development outcomes, trades, progression, and H2H resolution must be server-validated and stable after reload.
- Mobile first: no truncated names, teams, salaries, seasons or decisive roster information.
- Exact PR head green, backend migration tests when applicable, explicit owner approval for game go-live, then verify production. **This foundation PR does not authorize any deployment.**
