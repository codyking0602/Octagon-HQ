# The HQ Football Matchup Breakdowns

This document is the canonical editorial and product style guide for featured Football matchup breakdowns in The HQ.

Use it for both college football and NFL featured Games of the Week. The runtime content owner is `src/features/picks/footballMatchupBreakdowns.ts`; the presentation owner is `src/features/picks/FootballMatchupBreakdowns.tsx`, surfaced by the canonical Football Picks page.

## Product intent

A Matchup Breakdown should feel like a concise 2K-style scouting report, not a long article, stat dump, or generic AI preview.

The goal is to answer, quickly:

- What is the real story of this game?
- Which three matchups will decide it?
- How does each team actually win?
- Which players matter specifically in this matchup?
- Which offense has the edge against the defense it will actually face?
- What is The HQ's final read?

## Locked structure

Every authored breakdown uses this order:

1. **The Setup**
2. **3 Matchups That Decide It**
3. **How Each Team Wins**
4. **Players to Watch**
5. **The HQ Edge**
6. **Optional Watch links**
7. **The HQ Read + prediction**

Keep the page substantial enough to reward opening it, but short enough to read comfortably on a phone.

## The Setup

Use roughly two short paragraphs.

Establish the stakes, relevant continuity from the prior season, major coaching/system changes, quarterback changes, and the central stylistic conflict. Do not waste space on basic program history unless it directly matters to the game.

## 3 Matchups That Decide It

Exactly three matchup battles.

Each battle should include:

- a specific football conflict, such as an offensive line against a pressure package, a receiver group against opposing corners, or a run game against a front;
- concise reasoning with a few meaningful facts or stats when useful;
- one clear **Advantage** conclusion.

Avoid generic categories that are not actually facing each other.

## How Each Team Wins

Give each team one concise game-plan paragraph.

This should describe the realistic path to victory, not restate the three matchup sections. Focus on game state, down-and-distance, explosive plays, pressure, pace, turnovers, coverage, protection, or other matchup-specific levers.

## Players to Watch

Default to three players per team.

Do not write biographies. Explain why each player matters in this specific game.

## The HQ Edge — locked rule

The HQ Edge contains exactly two unit comparisons:

1. **Team A offense vs. Team B defense**
2. **Team B offense vs. Team A defense**

Do not add independent QB, run game, pass catchers, offensive line, front seven, secondary, coaching, or other category edges.

The point is to compare the units that actually face one another.

## The HQ Read

End with a direct opinion.

State the decisive matchup or condition, explain why The HQ leans one way, and finish with a projected score. Avoid fake certainty; if the matchup is close, say why it is close.

## Research standard

Build each preview from fresh research at the time it is authored. The preferred workflow is to synthesize multiple current sources rather than copying one site's preview.

Useful source types include:

- official team game notes, rosters, injury/status updates, and press conferences;
- current play-by-play/advanced-stat sources;
- opponent-adjusted team metrics;
- credible player/position grading or matchup analysis;
- current reporting for depth-chart, injury, coordinator, and scheme changes.

For college football, CollegeFootballData, SP+, PFF, official team sources, and current reporting are useful inputs. For NFL, nflverse/nflfastR, SumerSports, PFF, official NFL/team sources, and current reporting are useful inputs.

The finished copy must be original The HQ synthesis rather than reproduced source copy.

## Optional YouTube links

Video is bonus content, not a required part of the editorial formula and does not have to correspond to a specific written section.

A matchup may have zero or more Watch links. Good options include:

- a game preview;
- team highlights or hype video;
- player highlights;
- a prior matchup;
- an analyst breakdown;
- a press conference;
- any other worthwhile football video.

Use the existing Picks `PickWatchMoment` shape: `title + url`. Prefer YouTube URLs. If there are no links, the Watch section must not render.

Do not force video into every matchup.

## Runtime ownership

- Content/data: `src/features/picks/footballMatchupBreakdowns.ts`
- Sheet UI: `src/features/picks/FootballMatchupBreakdowns.tsx`
- Surface owner: `src/features/picks/FootballPicksPage.tsx`
- Styling: `src/styles/football-matchup-breakdowns.css`, loaded through the canonical global style chain in `src/main.tsx`

The Football Picks page discovers authored breakdowns by the teams already present in the current slate. Do not hard-code weekly event IDs or create a second event-fetch path.

When a slate has multiple authored featured matchups, one Matchup Breakdowns entry opens the sheet and the sheet provides matchup tabs.

## Current authored examples

The initial canonical examples are:

- LSU vs. Clemson — 2026
- Louisville vs. Ole Miss — 2026

Use their density and tone as the baseline for future college and NFL previews.
